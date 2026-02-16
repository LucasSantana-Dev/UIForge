/**
 * Global Error Handler Middleware
 * Catches and formats errors consistently
 */

import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Global error handler - must be last middleware
 */
export function errorHandler(
  error: Error | APIError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors
  if (error instanceof ZodError) {
    logger.warn('Validation error', {
      path: req.path,
      issues: error.issues,
    });

    res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.issues,
      },
    });
    return;
  }

  // API errors
  if (error instanceof APIError) {
    logger.warn('API error', {
      path: req.path,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    });

    const errorResponse: {
      error: {
        message: string;
        code: string;
        details?: unknown;
      };
    } = {
      error: {
        message: error.message,
        code: error.code || 'API_ERROR',
      },
    };

    if (error.details) {
      errorResponse.error.details = error.details;
    }

    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // Unknown errors
  logger.error('Unexpected error', error, {
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: {
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    },
  });
}

/**
 * 404 handler - must be before error handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method,
  });

  res.status(404).json({
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
      path: req.path,
    },
  });
}
