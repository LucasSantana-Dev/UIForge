import { GET, PATCH, DELETE } from '@/app/api/projects/[id]/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/errors', () => {
  class NotFoundError extends Error {
    statusCode = 404;
    constructor(msg: string) {
      super(msg);
      this.name = 'NotFoundError';
    }
  }
  class ForbiddenError extends Error {
    statusCode = 403;
    constructor(msg: string) {
      super(msg);
      this.name = 'ForbiddenError';
    }
  }
  return {
    NotFoundError,
    ForbiddenError,
    UnauthorizedError: class extends Error {
      statusCode = 401;
    },
  };
});

jest.mock('@/lib/api', () => {
  class NotFoundError extends Error {
    statusCode = 404;
    constructor(msg: string) {
      super(msg);
      this.name = 'NotFoundError';
    }
  }
  class ForbiddenError extends Error {
    statusCode = 403;
    constructor(msg: string) {
      super(msg);
      this.name = 'ForbiddenError';
    }
  }
  return {
    verifySession: jest.fn(),
    successResponse: jest.fn(
      (data: unknown) => new Response(JSON.stringify({ data }), { status: 200 })
    ),
    noContentResponse: jest.fn(() => new Response(null, { status: 204 })),
    errorResponse: jest.fn(
      (msg: string, status: number) =>
        new Response(JSON.stringify({ error: { message: msg, status } }), { status })
    ),
    apiErrorResponse: jest.fn(
      (err: { message: string; statusCode: number }) =>
        new Response(JSON.stringify({ error: { message: err.message, status: err.statusCode } }), {
          status: err.statusCode,
        })
    ),
    updateProjectSchema: {
      safeParse: jest.fn((v: Record<string, unknown>) =>
        v && v.name
          ? { success: true, data: { name: v.name, description: v.description } }
          : { success: false, error: { issues: [{ message: 'Name required' }] } }
      ),
    },
    NotFoundError,
    ForbiddenError,
  };
});
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res) => res),
}));
jest.mock('@/lib/services/project.service', () => ({
  verifyProjectOwnership: jest.fn(),
}));

const mockSingle = jest.fn();
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockSelectEq = jest.fn(() => ({ eq: mockEq }));
const mockUpdateEqSelectSingle = jest.fn();
const mockUpdateEqSelect = jest.fn(() => ({ single: mockUpdateEqSelectSingle }));
const mockUpdateEq = jest.fn(() => ({ select: mockUpdateEqSelect }));
const mockUpdate = jest.fn(() => ({ eq: mockUpdateEq }));
const mockDeleteEq = jest.fn().mockResolvedValue({ error: null });
const mockDelete = jest.fn(() => ({ eq: mockDeleteEq }));
const mockFrom = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

import { verifySession } from '@/lib/api';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { verifyProjectOwnership } from '@/lib/services/project.service';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockVerifyProjectOwnership = verifyProjectOwnership as jest.MockedFunction<
  typeof verifyProjectOwnership
>;

class ForbiddenError extends Error {
  statusCode = 403;
  constructor(msg: string) {
    super(msg);
    this.name = 'ForbiddenError';
  }
}

const RATE_OK = { allowed: true, remaining: 119, resetAt: Date.now() + 60000 };
const PROJECT = { id: 'p1', name: 'My Project', user_id: 'u1', is_public: false };
const USER = { id: 'u1', email: 'user@test.com' };

function makeRequest(method: string, body?: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/projects/p1', {
    method,
    ...(body
      ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : {}),
  });
}

function makeParams(id = 'p1') {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckRateLimit.mockResolvedValue(RATE_OK as never);
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockVerifyProjectOwnership.mockResolvedValue(undefined);
  mockFrom.mockReturnValue({ select: mockSelectEq, update: mockUpdate, delete: mockDelete });
  mockSingle.mockResolvedValue({ data: PROJECT, error: null });
  mockUpdateEqSelectSingle.mockResolvedValue({
    data: { ...PROJECT, name: 'Updated' },
    error: null,
  });
});

describe('GET /api/projects/[id]', () => {
  it('returns the project for owner', async () => {
    const res = await GET(makeRequest('GET'), makeParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toMatchObject({ id: 'p1' });
  });

  it('returns public project to non-owner', async () => {
    mockVerifySession.mockResolvedValue({ user: { id: 'other', email: 'x@x.com' } } as never);
    mockSingle.mockResolvedValue({ data: { ...PROJECT, is_public: true }, error: null });

    const res = await GET(makeRequest('GET'), makeParams());
    expect(res.status).toBe(200);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30000,
    } as never);

    const res = await GET(makeRequest('GET'), makeParams());
    expect(res.status).toBe(429);
  });

  it('returns 404 when project not found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } });

    const res = await GET(makeRequest('GET'), makeParams());
    expect(res.status).toBe(404);
  });

  it('returns 403 when non-owner requests private project', async () => {
    mockVerifySession.mockResolvedValue({ user: { id: 'other', email: 'x@x.com' } } as never);
    mockSingle.mockResolvedValue({ data: { ...PROJECT, is_public: false }, error: null });

    const res = await GET(makeRequest('GET'), makeParams());
    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/projects/[id]', () => {
  it('updates project with valid body', async () => {
    const res = await PATCH(makeRequest('PATCH', { name: 'New Name' }), makeParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockVerifyProjectOwnership).toHaveBeenCalledWith('p1', 'u1');
    expect(body.data).toMatchObject({ name: 'Updated' });
  });

  it('returns 400 for invalid body', async () => {
    const res = await PATCH(makeRequest('PATCH', {}), makeParams());
    expect(res.status).toBe(400);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30000,
    } as never);

    const res = await PATCH(makeRequest('PATCH', { name: 'X' }), makeParams());
    expect(res.status).toBe(429);
  });

  it('returns 403 when verifyProjectOwnership throws ForbiddenError', async () => {
    mockVerifyProjectOwnership.mockRejectedValue(new ForbiddenError('Not yours'));

    const res = await PATCH(makeRequest('PATCH', { name: 'X' }), makeParams());
    expect(res.status).toBe(403);
  });

  it('returns 500 on db error', async () => {
    mockUpdateEqSelectSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const res = await PATCH(makeRequest('PATCH', { name: 'X' }), makeParams());
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/projects/[id]', () => {
  it('deletes project and returns 204', async () => {
    const res = await DELETE(makeRequest('DELETE'), makeParams());
    expect(res.status).toBe(204);
    expect(mockVerifyProjectOwnership).toHaveBeenCalledWith('p1', 'u1');
    expect(mockDeleteEq).toHaveBeenCalledWith('id', 'p1');
  });

  it('returns 403 when not owner', async () => {
    mockVerifyProjectOwnership.mockRejectedValue(new ForbiddenError('Not yours'));

    const res = await DELETE(makeRequest('DELETE'), makeParams());
    expect(res.status).toBe(403);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30000,
    } as never);

    const res = await DELETE(makeRequest('DELETE'), makeParams());
    expect(res.status).toBe(429);
  });

  it('returns 500 on db error', async () => {
    mockDeleteEq.mockResolvedValue({ error: { message: 'DB error' } });

    const res = await DELETE(makeRequest('DELETE'), makeParams());
    expect(res.status).toBe(500);
  });
});
