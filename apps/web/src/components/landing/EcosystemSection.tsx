import { type EcosystemSnapshot, type EcosystemRepo } from '@/lib/marketing/ecosystem-data';
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
  }).format(new Date(iso));
}

function badgeFromGroup(repo: EcosystemRepo): string {
  if (repo.group === 'Generation Engine') return 'Generation';
  if (repo.group === 'Governance & Quality') return 'Governance';
  return 'Design & Brand';
}

export function EcosystemSection({ snapshot }: EcosystemSectionProps) {
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
            Each repository is independently versioned and MIT-licensed. Live metadata is synced
            from GitHub every 6 hours.
          </p>
          <p className="mt-3 text-xs font-mono uppercase tracking-[0.14em] text-[#A1A1AA]">
            Last synced {formatDate(snapshot.lastSyncedAt)}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {snapshot.repos.map((repo) => (
            <a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-[#27272A] bg-[#18181B] p-6 transition-all duration-200 ease-siza hover:-translate-y-0.5 hover:border-violet-500/30 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214]"
            >
              <span className="mb-3 inline-flex items-center rounded-md bg-violet-500/15 px-2.5 py-0.5 text-xs font-medium text-violet-300">
                {badgeFromGroup(repo)}
              </span>
              <h3 className="mb-2 text-base font-semibold text-[#FAFAFA] transition-colors group-hover:text-violet-300">
                {repo.name}
              </h3>
              <p className="mb-3 text-sm leading-relaxed text-[#A1A1AA]">{repo.description}</p>
              <div className="mb-3 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.06em] text-[#A1A1AA]">
                <span className="rounded bg-[#27272A] px-2 py-1">
                  {repo.latestReleaseTag ?? 'No tagged release'}
                </span>
                <span className="rounded bg-[#27272A] px-2 py-1">
                  Updated {formatDate(repo.updatedAt)}
                </span>
              </div>
              <ul className="space-y-1">
                {repo.highlights.slice(0, 2).map((highlight) => (
                  <li key={highlight} className="text-xs text-[#A1A1AA]">
                    • {highlight}
                  </li>
                ))}
              </ul>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
