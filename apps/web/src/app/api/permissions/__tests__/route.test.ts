import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '../route';
import { verifySession } from '@/lib/api/auth';
import {
  getEntityPermissions,
  grantEntityPermission,
  revokeEntityPermission,
  checkEntityPermission,
} from '@/lib/repositories/rbac.repo';
import { UnauthorizedError } from '@/lib/api/errors';

jest.mock('@/lib/api/auth');
jest.mock('@/lib/repositories/rbac.repo');
jest.mock('@/lib/sentry/server', () => ({
  captureServerError: jest.fn(),
}));

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockGetEntityPermissions = getEntityPermissions as jest.MockedFunction<
  typeof getEntityPermissions
>;
const mockGrantEntityPermission = grantEntityPermission as jest.MockedFunction<
  typeof grantEntityPermission
>;
const mockRevokeEntityPermission = revokeEntityPermission as jest.MockedFunction<
  typeof revokeEntityPermission
>;
const mockCheckEntityPermission = checkEntityPermission as jest.MockedFunction<
  typeof checkEntityPermission
>;

const mockUser = { id: 'user-123', email: 'admin@example.com' } as any;

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifySession.mockResolvedValue({ user: mockUser });
  mockCheckEntityPermission.mockResolvedValue(true);
});

describe('GET /api/permissions', () => {
  it('returns permissions for entity', async () => {
    const perms = [
      {
        id: 'p1',
        entity_type: 'project',
        entity_id: 'proj-1',
        team_id: 't1',
        user_id: null,
        permission: 'edit',
        granted_by: 'user-123',
        granted_at: '',
        team: { id: 't1', name: 'Platform', slug: 'platform' },
      },
    ];
    mockGetEntityPermissions.mockResolvedValue(perms as any);

    const req = new NextRequest(
      'http://localhost/api/permissions?entityType=project&entityId=proj-1'
    );
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].permission).toBe('edit');
  });

  it('returns 400 for missing params', async () => {
    const req = new NextRequest('http://localhost/api/permissions');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('returns 403 when user lacks admin permission', async () => {
    mockCheckEntityPermission.mockResolvedValue(false);

    const req = new NextRequest(
      'http://localhost/api/permissions?entityType=project&entityId=proj-1'
    );
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError());

    const req = new NextRequest(
      'http://localhost/api/permissions?entityType=project&entityId=proj-1'
    );
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/permissions', () => {
  it('grants permission to team', async () => {
    mockGrantEntityPermission.mockResolvedValue(undefined);

    const req = new NextRequest('http://localhost/api/permissions', {
      method: 'POST',
      body: JSON.stringify({
        entityType: 'project',
        entityId: 'proj-1',
        permission: 'edit',
        teamId: 't1',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(mockGrantEntityPermission).toHaveBeenCalledWith(
      'project',
      'proj-1',
      'edit',
      'user-123',
      { teamId: 't1', userId: undefined }
    );
  });

  it('grants permission to user', async () => {
    mockGrantEntityPermission.mockResolvedValue(undefined);

    const req = new NextRequest('http://localhost/api/permissions', {
      method: 'POST',
      body: JSON.stringify({
        entityType: 'project',
        entityId: 'proj-1',
        permission: 'view',
        userId: 'user-456',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it('returns 400 for invalid permission', async () => {
    const req = new NextRequest('http://localhost/api/permissions', {
      method: 'POST',
      body: JSON.stringify({
        entityType: 'project',
        entityId: 'proj-1',
        permission: 'superadmin',
        teamId: 't1',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when neither teamId nor userId provided', async () => {
    const req = new NextRequest('http://localhost/api/permissions', {
      method: 'POST',
      body: JSON.stringify({
        entityType: 'project',
        entityId: 'proj-1',
        permission: 'edit',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 403 when user lacks admin permission', async () => {
    mockCheckEntityPermission.mockResolvedValue(false);

    const req = new NextRequest('http://localhost/api/permissions', {
      method: 'POST',
      body: JSON.stringify({
        entityType: 'project',
        entityId: 'proj-1',
        permission: 'edit',
        teamId: 't1',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('returns 409 for duplicate permission', async () => {
    mockGrantEntityPermission.mockRejectedValue(new Error('duplicate key'));

    const req = new NextRequest('http://localhost/api/permissions', {
      method: 'POST',
      body: JSON.stringify({
        entityType: 'project',
        entityId: 'proj-1',
        permission: 'edit',
        teamId: 't1',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/permissions', () => {
  it('revokes permission by id', async () => {
    mockRevokeEntityPermission.mockResolvedValue(undefined);

    const req = new NextRequest('http://localhost/api/permissions?id=perm-1', {
      method: 'DELETE',
    });

    const res = await DELETE(req);
    expect(res.status).toBe(200);
    expect(mockRevokeEntityPermission).toHaveBeenCalledWith('perm-1');
  });

  it('returns 400 when id missing', async () => {
    const req = new NextRequest('http://localhost/api/permissions', {
      method: 'DELETE',
    });

    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError());

    const req = new NextRequest('http://localhost/api/permissions?id=perm-1', {
      method: 'DELETE',
    });

    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });
});
