'use client';

import { QueryProvider } from '@/components/providers/query-provider';
import { FeatureFlagProvider } from '@/lib/features/provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <FeatureFlagProvider>{children}</FeatureFlagProvider>
    </QueryProvider>
  );
}
