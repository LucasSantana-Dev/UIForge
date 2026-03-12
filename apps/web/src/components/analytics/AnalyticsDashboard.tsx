'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, Download, Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MetricsReport, MetricsWindowDays } from '@/lib/analytics/metrics';

const TIME_RANGES: MetricsWindowDays[] = [7, 30, 90];

function formatPercent(value: number | null) {
  if (value === null) return 'N/A';
  return `${value}%`;
}

function formatValue(value: number) {
  return value.toLocaleString();
}

function useLiveMetrics() {
  const [timeRange, setTimeRange] = useState<MetricsWindowDays>(30);
  const [data, setData] = useState<MetricsReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (windowDays: MetricsWindowDays) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/metrics?windowDays=${windowDays}`, {
        cache: 'no-store',
      });
      const payload = (await response.json()) as MetricsReport & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to load metrics');
      }
      setData(payload);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(timeRange);
  }, [load, timeRange]);

  return { timeRange, setTimeRange, data, isLoading, error, refresh: () => load(timeRange) };
}

export default function AnalyticsDashboard() {
  const { timeRange, setTimeRange, data, isLoading, error, refresh } = useLiveMetrics();

  const exportData = useCallback(() => {
    if (!data) return;

    const csvContent = [
      ['Metric', 'Value'],
      ['Users Total', data.users.total],
      ['Users Active', data.users.active],
      ['Users Last 7d', data.users.last7d],
      ['Users Last 30d', data.users.last30d],
      ['Generations Total', data.generations.total],
      ['Generations Last 24h', data.generations.last24h],
      ['Generations Last 7d', data.generations.last7d],
      ['Generation Success Rate', `${data.generations.successRate}%`],
      ['Projects Total', data.projects.total],
      ['Quality Window (Days)', data.quality.windowDays],
      ['Quality Total Generations', data.quality.totalGenerations],
      ['Revision Rate', `${data.quality.revisionRate}%`],
      [
        'Satisfaction Rate',
        data.quality.satisfactionRate === null ? 'N/A' : `${data.quality.satisfactionRate}%`,
      ],
      ['Satisfaction Votes', data.quality.satisfactionVotes],
      ['MCP Coverage', `${data.quality.mcpCoverage}%`],
      ['Captured At', data.timestamp],
    ];

    const csv = csvContent.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${timeRange}d.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }, [data, timeRange]);

  const qualityRows = useMemo(() => {
    if (!data) return [];
    return [
      { label: 'Revision Rate', value: formatPercent(data.quality.revisionRate) },
      { label: 'Satisfaction Rate', value: formatPercent(data.quality.satisfactionRate) },
      { label: 'MCP Coverage', value: formatPercent(data.quality.mcpCoverage) },
      { label: 'Satisfaction Votes', value: formatValue(data.quality.satisfactionVotes) },
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Live Analytics</h2>
          <p className="text-sm text-text-secondary">
            Product telemetry sourced from live generation, project, and feedback data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-surface-2 p-1">
            {TIME_RANGES.map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}d
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportData} disabled={!data}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border-error/40 bg-error/10 p-4 text-sm text-error">{error}</Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs text-text-muted-foreground">Users</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">
            {isLoading || !data ? '...' : formatValue(data.users.total)}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Active: {isLoading || !data ? '...' : formatValue(data.users.active)}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-text-muted-foreground">Generations</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">
            {isLoading || !data ? '...' : formatValue(data.generations.total)}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Last 7d: {isLoading || !data ? '...' : formatValue(data.generations.last7d)}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-text-muted-foreground">Generation Success</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">
            {isLoading || !data ? '...' : `${data.generations.successRate}%`}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-text-secondary">
            <TrendingUp className="h-3.5 w-3.5" />
            Success rate across all generations
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-text-muted-foreground">Projects</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">
            {isLoading || !data ? '...' : formatValue(data.projects.total)}
          </p>
          <p className="mt-1 text-xs text-text-secondary">Total projects created</p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand" />
            <h3 className="text-base font-semibold text-text-primary">Quality Telemetry</h3>
          </div>
          {data ? (
            <Badge variant="outline">
              Window: {data.quality.windowDays}d ({formatValue(data.quality.totalGenerations)} gens)
            </Badge>
          ) : null}
        </div>

        <div className="space-y-2">
          {qualityRows.map((row) => (
            <div
              key={row.label}
              className={[
                'flex items-center justify-between rounded-md border border-surface-3',
                'px-3 py-2',
              ].join(' ')}
            >
              <span className="text-sm text-text-secondary">{row.label}</span>
              <span className="text-sm font-semibold text-text-primary">
                {isLoading ? '...' : row.value}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-brand" />
          <h3 className="text-base font-semibold text-text-primary">Telemetry Snapshot</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-md border border-surface-3 p-3">
            <p className="text-xs text-text-muted-foreground">Users Last 7d</p>
            <p className="mt-1 text-lg font-semibold text-text-primary">
              {isLoading || !data ? '...' : formatValue(data.users.last7d)}
            </p>
          </div>
          <div className="rounded-md border border-surface-3 p-3">
            <p className="text-xs text-text-muted-foreground">Users Last 30d</p>
            <p className="mt-1 text-lg font-semibold text-text-primary">
              {isLoading || !data ? '...' : formatValue(data.users.last30d)}
            </p>
          </div>
          <div className="rounded-md border border-surface-3 p-3">
            <p className="text-xs text-text-muted-foreground">Generations Last 24h</p>
            <p className="mt-1 text-lg font-semibold text-text-primary">
              {isLoading || !data ? '...' : formatValue(data.generations.last24h)}
            </p>
          </div>
          <div className="rounded-md border border-surface-3 p-3">
            <p className="text-xs text-text-muted-foreground">Last Capture</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">
              {isLoading || !data ? '...' : new Date(data.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
