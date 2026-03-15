import { GET } from '@/app/api/suggestions/route';
import { NextRequest } from 'next/server';
import { UnauthorizedError } from '@/lib/api/errors';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res) => res),
}));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));

// Two parallel table queries: generations + templates
function tableChain(data: unknown[]) {
  const resolved = Promise.resolve({ data, error: null });
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn(() => resolved),
  };
}

const mockFrom = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/suggestions');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

const HISTORY = [
  { prompt: 'A login button', framework: 'react', created_at: '2026-03-01T00:00:00Z' },
];
const TEMPLATES = [
  {
    name: 'Auth Template',
    description: 'Login form template',
    framework: 'react',
    created_at: '2026-03-01T00:00:00Z',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifySession.mockResolvedValue({ user: { id: 'u1', email: 't@t.com' } } as never);
  mockCheckRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 59,
    resetAt: Date.now() + 60000,
  });
  mockFrom.mockImplementation((table: string) => {
    if (table === 'generations') return tableChain(HISTORY);
    if (table === 'templates') return tableChain(TEMPLATES);
    return tableChain([]);
  });
});

describe('GET /api/suggestions', () => {
  it('returns combined history and template suggestions', async () => {
    const res = await GET(makeRequest({ q: 'login' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.suggestions).toHaveLength(2);
    const sources = body.data.suggestions.map((s: { source: string }) => s.source);
    expect(sources).toContain('history');
    expect(sources).toContain('template');
  });

  it('returns empty for query shorter than 3 chars', async () => {
    const res = await GET(makeRequest({ q: 'lo' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.suggestions).toHaveLength(0);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid framework', async () => {
    const res = await GET(makeRequest({ q: 'login', framework: 'laravel' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/invalid framework/i);
  });

  it('filters by framework when provided', async () => {
    // Only history items with matching framework should appear
    const res = await GET(makeRequest({ q: 'login', framework: 'vue' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    // HISTORY has react, TEMPLATES has react — both filtered out for vue
    expect(body.data.suggestions).toHaveLength(0);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 5000,
    });
    const res = await GET(makeRequest({ q: 'login' }));
    expect(res.status).toBe(429);
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError('Unauthorized'));
    const res = await GET(makeRequest({ q: 'login' }));
    const body = await res.json();
    expect(res.status).toBe(401);
    expect(body.error.message).toMatch(/unauthorized/i);
  });

  it('returns 500 on unexpected error', async () => {
    mockFrom.mockImplementation(() => {
      throw new Error('crash');
    });
    const res = await GET(makeRequest({ q: 'login' }));
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error.message).toMatch(/internal server error/i);
  });
});
