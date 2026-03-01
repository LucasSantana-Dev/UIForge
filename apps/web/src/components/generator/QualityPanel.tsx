'use client';

import {
  ShieldCheck,
  Code2,
  Hash,
  Accessibility,
  Smartphone,
  X,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import type { QualityReport, QualityResult } from '@/lib/quality/gates';
import { cn } from '@/lib/utils';

interface QualityPanelProps {
  report: QualityReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GATE_ICONS: Record<string, React.ReactNode> = {
  security: <ShieldCheck className="h-4 w-4" />,
  lint: <Code2 className="h-4 w-4" />,
  'type-check': <Hash className="h-4 w-4" />,
  accessibility: <Accessibility className="h-4 w-4" />,
  responsive: <Smartphone className="h-4 w-4" />,
};

const GATE_LABELS: Record<string, string> = {
  security: 'Security',
  lint: 'Lint',
  'type-check': 'Type Check',
  accessibility: 'Accessibility',
  responsive: 'Responsive',
};

function GateRow({ result }: { result: QualityResult }) {
  const [expanded, setExpanded] = useState(false);
  const hasIssues = result.issues.length > 0;

  return (
    <div className="py-2.5">
      <button
        type="button"
        onClick={() => hasIssues && setExpanded(!expanded)}
        className={cn('flex items-center gap-3 w-full text-left', hasIssues && 'cursor-pointer')}
      >
        <span
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded-md',
            result.passed
              ? 'bg-success/10 text-success'
              : result.severity === 'error'
                ? 'bg-error/10 text-error'
                : 'bg-warning/10 text-warning'
          )}
        >
          {GATE_ICONS[result.gate] || <Code2 className="h-4 w-4" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">
              {GATE_LABELS[result.gate] || result.gate}
            </span>
            {result.passed ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            ) : (
              <XCircle
                className={cn(
                  'h-3.5 w-3.5',
                  result.severity === 'error' ? 'text-error' : 'text-warning'
                )}
              />
            )}
          </div>
        </div>
        {hasIssues && (
          <ChevronDown
            className={cn(
              'h-4 w-4 text-text-muted transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
        )}
      </button>
      {expanded && hasIssues && (
        <ul className="mt-2 ml-10 space-y-1">
          {result.issues.map((issue, i) => (
            <li key={i} className="text-xs text-text-muted leading-relaxed">
              {issue}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const percent = Math.round(score * 100);
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent >= 80 ? 'text-success' : percent >= 50 ? 'text-warning' : 'text-error';
  const strokeColor = percent >= 80 ? 'var(--success)' : percent >= 50 ? 'var(--warning)' : 'var(--error)';

  return (
    <div className="relative w-14 h-14">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-surface-3"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-siza"
        />
      </svg>
      <span
        className={cn('absolute inset-0 flex items-center justify-center text-sm font-bold', color)}
      >
        {percent}
      </span>
    </div>
  );
}

export function QualityPanel({ report, open, onOpenChange }: QualityPanelProps) {
  if (!open) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 mx-3 bg-surface-1 border border-surface-3 rounded-xl p-4 shadow-lg z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ScoreGauge score={report.score} />
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Quality Gates</h3>
            <p className="text-xs text-text-muted">
              {report.results.filter((r) => r.passed).length}/{report.results.length} checks passed
            </p>
          </div>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
          aria-label="Close quality panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="divide-y divide-surface-3">
        {report.results.map((result) => (
          <GateRow key={result.gate} result={result} />
        ))}
      </div>
    </div>
  );
}
