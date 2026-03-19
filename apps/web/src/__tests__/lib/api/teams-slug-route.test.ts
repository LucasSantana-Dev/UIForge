import { GET, POST, PATCH, DELETE } from '@/app/api/teams/[slug]/route';
import { NextRequest } from 'next/server';
import { UnauthorizedError } from '@/lib/api/errors';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));
jest.mock('@/lib/repositories/rbac.repo', () => ({
  getTeamBySlug: jest.fn(),
  addTeamMember: jest.fn(),
  updateMemberRole: jest.fn(),
  removeTeamMember: jest.fn(),
  getUserRoleInTeam: jest.fn(),
}));

import { verifySession } from '@/lib/api/auth';
import {
  getTeamBySlug,
  addTeamMember,
  updateMemberRole,
  removeTeamMember,
  getUserRoleInTeam,
} from '@/lib/repositories/rbac.repo';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockGetTeamBySlug = getTeamBySlug as jest.MockedFunction<typeof getTeamBySlug>;
const mockAddTeamMember = addTeamMember as jest.MockedFunction<typeof addTeamMember>;
const mockUpdateMemberRole = updateMemberRole as jest.MockedFunction<typeof updateMemberRole>;
const mockRemoveTeamMember = removeTeamMember as jest.MockedFunction<typeof removeTeamMember>;
const mockGetUserRoleInTeam = getUserRoleInTeam as jest.MockedFunction<typeof getUserRoleInTeam>;

const TEAM = {
  id: 'team-1',
  slug: 'alpha',
  name: 'Alpha Team',
  owner_id: 'owner-1',
};

const USER = { id: 'u1', email: 'user@test.com' };

function makeRequest(
  method: string,
  slug: string,
  body?: Record<string, unknown>,
  queryParams?: Record<string, string>
) {
  const url = new URL(`http://localhost/api/teams/${slug}`);
  if (queryParams) {
    Object.entries(queryParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new NextRequest(url.toString(), {
    method,
    ...(body
      ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : {}),
  });
}

function makeContext(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockGetTeamBySlug.mockResolvedValue(TEAM as never);
  mockGetUserRoleInTeam.mockResolvedValue('admin');
  mockAddTeamMember.mockResolvedValue(undefined);
  mockUpdateMemberRole.mockResolvedValue(undefined);
  mockRemoveTeamMember.mockResolvedValue(undefined);
});

describe('GET /api/teams/[slug]', () => {
  it('returns team with user role', async () => {
    const res = await GET(makeRequest('GET', 'alpha'), makeContext('alpha'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual(TEAM);
    expect(body.userRole).toBe('admin');
    expect(mockGetTeamBySlug).toHaveBeenCalledWith('alpha');
    expect(mockGetUserRoleInTeam).toHaveBeenCalledWith(TEAM.id, USER.id);
  });

  it('returns 404 when team not found', async () => {
    mockGetTeamBySlug.mockResolvedValue(null);
    const res = await GET(makeRequest('GET', 'nonexistent'), makeContext('nonexistent'));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.message).toMatch(/Team not found/i);
  });

  it('returns 401 on auth failure', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError('Unauthorized'));
    const res = await GET(makeRequest('GET', 'alpha'), makeContext('alpha'));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.message).toBe('Unauthorized');
  });
});

describe('POST /api/teams/[slug] — add member', () => {
  it('adds a member to the team', async () => {
    const res = await POST(
      makeRequest('POST', 'alpha', { userId: 'u2', role: 'editor' }),
      makeContext('alpha')
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.added).toBe(true);
    expect(mockAddTeamMember).toHaveBeenCalledWith(TEAM.id, 'u2', 'editor', USER.id);
  });

  it('returns 404 when team not found', async () => {
    mockGetTeamBySlug.mockResolvedValue(null);
    const res = await POST(
      makeRequest('POST', 'none', { userId: 'u2', role: 'editor' }),
      makeContext('none')
    );
    void (await res.json());

    expect(res.status).toBe(404);
  });

  it('returns 403 when caller lacks permissions', async () => {
    mockGetUserRoleInTeam.mockResolvedValue('viewer');
    const res = await POST(
      makeRequest('POST', 'alpha', { userId: 'u2', role: 'editor' }),
      makeContext('alpha')
    );
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error.message).toMatch(/Insufficient permissions/i);
  });

  it('returns 400 when userId is missing', async () => {
    const res = await POST(makeRequest('POST', 'alpha', { role: 'editor' }), makeContext('alpha'));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/userId and role are required/i);
  });

  it('returns 400 for invalid role', async () => {
    const res = await POST(
      makeRequest('POST', 'alpha', { userId: 'u2', role: 'superadmin' }),
      makeContext('alpha')
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/Invalid role/i);
  });

  it('returns 409 on duplicate key error', async () => {
    mockAddTeamMember.mockRejectedValue(new Error('duplicate key value'));
    const res = await POST(
      makeRequest('POST', 'alpha', { userId: 'u2', role: 'editor' }),
      makeContext('alpha')
    );
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error.message).toMatch(/User already in team/i);
  });
});

describe('PATCH /api/teams/[slug] — update member role', () => {
  it('updates a member role', async () => {
    const res = await PATCH(
      makeRequest('PATCH', 'alpha', { userId: 'u2', role: 'viewer' }),
      makeContext('alpha')
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.updated).toBe(true);
    expect(mockUpdateMemberRole).toHaveBeenCalledWith(TEAM.id, 'u2', 'viewer');
  });

  it('returns 400 when assigning owner role', async () => {
    const res = await PATCH(
      makeRequest('PATCH', 'alpha', { userId: 'u2', role: 'owner' }),
      makeContext('alpha')
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/Cannot assign owner role/i);
  });

  it('returns 403 when caller lacks permissions', async () => {
    mockGetUserRoleInTeam.mockResolvedValue('editor');
    const res = await PATCH(
      makeRequest('PATCH', 'alpha', { userId: 'u2', role: 'viewer' }),
      makeContext('alpha')
    );

    expect(res.status).toBe(403);
  });

  it('returns 400 when userId is missing', async () => {
    const res = await PATCH(
      makeRequest('PATCH', 'alpha', { role: 'viewer' }),
      makeContext('alpha')
    );

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/teams/[slug] — remove member', () => {
  it('removes a member from the team', async () => {
    const res = await DELETE(
      makeRequest('DELETE', 'alpha', undefined, { userId: 'u2' }),
      makeContext('alpha')
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.removed).toBe(true);
    expect(mockRemoveTeamMember).toHaveBeenCalledWith(TEAM.id, 'u2');
  });

  it('returns 400 when userId query param is missing', async () => {
    const res = await DELETE(makeRequest('DELETE', 'alpha'), makeContext('alpha'));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/userId query parameter required/i);
  });

  it('returns 400 when trying to remove team owner', async () => {
    const res = await DELETE(
      makeRequest('DELETE', 'alpha', undefined, { userId: TEAM.owner_id }),
      makeContext('alpha')
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/Cannot remove team owner/i);
  });

  it('returns 403 when caller lacks permissions', async () => {
    mockGetUserRoleInTeam.mockResolvedValue('viewer');
    const res = await DELETE(
      makeRequest('DELETE', 'alpha', undefined, { userId: 'u2' }),
      makeContext('alpha')
    );

    expect(res.status).toBe(403);
  });
});
