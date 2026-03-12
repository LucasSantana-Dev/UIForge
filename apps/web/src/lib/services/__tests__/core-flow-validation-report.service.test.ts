import {
  buildInternalCoreFlowValidationReport,
  computeCoreFlowSnapshotFreshness,
  getLatestCapturedSnapshotDate,
} from '../core-flow-validation-report.service';
import type { CoreFlowValidationReport } from '../core-flow-validation.service';

function makeSnapshot(snapshotDate: string, qualifiedUsers: number, captured = true) {
  return {
    snapshotDate,
    totalUsers: 80,
    onboardedUsers: 70,
    usersWithProject: 65,
    usersWithCompletedGeneration: 60,
    qualifiedUsers,
    qualifiedRatio: 75,
    captured,
  };
}

function makeReport(overrides: Partial<CoreFlowValidationReport> = {}): CoreFlowValidationReport {
  const baseReport: CoreFlowValidationReport = {
    generatedAt: '2026-03-12T03:00:00.000Z',
    current: {
      snapshotDate: '2026-03-12',
      totalUsers: 80,
      onboardedUsers: 70,
      usersWithProject: 65,
      usersWithCompletedGeneration: 60,
      qualifiedUsers: 52,
      qualifiedRatio: 65,
    },
    snapshots: [
      makeSnapshot('2026-03-10', 50),
      makeSnapshot('2026-03-11', 51),
      makeSnapshot('2026-03-12', 52),
    ],
    trend: {
      previousWeekAvg: 51,
      currentWeekAvg: 52,
      weekOverWeekDropPct: 0,
      maxAllowedDropPct: 10,
      hasTwoFullWeeks: true,
      missingDays: 0,
    },
    gate: {
      passed: true,
      reasons: ['PASS'],
      qualifiedTarget: 50,
      maxDropPct: 10,
    },
    activationFunnel: {
      windowDays: 30,
      computedAt: '2026-03-12T03:00:00.000Z',
      cohortStartDate: '2026-02-10',
      counts: {
        startedOnboarding: 20,
        completedOnboarding: 16,
        firstProject: 12,
        firstCompletedGeneration: 10,
        qualifiedUsers: 8,
      },
      conversionRates: {
        onboardingCompletion: 80,
        projectActivation: 75,
        generationActivation: 83.33,
        qualification: 40,
      },
      topDropoffReasons: [{ reason: 'NO_PROJECT', count: 4 }],
      activation: {
        counts: {
          onboardedWithoutProject: 4,
          projectWithoutCompletedGeneration: 2,
          qualifiedUsers: 8,
        },
        nextBestAction: 'CREATE_PROJECT',
        nextBestActionDistribution: {
          CREATE_PROJECT: 4,
          COMPLETE_GENERATION: 2,
        },
        primaryBottleneck: {
          stage: 'ONBOARDED_TO_PROJECT',
          count: 4,
        },
      },
    },
    activation: {
      counts: {
        onboardedWithoutProject: 4,
        projectWithoutCompletedGeneration: 2,
        qualifiedUsers: 8,
      },
      nextBestAction: 'CREATE_PROJECT',
      nextBestActionDistribution: {
        CREATE_PROJECT: 4,
        COMPLETE_GENERATION: 2,
      },
      primaryBottleneck: {
        stage: 'ONBOARDED_TO_PROJECT',
        count: 4,
      },
    },
  };

  return {
    ...baseReport,
    ...overrides,
    activationFunnel: overrides.activationFunnel ?? baseReport.activationFunnel,
    activation: overrides.activation ?? baseReport.activation,
  };
}

describe('core-flow validation report service', () => {
  it('returns null latest date when no captured snapshots exist', () => {
    const latest = getLatestCapturedSnapshotDate([
      makeSnapshot('2026-03-10', 50, false),
      makeSnapshot('2026-03-11', 51, false),
    ]);
    expect(latest).toBeNull();
  });

  it('computes missing freshness when snapshot history is empty', () => {
    const freshness = computeCoreFlowSnapshotFreshness(null, new Date('2026-03-12T10:00:00.000Z'));
    expect(freshness.status).toBe('missing');
    expect(freshness.isFresh).toBe(false);
    expect(freshness.stalenessDays).toBeNull();
  });

  it('computes stale freshness for partial history with old latest capture', () => {
    const freshness = computeCoreFlowSnapshotFreshness(
      '2026-03-09',
      new Date('2026-03-12T10:00:00.000Z'),
      1
    );
    expect(freshness.status).toBe('stale');
    expect(freshness.isFresh).toBe(false);
    expect(freshness.stalenessDays).toBe(3);
  });

  it('builds pass report with full history and pass reason', () => {
    const payload = buildInternalCoreFlowValidationReport(
      makeReport(),
      new Date('2026-03-12T10:00:00.000Z')
    );

    expect(payload.gate.passed).toBe(true);
    expect(payload.reasons).toEqual(['PASS']);
    expect(payload.latestSnapshotDate).toBe('2026-03-12');
    expect(payload.freshness.status).toBe('fresh');
    expect(payload.trend14d).toHaveLength(3);
    expect(payload.weekOverWeek.dropPct).toBe(0);
  });

  it('keeps fail reason combinations for boundary failures', () => {
    const payload = buildInternalCoreFlowValidationReport(
      makeReport({
        current: {
          snapshotDate: '2026-03-12',
          totalUsers: 80,
          onboardedUsers: 70,
          usersWithProject: 65,
          usersWithCompletedGeneration: 60,
          qualifiedUsers: 48,
          qualifiedRatio: 60,
        },
        gate: {
          passed: false,
          reasons: ['TARGET_NOT_REACHED', 'INSUFFICIENT_HISTORY'],
          qualifiedTarget: 50,
          maxDropPct: 10,
        },
      }),
      new Date('2026-03-12T10:00:00.000Z')
    );

    expect(payload.gate.passed).toBe(false);
    expect(payload.reasons).toEqual(['TARGET_NOT_REACHED', 'INSUFFICIENT_HISTORY']);
  });
});
