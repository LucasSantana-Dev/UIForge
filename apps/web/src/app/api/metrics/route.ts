import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service config missing');
  return createClient(url, key);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.METRICS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Metrics endpoint not configured' }, { status: 503 });
  }

  if (authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const now = new Date();
  const last24h = new Date(now.getTime() - 86400000).toISOString();
  const last7d = new Date(now.getTime() - 7 * 86400000).toISOString();
  const last30d = new Date(now.getTime() - 30 * 86400000).toISOString();

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
  ]);

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
  ] = results;

  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: 'Database query failed',
        details: errors.map((e) => e.error),
      },
      { status: 500 }
    );
  }

  const userGenCounts = new Map<string, number>();
  for (const row of activeUsersResult.data ?? []) {
    const uid = (row as Record<string, unknown>).user_id as string;
    userGenCounts.set(uid, (userGenCounts.get(uid) || 0) + 1);
  }
  let activeUsers = 0;
  for (const count of userGenCounts.values()) {
    if (count >= 3) activeUsers++;
  }

  const total = totalGenerations.count ?? 0;
  const completed = completedGens.count ?? 0;
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return NextResponse.json({
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
  });
}
