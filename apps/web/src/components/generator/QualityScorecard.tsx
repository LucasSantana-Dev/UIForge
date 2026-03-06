'use client';

import {
  ShieldCheck,
  Code2,
  Hash,
  Accessibility,
  Smartphone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import type { QualityReport, QualityResult } from '@/lib/quality/gates';
import { cn } from '@/lib/utils';

interface QualityScorecardProps {
  report: QualityReport;
}

const GATE_CONFIG: Record<string, { icon: React.ReactNode; label: string; weight: number }> = {
  security: {
    icon: <ShieldCheck className="h-4 w-4" />,
    label: 'Security',
    weight: 3,
  },
  lint: { icon: <Code2 className="h-4 w-4" />, label: 'Lint', weight: 1 },
  'type-check': {
    icon: <Hash className="h-4 w-4" />,
    label: 'Type Check',
    weight: 1,
  },
  accessibility: {
    icon: <Accessibility className="h-4 w-4" />,
    label: 'Accessibility',
    weight: 2,
  },
  responsive: {
    icon: <Smartphone className="h-4 w-4" />,
    label: 'Responsive',
    weight: 0.5,
  },
};

function statusColor(result: QualityResult): 'green' | 'yellow' | 'red' {
  if (result.passed) return 'green';
  return result.severity === 'error' ? 'red' : 'yellow';
}

const COLOR_MAP = {
  green: {
    bg: 'bg-success/10',
    border: 'border-success/30',
    text: 'text-success',
  },
  yellow: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    text: 'text-warning',
  },
  red: {
    bg: 'bg-error/10',
    border: 'border-error/30',
    text: 'text-error',
  },
};

function GateCard({ result }: { result: QualityResult }) {
  const config = GATE_CONFIG[result.gate];
  const color = statusColor(result);
  const colors = COLOR_MAP[color];

  return (
    <div className={cn('rounded-lg border p-3 flex flex-col gap-2', colors.bg, colors.border)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={colors.text}>{config?.icon || <Code2 className="h-4 w-4" />}</span>
          <span className="text-sm font-medium text-text-primary">
            {config?.label || result.gate}
          </span>
        </div>
        {result.passed ? (
          <CheckCircle2 className="h-4 w-4 text-success" />
        ) : result.severity === 'error' ? (
          <XCircle className="h-4 w-4 text-error" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-warning" />
        )}
      </div>
      {result.issues.length > 0 && (
        <ul className="space-y-0.5">
          {result.issues.map((issue, i) => (
            <li key={i} className="text-xs text-text-muted-foreground leading-relaxed">
              {issue}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OverallScore({ score }: { score: number }) {
  const percent = Math.round(score * 100);
  const label = percent >= 80 ? 'Excellent' : percent >= 50 ? 'Needs Work' : 'Critical';
  const color = percent >= 80 ? 'text-success' : percent >= 50 ? 'text-warning' : 'text-error';

  return (
    <div className="flex items-center gap-3">
      <span className={cn('text-2xl font-bold tabular-nums', color)}>{percent}%</span>
      <span className="text-sm text-text-muted-foreground">{label}</span>
    </div>
  );
}

export function QualityScorecard({ report }: QualityScorecardProps) {
  const passed = report.results.filter((r) => r.passed).length;

  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Quality Scorecard</h3>
          <p className="text-xs text-text-muted-foreground">
            {passed}/{report.results.length} gates passed
          </p>
        </div>
        <OverallScore score={report.score} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {report.results.map((result) => (
          <GateCard key={result.gate} result={result} />
        ))}
      </div>
    </div>
  );
}
