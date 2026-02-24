'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';

interface UpgradePromptProps {
  resource: string;
}

export function UpgradePrompt({ resource }: UpgradePromptProps) {
  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
      <div className="flex items-start gap-3">
        <Zap className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <div>
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            {resource} limit reached
          </h4>
          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
            Upgrade to Pro for more capacity and advanced features.
          </p>
          <Link
            href="/billing"
            className="mt-2 inline-block rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-700"
          >
            View plans
          </Link>
        </div>
      </div>
    </div>
  );
}
