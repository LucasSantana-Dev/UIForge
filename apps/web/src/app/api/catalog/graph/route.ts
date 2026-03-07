import type { NextRequest } from 'next/server';
import {
  verifySession,
  errorResponse,
  apiErrorResponse,
  jsonResponse,
  type APIError,
} from '@/lib/api';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { getCatalogGraph } from '@/lib/services/catalog.service';

const RATE_LIMIT = 60;
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

    await verifySession();
    const graph = await getCatalogGraph();
    const response = jsonResponse(graph);
    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    if ((error as APIError).statusCode) {
      return apiErrorResponse(error as APIError);
    }
    return errorResponse('An unexpected error occurred', 500);
  }
}
