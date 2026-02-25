'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { phases } from '@/components/roadmap/data';
import { PhaseCard } from '@/components/roadmap/PhaseCard';
import { StatusFilter } from '@/components/roadmap/StatusFilter';
import { PhaseNavigator } from '@/components/roadmap/PhaseNavigator';
import { countByStatus } from '@/components/roadmap/utils';
import type { ItemStatus } from '@/components/roadmap/types';

const EASE_SIZA = [0.16, 1, 0.3, 1] as const;

export default function RoadmapPage() {
  const [activeFilter, setActiveFilter] = useState<ItemStatus | 'all'>('all');
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(
    () => new Set(phases.filter((p) => p.status === 'active').map((p) => p.number))
  );
  const [activePhase, setActivePhase] = useState<number | null>(null);

  const togglePhase = useCallback((n: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }, []);

  const scrollToPhase = useCallback((n: number) => {
    setActivePhase(n);
    setExpandedPhases((prev) => new Set([...prev, n]));
    document.getElementById(`phase-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const counts = {
    all: countByStatus(phases, 'all'),
    done: countByStatus(phases, 'done'),
    'in-progress': countByStatus(phases, 'in-progress'),
    planned: countByStatus(phases, 'planned'),
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_SIZA }}
        className="pt-24 pb-8 px-6 text-center"
      >
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">Roadmap</h1>
        <p className="text-muted-foreground max-w-xl mx-auto mb-8">
          Where Siza is headed. Built in public, shaped by developer feedback.
        </p>
        <div className="space-y-4">
          <PhaseNavigator phases={phases} activePhase={activePhase} onSelect={scrollToPhase} />
          <StatusFilter active={activeFilter} onChange={setActiveFilter} counts={counts} />
        </div>
      </motion.div>
      <div className="max-w-2xl mx-auto px-6 pb-16">
        {phases.map((phase, i) => (
          <PhaseCard
            key={phase.number}
            phase={phase}
            index={i}
            totalPhases={phases.length}
            expanded={expandedPhases.has(phase.number)}
            onToggle={() => togglePhase(phase.number)}
            activeFilter={activeFilter}
          />
        ))}
      </div>
      <div className="max-w-2xl mx-auto px-6 pb-20 text-center">
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
