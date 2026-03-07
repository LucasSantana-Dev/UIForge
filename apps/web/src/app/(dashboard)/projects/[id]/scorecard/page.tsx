'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Shield,
  Code2,
  Gauge,
  Scale,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowLeftIcon,
} from 'lucide-react';
import Link from 'next/link';
import { isFeatureEnabled } from '@/lib/features/flags';
import { fetchLatestScorecard, fetchScorecardHistory } from '@/lib/scorecards/client';
import type { ProjectScorecard } from '@/lib/scorecards/types';
import { getScoreLevel } from '@/lib/scorecards/types';
import { Skeleton } from '@siza/ui';

const CATEGORY_META = {
  security: { icon: Shield, label: 'Security', color: 'text-red-400', bg: 'bg-red-500/10' },
  quality: { icon: Code2, label: 'Quality', color: 'text-sky-400', bg: 'bg-sky-500/10' },
  performance: {
    icon: Gauge,
    label: 'Performance',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  compliance: {
    icon: Scale,
    label: 'Compliance',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
} as const;

const LEVEL_STYLES = {
  excellent: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    bar: 'bg-emerald-400',
  },
  good: {
    text: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    bar: 'bg-sky-400',
  },
  'needs-work': {
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    bar: 'bg-amber-400',
  },
  critical: {
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    bar: 'bg-red-400',
  },
};

function ScoreGauge({ score, size = 'lg' }: { score: number; size?: 'sm' | 'lg' }) {
  const level = getScoreLevel(score);
  const style = LEVEL_STYLES[level];
  const dim = size === 'lg' ? 'w-24 h-24 text-3xl' : 'w-14 h-14 text-lg';

  return (
    <div
      className={`${dim} rounded-full border-2 ${style.border} ${style.bg} ${style.text} flex items-center justify-center font-display font-bold`}
    >
      {score}
    </div>
  );
}

function CategoryCard({
  category,
  score,
}: {
  category: keyof typeof CATEGORY_META;
  score: number;
}) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  const level = getScoreLevel(score);
  const style = LEVEL_STYLES[level];

  return (
    <div className="bg-surface-1 border border-surface-3 rounded-xl p-5 flex items-center gap-4 transition-colors hover:border-violet-500/20">
      <ScoreGauge score={score} size="sm" />
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-7 h-7 rounded-lg ${meta.bg} flex items-center justify-center`}>
            <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
          </div>
          <span className="text-sm font-semibold text-text-primary">{meta.label}</span>
        </div>
        <span className={`text-xs font-medium capitalize ${style.text}`}>
          {level.replace('-', ' ')}
        </span>
      </div>
    </div>
  );
}

export default function ScorecardPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [scorecard, setScorecard] = useState<ProjectScorecard | null>(null);
  const [history, setHistory] = useState<ProjectScorecard[]>([]);
  const [loading, setLoading] = useState(true);

  const enabled = isFeatureEnabled('ENABLE_PROJECT_SCORECARDS');

  useEffect(() => {
    if (!enabled || !projectId) return;

    async function load() {
      setLoading(true);
      const [latest, hist] = await Promise.all([
        fetchLatestScorecard(projectId),
        fetchScorecardHistory({ projectId, limit: 10 }),
      ]);
      setScorecard(latest);
      setHistory(hist);
      setLoading(false);
    }

    load();
  }, [enabled, projectId]);

  if (!enabled) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
          <Gauge className="w-6 h-6 text-violet-400" />
        </div>
        <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
          Project Scorecard
        </h3>
        <p className="text-sm text-text-secondary">
          Enable the <code className="font-mono text-violet-400">ENABLE_PROJECT_SCORECARDS</code>{' '}
          flag.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!scorecard) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
          <Gauge className="w-6 h-6 text-violet-400" />
        </div>
        <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
          No Scorecard Data
        </h3>
        <p className="text-sm text-text-secondary max-w-sm">
          Scorecards are generated after code generation. Generate a component to see quality
          scores.
        </p>
        <Link
          href={`/generate?projectId=${projectId}`}
          className="mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          Generate a component &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}`}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary">Project Scorecard</h1>
            <p className="text-sm text-text-secondary mt-1">
              Last updated {new Date(scorecard.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <ScoreGauge score={scorecard.overall_score} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <CategoryCard category="security" score={scorecard.security_score} />
        <CategoryCard category="quality" score={scorecard.quality_score} />
        <CategoryCard category="performance" score={scorecard.performance_score} />
        <CategoryCard category="compliance" score={scorecard.compliance_score} />
      </div>

      {scorecard.violations.length > 0 && (
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-red-400" />
            Violations ({scorecard.violations.length})
          </h3>
          <ul className="space-y-2">
            {scorecard.violations.map((v, i) => (
              <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                <span className="text-red-400 mt-0.5 font-mono text-xs">&minus;</span>
                {v}
              </li>
            ))}
          </ul>
        </div>
      )}

      {scorecard.recommendations.length > 0 && (
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {scorecard.recommendations.map((r, i) => (
              <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5 font-mono text-xs">+</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {history.length > 1 && (
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-violet-400" />
            Score History
          </h3>
          <div className="flex items-end gap-1.5 h-24">
            {history
              .slice()
              .reverse()
              .map((s) => {
                const level = getScoreLevel(s.overall_score);
                const barColor = LEVEL_STYLES[level].bar;
                return (
                  <div
                    key={s.id}
                    className={`flex-1 rounded-t-md ${barColor} transition-all hover:opacity-80`}
                    style={{ height: `${s.overall_score}%` }}
                    title={`${s.overall_score} \u2014 ${new Date(s.created_at).toLocaleDateString()}`}
                  />
                );
              })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-text-muted">
            <span>Oldest</span>
            <span>Latest</span>
          </div>
        </div>
      )}
    </div>
  );
}
