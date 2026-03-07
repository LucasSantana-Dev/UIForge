import type { NextRequest } from 'next/server';
import {
  verifySession,
  successResponse,
  createdResponse,
  errorResponse,
  apiErrorResponse,
  type APIError,
} from '@/lib/api';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import {
  discoverCatalogFiles,
  importDiscoveredRepos,
} from '@/lib/services/catalog-discovery.service';

const RATE_LIMIT = 10;
const RATE_WINDOW = 60000;

export async function GET(request: NextRequest) {
  try {
    const rateResult = await checkRateLimit(request, RATE_LIMIT, RATE_WINDOW);
    if (!rateResult.allowed) {
      const response = errorResponse('Rate limit exceeded', 429, {
        retry_after: Math.ceil((rateResult.resetAt - Date.now()) / 1000),
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const session = await verifySession();
    const result = await discoverCatalogFiles(session.user.id);

    const response = successResponse(result);
    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    if ((error as APIError).statusCode) {
      return apiErrorResponse(error as APIError);
    }
    return errorResponse('An unexpected error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateResult = await checkRateLimit(request, RATE_LIMIT, RATE_WINDOW);
    if (!rateResult.allowed) {
      const response = errorResponse('Rate limit exceeded', 429, {
        retry_after: Math.ceil((rateResult.resetAt - Date.now()) / 1000),
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const session = await verifySession();
    const body = await request.json();

    if (!Array.isArray(body.repos) || body.repos.length === 0) {
      const response = errorResponse(
        'repos must be a non-empty array',
        400
      );
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    if (body.repos.length > 50) {
      const response = errorResponse('Maximum 50 repos per import', 400);
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const result = await importDiscoveredRepos(
      session.user.id,
      body.repos
    );

    const response = createdResponse(result, 'Import completed');
    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    if ((error as APIError).statusCode) {
      return apiErrorResponse(error as APIError);
    }
    return errorResponse('An unexpected error occurred', 500);
  }
}
