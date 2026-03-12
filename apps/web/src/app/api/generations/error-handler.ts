import { UnauthorizedError } from '@/lib/api/errors';
import { errorResponse } from '@/lib/api/response';
import { captureServerError } from '@/lib/sentry/server';

export function handleGenerationRouteError(error: unknown, route: string) {
  if (error instanceof UnauthorizedError) {
    return errorResponse(error.message, 401);
  }

  captureServerError(error, { route });
  return errorResponse('Internal server error', 500);
}
