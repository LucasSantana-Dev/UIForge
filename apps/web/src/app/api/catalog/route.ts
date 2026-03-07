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
import { insertCatalogEntry } from '@/lib/repositories/catalog.repo';
import { listCatalogEntries, type CatalogListQuery } from '@/lib/services/catalog.service';
import { createCatalogEntrySchema, catalogQuerySchema } from '@/lib/api/validation/catalog';

const RATE_LIMIT = 120;
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
    const { searchParams } = new URL(request.url);
    const query = catalogQuerySchema.parse(Object.fromEntries(searchParams.entries()));

    const result = await listCatalogEntries(query as CatalogListQuery);

    const response = successResponse({
      entries: result.data,
      pagination: result.pagination,
    });
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
    const validation = createCatalogEntrySchema.safeParse(body);
    if (!validation.success) {
      const response = errorResponse('Invalid request body', 400, {
        errors: validation.error.issues,
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const entry = await insertCatalogEntry({
      ...validation.data,
      owner_id: session.user.id,
    });

    const response = createdResponse(entry, 'Catalog entry created successfully');
    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    if ((error as APIError).statusCode) {
      return apiErrorResponse(error as APIError);
    }
    return errorResponse('An unexpected error occurred', 500);
  }
}
