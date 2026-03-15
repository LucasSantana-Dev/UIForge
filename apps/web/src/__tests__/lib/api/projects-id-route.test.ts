import { GET, PATCH, DELETE } from '@/app/api/projects/[id]/route';
import { NextRequest } from 'next/server';
import { ForbiddenError } from '@/lib/api/errors';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res) => res),
}));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));
jest.mock('@/lib/services/project.service', () => ({
  verifyProjectOwnership: jest.fn(),
}));
jest.mock('@/lib/api/validation/projects', () => ({
  updateProjectSchema: {
    safeParse: jest.fn((v) =>
      v && Object.keys(v).length > 0
        ? { success: true, data: v }
        : { success: false, error: { issues: [{ message: 'No fields to update' }] } }
    ),
  },
}));

const mockSingle = jest.fn();
const mockUpdateSingle = jest.fn();
const mockDeleteEq = jest.fn();

const mockFrom = jest.fn((table: string) => {
  if (table === 'projects') {
    return {
      select: jest.fn(() => ({ eq: jest.fn(() => ({ single: mockSingle })) })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({ single: mockUpdateSingle })),
        })),
      })),
      delete: jest.fn(() => ({ eq: mockDeleteEq })),
    };
  }
  return {};
});

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { verifyProjectOwnership } from '@/lib/services/project.service';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockVerifyProjectOwnership = verifyProjectOwnership as jest.MockedFunction<
  typeof verifyProjectOwnership
>;

const USER = { id: 'u1', email: 't@t.com' };
const PROJECT = {
  id: 'proj-1',
  name: 'Alpha',
  user_id: 'u1',
  is_public: false,
  framework: 'react',
};

function makeParams(id = 'proj-1') {
  return { params: Promise.resolve({ id }) };
}

function makeRequest(method = 'GET', body?: Record<string, unknown>) {
  return new NextRequest(`http://localhost/api/projects/${makeParams().params}`, {
    method,
    ...(body && { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
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
  mockSingle.mockResolvedValue({ data: PROJECT, error: null });
  mockUpdateSingle.mockResolvedValue({ data: { ...PROJECT, name: 'Updated' }, error: null });
  mockDeleteEq.mockResolvedValue({ error: null });
  mockVerifyProjectOwnership.mockResolvedValue(PROJECT as never);
});

describe('GET /api/projects/[id]', () => {
  it('returns owned project', async () => {
    const res = await GET(makeRequest(), makeParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.id).toBe('proj-1');
    expect(body.data.name).toBe('Alpha');
  });

  it('returns public project for different user', async () => {
    mockSingle.mockResolvedValue({
      data: { ...PROJECT, is_public: true, user_id: 'other' },
      error: null,
    });
    const res = await GET(makeRequest(), makeParams());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.id).toBe('proj-1');
  });

  it('returns 403 for private project owned by another user', async () => {
    mockSingle.mockResolvedValue({
      data: { ...PROJECT, is_public: false, user_id: 'other' },
      error: null,
    });
    const res = await GET(makeRequest(), makeParams());
    const body = await res.json();
    expect(res.status).toBe(403);
    expect(body.error.message).toMatch(/access to this project/i);
  });

  it('returns 404 when project not found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const res = await GET(makeRequest(), makeParams());
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.error.message).toMatch(/project not found/i);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() });
    const res = await GET(makeRequest(), makeParams());
    expect(res.status).toBe(429);
  });
});

describe('PATCH /api/projects/[id]', () => {
  it('updates owned project', async () => {
    const res = await PATCH(makeRequest('PATCH', { name: 'Updated' }), makeParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.name).toBe('Updated');
    expect(mockVerifyProjectOwnership).toHaveBeenCalledWith('proj-1', 'u1');
  });

  it('returns 403 when not owner', async () => {
    mockVerifyProjectOwnership.mockRejectedValue(new ForbiddenError('Forbidden'));
    const res = await PATCH(makeRequest('PATCH', { name: 'X' }), makeParams());
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid body', async () => {
    const res = await PATCH(makeRequest('PATCH', {}), makeParams());
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/invalid request body/i);
  });

  it('returns 500 on DB update failure', async () => {
    mockUpdateSingle.mockResolvedValue({ data: null, error: { message: 'constraint' } });
    const res = await PATCH(makeRequest('PATCH', { name: 'X' }), makeParams());
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error.message).toMatch(/failed to update project/i);
  });
});

describe('DELETE /api/projects/[id]', () => {
  it('deletes owned project and returns 204', async () => {
    const res = await DELETE(makeRequest('DELETE'), makeParams());
    expect(res.status).toBe(204);
    expect(mockVerifyProjectOwnership).toHaveBeenCalledWith('proj-1', 'u1');
    expect(mockDeleteEq).toHaveBeenCalledWith('id', 'proj-1');
  });

  it('returns 403 when not owner', async () => {
    mockVerifyProjectOwnership.mockRejectedValue(new ForbiddenError('Forbidden'));
    const res = await DELETE(makeRequest('DELETE'), makeParams());
    expect(res.status).toBe(403);
  });

  it('returns 500 on DB delete failure', async () => {
    mockDeleteEq.mockResolvedValue({ error: { message: 'foreign key constraint' } });
    const res = await DELETE(makeRequest('DELETE'), makeParams());
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error.message).toMatch(/failed to delete project/i);
  });
});
