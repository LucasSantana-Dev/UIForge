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
  { label: string; color: string; dot: string; connector: string }
> = {
  'Design & Brand': {
    label: 'Design & Brand',
    color: 'border-rose-500/30 bg-rose-500/5',
    dot: 'bg-rose-400',
    connector: 'text-rose-400',
  },
  'Governance & Quality': {
    label: 'Governance & Quality',
    color: 'border-amber-500/30 bg-amber-500/5',
    dot: 'bg-amber-400',
    connector: 'text-amber-400',
  },
  'Generation Engine': {
    label: 'Generation Engine',
    color: 'border-violet-500/30 bg-violet-500/5',
    dot: 'bg-violet-400',
    connector: 'text-violet-400',
  },
};

function RepoChip({ repo }: { repo: EcosystemRepo }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-1.5 rounded-lg border border-[#27272A] bg-[#18181B] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/30 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[#FAFAFA] transition-colors group-hover:text-violet-300">
          {repo.name}
        </span>
        {repo.latestReleaseTag && (
          <span className="shrink-0 rounded bg-[#27272A] px-1.5 py-0.5 font-mono text-[10px] text-[#A1A1AA]">
            {repo.latestReleaseTag}
          </span>
        )}
      </div>
      <p className="text-xs leading-relaxed text-[#71717A]">{repo.description}</p>
      {repo.highlights[0] && (
        <p className="text-[10px] font-mono text-[#52525B]">• {repo.highlights[0]}</p>
      )}
    </a>
  );
}

function FlowArrow() {
  return (
    <div className="hidden items-center justify-center lg:flex" aria-hidden>
      <div className="flex flex-col items-center gap-1">
        <div className="h-8 w-px bg-gradient-to-b from-[#27272A] to-violet-500/40" />
        <svg className="h-4 w-4 text-violet-400" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 12L2 6h12L8 12z" />
        </svg>
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

        <div className="mt-14 flex flex-col gap-3 lg:gap-0">
          {GROUP_ORDER.map((group, idx) => {
            const meta = GROUP_META[group];
            const repos = byGroup[group];
            return (
              <div key={group}>
                <div
                  className={`rounded-xl border p-6 ${meta.color}`}
                  role="region"
                  aria-label={meta.label}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                    <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                      {meta.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {repos.map((repo) => (
                      <RepoChip key={repo.name} repo={repo} />
                    ))}
                  </div>
                </div>
                {idx < GROUP_ORDER.length - 1 && <FlowArrow />}
              </div>
            );
          })}
        </div>

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
