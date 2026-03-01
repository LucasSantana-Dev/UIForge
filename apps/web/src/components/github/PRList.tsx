'use client';

import { useEffect, useState } from 'react';
import { GitPullRequestIcon, ExternalLinkIcon } from 'lucide-react';

interface PR {
  id: string;
  pr_number: number;
  pr_html_url: string;
  branch_name: string;
  state: 'open' | 'closed' | 'merged';
  component_name: string | null;
  created_at: string;
}

const STATE_STYLES: Record<string, string> = {
  open: 'bg-green-600/20 text-green-400',
  merged: 'bg-violet-600/20 text-violet-400',
  closed: 'bg-red-600/20 text-red-400',
};

interface PRListProps {
  projectId: string;
}

export function PRList({ projectId }: PRListProps) {
  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPRs = async () => {
      try {
        const res = await fetch('/api/github/prs?projectId=' + encodeURIComponent(projectId));
        if (res.ok) {
          const data = await res.json();
          setPrs(data.prs || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPRs();
  }, [projectId]);

  if (loading) {
    return <div className="text-sm text-text-muted py-2">Loading PRs...</div>;
  }

  if (prs.length === 0) {
    return <div className="text-sm text-text-muted py-2">No pull requests yet</div>;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-text-primary flex items-center gap-2">
        <GitPullRequestIcon className="h-4 w-4" />
        Pull Requests
      </h4>
      <div className="space-y-1">
        {prs.map((pr) => (
          <a
            key={pr.id}
            href={pr.pr_html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-md border border-surface-3 px-3 py-2 text-sm hover:border-surface-4"
          >
            <div className="flex items-center gap-2">
              <span
                className={'rounded-full px-2 py-0.5 text-xs ' + (STATE_STYLES[pr.state] || '')}
              >
                {pr.state}
              </span>
              <span className="text-text-primary">
                #{pr.pr_number}
                {pr.component_name && ' — ' + pr.component_name}
              </span>
            </div>
            <ExternalLinkIcon className="h-3.5 w-3.5 text-text-muted" />
          </a>
        ))}
      </div>
    </div>
  );
}
