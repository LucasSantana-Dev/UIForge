'use client';

import type { ItemStatus } from './types';

interface StatusFilterProps {
  active: ItemStatus | 'all';
  onChange: (status: ItemStatus | 'all') => void;
  counts: Record<ItemStatus | 'all', number>;
}

const filters: { value: ItemStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'done', label: 'Done' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'planned', label: 'Planned' },
];

export function StatusFilter({ active, onChange, counts }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            active === f.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {f.label}
          <span className="ml-1.5 opacity-70">{counts[f.value]}</span>
        </button>
      ))}
    </div>
  );
}
