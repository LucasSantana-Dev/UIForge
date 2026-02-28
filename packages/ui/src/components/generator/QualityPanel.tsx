'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import type { QualityReport, QualityResult } from '../../lib/generation-types';

interface QualityPanelProps {
  report: QualityReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gateIcons?: Record<string, React.ReactNode>;
  gateLabels?: Record<string, string>;
}

function GateRow({
  result,
  icon,
  label,
}: {
  result: QualityResult;
  icon?: React.ReactNode;
  label?: string;
}) {
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
            'flex items-center justify-center w-7 h-7 rounded-md text-sm',
            result.passed
              ? 'bg-emerald-500/10 text-emerald-400'
              : result.severity === 'error'
                ? 'bg-red-500/10 text-red-400'
                : 'bg-amber-500/10 text-amber-400'
          )}
        >
          {icon || result.gate.charAt(0).toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">{label || result.gate}</span>
        </div>
        {result.passed ? (
          <span className="text-xs text-emerald-400">Pass</span>
        ) : (
          <span
            className={cn(
              'text-xs',
              result.severity === 'error' ? 'text-red-400' : 'text-amber-400'
            )}
          >
            {result.severity === 'error' ? 'Fail' : 'Warn'}
          </span>
        )}
      </button>
      {expanded && hasIssues && (
        <ul className="mt-2 ml-10 space-y-1">
          {result.issues.map((issue, i) => (
            <li key={i} className="text-xs opacity-60 leading-relaxed">
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
  const color = percent >= 80 ? '#10b981' : percent >= 50 ? '#f59e0b' : '#ef4444';

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
          className="opacity-20"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 700ms ease',
          }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-sm font-bold"
        style={{ color }}
      >
        {percent}
      </span>
    </div>
  );
}

export function QualityPanel({
  report,
  open,
  onOpenChange,
  gateIcons = {},
  gateLabels = {},
}: QualityPanelProps) {
  if (!open) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ScoreGauge score={report.score} />
          <div>
            <h3 className="text-sm font-semibold">Quality Gates</h3>
            <p className="text-xs opacity-60">
              {report.results.filter((r) => r.passed).length}/{report.results.length} checks passed
            </p>
          </div>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="p-1.5 rounded-md opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Close quality panel"
        >
          &#10005;
        </button>
      </div>
      <div className="divide-y divide-zinc-700">
        {report.results.map((result) => (
          <GateRow
            key={result.gate}
            result={result}
            icon={gateIcons[result.gate]}
            label={gateLabels[result.gate]}
          />
        ))}
      </div>
    </div>
  );
}
