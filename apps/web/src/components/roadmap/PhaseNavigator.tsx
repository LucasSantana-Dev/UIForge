'use client';

import type { Phase } from './types';

interface PhaseNavigatorProps {
  phases: Phase[];
  activePhase: number | null;
  onSelect: (phaseNumber: number) => void;
}

export function PhaseNavigator({ phases, activePhase, onSelect }: PhaseNavigatorProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {phases.map((phase) => (
        <button
          key={phase.number}
          onClick={() => onSelect(phase.number)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activePhase === phase.number
              ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(124,58,237,0.3)]'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${phase.status === 'active' ? 'bg-green-400' : phase.status === 'planned' ? 'bg-primary/50' : 'bg-muted-foreground/30'}`}
          />
          Phase {phase.number}
        </button>
      ))}
    </div>
  );
}
