import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { successResponse, noContentResponse, errorResponse } from '@/lib/api/response';
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@/lib/api/errors';
import { updateComponentSchema } from '@/lib/api/validation/components';
import { validateFileSize, STORAGE_LIMITS } from '@/lib/api/storage';
import { captureServerError } from '@/lib/sentry/server';
import {
  verifyComponentAccess,
  getComponentCode,
  storeComponentCode,
  deleteComponentCode,
} from '@/lib/services/component.service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { allowed, remaining, resetAt } = await checkRateLimit(request, 120, 60 * 1000);
    if (!allowed) {
      const response = errorResponse('Rate limit exceeded', 429);
      setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
      return response;
    }

    const { user } = await verifySession();
    const component = await verifyComponentAccess(id, user.id);
    const code_content = await getComponentCode(component.code_storage_path);

    const response = successResponse({ component: { ...component, code_content } });
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
    captureServerError(error, { route: '/api/components/[id]' });
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { allowed, remaining, resetAt } = await checkRateLimit(request, 120, 60 * 1000);
    if (!allowed) {
      const response = errorResponse('Rate limit exceeded', 429);
      setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
      return response;
    }

    const { user } = await verifySession();
    const component = await verifyComponentAccess(id, user.id, true);
    const project = component.projects as any;

    const body = await request.json();
    const parseResult = updateComponentSchema.safeParse(body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid component data', parseResult.error.flatten());
    }

    const { code_content, ...updateData } = parseResult.data as any;

    if (parseResult.data.framework && parseResult.data.framework !== project.framework) {
      throw new ValidationError('Component framework must match project framework');
    }

    if (code_content !== undefined) {
      if (!validateFileSize(code_content, STORAGE_LIMITS.CODE_FILE)) {
        throw new ValidationError(
          'Code content exceeds maximum size of ' + STORAGE_LIMITS.CODE_FILE / 1024 / 1024 + 'MB'
        );
      }

      const storagePath = await storeComponentCode(
        component.project_id,
        component.id,
        parseResult.data.framework || component.framework,
        code_content,
        component.code_storage_path
      );

      if (!component.code_storage_path) {
        updateData.code_storage_path = storagePath;
      }
    }

    const supabase = await createClient();
    const { data: updatedComponent, error: updateError } = await supabase
      .from('components')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      captureServerError(updateError, { route: '/api/components/[id]' });
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
    captureServerError(error, { route: '/api/components/[id]' });
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { allowed, remaining, resetAt } = await checkRateLimit(request, 120, 60 * 1000);
    if (!allowed) {
      const response = errorResponse('Rate limit exceeded', 429);
      setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
      return response;
    }

    const { user } = await verifySession();
    const component = await verifyComponentAccess(id, user.id, true);

    await deleteComponentCode(component.code_storage_path);

    const supabase = await createClient();
    const { error: deleteError } = await supabase.from('components').delete().eq('id', id);

    if (deleteError) {
      captureServerError(deleteError, { route: '/api/components/[id]' });
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
    captureServerError(error, { route: '/api/components/[id]' });
    return errorResponse('Internal server error', 500);
  }
}
