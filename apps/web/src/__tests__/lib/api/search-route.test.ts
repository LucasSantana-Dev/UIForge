import { GET } from '@/app/api/search/route';
import { NextRequest } from 'next/server';
import { UnauthorizedError } from '@/lib/api/errors';

// Each table query returns a chainable object ending in a resolved value
function makeTableChain(data: unknown[] | null) {
  const resolved = Promise.resolve({ data, error: null });
  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn(() => chain);
  chain.eq = jest.fn(() => chain);
  chain.or = jest.fn(() => chain);
  chain.limit = jest.fn(() => resolved);
  return chain;
}

const mockFrom = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      from: mockFrom,
    })
  ),
}));

jest.mock('@/lib/api/auth', () => ({
  verifySession: jest.fn(),
}));

jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res) => res),
}));

jest.mock('@/lib/sentry/server', () => ({
  captureServerError: jest.fn(),
}));

import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;

function makeRequest(q: string) {
  return new NextRequest(`http://localhost/api/search?q=${encodeURIComponent(q)}`);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifySession.mockResolvedValue({ user: { id: 'u1', email: 'test@test.com' } } as never);
  mockCheckRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 29,
    resetAt: Date.now() + 60000,
  });

  // Default: each table returns one matching item
  mockFrom.mockImplementation((table: string) => {
    const items: Record<string, unknown[]> = {
      projects: [{ id: 'p1', name: 'My Project', description: 'desc', framework: 'react' }],
      catalog_entries: [
        {
          id: 'c1',
          name: 'svc',
          display_name: 'Service',
          type: 'service',
          lifecycle: 'production',
        },
      ],
      golden_path_templates: [
        {
          id: 'g1',
          name: 'gp1',
          display_name: 'Golden Path',
          description: 'tpl',
          framework: 'nextjs',
        },
      ],
      templates: [{ id: 't1', name: 'Template', description: 'desc', category: 'ui' }],
      plugins: [{ slug: 'pl1', name: 'Plugin', description: 'desc', category: 'governance' }],
    };
    return makeTableChain(items[table] ?? []);
  });
});

describe('GET /api/search', () => {
  it('returns results from all 5 sources', async () => {
    const res = await GET(makeRequest('button'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.results).toHaveLength(5);

    const types = body.results.map((r: { type: string }) => r.type);
    expect(types).toContain('project');
    expect(types).toContain('catalog');
    expect(types).toContain('golden-path');
    expect(types).toContain('template');
    expect(types).toContain('plugin');
  });

  it('returns empty results for short query (< 2 chars)', async () => {
    const res = await GET(makeRequest('a'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.results).toHaveLength(0);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns empty results when all tables return nothing', async () => {
    mockFrom.mockImplementation(() => makeTableChain([]));
    const res = await GET(makeRequest('nomatch'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.results).toHaveLength(0);
  });

  it('returns 401 when user is not authenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError('Unauthorized'));
    const res = await GET(makeRequest('button'));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.message).toMatch(/unauthorized/i);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 10000,
    });
    const res = await GET(makeRequest('button'));
    expect(res.status).toBe(429);
  });

  it('returns 500 on unexpected error', async () => {
    mockFrom.mockImplementation(() => {
      throw new Error('db crash');
    });
    const res = await GET(makeRequest('button'));
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error.message).toMatch(/internal server error/i);
  });
});
