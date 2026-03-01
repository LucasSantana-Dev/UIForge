'use client';

import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

interface SizaAICardProps {
  selected: boolean;
  onSelect: () => void;
  generationsUsed: number;
  generationsLimit: number;
}

export function SizaAICard({
  selected,
  onSelect,
  generationsUsed,
  generationsLimit,
}: SizaAICardProps) {
  const remaining = Math.max(0, generationsLimit - generationsUsed);
  const pct =
    generationsLimit > 0
      ? (generationsUsed / generationsLimit) * 100
      : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-lg border p-4 text-left transition-all',
        selected
          ? 'border-violet-500 bg-violet-500/10 ring-1 ring-violet-500/50'
          : 'border-surface-3 bg-surface-1 hover:border-surface-4'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-violet-400" />
          <span className="font-medium text-text-primary">Siza AI</span>
          <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300">
            Recommended
          </span>
        </div>
        <div
          className={cn(
            'h-4 w-4 rounded-full border-2',
            selected
              ? 'border-violet-500 bg-violet-500'
              : 'border-surface-4'
          )}
        />
      </div>
      <p className="text-xs text-text-secondary mb-3">
        Smart routing for best quality and speed
      </p>
      {generationsLimit > 0 && (
        <div>
          <div className="flex justify-between text-[10px] text-text-muted mb-1">
            <span>
              {remaining} of {generationsLimit} remaining
            </span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{ width: Math.min(pct, 100) + '%' }}
            />
          </div>
        </div>
      )}
    </button>
  );
}
