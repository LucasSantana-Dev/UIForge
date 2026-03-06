'use client';

import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Activity, Clock } from 'lucide-react';
import type { AuditEvent, AuditEventsResponse } from '@/lib/audit/client';
import { isFeatureEnabled } from '@/lib/features/flags';

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/20',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  low: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  info: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',
};

function SeverityBadge({ severity }: { severity: string }) {
  const color = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.info;
  return <span className={`px-2 py-0.5 rounded text-xs border ${color}`}>{severity}</span>;
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="text-2xl font-semibold text-zinc-100">{value}</div>
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
      <div className="p-8 text-center text-zinc-500">
        Audit dashboard is not enabled. Set ENABLE_AUDIT_DASHBOARD flag to true.
      </div>
    );
  }

  const criticalCount = events.filter((e) => e.severity === 'critical').length;
  const highCount = events.filter((e) => e.severity === 'high').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Security Audit</h1>
        <p className="text-sm text-zinc-400 mt-1">Monitor security events from the MCP Gateway</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Total Events" value={total} />
        <StatCard icon={AlertTriangle} label="Critical" value={criticalCount} />
        <StatCard icon={Shield} label="High" value={highCount} />
        <StatCard icon={Clock} label="Page" value={`${page} / ${Math.ceil(total / 50) || 1}`} />
      </div>

      <div className="flex gap-3">
        <select
          value={severityFilter}
          onChange={(e) => {
            setSeverityFilter(e.target.value);
            setPage(1);
          }}
          className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-300"
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
          className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-300"
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
        <div className="text-zinc-500 text-center py-12">Loading audit events...</div>
      ) : error ? (
        <div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-4">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="text-zinc-500 text-center py-12">No audit events found.</div>
      ) : (
        <div className="border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/80 text-zinc-400">
              <tr>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Severity</th>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {events.map((event, i) => (
                <tr
                  key={`${event.request_id ?? i}-${event.timestamp}`}
                  className="hover:bg-zinc-900/50"
                >
                  <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{event.event_type}</td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={event.severity} />
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{event.user_id ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs max-w-xs truncate">
                    {JSON.stringify(event.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 50 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 50 >= total}
            className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
