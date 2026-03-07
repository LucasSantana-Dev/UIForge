'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  SearchIcon,
  PlusIcon,
  ServerIcon,
  BoxIcon,
  CodeIcon,
  BookOpenIcon,
  GlobeIcon,
  ShieldCheckIcon,
  GitBranchIcon,
  ExternalLinkIcon,
  XIcon,
  LayoutGridIcon,
  ListIcon,
  ArrowUpRightIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@siza/ui';
import { useCatalog, type CatalogFilters } from '@/hooks/use-catalog';
import type { CatalogEntryRow } from '@/lib/repositories/catalog.repo';

const TYPE_META: Record<string, { icon: typeof ServerIcon; label: string }> = {
  service: { icon: ServerIcon, label: 'Service' },
  component: { icon: BoxIcon, label: 'Component' },
  api: { icon: CodeIcon, label: 'API' },
  library: { icon: BookOpenIcon, label: 'Library' },
  website: { icon: GlobeIcon, label: 'Website' },
};

const LIFECYCLE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  production: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  experimental: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  deprecated: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
};

function LifecycleBadge({ lifecycle }: { lifecycle: string }) {
  const style = LIFECYCLE_STYLES[lifecycle] || LIFECYCLE_STYLES.experimental;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {lifecycle}
    </span>
  );
}

function TypeIcon({ type }: { type: string }) {
  const meta = TYPE_META[type] || TYPE_META.service;
  const Icon = meta.icon;
  return (
    <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-violet-400" />
    </div>
  );
}

function CatalogCard({ entry }: { entry: CatalogEntryRow }) {
  const meta = TYPE_META[entry.type] || TYPE_META.service;

  return (
    <Link
      href={`/catalog/${entry.id}`}
      className="group relative rounded-xl border border-surface-3 bg-surface-1 p-5 transition-all duration-200 hover:border-violet-500/30 hover:shadow-[0_0_24px_rgba(124,58,237,0.08)] overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <TypeIcon type={entry.type} />
            <div>
              <h3 className="text-sm font-semibold text-text-primary group-hover:text-violet-300 transition-colors">
                {entry.display_name}
              </h3>
              <p className="text-[11px] font-mono text-text-muted">{entry.name}</p>
            </div>
          </div>
          <ArrowUpRightIcon className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <LifecycleBadge lifecycle={entry.lifecycle} />
          <span className="text-[11px] text-text-muted capitalize">{meta.label}</span>
          {entry.team && <span className="text-[11px] text-text-muted">&middot; {entry.team}</span>}
        </div>

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {entry.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] text-text-muted font-mono"
              >
                {tag}
              </span>
            ))}
            {entry.tags.length > 4 && (
              <span className="text-[10px] text-text-muted">+{entry.tags.length - 4}</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 text-[11px] text-text-muted">
          {entry.repository_url && (
            <span className="flex items-center gap-1">
              <GitBranchIcon className="w-3 h-3" />
              Linked
            </span>
          )}
          {entry.dependencies.length > 0 && <span>{entry.dependencies.length} deps</span>}
        </div>
      </div>
    </Link>
  );
}

function CatalogListItem({ entry }: { entry: CatalogEntryRow }) {
  const meta = TYPE_META[entry.type] || TYPE_META.service;

  return (
    <Link
      href={`/catalog/${entry.id}`}
      className="group flex items-center gap-4 rounded-lg border border-surface-3 bg-surface-1 p-4 transition-all duration-200 hover:border-violet-500/30 hover:bg-surface-1/80"
    >
      <TypeIcon type={entry.type} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-text-primary truncate group-hover:text-violet-300 transition-colors">
            {entry.display_name}
          </p>
          <LifecycleBadge lifecycle={entry.lifecycle} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] font-mono text-text-muted">{entry.name}</span>
          <span className="text-[11px] text-text-muted capitalize">&middot; {meta.label}</span>
          {entry.team && <span className="text-[11px] text-text-muted">&middot; {entry.team}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {entry.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] text-text-muted font-mono hidden sm:inline"
          >
            {tag}
          </span>
        ))}
        {entry.repository_url && <ExternalLinkIcon className="w-3.5 h-3.5 text-text-muted" />}
      </div>
    </Link>
  );
}

function CatalogSkeleton({ view }: { view: 'grid' | 'list' }) {
  if (view === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-surface-3 bg-surface-1 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
            </div>
            <Skeleton className="h-5 w-20 mb-3" />
            <div className="flex gap-1.5">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-surface-3 bg-surface-1 p-4"
        >
          <Skeleton className="w-9 h-9 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20 mt-1" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 p-12 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
        <ShieldCheckIcon className="w-7 h-7 text-violet-400" />
      </div>
      <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
        Your Service Catalog
      </h3>
      <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
        Register your services, APIs, and libraries to track health, dependencies, and compliance in
        one place.
      </p>
      <Button className="bg-violet-600 hover:bg-violet-500">
        <PlusIcon className="mr-2 h-4 w-4" />
        Register First Service
      </Button>
    </div>
  );
}

const TYPES = ['service', 'component', 'api', 'library', 'website'];
const LIFECYCLES = ['production', 'experimental', 'deprecated'];

export function CatalogClient() {
  const [filters, setFilters] = useState<CatalogFilters>({ limit: 20 });
  const [searchInput, setSearchInput] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const { data, isLoading } = useCatalog(filters);

  const entries = useMemo(() => data?.entries || [], [data?.entries]);
  const pagination = data?.pagination;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.type) count++;
    if (filters.lifecycle) count++;
    if (filters.tags) count++;
    return count;
  }, [filters]);

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchInput || undefined,
      page: 1,
    }));
  };

  const stats = useMemo(() => {
    const production = entries.filter((e) => e.lifecycle === 'production').length;
    const experimental = entries.filter((e) => e.lifecycle === 'experimental').length;
    const deprecated = entries.filter((e) => e.lifecycle === 'deprecated').length;
    return { total: pagination?.total ?? 0, production, experimental, deprecated };
  }, [entries, pagination]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-text-primary">
            Service Catalog
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Discover and manage your software components
            {stats.total > 0 && (
              <span className="ml-2 inline-flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  {stats.production} production
                </span>
                {stats.experimental > 0 && (
                  <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                    {stats.experimental} experimental
                  </span>
                )}
              </span>
            )}
          </p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-500 shadow-[0_0_20px_rgba(124,58,237,0.15)] hover:shadow-[0_0_28px_rgba(124,58,237,0.25)] transition-all">
          <PlusIcon className="mr-2 h-4 w-4" />
          Register
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search services, APIs, libraries..."
            className="pl-10 bg-surface-1 border-surface-3"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.type || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                type: e.target.value || undefined,
                page: 1,
              }))
            }
            className="h-10 rounded-md border border-surface-3 bg-surface-1 px-3 text-sm text-text-primary"
          >
            <option value="">All types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filters.lifecycle || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                lifecycle: e.target.value || undefined,
                page: 1,
              }))
            }
            className="h-10 rounded-md border border-surface-3 bg-surface-1 px-3 text-sm text-text-primary"
          >
            <option value="">All states</option>
            {LIFECYCLES.map((l) => (
              <option key={l} value={l}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </option>
            ))}
          </select>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ limit: 20 })}
              className="text-text-muted hover:text-text-primary"
            >
              <XIcon className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}

          <div className="flex items-center border border-surface-3 rounded-md">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`p-2 rounded-l-md transition-colors ${view === 'grid' ? 'bg-violet-500/15 text-violet-400' : 'text-text-muted hover:text-text-primary'}`}
            >
              <LayoutGridIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`p-2 rounded-r-md transition-colors ${view === 'list' ? 'bg-violet-500/15 text-violet-400' : 'text-text-muted hover:text-text-primary'}`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <CatalogSkeleton view={view} />
      ) : entries.length === 0 ? (
        <EmptyState />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <CatalogCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <CatalogListItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-text-muted">
            Showing {entries.length} of {pagination.total} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: (prev.page || 1) - 1,
                }))
              }
              className="text-xs border-surface-3"
            >
              Previous
            </Button>
            <span className="text-xs text-text-muted">
              {pagination.page} / {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: (prev.page || 1) + 1,
                }))
              }
              className="text-xs border-surface-3"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
