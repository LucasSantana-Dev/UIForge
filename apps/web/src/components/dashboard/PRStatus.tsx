'use client';

import { ExternalLink, GitPullRequest } from 'lucide-react';

interface PR {
  number: number;
  title: string;
  htmlUrl: string;
  state: 'open' | 'closed' | 'merged';
  createdAt: string;
}

interface PRStatusProps {
  prs: PR[];
}

const stateColors = {
  open: 'text-green-600 bg-green-950',
  closed: 'text-red-600 bg-red-950',
  merged: 'text-purple-600 bg-purple-950',
};

export default function PRStatus({ prs }: PRStatusProps) {
  if (!prs.length) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <GitPullRequest className="h-4 w-4" />
        Recent PRs
      </h4>
      <div className="space-y-1">
        {prs.map((pr) => (
          <a
            key={pr.number}
            href={pr.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm
              hover:bg-accent rounded px-2 py-1.5 -mx-2"
          >
            <span
              className={`text-xs px-1.5 py-0.5 rounded
                font-medium ${stateColors[pr.state]}`}
            >
              {pr.state}
            </span>
            <span className="truncate flex-1">
              #{pr.number} {pr.title}
            </span>
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
