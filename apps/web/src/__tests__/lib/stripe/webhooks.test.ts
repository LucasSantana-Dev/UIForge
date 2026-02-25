import type Stripe from 'stripe';

const mockUpsert = jest.fn().mockReturnValue({ error: null });
const mockUpdate = jest.fn().mockReturnValue({
  eq: jest.fn().mockReturnValue({ error: null }),
});
const mockSelectEq = jest.fn();
const mockSelect = jest.fn().mockReturnValue({ eq: mockSelectEq });
const mockFrom = jest.fn().mockImplementation((table: string) => {
  if (table === 'stripe_events') {
    return { select: mockSelect, upsert: mockUpsert };
  }
  if (table === 'subscriptions') {
    return { upsert: mockUpsert, update: mockUpdate, select: mockSelect };
  }
  if (table === 'plan_limits') {
    return { select: mockSelect };
  }
  if (table === 'usage_tracking') {
    return { upsert: mockUpsert };
  }
  return { select: mockSelect, upsert: mockUpsert, update: mockUpdate };
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: mockFrom }),
}));

const mockConstructEvent = jest.fn();
const mockRetrieve = jest.fn();
jest.mock('@/lib/stripe/server', () => ({
  getStripe: () => ({
    webhooks: { constructEvent: mockConstructEvent },
    subscriptions: { retrieve: mockRetrieve },
  }),
}));

import {
  verifyWebhookSignature,
  isEventProcessed,
  handleCheckoutCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  processWebhookEvent,
} from '@/lib/stripe/webhooks';

const PRO_PRICE = 'price_pro_test';
const TEAM_PRICE = 'price_team_test';

beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  process.env.STRIPE_PRO_PRICE_ID = PRO_PRICE;
  process.env.STRIPE_TEAM_PRICE_ID = TEAM_PRICE;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSelectEq.mockReturnValue({ single: jest.fn().mockResolvedValue({ data: null }) });
});

function makeSubscription(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
  return {
    id: 'sub_test123',
    status: 'active',
    cancel_at_period_end: false,
    items: {
      data: [
        {
          price: { id: PRO_PRICE },
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
        },
      ],
    } as unknown,
    ...overrides,
  } as Stripe.Subscription;
}

function makeSession(overrides: Partial<Stripe.Checkout.Session> = {}): Stripe.Checkout.Session {
  return {
    id: 'cs_test123',
    customer: 'cus_test123',
    subscription: 'sub_test123',
    metadata: { userId: 'user-uuid-123' },
    ...overrides,
  } as Stripe.Checkout.Session;
}

describe('Stripe Webhooks', () => {
  describe('verifyWebhookSignature', () => {
    it('should call stripe constructEvent with correct params', async () => {
      const mockEvent = { id: 'evt_1', type: 'checkout.session.completed' };
      mockConstructEvent.mockReturnValue(mockEvent);

      const result = await verifyWebhookSignature('body', 'sig_header');

      expect(mockConstructEvent).toHaveBeenCalledWith('body', 'sig_header', 'whsec_test');
      expect(result).toEqual(mockEvent);
    });

    it('should throw when STRIPE_WEBHOOK_SECRET is missing', async () => {
      const saved = process.env.STRIPE_WEBHOOK_SECRET;
      delete process.env.STRIPE_WEBHOOK_SECRET;

      await expect(verifyWebhookSignature('body', 'sig')).rejects.toThrow(
        'STRIPE_WEBHOOK_SECRET not configured'
      );

      process.env.STRIPE_WEBHOOK_SECRET = saved;
    });
  });

  describe('isEventProcessed', () => {
    it('should return true when event is already processed', async () => {
      mockSelectEq.mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { processed: true } }),
      });

      const result = await isEventProcessed('evt_processed');
      expect(result).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('stripe_events');
    });

    it('should return false when event is not found', async () => {
      mockSelectEq.mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: null }),
      });

      const result = await isEventProcessed('evt_new');
      expect(result).toBe(false);
    });

    it('should return false when event exists but not processed', async () => {
      mockSelectEq.mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { processed: false } }),
      });

      const result = await isEventProcessed('evt_pending');
      expect(result).toBe(false);
    });
  });

  describe('handleCheckoutCompleted', () => {
    it('should create subscription for pro plan', async () => {
      const sub = makeSubscription();
      mockRetrieve.mockResolvedValue(sub);

      await handleCheckoutCompleted(makeSession());

      expect(mockRetrieve).toHaveBeenCalledWith('sub_test123');
      expect(mockFrom).toHaveBeenCalledWith('subscriptions');
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-uuid-123',
          stripe_customer_id: 'cus_test123',
          stripe_subscription_id: 'sub_test123',
          plan: 'pro',
          status: 'active',
        }),
        { onConflict: 'user_id' }
      );
    });

    it('should create subscription for team plan', async () => {
      const sub = makeSubscription({
        items: {
          data: [
            {
              price: { id: TEAM_PRICE },
              current_period_start: Math.floor(Date.now() / 1000),
              current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
            },
          ],
        } as unknown,
      } as Partial<Stripe.Subscription>);
      mockRetrieve.mockResolvedValue(sub);

      await handleCheckoutCompleted(makeSession());

      expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ plan: 'team' }), {
        onConflict: 'user_id',
      });
    });

    it('should default to pro for unknown price ID', async () => {
      const sub = makeSubscription({
        items: {
          data: [
            {
              price: { id: 'price_unknown' },
              current_period_start: Math.floor(Date.now() / 1000),
              current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
            },
          ],
        } as unknown,
      } as Partial<Stripe.Subscription>);
      mockRetrieve.mockResolvedValue(sub);

      await handleCheckoutCompleted(makeSession());

      expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ plan: 'pro' }), {
        onConflict: 'user_id',
      });
    });

    it('should skip processing when userId is missing', async () => {
      await handleCheckoutCompleted(makeSession({ metadata: {} }));

      expect(mockRetrieve).not.toHaveBeenCalled();
      expect(mockUpsert).not.toHaveBeenCalled();
    });

    it('should update usage limits after creating subscription', async () => {
      const sub = makeSubscription();
      mockRetrieve.mockResolvedValue(sub);
      mockSelectEq.mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { generations_per_month: 500, max_projects: -1 },
        }),
      });

      await handleCheckoutCompleted(makeSession());

      expect(mockFrom).toHaveBeenCalledWith('plan_limits');
      expect(mockFrom).toHaveBeenCalledWith('usage_tracking');
    });
  });

  describe('handleSubscriptionUpdated', () => {
    it('should update subscription status and plan', async () => {
      const sub = makeSubscription();
      mockSelectEq.mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { user_id: 'user-uuid-123' } }),
      });

      await handleSubscriptionUpdated(sub);

      expect(mockFrom).toHaveBeenCalledWith('subscriptions');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active',
          plan: 'pro',
        })
      );
    });

    it('should revert to free plan when subscription is not active', async () => {
      const sub = makeSubscription({ status: 'past_due' });
      mockSelectEq.mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { user_id: 'user-uuid-123' } }),
      });

      await handleSubscriptionUpdated(sub);

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ plan: 'free' }));
    });

    it('should skip when subscription not found in DB', async () => {
      mockSelectEq.mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: null }),
      });

      await handleSubscriptionUpdated(makeSubscription());

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('handleSubscriptionDeleted', () => {
    it('should reset subscription to free plan', async () => {
      await handleSubscriptionDeleted(makeSubscription());

      expect(mockFrom).toHaveBeenCalledWith('subscriptions');
      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'canceled',
        plan: 'free',
        stripe_subscription_id: null,
        stripe_price_id: null,
        cancel_at_period_end: false,
      });
    });
  });

  describe('processWebhookEvent', () => {
    it('should skip already processed events', async () => {
      mockSelectEq.mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { processed: true } }),
      });

      const event = {
        id: 'evt_processed',
        type: 'checkout.session.completed',
        data: { object: makeSession() },
      } as unknown as Stripe.Event;

      await processWebhookEvent(event);

      expect(mockRetrieve).not.toHaveBeenCalled();
    });

    it('should process checkout.session.completed event', async () => {
      const sub = makeSubscription();
      mockRetrieve.mockResolvedValue(sub);

      const event = {
        id: 'evt_new',
        type: 'checkout.session.completed',
        data: { object: makeSession() },
      } as unknown as Stripe.Event;

      await processWebhookEvent(event);

      expect(mockRetrieve).toHaveBeenCalled();
      expect(mockUpsert).toHaveBeenCalled();
    });

    it('should process customer.subscription.updated event', async () => {
      const sub = makeSubscription();
      mockSelectEq.mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { user_id: 'user-uuid-123' } }),
      });

      const event = {
        id: 'evt_update',
        type: 'customer.subscription.updated',
        data: { object: sub },
      } as unknown as Stripe.Event;

      await processWebhookEvent(event);

      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should process customer.subscription.deleted event', async () => {
      const event = {
        id: 'evt_delete',
        type: 'customer.subscription.deleted',
        data: { object: makeSubscription() },
      } as unknown as Stripe.Event;

      await processWebhookEvent(event);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'canceled', plan: 'free' })
      );
    });

    it('should mark event as processed after handling', async () => {
      const sub = makeSubscription();
      mockRetrieve.mockResolvedValue(sub);

      const event = {
        id: 'evt_mark',
        type: 'checkout.session.completed',
        data: { object: makeSession() },
      } as unknown as Stripe.Event;

      await processWebhookEvent(event);

      expect(mockFrom).toHaveBeenCalledWith('stripe_events');
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'evt_mark',
          type: 'checkout.session.completed',
          processed: true,
        })
      );
    });
  });
});
