'use client';

import type { ReactNode } from 'react';
import type { FeatureFlagName } from '@/lib/features/types';
import { useFeatureFlag } from '@/hooks/use-feature-flag';

interface FeatureFlagProps {
  name: FeatureFlagName;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render content based on feature flag
 */
export function FeatureFlag({ name, children, fallback = null }: FeatureFlagProps) {
  const isEnabled = useFeatureFlag(name);

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component to show content when feature is disabled
 */
export function FeatureFlagDisabled({ name, children }: Omit<FeatureFlagProps, 'fallback'>) {
  const isEnabled = useFeatureFlag(name);

  if (isEnabled) {
    return null;
  }

  return <>{children}</>;
}
