import { createClient } from '@supabase/supabase-js';
import type { MetricsWindowDays } from '@/lib/analytics/metrics';

const ONE_DAY_MS = 86_400_000;
const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'info'] as const;
const RISK_ORDER = ['high', 'medium', 'low'] as const;

type SecuritySeverity = (typeof SEVERITY_ORDER)[number];
type SecurityRiskLevel = (typeof RISK_ORDER)[number];

export interface SecurityTopRule {
  ruleId: string;
  count: number;
  maxSeverity: SecuritySeverity;
  maxRiskLevel: SecurityRiskLevel;
}

export interface SecurityRecentHighRiskGeneration {
  generationId: string;
  userId: string;
  createdAt: string;
  findingCount: number;
  scannerExecution: 'success' | 'error';
  highestRiskLevel: SecurityRiskLevel;
  highestSeverity: SecuritySeverity | null;
}

export interface SecurityTelemetryReport {
  timestamp: string;
  windowDays: MetricsWindowDays;
  summary: {
    totalReports: number;
    totalFindings: number;
    reportsWithFindings: number;
    highRiskGenerations: number;
    scannerErrors: number;
  };
  severityDistribution: Record<SecuritySeverity, number>;
  riskDistribution: Record<SecurityRiskLevel, number>;
  topRules: SecurityTopRule[];
  recentHighRiskGenerations: SecurityRecentHighRiskGeneration[];
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Security telemetry service configuration missing');
  }
  return createClient(url, key);
}

function zeroSeverityMap(): Record<SecuritySeverity, number> {
  return { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
}

function zeroRiskMap(): Record<SecurityRiskLevel, number> {
  return { high: 0, medium: 0, low: 0 };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readEnumCountMap<T extends string>(value: unknown, keys: readonly T[]): Record<T, number> {
  const result = {} as Record<T, number>;
  const source = isRecord(value) ? value : {};
  for (const key of keys) {
    const raw = source[key];
    const parsed = typeof raw === 'number' ? raw : Number(raw ?? 0);
    result[key] = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }
  return result;
}

function compareSeverity(next: SecuritySeverity, current: SecuritySeverity): boolean {
  return SEVERITY_ORDER.indexOf(next) < SEVERITY_ORDER.indexOf(current);
}

function compareRisk(next: SecurityRiskLevel, current: SecurityRiskLevel): boolean {
  return RISK_ORDER.indexOf(next) < RISK_ORDER.indexOf(current);
}

function normalizeSeverity(value: unknown): SecuritySeverity | null {
  return typeof value === 'string' && SEVERITY_ORDER.includes(value as SecuritySeverity)
    ? (value as SecuritySeverity)
    : null;
}

function normalizeRisk(value: unknown): SecurityRiskLevel | null {
  return typeof value === 'string' && RISK_ORDER.includes(value as SecurityRiskLevel)
    ? (value as SecurityRiskLevel)
    : null;
}

function toFindings(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null
  );
}

function readText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readCount(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

interface ParsedSecurityRow {
  generationId: string;
  userId: string;
  createdAt: string;
  findingCount: number;
  scannerExecution: 'success' | 'error';
  highestRisk: SecurityRiskLevel | null;
  highestSeverity: SecuritySeverity | null;
  summaryBySeverity: Record<SecuritySeverity, number>;
  summaryByRisk: Record<SecurityRiskLevel, number>;
  findings: Array<Record<string, unknown>>;
}

function parseSecurityRow(row: Record<string, unknown>): ParsedSecurityRow {
  const summaryBySeverity = readEnumCountMap(row.summary_by_severity, SEVERITY_ORDER);
  const summaryByRisk = readEnumCountMap(row.summary_by_risk_level, RISK_ORDER);
  const highestRisk =
    normalizeRisk(row.highest_risk_level) ?? (summaryByRisk.high > 0 ? 'high' : null);
  return {
    generationId: readText(row.generation_id),
    userId: readText(row.user_id),
    createdAt: readText(row.created_at),
    findingCount: readCount(row.summary_total_findings),
    scannerExecution: row.scanner_execution === 'error' ? 'error' : 'success',
    highestRisk,
    highestSeverity: normalizeSeverity(row.highest_severity),
    summaryBySeverity,
    summaryByRisk,
    findings: toFindings(row.findings),
  };
}

function applyDistributionCounts(
  summaryBySeverity: Record<SecuritySeverity, number>,
  summaryByRisk: Record<SecurityRiskLevel, number>,
  severityDistribution: Record<SecuritySeverity, number>,
  riskDistribution: Record<SecurityRiskLevel, number>
) {
  for (const severity of SEVERITY_ORDER) {
    severityDistribution[severity] += summaryBySeverity[severity];
  }
  for (const riskLevel of RISK_ORDER) {
    riskDistribution[riskLevel] += summaryByRisk[riskLevel];
  }
}

function applyTopRules(
  findings: Array<Record<string, unknown>>,
  topRuleMap: Map<string, SecurityTopRule>
) {
  for (const finding of findings) {
    const ruleId = readText(finding.rule_id);
    const severity = normalizeSeverity(finding.severity);
    const riskLevel = normalizeRisk(finding.risk_level);
    if (!ruleId || !severity || !riskLevel) {
      continue;
    }

    const existing = topRuleMap.get(ruleId);
    if (!existing) {
      topRuleMap.set(ruleId, {
        ruleId,
        count: 1,
        maxSeverity: severity,
        maxRiskLevel: riskLevel,
      });
      continue;
    }

    existing.count += 1;
    if (compareSeverity(severity, existing.maxSeverity)) {
      existing.maxSeverity = severity;
    }
    if (compareRisk(riskLevel, existing.maxRiskLevel)) {
      existing.maxRiskLevel = riskLevel;
    }
  }
}

function sortTopRules(topRuleMap: Map<string, SecurityTopRule>): SecurityTopRule[] {
  return Array.from(topRuleMap.values())
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      if (a.maxSeverity !== b.maxSeverity) {
        return SEVERITY_ORDER.indexOf(a.maxSeverity) - SEVERITY_ORDER.indexOf(b.maxSeverity);
      }
      return a.ruleId.localeCompare(b.ruleId);
    })
    .slice(0, 10);
}

export async function getSecurityTelemetryReport(
  windowDays: MetricsWindowDays = 30
): Promise<SecurityTelemetryReport> {
  const supabase = getServiceClient();
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowDays * ONE_DAY_MS).toISOString();

  const { data, error } = await supabase
    .from('generation_security_reports')
    .select(
      [
        'generation_id',
        'user_id',
        'created_at',
        'summary_total_findings',
        'summary_by_severity',
        'summary_by_risk_level',
        'highest_risk_level',
        'highest_severity',
        'scanner_execution',
        'findings',
      ].join(',')
    )
    .gte('created_at', windowStart)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to load security telemetry');
  }

  const rows = Array.isArray(data)
    ? data.reduce<Record<string, unknown>[]>((accumulator, row) => {
        if (isRecord(row)) {
          accumulator.push(row);
        }
        return accumulator;
      }, [])
    : [];
  const severityDistribution = zeroSeverityMap();
  const riskDistribution = zeroRiskMap();
  const topRuleMap = new Map<string, SecurityTopRule>();
  const recentHighRiskGenerations: SecurityRecentHighRiskGeneration[] = [];

  let totalFindings = 0;
  let reportsWithFindings = 0;
  let scannerErrors = 0;
  let highRiskGenerations = 0;

  for (const row of rows) {
    const parsed = parseSecurityRow(row);

    totalFindings += parsed.findingCount;
    if (parsed.findingCount > 0) {
      reportsWithFindings += 1;
    }
    if (parsed.scannerExecution === 'error') {
      scannerErrors += 1;
    }
    if (parsed.highestRisk === 'high') {
      highRiskGenerations += 1;
    }

    applyDistributionCounts(
      parsed.summaryBySeverity,
      parsed.summaryByRisk,
      severityDistribution,
      riskDistribution
    );
    applyTopRules(parsed.findings, topRuleMap);

    if (parsed.highestRisk === 'high') {
      recentHighRiskGenerations.push({
        generationId: parsed.generationId,
        userId: parsed.userId,
        createdAt: parsed.createdAt,
        findingCount: parsed.findingCount,
        scannerExecution: parsed.scannerExecution,
        highestRiskLevel: parsed.highestRisk,
        highestSeverity: parsed.highestSeverity,
      });
    }
  }

  const topRules = sortTopRules(topRuleMap);

  return {
    timestamp: now.toISOString(),
    windowDays,
    summary: {
      totalReports: rows.length,
      totalFindings,
      reportsWithFindings,
      highRiskGenerations,
      scannerErrors,
    },
    severityDistribution,
    riskDistribution,
    topRules,
    recentHighRiskGenerations: recentHighRiskGenerations.slice(0, 10),
  };
}
