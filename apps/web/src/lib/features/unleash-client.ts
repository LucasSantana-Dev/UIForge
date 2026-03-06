import type { FeatureFlagName } from './types';

interface UnleashConfig {
  url: string;
  clientKey: string;
  appName: string;
  refreshIntervalMs?: number;
}

interface UnleashToggle {
  name: string;
  enabled: boolean;
  variant?: { name: string; payload?: { type: string; value: string } };
}

let cachedToggles: Map<string, boolean> = new Map();
let lastFetch = 0;
const CACHE_TTL_MS = 30_000;

function getConfig(): UnleashConfig | null {
  const url = process.env.UNLEASH_PROXY_URL ?? process.env.NEXT_PUBLIC_UNLEASH_PROXY_URL;
  const clientKey = process.env.UNLEASH_CLIENT_KEY ?? process.env.NEXT_PUBLIC_UNLEASH_CLIENT_KEY;

  if (!url || !clientKey) return null;

  return {
    url: url.replace(/\/$/, ''),
    clientKey,
    appName: 'siza-webapp',
    refreshIntervalMs: CACHE_TTL_MS,
  };
}

async function refreshToggles(config: UnleashConfig): Promise<void> {
  try {
    const res = await fetch(`${config.url}/api/frontend`, {
      headers: {
        Authorization: config.clientKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) return;

    const data = await res.json();
    const toggles: UnleashToggle[] = data.toggles ?? [];

    cachedToggles = new Map(toggles.map((t) => [t.name, t.enabled]));
    lastFetch = Date.now();
  } catch {
    lastFetch = 0;
  }
}

export async function isUnleashEnabled(flagName: FeatureFlagName): Promise<boolean | null> {
  const config = getConfig();
  if (!config) return null;

  if (Date.now() - lastFetch > CACHE_TTL_MS) {
    await refreshToggles(config);
  }

  const namespacedKey = `siza.${flagName}`;
  if (cachedToggles.has(namespacedKey)) {
    return cachedToggles.get(namespacedKey)!;
  }
  if (cachedToggles.has(flagName)) {
    return cachedToggles.get(flagName)!;
  }

  return null;
}

export function isUnleashConfigured(): boolean {
  return getConfig() !== null;
}
