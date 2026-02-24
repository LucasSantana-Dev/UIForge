'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Circle, Loader2 } from 'lucide-react';

const EASE_SIZA = [0.16, 1, 0.3, 1] as const;

type ItemStatus = 'done' | 'in-progress' | 'planned';

interface RoadmapItem {
  label: string;
  status: ItemStatus;
}

interface Phase {
  number: number;
  title: string;
  subtitle: string;
  status: 'active' | 'planned' | 'future';
  items: RoadmapItem[];
}

const phases: Phase[] = [
  {
    number: 1,
    title: 'Foundation',
    subtitle: 'Core platform and developer experience',
    status: 'active',
    items: [
      { label: 'Dark mode design system with Siza tokens', status: 'done' },
      { label: 'Brand identity and rebrand', status: 'done' },
      { label: 'Authentication (Email + OAuth)', status: 'done' },
      { label: 'Project CRUD with Row Level Security', status: 'done' },
      { label: 'AI component generation with streaming', status: 'in-progress' },
      { label: 'Monaco editor integration', status: 'in-progress' },
      { label: 'Live component preview', status: 'planned' },
      { label: 'Template gallery with categories', status: 'planned' },
    ],
  },
  {
    number: 2,
    title: 'Growth',
    subtitle: 'Ecosystem integration and collaboration',
    status: 'planned',
    items: [
      { label: 'Figma integration via MCP', status: 'planned' },
      { label: 'Component versioning and history', status: 'planned' },
      { label: 'Multi-framework output (Vue, Angular, Svelte)', status: 'planned' },
      { label: 'Collaborative editing', status: 'planned' },
      { label: 'CLI tool for local generation', status: 'planned' },
      { label: 'API access for CI/CD integration', status: 'planned' },
    ],
  },
  {
    number: 3,
    title: 'Scale',
    subtitle: 'Enterprise features and extensibility',
    status: 'future',
    items: [
      { label: 'Custom AI model fine-tuning', status: 'planned' },
      { label: 'Design system import/export', status: 'planned' },
      { label: 'Component marketplace', status: 'planned' },
      { label: 'Enterprise SSO', status: 'planned' },
      { label: 'Self-hosted deployment option', status: 'planned' },
      { label: 'Plugin ecosystem', status: 'planned' },
    ],
  },
];

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
  const config: Record<ItemStatus, { className: string; label: string }> = {
    done: { className: 'bg-green-500/20 text-green-400 border-0', label: 'Done' },
    'in-progress': { className: 'bg-primary/20 text-primary border-0', label: 'In Progress' },
    planned: { className: 'bg-muted text-muted-foreground border-0', label: 'Planned' },
  };

  return (
    <Badge variant="outline" className={`text-xs ${config[status].className}`}>
      {config[status].label}
    </Badge>
  );
}

function PhaseCard({ phase, index }: { phase: Phase; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const isActive = phase.status === 'active';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: EASE_SIZA, delay: index * 0.15 }}
      className="relative pl-12 md:pl-16"
    >
      {index < phases.length - 1 && (
        <div className="absolute left-[18px] md:left-[26px] top-12 bottom-0 w-px bg-border" />
      )}

      <div
        className={`absolute left-0 md:left-2 top-1 w-[38px] h-[38px] rounded-full flex items-center justify-center font-bold text-sm ${
          isActive
            ? 'bg-primary text-primary-foreground shadow-[0_0_16px_rgba(124,58,237,0.4)]'
            : 'bg-card border border-border text-muted-foreground'
        }`}
      >
        {phase.number}
      </div>

      <Card
        className={`p-6 mb-8 bg-card border-border ${
          isActive ? 'shadow-[0_0_20px_rgba(124,58,237,0.1)]' : ''
        }`}
      >
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-bold">Phase {phase.number}</h2>
          <span className="text-muted-foreground">&mdash;</span>
          <span className="text-lg font-semibold">{phase.title}</span>
          {isActive && (
            <Badge className="bg-primary/20 text-primary border-0 text-xs">Current</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-5">{phase.subtitle}</p>

        <div className="space-y-3">
          {phase.items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{
                duration: 0.3,
                ease: EASE_SIZA,
                delay: index * 0.15 + i * 0.05,
              }}
              className="flex items-center gap-3 py-1.5"
            >
              <StatusIcon status={item.status} />
              <span
                className={`flex-1 text-sm ${
                  item.status === 'done'
                    ? 'text-muted-foreground line-through'
                    : item.status === 'in-progress'
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
              <StatusBadge status={item.status} />
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_SIZA }}
        className="pt-24 pb-12 px-6 text-center"
      >
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">Roadmap</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Where Siza is headed. Built in public, shaped by developer feedback.
        </p>
      </motion.div>

      <div className="max-w-2xl mx-auto px-6 pb-16">
        {phases.map((phase, i) => (
          <PhaseCard key={phase.number} phase={phase} index={i} />
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-20 text-center">
        <p className="text-sm text-muted-foreground">
          This roadmap evolves with the project.{' '}
          <a
            href="https://github.com/Forge-Space/UI/issues"
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
