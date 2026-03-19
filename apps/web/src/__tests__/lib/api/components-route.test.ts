import { GET, POST } from '@/app/api/components/route';
import { NextRequest } from 'next/server';
import { UnauthorizedError, ForbiddenError } from '@/lib/api/errors';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res) => res),
}));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));
jest.mock('@/lib/services/component.service', () => ({
  verifyProjectAccess: jest.fn(),
  storeComponentCode: jest.fn(),
}));
jest.mock('@/lib/api/validation/components', () => ({
  componentQuerySchema: {
    parse: jest.fn((v) => ({ project_id: v.project_id || 'proj-1' })),
  },
  createComponentSchema: {
    safeParse: jest.fn((v) =>
      v && v.component_name
        ? {
            success: true,
            data: {
              component_name: v.component_name,
              project_id: v.project_id || 'proj-1',
              framework: v.framework || 'react',
              code_content: v.code_content || 'export default function C(){}',
              prompt: v.prompt || 'A button',
            },
          }
        : { success: false, error: { flatten: () => ({ fieldErrors: {} }) } }
    ),
  },
}));
jest.mock('@/lib/api/storage', () => ({
  validateFileSize: jest.fn().mockReturnValue(true),
  STORAGE_LIMITS: { CODE_FILE: 5 * 1024 * 1024 },
}));

const mockComponentSingle = jest.fn();
const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });
const mockUpdate = jest.fn(() => ({ eq: mockUpdateEq }));
const mockDeleteEq = jest.fn().mockResolvedValue({});
const mockDelete = jest.fn(() => ({ eq: mockDeleteEq }));
const mockInsertSelect = jest.fn(() => ({ single: mockComponentSingle }));
const mockInsert = jest.fn(() => ({ select: mockInsertSelect }));
const mockOrderChain = jest.fn().mockResolvedValue({ data: [], error: null });
const mockSelectChain = jest.fn(() => ({ eq: jest.fn(() => ({ order: mockOrderChain })) }));
const mockFrom = jest.fn((table: string) => {
  if (table === 'components') {
    return {
      select: mockSelectChain,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    };
  }
  return {};
});

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { verifyProjectAccess, storeComponentCode } from '@/lib/services/component.service';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockVerifyProjectAccess = verifyProjectAccess as jest.MockedFunction<
  typeof verifyProjectAccess
>;
const mockStoreComponentCode = storeComponentCode as jest.MockedFunction<typeof storeComponentCode>;

const USER = { id: 'u1', email: 't@t.com' };
const PROJECT = { id: 'proj-1', user_id: 'u1', framework: 'react' };
const COMPONENTS = [
  { id: 'c1', component_name: 'Button', project_id: 'proj-1', framework: 'react' },
];

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/components');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

function makePostRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/components', {
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
  mockVerifyProjectAccess.mockResolvedValue(PROJECT as never);
  mockOrderChain.mockResolvedValue({ data: COMPONENTS, error: null });
  mockStoreComponentCode.mockResolvedValue('path/to/code.tsx');
  mockComponentSingle.mockResolvedValue({
    data: { id: 'c-new', component_name: 'Button', project_id: 'proj-1' },
    error: null,
  });
});

describe('GET /api/components', () => {
  it('returns components for a project', async () => {
    const res = await GET(makeGetRequest({ project_id: 'proj-1' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.components).toHaveLength(1);
    expect(mockVerifyProjectAccess).toHaveBeenCalledWith('proj-1', 'u1');
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() });
    const res = await GET(makeGetRequest({ project_id: 'proj-1' }));
    expect(res.status).toBe(429);
    expect(mockVerifyProjectAccess).not.toHaveBeenCalled();
  });

  it('returns 403 when project access is denied', async () => {
    mockVerifyProjectAccess.mockRejectedValue(new ForbiddenError('Access denied'));
    const res = await GET(makeGetRequest({ project_id: 'proj-1' }));
    const body = await res.json();
    expect(res.status).toBe(403);
    expect(body.error.message).toMatch(/access denied/i);
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError('Unauthorized'));
    const res = await GET(makeGetRequest({ project_id: 'proj-1' }));

    expect(res.status).toBe(401);
  });

  it('returns 500 on DB error', async () => {
    mockOrderChain.mockResolvedValue({ data: null, error: { message: 'db crash' } });
    const res = await GET(makeGetRequest({ project_id: 'proj-1' }));
    expect(res.status).toBe(500);
  });
});

describe('POST /api/components', () => {
  const validComponent = {
    component_name: 'Button',
    project_id: 'proj-1',
    framework: 'react',
    code_content: 'export default function Button() {}',
    prompt: 'A styled button',
  };

  it('creates a component with code storage', async () => {
    const res = await POST(makePostRequest(validComponent));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.component.id).toBe('c-new');
    expect(mockStoreComponentCode).toHaveBeenCalledWith(
      'proj-1',
      'c-new',
      'react',
      validComponent.code_content
    );
    expect(mockUpdate).toHaveBeenCalledWith({ code_storage_path: 'path/to/code.tsx' });
  });

  it('returns 400 when component_name is missing', async () => {
    const res = await POST(makePostRequest({ project_id: 'proj-1', framework: 'react' }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/invalid component data/i);
  });

  it('returns 400 when framework mismatches project', async () => {
    mockVerifyProjectAccess.mockResolvedValue({ ...PROJECT, framework: 'vue' } as never);
    const res = await POST(makePostRequest({ ...validComponent, framework: 'react' }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/framework must match/i);
  });

  it('returns 500 when component insert fails', async () => {
    mockComponentSingle.mockResolvedValue({ data: null, error: { message: 'constraint' } });
    const res = await POST(makePostRequest(validComponent));
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error.message).toMatch(/failed to create component/i);
  });

  it('returns 500 when code storage fails and deletes component', async () => {
    mockStoreComponentCode.mockRejectedValue(new Error('Storage quota exceeded'));
    const res = await POST(makePostRequest(validComponent));
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error.message).toMatch(/failed to store component code/i);
    expect(mockDelete).toHaveBeenCalled();
  });
});
