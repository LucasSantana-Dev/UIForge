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

const USER = { id: 'u1', email: 't@t.com' };
const TEAM = { id: 't1', name: 'Acme', slug: 'acme', owner_id: 'u1' };

function makeContext(slug = 'acme') {
  return { params: Promise.resolve({ slug }) };
}

function makeRequest(
  method = 'GET',
  body?: Record<string, unknown>,
  queryParams?: Record<string, string>
) {
  const url = new URL(`http://localhost/api/teams/acme`);
  if (queryParams) {
    Object.entries(queryParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new NextRequest(url.toString(), {
    method,
    ...(body && { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockGetTeamBySlug.mockResolvedValue(TEAM as never);
  mockGetUserRoleInTeam.mockResolvedValue('owner' as never);
  mockAddTeamMember.mockResolvedValue(undefined);
  mockUpdateMemberRole.mockResolvedValue(undefined);
  mockRemoveTeamMember.mockResolvedValue(undefined);
});

describe('GET /api/teams/[slug]', () => {
  it('returns team with user role', async () => {
    const res = await GET(makeRequest(), makeContext());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.slug).toBe('acme');
    expect(body.userRole).toBe('owner');
  });

  it('returns 404 when team not found', async () => {
    mockGetTeamBySlug.mockResolvedValue(null as never);
    const res = await GET(makeRequest(), makeContext());
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.error.message).toMatch(/team not found/i);
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError('Unauthorized'));
    const res = await GET(makeRequest(), makeContext());
    expect(res.status).toBe(401);
  });
});

describe('POST /api/teams/[slug] (add member)', () => {
  it('adds member as admin/owner', async () => {
    const res = await POST(makeRequest('POST', { userId: 'u2', role: 'editor' }), makeContext());
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.added).toBe(true);
    expect(mockAddTeamMember).toHaveBeenCalledWith('t1', 'u2', 'editor', 'u1');
  });

  it('returns 403 when caller is not admin/owner', async () => {
    mockGetUserRoleInTeam.mockResolvedValue('viewer' as never);
    const res = await POST(makeRequest('POST', { userId: 'u2', role: 'editor' }), makeContext());
    const body = await res.json();
    expect(res.status).toBe(403);
    expect(body.error.message).toMatch(/insufficient permissions/i);
  });

  it('returns 400 when role is invalid', async () => {
    const res = await POST(
      makeRequest('POST', { userId: 'u2', role: 'superadmin' }),
      makeContext()
    );
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/invalid role/i);
  });

  it('returns 400 when userId is missing', async () => {
    const res = await POST(makeRequest('POST', { role: 'editor' }), makeContext());
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/userId and role are required/i);
  });

  it('returns 409 on duplicate membership', async () => {
    mockAddTeamMember.mockRejectedValue(
      new Error('duplicate key value violates unique constraint')
    );
    const res = await POST(makeRequest('POST', { userId: 'u2', role: 'editor' }), makeContext());
    const body = await res.json();
    expect(res.status).toBe(409);
    expect(body.error.message).toMatch(/already in team/i);
  });
});

describe('PATCH /api/teams/[slug] (update member role)', () => {
  it('updates member role', async () => {
    const res = await PATCH(makeRequest('PATCH', { userId: 'u2', role: 'editor' }), makeContext());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.updated).toBe(true);
    expect(mockUpdateMemberRole).toHaveBeenCalledWith('t1', 'u2', 'editor');
  });

  it('returns 400 when trying to assign owner role', async () => {
    const res = await PATCH(makeRequest('PATCH', { userId: 'u2', role: 'owner' }), makeContext());
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/cannot assign owner role/i);
  });

  it('returns 403 when caller lacks admin/owner role', async () => {
    mockGetUserRoleInTeam.mockResolvedValue('editor' as never);
    const res = await PATCH(makeRequest('PATCH', { userId: 'u2', role: 'viewer' }), makeContext());
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/teams/[slug] (remove member)', () => {
  it('removes a member from the team', async () => {
    const res = await DELETE(makeRequest('DELETE', undefined, { userId: 'u2' }), makeContext());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.removed).toBe(true);
    expect(mockRemoveTeamMember).toHaveBeenCalledWith('t1', 'u2');
  });

  it('returns 400 when userId query param is missing', async () => {
    const res = await DELETE(makeRequest('DELETE'), makeContext());
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/userId query parameter required/i);
  });

  it('returns 400 when trying to remove the team owner', async () => {
    const res = await DELETE(makeRequest('DELETE', undefined, { userId: 'u1' }), makeContext());
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/cannot remove team owner/i);
  });

  it('returns 403 when caller lacks permissions', async () => {
    mockGetUserRoleInTeam.mockResolvedValue('viewer' as never);
    const res = await DELETE(makeRequest('DELETE', undefined, { userId: 'u2' }), makeContext());
    expect(res.status).toBe(403);
  });
});
