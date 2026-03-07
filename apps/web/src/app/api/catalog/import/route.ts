import type { NextRequest } from 'next/server';
import {
  verifySession,
  createdResponse,
  errorResponse,
  apiErrorResponse,
  type APIError,
} from '@/lib/api';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { importCatalogYaml } from '@/lib/services/catalog-import.service';
import { importCatalogYamlSchema } from '@/lib/api/validation/catalog';

const RATE_LIMIT = 30;
const RATE_WINDOW = 60000;

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
    const validation = importCatalogYamlSchema.safeParse(body);

    if (!validation.success) {
      const response = errorResponse('Invalid request body', 400, {
        errors: validation.error.issues,
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const result = await importCatalogYaml(
      validation.data.yaml,
      session.user.id,
      validation.data.source
    );

    const response = createdResponse(result, 'YAML import completed');
    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    if ((error as APIError).statusCode) {
      return apiErrorResponse(error as APIError);
    }
    return errorResponse('An unexpected error occurred', 500);
  }
}
