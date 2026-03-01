'use client';

import { useState } from 'react';
import {
  GitPullRequestIcon,
  CheckCircleIcon,
  Loader2Icon,
} from 'lucide-react';

interface PushToGitHubButtonProps {
  projectId: string;
  generationId?: string;
  componentName: string;
  code: string;
  prompt: string;
  model: string;
}

export function PushToGitHubButton({
  projectId,
  generationId,
  componentName,
  code,
  prompt,
  model,
}: PushToGitHubButtonProps) {
  const [state, setState] = useState<
    'idle' | 'pushing' | 'success' | 'error'
  >('idle');
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePush = async () => {
    setState('pushing');
    setErrorMsg(null);
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
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create PR');
      }
      setPrUrl(data.pr?.htmlUrl || null);
      setState('success');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Push failed'
      );
      setState('error');
    }
  };

  if (state === 'success' && prUrl) {
    return (
      <a
        href={prUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md border border-green-600/30 bg-green-600/10 px-3 py-1.5 text-sm text-green-400 hover:bg-green-600/20"
      >
        <CheckCircleIcon className="h-4 w-4" />
        PR Created
      </a>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handlePush}
        disabled={state === 'pushing'}
        className="inline-flex items-center gap-2 rounded-md border border-surface-3 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:border-surface-4 disabled:opacity-50"
      >
        {state === 'pushing' ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          <GitPullRequestIcon className="h-4 w-4" />
        )}
        Push to GitHub
      </button>
      {state === 'error' && errorMsg && (
        <span className="text-xs text-red-400">{errorMsg}</span>
      )}
    </div>
  );
}
