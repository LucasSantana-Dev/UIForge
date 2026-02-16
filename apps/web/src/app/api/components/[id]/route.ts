/**
 * Components API - Get, Update, Delete
 * GET /api/components/[id] - Get component with code
 * PATCH /api/components/[id] - Update component
 * DELETE /api/components/[id] - Delete component and storage file
 */

import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import {
  successResponse,
  noContentResponse,
  errorResponse,
} from '@/lib/api/response';
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@/lib/api/errors';
import { updateComponentSchema } from '@/lib/api/validation/components';
import {
  uploadToStorage,
  downloadFromStorage,
  deleteFromStorage,
  generateComponentStoragePath,
  validateFileSize,
  STORAGE_BUCKETS,
  STORAGE_LIMITS,
} from '@/lib/api/storage';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/components/[id]
 * Get component with code from storage
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

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

    // Fetch component with project info
    const supabase = await createClient();
    const { data: component, error: componentError } = await supabase
      .from('components')
      .select('*, projects!inner(user_id, is_public)')
      .eq('id', id)
      .single();

    if (componentError || !component) {
      throw new NotFoundError('Component');
    }

    // Check access: owner or public project
    const project = component.projects as any;
    if (project.user_id !== user.id && !project.is_public) {
      throw new ForbiddenError('You do not have access to this component');
    }

    // Download code from storage
    let code_content = '';
    if (component.code_storage_path) {
      try {
        code_content = await downloadFromStorage(
          STORAGE_BUCKETS.PROJECT_FILES,
          component.code_storage_path,
          true
        ) as string;
      } catch (storageError) {
        console.error('Failed to download component code:', storageError);
        // Continue without code if storage fails
      }
    }

    // Add code to component data
    const componentData = { ...component };
    const response = successResponse({
      component: {
        ...componentData,
        code_content,
      },
    });

    setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
    return response;
  } catch (error) {
    if (
      error instanceof UnauthorizedError ||
      error instanceof ForbiddenError ||
      error instanceof NotFoundError
    ) {
      return errorResponse(error.message, error.statusCode);
    }

    console.error('GET /api/components/[id] error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * PATCH /api/components/[id]
 * Update component (updates storage if code changed)
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

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

    // Fetch component with project info
    const supabase = await createClient();
    const { data: component, error: componentError } = await supabase
      .from('components')
      .select('*, projects!inner(user_id, framework)')
      .eq('id', id)
      .single();

    if (componentError || !component) {
      throw new NotFoundError('Component');
    }

    // Verify ownership
    const project = component.projects as any;
    if (project.user_id !== user.id) {
      throw new ForbiddenError('You do not own this component');
    }

    // Parse and validate request body
    const body = await request.json();
    const parseResult = updateComponentSchema.safeParse(body);

    if (!parseResult.success) {
      throw new ValidationError('Invalid component data', parseResult.error.flatten());
    }

    const validated = parseResult.data;

    // Extract code_content if present
    const { code_content, ...updateData } = validated as any;

    // Validate framework compatibility if framework is being updated
    if (validated.framework && validated.framework !== project.framework) {
      throw new ValidationError(
        'Component framework must match project framework'
      );
    }

    // Update code in storage if provided
    if (code_content !== undefined) {
      // Validate code content size
      if (!validateFileSize(code_content, STORAGE_LIMITS.CODE_FILE)) {
        throw new ValidationError(
          `Code content exceeds maximum size of ${STORAGE_LIMITS.CODE_FILE / 1024 / 1024}MB`
        );
      }

      const storagePath =
        component.code_storage_path ||
        generateComponentStoragePath(
          component.project_id,
          component.id,
          validated.framework || component.framework
        );

      try {
        await uploadToStorage(
          STORAGE_BUCKETS.PROJECT_FILES,
          storagePath,
          code_content,
          'text/plain'
        );

        // Update storage path if it was newly generated
        if (!component.code_storage_path) {
          updateData.code_storage_path = storagePath;
        }
      } catch (storageError) {
        console.error('Failed to update component code:', storageError);
        return errorResponse('Failed to update component code', 500);
      }
    }

    // Update component record
    const { data: updatedComponent, error: updateError } = await supabase
      .from('components')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update component:', updateError);
      return errorResponse('Failed to update component', 500);
    }

    const response = successResponse({ component: updatedComponent });
    setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
    return response;
  } catch (error) {
    if (
      error instanceof UnauthorizedError ||
      error instanceof ForbiddenError ||
      error instanceof NotFoundError ||
      error instanceof ValidationError
    ) {
      return errorResponse(error.message, error.statusCode);
    }

    console.error('PATCH /api/components/[id] error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * DELETE /api/components/[id]
 * Delete component and storage file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Fetch component with project info
    const supabase = await createClient();
    const { data: component, error: componentError } = await supabase
      .from('components')
      .select('*, projects!inner(user_id)')
      .eq('id', id)
      .single();

    if (componentError || !component) {
      throw new NotFoundError('Component');
    }

    // Verify component belongs to user's project
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', component.project_id)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      throw new ForbiddenError('You do not own this component');
    }

    // Delete from storage if path exists
    if (component.code_storage_path) {
      try {
        await deleteFromStorage(
          STORAGE_BUCKETS.PROJECT_FILES,
          component.code_storage_path
        );
      } catch (storageError) {
        console.error('Failed to delete component code:', storageError);
        // Continue with database deletion even if storage fails
      }
    }

    // Delete component record
    const { error: deleteError } = await supabase
      .from('components')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete component:', deleteError);
      return errorResponse('Failed to delete component', 500);
    }

    const response = noContentResponse();
    setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
    return response;
  } catch (error) {
    if (
      error instanceof UnauthorizedError ||
      error instanceof ForbiddenError ||
      error instanceof NotFoundError
    ) {
      return errorResponse(error.message, error.statusCode);
    }

    console.error('DELETE /api/components/[id] error:', error);
    return errorResponse('Internal server error', 500);
  }
}
