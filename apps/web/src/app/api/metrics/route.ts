import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const REQUIRED_QUALIFIED_USERS = 50;
const POSITIVE_FEEDBACK = 'thumbs_up';

type RecordRow = Record<string, unknown>;

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service config missing');
  return createClient(url, key);
}

function asRows(data: unknown): RecordRow[] {
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is RecordRow => item !== null && typeof item === 'object');
}

function toIdSet(data: unknown, key: string): Set<string> {
  const ids = new Set<string>();
  for (const row of asRows(data)) {
    const value = row[key];
    if (typeof value === 'string' && value.length > 0) ids.add(value);
  }
  return ids;
}

function roundRate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

function countActiveUsers(data: unknown): number {
  const counts = new Map<string, number>();
  for (const row of asRows(data)) {
    const userId = row.user_id;
    if (typeof userId !== 'string' || userId.length === 0) continue;
    counts.set(userId, (counts.get(userId) || 0) + 1);
  }

  let activeUsers = 0;
  for (const count of counts.values()) {
    if (count >= 3) activeUsers++;
  }
  return activeUsers;
}

function intersectionCount(...sets: Set<string>[]): number {
  if (sets.length === 0) return 0;
  const [smallest, ...rest] = [...sets].sort((a, b) => a.size - b.size);
  let count = 0;
  for (const value of smallest) {
    if (rest.every((set) => set.has(value))) count++;
  }
  return count;
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
  const countRows = (table: string) =>
    supabase.from(table).select('id', { count: 'exact', head: true });
  const countRowsSince = (table: string, createdAt: string) =>
    countRows(table).gte('created_at', createdAt);
  const countRowsWhere = (table: string, column: string, value: string) =>
    countRows(table).eq(column, value);
  const countRowsWhereSince = (table: string, column: string, value: string, createdAt: string) =>
    countRowsWhere(table, column, value).gte('created_at', createdAt);

  const results = await Promise.all([
    countRows('profiles'),
    countRowsSince('profiles', last7d),
    countRowsSince('profiles', last30d),
    countRows('generations'),
    countRowsSince('generations', last24h),
    countRowsSince('generations', last7d),
    countRowsWhere('generations', 'status', 'completed'),
    countRows('projects'),
    supabase.from('generations').select('user_id').eq('status', 'completed'),
    supabase.from('profiles').select('id').not('onboarding_completed_at', 'is', null),
    supabase.from('projects').select('owner_id'),
    supabase.from('generations').select('user_feedback').not('user_feedback', 'is', null),
    countRows('generations').not('parent_generation_id', 'is', null),
    countRowsWhere('generations', 'ai_provider', 'mcp-gateway'),
    countRowsWhereSince('generations', 'ai_provider', 'mcp-gateway', last30d),
  ]);

  const errors = results.filter((result) => result.error);
  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: 'Database query failed',
        details: errors.map((result) => result.error),
      },
      { status: 500 }
    );
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
    completedGenerationUsers,
    onboardingUsersResult,
    projectOwnersResult,
    feedbackRowsResult,
    revisionsResult,
    mcpTotalResult,
    mcp30dResult,
  ] = results;

  const usersTotal = totalUsers.count ?? 0;
  const generationsTotal = totalGenerations.count ?? 0;
  const completedTotal = completedGens.count ?? 0;
  const revisionsTotal = revisionsResult.count ?? 0;
  const mcpTotal = mcpTotalResult.count ?? 0;
  const mcp30d = mcp30dResult.count ?? 0;

  const generationUsers = toIdSet(completedGenerationUsers.data, 'user_id');
  const onboardingUsers = toIdSet(onboardingUsersResult.data, 'id');
  const projectUsers = toIdSet(projectOwnersResult.data, 'owner_id');
  const usersWithProjectAndGeneration = intersectionCount(projectUsers, generationUsers);
  const qualifiedUsers = intersectionCount(onboardingUsers, projectUsers, generationUsers);

  const feedbackRows = asRows(feedbackRowsResult.data);
  const satisfactionResponses = feedbackRows.length;
  const positiveFeedback = feedbackRows.filter(
    (row) => row.user_feedback === POSITIVE_FEEDBACK
  ).length;

  return NextResponse.json({
    timestamp: now.toISOString(),
    users: {
      total: usersTotal,
      last7d: users7d.count ?? 0,
      last30d: users30d.count ?? 0,
      active: countActiveUsers(completedGenerationUsers.data),
    },
    generations: {
      total: generationsTotal,
      last24h: gen24h.count ?? 0,
      last7d: gen7d.count ?? 0,
      successRate: roundRate(completedTotal, generationsTotal),
      revisions: {
        total: revisionsTotal,
        rate: roundRate(revisionsTotal, generationsTotal),
      },
      satisfaction: {
        responses: satisfactionResponses,
        positive: positiveFeedback,
        rate: roundRate(positiveFeedback, satisfactionResponses),
      },
    },
    projects: {
      total: totalProjects.count ?? 0,
    },
    adoption: {
      gate50: {
        qualifiedUsers,
        requiredUsers: REQUIRED_QUALIFIED_USERS,
        validated: qualifiedUsers >= REQUIRED_QUALIFIED_USERS,
      },
      onboarding: {
        completedUsers: onboardingUsers.size,
        completionRate: roundRate(onboardingUsers.size, usersTotal),
      },
      coreFlow: {
        usersWithProjects: projectUsers.size,
        usersWithGenerations: generationUsers.size,
        usersWithProjectAndGeneration,
        projectAdoptionRate: roundRate(projectUsers.size, usersTotal),
        generationAdoptionRate: roundRate(generationUsers.size, usersTotal),
        coreFlowAdoptionRate: roundRate(usersWithProjectAndGeneration, usersTotal),
      },
    },
    routing: {
      mcp: {
        total: mcpTotal,
        last30d: mcp30d,
        coverageRate: roundRate(mcpTotal, generationsTotal),
      },
    },
  });
}
