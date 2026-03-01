'use client';

import { useEffect, useState } from 'react';
import { GitPullRequestIcon, ExternalLinkIcon, GitMergeIcon, XCircleIcon } from 'lucide-react';

interface PR {
  id: string;
  pr_number: number;
  pr_html_url: string;
  branch_name: string;
  component_name: string | null;
  state: 'open' | 'closed' | 'merged';
  created_at: string;
}

const STATE_STYLES: Record<string, string> = {
  open: 'bg-green-900/30 text-green-400 border-green-800',
  merged: 'bg-violet-900/30 text-violet-400 border-violet-800',
  closed: 'bg-red-900/30 text-red-400 border-red-800',
};

const STATE_ICONS: Record<string, React.ReactNode> = {
  open: <GitPullRequestIcon className="h-3.5 w-3.5" />,
  merged: <GitMergeIcon className="h-3.5 w-3.5" />,
  closed: <XCircleIcon className="h-3.5 w-3.5" />,
};

export function PRList({ projectId }: { projectId: string }) {
  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/github/prs?projectId=${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setPrs(data.prs || []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  if (loading) {
    return <div className="text-sm text-text-secondary py-2">Loading PRs...</div>;
  }

  if (prs.length === 0) {
    return <div className="text-sm text-text-secondary py-2">No pull requests yet.</div>;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-text-primary">Pull Requests</h4>
      <div className="space-y-1.5">
        {prs.map((pr) => (
          <a
            key={pr.id}
            href={pr.pr_html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-surface-1 border border-surface-3 hover:border-brand/50 transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded border ${STATE_STYLES[pr.state]}`}
              >
                {STATE_ICONS[pr.state]}
                {pr.state}
              </span>
              <span className="text-sm text-text-primary truncate">
                #{pr.pr_number}
                {pr.component_name && ` — ${pr.component_name}`}
              </span>
            </div>
            <ExternalLinkIcon className="h-3.5 w-3.5 text-text-secondary group-hover:text-brand shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
