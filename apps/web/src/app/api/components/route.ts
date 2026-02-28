import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { successResponse, createdResponse, errorResponse } from '@/lib/api/response';
import { UnauthorizedError, ForbiddenError, NotFoundError, ValidationError } from '@/lib/api/errors';
import { captureServerError } from '@/lib/sentry/server';
import {
  createComponentSchema,
  componentQuerySchema,
} from '@/lib/api/validation/components';
import { validateFileSize, STORAGE_LIMITS } from '@/lib/api/storage';
import {
  verifyProjectAccess,
  storeComponentCode,
} from '@/lib/services/component.service';

export async function GET(request: NextRequest) {
  try {
    const { allowed, remaining, resetAt } = await checkRateLimit(request, 120, 60 * 1000);
    if (!allowed) {
      const response = errorResponse('Rate limit exceeded', 429);
      setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
      return response;
    }

    const { user } = await verifySession();
    const { searchParams } = new URL(request.url);
    const validated = componentQuerySchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    await verifyProjectAccess(validated.project_id, user.id);

    const supabase = await createClient();
    const { data: components, error } = await supabase
      .from('components')
      .select('*')
      .eq('project_id', validated.project_id)
      .order('created_at', { ascending: false });

    if (error) {
      captureServerError(error, { route: '/api/components' });
      return errorResponse('Failed to fetch components', 500);
    }

    const response = successResponse({ components: components || [] });
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
    captureServerError(error, { route: '/api/components' });
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { allowed, remaining, resetAt } = await checkRateLimit(request, 120, 60 * 1000);
    if (!allowed) {
      const response = errorResponse('Rate limit exceeded', 429);
      setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
      return response;
    }

    const { user } = await verifySession();

    let body;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError('Invalid JSON in request body');
    }

    const parseResult = createComponentSchema.safeParse(body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid component data', parseResult.error.flatten());
    }

    const validated = parseResult.data;
    const project = await verifyProjectAccess(validated.project_id, user.id, true);

    if (validated.framework !== project.framework) {
      throw new ValidationError('Component framework must match project framework');
    }

    if (!validateFileSize(validated.code_content, STORAGE_LIMITS.CODE_FILE)) {
      throw new ValidationError(
        'Code content exceeds maximum size of ' + STORAGE_LIMITS.CODE_FILE / 1024 / 1024 + 'MB'
      );
    }

    const { code_content, ...componentData } = validated;
    const supabase = await createClient();

    const { data: component, error: componentError } = await supabase
      .from('components')
      .insert({ ...componentData, user_id: user.id })
      .select()
      .single();

    if (componentError || !component) {
      captureServerError(componentError, { route: '/api/components' });
      return errorResponse('Failed to create component', 500);
    }

    try {
      const storagePath = await storeComponentCode(
        validated.project_id, component.id, validated.framework, code_content
      );

      const { error: updateError } = await supabase
        .from('components')
        .update({ code_storage_path: storagePath })
        .eq('id', component.id);

      if (updateError) {
        await supabase.from('components').delete().eq('id', component.id);
        captureServerError(updateError, { route: '/api/components' });
        return errorResponse('Failed to store component code', 500);
      }

      component.code_storage_path = storagePath;
    } catch (storageError) {
      await supabase.from('components').delete().eq('id', component.id);
      captureServerError(storageError, { route: '/api/components' });
      return errorResponse('Failed to store component code', 500);
    }

    const response = createdResponse({ component });
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
    captureServerError(error, { route: '/api/components' });
    return errorResponse('Internal server error', 500);
  }
}
