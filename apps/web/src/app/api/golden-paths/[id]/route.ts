import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/api';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getGoldenPathDetail, verifyGoldenPathOwnership } from '@/lib/services/golden-path.service';
import { updateGoldenPath, deleteGoldenPath } from '@/lib/repositories/golden-path.repo';
import { updateGoldenPathSchema } from '@/lib/api/validation/golden-path';
import { NotFoundError, ForbiddenError } from '@/lib/api/errors';
import { captureServerError } from '@/lib/sentry/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { allowed, remaining, resetAt } = await checkRateLimit(request, 120, 60_000);
    if (!allowed) {
      return errorResponse('Rate limit exceeded', 429, {
        remaining,
        resetAt,
      });
    }

    const { id } = await params;
    const template = await getGoldenPathDetail(id);

    const response = successResponse(template);
    setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
    return response;
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    captureServerError(error, { route: '/api/golden-paths/[id]' });
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { allowed, remaining, resetAt } = await checkRateLimit(request, 30, 60_000);
    if (!allowed) {
      return errorResponse('Rate limit exceeded', 429, {
        remaining,
        resetAt,
      });
    }

    const { user } = await verifySession();
    const { id } = await params;

    await verifyGoldenPathOwnership(id, user.id);

    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const parseResult = updateGoldenPathSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse('Invalid request body', 400, {
        errors: parseResult.error.issues,
      });
    }

    const updated = await updateGoldenPath(id, parseResult.data);

    const response = successResponse(updated);
    setRateLimitHeaders(response, { allowed, remaining, resetAt }, 30);
    return response;
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    if (error instanceof ForbiddenError) {
      return errorResponse(error.message, 403);
    }
    captureServerError(error, { route: '/api/golden-paths/[id]' });
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { allowed, remaining, resetAt } = await checkRateLimit(request, 30, 60_000);
    if (!allowed) {
      return errorResponse('Rate limit exceeded', 429, {
        remaining,
        resetAt,
      });
    }

    const { user } = await verifySession();
    const { id } = await params;

    await verifyGoldenPathOwnership(id, user.id);
    await deleteGoldenPath(id);

    const response = successResponse({ deleted: true });
    setRateLimitHeaders(response, { allowed, remaining, resetAt }, 30);
    return response;
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }
    if (error instanceof ForbiddenError) {
      return errorResponse(error.message, 403);
    }
    captureServerError(error, { route: '/api/golden-paths/[id]' });
    return errorResponse('Internal server error', 500);
  }
}
