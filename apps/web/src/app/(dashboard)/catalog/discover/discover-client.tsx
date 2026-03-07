'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  SearchIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  DownloadIcon,
  GitBranchIcon,
  BoxIcon,
  ServerIcon,
  CodeIcon,
  GlobeIcon,
  BookOpenIcon,
  Loader2Icon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@siza/ui';
import {
  useCatalogDiscovery,
  useImportDiscovered,
  type DiscoveredRepo,
} from '@/hooks/use-catalog';

const TYPE_ICONS: Record<string, typeof BoxIcon> = {
  component: BoxIcon,
  service: ServerIcon,
  api: CodeIcon,
  website: GlobeIcon,
  library: BookOpenIcon,
  system: GitBranchIcon,
  domain: GitBranchIcon,
};

function EntityBadge({ kind, type }: { kind: string; type: string }) {
  const Icon = TYPE_ICONS[type] || BoxIcon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 text-[11px] font-medium">
      <Icon className="w-3 h-3" />
      {kind}
    </span>
  );
}

export function DiscoverClient() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const discovery = useCatalogDiscovery();
  const importMutation = useImportDiscovered();

  const discovered = discovery.data?.data?.discovered ?? [];
  const scanned = discovery.data?.data?.scanned ?? 0;
  const errors = discovery.data?.data?.errors ?? [];

  function toggleRepo(fullName: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(fullName)) next.delete(fullName);
      else next.add(fullName);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === discovered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(discovered.map((r) => r.fullName)));
    }
  }

  async function handleImport() {
    const repos = discovered
      .filter((r) => selected.has(r.fullName))
      .map((r) => ({
        installationId: r.installationId,
        fullName: r.fullName,
      }));
    await importMutation.mutateAsync(repos);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/catalog">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              Auto-Discovery
            </h1>
            <p className="text-sm text-text-secondary">
              Scan your GitHub repos for catalog-info.yaml files
            </p>
          </div>
        </div>
        <Button
          onClick={() => discovery.refetch()}
          disabled={discovery.isFetching}
        >
          {discovery.isFetching ? (
            <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <SearchIcon className="h-4 w-4 mr-2" />
          )}
          {discovery.isFetching ? 'Scanning...' : 'Scan Repositories'}
        </Button>
      </div>

      {!discovery.data && !discovery.isFetching && (
        <div className="rounded-xl border border-surface-3 bg-surface-1 p-12 text-center">
          <SearchIcon className="h-10 w-10 text-text-secondary mx-auto mb-4" />
          <h2 className="text-lg font-medium text-text-primary mb-2">
            Discover catalog entities
          </h2>
          <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
            Scan your connected GitHub repositories for{' '}
            <code className="text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded text-xs">
              catalog-info.yaml
            </code>{' '}
            files and import them into your service catalog.
          </p>
          <Button onClick={() => discovery.refetch()}>
            <SearchIcon className="h-4 w-4 mr-2" />
            Start Scan
          </Button>
        </div>
      )}

      {discovery.isFetching && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {discovery.data && !discovery.isFetching && (
        <>
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>
              Found {discovered.length} repos with catalog files ({scanned}{' '}
              scanned)
            </span>
            <div className="flex items-center gap-3">
              {discovered.length > 0 && (
                <>
                  <button
                    onClick={selectAll}
                    className="text-violet-400 hover:text-violet-300"
                  >
                    {selected.size === discovered.length
                      ? 'Deselect all'
                      : 'Select all'}
                  </button>
                  <Button
                    size="sm"
                    onClick={handleImport}
                    disabled={
                      selected.size === 0 || importMutation.isPending
                    }
                  >
                    {importMutation.isPending ? (
                      <Loader2Icon className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    ) : (
                      <DownloadIcon className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Import {selected.size > 0 ? `(${selected.size})` : ''}
                  </Button>
                </>
              )}
            </div>
          </div>

          {importMutation.isSuccess && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-emerald-400">
                Imported{' '}
                {importMutation.data?.data?.imported?.length ?? 0}{' '}
                entities successfully
              </span>
            </div>
          )}

          {discovered.length === 0 && (
            <div className="rounded-xl border border-surface-3 bg-surface-1 p-8 text-center">
              <AlertCircleIcon className="h-8 w-8 text-text-secondary mx-auto mb-3" />
              <p className="text-sm text-text-secondary">
                No catalog-info.yaml files found in your repositories.
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Add a{' '}
                <code className="text-violet-400">catalog-info.yaml</code>{' '}
                to your repo root to get started.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {discovered.map((repo) => (
              <RepoCard
                key={repo.fullName}
                repo={repo}
                selected={selected.has(repo.fullName)}
                onToggle={() => toggleRepo(repo.fullName)}
              />
            ))}
          </div>

          {errors.length > 0 && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <p className="text-xs font-medium text-amber-400 mb-1">
                Scan errors
              </p>
              {errors.map((e, i) => (
                <p key={i} className="text-xs text-text-secondary">
                  {e.repo}: {e.error}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RepoCard({
  repo,
  selected,
  onToggle,
}: {
  repo: DiscoveredRepo;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left rounded-xl border p-4 transition-all ${
        selected
          ? 'border-violet-500/40 bg-violet-500/5'
          : 'border-surface-3 bg-surface-1 hover:border-surface-3/80'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                selected
                  ? 'border-violet-400 bg-violet-500'
                  : 'border-zinc-600'
              }`}
            >
              {selected && (
                <CheckCircleIcon className="w-3 h-3 text-white" />
              )}
            </div>
            <span className="text-sm font-medium text-text-primary truncate">
              {repo.fullName}
            </span>
            {repo.language && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-text-secondary">
                {repo.language}
              </span>
            )}
          </div>
          {repo.description && (
            <p className="text-xs text-text-secondary ml-6 mb-2 truncate">
              {repo.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 ml-6">
            {repo.entities.map((e) => (
              <EntityBadge key={e.name} kind={e.kind} type={e.type} />
            ))}
          </div>
        </div>
        <span className="text-xs text-text-secondary flex-shrink-0 ml-3">
          {repo.entityCount} entit{repo.entityCount === 1 ? 'y' : 'ies'}
        </span>
      </div>
    </button>
  );
}
