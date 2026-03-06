'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Shield, Code2, Gauge, Scale, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { isFeatureEnabled } from '@/lib/features/flags';
import { fetchLatestScorecard, fetchScorecardHistory } from '@/lib/scorecards/client';
import type { ProjectScorecard } from '@/lib/scorecards/types';
import { getScoreLevel } from '@/lib/scorecards/types';

const CATEGORY_META = {
  security: { icon: Shield, label: 'Security', color: 'text-red-400' },
  quality: { icon: Code2, label: 'Quality', color: 'text-blue-400' },
  performance: { icon: Gauge, label: 'Performance', color: 'text-yellow-400' },
  compliance: { icon: Scale, label: 'Compliance', color: 'text-purple-400' },
} as const;

const LEVEL_STYLES = {
  excellent: 'text-green-400 bg-green-400/10 border-green-400/30',
  good: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  'needs-work': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  critical: 'text-red-400 bg-red-400/10 border-red-400/30',
};

function ScoreGauge({ score, size = 'lg' }: { score: number; size?: 'sm' | 'lg' }) {
  const level = getScoreLevel(score);
  const style = LEVEL_STYLES[level];
  const dim = size === 'lg' ? 'w-24 h-24 text-3xl' : 'w-14 h-14 text-lg';

  return (
    <div
      className={`${dim} rounded-full border-2 ${style} flex items-center justify-center font-bold`}
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

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center gap-4">
      <ScoreGauge score={score} size="sm" />
      <div>
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${meta.color}`} />
          <span className="text-sm font-medium text-zinc-200">{meta.label}</span>
        </div>
        <span className={`text-xs capitalize ${LEVEL_STYLES[level].split(' ')[0]}`}>
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
      <div className="p-8 text-center text-zinc-500">
        Project scorecards are not enabled. Set ENABLE_PROJECT_SCORECARDS flag.
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Loading scorecard...</div>;
  }

  if (!scorecard) {
    return (
      <div className="p-8 text-center text-zinc-500">
        No scorecard data yet. Scorecards are generated after code generation.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Project Scorecard</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Last updated {new Date(scorecard.created_at).toLocaleDateString()}
          </p>
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-zinc-200 flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-red-400" />
            Violations ({scorecard.violations.length})
          </h3>
          <ul className="space-y-1">
            {scorecard.violations.map((v, i) => (
              <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">-</span>
                {v}
              </li>
            ))}
          </ul>
        </div>
      )}

      {scorecard.recommendations.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-zinc-200 flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            Recommendations
          </h3>
          <ul className="space-y-1">
            {scorecard.recommendations.map((r, i) => (
              <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                <span className="text-green-400 mt-0.5">+</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {history.length > 1 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-zinc-200 flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            Score History
          </h3>
          <div className="flex items-end gap-1 h-20">
            {history
              .slice()
              .reverse()
              .map((s) => {
                const level = getScoreLevel(s.overall_score);
                const bgColor = LEVEL_STYLES[level].split(' ')[1];
                return (
                  <div
                    key={s.id}
                    className={`flex-1 rounded-t ${bgColor}`}
                    style={{ height: `${s.overall_score}%` }}
                    title={`${s.overall_score} — ${new Date(s.created_at).toLocaleDateString()}`}
                  />
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
