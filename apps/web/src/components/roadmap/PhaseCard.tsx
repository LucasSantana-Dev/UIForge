'use client';

import { useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, Circle, Loader2, ChevronDown, ExternalLink } from 'lucide-react';
import { EASE_SIZA } from '@/components/landing/constants';
import type { Phase, ItemStatus, RoadmapItem } from './types';
import { calculatePhaseProgress, filterItemsByStatus } from './utils';

function StatusIcon({ status }: { status: ItemStatus }) {
  switch (status) {
    case 'done':
      return (
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="w-3 h-3 text-green-400" />
        </div>
      );
    case 'in-progress':
      return (
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
          <Loader2 className="w-3 h-3 text-primary animate-spin" />
        </div>
      );
    case 'planned':
      return (
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
          <Circle className="w-3 h-3 text-muted-foreground" />
        </div>
      );
  }
}

function StatusBadge({ status }: { status: ItemStatus }) {
  const cfg: Record<ItemStatus, { cls: string; lbl: string }> = {
    done: { cls: 'bg-green-500/20 text-green-400 border-0', lbl: 'Done' },
    'in-progress': { cls: 'bg-primary/20 text-primary border-0', lbl: 'In Progress' },
    planned: { cls: 'bg-muted text-muted-foreground border-0', lbl: 'Planned' },
  };
  return (
    <Badge variant="outline" className={clsx('text-xs', cfg[status].cls)}>
      {cfg[status].lbl}
    </Badge>
  );
}

function ItemRow({
  item,
  index,
  isInView,
}: {
  item: RoadmapItem;
  index: number;
  isInView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.3, ease: EASE_SIZA, delay: index * 0.04 }}
      className="flex items-center gap-3 py-1.5"
    >
      <StatusIcon status={item.status} />
      <span
        className={clsx('flex-1 text-sm', {
          'text-muted-foreground line-through': item.status === 'done',
          'text-foreground': item.status === 'in-progress',
          'text-muted-foreground': item.status === 'planned',
        })}
      >
        {item.label}
      </span>
      {item.githubUrl && (
        <a
          href={item.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${item.label} on GitHub`}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
      <StatusBadge status={item.status} />
    </motion.div>
  );
}

interface PhaseCardProps {
  phase: Phase;
  index: number;
  totalPhases: number;
  expanded: boolean;
  onToggle: () => void;
  activeFilter: ItemStatus | 'all';
}

export function PhaseCard({
  phase,
  index,
  totalPhases,
  expanded,
  onToggle,
  activeFilter,
}: PhaseCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const isActive = phase.status === 'active';
  const progress = calculatePhaseProgress(phase);
  const filteredItems = filterItemsByStatus(phase, activeFilter);

  return (
    <motion.div
      ref={ref}
      id={`phase-${phase.number}`}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: EASE_SIZA, delay: index * 0.15 }}
      className="relative pl-12 md:pl-16"
    >
      {index < totalPhases - 1 && (
        <div className="absolute left-[18px] md:left-[26px] top-12 bottom-0 w-px bg-border" />
      )}
      <div
        className={clsx(
          'absolute left-0 md:left-2 top-1 w-[38px] h-[38px] rounded-full flex items-center justify-center font-bold text-sm',
          isActive
            ? 'bg-primary text-primary-foreground shadow-[0_0_16px_rgba(124,58,237,0.4)]'
            : 'bg-card border border-border text-muted-foreground'
        )}
      >
        {phase.number}
      </div>
      <Card
        className={clsx('p-6 mb-8 bg-card border-border', {
          'shadow-[0_0_20px_rgba(124,58,237,0.1)]': isActive,
        })}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={`phase-${phase.number}-items`}
          className="w-full text-left flex items-center gap-3 mb-1"
        >
          <span role="heading" aria-level={2} className="text-xl font-bold">
            Phase {phase.number}
          </span>
          <span className="text-muted-foreground">&mdash;</span>
          <span className="text-lg font-semibold">{phase.title}</span>
          {isActive && (
            <Badge className="bg-primary/20 text-primary border-0 text-xs">Current</Badge>
          )}
          <span className="text-xs text-muted-foreground ml-auto mr-2">{phase.estimatedDate}</span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </button>
        <p className="text-sm text-muted-foreground mb-3">{phase.subtitle}</p>
        <div className="flex items-center gap-3 mb-4">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground font-mono">{progress}%</span>
        </div>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              id={`phase-${phase.number}-items`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE_SIZA }}
              className="overflow-hidden"
            >
              <div className="space-y-1">
                {filteredItems.map((item, i) => (
                  <ItemRow key={item.label} item={item} index={i} isInView={isInView} />
                ))}
                {filteredItems.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No items match the selected filter.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
