import { GET as getCatalogGraph } from '@/app/api/catalog/graph/route';
import { POST as postCatalogImport } from '@/app/api/catalog/import/route';
import {
  GET as getRelationships,
  POST as postRelationship,
  DELETE as deleteRelationship,
} from '@/app/api/catalog/[id]/relationships/route';
import { NextRequest } from 'next/server';

// ── catalog/graph ─────────────────────────────────────────────────────────────
jest.mock('@/lib/services/catalog.service', () => ({
  getCatalogGraph: jest.fn(),
  getCatalogStats: jest.fn(), // already tested in catalog-extra-routes
}));

// ── catalog/import ────────────────────────────────────────────────────────────
jest.mock('@/lib/services/catalog-import.service', () => ({
  importCatalogYaml: jest.fn(),
}));
jest.mock('@/lib/api/validation/catalog', () => ({
  importCatalogYamlSchema: {
    safeParse: jest.fn((v) =>
      v && v.yaml
        ? { success: true, data: { yaml: v.yaml, source: v.source || 'manual' } }
        : { success: false, error: { issues: [{ message: 'yaml is required' }] } }
    ),
  },
}));

// ── catalog/[id]/relationships ────────────────────────────────────────────────
jest.mock('@/lib/repositories/relationship.repo', () => ({
  getRelationshipsForEntity: jest.fn(),
  createRelationship: jest.fn(),
  deleteRelationship: jest.fn(),
}));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));

// Shared: @/lib/api barrel (for graph + import)
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
    jsonResponse: jest.fn((data: unknown) => new Response(JSON.stringify(data), { status: 200 })),
  };
});
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res: Response) => res),
}));

// Supabase (for relationships route)
const mockGetUser = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ auth: { getUser: mockGetUser } })),
}));

import { verifySession } from '@/lib/api';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { getCatalogGraph as mockGetCatalogGraph } from '@/lib/services/catalog.service';
import { importCatalogYaml } from '@/lib/services/catalog-import.service';
import {
  getRelationshipsForEntity,
  createRelationship,
  deleteRelationship as deleteRelationshipFn,
} from '@/lib/repositories/relationship.repo';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockGetGraph = mockGetCatalogGraph as jest.MockedFunction<typeof mockGetCatalogGraph>;
const mockImportYaml = importCatalogYaml as jest.MockedFunction<typeof importCatalogYaml>;
const mockGetRelationships = getRelationshipsForEntity as jest.MockedFunction<
  typeof getRelationshipsForEntity
>;
const mockCreateRelationship = createRelationship as jest.MockedFunction<typeof createRelationship>;
const mockDeleteRelationship = deleteRelationshipFn as jest.MockedFunction<
  typeof deleteRelationshipFn
>;

const RATE_OK = { allowed: true, remaining: 59, resetAt: Date.now() + 60000 };
const USER = { id: 'u1', email: 'user@test.com' };
const GRAPH = { nodes: [{ id: 'n1', type: 'service' }], edges: [] };
const IMPORT_RESULT = { created: 2, updated: 1, skipped: 0 };
const RELATIONSHIPS = [{ id: 'r1', source_id: 'e1', target_id: 'e2', type: 'depends-on' }];
const NEW_REL = { id: 'r2', source_id: 'e1', target_id: 'e3', type: 'calls' };

function makeRequest(method: string, url: string, body?: Record<string, unknown>) {
  return new NextRequest(url, {
    method,
    ...(body
      ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : {}),
  });
}

function makeContext(id = 'ent-1') {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckRateLimit.mockResolvedValue(RATE_OK as never);
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockGetGraph.mockResolvedValue(GRAPH as never);
  mockImportYaml.mockResolvedValue(IMPORT_RESULT as never);
  mockGetRelationships.mockResolvedValue(RELATIONSHIPS as never);
  mockCreateRelationship.mockResolvedValue(NEW_REL as never);
  mockDeleteRelationship.mockResolvedValue(undefined);
  mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
});

// ── GET /api/catalog/graph ────────────────────────────────────────────────────
describe('GET /api/catalog/graph', () => {
  it('returns catalog graph', async () => {
    const res = await getCatalogGraph(makeRequest('GET', 'http://localhost/api/catalog/graph'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(GRAPH);
    expect(mockGetGraph).toHaveBeenCalled();
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now(),
    } as never);

    const res = await getCatalogGraph(makeRequest('GET', 'http://localhost/api/catalog/graph'));
    expect(res.status).toBe(429);
  });

  it('returns 500 on service error', async () => {
    mockGetGraph.mockRejectedValue(new Error('Graph computation failed'));

    const res = await getCatalogGraph(makeRequest('GET', 'http://localhost/api/catalog/graph'));
    expect(res.status).toBe(500);
  });
});

// ── POST /api/catalog/import ──────────────────────────────────────────────────
describe('POST /api/catalog/import', () => {
  const VALID_BODY = {
    yaml: 'apiVersion: backstage.io/v1alpha1\nkind: Component',
    source: 'github',
  };

  it('imports catalog YAML successfully', async () => {
    const res = await postCatalogImport(
      makeRequest('POST', 'http://localhost/api/catalog/import', VALID_BODY)
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(mockImportYaml).toHaveBeenCalledWith(VALID_BODY.yaml, USER.id, VALID_BODY.source);
    expect(body.data).toEqual(IMPORT_RESULT);
  });

  it('returns 400 when yaml is missing', async () => {
    const res = await postCatalogImport(
      makeRequest('POST', 'http://localhost/api/catalog/import', { source: 'github' })
    );
    expect(res.status).toBe(400);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now(),
    } as never);

    const res = await postCatalogImport(
      makeRequest('POST', 'http://localhost/api/catalog/import', VALID_BODY)
    );
    expect(res.status).toBe(429);
  });

  it('returns 500 on service error', async () => {
    mockImportYaml.mockRejectedValue(new Error('YAML parse failed'));

    const res = await postCatalogImport(
      makeRequest('POST', 'http://localhost/api/catalog/import', VALID_BODY)
    );
    expect(res.status).toBe(500);
  });
});

// ── GET /api/catalog/[id]/relationships ───────────────────────────────────────
describe('GET /api/catalog/[id]/relationships', () => {
  it('returns relationships for entity', async () => {
    const res = await getRelationships(
      makeRequest('GET', 'http://localhost/api/catalog/ent-1/relationships'),
      makeContext()
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual(RELATIONSHIPS);
    expect(mockGetRelationships).toHaveBeenCalledWith('ent-1');
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await getRelationships(
      makeRequest('GET', 'http://localhost/api/catalog/ent-1/relationships'),
      makeContext()
    );
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 500 on service error', async () => {
    mockGetRelationships.mockRejectedValue(new Error('DB error'));

    const res = await getRelationships(
      makeRequest('GET', 'http://localhost/api/catalog/ent-1/relationships'),
      makeContext()
    );
    void (await res.json());

    expect(res.status).toBe(500);
  });
});

// ── POST /api/catalog/[id]/relationships ──────────────────────────────────────
describe('POST /api/catalog/[id]/relationships', () => {
  it('creates a relationship', async () => {
    const res = await postRelationship(
      makeRequest('POST', 'http://localhost/api/catalog/ent-1/relationships', {
        targetId: 'ent-3',
        type: 'calls',
        metadata: { label: 'sync' },
      }),
      makeContext()
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data).toEqual(NEW_REL);
    expect(mockCreateRelationship).toHaveBeenCalledWith('ent-1', 'ent-3', 'calls', USER.id, {
      label: 'sync',
    });
  });

  it('returns 400 when targetId is missing', async () => {
    const res = await postRelationship(
      makeRequest('POST', 'http://localhost/api/catalog/ent-1/relationships', { type: 'calls' }),
      makeContext()
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/targetId and type are required/i);
  });

  it('returns 400 when type is missing', async () => {
    const res = await postRelationship(
      makeRequest('POST', 'http://localhost/api/catalog/ent-1/relationships', {
        targetId: 'ent-3',
      }),
      makeContext()
    );
    expect(res.status).toBe(400);
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await postRelationship(
      makeRequest('POST', 'http://localhost/api/catalog/ent-1/relationships', {
        targetId: 'x',
        type: 'calls',
      }),
      makeContext()
    );
    expect(res.status).toBe(401);
  });
});

// ── DELETE /api/catalog/[id]/relationships ────────────────────────────────────
describe('DELETE /api/catalog/[id]/relationships', () => {
  function makeDeleteRequest(relationshipId?: string) {
    const url = new URL('http://localhost/api/catalog/ent-1/relationships');
    if (relationshipId) url.searchParams.set('relationshipId', relationshipId);
    return new NextRequest(url.toString(), { method: 'DELETE' });
  }

  it('deletes a relationship by id', async () => {
    const res = await deleteRelationship(makeDeleteRequest('r1'), makeContext());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.deleted).toBe(true);
    expect(mockDeleteRelationship).toHaveBeenCalledWith('r1');
  });

  it('returns 400 when relationshipId is missing', async () => {
    const res = await deleteRelationship(makeDeleteRequest(), makeContext());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/relationshipId query param required/i);
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await deleteRelationship(makeDeleteRequest('r1'), makeContext());
    expect(res.status).toBe(401);
  });

  it('returns 500 on service error', async () => {
    mockDeleteRelationship.mockRejectedValue(new Error('DB error'));

    const res = await deleteRelationship(makeDeleteRequest('r1'), makeContext());
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/Failed to delete relationship/i);
  });
});
