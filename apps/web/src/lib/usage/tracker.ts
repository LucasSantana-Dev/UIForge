import { createClient } from '@/lib/supabase/server';

function getCurrentPeriod() {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
  };
}

export async function incrementGenerationCount(userId: string) {
  const supabase = await createClient();
  const period = getCurrentPeriod();

  const { data: existing } = await supabase
    .from('usage_tracking')
    .select('id, generations_count')
    .eq('user_id', userId)
    .eq('billing_period_start', period.start)
    .single();

  if (existing) {
    await supabase
      .from('usage_tracking')
      .update({ generations_count: existing.generations_count + 1 })
      .eq('id', existing.id);
  } else {
    await supabase.from('usage_tracking').insert({
      user_id: userId,
      billing_period_start: period.start,
      billing_period_end: period.end,
      generations_count: 1,
      generations_limit: 10,
      projects_limit: 2,
    });
  }
}

export async function incrementProjectCount(userId: string) {
  const supabase = await createClient();
  const period = getCurrentPeriod();

  const { data: existing } = await supabase
    .from('usage_tracking')
    .select('id, projects_count')
    .eq('user_id', userId)
    .eq('billing_period_start', period.start)
    .single();

  if (existing) {
    await supabase
      .from('usage_tracking')
      .update({ projects_count: existing.projects_count + 1 })
      .eq('id', existing.id);
  }
}
