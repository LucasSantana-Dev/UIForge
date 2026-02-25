import type Stripe from 'stripe';
import { getStripe } from './server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service config missing');
  return createClient(url, key);
}

function getPlanFromPriceId(priceId: string | undefined): string {
  if (!priceId) return 'free';
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro';
  if (priceId === process.env.STRIPE_TEAM_PRICE_ID) return 'team';
  return 'pro';
}

function getItemPeriod(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];
  return {
    start: item
      ? new Date(item.current_period_start * 1000).toISOString()
      : new Date().toISOString(),
    end: item ? new Date(item.current_period_end * 1000).toISOString() : new Date().toISOString(),
  };
}

export async function verifyWebhookSignature(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  return stripe.webhooks.constructEvent(body, signature, secret);
}

export async function isEventProcessed(eventId: string): Promise<boolean> {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('stripe_events')
    .select('processed')
    .eq('id', eventId)
    .single();
  return data?.processed === true;
}

async function markEventProcessed(eventId: string, type: string, payload: unknown) {
  const supabase = getServiceClient();
  await supabase.from('stripe_events').upsert({ id: eventId, type, processed: true, payload });
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = getServiceClient();
  const userId = session.metadata?.userId;
  if (!userId) return;

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const period = getItemPeriod(subscription);

  await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0]?.price.id,
      plan: getPlanFromPriceId(subscription.items.data[0]?.price.id),
      status: 'active',
      current_period_start: period.start,
      current_period_end: period.end,
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
    { onConflict: 'user_id' }
  );

  await updateUsageLimits(userId, getPlanFromPriceId(subscription.items.data[0]?.price.id));
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = getServiceClient();

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!sub) return;

  const priceId = subscription.items.data[0]?.price.id;
  const plan = subscription.status === 'active' ? getPlanFromPriceId(priceId) : 'free';
  const period = getItemPeriod(subscription);

  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status as string,
      plan,
      stripe_price_id: subscription.items.data[0]?.price.id,
      current_period_start: period.start,
      current_period_end: period.end,
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id);

  await updateUsageLimits(sub.user_id, plan);
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = getServiceClient();

  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      plan: 'free',
      stripe_subscription_id: null,
      stripe_price_id: null,
      cancel_at_period_end: false,
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function updateUsageLimits(userId: string, plan: string) {
  const supabase = getServiceClient();
  const { data: limits } = await supabase
    .from('plan_limits')
    .select('generations_per_month, max_projects')
    .eq('plan', plan)
    .single();

  if (!limits) return;

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  await supabase.from('usage_tracking').upsert(
    {
      user_id: userId,
      billing_period_start: periodStart.toISOString(),
      billing_period_end: periodEnd.toISOString(),
      generations_limit: limits.generations_per_month,
      projects_limit: limits.max_projects,
    },
    { onConflict: 'user_id,billing_period_start' }
  );
}

export async function processWebhookEvent(event: Stripe.Event) {
  if (await isEventProcessed(event.id)) return;

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
  }

  await markEventProcessed(event.id, event.type, event.data.object);
}
