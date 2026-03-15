import { POST } from '@/app/api/stripe/create-portal-session/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/features/flags', () => ({ getFeatureFlag: jest.fn() }));
jest.mock('@/lib/stripe/server', () => ({ getStripe: jest.fn() }));

const mockSingle = jest.fn();
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

import { verifySession } from '@/lib/api/auth';
import { getFeatureFlag } from '@/lib/features/flags';
import { getStripe } from '@/lib/stripe/server';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockGetFeatureFlag = getFeatureFlag as jest.MockedFunction<typeof getFeatureFlag>;
const mockGetStripe = getStripe as jest.MockedFunction<typeof getStripe>;

const USER = { id: 'u1', email: 'user@test.com' };

const mockStripe = {
  billingPortal: {
    sessions: {
      create: jest.fn(),
    },
  },
};

function makeRequest() {
  return new NextRequest('http://localhost/api/stripe/create-portal-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetFeatureFlag.mockReturnValue(true);
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockGetStripe.mockReturnValue(mockStripe as never);
  mockSingle.mockResolvedValue({ data: { stripe_customer_id: 'cus_123' }, error: null });
  mockStripe.billingPortal.sessions.create.mockResolvedValue({
    url: 'https://billing.stripe.com/portal/abc',
  });
});

describe('POST /api/stripe/create-portal-session', () => {
  it('creates portal session for user with subscription', async () => {
    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toBe('https://billing.stripe.com/portal/abc');
    expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_123',
      })
    );
  });

  it('returns 403 when billing is disabled', async () => {
    mockGetFeatureFlag.mockReturnValue(false);
    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toMatch(/Billing is not enabled/i);
  });

  it('returns 400 when user has no subscription', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });
    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/No active subscription found/i);
  });

  it('returns 400 when subscription has no stripe_customer_id', async () => {
    mockSingle.mockResolvedValue({ data: { stripe_customer_id: null }, error: null });
    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/No active subscription found/i);
  });

  it('returns 500 on unexpected error', async () => {
    mockStripe.billingPortal.sessions.create.mockRejectedValue(new Error('stripe error'));
    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/Failed to create portal session/i);
  });
});
