/**
 * Unit Tests for Rate Limiting
 */

import { NextRequest } from 'next/server';
import { checkRateLimit, enforceRateLimit, setRateLimitHeaders } from '../rate-limit';
import { RateLimitError } from '../errors';

// Mock getSession
jest.mock('../auth');

import { getSession } from '../auth';
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

describe('Rate Limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear rate limit map between tests
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('checkRateLimit', () => {
    it('should allow first request', async () => {
      mockGetSession.mockResolvedValue({
        user: {
          id: 'user-123',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00Z',
        } as any,
      });
      const request = new NextRequest('http://localhost/api/test');

      const result = await checkRateLimit(request, 10, 60000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it('should track requests per user', async () => {
      mockGetSession.mockResolvedValue({
        user: {
          id: 'user-123',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00Z',
        } as any,
      });
      const request = new NextRequest('http://localhost/api/test');

      // First request
      const result1 = await checkRateLimit(request, 3, 60000);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(2);

      // Second request
      const result2 = await checkRateLimit(request, 3, 60000);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);

      // Third request
      const result3 = await checkRateLimit(request, 3, 60000);
      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should block requests after limit exceeded', async () => {
      mockGetSession.mockResolvedValue({
        user: {
          id: 'user-123',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00Z',
        } as any,
      });
      const request = new NextRequest('http://localhost/api/test');

      // Exhaust limit
      await checkRateLimit(request, 2, 60000);
      await checkRateLimit(request, 2, 60000);

      // Should be blocked
      const result = await checkRateLimit(request, 2, 60000);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      mockGetSession.mockResolvedValue({
        user: {
          id: 'user-123',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00Z',
        } as any,
      });
      const request = new NextRequest('http://localhost/api/test');

      // Exhaust limit
      await checkRateLimit(request, 2, 60000);
      await checkRateLimit(request, 2, 60000);

      // Fast forward past window
      jest.advanceTimersByTime(61000);

      // Should allow again
      const result = await checkRateLimit(request, 2, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should use IP address for anonymous users', async () => {
      mockGetSession.mockResolvedValue(null);
      const request = new NextRequest('http://localhost/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
      });

      const result = await checkRateLimit(request, 10, 60000);
      expect(result.allowed).toBe(true);
    });

    it('should use default identifier for anonymous without IP', async () => {
      mockGetSession.mockResolvedValue(null);
      const request = new NextRequest('http://localhost/api/test');

      const result = await checkRateLimit(request, 10, 60000);
      expect(result.allowed).toBe(true);
    });
  });

  describe('enforceRateLimit', () => {
    it('should not throw when limit not exceeded', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'user-123' } as any });
      const request = new NextRequest('http://localhost/api/test');

      await expect(enforceRateLimit(request, 10, 60000)).resolves.not.toThrow();
    });

    it('should throw RateLimitError when limit exceeded', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'user-123' } as any });
      const request = new NextRequest('http://localhost/api/test');

      // Exhaust limit
      await checkRateLimit(request, 2, 60000);
      await checkRateLimit(request, 2, 60000);

      await expect(enforceRateLimit(request, 2, 60000)).rejects.toThrow(RateLimitError);
    });

    it('should include retry after in error', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'user-123' } as any });
      const request = new NextRequest('http://localhost/api/test');

      // Exhaust limit
      await checkRateLimit(request, 2, 60000);
      await checkRateLimit(request, 2, 60000);

      try {
        await enforceRateLimit(request, 2, 60000);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).details?.retry_after).toBeGreaterThan(0);
      }
    });
  });

  describe('setRateLimitHeaders', () => {
    it('should set rate limit headers on response', () => {
      const response = new Response('test');
      const result = {
        allowed: true,
        remaining: 5,
        resetAt: Date.now() + 60000,
      };

      const updatedResponse = setRateLimitHeaders(response, result, 10);

      expect(updatedResponse.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(updatedResponse.headers.get('X-RateLimit-Remaining')).toBe('5');
      expect(updatedResponse.headers.get('X-RateLimit-Reset')).toBeTruthy();
    });

    it('should set Retry-After header when not allowed', () => {
      const response = new Response('test');
      const result = {
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 30000,
      };

      const updatedResponse = setRateLimitHeaders(response, result, 10);

      expect(updatedResponse.headers.get('Retry-After')).toBeTruthy();
      expect(parseInt(updatedResponse.headers.get('Retry-After')!)).toBeGreaterThan(0);
    });
  });
});
