'use client';

import { useState } from 'react';
import { Copy, ArrowRight, CheckIcon, CodeIcon } from 'lucide-react';

interface GenerationCardProps {
  generation: {
    id: string;
    prompt: string;
    component_name: string;
    generated_code: string;
    framework: string;
    component_library?: string;
    style?: string;
    ai_provider?: string;
    model_used?: string;
    generation_time_ms?: number;
    created_at: string;
    status: string;
  };
  onReusePrompt: () => void;
  onCopyCode: () => void;
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

export function GenerationCard({ generation, onReusePrompt, onCopyCode }: GenerationCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeAgo = getTimeAgo(generation.created_at);
  const codePreview = generation.generated_code?.slice(0, 120) || '';

  return (
    <div className="rounded-lg border border-surface-3 bg-surface-1 p-4 flex flex-col gap-3 hover:border-surface-3 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-text-primary text-sm truncate flex-1">
          {generation.component_name || 'Untitled'}
        </h3>
        <div
          className={`px-2 py-0.5 text-xs rounded-full border ${
            FRAMEWORK_COLORS[generation.framework] ||
            'bg-surface-2 text-text-secondary border-surface-3'
          }`}
        >
          {generation.framework}
        </div>
      </div>

      <p className="text-xs text-text-secondary line-clamp-2">{generation.prompt}</p>

      {codePreview && (
        <div className="bg-surface-0 rounded-md p-2 text-xs font-mono text-text-muted overflow-hidden">
          <div className="flex items-center gap-1 mb-1 text-text-muted">
            <CodeIcon className="h-3 w-3" />
            <span>Preview</span>
          </div>
          <pre className="truncate">{codePreview}...</pre>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
        <span>{timeAgo}</span>
        {generation.ai_provider && (
          <>
            <span className="text-surface-3">|</span>
            <span>{PROVIDER_LABELS[generation.ai_provider] || generation.ai_provider}</span>
          </>
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

      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-surface-3">
        <button
          onClick={handleCopy}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-surface-3 text-text-secondary hover:bg-surface-2 transition-colors"
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
        <button
          onClick={onReusePrompt}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-brand text-white hover:opacity-90 transition-colors"
        >
          Reuse Prompt
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}
