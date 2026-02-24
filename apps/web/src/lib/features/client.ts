import type { FeatureFlagName, DbFeatureFlag } from './types';
import { DEFAULT_FEATURE_FLAGS } from './flags';

const CACHE_KEY = 'siza:feature-flags';
const CACHE_TTL = 30_000;
const API_PATH = '/api/features/resolve';

interface CachedFlags {
  flags: Record<string, boolean>;
  timestamp: number;
}

function readCache(): Record<string, boolean> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const cached: CachedFlags = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) return null;

    return cached.flags;
  } catch {
    return null;
  }
}

function writeCache(flags: Record<string, boolean>) {
  try {
    const entry: CachedFlags = { flags, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage unavailable (SSR, quota exceeded)
  }
}

function resolveFlags(dbFlags: DbFeatureFlag[], userId?: string): Record<string, boolean> {
  const resolved: Record<string, boolean> = {};

  for (const flag of dbFlags) {
    const userEnabled = userId && flag.enabled_for_users?.includes(userId);
    resolved[flag.name] = flag.enabled || !!userEnabled;
  }

  return resolved;
}

export async function fetchFlags(userId?: string): Promise<Record<FeatureFlagName, boolean>> {
  const cached = readCache();
  if (cached) return cached as Record<FeatureFlagName, boolean>;

  try {
    const url = userId ? `${API_PATH}?userId=${userId}` : API_PATH;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const { data } = (await res.json()) as { data: DbFeatureFlag[] };
    const resolved = resolveFlags(data, userId);
    writeCache(resolved);

    return {
      ...DEFAULT_FEATURE_FLAGS,
      ...resolved,
    } as Record<FeatureFlagName, boolean>;
  } catch {
    return { ...DEFAULT_FEATURE_FLAGS };
  }
}

export function clearFlagCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // noop
  }
}
