'use client';

import { useMemo } from 'react';
import type { FeatureFlagName } from '@/lib/features/types';
import { getFeatureFlag } from '@/lib/features/flags';

/**
 * Hook to check if a feature flag is enabled
 * @param name - The feature flag name
 * @returns boolean indicating if the feature is enabled
 */
export function useFeatureFlag(name: FeatureFlagName): boolean {
  return useMemo(() => getFeatureFlag(name), [name]);
}

/**
 * Hook to get multiple feature flags at once
 * @param names - Array of feature flag names
 * @returns Object with feature flag values
 */
export function useFeatureFlags(
  names: FeatureFlagName[]
): Partial<Record<FeatureFlagName, boolean>> {
  // Create a stable key for memoization to handle inline arrays
  const serializedKey = names.slice().sort().join('|');

  return useMemo(() => {
    // Handle empty array
    if (names.length === 0 || serializedKey === '') {
      return {};
    }

    const flags: Partial<Record<FeatureFlagName, boolean>> = {};
    for (const name of names) {
      flags[name] = getFeatureFlag(name);
    }
    return flags;
  }, [serializedKey, names]);
}
