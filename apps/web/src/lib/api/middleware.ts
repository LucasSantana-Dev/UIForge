/**
 * API Middleware
 * Higher-order functions for route handlers
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from './rate-limit';
import { verifySession } from './auth';
import { ValidationError, type APIError } from './errors';
import { errorResponse, apiErrorResponse } from './response';
import { type ZodSchema } from 'zod';

type RouteHandler = (request: NextRequest, context?: any) => Promise<NextResponse>;

/**
 * Wrap route handler with authentication
 */
export function withAuth(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context?: any) => {
    try {
      await verifySession();
      return await handler(request, context);
    } catch (error) {
      if ((error as APIError).statusCode) {
        return apiErrorResponse(error as APIError);
      }
      console.error('Auth middleware error:', error);
      return errorResponse('Authentication failed', 401);
    }
  };
}

/**
 * Wrap route handler with rate limiting
 */
export function withRateLimit(
  handler: RouteHandler,
  limit: number = 100,
  window: number = 60000
): RouteHandler {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      const result = await checkRateLimit(request, limit, window);

      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
        const response = errorResponse('Rate limit exceeded', 429, {
          retry_after: retryAfter,
        });
        return NextResponse.json(response, {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(result.resetAt),
            'Retry-After': String(retryAfter),
          },
        });
      }

      const response = await handler(request, context);
      return response;
    } catch (error) {
      if ((error as APIError).statusCode) {
        return apiErrorResponse(error as APIError);
      }
      console.error('Rate limit middleware error:', error);
      return errorResponse('Rate limit check failed', 500);
    }
  };
}

/**
 * Wrap route handler with validation
 */
export function withValidation<T>(
  handler: (request: NextRequest, data: T, context?: any) => Promise<NextResponse>,
  schema: ZodSchema<T>
): RouteHandler {
  return async (request: NextRequest, context?: any) => {
    try {
      const body = await request.json();
      const validation = schema.safeParse(body);

      if (!validation.success) {
        throw new ValidationError('Validation failed', {
          errors: validation.error.issues,
        });
      }

      return await handler(request, validation.data, context);
    } catch (error) {
      if ((error as APIError).statusCode) {
        return apiErrorResponse(error as APIError);
      }
      console.error('Validation middleware error:', error);
      return errorResponse('Validation failed', 400);
    }
  };
}

/**
 * Wrap route handler with error handling
 */
export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if ((error as APIError).statusCode) {
        return apiErrorResponse(error as APIError);
      }
      console.error('Route handler error:', error);
      return errorResponse('An unexpected error occurred', 500);
    }
  };
}

/**
 * Compose multiple middleware functions
 */
export function compose(...middlewares: Array<(handler: RouteHandler) => RouteHandler>) {
  return (handler: RouteHandler): RouteHandler => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}
