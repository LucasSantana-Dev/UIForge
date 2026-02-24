'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { FeatureFlagName } from './types';
import { DEFAULT_FEATURE_FLAGS, getFeatureFlag } from './flags';
import { fetchFlags, clearFlagCache } from './client';

interface FeatureFlagContextValue {
  flags: Record<FeatureFlagName, boolean>;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  flags: DEFAULT_FEATURE_FLAGS,
  isLoading: false,
  refresh: async () => {},
});

const POLL_INTERVAL = 30_000;

interface FeatureFlagProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export function FeatureFlagProvider({ children, userId }: FeatureFlagProviderProps) {
  const [flags, setFlags] = useState(DEFAULT_FEATURE_FLAGS);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const centralizedEnabled = getFeatureFlag('ENABLE_CENTRALIZED_FEATURE_FLAGS');

  const refresh = useCallback(async () => {
    if (!centralizedEnabled) return;

    setIsLoading(true);
    try {
      const resolved = await fetchFlags(userId);
      setFlags(resolved);
    } finally {
      setIsLoading(false);
    }
  }, [centralizedEnabled, userId]);

  useEffect(() => {
    if (!centralizedEnabled) return;

    refresh();

    intervalRef.current = setInterval(() => {
      clearFlagCache();
      refresh();
    }, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [centralizedEnabled, refresh]);

  return (
    <FeatureFlagContext.Provider value={{ flags, isLoading, refresh }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlagContext() {
  return useContext(FeatureFlagContext);
}
