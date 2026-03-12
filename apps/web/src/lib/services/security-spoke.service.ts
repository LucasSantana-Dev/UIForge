import { upsertGenerationSecurityReport } from '@/lib/repositories/generation.repo';

export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type SecurityRiskLevel = 'high' | 'medium' | 'low';

export interface SecuritySpokeFinding {
  rule_id: string;
  severity: SecuritySeverity;
  category: string;
  title: string;
  evidence: Array<Record<string, unknown>>;
  recommendation: string;
  risk_level: SecurityRiskLevel;
}

export interface SecuritySpokeReport {
  version: 'v1';
  generated_at: string;
  scanner: {
    name: string;
    version: string;
    execution: 'success' | 'error';
    error_message?: string;
  };
  summary: {
    total_findings: number;
    by_severity: Record<SecuritySeverity, number>;
    by_risk_level: Record<SecurityRiskLevel, number>;
  };
  findings: SecuritySpokeFinding[];
  dast: {
    status: string;
    mode: string;
    reason: string;
  };
}

const SEVERITY_ORDER: SecuritySeverity[] = ['critical', 'high', 'medium', 'low', 'info'];
const RISK_ORDER: SecurityRiskLevel[] = ['high', 'medium', 'low'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asSeverity(value: unknown): SecuritySeverity | null {
  return typeof value === 'string' && SEVERITY_ORDER.includes(value as SecuritySeverity)
    ? (value as SecuritySeverity)
    : null;
}

function asRiskLevel(value: unknown): SecurityRiskLevel | null {
  return typeof value === 'string' && RISK_ORDER.includes(value as SecurityRiskLevel)
    ? (value as SecurityRiskLevel)
    : null;
}

function normalizeCounts<T extends string>(value: unknown, keys: T[]): Record<T, number> | null {
  if (!isRecord(value)) return null;
  const result = {} as Record<T, number>;
  for (const key of keys) {
    const raw = value[key];
    const n = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isFinite(n) || n < 0) return null;
    result[key] = n;
  }
  return result;
}

function normalizeFinding(value: unknown): SecuritySpokeFinding | null {
  if (!isRecord(value)) return null;
  const severity = asSeverity(value.severity);
  const riskLevel = asRiskLevel(value.risk_level);
  if (!severity || !riskLevel) return null;
  if (
    typeof value.rule_id !== 'string' ||
    typeof value.category !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.recommendation !== 'string' ||
    !Array.isArray(value.evidence)
  ) {
    return null;
  }
  const evidence = value.evidence.filter((item) => isRecord(item));
  return {
    rule_id: value.rule_id,
    severity,
    category: value.category,
    title: value.title,
    evidence,
    recommendation: value.recommendation,
    risk_level: riskLevel,
  };
}

export function extractSecuritySpokeReport(payload: unknown): SecuritySpokeReport | null {
  if (!isRecord(payload)) return null;
  const report = payload.security_spoke;
  if (!isRecord(report) || report.version !== 'v1') return null;
  if (
    typeof report.generated_at !== 'string' ||
    !isRecord(report.scanner) ||
    !isRecord(report.summary) ||
    !Array.isArray(report.findings) ||
    !isRecord(report.dast)
  ) {
    return null;
  }

  const scannerExecution =
    report.scanner.execution === 'success' || report.scanner.execution === 'error'
      ? report.scanner.execution
      : null;
  const severityCounts = normalizeCounts(report.summary.by_severity, SEVERITY_ORDER);
  const riskCounts = normalizeCounts(report.summary.by_risk_level, RISK_ORDER);
  if (
    !scannerExecution ||
    !severityCounts ||
    !riskCounts ||
    typeof report.summary.total_findings !== 'number'
  ) {
    return null;
  }

  const findings = report.findings
    .map(normalizeFinding)
    .filter((finding): finding is SecuritySpokeFinding => finding !== null);

  if (
    typeof report.scanner.name !== 'string' ||
    typeof report.scanner.version !== 'string' ||
    typeof report.dast.status !== 'string' ||
    typeof report.dast.mode !== 'string' ||
    typeof report.dast.reason !== 'string'
  ) {
    return null;
  }

  return {
    version: 'v1',
    generated_at: report.generated_at,
    scanner: {
      name: report.scanner.name,
      version: report.scanner.version,
      execution: scannerExecution,
      error_message:
        typeof report.scanner.error_message === 'string' ? report.scanner.error_message : undefined,
    },
    summary: {
      total_findings: report.summary.total_findings,
      by_severity: severityCounts,
      by_risk_level: riskCounts,
    },
    findings,
    dast: {
      status: report.dast.status,
      mode: report.dast.mode,
      reason: report.dast.reason,
    },
  };
}

function getHighestSeverity(
  findings: SecuritySpokeFinding[]
): 'critical' | 'high' | 'medium' | 'low' | 'info' | null {
  for (const severity of SEVERITY_ORDER) {
    if (findings.some((finding) => finding.severity === severity)) {
      return severity;
    }
  }
  return null;
}

function getHighestRiskLevel(findings: SecuritySpokeFinding[]): 'high' | 'medium' | 'low' | null {
  for (const riskLevel of RISK_ORDER) {
    if (findings.some((finding) => finding.risk_level === riskLevel)) {
      return riskLevel;
    }
  }
  return null;
}

export async function persistSecuritySpokeReport(
  generationId: string,
  userId: string,
  report: SecuritySpokeReport
): Promise<void> {
  await upsertGenerationSecurityReport({
    generation_id: generationId,
    user_id: userId,
    report_version: report.version,
    scanner_name: report.scanner.name,
    scanner_version: report.scanner.version,
    scanner_execution: report.scanner.execution,
    scanner_error_message: report.scanner.error_message ?? null,
    summary_total_findings: report.summary.total_findings,
    summary_by_severity: report.summary.by_severity,
    summary_by_risk_level: report.summary.by_risk_level,
    findings: report.findings.map((finding) => ({ ...finding })),
    highest_risk_level: getHighestRiskLevel(report.findings),
    highest_severity: getHighestSeverity(report.findings),
    dast_status: report.dast.status,
    dast_mode: report.dast.mode,
    dast_reason: report.dast.reason,
  });
}
