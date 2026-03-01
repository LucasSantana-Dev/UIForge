'use client';

import { useState } from 'react';
import { GitPullRequestIcon, Loader2Icon, CheckIcon, XIcon } from 'lucide-react';

interface PushToGitHubButtonProps {
  projectId: string;
  generationId?: string;
  componentName: string;
  code: string;
  prompt: string;
  model: string;
}

type PushState = 'idle' | 'pushing' | 'success' | 'error';

export function PushToGitHubButton({
  projectId,
  generationId,
  componentName,
  code,
  prompt,
  model,
}: PushToGitHubButtonProps) {
  const [state, setState] = useState<PushState>('idle');
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePush() {
    setState('pushing');
    setError(null);
    try {
      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          generationId,
          componentName,
          code,
          prompt,
          model,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create PR');
      setPrUrl(data.pr?.html_url || null);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setState('error');
    }
  }

  if (state === 'success' && prUrl) {
    return (
      <a
        href={prUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-green-900/30 text-green-400 border border-green-800 hover:bg-green-900/50 transition-colors"
      >
        <CheckIcon className="h-4 w-4" />
        PR Created
      </a>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handlePush}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50 transition-colors"
        >
          <XIcon className="h-4 w-4" />
          Retry
        </button>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }

  return (
    <button
      onClick={handlePush}
      disabled={state === 'pushing'}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-surface-1 text-text-secondary border border-surface-3 hover:text-text-primary hover:border-surface-3 transition-colors disabled:opacity-50"
    >
      {state === 'pushing' ? (
        <Loader2Icon className="h-4 w-4 animate-spin" />
      ) : (
        <GitPullRequestIcon className="h-4 w-4" />
      )}
      {state === 'pushing' ? 'Creating PR...' : 'Push to GitHub'}
    </button>
  );
}
