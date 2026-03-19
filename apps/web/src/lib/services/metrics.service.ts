import { createClient } from '@supabase/supabase-js';
import type { MetricsReport, MetricsWindowDays } from '@/lib/analytics/metrics';
import { METRICS_WINDOW_OPTIONS } from '@/lib/analytics/metrics';

const ONE_DAY_MS = 86_400_000;

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Metrics service configuration missing');
  }
  return createClient(url, key);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function toPercentage(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return round((numerator / denominator) * 100);
}

export function parseWindowDays(value: string | null | undefined): MetricsWindowDays {
  const parsed = Number(value ?? 30);
  if (METRICS_WINDOW_OPTIONS.includes(parsed as MetricsWindowDays)) {
    return parsed as MetricsWindowDays;
  }
  return 30;
}

export async function getMetricsReport(windowDays: MetricsWindowDays = 30): Promise<MetricsReport> {
  const supabase = getServiceClient();
  const now = new Date();
  const last24h = new Date(now.getTime() - ONE_DAY_MS).toISOString();
  const last7d = new Date(now.getTime() - 7 * ONE_DAY_MS).toISOString();
  const last30d = new Date(now.getTime() - 30 * ONE_DAY_MS).toISOString();
  const windowStart = new Date(now.getTime() - windowDays * ONE_DAY_MS).toISOString();

  const results = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', last7d),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', last30d),
    supabase.from('generations').select('id', { count: 'exact', head: true }),
    supabase
      .from('generations')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', last24h),
    supabase
      .from('generations')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', last7d),
    supabase
      .from('generations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed'),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('generations').select('user_id').eq('status', 'completed'),
    supabase
      .from('generations')
      .select('parent_generation_id,ai_provider')
      .gte('created_at', windowStart),
    supabase.from('ml_feedback').select('rating').gte('created_at', windowStart),
  ]);

  const errors = results.filter((result) => result.error);
  if (errors.length > 0) {
    throw new Error('Database query failed');
  }

  const [
    totalUsers,
    users7d,
    users30d,
    totalGenerations,
    gen24h,
    gen7d,
    completedGens,
    totalProjects,
    activeUsersResult,
    windowGenerationsResult,
    feedbackResult,
  ] = results;

  const userGenCounts = new Map<string, number>();
  for (const row of activeUsersResult.data ?? []) {
    const uid = (row as Record<string, unknown>).user_id as string;
    userGenCounts.set(uid, (userGenCounts.get(uid) || 0) + 1);
  }

  let activeUsers = 0;
  for (const count of userGenCounts.values()) {
    if (count >= 3) {
      activeUsers += 1;
    }
  }

  const total = totalGenerations.count ?? 0;
  const completed = completedGens.count ?? 0;
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const windowGenerations = (windowGenerationsResult.data ?? []) as Array<Record<string, unknown>>;
  const totalWindowGenerations = windowGenerations.length;

  let revisions = 0;
  let mcpGenerations = 0;
  for (const row of windowGenerations) {
    if (row.parent_generation_id) {
      revisions += 1;
    }
    if (row.ai_provider === 'mcp-gateway') {
      mcpGenerations += 1;
    }
  }

  const feedbackRows = (feedbackResult.data ?? []) as Array<Record<string, unknown>>;
  let positiveFeedback = 0;
  let negativeFeedback = 0;
  for (const row of feedbackRows) {
    if (row.rating === 'positive') {
      positiveFeedback += 1;
    } else if (row.rating === 'negative') {
      negativeFeedback += 1;
    }
  }

  const satisfactionVotes = positiveFeedback + negativeFeedback;
  const satisfactionRate =
    satisfactionVotes > 0 ? toPercentage(positiveFeedback, satisfactionVotes) : null;

  return {
    timestamp: now.toISOString(),
    users: {
      total: totalUsers.count ?? 0,
      last7d: users7d.count ?? 0,
      last30d: users30d.count ?? 0,
      active: activeUsers,
    },
    generations: {
      total,
      last24h: gen24h.count ?? 0,
      last7d: gen7d.count ?? 0,
      successRate,
    },
    projects: {
      total: totalProjects.count ?? 0,
    },
    quality: {
      windowDays,
      totalGenerations: totalWindowGenerations,
      revisionRate: toPercentage(revisions, totalWindowGenerations),
      satisfactionRate,
      satisfactionVotes,
      mcpCoverage: toPercentage(mcpGenerations, totalWindowGenerations),
    },
  };
}
