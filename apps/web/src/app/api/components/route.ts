/**
 * Components API - List and Create
 * GET /api/components?project_id=[id] - List components for a project
 * POST /api/components - Create new component
 */

import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import {
  successResponse,
  createdResponse,
  errorResponse,
} from '@/lib/api/response';
import {
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
} from '@/lib/api/errors';
import {
  createComponentSchema,
  componentQuerySchema,
} from '@/lib/api/validation/components';
import {
  uploadToStorage,
  generateComponentStoragePath,
  validateFileSize,
  STORAGE_BUCKETS,
  STORAGE_LIMITS,
} from '@/lib/api/storage';

/**
 * GET /api/components?project_id=[id]
 * List components for a project
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const { allowed, remaining, resetAt } = await checkRateLimit(
      request,
      120,
      60 * 1000
    );

    if (!allowed) {
      const response = errorResponse('Rate limit exceeded', 429);
      setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
      return response;
    }

    // Authentication
    const { user } = await verifySession();

    // Validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validated = componentQuerySchema.parse(queryParams);

    // Get project and verify access
    const supabase = await createClient();
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id, is_public')
      .eq('id', validated.project_id)
      .single();

    if (projectError || !project) {
      return errorResponse('Project not found', 404);
    }

    // Check access: owner or public project
    if (project.user_id !== user.id && !project.is_public) {
      throw new ForbiddenError('You do not have access to this project');
    }

    // Fetch components
    const { data: components, error: componentsError } = await supabase
      .from('components')
      .select('*')
      .eq('project_id', validated.project_id)
      .order('created_at', { ascending: false });

    if (componentsError) {
      console.error('Failed to fetch components:', componentsError);
      return errorResponse('Failed to fetch components', 500);
    }

    const response = successResponse({ components: components || [] });
    setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
    return response;
  } catch (error) {
    if (
      error instanceof UnauthorizedError ||
      error instanceof ForbiddenError ||
      error instanceof ValidationError
    ) {
      return errorResponse(error.message, error.statusCode);
    }

    console.error('GET /api/components error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/components
 * Create new component with code storage
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { allowed, remaining, resetAt } = await checkRateLimit(
      request,
      120,
      60 * 1000
    );

    if (!allowed) {
      const response = errorResponse('Rate limit exceeded', 429);
      setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
      return response;
    }

    // Authentication
    const { user } = await verifySession();

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new ValidationError('Invalid JSON in request body');
    }

    const parseResult = createComponentSchema.safeParse(body);

    if (!parseResult.success) {
      throw new ValidationError('Invalid component data', parseResult.error.flatten());
    }

    const validated = parseResult.data;

    // Verify project ownership
    const supabase = await createClient();
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id, framework')
      .eq('id', validated.project_id)
      .single();

    if (projectError || !project) {
      return errorResponse('Project not found', 404);
    }

    if (project.user_id !== user.id) {
      throw new ForbiddenError('You do not own this project');
    }

    // Validate framework compatibility
    if (validated.framework !== project.framework) {
      throw new ValidationError(
        'Component framework must match project framework'
      );
    }

    // Validate code content size
    if (!validateFileSize(validated.code_content, STORAGE_LIMITS.CODE_FILE)) {
      throw new ValidationError(
        `Code content exceeds maximum size of ${STORAGE_LIMITS.CODE_FILE / 1024 / 1024}MB`
      );
    }

    // Create component record (without code_content)
    const { code_content, ...componentData } = validated;

    const { data: componentData_result, error: componentError } = await supabase
      .from('components')
      .insert({
        ...componentData,
        user_id: user.id,
      })
      .select()
      .single();

    if (componentError || !componentData_result) {
      console.error('Failed to create component:', componentError);
      return errorResponse('Failed to create component', 500);
    }

    let component = componentData_result;

    // Upload code to storage
    try {
      const storagePath = generateComponentStoragePath(
        validated.project_id,
        component.id,
        validated.framework
      );

      await uploadToStorage(
        STORAGE_BUCKETS.PROJECT_FILES,
        storagePath,
        code_content,
        'text/plain'
      );

      // Update component with storage path
      const { error: updateError } = await supabase
        .from('components')
        .update({ code_storage_path: storagePath })
        .eq('id', component.id);

      if (updateError) {
        // Rollback: delete uploaded storage file and component
        try {
          await supabase.storage.from(STORAGE_BUCKETS.PROJECT_FILES).remove([storagePath]);
          await supabase.from('components').delete().eq('id', component.id);
        } catch (rollbackError) {
          console.error('Rollback failed during storage path update:', {
            componentId: component.id,
            storagePath,
            error: rollbackError,
          });
        }
        console.error('Failed to update component with storage path:', updateError);
        return errorResponse('Failed to store component code', 500);
      }

      // Reload component with updated storage path
      const { data: updatedComponent, error: reloadError } = await supabase
        .from('components')
        .select('*')
        .eq('id', component.id)
        .single();

      if (reloadError || !updatedComponent) {
        console.error('Component reload failed:', { componentId: component.id, error: reloadError });
        // Merge known storage path into component
        component.code_storage_path = storagePath;
      } else {
        component = updatedComponent;
      }
    } catch (storageError) {
      // Rollback: delete component if storage fails
      try {
        await supabase.from('components').delete().eq('id', component.id);
      } catch (rollbackError) {
        console.error('Rollback failed during storage upload:', {
          componentId: component.id,
          error: rollbackError,
        });
      }

      console.error('Failed to store component code:', storageError);
      return errorResponse('Failed to store component code', 500);
    }

    const response = createdResponse({ component });
    setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
    return response;
  } catch (error) {
    if (
      error instanceof UnauthorizedError ||
      error instanceof ForbiddenError ||
      error instanceof ValidationError
    ) {
      return errorResponse(error.message, error.statusCode);
    }

    console.error('POST /api/components error:', error);
    return errorResponse('Internal server error', 500);
  }
}
