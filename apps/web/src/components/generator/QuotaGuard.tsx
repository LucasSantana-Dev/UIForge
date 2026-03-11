'use client';

import { UpgradePrompt } from '@/components/billing/UpgradePrompt';
import { categorizeGenerationError } from '@/lib/errors/generation-errors';
import { AlertTriangle, Info, ShieldAlert, Wifi, Zap } from 'lucide-react';

interface UsageInfo {
  generations_count: number;
  generations_limit: number;
}

interface QuotaGuardProps {
  error: string | null;
  usage: UsageInfo | null;
  isQuotaExceeded: boolean;
}

const CATEGORY_ICONS = {
  'provider-capacity': AlertTriangle,
  'rate-limit': Zap,
  quota: AlertTriangle,
  auth: ShieldAlert,
  validation: Info,
  provider: AlertTriangle,
  network: Wifi,
  unknown: AlertTriangle,
} as const;

export function QuotaGuard({ error, usage, isQuotaExceeded }: QuotaGuardProps) {
  const errorInfo = error ? categorizeGenerationError(error) : null;
  const isQuotaError = errorInfo?.category === 'quota';

  return (
    <>
      {errorInfo &&
        (isQuotaError ? (
          <UpgradePrompt resource="Generation" />
        ) : (
          <GenerationErrorDisplay
            title={errorInfo.title}
            message={errorInfo.message}
            suggestion={errorInfo.suggestion}
            category={errorInfo.category}
          />
        ))}

      {isQuotaExceeded && !error && <UpgradePrompt resource="Generation" />}

      {usage && usage.generations_limit !== -1 && (
        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-md border border-surface-3">
          <span className="text-text-secondary">
            {usage.generations_count} / {usage.generations_limit} generations this month
          </span>
          {usage.generations_count >= usage.generations_limit * 0.8 &&
            usage.generations_count < usage.generations_limit && (
              <span className="text-yellow-400 font-medium">Nearing limit</span>
            )}
        </div>
      )}
    </>
  );
}

function GenerationErrorDisplay({
  title,
  message,
  suggestion,
  category,
}: {
  title: string;
  message: string;
  suggestion: string;
  category: keyof typeof CATEGORY_ICONS;
}) {
  const Icon = CATEGORY_ICONS[category];

  return (
    <div className="rounded-md border border-red-800/60 bg-red-900/15 px-4 py-3 text-sm">
      <div className="flex items-start gap-2.5">
        <Icon className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <p className="font-medium text-red-300">{title}</p>
          <p className="text-red-400/80 mt-0.5">{message}</p>
          <p className="text-text-secondary mt-1.5 text-xs">{suggestion}</p>
        </div>
      </div>
    </div>
  );
}
