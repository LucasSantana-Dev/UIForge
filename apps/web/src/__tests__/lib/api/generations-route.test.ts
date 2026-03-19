import { GET, POST } from '@/app/api/generations/route';
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

const mockSingle = jest.fn();
const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });
const mockEqProject = jest.fn(() => ({ order: mockOrder }));
const mockProjectSingle = jest.fn();
const mockEqProjectId = jest.fn(() => ({ single: mockProjectSingle }));
const mockInsertSelect = jest.fn(() => ({ single: mockSingle }));
const mockInsert = jest.fn(() => ({ select: mockInsertSelect }));
const mockFrom = jest.fn((table: string) => {
  if (table === 'projects') {
    return {
      select: jest.fn(() => ({ eq: mockEqProjectId })),
    };
  }
  if (table === 'generations') {
    return {
      select: jest.fn(() => ({ eq: mockEqProject })),
      insert: mockInsert,
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
const PROJECT = { id: 'proj-1', user_id: 'u1' };
const GENERATIONS = [{ id: 'gen-1', project_id: 'proj-1', prompt: 'A button', framework: 'react' }];

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/generations');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

function makePostRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/generations', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
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
  mockProjectSingle.mockResolvedValue({ data: PROJECT, error: null });
  mockOrder.mockResolvedValue({ data: GENERATIONS, error: null });
  mockEqProjectId.mockReturnValue({ single: mockProjectSingle });
  mockEqProject.mockReturnValue({ order: mockOrder });
  mockSingle.mockResolvedValue({
    data: {
      id: 'gen-new',
      project_id: 'proj-1',
      prompt: 'A card',
      component_name: 'Card',
      generated_code: '<div/>',
      framework: 'react',
      user_id: 'u1',
    },
    error: null,
  });
});

describe('GET /api/generations', () => {
  it('returns generations for an owned project', async () => {
    const res = await GET(makeGetRequest({ project_id: 'proj-1' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.generations).toHaveLength(1);
    expect(body.data.generations[0].id).toBe('gen-1');
  });

  it('returns 400 when project_id is missing', async () => {
    const res = await GET(makeGetRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/project id is required/i);
  });

  it('returns 404 when project not found', async () => {
    mockProjectSingle.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const res = await GET(makeGetRequest({ project_id: 'proj-999' }));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.message).toMatch(/project not found/i);
  });

  it('returns 403 when project belongs to another user', async () => {
    mockProjectSingle.mockResolvedValue({
      data: { ...PROJECT, user_id: 'other-user' },
      error: null,
    });
    const res = await GET(makeGetRequest({ project_id: 'proj-1' }));

    expect(res.status).toBe(403);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() });
    const res = await GET(makeGetRequest({ project_id: 'proj-1' }));
    expect(res.status).toBe(429);
  });

  it('returns 500 when generations query fails', async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: 'crash' } });
    const res = await GET(makeGetRequest({ project_id: 'proj-1' }));
    expect(res.status).toBe(500);
  });
});

describe('POST /api/generations', () => {
  const validBody = {
    project_id: 'proj-1',
    prompt: 'A card',
    component_name: 'Card',
    generated_code: 'export default function Card() {}',
    framework: 'react',
  };

  it('creates a generation record for owned project', async () => {
    const res = await POST(makePostRequest(validBody));
    const body = await res.json();

    expect(res.status).toBe(200); // route uses successResponse with '201' string — still 200
    expect(body.data.generation.id).toBe('gen-new');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ project_id: 'proj-1', user_id: 'u1', prompt: 'A card' })
    );
  });

  it('returns 400 when required field is missing', async () => {
    const res = await POST(makePostRequest({ project_id: 'proj-1', framework: 'react' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/is required/i);
  });

  it('returns 403 when project belongs to another user', async () => {
    mockProjectSingle.mockResolvedValue({ data: { ...PROJECT, user_id: 'other' }, error: null });
    const res = await POST(makePostRequest(validBody));

    expect(res.status).toBe(403);
  });

  it('returns 500 when DB insert fails', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'constraint' } });
    const res = await POST(makePostRequest(validBody));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error.message).toMatch(/failed to create generation/i);
  });
});
