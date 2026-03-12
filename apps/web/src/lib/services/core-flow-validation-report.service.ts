import type {
  CoreFlowSnapshotPoint,
  CoreFlowValidationReport,
} from './core-flow-validation.service';

export type CoreFlowValidationFreshnessStatus = 'fresh' | 'stale' | 'missing';

export interface CoreFlowValidationFreshness {
  status: CoreFlowValidationFreshnessStatus;
  isFresh: boolean;
  staleAfterDays: number;
  stalenessDays: number | null;
  latestSnapshotDate: string | null;
}

export interface InternalCoreFlowValidationReport {
  generatedAt: string;
  gate: CoreFlowValidationReport['gate'];
  reasons: CoreFlowValidationReport['gate']['reasons'];
  current: CoreFlowValidationReport['current'];
  latestSnapshotDate: string | null;
  freshness: CoreFlowValidationFreshness;
  trend14d: CoreFlowValidationReport['snapshots'];
  weekOverWeek: {
    previousWeekAvg: number;
    currentWeekAvg: number;
    dropPct: number;
    maxAllowedDropPct: number;
    hasTwoFullWeeks: boolean;
    missingDays: number;
  };
}

function parseSnapshotDate(snapshotDate: string) {
  return new Date(`${snapshotDate}T00:00:00.000Z`);
}

function diffUtcDays(now: Date, then: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.floor((now.getTime() - then.getTime()) / msPerDay));
}

export function getLatestCapturedSnapshotDate(snapshots: CoreFlowSnapshotPoint[]) {
  let latest: string | null = null;
  for (const snapshot of snapshots) {
    if (!snapshot.captured) continue;
    if (!latest || snapshot.snapshotDate > latest) {
      latest = snapshot.snapshotDate;
    }
  }
  return latest;
}

export function computeCoreFlowSnapshotFreshness(
  latestSnapshotDate: string | null,
  now = new Date(),
  staleAfterDays = 1
): CoreFlowValidationFreshness {
  if (!latestSnapshotDate) {
    return {
      status: 'missing',
      isFresh: false,
      staleAfterDays,
      stalenessDays: null,
      latestSnapshotDate: null,
    };
  }

  const stalenessDays = diffUtcDays(now, parseSnapshotDate(latestSnapshotDate));
  const isFresh = stalenessDays <= staleAfterDays;
  return {
    status: isFresh ? 'fresh' : 'stale',
    isFresh,
    staleAfterDays,
    stalenessDays,
    latestSnapshotDate,
  };
}

export function buildInternalCoreFlowValidationReport(
  report: CoreFlowValidationReport,
  now = new Date(),
  staleAfterDays = 1
): InternalCoreFlowValidationReport {
  const latestSnapshotDate = getLatestCapturedSnapshotDate(report.snapshots);
  const freshness = computeCoreFlowSnapshotFreshness(latestSnapshotDate, now, staleAfterDays);

  return {
    generatedAt: report.generatedAt,
    gate: report.gate,
    reasons: report.gate.reasons,
    current: report.current,
    latestSnapshotDate,
    freshness,
    trend14d: report.snapshots,
    weekOverWeek: {
      previousWeekAvg: report.trend.previousWeekAvg,
      currentWeekAvg: report.trend.currentWeekAvg,
      dropPct: report.trend.weekOverWeekDropPct,
      maxAllowedDropPct: report.trend.maxAllowedDropPct,
      hasTwoFullWeeks: report.trend.hasTwoFullWeeks,
      missingDays: report.trend.missingDays,
    },
  };
}
