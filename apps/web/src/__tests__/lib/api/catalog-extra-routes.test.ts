import { GET as getCatalogStats } from '@/app/api/catalog/stats/route';
import { GET as discoverGet, POST as discoverPost } from '@/app/api/catalog/discover/route';
import { NextRequest } from 'next/server';

// ── catalog/stats ─────────────────────────────────────────────────────────────
jest.mock('@/lib/services/catalog.service', () => ({
  getCatalogStats: jest.fn(),
}));

// ── catalog/discover ──────────────────────────────────────────────────────────
jest.mock('@/lib/api', () => {
  return {
    verifySession: jest.fn(),
    successResponse: jest.fn(
      (data: unknown) => new Response(JSON.stringify({ data }), { status: 200 })
    ),
    createdResponse: jest.fn(
      (data: unknown) => new Response(JSON.stringify({ data }), { status: 201 })
    ),
    errorResponse: jest.fn(
      (msg: string, status: number) =>
        new Response(JSON.stringify({ error: { message: msg, status } }), { status })
    ),
    apiErrorResponse: jest.fn(
      (err: { message: string; statusCode: number }) =>
        new Response(JSON.stringify({ error: { message: err.message } }), {
          status: err.statusCode,
        })
    ),
  };
});
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res: Response) => res),
}));
jest.mock('@/lib/services/catalog-discovery.service', () => ({
  discoverCatalogFiles: jest.fn(),
  importDiscoveredRepos: jest.fn(),
}));

import { getCatalogStats as mockGetStatsImpl } from '@/lib/services/catalog.service';
import { verifySession } from '@/lib/api';
import { checkRateLimit } from '@/lib/api/rate-limit';
import {
  discoverCatalogFiles,
  importDiscoveredRepos,
} from '@/lib/services/catalog-discovery.service';

const mockGetCatalogStats = mockGetStatsImpl as jest.MockedFunction<typeof mockGetStatsImpl>;
const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockDiscoverFiles = discoverCatalogFiles as jest.MockedFunction<typeof discoverCatalogFiles>;
const mockImportRepos = importDiscoveredRepos as jest.MockedFunction<typeof importDiscoveredRepos>;

const RATE_OK = { allowed: true, remaining: 9, resetAt: Date.now() + 60000 };
const USER = { id: 'u1', email: 'user@test.com' };
const STATS = { total: 42, by_type: { service: 30, library: 12 } };
const DISCOVERED = { repos: [{ name: 'api', url: 'https://github.com/org/api' }] };
const IMPORTED = { imported: 1, skipped: 0 };

function makeDiscoverRequest(method: string, body?: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/catalog/discover', {
    method,
    ...(body
      ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : {}),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCatalogStats.mockResolvedValue(STATS as never);
  mockCheckRateLimit.mockResolvedValue(RATE_OK as never);
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockDiscoverFiles.mockResolvedValue(DISCOVERED as never);
  mockImportRepos.mockResolvedValue(IMPORTED as never);
});

// ── GET /api/catalog/stats ────────────────────────────────────────────────────
describe('GET /api/catalog/stats', () => {
  it('returns catalog statistics', async () => {
    const res = await getCatalogStats();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(STATS);
    expect(mockGetCatalogStats).toHaveBeenCalled();
  });

  it('propagates service errors (no try/catch — will throw)', async () => {
    mockGetCatalogStats.mockRejectedValue(new Error('DB error'));

    await expect(getCatalogStats()).rejects.toThrow('DB error');
  });
});

// ── GET /api/catalog/discover ─────────────────────────────────────────────────
describe('GET /api/catalog/discover', () => {
  it('returns discovered catalog files', async () => {
    const res = await discoverGet(makeDiscoverRequest('GET'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockDiscoverFiles).toHaveBeenCalledWith('u1');
    expect(body.data).toEqual(DISCOVERED);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now(),
    } as never);

    const res = await discoverGet(makeDiscoverRequest('GET'));
    expect(res.status).toBe(429);
  });

  it('returns 500 on unexpected error', async () => {
    mockDiscoverFiles.mockRejectedValue(new Error('GitHub API failed'));

    const res = await discoverGet(makeDiscoverRequest('GET'));
    expect(res.status).toBe(500);
  });
});

// ── POST /api/catalog/discover ────────────────────────────────────────────────
describe('POST /api/catalog/discover', () => {
  it('imports repos successfully', async () => {
    const repos = [{ name: 'api', url: 'https://github.com/org/api' }];
    const res = await discoverPost(makeDiscoverRequest('POST', { repos }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(mockImportRepos).toHaveBeenCalledWith('u1', repos);
    expect(body.data).toEqual(IMPORTED);
  });

  it('returns 400 when repos is empty', async () => {
    const res = await discoverPost(makeDiscoverRequest('POST', { repos: [] }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when repos is not an array', async () => {
    const res = await discoverPost(makeDiscoverRequest('POST', { repos: 'not-array' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when repos exceeds 50 limit', async () => {
    const repos = Array.from({ length: 51 }, (_, i) => ({ name: `repo-${i}` }));
    const res = await discoverPost(makeDiscoverRequest('POST', { repos }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/Maximum 50 repos/i);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now(),
    } as never);

    const res = await discoverPost(makeDiscoverRequest('POST', { repos: [{ name: 'x' }] }));
    expect(res.status).toBe(429);
  });
});
