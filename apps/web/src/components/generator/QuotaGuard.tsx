'use client';

import { UpgradePrompt } from '@/components/billing/UpgradePrompt';

interface UsageInfo {
  generations_count: number;
  generations_limit: number;
}

interface QuotaGuardProps {
  error: string | null;
  usage: UsageInfo | null;
  isQuotaExceeded: boolean;
}

export function QuotaGuard({ error, usage, isQuotaExceeded }: QuotaGuardProps) {
  return (
    <>
      {error &&
        (error.toLowerCase().includes('quota') ||
        error.toLowerCase().includes('limit reached') ? (
          <UpgradePrompt resource="Generation" />
        ) : (
          <div className="rounded-md border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
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
