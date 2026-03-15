import { GET, PATCH, DELETE } from '@/app/api/components/[id]/route';
import { NextRequest } from 'next/server';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res) => res),
}));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));
jest.mock('@/lib/services/component.service', () => ({
  verifyComponentAccess: jest.fn(),
  getComponentCode: jest.fn(),
  storeComponentCode: jest.fn(),
  deleteComponentCode: jest.fn(),
}));
jest.mock('@/lib/api/validation/components', () => ({
  updateComponentSchema: {
    safeParse: jest.fn((v) =>
      v && Object.keys(v).length > 0
        ? { success: true, data: v }
        : { success: false, error: { flatten: () => ({ fieldErrors: {} }) } }
    ),
  },
}));
jest.mock('@/lib/api/storage', () => ({
  validateFileSize: jest.fn().mockReturnValue(true),
  STORAGE_LIMITS: { CODE_FILE: 5 * 1024 * 1024 },
}));

const mockUpdateSingle = jest.fn();
const mockDeleteEq = jest.fn();
const mockFrom = jest.fn(() => ({
  update: jest.fn(() => ({
    eq: jest.fn(() => ({
      select: jest.fn(() => ({ single: mockUpdateSingle })),
    })),
  })),
  delete: jest.fn(() => ({ eq: mockDeleteEq })),
}));

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

const USER = { id: 'u1', email: 't@t.com' };
const COMPONENT = {
  id: 'c1',
  user_id: 'u1',
  project_id: 'proj-1',
  component_name: 'Button',
  framework: 'react',
  code_storage_path: 'path/to/button.tsx',
  projects: { id: 'proj-1', framework: 'react' },
};

function makeContext(id = 'c1') {
  return { params: Promise.resolve({ id }) };
}

function makeRequest(method = 'GET', body?: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/components/c1', {
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
  mockVerifyComponentAccess.mockResolvedValue(COMPONENT as never);
  mockGetComponentCode.mockResolvedValue('<button>Click</button>');
  mockStoreComponentCode.mockResolvedValue('path/to/button.tsx');
  mockDeleteComponentCode.mockResolvedValue(undefined);
  mockUpdateSingle.mockResolvedValue({
    data: { ...COMPONENT, component_name: 'PrimaryButton' },
    error: null,
  });
  mockDeleteEq.mockResolvedValue({ error: null });
});

describe('GET /api/components/[id]', () => {
  it('returns component with code content', async () => {
    const res = await GET(makeRequest(), makeContext());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.component.id).toBe('c1');
    expect(body.data.component.code_content).toBe('<button>Click</button>');
    expect(mockVerifyComponentAccess).toHaveBeenCalledWith('c1', 'u1');
    expect(mockGetComponentCode).toHaveBeenCalledWith('path/to/button.tsx');
  });

  it('returns 404 when component not found', async () => {
    mockVerifyComponentAccess.mockRejectedValue(new NotFoundError('Component not found'));
    const res = await GET(makeRequest(), makeContext());
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.error.message).toMatch(/component not found/i);
  });

  it('returns 403 when access denied', async () => {
    mockVerifyComponentAccess.mockRejectedValue(new ForbiddenError('Access denied'));
    const res = await GET(makeRequest(), makeContext());
    expect(res.status).toBe(403);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() });
    const res = await GET(makeRequest(), makeContext());
    expect(res.status).toBe(429);
  });

  it('returns 500 on code fetch error', async () => {
    mockGetComponentCode.mockRejectedValue(new Error('Storage error'));
    const res = await GET(makeRequest(), makeContext());
    expect(res.status).toBe(500);
  });
});

describe('PATCH /api/components/[id]', () => {
  it('updates component metadata', async () => {
    const res = await PATCH(
      makeRequest('PATCH', { component_name: 'PrimaryButton' }),
      makeContext()
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.component.component_name).toBe('PrimaryButton');
  });

  it('updates component with new code content', async () => {
    const res = await PATCH(
      makeRequest('PATCH', { code_content: '<button>New</button>' }),
      makeContext()
    );
    expect(res.status).toBe(200);
    expect(mockStoreComponentCode).toHaveBeenCalled();
  });

  it('returns 403 when access denied', async () => {
    mockVerifyComponentAccess.mockRejectedValue(new ForbiddenError('Forbidden'));
    const res = await PATCH(makeRequest('PATCH', { component_name: 'X' }), makeContext());
    expect(res.status).toBe(403);
  });

  it('returns 500 on DB update failure', async () => {
    mockUpdateSingle.mockResolvedValue({ data: null, error: { message: 'crash' } });
    const res = await PATCH(makeRequest('PATCH', { component_name: 'X' }), makeContext());
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error.message).toMatch(/failed to update component/i);
  });
});

describe('DELETE /api/components/[id]', () => {
  it('deletes component and its code', async () => {
    const res = await DELETE(makeRequest('DELETE'), makeContext());
    expect(res.status).toBe(204);
    expect(mockVerifyComponentAccess).toHaveBeenCalledWith('c1', 'u1', true);
    expect(mockDeleteComponentCode).toHaveBeenCalledWith('path/to/button.tsx');
    expect(mockDeleteEq).toHaveBeenCalledWith('id', 'c1');
  });

  it('returns 404 when component not found', async () => {
    mockVerifyComponentAccess.mockRejectedValue(new NotFoundError('Not found'));
    const res = await DELETE(makeRequest('DELETE'), makeContext());
    expect(res.status).toBe(404);
  });

  it('returns 500 on DB delete failure', async () => {
    mockDeleteEq.mockResolvedValue({ error: { message: 'constraint' } });
    const res = await DELETE(makeRequest('DELETE'), makeContext());
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error.message).toMatch(/failed to delete component/i);
  });
});
