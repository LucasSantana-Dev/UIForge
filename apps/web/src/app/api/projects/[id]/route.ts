import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  verifySession,
  successResponse,
  noContentResponse,
  errorResponse,
  apiErrorResponse,
  updateProjectSchema,
  NotFoundError,
  ForbiddenError,
  type APIError,
} from '@/lib/api';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { verifyProjectOwnership } from '@/lib/services/project.service';

const RATE_LIMIT = 120;
const RATE_WINDOW = 60000;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rateResult = await checkRateLimit(request, RATE_LIMIT, RATE_WINDOW);
    if (!rateResult.allowed) {
      const response = errorResponse('Rate limit exceeded', 429, {
        retry_after: Math.ceil((rateResult.resetAt - Date.now()) / 1000),
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const session = await verifySession();
    const supabase = await createClient();

    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();

    if (error || !data) {
      throw new NotFoundError('Project not found');
    }

    if (!data.is_public && data.user_id !== session.user.id) {
      throw new ForbiddenError('You do not have access to this project');
    }

    const response = successResponse(data);
    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    if ((error as APIError).statusCode) {
      return apiErrorResponse(error as APIError);
    }
    return errorResponse('An unexpected error occurred', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rateResult = await checkRateLimit(request, RATE_LIMIT, RATE_WINDOW);
    if (!rateResult.allowed) {
      const response = errorResponse('Rate limit exceeded', 429, {
        retry_after: Math.ceil((rateResult.resetAt - Date.now()) / 1000),
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const session = await verifySession();

    const body = await request.json();
    const validation = updateProjectSchema.safeParse(body);
    if (!validation.success) {
      const response = errorResponse('Invalid request body', 400, {
        errors: validation.error.issues,
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    await verifyProjectOwnership(id, session.user.id);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      const response = errorResponse('Failed to update project', 500);
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const response = successResponse(data, 'Project updated successfully');
    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    if ((error as APIError).statusCode) {
      return apiErrorResponse(error as APIError);
    }
    return errorResponse('An unexpected error occurred', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rateResult = await checkRateLimit(request, RATE_LIMIT, RATE_WINDOW);
    if (!rateResult.allowed) {
      const response = errorResponse('Rate limit exceeded', 429, {
        retry_after: Math.ceil((rateResult.resetAt - Date.now()) / 1000),
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const session = await verifySession();
    await verifyProjectOwnership(id, session.user.id);

    const supabase = await createClient();
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      const response = errorResponse('Failed to delete project', 500);
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const response = noContentResponse();
    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    if ((error as APIError).statusCode) {
      return apiErrorResponse(error as APIError);
    }
    return errorResponse('An unexpected error occurred', 500);
  }
}
