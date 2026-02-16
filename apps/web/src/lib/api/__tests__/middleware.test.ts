/**
 * Unit Tests for API Middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withAuth,
  withRateLimit,
  withValidation,
  withErrorHandling,
  compose,
} from '../middleware';
import { z } from 'zod';
import * as auth from '../auth';
import * as rateLimit from '../rate-limit';
import { UnauthorizedError, ValidationError } from '../errors';

// Mock dependencies
jest.mock('../auth');
jest.mock('../rate-limit');

const mockVerifySession = auth.verifySession as jest.MockedFunction<
  typeof auth.verifySession
>;
const mockCheckRateLimit = rateLimit.checkRateLimit as jest.MockedFunction<
  typeof rateLimit.checkRateLimit
>;
const mockSetRateLimitHeaders = rateLimit.setRateLimitHeaders as jest.MockedFunction<
  typeof rateLimit.setRateLimitHeaders
>;

describe('API Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withAuth', () => {
    it('should call handler when authenticated', async () => {
      mockVerifySession.mockResolvedValue({
        user: { id: 'user-123' } as any,
      });

      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const wrappedHandler = withAuth(handler);

      const request = new NextRequest('http://localhost/api/test');
      await wrappedHandler(request);

      expect(mockVerifySession).toHaveBeenCalled();
      expect(handler).toHaveBeenCalledWith(request, undefined);
    });

    it('should return 401 when not authenticated', async () => {
      mockVerifySession.mockRejectedValue(
        new UnauthorizedError('Not authenticated')
      );

      const handler = jest.fn();
      const wrappedHandler = withAuth(handler);

      const request = new NextRequest('http://localhost/api/test');
      const response = await wrappedHandler(request);

      expect(response.status).toBe(401);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('withRateLimit', () => {
    it('should call handler when rate limit not exceeded', async () => {
      mockCheckRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 10,
        resetAt: Date.now() + 60000,
      });
      mockSetRateLimitHeaders.mockImplementation((res) => res as any);

      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const wrappedHandler = withRateLimit(handler, 100, 60000);

      const request = new NextRequest('http://localhost/api/test');
      await wrappedHandler(request);

      expect(mockCheckRateLimit).toHaveBeenCalledWith(request, 100, 60000);
      expect(handler).toHaveBeenCalled();
    });

    it('should return 429 when rate limit exceeded', async () => {
      mockCheckRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 30000,
      });
      mockSetRateLimitHeaders.mockImplementation((res) => res as any);

      const handler = jest.fn();
      const wrappedHandler = withRateLimit(handler, 10, 60000);

      const request = new NextRequest('http://localhost/api/test');
      const response = await wrappedHandler(request);

      expect(response.status).toBe(429);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('withValidation', () => {
    const schema = z.object({
      name: z.string().min(1),
      age: z.number().positive(),
    });

    it('should call handler with validated data', async () => {
      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const wrappedHandler = withValidation(handler, schema);

      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        body: JSON.stringify({ name: 'John', age: 30 }),
      });

      await wrappedHandler(request);

      expect(handler).toHaveBeenCalledWith(
        request,
        { name: 'John', age: 30 },
        undefined
      );
    });

    it('should return 400 for invalid data', async () => {
      const handler = jest.fn();
      const wrappedHandler = withValidation(handler, schema);

      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        body: JSON.stringify({ name: '', age: -5 }),
      });

      const response = await wrappedHandler(request);

      expect(response.status).toBe(400);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('withErrorHandling', () => {
    it('should return response from handler', async () => {
      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const wrappedHandler = withErrorHandling(handler);

      const request = new NextRequest('http://localhost/api/test');
      const response = await wrappedHandler(request);

      expect(response.status).toBe(200);
    });

    it('should catch and handle errors', async () => {
      const handler = jest.fn().mockRejectedValue(new Error('Test error'));
      const wrappedHandler = withErrorHandling(handler);

      const request = new NextRequest('http://localhost/api/test');
      const response = await wrappedHandler(request);

      expect(response.status).toBe(500);
    });

    it('should handle APIError correctly', async () => {
      const handler = jest.fn().mockRejectedValue(
        new ValidationError('Invalid input')
      );
      const wrappedHandler = withErrorHandling(handler);

      const request = new NextRequest('http://localhost/api/test');
      const response = await wrappedHandler(request);

      expect(response.status).toBe(400);
    });
  });

  describe('compose', () => {
    it('should compose multiple middleware functions', async () => {
      mockVerifySession.mockResolvedValue({
        user: { id: 'user-123' } as any,
      });
      mockCheckRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 10,
        resetAt: Date.now() + 60000,
      });
      mockSetRateLimitHeaders.mockImplementation((res) => res as any);

      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const composedHandler = compose(
        withAuth,
        withRateLimit,
        withErrorHandling
      )(handler);

      const request = new NextRequest('http://localhost/api/test');
      await composedHandler(request);

      expect(mockVerifySession).toHaveBeenCalled();
      expect(mockCheckRateLimit).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
    });
  });
});
