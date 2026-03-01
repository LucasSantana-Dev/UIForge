'use client';

import { useState, useEffect, useRef } from 'react';
import { WandSparklesIcon, SearchIcon } from 'lucide-react';
import { listSkills } from '@/lib/services/skill.service';
import type { SkillRow, SkillCategory } from '@/lib/repositories/skill.repo';
import { SkillCard } from './SkillCard';
import { SkillParameterForm } from './SkillParameterForm';

const CATEGORIES: { value: SkillCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'component', label: 'Components' },
  { value: 'form', label: 'Forms' },
  { value: 'dashboard', label: 'Dashboards' },
  { value: 'design', label: 'Design' },
  { value: 'accessibility', label: 'A11y' },
];

const MAX_SELECTED = 3;

interface SkillSelectorProps {
  selectedSkillIds: string[];
  onSelectedChange: (ids: string[]) => void;
  skillParams: Record<string, Record<string, unknown>>;
  onParamsChange: (params: Record<string, Record<string, unknown>>) => void;
}

export function SkillSelector({
  selectedSkillIds,
  onSelectedChange,
  skillParams,
  onParamsChange,
}: SkillSelectorProps) {
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [category, setCategory] = useState<SkillCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const filterKey = JSON.stringify({ category, search });
  const loading = loadedKey !== filterKey;
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const id = ++fetchIdRef.current;
    const key = JSON.stringify({ category, search });
    listSkills({
      ...(category !== 'all' && { category }),
      ...(search && { search }),
    })
      .then((data) => {
        if (id === fetchIdRef.current) {
          setSkills(data);
          setLoadedKey(key);
        }
      })
      .catch(() => {
        if (id === fetchIdRef.current) {
          setSkills([]);
          setLoadedKey(key);
        }
      });
  }, [category, search]);

  const handleToggle = (skillId: string) => {
    if (selectedSkillIds.includes(skillId)) {
      onSelectedChange(selectedSkillIds.filter((id) => id !== skillId));
      const next = { ...skillParams };
      delete next[skillId];
      onParamsChange(next);
    } else if (selectedSkillIds.length < MAX_SELECTED) {
      onSelectedChange([...selectedSkillIds, skillId]);
    }
  };

  const handleParamChange = (skillId: string, values: Record<string, unknown>) => {
    onParamsChange({ ...skillParams, [skillId]: values });
  };

  const atLimit = selectedSkillIds.length >= MAX_SELECTED;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
        <WandSparklesIcon className="h-4 w-4" />
        Skills
        {selectedSkillIds.length > 0 && (
          <span className="text-xs text-brand">
            ({selectedSkillIds.length}/{MAX_SELECTED})
          </span>
        )}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setCategory(cat.value)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              category === cat.value
                ? 'border-brand bg-brand/10 text-brand-light'
                : 'border-surface-3 text-text-secondary hover:text-text-primary'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-2 h-3.5 w-3.5 text-text-secondary" />
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-1 text-text-primary border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-surface-1 animate-pulse" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <p className="text-xs text-text-secondary py-4 text-center">No skills found</p>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {skills.map((skill) => (
            <div key={skill.id}>
              <SkillCard
                skill={skill}
                selected={selectedSkillIds.includes(skill.id)}
                onToggle={handleToggle}
                disabled={atLimit}
              />
              {selectedSkillIds.includes(skill.id) && skill.parameter_schema && (
                <div className="mt-2">
                  <SkillParameterForm
                    schema={skill.parameter_schema as any}
                    values={skillParams[skill.id] ?? {}}
                    onChange={(v) => handleParamChange(skill.id, v)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
