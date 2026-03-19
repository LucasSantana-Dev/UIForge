import { GET, POST } from '@/app/api/projects/route';
import { NextRequest } from 'next/server';
import { UnauthorizedError } from '@/lib/api/errors';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res) => res),
}));
jest.mock('@/lib/usage/limits', () => ({ checkProjectQuota: jest.fn() }));
jest.mock('@/lib/usage/tracker', () => ({
  incrementProjectCount: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/lib/services/project.service', () => ({ listProjects: jest.fn() }));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));
jest.mock('@/lib/api/validation/projects', () => ({
  createProjectSchema: {
    safeParse: jest.fn((v) =>
      v && v.name
        ? { success: true, data: { name: v.name, framework: v.framework || 'react' } }
        : { success: false, error: { issues: [{ message: 'Name is required' }] } }
    ),
  },
  projectQuerySchema: { parse: jest.fn((v) => ({ ...v, page: 1, limit: 20 })) },
}));

const mockSingle = jest.fn();
const mockInsertSelect = jest.fn(() => ({ single: mockSingle }));
const mockInsert = jest.fn(() => ({ select: mockInsertSelect }));
const mockFrom = jest.fn(() => ({ insert: mockInsert }));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { checkProjectQuota } from '@/lib/usage/limits';
import { listProjects } from '@/lib/services/project.service';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockCheckProjectQuota = checkProjectQuota as jest.MockedFunction<typeof checkProjectQuota>;
const mockListProjects = listProjects as jest.MockedFunction<typeof listProjects>;

const USER = { id: 'u1', email: 't@t.com' };
const PROJECTS = [
  { id: 'p1', name: 'Alpha', user_id: 'u1', framework: 'react' },
  { id: 'p2', name: 'Beta', user_id: 'u1', framework: 'nextjs' },
];

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/projects');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

function makePostRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/projects', {
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
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockListProjects.mockResolvedValue({
    data: PROJECTS,
    pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
  } as never);
  mockCheckProjectQuota.mockResolvedValue({ allowed: true, current: 1, limit: 5, remaining: 4 });
  mockSingle.mockResolvedValue({
    data: { id: 'p-new', name: 'New Project', user_id: 'u1' },
    error: null,
  });
});

describe('GET /api/projects', () => {
  it('returns project list with pagination', async () => {
    const res = await GET(makeGetRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.projects).toHaveLength(2);
    expect(body.data.pagination.total).toBe(2);
    expect(mockListProjects).toHaveBeenCalledWith('u1', expect.any(Object));
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() });
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(429);
    expect(mockListProjects).not.toHaveBeenCalled();
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError('Unauthorized'));
    const res = await GET(makeGetRequest());
    const body = await res.json();
    expect(res.status).toBe(401);
    expect(body.error.message).toMatch(/unauthorized/i);
  });

  it('returns 500 on service error', async () => {
    mockListProjects.mockRejectedValue(new Error('DB error'));
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(500);
  });
});

describe('POST /api/projects', () => {
  it('creates a project when quota allows', async () => {
    const res = await POST(makePostRequest({ name: 'New Project', framework: 'react' }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.id).toBe('p-new');
    expect(mockCheckProjectQuota).toHaveBeenCalledWith('u1');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Project', user_id: 'u1' })
    );
  });

  it('returns 429 when project quota exceeded', async () => {
    mockCheckProjectQuota.mockResolvedValue({ allowed: false, current: 5, limit: 5, remaining: 0 });
    const res = await POST(makePostRequest({ name: 'Overflow', framework: 'react' }));
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.error.message).toMatch(/quota exceeded/i);
  });

  it('returns 400 on invalid body (no name)', async () => {
    const res = await POST(makePostRequest({ framework: 'react' }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/invalid request body/i);
  });

  it('returns 500 when DB insert fails', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'constraint' } });
    const res = await POST(makePostRequest({ name: 'Crash Project', framework: 'react' }));
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error.message).toMatch(/failed to create project/i);
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError('Unauthorized'));
    const res = await POST(makePostRequest({ name: 'X', framework: 'react' }));

    expect(res.status).toBe(401);
  });
});
