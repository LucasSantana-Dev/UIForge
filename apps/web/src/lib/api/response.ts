/**
 * API Response Helpers
 * Standardized response formatting for API routes
 */

import { NextResponse } from 'next/server';
import type { APIError } from './errors';

export function jsonResponse<T = any>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(
  message: string,
  status: number = 500,
  details?: any
) {
  return NextResponse.json(
    {
      error: {
        message,
        status,
        ...(details && { details }),
      },
    },
    { status }
  );
}

export function apiErrorResponse(error: APIError) {
  return NextResponse.json(
    {
      error: {
        message: error.message,
        status: error.statusCode,
        code: error.code,
        ...(error.details && { details: error.details }),
      },
    },
    { status: error.statusCode }
  );
}

export function successResponse<T = any>(data: T, message?: string) {
  return jsonResponse(
    {
      success: true,
      ...(message && { message }),
      data,
    },
    200
  );
}

export function createdResponse<T = any>(data: T, message?: string) {
  return jsonResponse(
    {
      success: true,
      ...(message && { message }),
      data,
    },
    201
  );
}

export function noContentResponse() {
  return new NextResponse(null, { status: 204 });
}
