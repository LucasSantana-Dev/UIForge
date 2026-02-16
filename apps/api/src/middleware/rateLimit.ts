/**
 * Rate Limiting Middleware
 * In-memory rate limiter with per-user and per-IP tracking
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface RateLimitInfo {
  count: number;
  resetAt: number;
}

// In-memory storage (will reset on server restart)
const rateLimitMap = new Map<string, RateLimitInfo>();

// Cleanup old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

export interface RateLimitOptions {
  limit: number; // Max requests
  window: number; // Time window in milliseconds
  keyPrefix?: string; // Optional prefix for rate limit key
}

/**
 * Create rate limit middleware
 */
export function createRateLimiter(options: RateLimitOptions) {
  const { limit, window, keyPrefix = 'rl' } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get identifier (user ID or IP)
      let forwardedFor = req.headers['x-forwarded-for'];
      if (Array.isArray(forwardedFor)) {
        forwardedFor = forwardedFor[0];
      }
      if (forwardedFor && typeof forwardedFor === 'string') {
        forwardedFor = forwardedFor.split(',')[0].trim();
      }

      // Normalize x-real-ip the same way
      let xRealIp = req.headers['x-real-ip'];
      if (Array.isArray(xRealIp)) {
        xRealIp = xRealIp[0];
      }
      if (xRealIp && typeof xRealIp === 'string') {
        xRealIp = xRealIp.trim();
      }

      // Try to get a unique identifier, reject if none available
      const requestId = req.headers['x-request-id'] as string;
      const identifier =
        req.user?.id ||
        forwardedFor ||
        xRealIp ||
        req.ip ||
        (requestId ? `req-${requestId}` : null);

      if (!identifier) {
        return res.status(400).json({
          error: 'Unable to identify client for rate limiting',
        });
      }

      const key = `${keyPrefix}:${identifier}`;
      const now = Date.now();
      const userLimit = rateLimitMap.get(key);

      // No existing limit or expired
      if (!userLimit || now > userLimit.resetAt) {
        const resetAt = now + window;
        rateLimitMap.set(key, { count: 1, resetAt });

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', limit.toString());
        res.setHeader('X-RateLimit-Remaining', (limit - 1).toString());
        res.setHeader('X-RateLimit-Reset', Math.floor(resetAt / 1000).toString());

        return next();
      }

      // Limit exceeded
      if (userLimit.count >= limit) {
        const retryAfter = Math.ceil((userLimit.resetAt - now) / 1000);

        logger.warn('Rate limit exceeded', {
          identifier,
          limit,
          retryAfter,
        });

        res.setHeader('X-RateLimit-Limit', limit.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', Math.floor(userLimit.resetAt / 1000).toString());
        res.setHeader('Retry-After', retryAfter.toString());

        res.status(429).json({
          error: {
            message: 'Rate limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter,
          },
        });
        return;
      }

      // Increment count
      userLimit.count++;

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', limit.toString());
      res.setHeader('X-RateLimit-Remaining', (limit - userLimit.count).toString());
      res.setHeader('X-RateLimit-Reset', Math.floor(userLimit.resetAt / 1000).toString());

      next();
    } catch (error) {
      logger.error('Rate limit middleware error', error);
      next(); // Continue on error (fail open)
    }
  };
}
