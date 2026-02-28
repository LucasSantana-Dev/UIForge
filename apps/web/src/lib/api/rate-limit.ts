import { getSession } from './auth';
import { RateLimitError } from './errors';

export interface RouteLimitConfig {
  limit: number;
  window: number;
}

const ROUTE_LIMITS: Record<string, RouteLimitConfig> = {
  '/api/generate': { limit: 15, window: 60000 },
  '/api/generate/validate': { limit: 30, window: 60000 },
  '/api/generate/format': { limit: 30, window: 60000 },
  '/api/components': { limit: 60, window: 60000 },
  '/api/projects': { limit: 60, window: 60000 },
  '/api/templates': { limit: 60, window: 60000 },
  '/api/generations': { limit: 60, window: 60000 },
  '/api/auth': { limit: 10, window: 60000 },
  '/api/wireframe': { limit: 10, window: 60000 },
};

export function getRouteLimit(pathname: string): RouteLimitConfig {
  for (const [route, config] of Object.entries(ROUTE_LIMITS)) {
    if (pathname.startsWith(route)) return config;
  }
  return { limit: 100, window: 60000 };
}

interface RateLimitInfo {
  count: number;
  resetAt: number;
}

// In-memory storage — resets per worker instance on Cloudflare Workers.
// For production scale, migrate to Cloudflare KV or Supabase.
const rateLimitMap = new Map<string, RateLimitInfo>();

function cleanupExpired() {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, value] of rateLimitMap.entries()) {
    if (cleaned >= 10) break;
    if (now > value.resetAt) {
      rateLimitMap.delete(key);
      cleaned++;
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(
  request: Request,
  limit: number = 100,
  window: number = 60000
): Promise<RateLimitResult> {
  const session = await getSession();

  let identifier: string;
  if (session?.user.id) {
    identifier = session.user.id;
  } else {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');
    const acceptLang = request.headers.get('accept-language');

    if (ip) {
      identifier = `anon:${ip}:${userAgent?.substring(0, 50) || 'unknown'}:${acceptLang?.substring(0, 20) || 'unknown'}`;
    } else {
      identifier = 'anonymous:unknown';
    }
  }

  cleanupExpired();

  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);

  if (!userLimit || now > userLimit.resetAt) {
    const resetAt = now + window;
    rateLimitMap.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (userLimit.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: userLimit.resetAt };
  }

  userLimit.count++;
  return {
    allowed: true,
    remaining: limit - userLimit.count,
    resetAt: userLimit.resetAt,
  };
}

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
