import { GET, PATCH, DELETE } from '@/app/api/components/[id]/route';
import { NextRequest } from 'next/server';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '@/lib/api/errors';

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
jest.mock('@/lib/api/validation/components', () => ({
  updateComponentSchema: {
    safeParse: jest.fn((v) =>
      v && v.component_name
        ? {
            success: true,
            data: {
              component_name: v.component_name,
              framework: v.framework,
              code_content: v.code_content,
            },
          }
        : { success: false, error: { flatten: () => ({ fieldErrors: {} }) } }
    ),
  },
}));
jest.mock('@/lib/api/storage', () => ({
  validateFileSize: jest.fn(() => true),
  STORAGE_LIMITS: { CODE_FILE: 5 * 1024 * 1024 },
}));
jest.mock('@/lib/services/component.service', () => ({
  verifyComponentAccess: jest.fn(),
  getComponentCode: jest.fn(),
  storeComponentCode: jest.fn(),
  deleteComponentCode: jest.fn(),
}));

const mockSingle = jest.fn();
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockUpdate = jest.fn(() => ({
  eq: jest.fn(() => ({ select: jest.fn(() => ({ single: mockSingle })) })),
}));
const mockDelete = jest.fn(() => ({ eq: jest.fn().mockResolvedValue({ error: null }) }));
const mockFrom = jest.fn(() => ({ select: mockSelect, update: mockUpdate, delete: mockDelete }));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import {
  verifyComponentAccess,
  getComponentCode,
  storeComponentCode,
  deleteComponentCode,
} from '@/lib/services/component.service';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockVerifyComponentAccess = verifyComponentAccess as jest.MockedFunction<
  typeof verifyComponentAccess
>;
const mockGetComponentCode = getComponentCode as jest.MockedFunction<typeof getComponentCode>;
const mockStoreComponentCode = storeComponentCode as jest.MockedFunction<typeof storeComponentCode>;
const mockDeleteComponentCode = deleteComponentCode as jest.MockedFunction<
  typeof deleteComponentCode
>;

const RATE_OK = { allowed: true, remaining: 119, resetAt: Date.now() + 60000 };
const USER = { id: 'u1', email: 'user@test.com' };
const COMPONENT = {
  id: 'c1',
  component_name: 'Button',
  project_id: 'p1',
  framework: 'react',
  code_storage_path: 'path/to/code.tsx',
  projects: { framework: 'react' },
};

function makeRequest(method: string, body?: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/components/c1', {
    method,
    ...(body
      ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : {}),
  });
}

function makeContext(id = 'c1') {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckRateLimit.mockResolvedValue(RATE_OK as never);
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockVerifyComponentAccess.mockResolvedValue(COMPONENT as never);
  mockGetComponentCode.mockResolvedValue('export default function Button() {}');
  mockStoreComponentCode.mockResolvedValue('new/path/code.tsx');
  mockDeleteComponentCode.mockResolvedValue(undefined);
  mockSingle.mockResolvedValue({ data: COMPONENT, error: null });
});

describe('GET /api/components/[id]', () => {
  it('returns component with code content', async () => {
    const res = await GET(makeRequest('GET'), makeContext());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockVerifyComponentAccess).toHaveBeenCalledWith('c1', USER.id);
    expect(mockGetComponentCode).toHaveBeenCalledWith(COMPONENT.code_storage_path);
    expect(body.data.component.component_name).toBe('Button');
    expect(body.data.component.code_content).toBeDefined();
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

  it('returns 404 when component not found', async () => {
    mockVerifyComponentAccess.mockRejectedValue(new NotFoundError('Component not found'));

    const res = await GET(makeRequest('GET'), makeContext());
    expect(res.status).toBe(404);
  });

  it('returns 403 when access forbidden', async () => {
    mockVerifyComponentAccess.mockRejectedValue(new ForbiddenError('No access'));

    const res = await GET(makeRequest('GET'), makeContext());
    expect(res.status).toBe(403);
  });

  it('returns 401 on unauthorized', async () => {
    mockVerifyComponentAccess.mockRejectedValue(new UnauthorizedError('Not authed'));

    const res = await GET(makeRequest('GET'), makeContext());
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/components/[id]', () => {
  it('updates component metadata without code', async () => {
    const res = await PATCH(
      makeRequest('PATCH', { component_name: 'UpdatedButton' }),
      makeContext()
    );
    void (await res.json());

    expect(res.status).toBe(200);
    expect(mockStoreComponentCode).not.toHaveBeenCalled();
  });

  it('updates component with new code content', async () => {
    const res = await PATCH(
      makeRequest('PATCH', {
        component_name: 'Button',
        code_content: 'export default function Button() { return <button/>; }',
      }),
      makeContext()
    );

    expect(res.status).toBe(200);
    expect(mockStoreComponentCode).toHaveBeenCalled();
  });

  it('returns 400 for invalid body', async () => {
    const res = await PATCH(makeRequest('PATCH', {}), makeContext());
    expect(res.status).toBe(400);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now(),
    } as never);

    const res = await PATCH(makeRequest('PATCH', { component_name: 'X' }), makeContext());
    expect(res.status).toBe(429);
  });

  it('returns 403 when access forbidden', async () => {
    mockVerifyComponentAccess.mockRejectedValue(new ForbiddenError('No access'));

    const res = await PATCH(makeRequest('PATCH', { component_name: 'X' }), makeContext());
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/components/[id]', () => {
  it('deletes component and code', async () => {
    const res = await DELETE(makeRequest('DELETE'), makeContext());

    expect(res.status).toBe(204);
    expect(mockVerifyComponentAccess).toHaveBeenCalledWith('c1', USER.id, true);
    expect(mockDeleteComponentCode).toHaveBeenCalledWith(COMPONENT.code_storage_path);
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

  it('returns 404 when component not found', async () => {
    mockVerifyComponentAccess.mockRejectedValue(new NotFoundError('Not found'));

    const res = await DELETE(makeRequest('DELETE'), makeContext());
    expect(res.status).toBe(404);
  });
});
