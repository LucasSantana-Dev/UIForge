import type { FeatureFlagName, FeatureFlag } from './types';

// Default feature flags - can be overridden by environment variables
export const DEFAULT_FEATURE_FLAGS: Record<FeatureFlagName, boolean> = {
  ENABLE_GOOGLE_SSO: true,
  ENABLE_GITHUB_SSO: true,
  ENABLE_EMAIL_SIGNUP: true,
  ENABLE_COMPONENT_GENERATION: true,
  ENABLE_PROJECT_THUMBNAILS: true,
  ENABLE_REALTIME_UPDATES: true,
  ENABLE_DARK_MODE: true,
  ENABLE_ANALYTICS: false,
  ENABLE_MAINTENANCE_MODE: false,
  ENABLE_BETA_FEATURES: false,
  ENABLE_GITHUB_APP: false,
  ENABLE_QUALITY_GATES: false,
  ENABLE_MULTI_LLM: false,
};

// Feature flag metadata
export const FEATURE_FLAGS: FeatureFlag[] = [
  {
    name: 'ENABLE_GOOGLE_SSO',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_GOOGLE_SSO,
    description: 'Allow users to sign in with Google OAuth',
    category: 'auth',
  },
  {
    name: 'ENABLE_GITHUB_SSO',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_GITHUB_SSO,
    description: 'Allow users to sign in with GitHub OAuth',
    category: 'auth',
  },
  {
    name: 'ENABLE_EMAIL_SIGNUP',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_EMAIL_SIGNUP,
    description: 'Allow users to sign up with email and password',
    category: 'auth',
  },
  {
    name: 'ENABLE_COMPONENT_GENERATION',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_COMPONENT_GENERATION,
    description: 'Enable AI-powered component generation',
    category: 'generation',
  },
  {
    name: 'ENABLE_PROJECT_THUMBNAILS',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_PROJECT_THUMBNAILS,
    description: 'Allow uploading project thumbnail images',
    category: 'storage',
  },
  {
    name: 'ENABLE_REALTIME_UPDATES',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_REALTIME_UPDATES,
    description: 'Enable real-time updates via Supabase Realtime',
    category: 'system',
  },
  {
    name: 'ENABLE_DARK_MODE',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_DARK_MODE,
    description: 'Allow users to toggle dark mode',
    category: 'ui',
  },
  {
    name: 'ENABLE_ANALYTICS',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_ANALYTICS,
    description: 'Track user analytics and usage metrics',
    category: 'analytics',
  },
  {
    name: 'ENABLE_MAINTENANCE_MODE',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_MAINTENANCE_MODE,
    description: 'Enable maintenance mode (blocks all access)',
    category: 'system',
  },
  {
    name: 'ENABLE_BETA_FEATURES',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_BETA_FEATURES,
    description: 'Enable experimental beta features',
    category: 'system',
  },
  {
    name: 'ENABLE_GITHUB_APP',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_GITHUB_APP,
    description: 'Enable GitHub App integration for repo linking',
    category: 'integration',
  },
  {
    name: 'ENABLE_QUALITY_GATES',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_QUALITY_GATES,
    description: 'Run quality checks before PR creation',
    category: 'quality',
  },
  {
    name: 'ENABLE_MULTI_LLM',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_MULTI_LLM,
    description: 'Allow selecting between AI providers',
    category: 'generation',
  },
];

/**
 * Get feature flag value from environment or default
 */
export function getFeatureFlag(name: FeatureFlagName): boolean {
  // Check environment variable first
  const envKey = `NEXT_PUBLIC_${name}`;
  const envValue = process.env[envKey];

  if (envValue !== undefined) {
    return envValue === 'true';
  }

  // Fall back to default
  return DEFAULT_FEATURE_FLAGS[name];
}

/**
 * Get all feature flags with current values
 */
export function getAllFeatureFlags(): Record<FeatureFlagName, boolean> {
  const flags: Partial<Record<FeatureFlagName, boolean>> = {};

  for (const flag of FEATURE_FLAGS) {
    flags[flag.name] = getFeatureFlag(flag.name);
  }

  return flags as Record<FeatureFlagName, boolean>;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(name: FeatureFlagName): boolean {
  return getFeatureFlag(name);
}
