'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { buildPhases } from '@/components/roadmap/data';
import { PhaseCard } from '@/components/roadmap/PhaseCard';
import { StatusFilter } from '@/components/roadmap/StatusFilter';
import { PhaseNavigator } from '@/components/roadmap/PhaseNavigator';
import { countByStatus } from '@/components/roadmap/utils';
import { EASE_SIZA } from '@/components/landing/constants';
import type { ItemStatus } from '@/components/roadmap/types';

interface RoadmapClientPageProps {
  repoCount: number;
}

export default function RoadmapClientPage({ repoCount }: RoadmapClientPageProps) {
  const phases = useMemo(() => buildPhases(repoCount), [repoCount]);
  const prefersReducedMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<ItemStatus | 'all'>('all');
  const [scope, setScope] = useState<'all' | 'desktop'>('all');
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(
    () => new Set(phases.filter((phase) => phase.status === 'active').map((phase) => phase.number))
  );
  const [activePhase, setActivePhase] = useState<number | null>(null);

  const togglePhase = useCallback((number: number) => {
    setExpandedPhases((previous) => {
      const next = new Set(previous);
      if (next.has(number)) {
        next.delete(number);
      } else {
        next.add(number);
      }
      return next;
    });
  }, []);

  const scrollToPhase = useCallback((number: number) => {
    setActivePhase(number);
    setExpandedPhases((previous) => new Set([...previous, number]));
    document
      .getElementById(`phase-${number}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setActivePhase(null), 1500);
  }, []);

  const counts = useMemo(
    () => ({
      all: countByStatus(phases, 'all'),
      done: countByStatus(phases, 'done'),
      'in-progress': countByStatus(phases, 'in-progress'),
      planned: countByStatus(phases, 'planned'),
    }),
    [phases]
  );

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: EASE_SIZA }}
        className="px-6 pb-8 pt-24 text-center"
      >
        <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">Roadmap</h1>
        <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
          Where Siza is headed. Built in public, shaped by developer feedback, and aligned with the
          live Forge Space ecosystem.
        </p>
        <div className="space-y-4">
          <PhaseNavigator phases={phases} activePhase={activePhase} onSelect={scrollToPhase} />
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setScope('all')}
              className={
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors ' +
                (scope === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-muted-foreground hover:text-foreground')
              }
            >
              All Platforms
            </button>
            <button
              type="button"
              onClick={() => setScope('desktop')}
              className={
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors ' +
                (scope === 'desktop'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-muted-foreground hover:text-foreground')
              }
            >
              Desktop
            </button>
          </div>
          <StatusFilter active={activeFilter} onChange={setActiveFilter} counts={counts} />
        </div>
      </motion.div>
      <div className="mx-auto max-w-2xl px-6 pb-16">
        {phases.map((phase, index) => (
          <PhaseCard
            key={phase.number}
            phase={phase}
            index={index}
            totalPhases={phases.length}
            expanded={expandedPhases.has(phase.number)}
            onToggle={() => togglePhase(phase.number)}
            activeFilter={activeFilter}
            scope={scope}
          />
        ))}
      </div>
      <div className="mx-auto max-w-2xl px-6 pb-20 text-center">
        <p className="text-sm text-muted-foreground">
          This roadmap evolves with the project.{' '}
          <a
            href="https://github.com/Forge-Space/siza/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Share your feedback
          </a>{' '}
          to help shape what comes next.
        </p>
      </div>
    </div>
  );
}
