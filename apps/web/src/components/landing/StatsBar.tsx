'use client';

import { useCountUp } from '@/hooks/use-count-up';
import { FadeIn } from './FadeIn';

const stats = [
  { end: 12, suffix: '+', label: 'AI Providers' },
  { end: 200, suffix: '+', label: 'UI Components' },
  { end: 4, suffix: '', label: 'Core Repositories' },
  { end: 6, suffix: '', label: 'Open Repositories' },
];

function StatItem({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const { ref, display } = useCountUp({ end, duration: 2000 });
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold text-[#FAFAFA]">
        <span ref={ref}>{display}</span>
        {suffix}
      </div>
      <p className="text-[13px] text-[#71717A] mt-1">{label}</p>
    </div>
  );
}

export function StatsBar() {
  return (
    <div className="border-y border-[#27272A] bg-[#1A1A1E]/50">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-20 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-[#27272A]">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1}>
              <StatItem end={stat.end} suffix={stat.suffix} label={stat.label} />
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
