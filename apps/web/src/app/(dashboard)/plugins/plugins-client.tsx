'use client';

import { useState } from 'react';
import { Puzzle, Search } from 'lucide-react';
import { usePlugins, useInstallPlugin, useUninstallPlugin } from '@/hooks/use-plugins';
import { PluginCard } from '@/components/plugins/PluginCard';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'governance', label: 'Governance' },
  { value: 'quality', label: 'Quality' },
  { value: 'security', label: 'Security' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'integration', label: 'Integration' },
  { value: 'documentation', label: 'Documentation' },
];

export function PluginsClient() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { data, isLoading, isError, error, refetch } = usePlugins({ search, category });
  const installMutation = useInstallPlugin();
  const uninstallMutation = useUninstallPlugin();

  const plugins = data?.data ?? [];
  const installedCount = plugins.filter((p) => p.installation).length;

  function handleInstall(slug: string) {
    installMutation.mutate(
      { slug },
      {
        onSuccess: () => toast.success('Plugin installed'),
        onError: () => toast.error('Failed to install plugin'),
      }
    );
  }

  function handleUninstall(slug: string) {
    uninstallMutation.mutate(slug, {
      onSuccess: () => toast.success('Plugin uninstalled'),
      onError: () => toast.error('Failed to uninstall plugin'),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
            <Puzzle className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Governance Plugins</h1>
            <p className="text-sm text-text-secondary">
              The technical conscience that AI-generated code lacks.
              {installedCount > 0 && (
                <span className="ml-1 text-brand">{installedCount} active</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search plugins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-border/50 bg-surface pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 focus:outline-none focus:ring-1 focus:ring-brand/30"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                category === cat.value
                  ? 'bg-brand/20 text-brand'
                  : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-xl border border-border/30 bg-surface"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Puzzle className="mb-3 h-10 w-10 text-text-tertiary" />
          <p className="mb-3 text-sm text-text-secondary">
            {error instanceof Error ? error.message : 'Failed to load plugins.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-md border border-border/50 px-3 py-1.5 text-xs text-text-primary hover:bg-surface-secondary"
          >
            Retry
          </button>
        </div>
      ) : plugins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Puzzle className="mb-3 h-10 w-10 text-text-tertiary" />
          <p className="text-sm text-text-secondary">No plugins found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plugins.map((plugin) => (
            <PluginCard
              key={plugin.slug}
              plugin={plugin}
              onInstall={handleInstall}
              onUninstall={handleUninstall}
              installing={installMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
