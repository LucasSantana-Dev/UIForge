import { GET, DELETE } from '@/app/api/templates/[id]/route';
import { NextRequest } from 'next/server';
import { ForbiddenError } from '@/lib/api/errors';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res) => res),
}));
jest.mock('@/lib/api/response', () => ({
  successResponse: jest.fn((data) => new Response(JSON.stringify({ data }), { status: 200 })),
  noContentResponse: jest.fn(() => new Response(null, { status: 204 })),
  errorResponse: jest.fn(
    (msg, status) => new Response(JSON.stringify({ error: { message: msg, status } }), { status })
  ),
}));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));

const mockGetSingle = jest.fn();
const mockGetEq = jest.fn(() => ({ single: mockGetSingle }));
const mockGetSelect = jest.fn(() => ({ eq: mockGetEq }));

const mockDeleteEq = jest.fn().mockResolvedValue({ error: null });
const mockDeleteFrom = jest.fn(() => ({ eq: mockDeleteEq }));

const mockFetchSingle = jest.fn();
const mockFetchEq = jest.fn(() => ({ single: mockFetchSingle }));
const mockFetchSelect = jest.fn(() => ({ eq: mockFetchEq }));

const mockFrom = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;

const RATE_OK = { allowed: true, remaining: 119, resetAt: Date.now() + 60000 };
const USER = { id: 'u1', email: 'user@test.com' };
const TEMPLATE = { id: 't1', name: 'Button', created_by: 'u1', framework: 'react' };

function makeRequest(method: string) {
  return new NextRequest(`http://localhost/api/templates/t1`, { method });
}

function makeContext(id = 't1') {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckRateLimit.mockResolvedValue(RATE_OK as never);
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockGetSingle.mockResolvedValue({ data: TEMPLATE, error: null });
  mockFetchSingle.mockResolvedValue({ data: TEMPLATE, error: null });

  mockFrom.mockImplementation((table: string) => {
    if (table === 'templates') {
      return {
        select: (cols: string) => {
          if (cols === '*') return { eq: mockGetEq };
          return { eq: mockFetchEq };
        },
        delete: () => ({ eq: mockDeleteEq }),
      };
    }
    return {};
  });
});

describe('GET /api/templates/[id]', () => {
  it('returns template for valid id', async () => {
    mockFrom.mockReturnValue({ select: mockGetSelect });
    const res = await GET(makeRequest('GET'), makeContext());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.template).toMatchObject({ id: 't1' });
  });

  it('returns 404 when template not found', async () => {
    mockGetSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } });
    mockFrom.mockReturnValue({ select: mockGetSelect });

    const res = await GET(makeRequest('GET'), makeContext());
    expect(res.status).toBe(404);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now(),
    } as never);

    const res = await GET(makeRequest('GET'), makeContext());
    expect(res.status).toBe(429);
  });
});

describe('DELETE /api/templates/[id]', () => {
  it('deletes template owned by user', async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: jest.fn(() => ({ single: mockFetchSingle })) }),
      delete: () => ({ eq: mockDeleteEq }),
    }));

    const res = await DELETE(makeRequest('DELETE'), makeContext());
    expect(res.status).toBe(204);
    expect(mockDeleteEq).toHaveBeenCalledWith('id', 't1');
  });

  it('returns 404 when template not found', async () => {
    mockFetchSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } });
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: jest.fn(() => ({ single: mockFetchSingle })) }),
      delete: () => ({ eq: mockDeleteEq }),
    }));

    const res = await DELETE(makeRequest('DELETE'), makeContext());
    expect(res.status).toBe(404);
  });

  it('returns 403 when user does not own template', async () => {
    mockFetchSingle.mockResolvedValue({
      data: { ...TEMPLATE, created_by: 'other-user' },
      error: null,
    });
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: jest.fn(() => ({ single: mockFetchSingle })) }),
      delete: () => ({ eq: mockDeleteEq }),
    }));

    const res = await DELETE(makeRequest('DELETE'), makeContext());
    expect(res.status).toBe(403);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now(),
    } as never);

    const res = await DELETE(makeRequest('DELETE'), makeContext());
    expect(res.status).toBe(429);
  });

  it('returns 500 on db delete error', async () => {
    mockDeleteEq.mockResolvedValue({ error: { message: 'Delete failed' } });
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: jest.fn(() => ({ single: mockFetchSingle })) }),
      delete: () => ({ eq: mockDeleteEq }),
    }));

    const res = await DELETE(makeRequest('DELETE'), makeContext());
    expect(res.status).toBe(500);
  });
});
