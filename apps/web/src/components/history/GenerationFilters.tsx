'use client';

import { Filter } from 'lucide-react';

export interface HistoryFilters {
  framework: string;
  provider: string;
  status: string;
}

interface GenerationFiltersProps {
  filters: HistoryFilters;
  onChange: (filters: HistoryFilters) => void;
}

const FRAMEWORKS = [
  { value: '', label: 'All Frameworks' },
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
];

const PROVIDERS = [
  { value: '', label: 'All Providers' },
  { value: 'google', label: 'Google Gemini' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
];

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'processing', label: 'Processing' },
];

export function GenerationFilters({ filters, onChange }: GenerationFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Filter className="w-4 h-4 text-text-muted" />
      <select
        value={filters.framework}
        onChange={(e) => onChange({ ...filters, framework: e.target.value })}
        className="px-3 py-1.5 border border-surface-3 rounded-md text-sm bg-surface-1 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
      >
        {FRAMEWORKS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
      <select
        value={filters.provider}
        onChange={(e) => onChange({ ...filters, provider: e.target.value })}
        className="px-3 py-1.5 border border-surface-3 rounded-md text-sm bg-surface-1 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
      >
        {PROVIDERS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="px-3 py-1.5 border border-surface-3 rounded-md text-sm bg-surface-1 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {(filters.framework || filters.provider || filters.status) && (
        <button
          onClick={() => onChange({ framework: '', provider: '', status: '' })}
          className="text-xs text-brand hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
