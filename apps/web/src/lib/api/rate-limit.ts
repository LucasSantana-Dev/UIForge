/**
 * API Rate Limiting
 * In-memory rate limiter with per-user and per-IP tracking
 */

import { getSession } from './auth';
import { RateLimitError } from './errors';

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

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for request
 * @param request - The incoming request
 * @param limit - Maximum requests allowed in window
 * @param window - Time window in milliseconds (default: 60000 = 1 minute)
 */
export async function checkRateLimit(
  request: Request,
  limit: number = 100,
  window: number = 60000
): Promise<RateLimitResult> {
  // Get identifier (user ID or IP)
  const session = await getSession();

  let identifier: string;
  if (session?.user.id) {
    identifier = session.user.id;
  } else {
    // Build higher-entropy anonymous identifier from available signals
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');
    const acceptLang = request.headers.get('accept-language');

    if (ip) {
      // Use IP with additional signals for better bucketing
      identifier = `anon:${ip}:${userAgent?.substring(0, 50) || 'unknown'}:${acceptLang?.substring(0, 20) || 'unknown'}`;
    } else {
      // Fallback for truly anonymous requests
      identifier = 'anonymous:unknown';
    }
  }

  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);

  // No existing limit or expired
  if (!userLimit || now > userLimit.resetAt) {
    const resetAt = now + window;
    rateLimitMap.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  // Limit exceeded
  if (userLimit.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: userLimit.resetAt };
  }

  // Increment count
  userLimit.count++;
  return {
    allowed: true,
    remaining: limit - userLimit.count,
    resetAt: userLimit.resetAt,
  };
}

/**
 * Enforce rate limit (throws error if exceeded)
 */
export async function enforceRateLimit(
  request: Request,
  limit: number = 100,
  window: number = 60000
): Promise<void> {
  const result = await checkRateLimit(request, limit, window);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    throw new RateLimitError('Rate limit exceeded', retryAfter);
  }
}

/**
 * Set rate limit headers on response
 */
export function setRateLimitHeaders(
  response: Response,
  result: RateLimitResult,
  limit: number
): Response {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.resetAt.toString());

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    response.headers.set('Retry-After', retryAfter.toString());
  }

  return response;
}

export function _resetForTesting(): void {
  rateLimitMap.clear();
}
