import type Stripe from 'stripe';

const mockUpsert = jest.fn().mockReturnValue({ data: null, error: null });
const mockUpdate = jest.fn().mockReturnValue({
  eq: jest.fn().mockReturnValue({ data: null, error: null }),
});
const mockFrom = jest.fn().mockImplementation((table: string) => {
  if (table === 'stripe_events') {
    return {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null }),
        }),
      }),
      upsert: jest.fn(),
    };
  }
  if (table === 'plan_limits') {
    return {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { generations_per_month: 500, max_projects: -1 },
          }),
        }),
      }),
    };
  }
  if (table === 'usage_tracking') {
    return { upsert: jest.fn().mockReturnValue({ data: null, error: null }) };
  }
  return {
    upsert: mockUpsert,
    update: mockUpdate,
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { user_id: 'user-123' },
          error: null,
        }),
      }),
    }),
  };
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: mockFrom })),
}));

let mockRetrieveResult: unknown = null;

jest.mock('@/lib/stripe/server', () => ({
  getStripe: jest.fn(() => ({
    subscriptions: {
      retrieve: jest.fn().mockImplementation(() => Promise.resolve(mockRetrieveResult)),
    },
    webhooks: { constructEvent: jest.fn() },
  })),
}));

function makeSubscription(priceId: string, subId = 'sub_123') {
  return {
    id: subId,
    status: 'active',
    cancel_at_period_end: false,
    items: {
      data: [
        {
          price: { id: priceId },
          current_period_start: 1700000000,
          current_period_end: 1702592000,
        },
      ],
    },
  };
}

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  process.env = {
    ...ORIGINAL_ENV,
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-key',
    STRIPE_PRO_PRICE_ID: 'price_pro_123',
    STRIPE_TEAM_PRICE_ID: 'price_team_456',
  };
  mockUpsert.mockClear();
  mockUpdate.mockClear();
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('Webhook Plan Detection', () => {
  it('should detect pro plan from price ID', async () => {
    mockRetrieveResult = makeSubscription('price_pro_123');
    const { handleCheckoutCompleted } = await import('@/lib/stripe/webhooks');

    await handleCheckoutCompleted({
      metadata: { userId: 'user-123' },
      subscription: 'sub_123',
      customer: 'cus_123',
    } as unknown as Stripe.Checkout.Session);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ plan: 'pro' }),
      expect.any(Object)
    );
  });

  it('should detect team plan from price ID', async () => {
    mockRetrieveResult = makeSubscription('price_team_456');
    const { handleCheckoutCompleted } = await import('@/lib/stripe/webhooks');

    await handleCheckoutCompleted({
      metadata: { userId: 'user-456' },
      subscription: 'sub_456',
      customer: 'cus_456',
    } as unknown as Stripe.Checkout.Session);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ plan: 'team' }),
      expect.any(Object)
    );
  });

  it('should default to pro for unknown price ID', async () => {
    mockRetrieveResult = makeSubscription('price_unknown_789');
    const { handleCheckoutCompleted } = await import('@/lib/stripe/webhooks');

    await handleCheckoutCompleted({
      metadata: { userId: 'user-789' },
      subscription: 'sub_789',
      customer: 'cus_789',
    } as unknown as Stripe.Checkout.Session);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ plan: 'pro' }),
      expect.any(Object)
    );
  });

  it('should skip if no userId in session metadata', async () => {
    mockRetrieveResult = makeSubscription('price_pro_123');
    const { handleCheckoutCompleted } = await import('@/lib/stripe/webhooks');

    await handleCheckoutCompleted({
      metadata: {},
      subscription: 'sub_123',
      customer: 'cus_123',
    } as unknown as Stripe.Checkout.Session);

    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('should revert to free on subscription cancellation', async () => {
    const { handleSubscriptionDeleted } = await import('@/lib/stripe/webhooks');

    await handleSubscriptionDeleted({
      id: 'sub_123',
    } as unknown as Stripe.Subscription);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'canceled', plan: 'free' })
    );
  });
});
