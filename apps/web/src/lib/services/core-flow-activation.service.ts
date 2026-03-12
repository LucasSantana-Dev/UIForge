import { createClient } from '@supabase/supabase-js';
import type { MetricsWindowDays } from '@/lib/analytics/metrics';

export type CoreFlowDropoffReason =
  | 'ONBOARDING_NOT_COMPLETED'
  | 'NO_PROJECT'
  | 'NO_COMPLETED_GENERATION';

export interface CoreFlowUserProgress {
  userId: string;
  onboarding: boolean;
  project: boolean;
  completedGeneration: boolean;
  qualified: boolean;
  reasons: CoreFlowDropoffReason[];
}

export interface CoreFlowActivationFunnel {
  windowDays: MetricsWindowDays;
  computedAt: string;
  cohortStartDate: string;
  counts: {
    startedOnboarding: number;
    completedOnboarding: number;
    firstProject: number;
    firstCompletedGeneration: number;
    qualifiedUsers: number;
  };
  conversionRates: {
    onboardingCompletion: number;
    projectActivation: number;
    generationActivation: number;
    qualification: number;
  };
  topDropoffReasons: Array<{
    reason: CoreFlowDropoffReason;
    count: number;
  }>;
}

interface ProfileRow {
  id: string;
  created_at: string;
  onboarding_completed_at: string | null;
}

interface EventRow {
  user_id: string;
  created_at: string;
}

interface ActivationUserRow {
  userId: string;
  createdAt: string;
  onboardingCompletedAt: string | null;
  firstProjectAt: string | null;
  firstCompletedGenerationAt: string | null;
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Core flow activation service configuration missing');
  }
  return createClient(url, key);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function toPercentage(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return round((numerator / denominator) * 100);
}

function isOnOrAfter(dateValue: string, minDate: Date) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() >= minDate.getTime();
}

function getFirstDateByUser(rows: EventRow[]) {
  const firstByUser = new Map<string, string>();
  for (const row of rows) {
    const userId = row.user_id;
    const createdAt = row.created_at;
    if (!userId || !createdAt) continue;
    const current = firstByUser.get(userId);
    if (!current || createdAt < current) {
      firstByUser.set(userId, createdAt);
    }
  }
  return firstByUser;
}

export function evaluateCoreFlowUserProgress(row: {
  userId: string;
  onboardingCompletedAt: string | null;
  firstProjectAt: string | null;
  firstCompletedGenerationAt: string | null;
}): CoreFlowUserProgress {
  const onboarding = !!row.onboardingCompletedAt;
  const project = !!row.firstProjectAt;
  const completedGeneration = !!row.firstCompletedGenerationAt;
  const reasons: CoreFlowDropoffReason[] = [];

  if (!onboarding) reasons.push('ONBOARDING_NOT_COMPLETED');
  if (!project) reasons.push('NO_PROJECT');
  if (!completedGeneration) reasons.push('NO_COMPLETED_GENERATION');

  return {
    userId: row.userId,
    onboarding,
    project,
    completedGeneration,
    qualified: reasons.length === 0,
    reasons,
  };
}

export function buildCoreFlowActivationFunnel(
  rows: ActivationUserRow[],
  windowDays: MetricsWindowDays,
  now = new Date()
): CoreFlowActivationFunnel {
  const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
  const cohort = rows.filter((row) => isOnOrAfter(row.createdAt, windowStart));
  const progressRows = cohort.map((row) => evaluateCoreFlowUserProgress(row));

  let completedOnboarding = 0;
  let firstProject = 0;
  let firstCompletedGeneration = 0;
  let qualifiedUsers = 0;
  const dropoff = new Map<CoreFlowDropoffReason, number>();

  for (const progress of progressRows) {
    if (progress.onboarding) completedOnboarding += 1;
    if (progress.project) firstProject += 1;
    if (progress.completedGeneration) firstCompletedGeneration += 1;
    if (progress.qualified) {
      qualifiedUsers += 1;
      continue;
    }
    const reason = progress.reasons[0];
    if (reason) {
      dropoff.set(reason, (dropoff.get(reason) ?? 0) + 1);
    }
  }

  const startedOnboarding = progressRows.length;
  const topDropoffReasons = [...dropoff.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .map(([reason, count]) => ({ reason, count }));

  return {
    windowDays,
    computedAt: now.toISOString(),
    cohortStartDate: windowStart.toISOString().slice(0, 10),
    counts: {
      startedOnboarding,
      completedOnboarding,
      firstProject,
      firstCompletedGeneration,
      qualifiedUsers,
    },
    conversionRates: {
      onboardingCompletion: toPercentage(completedOnboarding, startedOnboarding),
      projectActivation: toPercentage(firstProject, completedOnboarding),
      generationActivation: toPercentage(firstCompletedGeneration, firstProject),
      qualification: toPercentage(qualifiedUsers, startedOnboarding),
    },
    topDropoffReasons,
  };
}

async function loadActivationUsers(): Promise<ActivationUserRow[]> {
  const supabase = getServiceClient();
  const [profilesResult, projectsResult, generationsResult] = await Promise.all([
    supabase.from('profiles').select('id, created_at, onboarding_completed_at'),
    supabase.from('projects').select('user_id, created_at'),
    supabase.from('generations').select('user_id, created_at').eq('status', 'completed'),
  ]);

  if (profilesResult.error || projectsResult.error || generationsResult.error) {
    throw new Error('Failed to load core-flow activation data');
  }

  const profiles = (profilesResult.data ?? []) as ProfileRow[];
  const projectEvents = (projectsResult.data ?? []) as EventRow[];
  const generationEvents = (generationsResult.data ?? []) as EventRow[];
  const firstProjectByUser = getFirstDateByUser(projectEvents);
  const firstCompletedGenerationByUser = getFirstDateByUser(generationEvents);

  return profiles
    .filter((profile) => typeof profile.id === 'string' && typeof profile.created_at === 'string')
    .map((profile) => ({
      userId: profile.id,
      createdAt: profile.created_at,
      onboardingCompletedAt: profile.onboarding_completed_at,
      firstProjectAt: firstProjectByUser.get(profile.id) ?? null,
      firstCompletedGenerationAt: firstCompletedGenerationByUser.get(profile.id) ?? null,
    }));
}

export async function getCoreFlowActivationFunnel(windowDays: MetricsWindowDays, now = new Date()) {
  const rows = await loadActivationUsers();
  return buildCoreFlowActivationFunnel(rows, windowDays, now);
}

export async function getCoreFlowUserProgress(
  userId: string
): Promise<CoreFlowUserProgress | null> {
  const supabase = getServiceClient();
  const [profileResult, projectResult, generationResult] = await Promise.all([
    supabase.from('profiles').select('id, onboarding_completed_at').eq('id', userId).maybeSingle(),
    supabase.from('projects').select('id', { head: true, count: 'exact' }).eq('user_id', userId),
    supabase
      .from('generations')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'completed'),
  ]);

  if (profileResult.error || projectResult.error || generationResult.error) {
    throw new Error('Failed to load user core-flow progress');
  }

  if (!profileResult.data?.id) {
    return null;
  }

  return evaluateCoreFlowUserProgress({
    userId: profileResult.data.id as string,
    onboardingCompletedAt: (profileResult.data.onboarding_completed_at as string | null) ?? null,
    firstProjectAt: (projectResult.count ?? 0) > 0 ? 'present' : null,
    firstCompletedGenerationAt: (generationResult.count ?? 0) > 0 ? 'present' : null,
  });
}
