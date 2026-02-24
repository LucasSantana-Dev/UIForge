import { createClient } from '@/lib/supabase/server';

export interface UserQuota {
  plan: string;
  generationsPerMonth: number;
  maxProjects: number;
  maxComponentsPerProject: number;
  features: Record<string, boolean>;
}

export async function getUserQuota(userId: string): Promise<UserQuota> {
  const supabase = await createClient();

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single();

  const plan = sub?.plan ?? 'free';

  const { data: limits } = await supabase.from('plan_limits').select('*').eq('plan', plan).single();

  return {
    plan,
    generationsPerMonth: limits?.generations_per_month ?? 10,
    maxProjects: limits?.max_projects ?? 2,
    maxComponentsPerProject: limits?.max_components_per_project ?? 50,
    features: (limits?.features as Record<string, boolean>) ?? {},
  };
}
