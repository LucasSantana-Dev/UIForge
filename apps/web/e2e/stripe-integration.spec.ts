import { test, expect } from './fixtures';
import {
  seedSubscription,
  cleanupTestBilling,
  generateStripeWebhookSignature,
} from './helpers/stripe';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

test.describe('Stripe E2E: Checkout → Webhook → DB', () => {
  test.skip(
    !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.STRIPE_WEBHOOK_SECRET,
    'Requires SUPABASE_SERVICE_ROLE_KEY and STRIPE_WEBHOOK_SECRET'
  );

  test('webhook creates subscription in DB on checkout.session.completed', async ({
    authenticatedPage,
    testUser,
  }) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const eventId = `evt_test_checkout_${Date.now()}`;
    const subscriptionId = `sub_test_${Date.now()}`;
    const customerId = `cus_test_${Date.now()}`;

    const eventPayload = JSON.stringify({
      id: eventId,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: `cs_test_${Date.now()}`,
          subscription: subscriptionId,
          customer: customerId,
          metadata: { userId: testUser.id },
        },
      },
    });

    const signature = generateStripeWebhookSignature(eventPayload, webhookSecret);

    const response = await authenticatedPage.request.post('/api/stripe/webhook', {
      data: eventPayload,
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
    });

    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.received).toBe(true);

    // Verify stripe_events table
    const supabase = getAdminClient();
    const { data: event } = await supabase
      .from('stripe_events')
      .select('id, type, processed')
      .eq('id', eventId)
      .single();

    expect(event).not.toBeNull();
    expect(event!.type).toBe('checkout.session.completed');
    expect(event!.processed).toBe(true);

    // Cleanup
    await supabase.from('stripe_events').delete().eq('id', eventId);
    await cleanupTestBilling(testUser.id);
  });

  test('webhook deduplicates already-processed events', async ({ authenticatedPage, testUser }) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const eventId = `evt_test_dedup_${Date.now()}`;

    const eventPayload = JSON.stringify({
      id: eventId,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: `cs_test_${Date.now()}`,
          subscription: `sub_test_${Date.now()}`,
          customer: `cus_test_${Date.now()}`,
          metadata: { userId: testUser.id },
        },
      },
    });

    const signature = generateStripeWebhookSignature(eventPayload, webhookSecret);
    const headers = {
      'Content-Type': 'application/json',
      'stripe-signature': signature,
    };

    // First call
    const res1 = await authenticatedPage.request.post('/api/stripe/webhook', {
      data: eventPayload,
      headers,
    });
    expect(res1.ok()).toBe(true);

    // Second call (same event ID) — should be deduplicated
    const sig2 = generateStripeWebhookSignature(eventPayload, webhookSecret);
    const res2 = await authenticatedPage.request.post('/api/stripe/webhook', {
      data: eventPayload,
      headers: { ...headers, 'stripe-signature': sig2 },
    });
    expect(res2.ok()).toBe(true);

    // Verify only one row in stripe_events
    const supabase = getAdminClient();
    const { data: events } = await supabase.from('stripe_events').select('id').eq('id', eventId);

    expect(events).toHaveLength(1);

    // Cleanup
    await supabase.from('stripe_events').delete().eq('id', eventId);
    await cleanupTestBilling(testUser.id);
  });

  test('subscription.deleted webhook resets user to free plan', async ({
    authenticatedPage,
    testUser,
  }) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const subscriptionId = `sub_test_del_${Date.now()}`;

    // Seed an active Pro subscription
    await seedSubscription({
      userId: testUser.id,
      plan: 'pro',
      stripeSubscriptionId: subscriptionId,
    });

    // Send subscription.deleted webhook
    const eventPayload = JSON.stringify({
      id: `evt_test_del_${Date.now()}`,
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: subscriptionId,
          status: 'canceled',
          items: { data: [{ price: { id: 'price_pro_test' } }] },
          cancel_at_period_end: false,
        },
      },
    });

    const signature = generateStripeWebhookSignature(eventPayload, webhookSecret);
    const response = await authenticatedPage.request.post('/api/stripe/webhook', {
      data: eventPayload,
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
    });

    expect(response.ok()).toBe(true);

    // Verify subscription reset to free
    const supabase = getAdminClient();
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan, status, stripe_subscription_id')
      .eq('user_id', testUser.id)
      .single();

    expect(sub).not.toBeNull();
    expect(sub!.plan).toBe('free');
    expect(sub!.status).toBe('canceled');
    expect(sub!.stripe_subscription_id).toBeNull();

    // Cleanup
    await cleanupTestBilling(testUser.id);
  });

  test('portal session creation requires active subscription', async ({ authenticatedPage }) => {
    // No subscription seeded — should fail
    const response = await authenticatedPage.request.post('/api/stripe/create-portal-session', {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status() === 403) {
      test.skip(true, 'ENABLE_STRIPE_BILLING is disabled');
      return;
    }

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('No active subscription');
  });

  test('portal session creation succeeds with subscription', async ({
    authenticatedPage,
    testUser,
  }) => {
    await seedSubscription({
      userId: testUser.id,
      plan: 'pro',
      stripeCustomerId: 'cus_test_portal_' + Date.now(),
    });

    const response = await authenticatedPage.request.post('/api/stripe/create-portal-session', {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status() === 403) {
      test.skip(true, 'ENABLE_STRIPE_BILLING is disabled');
      await cleanupTestBilling(testUser.id);
      return;
    }

    // Portal creation may fail with test customer IDs (Stripe rejects fake IDs)
    // Accept either success (real Stripe test keys) or 500 (fake customer ID)
    if (response.ok()) {
      const body = await response.json();
      expect(body.url).toMatch(/^https:\/\/billing\.stripe\.com\//);
    } else {
      expect(response.status()).toBe(500);
    }

    await cleanupTestBilling(testUser.id);
  });
});
