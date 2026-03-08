'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, CheckIcon, CodeIcon, ArrowRight } from 'lucide-react';

interface GalleryCardProps {
  generation: {
    id: string;
    prompt: string;
    component_name: string;
    generated_code: string;
    framework: string;
    component_library?: string;
    ai_provider?: string;
    generation_time_ms?: number;
    quality_score?: number;
    created_at: string;
  };
}

const FRAMEWORK_COLORS: Record<string, string> = {
  react: 'bg-blue-900/30 text-blue-400 border-blue-800',
  vue: 'bg-green-900/30 text-green-400 border-green-800',
  angular: 'bg-red-900/30 text-red-400 border-red-800',
  svelte: 'bg-orange-900/30 text-orange-400 border-orange-800',
};

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Gemini',
  openai: 'OpenAI',
  anthropic: 'Claude',
};

function getGradeBadge(score: number | null | undefined) {
  if (score == null) return null;
  const grade = score > 0.9 ? 'A' : score > 0.8 ? 'B' : score > 0.6 ? 'C' : 'D';
  const colors =
    score > 0.8
      ? 'bg-green-900/30 text-green-400 border-green-800'
      : score > 0.6
        ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800'
        : 'bg-red-900/30 text-red-400 border-red-800';
  return <span className={`rounded-full border px-2 py-0.5 text-xs ${colors}`}>{grade}</span>;
}

export function GalleryCard({ generation }: GalleryCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generation.generated_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codePreview = generation.generated_code?.slice(0, 150) || '';

  return (
    <div className="group flex flex-col gap-3 rounded-lg border border-surface-3 bg-surface-1 p-4 transition-colors hover:border-violet-500/30">
      <div className="flex items-start justify-between gap-2">
        <h3 className="flex-1 truncate text-sm font-medium text-text-primary">
          {generation.component_name || 'Untitled'}
        </h3>
        <div className="flex items-center gap-1.5">
          {getGradeBadge(generation.quality_score)}
          <span
            className={`rounded-full border px-2 py-0.5 text-xs ${
              FRAMEWORK_COLORS[generation.framework] ||
              'bg-surface-2 text-text-secondary border-surface-3'
            }`}
          >
            {generation.framework}
          </span>
        </div>
      </div>

      <p className="line-clamp-2 text-xs text-text-secondary">{generation.prompt}</p>

      {codePreview && (
        <div className="overflow-hidden rounded-md bg-surface-0 p-2 text-xs font-mono text-text-muted-foreground">
          <div className="mb-1 flex items-center gap-1 text-text-muted-foreground">
            <CodeIcon className="h-3 w-3" />
            <span>Preview</span>
          </div>
          <pre className="line-clamp-3 whitespace-pre-wrap">{codePreview}</pre>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted-foreground">
        {generation.ai_provider && (
          <span>{PROVIDER_LABELS[generation.ai_provider] || generation.ai_provider}</span>
        )}
        {generation.component_library && (
          <>
            <span className="text-surface-3">|</span>
            <span>{generation.component_library}</span>
          </>
        )}
        {generation.generation_time_ms && (
          <>
            <span className="text-surface-3">|</span>
            <span>{(generation.generation_time_ms / 1000).toFixed(1)}s</span>
          </>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-surface-3 pt-2">
        <button
          onClick={handleCopy}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-surface-3 px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-surface-2"
        >
          {copied ? (
            <>
              <CheckIcon className="h-3 w-3 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy Code
            </>
          )}
        </button>
        <Link
          href={`/generate?prompt=${encodeURIComponent(generation.prompt)}`}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs text-white transition-colors hover:opacity-90"
        >
          Try This Prompt
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
