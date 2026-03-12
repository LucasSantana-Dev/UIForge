import { createClient } from '@supabase/supabase-js';
import type { MetricsWindowDays } from '@/lib/analytics/metrics';
import {
  getCoreFlowActivationFunnel,
  type CoreFlowActivationFunnel,
} from '@/lib/services/core-flow-activation.service';

export const CORE_FLOW_QUALIFIED_TARGET = 50;
export const CORE_FLOW_MAX_DROP_PCT = 10;
const CORE_FLOW_SNAPSHOT_SERIES_DAYS = 14;

interface CoreFlowSnapshotRow {
  snapshotDate: string;
  totalUsers: number;
  onboardedUsers: number;
  usersWithProject: number;
  usersWithCompletedGeneration: number;
  qualifiedUsers: number;
  qualifiedRatio: number;
}

export interface CoreFlowCurrentMetrics {
  snapshotDate: string;
  totalUsers: number;
  onboardedUsers: number;
  usersWithProject: number;
  usersWithCompletedGeneration: number;
  qualifiedUsers: number;
  qualifiedRatio: number;
}

export interface CoreFlowSnapshotPoint extends CoreFlowCurrentMetrics {
  captured: boolean;
}

export interface CoreFlowWeeklyTrend {
  previousWeekAvg: number;
  currentWeekAvg: number;
  weekOverWeekDropPct: number;
  maxAllowedDropPct: number;
  hasTwoFullWeeks: boolean;
  missingDays: number;
}

export type CoreFlowGateReason =
  | 'PASS'
  | 'TARGET_NOT_REACHED'
  | 'INSUFFICIENT_HISTORY'
  | 'WEEKLY_TARGET_NOT_REACHED'
  | 'WEEK_OVER_WEEK_DROP_TOO_HIGH';

export interface CoreFlowGateStatus {
  passed: boolean;
  reasons: CoreFlowGateReason[];
  qualifiedTarget: number;
  maxDropPct: number;
}

export interface CoreFlowValidationReport {
  generatedAt: string;
  current: CoreFlowCurrentMetrics;
  snapshots: CoreFlowSnapshotPoint[];
  trend: CoreFlowWeeklyTrend;
  gate: CoreFlowGateStatus;
  activationFunnel: CoreFlowActivationFunnel;
  capturedSnapshotDate?: string;
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Core flow validation service configuration missing');
  }
  return createClient(url, key);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function toUtcDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function shiftUtcDays(date: Date, offset: number) {
  const shifted = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  shifted.setUTCDate(shifted.getUTCDate() + offset);
  return shifted;
}

function avg(values: number[]) {
  if (values.length === 0) return 0;
  return round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function mapSnapshotRow(row: Record<string, unknown>): CoreFlowSnapshotRow {
  return {
    snapshotDate: String(row.snapshot_date),
    totalUsers: Number(row.total_users ?? 0),
    onboardedUsers: Number(row.onboarded_users ?? 0),
    usersWithProject: Number(row.users_with_project ?? 0),
    usersWithCompletedGeneration: Number(row.users_with_completed_generation ?? 0),
    qualifiedUsers: Number(row.qualified_users ?? 0),
    qualifiedRatio: Number(row.qualified_ratio ?? 0),
  };
}

function toSnapshotPoint(snapshotDate: string, row?: CoreFlowSnapshotRow): CoreFlowSnapshotPoint {
  if (!row) {
    return {
      snapshotDate,
      totalUsers: 0,
      onboardedUsers: 0,
      usersWithProject: 0,
      usersWithCompletedGeneration: 0,
      qualifiedUsers: 0,
      qualifiedRatio: 0,
      captured: false,
    };
  }

  return {
    ...row,
    captured: true,
  };
}

function buildSnapshotSeries(rows: CoreFlowSnapshotRow[], now: Date): CoreFlowSnapshotPoint[] {
  const byDate = new Map(rows.map((row) => [row.snapshotDate, row]));
  const start = shiftUtcDays(now, -(CORE_FLOW_SNAPSHOT_SERIES_DAYS - 1));
  return Array.from({ length: CORE_FLOW_SNAPSHOT_SERIES_DAYS }, (_, index) => {
    const dateKey = toUtcDateKey(shiftUtcDays(start, index));
    return toSnapshotPoint(dateKey, byDate.get(dateKey));
  });
}

export function evaluateCoreFlowWeeklyTrend(
  rows: Array<{ snapshotDate: string; qualifiedUsers: number }>,
  now: Date
): CoreFlowWeeklyTrend {
  const byDate = new Map(rows.map((row) => [row.snapshotDate, row.qualifiedUsers]));
  const evalDates = Array.from({ length: 14 }, (_, index) => {
    const dayOffset = -14 + index;
    return toUtcDateKey(shiftUtcDays(now, dayOffset));
  });

  const missingDays = evalDates.reduce(
    (count, dateKey) => (byDate.has(dateKey) ? count : count + 1),
    0
  );
  const hasTwoFullWeeks = missingDays === 0;
  if (!hasTwoFullWeeks) {
    return {
      previousWeekAvg: 0,
      currentWeekAvg: 0,
      weekOverWeekDropPct: 0,
      maxAllowedDropPct: CORE_FLOW_MAX_DROP_PCT,
      hasTwoFullWeeks: false,
      missingDays,
    };
  }

  const previousWeek = evalDates.slice(0, 7).map((dateKey) => Number(byDate.get(dateKey) ?? 0));
  const currentWeek = evalDates.slice(7, 14).map((dateKey) => Number(byDate.get(dateKey) ?? 0));

  const previousWeekAvg = avg(previousWeek);
  const currentWeekAvg = avg(currentWeek);
  const drop =
    previousWeekAvg > 0
      ? round(Math.max(0, ((previousWeekAvg - currentWeekAvg) / previousWeekAvg) * 100))
      : 0;

  return {
    previousWeekAvg,
    currentWeekAvg,
    weekOverWeekDropPct: drop,
    maxAllowedDropPct: CORE_FLOW_MAX_DROP_PCT,
    hasTwoFullWeeks: true,
    missingDays: 0,
  };
}

export function evaluateCoreFlowGate(
  qualifiedUsers: number,
  trend: CoreFlowWeeklyTrend
): CoreFlowGateStatus {
  const reasons: CoreFlowGateReason[] = [];
  if (qualifiedUsers < CORE_FLOW_QUALIFIED_TARGET) {
    reasons.push('TARGET_NOT_REACHED');
  }
  if (!trend.hasTwoFullWeeks) {
    reasons.push('INSUFFICIENT_HISTORY');
  }
  if (trend.hasTwoFullWeeks) {
    if (
      trend.previousWeekAvg < CORE_FLOW_QUALIFIED_TARGET ||
      trend.currentWeekAvg < CORE_FLOW_QUALIFIED_TARGET
    ) {
      reasons.push('WEEKLY_TARGET_NOT_REACHED');
    }
    if (trend.weekOverWeekDropPct > CORE_FLOW_MAX_DROP_PCT) {
      reasons.push('WEEK_OVER_WEEK_DROP_TOO_HIGH');
    }
  }

  if (reasons.length === 0) {
    reasons.push('PASS');
  }

  return {
    passed: reasons.length === 1 && reasons[0] === 'PASS',
    reasons,
    qualifiedTarget: CORE_FLOW_QUALIFIED_TARGET,
    maxDropPct: CORE_FLOW_MAX_DROP_PCT,
  };
}

async function collectCurrentCoreFlowMetrics(now: Date): Promise<CoreFlowCurrentMetrics> {
  const supabase = getServiceClient();
  const [profilesResult, projectsResult, generationsResult] = await Promise.all([
    supabase.from('profiles').select('id, onboarding_completed_at'),
    supabase.from('projects').select('user_id'),
    supabase.from('generations').select('user_id').eq('status', 'completed'),
  ]);

  if (profilesResult.error || projectsResult.error || generationsResult.error) {
    throw new Error('Failed to load current core-flow metrics');
  }

  const profiles = (profilesResult.data ?? []) as Array<Record<string, unknown>>;
  const projectUsers = new Set<string>();
  const completedGenerationUsers = new Set<string>();

  for (const row of (projectsResult.data ?? []) as Array<Record<string, unknown>>) {
    const userId = row.user_id;
    if (typeof userId === 'string' && userId.length > 0) {
      projectUsers.add(userId);
    }
  }

  for (const row of (generationsResult.data ?? []) as Array<Record<string, unknown>>) {
    const userId = row.user_id;
    if (typeof userId === 'string' && userId.length > 0) {
      completedGenerationUsers.add(userId);
    }
  }

  let onboardedUsers = 0;
  let qualifiedUsers = 0;

  for (const profile of profiles) {
    const userId = profile.id;
    if (typeof userId !== 'string' || userId.length === 0) {
      continue;
    }
    const onboarded = !!profile.onboarding_completed_at;
    if (onboarded) {
      onboardedUsers += 1;
    }
    if (onboarded && projectUsers.has(userId) && completedGenerationUsers.has(userId)) {
      qualifiedUsers += 1;
    }
  }

  const totalUsers = profiles.length;

  return {
    snapshotDate: toUtcDateKey(now),
    totalUsers,
    onboardedUsers,
    usersWithProject: projectUsers.size,
    usersWithCompletedGeneration: completedGenerationUsers.size,
    qualifiedUsers,
    qualifiedRatio: totalUsers > 0 ? round((qualifiedUsers / totalUsers) * 100) : 0,
  };
}

async function upsertDailySnapshot(current: CoreFlowCurrentMetrics): Promise<CoreFlowSnapshotRow> {
  const supabase = getServiceClient();
  const payload = {
    snapshot_date: current.snapshotDate,
    total_users: current.totalUsers,
    onboarded_users: current.onboardedUsers,
    users_with_project: current.usersWithProject,
    users_with_completed_generation: current.usersWithCompletedGeneration,
    qualified_users: current.qualifiedUsers,
    qualified_ratio: current.qualifiedRatio,
  };

  const { data, error } = await supabase
    .from('core_flow_gate_snapshots')
    .upsert(payload, { onConflict: 'snapshot_date' })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error('Failed to persist daily core-flow snapshot');
  }

  return mapSnapshotRow(data as Record<string, unknown>);
}

async function fetchRecentSnapshots(days: number): Promise<CoreFlowSnapshotRow[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('core_flow_gate_snapshots')
    .select('*')
    .order('snapshot_date', { ascending: false })
    .limit(days);

  if (error) {
    throw new Error('Failed to load historical core-flow snapshots');
  }

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  return rows.map(mapSnapshotRow).sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate));
}

function buildValidationReport(
  now: Date,
  current: CoreFlowCurrentMetrics,
  snapshots: CoreFlowSnapshotRow[],
  activationFunnel: CoreFlowActivationFunnel,
  capturedSnapshotDate?: string
): CoreFlowValidationReport {
  const trend = evaluateCoreFlowWeeklyTrend(
    snapshots.map((snapshot) => ({
      snapshotDate: snapshot.snapshotDate,
      qualifiedUsers: snapshot.qualifiedUsers,
    })),
    now
  );
  const gate = evaluateCoreFlowGate(current.qualifiedUsers, trend);
  return {
    generatedAt: now.toISOString(),
    current,
    snapshots: buildSnapshotSeries(snapshots, now),
    trend,
    gate,
    activationFunnel,
    ...(capturedSnapshotDate ? { capturedSnapshotDate } : {}),
  };
}

export async function getCoreFlowValidationReport(
  now = new Date(),
  windowDays: MetricsWindowDays = 30
) {
  const current = await collectCurrentCoreFlowMetrics(now);
  const snapshots = await fetchRecentSnapshots(30);
  const activationFunnel = await getCoreFlowActivationFunnel(windowDays, now);
  return buildValidationReport(now, current, snapshots, activationFunnel);
}

export async function captureCoreFlowValidationSnapshot(
  now = new Date(),
  windowDays: MetricsWindowDays = 30
) {
  const current = await collectCurrentCoreFlowMetrics(now);
  const snapshot = await upsertDailySnapshot(current);
  const snapshots = await fetchRecentSnapshots(30);
  const activationFunnel = await getCoreFlowActivationFunnel(windowDays, now);
  return buildValidationReport(now, current, snapshots, activationFunnel, snapshot.snapshotDate);
}
