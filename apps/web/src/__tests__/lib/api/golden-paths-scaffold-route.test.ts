import { POST } from '@/app/api/golden-paths/scaffold/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res) => res),
}));
jest.mock('@/lib/api/response', () => ({
  createdResponse: jest.fn((data) => new Response(JSON.stringify(data), { status: 201 })),
  errorResponse: jest.fn(
    (msg, status) => new Response(JSON.stringify({ error: { message: msg, status } }), { status })
  ),
}));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));
jest.mock('@/lib/repositories/golden-path.repo', () => ({
  findGoldenPathById: jest.fn(),
}));

const mockProjectInsertSelectSingle = jest.fn();
const mockProjectInsertSelect = jest.fn(() => ({ single: mockProjectInsertSelectSingle }));
const mockProjectInsert = jest.fn(() => ({ select: mockProjectInsertSelect }));
const mockCatalogInsert = jest.fn().mockResolvedValue({ error: null });
const mockGoldenPathUpdateEq = jest.fn().mockResolvedValue({ error: null });
const mockGoldenPathUpdate = jest.fn(() => ({ eq: mockGoldenPathUpdateEq }));

const mockFrom = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { findGoldenPathById } from '@/lib/repositories/golden-path.repo';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockFindGoldenPathById = findGoldenPathById as jest.MockedFunction<typeof findGoldenPathById>;

const RATE_OK = { allowed: true, remaining: 9, resetAt: Date.now() + 60000 };
const USER = { id: 'u1', email: 'user@test.com' };
const GOLDEN_PATH = {
  id: 'gp1',
  name: 'nextjs-starter',
  display_name: 'Next.js Starter',
  framework: 'nextjs',
  catalog_type: 'service',
  catalog_lifecycle: 'ga',
  tags: ['react', 'typescript'],
  parameters: [],
  usage_count: 5,
};
const CREATED_PROJECT = {
  id: 'new-p1',
  name: 'My App',
  framework: 'nextjs',
  user_id: 'u1',
};

const VALID_BODY = {
  golden_path_id: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
  project_name: 'My App',
};

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/golden-paths/scaffold', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckRateLimit.mockResolvedValue(RATE_OK as never);
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockFindGoldenPathById.mockResolvedValue(GOLDEN_PATH as never);
  mockProjectInsertSelectSingle.mockResolvedValue({ data: CREATED_PROJECT, error: null });

  mockFrom.mockImplementation((table: string) => {
    if (table === 'projects') return { insert: mockProjectInsert };
    if (table === 'catalog_entries') return { insert: mockCatalogInsert };
    if (table === 'golden_path_templates') return { update: mockGoldenPathUpdate };
    return {};
  });
});

describe('POST /api/golden-paths/scaffold', () => {
  it('scaffolds a project from a golden path', async () => {
    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(mockFindGoldenPathById).toHaveBeenCalledWith(VALID_BODY.golden_path_id);
    expect(mockProjectInsert).toHaveBeenCalled();
    expect(body.data.project).toMatchObject({ name: 'My App' });
    expect(body.data.golden_path).toBe('Next.js Starter');
    expect(body.data.catalog_registered).toBe(true);
  });

  it('increments usage_count on golden path', async () => {
    await POST(makeRequest(VALID_BODY));
    expect(mockGoldenPathUpdateEq).toHaveBeenCalledWith('id', VALID_BODY.golden_path_id);
  });

  it('returns 404 when golden path not found', async () => {
    mockFindGoldenPathById.mockResolvedValue(null);

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.message).toMatch(/Golden path not found/i);
  });

  it('returns 400 for missing golden_path_id', async () => {
    const res = await POST(makeRequest({ project_name: 'My App' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing project_name', async () => {
    const res = await POST(makeRequest({ golden_path_id: 'a1b2c3d4-e5f6-4789-8abc-def012345678' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/golden-paths/scaffold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now(),
    } as never);

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(429);
  });

  it('returns 500 on project creation failure', async () => {
    mockProjectInsertSelectSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(500);
  });

  it('still succeeds when catalog registration fails', async () => {
    mockCatalogInsert.mockResolvedValue({ error: { message: 'Catalog error' } });

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.catalog_registered).toBe(false);
  });

  it('resolves parameters from golden path definitions', async () => {
    const pathWithParams = {
      ...GOLDEN_PATH,
      parameters: [
        {
          name: 'database',
          type: 'select',
          options: ['postgres', 'mysql'],
          required: true,
          default: 'postgres',
        },
      ],
    };
    mockFindGoldenPathById.mockResolvedValue(pathWithParams as never);

    const res = await POST(makeRequest({ ...VALID_BODY, parameters: { database: 'postgres' } }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.parameters.database).toBe('postgres');
  });

  it('returns 400 when required parameter is missing', async () => {
    const pathWithParams = {
      ...GOLDEN_PATH,
      parameters: [{ name: 'env', type: 'string', required: true }],
    };
    mockFindGoldenPathById.mockResolvedValue(pathWithParams as never);

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(400);
  });
});
