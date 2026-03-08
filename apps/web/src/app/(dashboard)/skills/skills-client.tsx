'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  SearchIcon,
  DownloadIcon,
  UploadIcon,
  TagIcon,
  WandSparklesIcon,
  StarIcon,
  UserIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import type { SkillRow, SkillCategory } from '@/lib/repositories/skill.types';
import { Button } from '@/components/ui/button';

const CATEGORIES: { value: SkillCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Skills' },
  { value: 'component', label: 'Components' },
  { value: 'form', label: 'Forms' },
  { value: 'dashboard', label: 'Dashboards' },
  { value: 'layout', label: 'Layout' },
  { value: 'design', label: 'Design' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'custom', label: 'Custom' },
];

function SkillMarketplaceCard({ skill }: { skill: SkillRow }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/skills/export/${skill.slug}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${skill.slug}.skill.md`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-surface-3 bg-surface-0 hover:border-brand/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <WandSparklesIcon className="h-5 w-5 text-brand shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{skill.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {skill.source_type === 'official' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-brand uppercase tracking-wider">
                  <ShieldCheckIcon className="h-3 w-3" />
                  Official
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-muted uppercase tracking-wider">
                  <UserIcon className="h-3 w-3" />
                  {skill.source_type}
                </span>
              )}
              {skill.version && (
                <span className="text-[10px] text-text-muted">v{skill.version}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <StarIcon className="h-3.5 w-3.5" />
          {skill.install_count}
        </div>
      </div>

      <p className="text-xs text-text-secondary line-clamp-2">{skill.description}</p>

      {skill.tags && skill.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skill.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded-full bg-surface-2 text-text-secondary"
            >
              <TagIcon className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {skill.argument_hint && (
        <div className="text-[10px] text-text-muted font-mono bg-surface-1 rounded px-2 py-1">
          /{skill.slug} {skill.argument_hint}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-surface-2">
        <div className="text-[10px] text-text-muted">
          {skill.author && `by ${skill.author}`}
          {skill.license && ` · ${skill.license}`}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleExport}
          disabled={exporting}
          className="h-7 text-xs gap-1"
        >
          <DownloadIcon className="h-3 w-3" />
          Export
        </Button>
      </div>
    </div>
  );
}

export function SkillsMarketplaceClient() {
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<SkillCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [importing, setImporting] = useState(false);
  const [importContent, setImportContent] = useState('');
  const [importSlug, setImportSlug] = useState('');
  const fetchIdRef = useRef(0);

  const fetchSkills = useCallback(async () => {
    const id = ++fetchIdRef.current;
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (search) params.set('search', search);
    if (tag) params.set('tag', tag);

    try {
      const res = await fetch(`/api/skills?${params}`);
      if (!res.ok) return;
      const json = await res.json();
      if (id === fetchIdRef.current) {
        setSkills(json.data ?? []);
      }
    } finally {
      if (id === fetchIdRef.current) setLoading(false);
    }
  }, [category, search, tag]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleImport = async () => {
    if (!importContent.trim() || !importSlug.trim()) return;
    setImporting(true);
    try {
      const res = await fetch('/api/skills/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: importContent,
          slug: importSlug,
        }),
      });
      if (res.ok) {
        setImportContent('');
        setImportSlug('');
        fetchSkills();
      }
    } finally {
      setImporting(false);
    }
  };

  const allTags = Array.from(new Set(skills.flatMap((s) => s.tags ?? []))).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Skills Marketplace</h1>
          <p className="text-sm text-text-secondary mt-1">
            Browse and manage AI generation skills. Compatible with the Anthropic Agent Skills
            standard.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search skills by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-lg focus:ring-brand focus:border-brand"
          />
        </div>
        {allTags.length > 0 && (
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-lg"
          >
            <option value="">All Tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setCategory(cat.value)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              category === cat.value
                ? 'border-brand bg-brand/10 text-brand-light'
                : 'border-surface-3 text-text-secondary hover:text-text-primary'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-surface-1 animate-pulse" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          <WandSparklesIcon className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No skills found</p>
          <p className="text-xs mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <SkillMarketplaceCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}

      <div className="border-t border-surface-3 pt-6">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
          <UploadIcon className="h-5 w-5" />
          Import Skill
        </h2>
        <div className="space-y-3 max-w-2xl">
          <input
            type="text"
            placeholder="Skill slug (e.g. my-custom-skill)"
            value={importSlug}
            onChange={(e) =>
              setImportSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
            }
            className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-lg focus:ring-brand focus:border-brand"
          />
          <textarea
            placeholder="Paste SKILL.md content here..."
            value={importContent}
            onChange={(e) => setImportContent(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-lg focus:ring-brand focus:border-brand font-mono"
          />
          <Button
            onClick={handleImport}
            disabled={importing || !importContent.trim() || !importSlug.trim()}
            className="gap-2"
          >
            <UploadIcon className="h-4 w-4" />
            {importing ? 'Importing...' : 'Import Skill'}
          </Button>
        </div>
      </div>
    </div>
  );
}
