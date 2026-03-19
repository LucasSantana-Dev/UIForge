import {
  buildCoreFlowActivationFunnel,
  evaluateCoreFlowUserProgress,
} from '../core-flow-activation.service';

function makeRow(
  userId: string,
  createdAt: string,
  onboardingCompletedAt: string | null,
  firstProjectAt: string | null,
  firstCompletedGenerationAt: string | null
) {
  return {
    userId,
    createdAt,
    onboardingCompletedAt,
    firstProjectAt,
    firstCompletedGenerationAt,
  };
}

describe('core-flow activation service', () => {
  it('evaluates qualified and non-qualified user states with ordered reasons', () => {
    const qualified = evaluateCoreFlowUserProgress({
      userId: 'u-1',
      onboardingCompletedAt: '2026-03-10T00:00:00.000Z',
      firstProjectAt: '2026-03-10T01:00:00.000Z',
      firstCompletedGenerationAt: '2026-03-10T02:00:00.000Z',
    });

    expect(qualified.qualified).toBe(true);
    expect(qualified.reasons).toEqual([]);

    const notQualified = evaluateCoreFlowUserProgress({
      userId: 'u-2',
      onboardingCompletedAt: null,
      firstProjectAt: null,
      firstCompletedGenerationAt: null,
    });

    expect(notQualified.qualified).toBe(false);
    expect(notQualified.reasons).toEqual([
      'ONBOARDING_NOT_COMPLETED',
      'NO_PROJECT',
      'NO_COMPLETED_GENERATION',
    ]);
  });

  it('builds funnel counts, conversion rates, top drop-off reasons, and action priorities', () => {
    const now = new Date('2026-03-12T00:00:00.000Z');
    const rows = [
      makeRow(
        'u-1',
        '2026-03-10T00:00:00.000Z',
        '2026-03-10T00:10:00.000Z',
        '2026-03-10T01:00:00.000Z',
        '2026-03-10T02:00:00.000Z'
      ),
      makeRow(
        'u-2',
        '2026-03-11T00:00:00.000Z',
        '2026-03-11T00:10:00.000Z',
        '2026-03-11T01:00:00.000Z',
        null
      ),
      makeRow('u-3', '2026-03-11T00:00:00.000Z', null, null, null),
      makeRow('u-4', '2026-03-09T00:00:00.000Z', '2026-03-10T00:00:00.000Z', null, null),
    ];

    const funnel = buildCoreFlowActivationFunnel(rows, 30, now);

    expect(funnel.counts).toEqual({
      startedOnboarding: 4,
      completedOnboarding: 3,
      firstProject: 2,
      firstCompletedGeneration: 1,
      qualifiedUsers: 1,
    });
    expect(funnel.conversionRates).toEqual({
      onboardingCompletion: 75,
      projectActivation: 66.67,
      generationActivation: 50,
      qualification: 25,
    });
    expect(funnel.topDropoffReasons).toEqual([
      { reason: 'NO_COMPLETED_GENERATION', count: 1 },
      { reason: 'NO_PROJECT', count: 1 },
      { reason: 'ONBOARDING_NOT_COMPLETED', count: 1 },
    ]);
    expect(funnel.activation).toEqual({
      counts: {
        onboardedWithoutProject: 1,
        projectWithoutCompletedGeneration: 1,
        qualifiedUsers: 1,
      },
      nextBestAction: 'CREATE_PROJECT',
      nextBestActionDistribution: {
        CREATE_PROJECT: 1,
        COMPLETE_GENERATION: 1,
      },
      primaryBottleneck: {
        stage: 'ONBOARDED_TO_PROJECT',
        count: 1,
      },
    });
  });

  it('returns zeroed rates and empty drop-offs with no cohort data', () => {
    const funnel = buildCoreFlowActivationFunnel([], 7, new Date('2026-03-12T00:00:00.000Z'));

    expect(funnel.counts.startedOnboarding).toBe(0);
    expect(funnel.conversionRates).toEqual({
      onboardingCompletion: 0,
      projectActivation: 0,
      generationActivation: 0,
      qualification: 0,
    });
    expect(funnel.topDropoffReasons).toEqual([]);
    expect(funnel.activation).toEqual({
      counts: {
        onboardedWithoutProject: 0,
        projectWithoutCompletedGeneration: 0,
        qualifiedUsers: 0,
      },
      nextBestAction: 'CREATE_PROJECT',
      nextBestActionDistribution: {
        CREATE_PROJECT: 0,
        COMPLETE_GENERATION: 0,
      },
      primaryBottleneck: {
        stage: 'ONBOARDED_TO_PROJECT',
        count: 0,
      },
    });
  });

  it('prioritizes COMPLETE_GENERATION when generation gap is larger', () => {
    const now = new Date('2026-03-12T00:00:00.000Z');
    const rows = [
      makeRow(
        'u-1',
        '2026-03-10T00:00:00.000Z',
        '2026-03-10T00:10:00.000Z',
        '2026-03-10T01:00:00.000Z',
        null
      ),
      makeRow(
        'u-2',
        '2026-03-10T00:00:00.000Z',
        '2026-03-10T00:10:00.000Z',
        '2026-03-10T01:00:00.000Z',
        null
      ),
      makeRow('u-3', '2026-03-11T00:00:00.000Z', '2026-03-11T00:10:00.000Z', null, null),
    ];

    const funnel = buildCoreFlowActivationFunnel(rows, 30, now);

    expect(funnel.activation.nextBestAction).toBe('COMPLETE_GENERATION');
    expect(funnel.activation.primaryBottleneck).toEqual({
      stage: 'PROJECT_TO_GENERATION',
      count: 2,
    });
  });

  it('respects 7/30/90 window boundaries', () => {
    const now = new Date('2026-03-12T00:00:00.000Z');
    const rows = [
      makeRow(
        'u-recent',
        '2026-03-10T00:00:00.000Z',
        '2026-03-10T00:00:00.000Z',
        '2026-03-10T01:00:00.000Z',
        '2026-03-10T02:00:00.000Z'
      ),
      makeRow(
        'u-20d',
        '2026-02-20T00:00:00.000Z',
        '2026-02-20T00:00:00.000Z',
        '2026-02-20T01:00:00.000Z',
        null
      ),
      makeRow('u-80d', '2025-12-22T00:00:00.000Z', '2025-12-22T00:00:00.000Z', null, null),
    ];

    expect(buildCoreFlowActivationFunnel(rows, 7, now).counts.startedOnboarding).toBe(1);
    expect(buildCoreFlowActivationFunnel(rows, 30, now).counts.startedOnboarding).toBe(2);
    expect(buildCoreFlowActivationFunnel(rows, 90, now).counts.startedOnboarding).toBe(3);
  });
});
