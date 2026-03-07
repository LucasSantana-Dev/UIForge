'use client';

import { useMemo, useState } from 'react';
import {
  SearchIcon,
  RocketIcon,
  CheckCircleIcon,
  TestTubeIcon,
  ShieldCheckIcon,
  ActivityIcon,
  ContainerIcon,
  SparklesIcon,
  CodeIcon,
  ServerIcon,
  BookOpenIcon,
  GlobeIcon,
  LayersIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@siza/ui';
import { useGoldenPaths, useScaffoldProject } from '@/hooks/use-golden-paths';
import type { GoldenPathFilters } from '@/hooks/use-golden-paths';
import type { GoldenPathRow } from '@/lib/repositories/golden-path.repo';

interface ParameterDef {
  name: string;
  type: string;
  required?: boolean;
  default?: unknown;
  description?: string;
  options?: string[];
}

const STACK_META: Record<string, { icon: typeof ServerIcon; label: string }> = {
  nextjs: { icon: GlobeIcon, label: 'Next.js' },
  'api-service': { icon: ServerIcon, label: 'API Service' },
  library: { icon: BookOpenIcon, label: 'Library' },
  worker: { icon: CodeIcon, label: 'Worker' },
  monorepo: { icon: LayersIcon, label: 'Monorepo' },
};

const LANGUAGE_COLORS: Record<string, string> = {
  typescript: 'bg-blue-500/15 text-blue-400',
  python: 'bg-yellow-500/15 text-yellow-400',
  go: 'bg-cyan-500/15 text-cyan-400',
};

const STACKS = ['nextjs', 'api-service', 'library', 'worker', 'monorepo'];
const LANGUAGES = ['typescript', 'python', 'go'];

interface IncludeBadgeProps {
  enabled: boolean;
  icon: typeof CheckCircleIcon;
  label: string;
}

function IncludeBadge({ enabled, icon: Icon, label }: IncludeBadgeProps) {
  if (!enabled) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function GoldenPathSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-surface-3 bg-surface-1 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16 mt-1" />
            </div>
          </div>
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-3/4 mb-4" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GoldenPathsClient() {
  const [filters, setFilters] = useState<GoldenPathFilters>({ limit: 20 });
  const [searchInput, setSearchInput] = useState('');
  const [scaffoldTarget, setScaffoldTarget] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [paramValues, setParamValues] = useState<Record<string, unknown>>({});
  const { data, isLoading } = useGoldenPaths(filters);
  const scaffold = useScaffoldProject();

  const paths = useMemo(() => data?.data || [], [data?.data]);
  const pagination = data?.pagination;

  const handleSearch = () => {
    setFilters((prev: GoldenPathFilters) => ({
      ...prev,
      search: searchInput || undefined,
      page: 1,
    }));
  };

  const handleScaffold = () => {
    if (!scaffoldTarget || !projectName.trim()) return;
    scaffold.mutate(
      {
        goldenPathId: scaffoldTarget,
        projectName: projectName.trim(),
        parameters: Object.keys(paramValues).length > 0 ? paramValues : undefined,
      },
      {
        onSuccess: () => {
          setScaffoldTarget(null);
          setProjectName('');
          setParamValues({});
        },
      }
    );
  };

  const openScaffoldForm = (pathId: string) => {
    setScaffoldTarget(pathId);
    setProjectName('');
    setParamValues({});
    const path = paths.find((p: GoldenPathRow) => p.id === pathId);
    if (path?.parameters?.length) {
      const defaults: Record<string, unknown> = {};
      for (const param of path.parameters as ParameterDef[]) {
        if (param.default !== undefined) defaults[param.name] = param.default;
      }
      setParamValues(defaults);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-text-primary">
            Golden Paths
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Production-ready project scaffolds with built-in governance
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search golden paths..."
            className="pl-10 bg-surface-1 border-surface-3"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filters.stack || ''}
            onChange={(e) =>
              setFilters((prev: GoldenPathFilters) => ({
                ...prev,
                stack: e.target.value || undefined,
                page: 1,
              }))
            }
            className="h-10 rounded-md border border-surface-3 bg-surface-1 px-3 text-sm text-text-primary"
          >
            <option value="">All stacks</option>
            {STACKS.map((s) => (
              <option key={s} value={s}>
                {STACK_META[s]?.label || s}
              </option>
            ))}
          </select>
          <select
            value={filters.language || ''}
            onChange={(e) =>
              setFilters((prev: GoldenPathFilters) => ({
                ...prev,
                language: e.target.value || undefined,
                page: 1,
              }))
            }
            className="h-10 rounded-md border border-surface-3 bg-surface-1 px-3 text-sm text-text-primary"
          >
            <option value="">All languages</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <GoldenPathSkeleton />
      ) : paths.length === 0 ? (
        <div className="rounded-xl border border-surface-3 bg-surface-1 p-12 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
            <RocketIcon className="w-7 h-7 text-violet-400" />
          </div>
          <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
            No Golden Paths Yet
          </h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Golden paths are opinionated project scaffolds with CI/CD, testing, and governance built
            in.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paths.map((path: GoldenPathRow) => {
            const stackMeta = STACK_META[path.stack] || STACK_META.nextjs;
            const StackIcon = stackMeta.icon;
            const langColor = LANGUAGE_COLORS[path.language] || 'bg-surface-2 text-text-muted';

            return (
              <div
                key={path.id}
                className="group relative rounded-xl border border-surface-3 bg-surface-1 p-6 transition-all duration-200 hover:border-violet-500/30 hover:shadow-[0_0_24px_rgba(124,58,237,0.08)] flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <StackIcon className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-violet-300 transition-colors">
                        {path.display_name}
                      </h3>
                      <span className="text-[11px] font-mono text-text-muted">{path.name}</span>
                    </div>
                  </div>
                  {path.is_official && (
                    <SparklesIcon className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  )}
                </div>

                {path.description && (
                  <p className="text-xs text-text-secondary mb-3 line-clamp-2">
                    {path.description}
                  </p>
                )}

                <div className="flex items-center gap-1.5 mb-3">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${langColor}`}
                  >
                    {path.language}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-surface-2 px-2 py-0.5 text-[10px] text-text-muted">
                    {stackMeta.label}
                  </span>
                  {path.usage_count > 0 && (
                    <span className="text-[10px] text-text-muted ml-auto">
                      {path.usage_count} uses
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  <IncludeBadge enabled={path.includes_ci} icon={CheckCircleIcon} label="CI/CD" />
                  <IncludeBadge enabled={path.includes_testing} icon={TestTubeIcon} label="Tests" />
                  <IncludeBadge
                    enabled={path.includes_linting}
                    icon={ShieldCheckIcon}
                    label="Lint"
                  />
                  <IncludeBadge
                    enabled={path.includes_monitoring}
                    icon={ActivityIcon}
                    label="Monitor"
                  />
                  <IncludeBadge
                    enabled={path.includes_docker}
                    icon={ContainerIcon}
                    label="Docker"
                  />
                </div>

                <div className="mt-auto">
                  {scaffoldTarget === path.id ? (
                    <ScaffoldForm
                      parameters={(path.parameters || []) as ParameterDef[]}
                      projectName={projectName}
                      paramValues={paramValues}
                      isPending={scaffold.isPending}
                      onProjectNameChange={setProjectName}
                      onParamChange={(name, value) =>
                        setParamValues((prev) => ({ ...prev, [name]: value }))
                      }
                      onSubmit={handleScaffold}
                      onCancel={() => setScaffoldTarget(null)}
                    />
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => openScaffoldForm(path.id)}
                      className="w-full bg-violet-600 hover:bg-violet-500 text-white text-xs h-8"
                    >
                      <RocketIcon className="w-3.5 h-3.5 mr-1.5" />
                      Scaffold Project
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-text-muted">{pagination.total} golden paths</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() =>
                setFilters((prev: GoldenPathFilters) => ({
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
                setFilters((prev: GoldenPathFilters) => ({
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

      {scaffold.isError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {scaffold.error?.message || 'Failed to scaffold project'}
        </div>
      )}

      {scaffold.isSuccess && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
          Project scaffolded successfully! Check your projects list.
        </div>
      )}
    </div>
  );
}

interface ScaffoldFormProps {
  parameters: ParameterDef[];
  projectName: string;
  paramValues: Record<string, unknown>;
  isPending: boolean;
  onProjectNameChange: (name: string) => void;
  onParamChange: (name: string, value: unknown) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function ScaffoldForm({
  parameters,
  projectName,
  paramValues,
  isPending,
  onProjectNameChange,
  onParamChange,
  onSubmit,
  onCancel,
}: ScaffoldFormProps) {
  return (
    <div className="space-y-2">
      <Input
        value={projectName}
        onChange={(e) => onProjectNameChange(e.target.value)}
        placeholder="Project name *"
        className="text-xs h-8 bg-surface-2 border-surface-3"
        onKeyDown={(e) =>
          e.key === 'Enter' && parameters.length === 0 && onSubmit()
        }
      />
      {parameters.map((param) => (
        <ParameterInput
          key={param.name}
          param={param}
          value={paramValues[param.name]}
          onChange={(v) => onParamChange(param.name, v)}
        />
      ))}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={!projectName.trim() || isPending}
          className="flex-1 bg-violet-600 hover:bg-violet-500 text-xs h-7"
        >
          {isPending ? 'Creating...' : 'Create'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="text-xs h-7"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

function ParameterInput({
  param,
  value,
  onChange,
}: {
  param: ParameterDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const label = param.description || param.name;
  const required = param.required ? ' *' : '';

  if (param.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-surface-3 bg-surface-2 text-violet-500 focus:ring-violet-500"
        />
        {label}
      </label>
    );
  }

  if (param.type === 'select' && param.options) {
    return (
      <select
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 rounded-md border border-surface-3 bg-surface-2 px-2 text-xs text-text-primary"
        title={label}
      >
        <option value="">
          {label}
          {required}
        </option>
        {param.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (param.type === 'number') {
    return (
      <Input
        type="number"
        value={value !== undefined ? String(value) : ''}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : undefined)
        }
        placeholder={`${label}${required}`}
        className="text-xs h-8 bg-surface-2 border-surface-3"
      />
    );
  }

  return (
    <Input
      type="text"
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value || undefined)}
      placeholder={`${label}${required}`}
      className="text-xs h-8 bg-surface-2 border-surface-3"
    />
  );
}
