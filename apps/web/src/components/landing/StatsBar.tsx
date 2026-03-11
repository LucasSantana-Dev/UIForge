import { type EcosystemSnapshot } from '@/lib/marketing/ecosystem-data';

interface StatsBarProps {
  snapshot: EcosystemSnapshot;
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-foreground sm:text-4xl">
        <span className="text-violet-400">{value}</span>
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function StatsBar({ snapshot }: StatsBarProps) {
  const stats = [
    { value: String(snapshot.repoCount), label: 'Product Repos' },
    { value: String(snapshot.releasedRepoCount), label: 'Repos With Releases' },
    { value: String(snapshot.stats.updatedLast30d), label: 'Updated in 30 Days' },
    { value: String(snapshot.stats.updatedLast7d), label: 'Updated in 7 Days' },
  ];

  return (
    <div className="relative overflow-hidden border-y border-violet-500/10 bg-surface/50">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.04) 50%, transparent)',
        }}
      />
      <div className="relative z-10 mx-auto max-w-[1280px] px-5 py-10 sm:px-8 lg:px-20">
        <div className="mb-4 text-center text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          Live GitHub ecosystem sync
        </div>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-violet-500/10">
          {stats.map((stat) => (
            <StatItem key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </div>
  );
}
