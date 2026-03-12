import { createClient } from '@supabase/supabase-js';
import { getSecurityTelemetryReport } from '@/lib/services/security-telemetry.service';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

function mockSupabaseRows(rows: Array<Record<string, unknown>>, error: unknown = null) {
  const order = jest.fn().mockResolvedValue({ data: rows, error });
  const gte = jest.fn().mockReturnValue({ order });
  const select = jest.fn().mockReturnValue({ gte });
  const from = jest.fn().mockReturnValue({ select });
  return { from };
}

describe('security-telemetry.service', () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  });

  it('aggregates severity/risk distributions, top rules, and high-risk recents', async () => {
    mockCreateClient.mockReturnValue(
      mockSupabaseRows([
        {
          generation_id: 'gen-2',
          user_id: 'user-2',
          created_at: '2026-03-12T00:10:00.000Z',
          summary_total_findings: 2,
          summary_by_severity: { critical: 0, high: 2, medium: 0, low: 0, info: 0 },
          summary_by_risk_level: { high: 2, medium: 0, low: 0 },
          highest_risk_level: 'high',
          highest_severity: 'high',
          scanner_execution: 'success',
          findings: [
            { rule_id: 'SEC-INJ-001', severity: 'high', risk_level: 'high' },
            { rule_id: 'SEC-INJ-001', severity: 'high', risk_level: 'high' },
          ],
        },
        {
          generation_id: 'gen-1',
          user_id: 'user-1',
          created_at: '2026-03-12T00:00:00.000Z',
          summary_total_findings: 1,
          summary_by_severity: { critical: 1, high: 0, medium: 0, low: 0, info: 0 },
          summary_by_risk_level: { high: 1, medium: 0, low: 0 },
          highest_risk_level: 'high',
          highest_severity: 'critical',
          scanner_execution: 'error',
          findings: [{ rule_id: 'SEC-SECRET-001', severity: 'critical', risk_level: 'high' }],
        },
      ]) as any
    );

    const report = await getSecurityTelemetryReport(7);

    expect(report.windowDays).toBe(7);
    expect(report.summary.totalReports).toBe(2);
    expect(report.summary.totalFindings).toBe(3);
    expect(report.summary.highRiskGenerations).toBe(2);
    expect(report.summary.scannerErrors).toBe(1);
    expect(report.severityDistribution.critical).toBe(1);
    expect(report.severityDistribution.high).toBe(2);
    expect(report.riskDistribution.high).toBe(3);
    expect(report.topRules[0]?.ruleId).toBe('SEC-INJ-001');
    expect(report.recentHighRiskGenerations).toHaveLength(2);
  });

  it('throws explicit configuration error when service env is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    await expect(getSecurityTelemetryReport()).rejects.toThrow(
      'Security telemetry service configuration missing'
    );
  });
});
