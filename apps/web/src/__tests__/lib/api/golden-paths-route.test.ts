import { GET, POST } from '@/app/api/golden-paths/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res) => res),
}));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));
jest.mock('@/lib/services/golden-path.service', () => ({
  listGoldenPathTemplates: jest.fn(),
}));
jest.mock('@/lib/repositories/golden-path.repo', () => ({
  insertGoldenPath: jest.fn(),
}));
jest.mock('@/lib/api/validation/golden-path', () => ({
  goldenPathQuerySchema: {
    parse: jest.fn((v) => ({ framework: v.framework, limit: 20, offset: 0 })),
  },
  createGoldenPathSchema: {
    safeParse: jest.fn((v) => ({
      success: true,
      data: v,
    })),
  },
}));

import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { listGoldenPathTemplates } from '@/lib/services/golden-path.service';
import { insertGoldenPath } from '@/lib/repositories/golden-path.repo';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockListGoldenPathTemplates = listGoldenPathTemplates as jest.MockedFunction<
  typeof listGoldenPathTemplates
>;
const mockInsertGoldenPath = insertGoldenPath as jest.MockedFunction<typeof insertGoldenPath>;

const GP_DATA = {
  data: [{ id: 'gp1', name: 'nextjs-app', display_name: 'Next.js App', framework: 'nextjs' }],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/golden-paths');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

function makePostRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/golden-paths', {
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
  mockListGoldenPathTemplates.mockResolvedValue(GP_DATA as never);
  mockInsertGoldenPath.mockResolvedValue({ id: 'gp-new', name: 'my-path' } as never);
});

describe('GET /api/golden-paths', () => {
  it('returns golden path templates', async () => {
    const res = await GET(makeGetRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.data).toHaveLength(1);
    expect(body.data.data[0].id).toBe('gp1');
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() });
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(429);
  });

  it('returns 500 on service error', async () => {
    mockListGoldenPathTemplates.mockRejectedValue(new Error('DB error'));
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(500);
  });
});

describe('POST /api/golden-paths', () => {
  it('creates a golden path template', async () => {
    const res = await POST(
      makePostRequest({ name: 'my-path', display_name: 'My Path', framework: 'nextjs' })
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.data.id).toBe('gp-new');
    expect(mockInsertGoldenPath).toHaveBeenCalled();
  });

  it('returns 429 when rate limited on POST', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() });
    const res = await POST(makePostRequest({ name: 'x', display_name: 'X', framework: 'react' }));
    expect(res.status).toBe(429);
  });

  it('returns 400 on invalid JSON body', async () => {
    const req = new NextRequest('http://localhost/api/golden-paths', {
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
