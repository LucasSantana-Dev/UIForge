'use client';

import { useEffect, useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Activity,
  Clock,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
} from 'lucide-react';
import type { AuditEvent, AuditEventsResponse } from '@/lib/audit/client';
import { isFeatureEnabled } from '@/lib/features/flags';
import { Skeleton } from '@siza/ui';

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/15 border-red-500/20',
  high: 'text-orange-400 bg-orange-500/15 border-orange-500/20',
  medium: 'text-amber-400 bg-amber-500/15 border-amber-500/20',
  low: 'text-sky-400 bg-sky-500/15 border-sky-500/20',
  info: 'text-text-muted bg-surface-2 border-surface-3',
};

function SeverityBadge({ severity }: { severity: string }) {
  const color = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.info;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${color}`}
    >
      {severity}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="bg-surface-1 border border-surface-3 rounded-xl p-4 transition-colors hover:border-violet-500/20">
      <div className="flex items-center gap-2 text-text-muted text-sm mb-2">
        <Icon className={`h-4 w-4 ${accent ?? ''}`} />
        {label}
      </div>
      <div className="text-2xl font-display font-bold text-text-primary">{value}</div>
    </div>
  );
}

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const enabled = isFeatureEnabled('ENABLE_AUDIT_DASHBOARD');

  useEffect(() => {
    if (!enabled) return;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), page_size: '50' });
        if (severityFilter) params.set('severity', severityFilter);
        if (typeFilter) params.set('event_type', typeFilter);

        const res = await fetch(`/api/audit?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: AuditEventsResponse = await res.json();
        setEvents(data.events);
        setTotal(data.total);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audit events');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [enabled, page, severityFilter, typeFilter]);

  if (!enabled) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-violet-400" />
        </div>
        <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
          Audit Dashboard
        </h3>
        <p className="text-sm text-text-secondary">
          Enable the <code className="font-mono text-violet-400">ENABLE_AUDIT_DASHBOARD</code> flag
          to access security audit logs.
        </p>
      </div>
    );
  }

  const criticalCount = events.filter((e) => e.severity === 'critical').length;
  const highCount = events.filter((e) => e.severity === 'high').length;
  const totalPages = Math.ceil(total / 50) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">Security Audit</h1>
        <p className="text-sm text-text-secondary mt-2">
          Monitor security events from the MCP Gateway
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Total Events" value={total} accent="text-violet-400" />
        <StatCard
          icon={AlertTriangle}
          label="Critical"
          value={criticalCount}
          accent="text-red-400"
        />
        <StatCard icon={Shield} label="High" value={highCount} accent="text-orange-400" />
        <StatCard
          icon={Clock}
          label="Page"
          value={`${page} / ${totalPages}`}
          accent="text-text-muted"
        />
      </div>

      <div className="flex items-center gap-3">
        <FilterIcon className="w-4 h-4 text-text-muted" />
        <select
          value={severityFilter}
          onChange={(e) => {
            setSeverityFilter(e.target.value);
            setPage(1);
          }}
          className="bg-surface-1 border border-surface-3 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
        >
          <option value="">All severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="bg-surface-1 border border-surface-3 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
        >
          <option value="">All types</option>
          <option value="request_received">Request Received</option>
          <option value="request_blocked">Request Blocked</option>
          <option value="rate_limit_exceeded">Rate Limit Exceeded</option>
          <option value="prompt_injection_detected">Prompt Injection</option>
          <option value="suspicious_activity">Suspicious Activity</option>
          <option value="authentication_failed">Auth Failed</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Shield className="w-10 h-10 text-text-muted mb-3" />
          <p className="text-sm text-text-secondary">No audit events found.</p>
        </div>
      ) : (
        <div className="border border-surface-3 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-1 text-text-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Time</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Severity</th>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-3">
              {events.map((event, i) => (
                <tr
                  key={`${event.request_id ?? i}-${event.timestamp}`}
                  className="hover:bg-surface-2/50 transition-colors"
                >
                  <td className="px-4 py-3 text-text-secondary whitespace-nowrap text-xs">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-text-primary font-mono text-xs">
                    {event.event_type}
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={event.severity} />
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs font-mono">
                    {event.user_id ?? '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs max-w-xs truncate">
                    {JSON.stringify(event.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 50 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-md border border-surface-3 text-text-secondary disabled:opacity-40 hover:bg-surface-2 transition-colors"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <span className="text-sm text-text-muted px-3">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 50 >= total}
            className="p-2 rounded-md border border-surface-3 text-text-secondary disabled:opacity-40 hover:bg-surface-2 transition-colors"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
