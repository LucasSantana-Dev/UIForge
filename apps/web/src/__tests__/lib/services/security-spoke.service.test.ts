import {
  extractSecuritySpokeReport,
  persistSecuritySpokeReport,
} from '@/lib/services/security-spoke.service';
import { upsertGenerationSecurityReport } from '@/lib/repositories/generation.repo';

jest.mock('@/lib/repositories/generation.repo');

const mockUpsertGenerationSecurityReport = upsertGenerationSecurityReport as jest.MockedFunction<
  typeof upsertGenerationSecurityReport
>;

const validPayload = {
  security_spoke: {
    version: 'v1',
    generated_at: '2026-03-12T00:00:00.000Z',
    scanner: {
      name: 'mcp-gateway-native-security-spoke',
      version: '1.0.0',
      execution: 'success',
    },
    summary: {
      total_findings: 1,
      by_severity: {
        critical: 0,
        high: 1,
        medium: 0,
        low: 0,
        info: 0,
      },
      by_risk_level: {
        high: 1,
        medium: 0,
        low: 0,
      },
    },
    findings: [
      {
        rule_id: 'SEC-INJ-001',
        severity: 'high',
        category: 'injection',
        title: 'Injection Sink Pattern',
        evidence: [{ kind: 'code', value: String.raw`eval\s*\(`, line: 12 }],
        recommendation: 'Use parameterized APIs.',
        risk_level: 'high',
      },
    ],
    dast: {
      status: 'not_executed',
      mode: 'hooks_only_v1',
      reason: 'DAST deferred in v1.',
    },
  },
};

describe('security-spoke.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpsertGenerationSecurityReport.mockResolvedValue(undefined);
  });

  it('extracts a valid security spoke report from quality payload', () => {
    const parsed = extractSecuritySpokeReport(validPayload);

    expect(parsed).not.toBeNull();
    expect(parsed?.version).toBe('v1');
    expect(parsed?.scanner.execution).toBe('success');
    expect(parsed?.summary.total_findings).toBe(1);
  });

  it('returns null when payload does not contain valid security_spoke data', () => {
    expect(extractSecuritySpokeReport({})).toBeNull();
    expect(
      extractSecuritySpokeReport({
        security_spoke: {
          version: 'v1',
          summary: {},
        },
      })
    ).toBeNull();
  });

  it('persists report with normalized summary and highest severity/risk', async () => {
    const parsed = extractSecuritySpokeReport(validPayload);
    expect(parsed).not.toBeNull();

    await persistSecuritySpokeReport('gen-1', 'user-1', parsed!);

    expect(mockUpsertGenerationSecurityReport).toHaveBeenCalledWith(
      expect.objectContaining({
        generation_id: 'gen-1',
        user_id: 'user-1',
        report_version: 'v1',
        summary_total_findings: 1,
        highest_risk_level: 'high',
        highest_severity: 'high',
        dast_status: 'not_executed',
        dast_mode: 'hooks_only_v1',
      })
    );
  });
});
