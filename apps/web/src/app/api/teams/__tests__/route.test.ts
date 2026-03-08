import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { verifySession } from '@/lib/api/auth';
import { getTeamsForUser, createTeam } from '@/lib/repositories/rbac.repo';
import { UnauthorizedError } from '@/lib/api/errors';

jest.mock('@/lib/api/auth');
jest.mock('@/lib/repositories/rbac.repo');
jest.mock('@/lib/sentry/server', () => ({
  captureServerError: jest.fn(),
}));

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockGetTeamsForUser = getTeamsForUser as jest.MockedFunction<typeof getTeamsForUser>;
const mockCreateTeam = createTeam as jest.MockedFunction<typeof createTeam>;

const mockUser = { id: 'user-123', email: 'test@example.com' } as any;

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifySession.mockResolvedValue({ user: mockUser });
});

describe('GET /api/teams', () => {
  it('returns teams for authenticated user', async () => {
    const teams = [
      {
        id: 't1',
        name: 'Platform',
        slug: 'platform',
        owner_id: 'user-123',
        description: null,
        created_at: '',
        updated_at: '',
      },
    ];
    mockGetTeamsForUser.mockResolvedValue(teams);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual(teams);
    expect(mockGetTeamsForUser).toHaveBeenCalledWith('user-123');
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError());

    const res = await GET();
    expect(res.status).toBe(401);
  });
});

describe('POST /api/teams', () => {
  it('creates team with valid data', async () => {
    const team = {
      id: 't1',
      name: 'Platform',
      slug: 'platform',
      owner_id: 'user-123',
      description: null,
      created_at: '',
      updated_at: '',
    };
    mockCreateTeam.mockResolvedValue(team);

    const req = new NextRequest('http://localhost/api/teams', {
      method: 'POST',
      body: JSON.stringify({ name: 'Platform', slug: 'platform' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data).toEqual(team);
    expect(mockCreateTeam).toHaveBeenCalledWith('Platform', 'platform', 'user-123', undefined);
  });

  it('returns 400 when name missing', async () => {
    const req = new NextRequest('http://localhost/api/teams', {
      method: 'POST',
      body: JSON.stringify({ slug: 'platform' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid slug format', async () => {
    const req = new NextRequest('http://localhost/api/teams', {
      method: 'POST',
      body: JSON.stringify({ name: 'Platform', slug: 'INVALID SLUG!' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 409 for duplicate slug', async () => {
    mockCreateTeam.mockRejectedValue(new Error('duplicate key'));

    const req = new NextRequest('http://localhost/api/teams', {
      method: 'POST',
      body: JSON.stringify({ name: 'Platform', slug: 'platform' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(409);
  });
});
