import { GET } from '@/app/api/usage/current/route';
import { UnauthorizedError } from '@/lib/api/errors';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));

const mockFrom = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      from: mockFrom,
    })
  ),
}));

import { verifySession } from '@/lib/api/auth';
const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;

const USER = { id: 'u1', email: 't@t.com' };

const SUB = {
  plan: 'free',
  status: 'active',
  current_period_end: null,
  cancel_at_period_end: false,
};
const LIMITS = [
  { plan: 'free', generations_per_month: 10, max_projects: 2 },
  { plan: 'pro', generations_per_month: 100, max_projects: 20 },
];

function setupMocks(options: {
  usageData?: Record<string, unknown> | null;
  sub?: Record<string, unknown> | null;
  genCount?: number;
  projCount?: number;
  limits?: typeof LIMITS;
}) {
  const {
    usageData = {
      generations_count: 3,
      tokens_used: 1000,
      projects_count: 1,
      generations_limit: 10,
      projects_limit: 2,
    },
    sub = SUB,
    genCount = 3,
    projCount = 1,
    limits = LIMITS,
  } = options;

  mockFrom.mockImplementation((table: string) => {
    if (table === 'usage_tracking') {
      // First call — single row usage
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: usageData, error: null }),
      };
    }
    if (table === 'subscriptions') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: sub, error: null }),
      };
    }
    if (table === 'generations') {
      // count query — head:true returns { count }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ count: genCount, error: null }),
      };
    }
    if (table === 'projects') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ count: projCount, error: null }),
      };
    }
    if (table === 'plan_limits') {
      return {
        select: jest.fn().mockResolvedValue({ data: limits, error: null }),
      };
    }
    return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis() };
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  setupMocks({});
});

describe('GET /api/usage/current', () => {
  it('returns combined usage, subscription, and totals', async () => {
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.subscription.plan).toBe('free');
    expect(body.generations_total).toBe(3);
    expect(body.usage.generations_limit).toBe(10);
    expect(body.usage.projects_limit).toBe(2);
  });

  it('falls back to default limits when plan_limits empty', async () => {
    setupMocks({ limits: [] });
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.usage.generations_limit).toBe(10); // default
    expect(body.usage.projects_limit).toBe(2); // default
  });

  it('uses default subscription when no subscription row', async () => {
    setupMocks({ sub: null });
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.subscription.plan).toBe('free');
    expect(body.subscription.status).toBe('active');
  });

  it('uses zero counts when no usage_tracking row', async () => {
    setupMocks({ usageData: null });
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.usage.generations_count).toBe(0);
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError('Unauthorized'));
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toMatch(/unauthorized/i);
  });

  it('returns 500 on unexpected DB error', async () => {
    mockFrom.mockImplementation(() => {
      throw new Error('crash');
    });
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/failed to fetch usage/i);
  });
});
