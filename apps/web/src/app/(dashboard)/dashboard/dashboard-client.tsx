'use client';

import { useProjects } from '@/hooks/use-projects';
import { useSubscription } from '@/hooks/use-subscription';
import { useCatalog } from '@/hooks/use-catalog';
import { useGoldenPaths } from '@/hooks/use-golden-paths';
import { isFeatureEnabled } from '@/lib/features/flags';
import { Skeleton } from '@siza/ui';
import {
  FolderIcon,
  SparklesIcon,
  ClockIcon,
  ZapIcon,
  PlusIcon,
  ArrowRightIcon,
  TrendingUpIcon,
  LayoutTemplateIcon,
  KeyIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  RocketIcon,
  CheckCircleIcon,
  ServerIcon,
  GlobeIcon,
  CodeIcon,
  LayersIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
import type { GoldenPathRow } from '@/lib/repositories/golden-path.repo';

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  href: string;
  accent: string;
  accentBg: string;
}

function StatCard({ label, value, subtitle, icon: Icon, href, accent, accentBg }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group relative rounded-xl border border-surface-3 bg-surface-1 p-5 transition-all duration-200 hover:border-violet-500/30 hover:shadow-[0_0_24px_rgba(124,58,237,0.08)] overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex items-center justify-between">
        <div className={`rounded-lg p-2.5 ${accentBg} transition-colors`}>
          <Icon className={`h-5 w-5 ${accent}`} />
        </div>
        <ArrowRightIcon className="h-4 w-4 text-text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
      </div>
      <p className="relative mt-4 text-2xl font-semibold font-display text-text-primary">{value}</p>
      <p className="relative mt-1 text-sm text-text-secondary">{label}</p>
      {subtitle && <p className="relative mt-0.5 text-xs text-text-muted">{subtitle}</p>}
    </Link>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <Skeleton className="mt-4 h-7 w-16" />
      <Skeleton className="mt-2 h-4 w-24" />
    </div>
  );
}

function RecentProjectCard({
  name,
  description,
  updatedAt,
  id,
  framework,
}: {
  name: string;
  description: string | null;
  updatedAt: string;
  id: string;
  framework?: string;
}) {
  const [mountTime] = useState(() => Date.now());
  const timeAgo = useMemo(() => {
    const diff = mountTime - new Date(updatedAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }, [updatedAt, mountTime]);

  return (
    <Link
      href={`/projects/${id}`}
      className="group flex items-center gap-4 rounded-lg border border-surface-3 bg-surface-1 p-4 transition-all duration-200 hover:border-violet-500/30 hover:bg-surface-1/80"
    >
      <div className="flex-shrink-0 rounded-lg bg-violet-500/10 p-2.5">
        <FolderIcon className="h-5 w-5 text-violet-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary group-hover:text-violet-300 transition-colors">
          {name}
        </p>
        {description && (
          <p className="mt-0.5 truncate text-xs text-text-secondary">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        {framework && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-text-muted font-mono">
            {framework}
          </span>
        )}
        <span className="text-xs text-text-muted">{timeAgo}</span>
      </div>
    </Link>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  description,
  accent,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  accent?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-surface-3 bg-surface-1 p-4 transition-all duration-200 hover:border-violet-500/30 hover:shadow-[0_0_16px_rgba(124,58,237,0.06)]"
    >
      <div className="rounded-lg bg-violet-500/10 p-2 group-hover:bg-violet-500/20 transition-colors">
        <Icon className={`h-4 w-4 ${accent || 'text-violet-400'}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
    </Link>
  );
}

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const percentage = limit === -1 ? 0 : Math.min((used / limit) * 100, 100);
  const isUnlimited = limit === -1;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-text-secondary">{label}</span>
        <span className="text-xs font-mono text-text-muted">
          {used}
          {isUnlimited ? '' : ` / ${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-amber-500' : 'bg-violet-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

const STACK_META: Record<string, { icon: typeof ServerIcon; label: string }> = {
  nextjs: { icon: GlobeIcon, label: 'Next.js' },
  'api-service': { icon: ServerIcon, label: 'API Service' },
  library: { icon: BookOpenIcon, label: 'Library' },
  worker: { icon: CodeIcon, label: 'Worker' },
  monorepo: { icon: LayersIcon, label: 'Monorepo' },
};

function GoldenPathCard({ path }: { path: GoldenPathRow }) {
  const stackMeta = STACK_META[path.stack] || STACK_META.nextjs;
  const StackIcon = stackMeta.icon;

  return (
    <Link
      href="/golden-paths"
      className="group flex items-center gap-4 rounded-lg border border-surface-3 bg-surface-1 p-4 transition-all duration-200 hover:border-violet-500/30 hover:bg-surface-1/80"
    >
      <div className="flex-shrink-0 rounded-lg bg-violet-500/10 p-2.5">
        <StackIcon className="h-5 w-5 text-violet-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary group-hover:text-violet-300 transition-colors">
          {path.display_name}
        </p>
        <p className="mt-0.5 truncate text-xs text-text-secondary">
          {stackMeta.label} &middot; {path.language}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        {path.includes_ci && <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />}
        {path.is_official && <SparklesIcon className="w-3.5 h-3.5 text-violet-400" />}
      </div>
    </Link>
  );
}

function GovernanceOverview() {
  const catalogEnabled = isFeatureEnabled('ENABLE_SOFTWARE_CATALOG');
  const goldenPathsEnabled = isFeatureEnabled('ENABLE_GOLDEN_PATHS');
  const { data: catalogData, isLoading: catalogLoading } = useCatalog({
    limit: 100,
  });
  const { data: goldenPathData, isLoading: goldenPathLoading } = useGoldenPaths({ limit: 100 });

  if (!catalogEnabled && !goldenPathsEnabled) return null;

  const isLoading = catalogLoading || goldenPathLoading;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </div>
    );
  }

  const entries = catalogData?.entries || [];
  const production = entries.filter((e) => e.lifecycle === 'production').length;
  const totalCatalog = catalogData?.pagination?.total ?? 0;
  const paths = goldenPathData?.data || [];
  const totalPaths = goldenPathData?.pagination?.total ?? paths.length;

  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
          <ShieldCheckIcon className="h-4 w-4 text-violet-400" />
        </div>
        <h2 className="text-sm font-semibold text-text-primary">Platform Governance</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {catalogEnabled && (
          <>
            <Link href="/catalog" className="group">
              <p className="text-2xl font-semibold font-display text-text-primary group-hover:text-violet-300 transition-colors">
                {totalCatalog}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">Catalog entries</p>
            </Link>
            <Link href="/catalog" className="group">
              <p className="text-2xl font-semibold font-display text-emerald-400 group-hover:text-emerald-300 transition-colors">
                {production}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">Production</p>
            </Link>
          </>
        )}
        {goldenPathsEnabled && (
          <>
            <Link href="/golden-paths" className="group">
              <p className="text-2xl font-semibold font-display text-text-primary group-hover:text-violet-300 transition-colors">
                {totalPaths}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">Golden paths</p>
            </Link>
            <Link href="/golden-paths" className="group">
              <p className="text-2xl font-semibold font-display text-amber-400 group-hover:text-amber-300 transition-colors">
                {paths.filter((p: GoldenPathRow) => p.is_official).length}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">Official</p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export function DashboardClient() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { usage, subscription, generationsTotal, isLoading: usageLoading } = useSubscription();
  const goldenPathsEnabled = isFeatureEnabled('ENABLE_GOLDEN_PATHS');
  const { data: goldenPathData } = useGoldenPaths(goldenPathsEnabled ? { limit: 3 } : { limit: 0 });
  const [mountTime] = useState(() => Date.now());

  const isLoading = projectsLoading || usageLoading;

  const stats = useMemo(() => {
    if (!projects) return null;
    const total = projects.length;
    const thisWeek = projects.filter((p) => {
      const created = new Date(p.created_at);
      const weekAgo = new Date(mountTime - 7 * 24 * 60 * 60 * 1000);
      return created > weekAgo;
    }).length;
    return { total, thisWeek };
  }, [projects, mountTime]);

  const recentProjects = useMemo(() => {
    if (!projects) return [];
    return projects.slice(0, 5);
  }, [projects]);

  const topPaths = useMemo(() => {
    return goldenPathData?.data || [];
  }, [goldenPathData?.data]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-5 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const generationsUsed = usage?.generations_count ?? 0;
  const generationsLimit = usage?.generations_limit ?? 50;
  const projectsUsed = usage?.projects_count ?? 0;
  const projectsLimit = usage?.projects_limit ?? 2;
  const planLabel =
    subscription?.plan === 'pro' ? 'Pro' : subscription?.plan === 'enterprise' ? 'Team' : 'Free';

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-text-primary">
            Developer Portal
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Build, ship, and govern your software
            <span className="ml-2 inline-flex items-center rounded-md bg-violet-500/15 px-2 py-0.5 text-xs font-medium text-violet-300">
              {planLabel}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {goldenPathsEnabled && (
            <Button
              asChild
              variant="outline"
              className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
            >
              <Link href="/golden-paths">
                <RocketIcon className="mr-2 h-4 w-4" />
                Scaffold
              </Link>
            </Button>
          )}
          <Button
            asChild
            className="bg-violet-600 hover:bg-violet-500 shadow-[0_0_20px_rgba(124,58,237,0.15)] hover:shadow-[0_0_28px_rgba(124,58,237,0.25)] transition-all"
          >
            <Link href="/generate">
              <SparklesIcon className="mr-2 h-4 w-4" />
              Generate
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Projects"
          value={String(stats?.total ?? 0)}
          subtitle={`${stats?.thisWeek ?? 0} this week`}
          icon={FolderIcon}
          href="/projects"
          accent="text-violet-400"
          accentBg="bg-violet-500/10"
        />
        <StatCard
          label="Generations"
          value={String(generationsTotal)}
          subtitle={`${generationsUsed} this month`}
          icon={ZapIcon}
          href="/history"
          accent="text-emerald-400"
          accentBg="bg-emerald-500/10"
        />
        <StatCard
          label="Templates"
          value="Browse"
          subtitle="Pre-built components"
          icon={LayoutTemplateIcon}
          href="/templates"
          accent="text-amber-400"
          accentBg="bg-amber-500/10"
        />
        <StatCard
          label="AI Keys"
          value="Manage"
          subtitle="BYOK providers"
          icon={KeyIcon}
          href="/ai-keys"
          accent="text-sky-400"
          accentBg="bg-sky-500/10"
        />
      </div>

      {/* Platform Governance Overview */}
      <GovernanceOverview />

      {/* Usage Bars */}
      <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-4">Usage This Month</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <UsageBar used={generationsUsed} limit={generationsLimit} label="Generations" />
          <UsageBar used={projectsUsed} limit={projectsLimit} label="Projects" />
        </div>
        {subscription?.plan === 'free' && (
          <div className="mt-4 pt-4 border-t border-surface-3 flex items-center justify-between">
            <p className="text-xs text-text-secondary">
              Upgrade for unlimited generations and projects
            </p>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="text-xs border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
            >
              <Link href="/billing">Upgrade to Pro</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-display text-text-primary">
              Recent Projects
            </h2>
            <Link
              href="/projects"
              className="text-sm text-violet-300 hover:text-violet-200 transition-colors"
            >
              View all
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="rounded-xl border border-surface-3 bg-surface-1 p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-violet-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-text-primary">
                Ready to build something?
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Describe what you need and Siza generates production-ready code.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <Button asChild className="bg-violet-600 hover:bg-violet-500" size="sm">
                  <Link href="/generate">
                    <SparklesIcon className="mr-2 h-4 w-4" />
                    Generate Component
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-surface-3 text-text-secondary hover:text-text-primary"
                >
                  <Link href="/projects/new">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    New Project
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {recentProjects.map((project) => (
                <RecentProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  description={project.description}
                  updatedAt={project.updated_at}
                  framework={(project as any).framework}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions + Golden Paths */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold font-display text-text-primary mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <QuickAction
                href="/generate"
                icon={SparklesIcon}
                label="Generate Component"
                description="AI-powered code generation"
                accent="text-violet-400"
              />
              <QuickAction
                href="/projects/new"
                icon={PlusIcon}
                label="New Project"
                description="Start a new workspace"
                accent="text-emerald-400"
              />
              <QuickAction
                href="/catalog"
                icon={BookOpenIcon}
                label="Service Catalog"
                description="Track health and compliance"
                accent="text-violet-400"
              />
              {goldenPathsEnabled && (
                <QuickAction
                  href="/golden-paths"
                  icon={RocketIcon}
                  label="Golden Paths"
                  description="Scaffold with governance"
                  accent="text-amber-400"
                />
              )}
              <QuickAction
                href="/history"
                icon={ClockIcon}
                label="View History"
                description="Past generations"
                accent="text-sky-400"
              />
              {subscription?.plan === 'free' && (
                <QuickAction
                  href="/billing"
                  icon={TrendingUpIcon}
                  label="Upgrade Plan"
                  description="Unlock unlimited generations"
                  accent="text-pink-400"
                />
              )}
            </div>
          </div>

          {/* Golden Paths Widget */}
          {goldenPathsEnabled && topPaths.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold font-display text-text-primary">
                  Golden Paths
                </h2>
                <Link
                  href="/golden-paths"
                  className="text-sm text-violet-300 hover:text-violet-200 transition-colors"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {topPaths.map((path: GoldenPathRow) => (
                  <GoldenPathCard key={path.id} path={path} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
