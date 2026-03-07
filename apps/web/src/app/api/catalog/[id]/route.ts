import type { NextRequest } from 'next/server';
import {
  verifySession,
  successResponse,
  noContentResponse,
  errorResponse,
  apiErrorResponse,
  type APIError,
} from '@/lib/api';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import {
  verifyCatalogOwnership,
  getCatalogEntryWithRelations,
} from '@/lib/services/catalog.service';
import { updateCatalogEntry, deleteCatalogEntry } from '@/lib/repositories/catalog.repo';
import { updateCatalogEntrySchema } from '@/lib/api/validation/catalog';

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

    await verifySession();
    const data = await getCatalogEntryWithRelations(id);

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
    const validation = updateCatalogEntrySchema.safeParse(body);
    if (!validation.success) {
      const response = errorResponse('Invalid request body', 400, {
        errors: validation.error.issues,
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    await verifyCatalogOwnership(id, session.user.id);
    const updated = await updateCatalogEntry(id, validation.data);

    const response = successResponse(updated, 'Catalog entry updated successfully');
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
    await verifyCatalogOwnership(id, session.user.id);
    await deleteCatalogEntry(id);

    const response = noContentResponse();
    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    if ((error as APIError).statusCode) {
      return apiErrorResponse(error as APIError);
    }
    return errorResponse('An unexpected error occurred', 500);
  }
}
