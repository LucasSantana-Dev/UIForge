import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export interface TestSubscription {
  userId: string;
  plan: 'free' | 'pro' | 'team';
  status?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export async function seedSubscription(opts: TestSubscription) {
  const supabase = getAdminClient();
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id: opts.userId,
      plan: opts.plan,
      status: opts.status ?? 'active',
      stripe_customer_id: opts.stripeCustomerId ?? `cus_test_${crypto.randomUUID().slice(0, 8)}`,
      stripe_subscription_id:
        opts.stripeSubscriptionId ?? `sub_test_${crypto.randomUUID().slice(0, 8)}`,
      stripe_price_id:
        opts.plan === 'pro'
          ? (process.env.STRIPE_PRO_PRICE_ID ?? 'price_pro_test')
          : opts.plan === 'team'
            ? (process.env.STRIPE_TEAM_PRICE_ID ?? 'price_team_test')
            : null,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
    },
    { onConflict: 'user_id' }
  );

  if (error) throw new Error(`seedSubscription failed: ${error.message}`);
}

export async function seedUsageTracking(
  userId: string,
  generationsCount: number,
  generationsLimit: number
) {
  const supabase = getAdminClient();
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  const { error } = await supabase.from('usage_tracking').upsert(
    {
      user_id: userId,
      billing_period_start: periodStart,
      billing_period_end: periodEnd,
      generations_count: generationsCount,
      generations_limit: generationsLimit,
      projects_count: 0,
      projects_limit: -1,
    },
    { onConflict: 'user_id,billing_period_start' }
  );

  if (error) throw new Error(`seedUsageTracking failed: ${error.message}`);
}

export async function cleanupTestBilling(userId: string) {
  const supabase = getAdminClient();

  await supabase.from('usage_tracking').delete().eq('user_id', userId);
  await supabase.from('stripe_events').delete().like('id', 'evt_test_%');
  await supabase
    .from('subscriptions')
    .update({
      plan: 'free',
      status: 'active',
      stripe_customer_id: null,
      stripe_subscription_id: null,
      stripe_price_id: null,
      cancel_at_period_end: false,
    })
    .eq('user_id', userId);
}

export function generateStripeWebhookSignature(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${timestamp}.${payload}`);
  const signature = hmac.digest('hex');
  return `t=${timestamp},v1=${signature}`;
}
