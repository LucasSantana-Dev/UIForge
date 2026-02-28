import type { FeatureFlagName, FeatureFlag } from './types';

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
  ENABLE_GITHUB_APP: true,
  ENABLE_QUALITY_GATES: false,
  ENABLE_MULTI_LLM: true,
  ENABLE_RESEND_EMAILS: false,
  ENABLE_CENTRALIZED_FEATURE_FLAGS: false,
  ENABLE_STRIPE_BILLING: false,
  ENABLE_USAGE_LIMITS: false,
  ENABLE_MCP_GATEWAY: false,
  ENABLE_DESIGN_CONTEXT: true,
  ENABLE_PROMPT_AUTOCOMPLETE: true,
  ENABLE_CODE_INTELLISENSE: true,
  ENABLE_CONVERSATION_MODE: false,
  ENABLE_DESIGN_ANALYSIS: false,
};

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
  {
    name: 'ENABLE_RESEND_EMAILS',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_RESEND_EMAILS,
    description: 'Send transactional emails via Resend SDK',
    category: 'email',
  },
  {
    name: 'ENABLE_CENTRALIZED_FEATURE_FLAGS',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_CENTRALIZED_FEATURE_FLAGS,
    description: 'Use database-backed feature flags instead of env vars',
    category: 'system',
  },
  {
    name: 'ENABLE_STRIPE_BILLING',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_STRIPE_BILLING,
    description: 'Enable Stripe billing and subscription management',
    category: 'billing',
  },
  {
    name: 'ENABLE_USAGE_LIMITS',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_USAGE_LIMITS,
    description: 'Enforce per-plan usage limits on generations and projects',
    category: 'billing',
  },
  {
    name: 'ENABLE_MCP_GATEWAY',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_MCP_GATEWAY,
    description: 'Route AI generation through MCP gateway instead of direct Gemini',
    category: 'generation',
  },
  {
    name: 'ENABLE_DESIGN_CONTEXT',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_DESIGN_CONTEXT,
    description: 'Show structured design context inputs below the prompt textarea',
    category: 'generation',
  },
  {
    name: 'ENABLE_PROMPT_AUTOCOMPLETE',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_PROMPT_AUTOCOMPLETE,
    description: 'Show prompt suggestions from past generations and templates',
    category: 'generation',
  },
  {
    name: 'ENABLE_CODE_INTELLISENSE',
    enabled: DEFAULT_FEATURE_FLAGS.ENABLE_CODE_INTELLISENSE,
    description: 'Framework-aware code snippets in the Monaco editor',
    category: 'generation',
  },
];

export function getFeatureFlag(name: FeatureFlagName): boolean {
  const envKey = `NEXT_PUBLIC_${name}`;
  const envValue = process.env[envKey];

  if (envValue !== undefined) {
    return envValue === 'true';
  }

  return DEFAULT_FEATURE_FLAGS[name];
}

export function getAllFeatureFlags(): Record<FeatureFlagName, boolean> {
  const flags: Partial<Record<FeatureFlagName, boolean>> = {};

  for (const flag of FEATURE_FLAGS) {
    flags[flag.name] = getFeatureFlag(flag.name);
  }

  return flags as Record<FeatureFlagName, boolean>;
}

export function isFeatureEnabled(name: FeatureFlagName): boolean {
  return getFeatureFlag(name);
}
