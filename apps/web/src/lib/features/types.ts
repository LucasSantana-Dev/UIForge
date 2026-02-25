export type FeatureFlagName =
  | 'ENABLE_GOOGLE_SSO'
  | 'ENABLE_GITHUB_SSO'
  | 'ENABLE_EMAIL_SIGNUP'
  | 'ENABLE_COMPONENT_GENERATION'
  | 'ENABLE_PROJECT_THUMBNAILS'
  | 'ENABLE_REALTIME_UPDATES'
  | 'ENABLE_DARK_MODE'
  | 'ENABLE_ANALYTICS'
  | 'ENABLE_MAINTENANCE_MODE'
  | 'ENABLE_BETA_FEATURES'
  | 'ENABLE_GITHUB_APP'
  | 'ENABLE_QUALITY_GATES'
  | 'ENABLE_MULTI_LLM'
  | 'ENABLE_RESEND_EMAILS'
  | 'ENABLE_CENTRALIZED_FEATURE_FLAGS'
  | 'ENABLE_STRIPE_BILLING'
  | 'ENABLE_USAGE_LIMITS'
  | 'ENABLE_MCP_GATEWAY'
  | 'ENABLE_DESIGN_CONTEXT';

export type FeatureFlagCategory =
  | 'auth'
  | 'ui'
  | 'generation'
  | 'storage'
  | 'analytics'
  | 'system'
  | 'integration'
  | 'quality'
  | 'email'
  | 'billing';

export interface FeatureFlag {
  name: FeatureFlagName;
  enabled: boolean;
  description: string;
  category: FeatureFlagCategory;
}

export interface DbFeatureFlag {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  category: FeatureFlagCategory;
  scope: string[];
  enabled: boolean;
  enabled_for_users: string[];
}

export interface FeatureFlagChange {
  id: string;
  created_at: string;
  flag_id: string;
  changed_by: string | null;
  field: string;
  old_value: string | null;
  new_value: string | null;
}

export interface FeatureFlagsConfig {
  [key: string]: boolean;
}
