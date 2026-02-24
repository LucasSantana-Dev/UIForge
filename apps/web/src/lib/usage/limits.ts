import { createClient } from '@/lib/supabase/server';
import { getFeatureFlag } from '@/lib/features/flags';

function getCurrentPeriodStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export interface UsageCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}

export async function checkGenerationQuota(userId: string): Promise<UsageCheckResult> {
  if (!getFeatureFlag('ENABLE_USAGE_LIMITS')) {
    return { allowed: true, current: 0, limit: -1, remaining: -1 };
  }

  const supabase = await createClient();
  const periodStart = getCurrentPeriodStart();

  const { data } = await supabase
    .from('usage_tracking')
    .select('generations_count, generations_limit')
    .eq('user_id', userId)
    .eq('billing_period_start', periodStart)
    .single();

  if (!data) {
    return { allowed: true, current: 0, limit: 10, remaining: 10 };
  }

  if (data.generations_limit === -1) {
    return {
      allowed: true,
      current: data.generations_count,
      limit: -1,
      remaining: -1,
    };
  }

  const remaining = data.generations_limit - data.generations_count;
  return {
    allowed: remaining > 0,
    current: data.generations_count,
    limit: data.generations_limit,
    remaining: Math.max(0, remaining),
  };
}

export async function checkProjectQuota(userId: string): Promise<UsageCheckResult> {
  if (!getFeatureFlag('ENABLE_USAGE_LIMITS')) {
    return { allowed: true, current: 0, limit: -1, remaining: -1 };
  }

  const supabase = await createClient();

  const { count } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single();

  const { data: limits } = await supabase
    .from('plan_limits')
    .select('max_projects')
    .eq('plan', sub?.plan ?? 'free')
    .single();

  const current = count ?? 0;
  const limit = limits?.max_projects ?? 2;

  if (limit === -1) {
    return { allowed: true, current, limit: -1, remaining: -1 };
  }

  const remaining = limit - current;
  return {
    allowed: remaining > 0,
    current,
    limit,
    remaining: Math.max(0, remaining),
  };
}
