import {
  CORE_FLOW_MAX_DROP_PCT,
  CORE_FLOW_QUALIFIED_TARGET,
  evaluateCoreFlowGate,
  evaluateCoreFlowWeeklyTrend,
} from '../core-flow-validation.service';

function buildRows(values: number[], startDate = '2026-03-01') {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  return values.map((qualifiedUsers, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return {
      snapshotDate: date.toISOString().slice(0, 10),
      qualifiedUsers,
    };
  });
}

describe('core-flow validation service', () => {
  it('marks trend as insufficient history when days are missing', () => {
    const now = new Date('2026-03-15T10:00:00.000Z');
    const trend = evaluateCoreFlowWeeklyTrend(
      buildRows([45, 46, 47, 48, 49, 50, 51, 52], '2026-03-01'),
      now
    );

    expect(trend.hasTwoFullWeeks).toBe(false);
    expect(trend.missingDays).toBeGreaterThan(0);
    expect(trend.weekOverWeekDropPct).toBe(0);
  });

  it('passes gate at target with stable weekly trend', () => {
    const now = new Date('2026-03-15T10:00:00.000Z');
    const rows = buildRows([55, 55, 55, 55, 55, 55, 55, 50, 50, 50, 50, 50, 50, 50]);
    const trend = evaluateCoreFlowWeeklyTrend(rows, now);
    const gate = evaluateCoreFlowGate(CORE_FLOW_QUALIFIED_TARGET, trend);

    expect(trend.hasTwoFullWeeks).toBe(true);
    expect(trend.weekOverWeekDropPct).toBeLessThanOrEqual(CORE_FLOW_MAX_DROP_PCT);
    expect(gate.passed).toBe(true);
    expect(gate.reasons).toEqual(['PASS']);
  });

  it('fails gate when target is not reached', () => {
    const trend = {
      previousWeekAvg: 52,
      currentWeekAvg: 51,
      weekOverWeekDropPct: 1.92,
      maxAllowedDropPct: CORE_FLOW_MAX_DROP_PCT,
      hasTwoFullWeeks: true,
      missingDays: 0,
    };
    const gate = evaluateCoreFlowGate(CORE_FLOW_QUALIFIED_TARGET - 1, trend);

    expect(gate.passed).toBe(false);
    expect(gate.reasons).toContain('TARGET_NOT_REACHED');
  });

  it('fails gate when week-over-week drop exceeds 10%', () => {
    const now = new Date('2026-03-15T10:00:00.000Z');
    const rows = buildRows([60, 60, 60, 60, 60, 60, 60, 50, 50, 50, 50, 50, 50, 50]);
    const trend = evaluateCoreFlowWeeklyTrend(rows, now);
    const gate = evaluateCoreFlowGate(50, trend);

    expect(trend.weekOverWeekDropPct).toBeGreaterThan(CORE_FLOW_MAX_DROP_PCT);
    expect(gate.passed).toBe(false);
    expect(gate.reasons).toContain('WEEK_OVER_WEEK_DROP_TOO_HIGH');
  });
});
