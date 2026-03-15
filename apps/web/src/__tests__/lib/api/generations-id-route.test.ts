import { GET, PATCH, DELETE } from '@/app/api/generations/[id]/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res) => res),
}));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));
jest.mock('@/app/api/generations/error-handler', () => ({
  handleGenerationRouteError: jest.fn((_err: unknown) => {
    const { NextResponse } = require('next/server');
    return NextResponse.json({ error: { message: 'error' } }, { status: 500 });
  }),
}));

// Two types of queries: fetch (single) and update/delete
const mockFetchSingle = jest.fn();
const mockUpdateSingle = jest.fn();
const mockDeleteEq = jest.fn();

const mockFrom = jest.fn((table: string) => {
  if (table === 'generations') {
    return {
      select: jest.fn(() => ({ eq: jest.fn(() => ({ single: mockFetchSingle })) })),
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

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;

const USER = { id: 'u1', email: 't@t.com' };
const GENERATION = {
  id: 'gen-1',
  user_id: 'u1',
  project_id: 'proj-1',
  prompt: 'A button',
  framework: 'react',
  generated_code: 'export default function Button() {}',
  status: 'completed',
};

function makeParams(id = 'gen-1') {
  return { params: Promise.resolve({ id }) };
}

function makeRequest(method = 'GET', body?: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/generations/gen-1', {
    method,
    ...(body && { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 99,
    resetAt: Date.now() + 60000,
  });
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockFetchSingle.mockResolvedValue({ data: GENERATION, error: null });
  mockUpdateSingle.mockResolvedValue({ data: { ...GENERATION, prompt: 'Updated' }, error: null });
  mockDeleteEq.mockResolvedValue({ error: null });
});

describe('GET /api/generations/[id]', () => {
  it('returns owned generation', async () => {
    const res = await GET(makeRequest(), makeParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.generation.id).toBe('gen-1');
    expect(body.data.generation.prompt).toBe('A button');
  });

  it('returns 404 when generation not found', async () => {
    mockFetchSingle.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const res = await GET(makeRequest(), makeParams());
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.error.message).toMatch(/generation not found/i);
  });

  it('returns 403 when generation belongs to another user', async () => {
    mockFetchSingle.mockResolvedValue({ data: { ...GENERATION, user_id: 'other' }, error: null });
    const res = await GET(makeRequest(), makeParams());
    expect(res.status).toBe(403);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() });
    const res = await GET(makeRequest(), makeParams());
    expect(res.status).toBe(429);
  });
});

describe('PATCH /api/generations/[id]', () => {
  it('updates allowed fields on owned generation', async () => {
    const res = await PATCH(
      makeRequest('PATCH', { prompt: 'Updated', status: 'completed' }),
      makeParams()
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.generation.prompt).toBe('Updated');
  });

  it('returns 404 when generation not found for update', async () => {
    mockFetchSingle.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const res = await PATCH(makeRequest('PATCH', { prompt: 'X' }), makeParams());
    expect(res.status).toBe(404);
  });

  it("returns 403 when updating another user's generation", async () => {
    mockFetchSingle.mockResolvedValue({ data: { ...GENERATION, user_id: 'other' }, error: null });
    const res = await PATCH(makeRequest('PATCH', { prompt: 'X' }), makeParams());
    expect(res.status).toBe(403);
  });

  it('returns 500 on DB update failure', async () => {
    mockUpdateSingle.mockResolvedValue({ data: null, error: { message: 'crash' } });
    const res = await PATCH(makeRequest('PATCH', { prompt: 'X' }), makeParams());
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error.message).toMatch(/failed to update generation/i);
  });
});

describe('DELETE /api/generations/[id]', () => {
  it('deletes owned generation', async () => {
    const res = await DELETE(makeRequest('DELETE'), makeParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.message).toMatch(/deleted successfully/i);
    expect(mockDeleteEq).toHaveBeenCalledWith('id', 'gen-1');
  });

  it('returns 404 when generation not found for delete', async () => {
    mockFetchSingle.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const res = await DELETE(makeRequest('DELETE'), makeParams());
    expect(res.status).toBe(404);
  });

  it("returns 403 when deleting another user's generation", async () => {
    mockFetchSingle.mockResolvedValue({ data: { ...GENERATION, user_id: 'other' }, error: null });
    const res = await DELETE(makeRequest('DELETE'), makeParams());
    expect(res.status).toBe(403);
  });

  it('returns 500 on DB delete failure', async () => {
    mockDeleteEq.mockResolvedValue({ error: { message: 'constraint' } });
    const res = await DELETE(makeRequest('DELETE'), makeParams());
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error.message).toMatch(/failed to delete generation/i);
  });
});
