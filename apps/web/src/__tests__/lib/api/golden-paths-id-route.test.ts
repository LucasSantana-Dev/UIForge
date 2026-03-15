import { GET, PATCH, DELETE } from '@/app/api/golden-paths/[id]/route';
import { NextRequest } from 'next/server';
import { NotFoundError, ForbiddenError } from '@/lib/api/errors';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res) => res),
}));
jest.mock('@/lib/api/response', () => ({
  successResponse: jest.fn((data) => new Response(JSON.stringify({ data }), { status: 200 })),
  errorResponse: jest.fn(
    (msg, status) => new Response(JSON.stringify({ error: { message: msg, status } }), { status })
  ),
}));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));
jest.mock('@/lib/services/golden-path.service', () => ({
  getGoldenPathDetail: jest.fn(),
  verifyGoldenPathOwnership: jest.fn(),
}));
jest.mock('@/lib/repositories/golden-path.repo', () => ({
  updateGoldenPath: jest.fn(),
  deleteGoldenPath: jest.fn(),
}));
jest.mock('@/lib/api/validation/golden-path', () => ({
  updateGoldenPathSchema: {
    safeParse: jest.fn((v) =>
      v && v.display_name
        ? { success: true, data: { display_name: v.display_name } }
        : { success: false, error: { issues: [] } }
    ),
  },
}));

import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { getGoldenPathDetail, verifyGoldenPathOwnership } from '@/lib/services/golden-path.service';
import { updateGoldenPath, deleteGoldenPath } from '@/lib/repositories/golden-path.repo';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockGetGoldenPathDetail = getGoldenPathDetail as jest.MockedFunction<
  typeof getGoldenPathDetail
>;
const mockVerifyGoldenPathOwnership = verifyGoldenPathOwnership as jest.MockedFunction<
  typeof verifyGoldenPathOwnership
>;
const mockUpdateGoldenPath = updateGoldenPath as jest.MockedFunction<typeof updateGoldenPath>;
const mockDeleteGoldenPath = deleteGoldenPath as jest.MockedFunction<typeof deleteGoldenPath>;

const RATE_OK = { allowed: true, remaining: 119, resetAt: Date.now() + 60000 };
const USER = { id: 'u1', email: 'user@test.com' };
const GOLDEN_PATH = {
  id: 'gp1',
  name: 'nextjs-starter',
  display_name: 'Next.js Starter',
  owner_id: 'u1',
};

function makeRequest(method: string, body?: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/golden-paths/gp1', {
    method,
    ...(body
      ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : {}),
  });
}

function makeParams(id = 'gp1') {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckRateLimit.mockResolvedValue(RATE_OK as never);
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockGetGoldenPathDetail.mockResolvedValue(GOLDEN_PATH as never);
  mockVerifyGoldenPathOwnership.mockResolvedValue(undefined);
  mockUpdateGoldenPath.mockResolvedValue({ ...GOLDEN_PATH, display_name: 'Updated' } as never);
  mockDeleteGoldenPath.mockResolvedValue(undefined);
});

describe('GET /api/golden-paths/[id]', () => {
  it('returns golden path detail', async () => {
    const res = await GET(makeRequest('GET'), makeParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockGetGoldenPathDetail).toHaveBeenCalledWith('gp1');
    expect(body.data).toMatchObject({ id: 'gp1' });
  });

  it('returns 404 when not found', async () => {
    mockGetGoldenPathDetail.mockRejectedValue(new NotFoundError('Not found'));

    const res = await GET(makeRequest('GET'), makeParams());
    expect(res.status).toBe(404);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now(),
    } as never);

    const res = await GET(makeRequest('GET'), makeParams());
    expect(res.status).toBe(429);
  });

  it('returns 500 on unexpected error', async () => {
    mockGetGoldenPathDetail.mockRejectedValue(new Error('DB error'));

    const res = await GET(makeRequest('GET'), makeParams());
    expect(res.status).toBe(500);
  });
});

describe('PATCH /api/golden-paths/[id]', () => {
  it('updates golden path for owner', async () => {
    const res = await PATCH(makeRequest('PATCH', { display_name: 'Updated' }), makeParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockVerifyGoldenPathOwnership).toHaveBeenCalledWith('gp1', USER.id);
    expect(mockUpdateGoldenPath).toHaveBeenCalledWith('gp1', { display_name: 'Updated' });
    expect(body.data).toMatchObject({ display_name: 'Updated' });
  });

  it('returns 400 for invalid body', async () => {
    const res = await PATCH(makeRequest('PATCH', {}), makeParams());
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/golden-paths/gp1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    const res = await PATCH(req, makeParams());
    expect(res.status).toBe(400);
  });

  it('returns 403 when not owner', async () => {
    mockVerifyGoldenPathOwnership.mockRejectedValue(new ForbiddenError('Not yours'));

    const res = await PATCH(makeRequest('PATCH', { display_name: 'X' }), makeParams());
    expect(res.status).toBe(403);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now(),
    } as never);

    const res = await PATCH(makeRequest('PATCH', { display_name: 'X' }), makeParams());
    expect(res.status).toBe(429);
  });
});

describe('DELETE /api/golden-paths/[id]', () => {
  it('deletes golden path for owner', async () => {
    const res = await DELETE(makeRequest('DELETE'), makeParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockVerifyGoldenPathOwnership).toHaveBeenCalledWith('gp1', USER.id);
    expect(mockDeleteGoldenPath).toHaveBeenCalledWith('gp1');
    expect(body.data.deleted).toBe(true);
  });

  it('returns 404 when not found', async () => {
    mockVerifyGoldenPathOwnership.mockRejectedValue(new NotFoundError('Not found'));

    const res = await DELETE(makeRequest('DELETE'), makeParams());
    expect(res.status).toBe(404);
  });

  it('returns 403 when not owner', async () => {
    mockVerifyGoldenPathOwnership.mockRejectedValue(new ForbiddenError('Not yours'));

    const res = await DELETE(makeRequest('DELETE'), makeParams());
    expect(res.status).toBe(403);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now(),
    } as never);

    const res = await DELETE(makeRequest('DELETE'), makeParams());
    expect(res.status).toBe(429);
  });
});
