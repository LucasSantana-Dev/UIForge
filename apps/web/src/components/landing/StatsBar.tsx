'use client';

import { useCountUp } from '@/hooks/use-count-up';
import { type EcosystemSnapshot } from '@/lib/marketing/ecosystem-data';
import { FadeIn } from './FadeIn';

interface StatsBarProps {
  snapshot: EcosystemSnapshot;
}

function StatItem({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const { ref, display } = useCountUp({ end, duration: 2000 });
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-foreground sm:text-4xl">
        <span ref={ref} className="text-violet-400">
          {display}
        </span>
        <span className="text-violet-400">{suffix}</span>
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function StatsBar({ snapshot }: StatsBarProps) {
  const stats = [
    { end: snapshot.repoCount, suffix: '', label: 'Product Repos' },
    { end: snapshot.releasedRepoCount, suffix: '', label: 'Repos With Releases' },
    { end: snapshot.stats.updatedLast30d, suffix: '', label: 'Updated in 30 Days' },
    { end: snapshot.stats.updatedLast7d, suffix: '', label: 'Updated in 7 Days' },
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
          {stats.map((stat, index) => (
            <FadeIn key={stat.label} delay={index * 0.1}>
              <StatItem end={stat.end} suffix={stat.suffix} label={stat.label} />
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
