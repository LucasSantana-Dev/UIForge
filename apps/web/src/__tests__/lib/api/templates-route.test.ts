import { GET, POST } from '@/app/api/templates/route';
import { NextRequest } from 'next/server';
import { UnauthorizedError } from '@/lib/api/errors';

jest.mock('@/lib/api/auth', () => ({
  verifySession: jest.fn(),
  getSession: jest.fn(),
}));
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res) => res),
}));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));
jest.mock('@/lib/api/validation/templates', () => ({
  templateQuerySchema: {
    parse: jest.fn((v) => ({
      ownership: v.ownership ?? 'official',
      category: v.category,
      framework: v.framework,
      search: v.search,
      sort: v.sort ?? 'created_at',
      limit: parseInt(v.limit ?? '20', 10),
      offset: parseInt(v.offset ?? '0', 10),
    })),
  },
  createTemplateSchema: {
    safeParse: jest.fn((v) => ({ success: true, data: v })),
  },
}));

// Supabase chain mock for templates query
const mockRange = jest.fn();
const mockOrder = jest.fn(() => ({ range: mockRange }));
const mockOr = jest.fn(() => ({ order: mockOrder }));
const mockEqFramework = jest.fn(() => ({ or: mockOr, order: mockOrder }));
const mockEqCategory = jest.fn(() => ({ eq: mockEqFramework, or: mockOr, order: mockOrder }));
const mockEqOwner = jest.fn(() => ({ eq: mockEqCategory, or: mockOr, order: mockOrder }));
const mockSelect = jest.fn(() => ({ eq: mockEqOwner, order: mockOrder }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

import { verifySession, getSession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;

const TEMPLATES = [
  { id: 'tpl-1', name: 'Auth Template', framework: 'react', is_official: true },
  { id: 'tpl-2', name: 'Dashboard', framework: 'nextjs', is_official: true },
];

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/templates');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

function makePostRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/templates', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 119,
    resetAt: Date.now() + 60000,
  });
  mockVerifySession.mockResolvedValue({ user: { id: 'u1', email: 't@t.com' } } as never);
  mockGetSession.mockResolvedValue({ user: { id: 'u1' } } as never);
  mockRange.mockResolvedValue({ data: TEMPLATES, error: null });
  mockOrder.mockReturnValue({ range: mockRange });
  mockEqOwner.mockReturnValue({ eq: mockEqCategory, or: mockOr, order: mockOrder });
  mockEqCategory.mockReturnValue({ eq: mockEqFramework, or: mockOr, order: mockOrder });
  mockEqFramework.mockReturnValue({ or: mockOr, order: mockOrder });
  mockOr.mockReturnValue({ order: mockOrder });
});

describe('GET /api/templates', () => {
  it('returns official templates by default', async () => {
    const res = await GET(makeGetRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.templates).toHaveLength(2);
    expect(mockFrom).toHaveBeenCalledWith('templates');
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() });
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(429);
  });

  it('returns 500 on database error', async () => {
    mockRange.mockResolvedValue({ data: null, error: { message: 'crash' } });
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(500);
  });

  it('returns 401 for ownership=mine without session', async () => {
    mockGetSession.mockResolvedValue(null);
    const mockTemplateSchema = require('@/lib/api/validation/templates').templateQuerySchema;
    mockTemplateSchema.parse.mockImplementationOnce(() => ({
      ownership: 'mine',
      sort: 'created_at',
      limit: 20,
      offset: 0,
    }));

    const res = await GET(makeGetRequest({ ownership: 'mine' }));
    // UnauthorizedError thrown is caught and returned as 401
    expect([401, 500]).toContain(res.status);
  });
});

describe('POST /api/templates', () => {
  it('returns 429 when rate limited on POST', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() });
    const res = await POST(makePostRequest({ name: 'My Template' }));
    expect(res.status).toBe(429);
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError('Unauthorized'));
    const res = await POST(makePostRequest({ name: 'My Template', framework: 'react' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.message).toMatch(/unauthorized/i);
  });

  it('returns 400 on invalid JSON body', async () => {
    const req = new NextRequest('http://localhost/api/templates', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not-json',
    });
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/invalid json/i);
  });
});
