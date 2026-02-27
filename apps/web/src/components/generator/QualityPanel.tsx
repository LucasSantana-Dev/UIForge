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
} from 'lucide-react';
import type { QualityReport, QualityResult } from '@/lib/quality/gates';

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
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="text-text-muted mt-0.5">
        {GATE_ICONS[result.gate] || <Code2 className="h-4 w-4" />}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">
            {GATE_LABELS[result.gate] || result.gate}
          </span>
          {result.passed ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-400">
              <CheckCircle2 className="h-3 w-3" />
              Pass
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1 text-xs ${
                result.severity === 'error'
                  ? 'text-red-400'
                  : 'text-yellow-400'
              }`}
            >
              <XCircle className="h-3 w-3" />
              {result.severity === 'error' ? 'Fail' : 'Warn'}
            </span>
          )}
        </div>
        {result.issues.length > 0 && (
          <ul className="mt-1 space-y-0.5">
            {result.issues.map((issue, i) => (
              <li key={i} className="text-xs text-text-muted">
                {issue}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function QualityPanel({ report, open, onOpenChange }: QualityPanelProps) {
  if (!open) return null;

  const scorePercent = Math.round(report.score * 100);

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 mx-3 bg-surface-1 border border-surface-3 rounded-lg p-4 shadow-lg z-10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text-primary">
            Quality Gates
          </h3>
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              scorePercent >= 80
                ? 'bg-green-900/30 text-green-400'
                : scorePercent >= 50
                  ? 'bg-yellow-900/30 text-yellow-400'
                  : 'bg-red-900/30 text-red-400'
            }`}
          >
            {scorePercent}%
          </span>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="text-text-muted hover:text-text-primary transition-colors"
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
