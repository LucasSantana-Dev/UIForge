import {
  type EcosystemSnapshot,
  type EcosystemRepo,
  type RepoGroup,
} from '@/lib/marketing/ecosystem-data';
import { CONTAINER, SECTION_PADDING } from './constants';

interface EcosystemSectionProps {
  snapshot: EcosystemSnapshot;
}

function formatDate(iso: string | null): string {
  if (!iso) return 'No release';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));
}

const GROUP_ORDER: RepoGroup[] = ['Design & Brand', 'Governance & Quality', 'Generation Engine'];

const GROUP_META: Record<
  RepoGroup,
  { label: string; sublabel: string; accent: string; border: string; bg: string; badge: string }
> = {
  'Design & Brand': {
    label: 'Layer 1',
    sublabel: 'Design & Brand',
    accent: 'text-rose-400',
    border: 'border-rose-500/25',
    bg: 'bg-rose-500/5',
    badge: 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20',
  },
  'Governance & Quality': {
    label: 'Layer 2',
    sublabel: 'Governance & Quality',
    accent: 'text-amber-400',
    border: 'border-amber-500/25',
    bg: 'bg-amber-500/5',
    badge: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
  },
  'Generation Engine': {
    label: 'Layer 3',
    sublabel: 'Generation Engine',
    accent: 'text-violet-400',
    border: 'border-violet-500/25',
    bg: 'bg-violet-500/5',
    badge: 'bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20',
  },
};

function RepoNode({
  repo,
  accent,
  border,
}: {
  repo: EcosystemRepo;
  accent: string;
  border: string;
}) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col gap-1.5 rounded-lg border ${border} bg-[#18181B] px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-[0_4px_16px_rgba(139,92,246,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214]`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[13px] font-semibold text-[#FAFAFA] transition-colors group-hover:${accent.replace('text-', 'text-')}`}
        >
          {repo.name}
        </span>
        {repo.latestReleaseTag && (
          <span className="shrink-0 rounded bg-[#27272A] px-1.5 py-0.5 font-mono text-[10px] text-[#71717A]">
            {repo.latestReleaseTag}
          </span>
        )}
      </div>
      <p className="text-[11px] leading-relaxed text-[#71717A]">{repo.description}</p>
    </a>
  );
}

function LayerConnector({ fromAccent }: { fromAccent: string }) {
  return (
    <div className="relative hidden lg:flex items-center justify-center py-1" aria-hidden>
      <div className="absolute inset-x-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-0.5">
          {/* Dashed line */}
          <div className="flex flex-col items-center gap-[3px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="h-1 w-px rounded-full bg-[#3F3F46]" />
            ))}
          </div>
          {/* Arrow head */}
          <svg
            className={`h-3.5 w-3.5 ${fromAccent} opacity-70`}
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M8 12L2 5h12L8 12z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function EcosystemSection({ snapshot }: EcosystemSectionProps) {
  const byGroup = GROUP_ORDER.reduce<Record<RepoGroup, EcosystemRepo[]>>(
    (acc, g) => ({ ...acc, [g]: [] }),
    {} as Record<RepoGroup, EcosystemRepo[]>
  );
  for (const repo of snapshot.repos) {
    byGroup[repo.group].push(repo);
  }

  return (
    <section id="ecosystem" className={`${SECTION_PADDING} border-t border-[#27272A]`}>
      <div className={CONTAINER}>
        {/* Header */}
        <div className="text-center">
          <p className="mb-4 text-sm font-mono uppercase tracking-wider text-violet-400">
            Ecosystem
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#FAFAFA] sm:text-4xl">
            {snapshot.repoCount} repos. One vision.
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[#A1A1AA]">
            Three layers that compose into a full generation pipeline — from brand identity to
            governed delivery.
          </p>
          <p className="mt-3 text-xs font-mono uppercase tracking-[0.14em] text-[#A1A1AA]">
            Last synced {formatDate(snapshot.lastSyncedAt)}
          </p>
        </div>

        {/* Pipeline diagram */}
        <div className="relative mt-14">
          {/* Vertical spine — desktop only, sits behind layers */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 lg:block"
            aria-hidden
          >
            <div className="h-full w-full bg-gradient-to-b from-rose-500/20 via-amber-500/20 to-violet-500/20" />
          </div>

          <div className="flex flex-col gap-2 lg:gap-0">
            {GROUP_ORDER.map((group, idx) => {
              const meta = GROUP_META[group];
              const repos = byGroup[group];
              return (
                <div key={group}>
                  {/* Layer row */}
                  <div
                    className={`rounded-2xl border ${meta.border} ${meta.bg} p-5`}
                    role="region"
                    aria-label={meta.sublabel}
                  >
                    {/* Layer header */}
                    <div className="mb-4 flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest ${meta.badge}`}
                      >
                        {meta.label}
                      </span>
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider ${meta.accent}`}
                      >
                        {meta.sublabel}
                      </span>
                    </div>

                    {/* Repo nodes — flex row, wrap on mobile */}
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {repos.map((repo) => (
                        <RepoNode
                          key={repo.name}
                          repo={repo}
                          accent={meta.accent}
                          border={meta.border}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Connector between layers */}
                  {idx < GROUP_ORDER.length - 1 && <LayerConnector fromAccent={meta.accent} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer stats */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#52525B]">
          <span>{snapshot.releasedRepoCount} packages released</span>
          <span className="text-[#27272A]">·</span>
          <span>{snapshot.stats.updatedLast7d} repos updated in the last 7 days</span>
          {snapshot.npmDownloads.total > 0 && (
            <>
              <span className="text-[#27272A]">·</span>
              <span>{snapshot.npmDownloads.total.toLocaleString()} npm downloads last month</span>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
