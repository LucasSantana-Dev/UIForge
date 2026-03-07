'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  GitBranchIcon,
  Loader2Icon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  XCircleIcon,
  BanIcon,
  ExternalLinkIcon,
  PlayCircleIcon,
} from 'lucide-react';

interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  branch: string;
  commit_message: string;
  html_url: string;
  run_started_at: string | null;
  updated_at: string;
  duration_ms: number | null;
}

interface CicdPanelProps {
  repositoryUrl?: string;
}

function parseRepoFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return `${parts[0]}/${parts[1]}`;
  } catch {
    return null;
  }
}

function getStatusIcon(run: WorkflowRun) {
  if (run.status === 'in_progress' || run.status === 'queued') {
    return <Loader2Icon className="h-4 w-4 text-amber-400 animate-spin" />;
  }
  if (run.conclusion === 'success') {
    return <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />;
  }
  if (run.conclusion === 'failure') {
    return <XCircleIcon className="h-4 w-4 text-red-500" />;
  }
  if (run.conclusion === 'cancelled') {
    return <BanIcon className="h-4 w-4 text-gray-400" />;
  }
  return <PlayCircleIcon className="h-4 w-4 text-gray-400" />;
}

function getStatusBadge(run: WorkflowRun) {
  let label: string;
  let style: string;

  if (run.status === 'in_progress') {
    label = 'In Progress';
    style = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else if (run.status === 'queued') {
    label = 'Queued';
    style = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  } else if (run.conclusion === 'success') {
    label = 'Success';
    style = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  } else if (run.conclusion === 'failure') {
    label = 'Failed';
    style = 'bg-red-500/10 text-red-500 border-red-500/20';
  } else if (run.conclusion === 'cancelled') {
    label = 'Cancelled';
    style = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  } else {
    label = run.status;
    style = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${style}`}>{label}</span>
  );
}

function formatDuration(ms: number | null): string {
  if (ms === null || ms < 0) return '—';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
}

export default function CicdPanel({ repositoryUrl }: CicdPanelProps) {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadedRepo, setLoadedRepo] = useState<string | null>(null);

  const repo = repositoryUrl ? parseRepoFromUrl(repositoryUrl) : null;
  const isLoading = repo !== null && loadedRepo !== repo;

  useEffect(() => {
    if (!repo) return;

    let cancelled = false;
    async function loadRuns() {
      try {
        const res = await fetch(`/api/catalog/ci?repo=${encodeURIComponent(repo)}`);
        if (!res.ok) throw new Error('Failed to fetch workflow runs');
        const json = await res.json();
        if (!cancelled) {
          setRuns(json.data || []);
          setError(null);
          setLoadedRepo(repo);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setRuns([]);
          setLoadedRepo(repo);
        }
      }
    }
    loadRuns();
    return () => {
      cancelled = true;
    };
  }, [repo]);

  if (!repo) {
    return (
      <div className="rounded-xl border border-surface-3 bg-surface-1 p-8 text-center">
        <GitBranchIcon className="mx-auto h-8 w-8 text-text-muted mb-3" />
        <p className="text-sm text-text-secondary">
          No GitHub repository configured for CI/CD visibility.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-surface-3 bg-surface-1 p-8 text-center">
        <Loader2Icon className="mx-auto h-6 w-6 text-violet-400 animate-spin mb-3" />
        <p className="text-sm text-text-secondary">Loading workflow runs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-surface-3 bg-surface-1 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangleIcon className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-text-primary mb-1">Unable to load CI/CD data</p>
            <p className="text-xs text-text-secondary mb-3">{error}</p>
            <a
              href={`${repositoryUrl}/actions`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-violet-400 hover:underline"
            >
              View on GitHub <ExternalLinkIcon className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="rounded-xl border border-surface-3 bg-surface-1 p-8 text-center">
        <GitBranchIcon className="mx-auto h-8 w-8 text-text-muted mb-3" />
        <p className="text-sm text-text-secondary">No workflow runs found for this repository.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 overflow-hidden">
      <div className="flex items-center justify-between border-b border-surface-3 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <PlayCircleIcon className="h-4 w-4" />
          CI/CD Workflow Runs
        </div>
        <a
          href={`${repositoryUrl}/actions`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-violet-400 transition-colors"
        >
          View all <ExternalLinkIcon className="h-3 w-3" />
        </a>
      </div>

      <div className="divide-y divide-surface-3">
        {runs.map((run) => (
          <div key={run.id} className="px-4 py-3 flex items-center gap-3">
            <div className="flex-shrink-0">{getStatusIcon(run)}</div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <a
                  href={run.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-text-primary hover:text-violet-400 truncate"
                >
                  {run.name}
                </a>
                {getStatusBadge(run)}
              </div>
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                {run.commit_message && (
                  <span className="truncate max-w-[200px]">
                    {run.commit_message.split('\n')[0]}
                  </span>
                )}
                {run.branch && (
                  <span className="inline-flex items-center gap-1 flex-shrink-0">
                    <GitBranchIcon className="h-3 w-3" />
                    {run.branch}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 text-right text-xs text-text-secondary">
              <div>{formatDuration(run.duration_ms)}</div>
              <div>
                {formatDistanceToNow(new Date(run.updated_at), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
