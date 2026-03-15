import { GET, POST } from '@/app/api/teams/route';
import { NextRequest } from 'next/server';
import { UnauthorizedError } from '@/lib/api/errors';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));
jest.mock('@/lib/repositories/rbac.repo', () => ({
  getTeamsForUser: jest.fn(),
  createTeam: jest.fn(),
}));

import { verifySession } from '@/lib/api/auth';
import { getTeamsForUser, createTeam } from '@/lib/repositories/rbac.repo';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockGetTeamsForUser = getTeamsForUser as jest.MockedFunction<typeof getTeamsForUser>;
const mockCreateTeam = createTeam as jest.MockedFunction<typeof createTeam>;

const USER = { id: 'u1', email: 't@t.com' };
const TEAMS = [
  { id: 't1', name: 'Acme', slug: 'acme', owner_id: 'u1' },
  { id: 't2', name: 'Beta', slug: 'beta', owner_id: 'u1' },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockGetTeamsForUser.mockResolvedValue(TEAMS as never);
  mockCreateTeam.mockResolvedValue({
    id: 't3',
    name: 'Gamma',
    slug: 'gamma',
    owner_id: 'u1',
  } as never);
});

describe('GET /api/teams', () => {
  it('returns teams for authenticated user', async () => {
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(mockGetTeamsForUser).toHaveBeenCalledWith('u1');
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError('Unauthorized'));
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.message).toMatch(/unauthorized/i);
  });

  it('returns 500 on service error', async () => {
    mockGetTeamsForUser.mockRejectedValue(new Error('DB error'));
    const res = await GET();

    expect(res.status).toBe(500);
  });
});

describe('POST /api/teams', () => {
  function makeRequest(body: Record<string, unknown>) {
    return new NextRequest('http://localhost/api/teams', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('creates a team with valid payload', async () => {
    const res = await POST(makeRequest({ name: 'Gamma', slug: 'gamma', description: 'A team' }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.slug).toBe('gamma');
    expect(mockCreateTeam).toHaveBeenCalledWith('Gamma', 'gamma', 'u1', 'A team');
  });

  it('returns 400 when name or slug is missing', async () => {
    const res = await POST(makeRequest({ name: 'Gamma' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/name and slug are required/i);
  });

  it('returns 400 for invalid slug format', async () => {
    const res = await POST(makeRequest({ name: 'Bad Team', slug: 'Bad_Team!' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/slug must be lowercase/i);
  });

  it('returns 409 on duplicate slug', async () => {
    mockCreateTeam.mockRejectedValue(new Error('duplicate key value violates unique constraint'));
    const res = await POST(makeRequest({ name: 'Acme', slug: 'acme' }));
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error.message).toMatch(/already exists/i);
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError('Unauthorized'));
    const res = await POST(makeRequest({ name: 'X', slug: 'x' }));

    expect(res.status).toBe(401);
  });
});
