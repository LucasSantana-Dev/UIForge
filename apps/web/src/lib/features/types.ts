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
  | 'ENABLE_BETA_FEATURES';

export interface FeatureFlag {
  name: FeatureFlagName;
  enabled: boolean;
  description: string;
  category: 'auth' | 'ui' | 'generation' | 'storage' | 'analytics' | 'system';
}

export interface FeatureFlagsConfig {
  [key: string]: boolean;
}
