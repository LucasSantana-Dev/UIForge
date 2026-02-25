'use client';

import { clsx } from 'clsx';
import type { Phase } from './types';

interface PhaseNavigatorProps {
  phases: Phase[];
  activePhase: number | null;
  onSelect: (phaseNumber: number) => void;
}

export function PhaseNavigator({ phases, activePhase, onSelect }: PhaseNavigatorProps) {
  return (
    <div
      className="flex items-center justify-center gap-4"
      role="group"
      aria-label="Phase navigation"
    >
      {phases.map((phase) => (
        <button
          key={phase.number}
          type="button"
          onClick={() => onSelect(phase.number)}
          aria-pressed={activePhase === phase.number}
          className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
            {
              'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(124,58,237,0.3)]':
                activePhase === phase.number,
              'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30':
                activePhase !== phase.number,
            }
          )}
        >
          <span
            className={clsx('w-2 h-2 rounded-full', {
              'bg-green-400': phase.status === 'active',
              'bg-primary/50': phase.status === 'planned',
              'bg-muted-foreground/30': phase.status !== 'active' && phase.status !== 'planned',
            })}
          />
          Phase {phase.number}
        </button>
      ))}
    </div>
  );
}
