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
  const pct = generationsLimit > 0 ? (generationsUsed / generationsLimit) * 100 : 0;

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
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-5 w-5 text-violet-400" />
        <span className="font-medium text-text-primary">Siza AI</span>
        {selected && <span className="ml-auto text-xs font-medium text-violet-400">Active</span>}
      </div>
      <p className="text-xs text-text-secondary mb-3">
        Smart routing — automatically picks the best model for your prompt
      </p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-text-muted">{remaining} generations left</span>
          <span className="text-text-muted">
            {generationsUsed}/{generationsLimit}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-violet-500'
            )}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
    </button>
  );
}
