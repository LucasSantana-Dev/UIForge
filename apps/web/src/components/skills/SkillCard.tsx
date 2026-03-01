'use client';

import {
  Component,
  FormInput,
  LayoutDashboard,
  Paintbrush,
  ShieldCheck,
  Layers,
  Code,
  Puzzle,
  CheckCircle2Icon,
} from 'lucide-react';
import type { SkillRow } from '@/lib/repositories/skill.repo';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Component,
  FormInput,
  LayoutDashboard,
  Paintbrush,
  ShieldCheck,
  Layers,
  Code,
  Puzzle,
};

interface SkillCardProps {
  skill: SkillRow;
  selected: boolean;
  onToggle: (skillId: string) => void;
  disabled?: boolean;
}

export function SkillCard({ skill, selected, onToggle, disabled }: SkillCardProps) {
  const Icon = (skill.icon && ICON_MAP[skill.icon]) || Puzzle;

  return (
    <button
      type="button"
      onClick={() => onToggle(skill.id)}
      disabled={disabled && !selected}
      className={`relative flex flex-col items-start gap-2 p-3 rounded-lg border text-left transition-colors ${
        selected
          ? 'border-brand bg-brand/5 ring-1 ring-brand'
          : 'border-surface-3 hover:border-text-secondary'
      } ${disabled && !selected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      aria-pressed={selected}
    >
      <div className="flex items-center gap-2 w-full">
        <Icon className="h-4 w-4 text-brand shrink-0" />
        <span className="text-sm font-medium text-text-primary truncate">{skill.name}</span>
        {selected && <CheckCircle2Icon className="h-4 w-4 text-brand ml-auto shrink-0" />}
      </div>
      <p className="text-xs text-text-secondary line-clamp-2">{skill.description}</p>
      {skill.source_type === 'official' && (
        <span className="text-[10px] font-medium text-brand uppercase tracking-wider">
          Official
        </span>
      )}
    </button>
  );
}
