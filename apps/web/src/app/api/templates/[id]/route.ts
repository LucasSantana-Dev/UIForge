import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { successResponse, errorResponse, noContentResponse } from '@/lib/api/response';
import { UnauthorizedError, ForbiddenError } from '@/lib/api/errors';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { allowed, remaining, resetAt } = await checkRateLimit(request, 120, 60_000);
    if (!allowed) {
      const response = errorResponse('Rate limit exceeded', 429);
      setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
      return response;
    }

    const { id } = await context.params;
    const supabase = await createClient();
    const { data: template, error: dbError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();

    if (dbError || !template) {
      return errorResponse('Template not found', 404);
    }

    const response = successResponse({ template });
    setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
    return response;
  } catch (error) {
    console.error('GET /api/templates/[id] error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { allowed, remaining, resetAt } = await checkRateLimit(request, 30, 60_000);
    if (!allowed) {
      const response = errorResponse('Rate limit exceeded', 429);
      setRateLimitHeaders(response, { allowed, remaining, resetAt }, 30);
      return response;
    }

    const { user } = await verifySession();
    const { id } = await context.params;

    const supabase = await createClient();
    const { data: template, error: fetchError } = await supabase
      .from('templates')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (fetchError || !template) {
      return errorResponse('Template not found', 404);
    }

    if (template.created_by !== user.id) {
      throw new ForbiddenError('You can only delete your own templates');
    }

    const { error: deleteError } = await supabase.from('templates').delete().eq('id', id);

    if (deleteError) {
      console.error('Failed to delete template:', deleteError);
      return errorResponse('Failed to delete template', 500);
    }

    return noContentResponse();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return errorResponse(error.message, error.statusCode);
    }
    console.error('DELETE /api/templates/[id] error:', error);
    return errorResponse('Internal server error', 500);
  }
}
