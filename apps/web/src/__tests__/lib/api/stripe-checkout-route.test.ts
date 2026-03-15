import { POST } from '@/app/api/stripe/create-checkout-session/route';
import { NextRequest } from 'next/server';
import { UnauthorizedError } from '@/lib/api/errors';

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
  customers: {
    create: jest.fn(),
  },
  checkout: {
    sessions: {
      create: jest.fn(),
    },
  },
};

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetFeatureFlag.mockReturnValue(true);
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockGetStripe.mockReturnValue(mockStripe as never);
  mockSingle.mockResolvedValue({ data: { stripe_customer_id: 'cus_existing' }, error: null });
  mockStripe.checkout.sessions.create.mockResolvedValue({
    url: 'https://checkout.stripe.com/session/abc',
  });
});

describe('POST /api/stripe/create-checkout-session', () => {
  it('creates checkout session with existing customer', async () => {
    const res = await POST(makeRequest({ priceId: 'price_pro' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toBe('https://checkout.stripe.com/session/abc');
    expect(mockStripe.customers.create).not.toHaveBeenCalled();
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_existing',
        line_items: [{ price: 'price_pro', quantity: 1 }],
        mode: 'subscription',
      })
    );
  });

  it('creates new customer when none exists', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });
    mockStripe.customers.create.mockResolvedValue({ id: 'cus_new' });

    const res = await POST(makeRequest({ priceId: 'price_pro' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockStripe.customers.create).toHaveBeenCalledWith({
      email: USER.email,
      metadata: { userId: USER.id },
    });
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_new' })
    );
    expect(body.url).toBeDefined();
  });

  it('returns 403 when billing is disabled', async () => {
    mockGetFeatureFlag.mockReturnValue(false);
    const res = await POST(makeRequest({ priceId: 'price_pro' }));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toMatch(/Billing is not enabled/i);
  });

  it('returns 400 when priceId is missing', async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Price ID is required/i);
  });

  it('returns 500 on unexpected error', async () => {
    mockStripe.checkout.sessions.create.mockRejectedValue(new Error('stripe error'));
    const res = await POST(makeRequest({ priceId: 'price_pro' }));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/Failed to create checkout session/i);
  });
});
