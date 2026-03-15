import { GET } from '@/app/api/campaigns/reengagement/route';

// Route uses @supabase/supabase-js directly (service role), not @/lib/supabase/server
const mockListUsers = jest.fn();
const mockGenerationsSelect = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table: string) => {
      if (table === 'generations') {
        return {
          select: jest.fn(() => ({
            not: mockGenerationsSelect,
          })),
        };
      }
      return {};
    }),
    auth: { admin: { listUsers: mockListUsers } },
  })),
}));

jest.mock('@/lib/email/auth-emails', () => ({
  sendReengagementEmail: jest.fn().mockResolvedValue(undefined),
}));

import { sendReengagementEmail } from '@/lib/email/auth-emails';
const mockSendReengagementEmail = sendReengagementEmail as jest.MockedFunction<
  typeof sendReengagementEmail
>;

const CRON_SECRET = 'test-cron-secret';

// Users who have never generated anything
const NEW_USER = {
  id: 'new-user-1',
  email: 'newuser@test.com',
  email_confirmed_at: '2026-03-10T10:00:00Z',
  created_at: '2026-03-10T10:00:00Z',
  updated_at: '2026-03-10T10:00:01Z',
  user_metadata: { full_name: 'Alice Smith' },
  app_metadata: {},
};

// Users who have already generated
const ACTIVE_USER = {
  id: 'active-user-1',
  email: 'active@test.com',
  email_confirmed_at: '2026-03-10T10:00:00Z',
  created_at: '2026-03-10T10:00:00Z',
  updated_at: '2026-03-10T10:00:01Z',
  user_metadata: {},
  app_metadata: {},
};

function makeRequest(options: { secret?: string } = {}) {
  return new Request('http://localhost/api/campaigns/reengagement', {
    headers: options.secret !== undefined ? { authorization: `Bearer ${options.secret}` } : {},
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.CRON_SECRET = CRON_SECRET;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

  // No active users by default (no generations)
  mockGenerationsSelect.mockResolvedValue({ data: [] });
  mockListUsers.mockResolvedValue({
    data: { users: [NEW_USER] },
    error: null,
  });
});

afterEach(() => {
  delete process.env.CRON_SECRET;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

describe('GET /api/campaigns/reengagement', () => {
  it('sends reengagement emails to eligible users', async () => {
    const res = await GET(makeRequest({ secret: CRON_SECRET }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.sent).toBe(1);
    expect(body.failed).toBe(0);
    expect(body.total).toBe(1);
    expect(mockSendReengagementEmail).toHaveBeenCalledWith(
      NEW_USER.email,
      'Alice' // extracted from full_name
    );
  });

  it('excludes users who have already generated', async () => {
    // active-user-1 has generations
    mockGenerationsSelect.mockResolvedValue({
      data: [{ user_id: ACTIVE_USER.id }],
    });
    mockListUsers.mockResolvedValue({
      data: { users: [NEW_USER, ACTIVE_USER] },
      error: null,
    });

    const res = await GET(makeRequest({ secret: CRON_SECRET }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.total).toBe(1); // only NEW_USER
    expect(mockSendReengagementEmail).toHaveBeenCalledTimes(1);
    expect(mockSendReengagementEmail).toHaveBeenCalledWith(NEW_USER.email, 'Alice');
  });

  it('returns 401 when CRON_SECRET is not configured', async () => {
    delete process.env.CRON_SECRET;

    const res = await GET(makeRequest({ secret: CRON_SECRET }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
    expect(mockSendReengagementEmail).not.toHaveBeenCalled();
  });

  it('returns 401 when authorization header is missing', async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 401 when authorization token is wrong', async () => {
    const res = await GET(makeRequest({ secret: 'wrong-secret' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 0 sent when no eligible users exist', async () => {
    mockListUsers.mockResolvedValue({ data: { users: [] }, error: null });

    const res = await GET(makeRequest({ secret: CRON_SECRET }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.sent).toBe(0);
    expect(body.message).toMatch(/No eligible users/i);
    expect(mockSendReengagementEmail).not.toHaveBeenCalled();
  });

  it('excludes users without confirmed email', async () => {
    const unconfirmedUser = { ...NEW_USER, email_confirmed_at: null };
    mockListUsers.mockResolvedValue({
      data: { users: [unconfirmedUser] },
      error: null,
    });

    const res = await GET(makeRequest({ secret: CRON_SECRET }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.sent).toBe(0);
  });

  it('reports partial failures when some sends fail', async () => {
    const secondUser = { ...NEW_USER, id: 'new-user-2', email: 'second@test.com' };
    mockListUsers.mockResolvedValue({
      data: { users: [NEW_USER, secondUser] },
      error: null,
    });
    mockSendReengagementEmail
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Email service error'));

    const res = await GET(makeRequest({ secret: CRON_SECRET }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.sent).toBe(1);
    expect(body.failed).toBe(1);
    expect(body.total).toBe(2);
  });

  it('sends without firstName when user metadata has no full_name', async () => {
    const noNameUser = { ...NEW_USER, user_metadata: {} };
    mockListUsers.mockResolvedValue({
      data: { users: [noNameUser] },
      error: null,
    });

    await GET(makeRequest({ secret: CRON_SECRET }));

    expect(mockSendReengagementEmail).toHaveBeenCalledWith(noNameUser.email, undefined);
  });
});
