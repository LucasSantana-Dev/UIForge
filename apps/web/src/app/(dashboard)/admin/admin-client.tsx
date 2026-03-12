'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, PlusCircle, ShieldCheck, Trash2 } from 'lucide-react';
import { DashboardSection } from '@/components/migration/migration-primitives';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { MetricsWindowDays } from '@/lib/analytics/metrics';

interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  category: string;
  enabled: boolean;
  scope: string[] | null;
  enabled_for_users: string[] | null;
}

interface FeatureFlagsResponse {
  data?: FeatureFlag[];
  error?: string;
}

type CoreFlowGateReason =
  | 'PASS'
  | 'TARGET_NOT_REACHED'
  | 'INSUFFICIENT_HISTORY'
  | 'WEEKLY_TARGET_NOT_REACHED'
  | 'WEEK_OVER_WEEK_DROP_TOO_HIGH';

type CoreFlowDropoffReason = 'ONBOARDING_NOT_COMPLETED' | 'NO_PROJECT' | 'NO_COMPLETED_GENERATION';

interface CoreFlowValidationSnapshot {
  snapshotDate: string;
  totalUsers: number;
  onboardedUsers: number;
  usersWithProject: number;
  usersWithCompletedGeneration: number;
  qualifiedUsers: number;
  qualifiedRatio: number;
  captured: boolean;
}

interface CoreFlowValidationResponse {
  generatedAt: string;
  current: {
    snapshotDate: string;
    totalUsers: number;
    onboardedUsers: number;
    usersWithProject: number;
    usersWithCompletedGeneration: number;
    qualifiedUsers: number;
    qualifiedRatio: number;
  };
  snapshots: CoreFlowValidationSnapshot[];
  trend: {
    previousWeekAvg: number;
    currentWeekAvg: number;
    weekOverWeekDropPct: number;
    maxAllowedDropPct: number;
    hasTwoFullWeeks: boolean;
    missingDays: number;
  };
  gate: {
    passed: boolean;
    reasons: CoreFlowGateReason[];
    qualifiedTarget: number;
    maxDropPct: number;
  };
  activationFunnel: {
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
  };
}

interface SecurityTelemetryResponse {
  timestamp: string;
  windowDays: MetricsWindowDays;
  summary: {
    totalReports: number;
    totalFindings: number;
    reportsWithFindings: number;
    highRiskGenerations: number;
    scannerErrors: number;
  };
  severityDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  riskDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  topRules: Array<{
    ruleId: string;
    count: number;
    maxSeverity: string;
    maxRiskLevel: string;
  }>;
  recentHighRiskGenerations: Array<{
    generationId: string;
    userId: string;
    createdAt: string;
    findingCount: number;
    scannerExecution: 'success' | 'error';
    highestRiskLevel: string;
    highestSeverity: string | null;
  }>;
}

const reasonCopy: Record<Exclude<CoreFlowGateReason, 'PASS'>, string> = {
  TARGET_NOT_REACHED: 'Current qualified users are still below the 50-user target.',
  INSUFFICIENT_HISTORY: 'Two full weeks of daily snapshots are required to evaluate stability.',
  WEEKLY_TARGET_NOT_REACHED: 'At least one of the last two full weeks averaged below 50 users.',
  WEEK_OVER_WEEK_DROP_TOO_HIGH: 'Week-over-week qualified-user drop is above the 10% threshold.',
};

const dropoffReasonCopy: Record<CoreFlowDropoffReason, string> = {
  ONBOARDING_NOT_COMPLETED: 'Onboarding not completed',
  NO_PROJECT: 'No first project created',
  NO_COMPLETED_GENERATION: 'No completed generation',
};

function formatDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  return date.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
}

const categories = [
  'auth',
  'ui',
  'generation',
  'storage',
  'analytics',
  'system',
  'integration',
  'quality',
  'email',
  'billing',
];

const securityWindowOptions: MetricsWindowDays[] = [7, 30, 90];
const validationWindowOptions: MetricsWindowDays[] = [7, 30, 90];

export function AdminClient() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [validation, setValidation] = useState<CoreFlowValidationResponse | null>(null);
  const [isValidationLoading, setIsValidationLoading] = useState(true);
  const [validationWindowDays, setValidationWindowDays] = useState<MetricsWindowDays>(30);
  const [securityTelemetry, setSecurityTelemetry] = useState<SecurityTelemetryResponse | null>(
    null
  );
  const [isSecurityLoading, setIsSecurityLoading] = useState(true);
  const [securityWindowDays, setSecurityWindowDays] = useState<MetricsWindowDays>(30);
  const [isCreating, setIsCreating] = useState(false);
  const [newFlagName, setNewFlagName] = useState('');
  const [newFlagDescription, setNewFlagDescription] = useState('');
  const [newFlagCategory, setNewFlagCategory] = useState('system');
  const [newFlagEnabled, setNewFlagEnabled] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const sortedFlags = useMemo(
    () =>
      [...flags].sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.name.localeCompare(b.name);
      }),
    [flags]
  );

  const maxSnapshotQualifiedUsers = useMemo(() => {
    if (!validation) return 1;
    return Math.max(
      validation.gate.qualifiedTarget,
      ...validation.snapshots.map((snapshot) => snapshot.qualifiedUsers)
    );
  }, [validation]);

  const loadFlags = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/features', { cache: 'no-store' });
      const payload = (await response.json()) as FeatureFlagsResponse;

      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Failed to fetch feature flags');
      }

      setFlags(payload.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch feature flags';
      toast({
        variant: 'destructive',
        title: 'Could not load feature flags',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadValidation = useCallback(
    async (windowDays: MetricsWindowDays) => {
      try {
        setIsValidationLoading(true);
        const response = await fetch(`/api/admin/validation?windowDays=${windowDays}`, {
          cache: 'no-store',
        });
        const payload = (await response.json()) as CoreFlowValidationResponse & { error?: string };
        if (!response.ok) {
          throw new Error(payload.error || 'Failed to fetch validation metrics');
        }
        setValidation(payload);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to fetch validation metrics';
        toast({
          variant: 'destructive',
          title: 'Could not load core-flow validation',
          description: message,
        });
      } finally {
        setIsValidationLoading(false);
      }
    },
    [toast]
  );

  const loadSecurityTelemetry = useCallback(
    async (windowDays: MetricsWindowDays) => {
      try {
        setIsSecurityLoading(true);
        const response = await fetch(`/api/admin/security?windowDays=${windowDays}`, {
          cache: 'no-store',
        });
        const payload = (await response.json()) as SecurityTelemetryResponse & { error?: string };
        if (!response.ok) {
          throw new Error(payload.error || 'Failed to load security telemetry');
        }
        setSecurityTelemetry(payload);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to load security telemetry';
        toast({
          variant: 'destructive',
          title: 'Could not load security telemetry',
          description: message,
        });
      } finally {
        setIsSecurityLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    Promise.all([loadFlags(), loadValidation(validationWindowDays)]).catch(() => undefined);
  }, [loadFlags, loadValidation, validationWindowDays]);

  useEffect(() => {
    loadSecurityTelemetry(securityWindowDays).catch(() => undefined);
  }, [loadSecurityTelemetry, securityWindowDays]);

  const setBusy = (id: string, value: boolean) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleToggleFlag = async (flag: FeatureFlag) => {
    setBusy(flag.id, true);
    try {
      const response = await fetch(`/api/features/${flag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !flag.enabled }),
      });

      const payload = (await response.json()) as { data?: FeatureFlag; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Failed to update feature flag');
      }

      setFlags((prev) => prev.map((item) => (item.id === flag.id ? payload.data! : item)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update feature flag';
      toast({
        variant: 'destructive',
        title: `Could not ${flag.enabled ? 'disable' : 'enable'} ${flag.name}`,
        description: message,
      });
    } finally {
      setBusy(flag.id, false);
    }
  };

  const handleDeleteFlag = async (flag: FeatureFlag) => {
    setBusy(flag.id, true);
    try {
      const response = await fetch(`/api/features/${flag.id}`, {
        method: 'DELETE',
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to delete feature flag');
      }

      setFlags((prev) => prev.filter((item) => item.id !== flag.id));
      toast({
        title: 'Feature flag deleted',
        description: `${flag.name} has been removed.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete feature flag';
      toast({
        variant: 'destructive',
        title: `Could not delete ${flag.name}`,
        description: message,
      });
    } finally {
      setBusy(flag.id, false);
    }
  };

  const handleCreateFlag = async () => {
    const normalizedName = newFlagName.trim().toUpperCase();

    if (!/^[A-Z][A-Z0-9_]+$/.test(normalizedName)) {
      toast({
        variant: 'destructive',
        title: 'Invalid flag name',
        description: 'Use UPPER_SNAKE_CASE (example: ENABLE_NEW_DASHBOARD).',
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: normalizedName,
          description: newFlagDescription.trim() || null,
          category: newFlagCategory,
          enabled: newFlagEnabled,
        }),
      });

      const payload = (await response.json()) as { data?: FeatureFlag; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Failed to create feature flag');
      }

      setFlags((prev) => [payload.data!, ...prev]);
      setNewFlagName('');
      setNewFlagDescription('');
      setNewFlagCategory('system');
      setNewFlagEnabled(false);
      toast({
        title: 'Feature flag created',
        description: `${payload.data.name} is now available.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create feature flag';
      toast({
        variant: 'destructive',
        title: 'Could not create feature flag',
        description: message,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const securityTelemetryContent = (() => {
    if (isSecurityLoading) {
      return (
        <div className="flex items-center justify-center py-8 text-text-secondary">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading security telemetry...
        </div>
      );
    }

    if (!securityTelemetry) {
      return (
        <p className="text-sm text-text-secondary">No security telemetry data is available.</p>
      );
    }

    const summaryCards = [
      { label: 'Reports', value: securityTelemetry.summary.totalReports },
      { label: 'Total findings', value: securityTelemetry.summary.totalFindings },
      { label: 'Reports with findings', value: securityTelemetry.summary.reportsWithFindings },
      { label: 'High-risk generations', value: securityTelemetry.summary.highRiskGenerations },
      { label: 'Scanner errors', value: securityTelemetry.summary.scannerErrors },
    ];

    return (
      <>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-md border border-surface-3 p-3">
              <p className="text-xs text-text-muted-foreground">{card.label}</p>
              <p className="text-lg font-semibold text-text-primary">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-surface-3 p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-text-muted-foreground">
              Severity distribution
            </p>
            <div className="space-y-1 text-sm text-text-secondary">
              {Object.entries(securityTelemetry.severityDistribution).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <span>{severity}</span>
                  <span className="font-medium text-text-primary">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-surface-3 p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-text-muted-foreground">
              Risk distribution
            </p>
            <div className="space-y-1 text-sm text-text-secondary">
              {Object.entries(securityTelemetry.riskDistribution).map(([risk, count]) => (
                <div key={risk} className="flex items-center justify-between">
                  <span>{risk}</span>
                  <span className="font-medium text-text-primary">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-text-muted-foreground">
            Top triggered rules
          </p>
          {securityTelemetry.topRules.length === 0 ? (
            <p className="text-sm text-text-secondary">No rules triggered in this window.</p>
          ) : (
            <div className="siza-scrollbar overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-3 text-sm">
                <thead>
                  <tr className="text-left text-text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Rule</th>
                    <th className="px-3 py-2 font-medium">Count</th>
                    <th className="px-3 py-2 font-medium">Max severity</th>
                    <th className="px-3 py-2 font-medium">Max risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-3">
                  {securityTelemetry.topRules.map((rule) => (
                    <tr key={rule.ruleId}>
                      <td className="px-3 py-2 font-mono text-xs text-text-primary">
                        {rule.ruleId}
                      </td>
                      <td className="px-3 py-2 text-text-primary">{rule.count}</td>
                      <td className="px-3 py-2 text-text-secondary">{rule.maxSeverity}</td>
                      <td className="px-3 py-2 text-text-secondary">{rule.maxRiskLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-text-muted-foreground">
            Recent high-risk generations
          </p>
          {securityTelemetry.recentHighRiskGenerations.length === 0 ? (
            <p className="text-sm text-text-secondary">No high-risk generations in this window.</p>
          ) : (
            <div className="siza-scrollbar overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-3 text-sm">
                <thead>
                  <tr className="text-left text-text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Generation</th>
                    <th className="px-3 py-2 font-medium">Created</th>
                    <th className="px-3 py-2 font-medium">Findings</th>
                    <th className="px-3 py-2 font-medium">Severity</th>
                    <th className="px-3 py-2 font-medium">Scanner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-3">
                  {securityTelemetry.recentHighRiskGenerations.map((item) => (
                    <tr key={item.generationId}>
                      <td className="px-3 py-2 font-mono text-xs text-text-primary">
                        {item.generationId.slice(0, 8)}
                      </td>
                      <td className="px-3 py-2 text-text-secondary">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-text-primary">{item.findingCount}</td>
                      <td className="px-3 py-2 text-text-secondary">
                        {item.highestSeverity ?? 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-text-secondary">{item.scannerExecution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  })();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <DashboardSection
        title="Admin"
        description="Manage feature flags and system behavior for all users."
        actions={<ShieldCheck className="h-5 w-5 text-text-muted-foreground" />}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Core-Flow Validation</CardTitle>
              <CardDescription>
                Tracks the 50-user gate with live metrics and daily snapshot trends.
              </CardDescription>
            </div>
            <div className="flex rounded-lg bg-surface-2 p-1">
              {validationWindowOptions.map((window) => (
                <Button
                  key={window}
                  variant={validationWindowDays === window ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setValidationWindowDays(window)}
                >
                  {window}d
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {isValidationLoading ? (
            <div className="flex items-center justify-center py-12 text-text-secondary">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading validation metrics...
            </div>
          ) : !validation ? (
            <p className="text-sm text-text-secondary">No validation data is available yet.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  className={
                    validation.gate.passed
                      ? 'bg-success/20 text-success border border-success/40'
                      : 'bg-error/20 text-error border border-error/40'
                  }
                >
                  {validation.gate.passed ? 'Gate passed' : 'Gate not passed'}
                </Badge>
                <p className="text-sm text-text-secondary">
                  Qualified users: {validation.current.qualifiedUsers} /{' '}
                  {validation.gate.qualifiedTarget}
                </p>
              </div>

              {!validation.gate.passed ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-text-secondary">
                  {validation.gate.reasons
                    .filter((reason) => reason !== 'PASS')
                    .map((reason) => (
                      <li key={reason}>
                        {reasonCopy[reason as Exclude<CoreFlowGateReason, 'PASS'>]}
                      </li>
                    ))}
                </ul>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-md border border-surface-3 p-3">
                  <p className="text-xs text-text-muted-foreground">Total users</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {validation.current.totalUsers}
                  </p>
                </div>
                <div className="rounded-md border border-surface-3 p-3">
                  <p className="text-xs text-text-muted-foreground">Onboarded users</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {validation.current.onboardedUsers}
                  </p>
                </div>
                <div className="rounded-md border border-surface-3 p-3">
                  <p className="text-xs text-text-muted-foreground">Users with project</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {validation.current.usersWithProject}
                  </p>
                </div>
                <div className="rounded-md border border-surface-3 p-3">
                  <p className="text-xs text-text-muted-foreground">
                    Users with completed generation
                  </p>
                  <p className="text-lg font-semibold text-text-primary">
                    {validation.current.usersWithCompletedGeneration}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-md border border-surface-3 p-3">
                  <p className="text-xs text-text-muted-foreground">Previous week average</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {validation.trend.previousWeekAvg}
                  </p>
                </div>
                <div className="rounded-md border border-surface-3 p-3">
                  <p className="text-xs text-text-muted-foreground">Current week average</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {validation.trend.currentWeekAvg}
                  </p>
                </div>
                <div className="rounded-md border border-surface-3 p-3">
                  <p className="text-xs text-text-muted-foreground">WoW drop</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {validation.trend.weekOverWeekDropPct}% / {validation.trend.maxAllowedDropPct}%
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-md border border-surface-3 p-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Activation Funnel</p>
                  <p className="text-xs text-text-secondary">
                    Cohort window {validation.activationFunnel.windowDays}d (since{' '}
                    {validation.activationFunnel.cohortStartDate})
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  <div className="rounded-md border border-surface-3 p-3">
                    <p className="text-xs text-text-muted-foreground">Started onboarding</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {validation.activationFunnel.counts.startedOnboarding}
                    </p>
                  </div>
                  <div className="rounded-md border border-surface-3 p-3">
                    <p className="text-xs text-text-muted-foreground">Completed onboarding</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {validation.activationFunnel.counts.completedOnboarding}
                    </p>
                  </div>
                  <div className="rounded-md border border-surface-3 p-3">
                    <p className="text-xs text-text-muted-foreground">First project</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {validation.activationFunnel.counts.firstProject}
                    </p>
                  </div>
                  <div className="rounded-md border border-surface-3 p-3">
                    <p className="text-xs text-text-muted-foreground">First completed generation</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {validation.activationFunnel.counts.firstCompletedGeneration}
                    </p>
                  </div>
                  <div className="rounded-md border border-surface-3 p-3">
                    <p className="text-xs text-text-muted-foreground">Qualified users</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {validation.activationFunnel.counts.qualifiedUsers}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-md border border-surface-3 p-3">
                    <p className="text-xs text-text-muted-foreground">Onboarding completion</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {validation.activationFunnel.conversionRates.onboardingCompletion}%
                    </p>
                  </div>
                  <div className="rounded-md border border-surface-3 p-3">
                    <p className="text-xs text-text-muted-foreground">Project activation</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {validation.activationFunnel.conversionRates.projectActivation}%
                    </p>
                  </div>
                  <div className="rounded-md border border-surface-3 p-3">
                    <p className="text-xs text-text-muted-foreground">Generation activation</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {validation.activationFunnel.conversionRates.generationActivation}%
                    </p>
                  </div>
                  <div className="rounded-md border border-surface-3 p-3">
                    <p className="text-xs text-text-muted-foreground">Qualification</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {validation.activationFunnel.conversionRates.qualification}%
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-text-muted-foreground">
                    Top drop-off reasons
                  </p>
                  {validation.activationFunnel.topDropoffReasons.length === 0 ? (
                    <p className="text-sm text-text-secondary">
                      No drop-off reasons detected in this window.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {validation.activationFunnel.topDropoffReasons.map((reason) => (
                        <div
                          key={reason.reason}
                          className="flex items-center justify-between rounded-md border border-surface-3 px-3 py-2"
                        >
                          <span className="text-sm text-text-secondary">
                            {dropoffReasonCopy[reason.reason]}
                          </span>
                          <span className="text-sm font-semibold text-text-primary">
                            {reason.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-text-muted-foreground">
                  Last 14 days
                </p>
                <div className="space-y-1">
                  {validation.snapshots.map((snapshot) => {
                    const pct = snapshot.captured
                      ? Math.round((snapshot.qualifiedUsers / maxSnapshotQualifiedUsers) * 100)
                      : 0;
                    return (
                      <div
                        key={snapshot.snapshotDate}
                        className="grid grid-cols-[64px_1fr_44px] gap-2"
                      >
                        <span className="text-xs text-text-muted-foreground">
                          {formatDateLabel(snapshot.snapshotDate)}
                        </span>
                        <div className="h-2 overflow-hidden rounded bg-surface-3">
                          <div
                            className={`h-2 rounded ${snapshot.captured ? 'bg-brand' : 'bg-surface-4'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-right text-xs text-text-secondary">
                          {snapshot.captured ? snapshot.qualifiedUsers : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Telemetry</CardTitle>
          <CardDescription>
            Live quality and adoption metrics for generation performance and routing behavior.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsDashboard />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Security Spoke</CardTitle>
              <CardDescription>
                Live Security Spoke telemetry from MCP generation streams.
              </CardDescription>
            </div>
            <div className="flex rounded-lg bg-surface-2 p-1">
              {securityWindowOptions.map((window) => (
                <Button
                  key={window}
                  variant={securityWindowDays === window ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSecurityWindowDays(window)}
                >
                  {window}d
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">{securityTelemetryContent}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create feature flag</CardTitle>
          <CardDescription>
            Use this panel to create and control rollout switches for Siza features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={newFlagName}
              onChange={(event) => setNewFlagName(event.target.value)}
              placeholder="ENABLE_EXPERIMENTAL_WIDGET"
              aria-label="Feature flag name"
            />
            <select
              value={newFlagCategory}
              onChange={(event) => setNewFlagCategory(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              aria-label="Feature flag category"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <Input
            value={newFlagDescription}
            onChange={(event) => setNewFlagDescription(event.target.value)}
            placeholder="Optional description"
            aria-label="Feature flag description"
          />

          <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={newFlagEnabled}
              onChange={(event) => setNewFlagEnabled(event.target.checked)}
              className="h-4 w-4 accent-brand"
            />
            Start as enabled
          </label>

          <div>
            <Button onClick={handleCreateFlag} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create flag
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature flags</CardTitle>
          <CardDescription>
            Toggle or remove flags. Changes are applied immediately to next flag resolution call.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-text-secondary">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading feature flags...
            </div>
          ) : sortedFlags.length === 0 ? (
            <p className="py-12 text-center text-sm text-text-secondary">
              No feature flags found. Create your first one above.
            </p>
          ) : (
            <div className="siza-scrollbar overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-3 text-sm">
                <thead>
                  <tr className="text-left text-text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Flag</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Enabled</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-3">
                  {sortedFlags.map((flag) => {
                    const isBusy = busyIds.has(flag.id);
                    return (
                      <tr key={flag.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-text-primary">{flag.name}</p>
                          {flag.description ? (
                            <p className="mt-0.5 text-xs text-text-secondary">{flag.description}</p>
                          ) : (
                            <p className="mt-0.5 text-xs text-text-muted-foreground">
                              No description
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{flag.category}</td>
                        <td className="px-4 py-3">
                          <label className="inline-flex items-center gap-2 text-xs text-text-secondary">
                            <input
                              type="checkbox"
                              checked={flag.enabled}
                              onChange={() => void handleToggleFlag(flag)}
                              disabled={isBusy}
                              className="h-4 w-4 accent-brand"
                            />
                            {flag.enabled ? 'Enabled' : 'Disabled'}
                          </label>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleDeleteFlag(flag)}
                            disabled={isBusy}
                            className="text-error hover:text-error/80"
                          >
                            {isBusy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Delete {flag.name}</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
