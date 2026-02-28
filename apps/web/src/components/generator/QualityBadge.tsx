'use client';

import { useState } from 'react';
import { ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';
import type { QualityReport } from '@/lib/quality/gates';
import { QualityPanel } from './QualityPanel';

interface QualityBadgeProps {
  report: QualityReport | null;
}

export function QualityBadge({ report }: QualityBadgeProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  if (!report) return null;

  const errorCount = report.results.filter((r) => !r.passed && r.severity === 'error').length;
  const warningCount = report.results.filter((r) => !r.passed && r.severity === 'warning').length;

  let icon: React.ReactNode;
  let label: string;
  let className: string;

  if (errorCount > 0) {
    icon = <XCircle className="h-4 w-4" />;
    label = 'Failed';
    className = 'text-red-400 border-red-800 bg-red-900/30 hover:bg-red-900/50';
  } else if (warningCount > 0) {
    icon = <AlertTriangle className="h-4 w-4" />;
    label = `${warningCount} warning${warningCount > 1 ? 's' : ''}`;
    className = 'text-yellow-400 border-yellow-800 bg-yellow-900/30 hover:bg-yellow-900/50';
  } else {
    icon = <ShieldCheck className="h-4 w-4" />;
    label = 'Passed';
    className = 'text-green-400 border-green-800 bg-green-900/30 hover:bg-green-900/50';
  }

  return (
    <>
      <button
        onClick={() => setPanelOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${className}`}
      >
        {icon}
        {label}
      </button>
      {panelOpen && <QualityPanel report={report} open={panelOpen} onOpenChange={setPanelOpen} />}
    </>
  );
}
