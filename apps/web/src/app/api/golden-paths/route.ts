import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { successResponse, createdResponse, errorResponse } from '@/lib/api/response';
import { listGoldenPathTemplates } from '@/lib/services/golden-path.service';
import { insertGoldenPath } from '@/lib/repositories/golden-path.repo';
import { goldenPathQuerySchema, createGoldenPathSchema } from '@/lib/api/validation/golden-path';
import { captureServerError } from '@/lib/sentry/server';

export async function GET(request: NextRequest) {
  try {
    const { allowed, remaining, resetAt } = await checkRateLimit(request, 120, 60_000);
    if (!allowed) {
      const resp = errorResponse('Rate limit exceeded', 429);
      setRateLimitHeaders(resp, { allowed, remaining, resetAt }, 120);
      return resp;
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const validated = goldenPathQuerySchema.parse(params);

    const result = await listGoldenPathTemplates(validated);

    const response = successResponse({
      data: result.data,
      pagination: result.pagination,
    });
    setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
    return response;
  } catch (error) {
    captureServerError(error, { route: '/api/golden-paths' });
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { allowed, remaining, resetAt } = await checkRateLimit(request, 30, 60_000);
    if (!allowed) {
      const resp = errorResponse('Rate limit exceeded', 429);
      setRateLimitHeaders(resp, { allowed, remaining, resetAt }, 120);
      return resp;
    }

    const { user } = await verifySession();

    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const parseResult = createGoldenPathSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse('Invalid request body', 400, {
        errors: parseResult.error.issues,
      });
    }

    const template = await insertGoldenPath({
      ...parseResult.data,
      owner_id: user.id,
    });

    const response = createdResponse({ data: template });
    setRateLimitHeaders(response, { allowed, remaining, resetAt }, 30);
    return response;
  } catch (error) {
    captureServerError(error, { route: '/api/golden-paths' });
    return errorResponse('Internal server error', 500);
  }
}
