import { NextRequest } from 'next/server';
import { GET, POST, PATCH, DELETE } from '../route';
import { verifySession } from '@/lib/api/auth';
import {
  getTeamBySlug,
  addTeamMember,
  updateMemberRole,
  removeTeamMember,
  getUserRoleInTeam,
} from '@/lib/repositories/rbac.repo';
import { UnauthorizedError } from '@/lib/api/errors';

jest.mock('@/lib/api/auth');
jest.mock('@/lib/repositories/rbac.repo');
jest.mock('@/lib/sentry/server', () => ({
  captureServerError: jest.fn(),
}));

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockGetTeamBySlug = getTeamBySlug as jest.MockedFunction<typeof getTeamBySlug>;
const mockAddTeamMember = addTeamMember as jest.MockedFunction<typeof addTeamMember>;
const mockUpdateMemberRole = updateMemberRole as jest.MockedFunction<typeof updateMemberRole>;
const mockRemoveTeamMember = removeTeamMember as jest.MockedFunction<typeof removeTeamMember>;
const mockGetUserRoleInTeam = getUserRoleInTeam as jest.MockedFunction<typeof getUserRoleInTeam>;

const mockUser = { id: 'user-123', email: 'admin@example.com' } as any;
const mockTeam = {
  id: 't1',
  name: 'Platform',
  slug: 'platform',
  owner_id: 'user-123',
  description: null,
  created_at: '',
  updated_at: '',
  members: [{ id: 'm1', team_id: 't1', user_id: 'user-123', role: 'owner', joined_at: '' }],
};

const context = { params: Promise.resolve({ slug: 'platform' }) };

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifySession.mockResolvedValue({ user: mockUser });
  mockGetTeamBySlug.mockResolvedValue(mockTeam as any);
  mockGetUserRoleInTeam.mockResolvedValue('owner');
});

describe('GET /api/teams/[slug]', () => {
  it('returns team with user role', async () => {
    const req = new NextRequest('http://localhost/api/teams/platform');
    const res = await GET(req, context);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.name).toBe('Platform');
    expect(body.userRole).toBe('owner');
  });

  it('returns 404 for unknown team', async () => {
    mockGetTeamBySlug.mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/teams/unknown');
    const res = await GET(req, { params: Promise.resolve({ slug: 'unknown' }) });

    expect(res.status).toBe(404);
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError());

    const req = new NextRequest('http://localhost/api/teams/platform');
    const res = await GET(req, context);

    expect(res.status).toBe(401);
  });
});

describe('POST /api/teams/[slug] — add member', () => {
  it('adds member as admin', async () => {
    mockAddTeamMember.mockResolvedValue(undefined);

    const req = new NextRequest('http://localhost/api/teams/platform', {
      method: 'POST',
      body: JSON.stringify({ userId: 'new-user', role: 'editor' }),
    });

    const res = await POST(req, context);
    expect(res.status).toBe(201);
    expect(mockAddTeamMember).toHaveBeenCalledWith('t1', 'new-user', 'editor', 'user-123');
  });

  it('returns 403 for viewer trying to add member', async () => {
    mockGetUserRoleInTeam.mockResolvedValue('viewer');

    const req = new NextRequest('http://localhost/api/teams/platform', {
      method: 'POST',
      body: JSON.stringify({ userId: 'new-user', role: 'editor' }),
    });

    const res = await POST(req, context);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid role', async () => {
    const req = new NextRequest('http://localhost/api/teams/platform', {
      method: 'POST',
      body: JSON.stringify({ userId: 'new-user', role: 'superadmin' }),
    });

    const res = await POST(req, context);
    expect(res.status).toBe(400);
  });

  it('returns 409 for duplicate member', async () => {
    mockAddTeamMember.mockRejectedValue(new Error('duplicate key'));

    const req = new NextRequest('http://localhost/api/teams/platform', {
      method: 'POST',
      body: JSON.stringify({ userId: 'existing-user', role: 'viewer' }),
    });

    const res = await POST(req, context);
    expect(res.status).toBe(409);
  });
});

describe('PATCH /api/teams/[slug] — update role', () => {
  it('updates member role', async () => {
    mockUpdateMemberRole.mockResolvedValue(undefined);

    const req = new NextRequest('http://localhost/api/teams/platform', {
      method: 'PATCH',
      body: JSON.stringify({ userId: 'member-1', role: 'admin' }),
    });

    const res = await PATCH(req, context);
    expect(res.status).toBe(200);
    expect(mockUpdateMemberRole).toHaveBeenCalledWith('t1', 'member-1', 'admin');
  });

  it('rejects assigning owner role', async () => {
    const req = new NextRequest('http://localhost/api/teams/platform', {
      method: 'PATCH',
      body: JSON.stringify({ userId: 'member-1', role: 'owner' }),
    });

    const res = await PATCH(req, context);
    expect(res.status).toBe(400);
  });

  it('returns 403 for editor trying to change roles', async () => {
    mockGetUserRoleInTeam.mockResolvedValue('editor');

    const req = new NextRequest('http://localhost/api/teams/platform', {
      method: 'PATCH',
      body: JSON.stringify({ userId: 'member-1', role: 'viewer' }),
    });

    const res = await PATCH(req, context);
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/teams/[slug] — remove member', () => {
  it('removes member', async () => {
    mockRemoveTeamMember.mockResolvedValue(undefined);

    const req = new NextRequest('http://localhost/api/teams/platform?userId=member-1');
    const res = await DELETE(req, context);

    expect(res.status).toBe(200);
    expect(mockRemoveTeamMember).toHaveBeenCalledWith('t1', 'member-1');
  });

  it('prevents removing team owner', async () => {
    const req = new NextRequest('http://localhost/api/teams/platform?userId=user-123');
    const res = await DELETE(req, context);

    expect(res.status).toBe(400);
  });

  it('returns 400 when userId missing', async () => {
    const req = new NextRequest('http://localhost/api/teams/platform');
    const res = await DELETE(req, context);

    expect(res.status).toBe(400);
  });

  it('returns 403 for viewer trying to remove', async () => {
    mockGetUserRoleInTeam.mockResolvedValue('viewer');

    const req = new NextRequest('http://localhost/api/teams/platform?userId=member-1');
    const res = await DELETE(req, context);

    expect(res.status).toBe(403);
  });
});
