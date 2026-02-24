'use client';

import { useMemo } from 'react';
import type { FeatureFlagName } from '@/lib/features/types';
import { getFeatureFlag } from '@/lib/features/flags';
import { useFeatureFlagContext } from '@/lib/features/provider';

export function useFeatureFlag(name: FeatureFlagName): boolean {
  const { flags } = useFeatureFlagContext();
  const centralizedEnabled = getFeatureFlag('ENABLE_CENTRALIZED_FEATURE_FLAGS');

  return useMemo(() => {
    if (centralizedEnabled && name in flags) {
      return flags[name];
    }
    return getFeatureFlag(name);
  }, [centralizedEnabled, flags, name]);
}

export function useFeatureFlags(
  names: FeatureFlagName[]
): Partial<Record<FeatureFlagName, boolean>> {
  const { flags } = useFeatureFlagContext();
  const centralizedEnabled = getFeatureFlag('ENABLE_CENTRALIZED_FEATURE_FLAGS');
  const serializedKey = names.slice().sort().join('|');

  return useMemo(() => {
    if (names.length === 0 || serializedKey === '') return {};

    const result: Partial<Record<FeatureFlagName, boolean>> = {};
    for (const name of names) {
      if (centralizedEnabled && name in flags) {
        result[name] = flags[name];
      } else {
        result[name] = getFeatureFlag(name);
      }
    }
    return result;
  }, [centralizedEnabled, flags, serializedKey, names]);
}
