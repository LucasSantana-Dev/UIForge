import {
  DEFAULT_FEATURE_FLAGS,
  FEATURE_FLAGS,
  getFeatureFlag,
  getAllFeatureFlags,
  isFeatureEnabled,
} from '@/lib/features/flags';

describe('Feature Flags', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('DEFAULT_FEATURE_FLAGS', () => {
    it('should have all 21 flags defined', () => {
      expect(Object.keys(DEFAULT_FEATURE_FLAGS)).toHaveLength(23);
    });

    it('should have auth flags enabled by default', () => {
      expect(DEFAULT_FEATURE_FLAGS.ENABLE_GOOGLE_SSO).toBe(true);
      expect(DEFAULT_FEATURE_FLAGS.ENABLE_GITHUB_SSO).toBe(true);
      expect(DEFAULT_FEATURE_FLAGS.ENABLE_EMAIL_SIGNUP).toBe(true);
    });

    it('should have billing flags disabled by default', () => {
      expect(DEFAULT_FEATURE_FLAGS.ENABLE_STRIPE_BILLING).toBe(false);
      expect(DEFAULT_FEATURE_FLAGS.ENABLE_USAGE_LIMITS).toBe(false);
    });

    it('should have beta features disabled by default', () => {
      expect(DEFAULT_FEATURE_FLAGS.ENABLE_BETA_FEATURES).toBe(false);
      expect(DEFAULT_FEATURE_FLAGS.ENABLE_MAINTENANCE_MODE).toBe(false);
    });
  });

  describe('FEATURE_FLAGS array', () => {
    it('should have all 19 flag entries', () => {
      expect(FEATURE_FLAGS).toHaveLength(23);
    });

    it('should have required fields on each entry', () => {
      for (const flag of FEATURE_FLAGS) {
        expect(flag).toHaveProperty('name');
        expect(flag).toHaveProperty('enabled');
        expect(flag).toHaveProperty('description');
        expect(flag).toHaveProperty('category');
        expect(typeof flag.name).toBe('string');
        expect(typeof flag.enabled).toBe('boolean');
        expect(typeof flag.description).toBe('string');
      }
    });

    it('should match DEFAULT_FEATURE_FLAGS values', () => {
      for (const flag of FEATURE_FLAGS) {
        expect(flag.enabled).toBe(DEFAULT_FEATURE_FLAGS[flag.name]);
      }
    });
  });

  describe('getFeatureFlag', () => {
    it('should return default value when no env var set', () => {
      delete process.env.NEXT_PUBLIC_ENABLE_GOOGLE_SSO;
      delete process.env.NEXT_PUBLIC_ENABLE_STRIPE_BILLING;
      expect(getFeatureFlag('ENABLE_GOOGLE_SSO')).toBe(true);
      expect(getFeatureFlag('ENABLE_STRIPE_BILLING')).toBe(false);
    });

    it('should return true when env var is "true"', () => {
      process.env.NEXT_PUBLIC_ENABLE_STRIPE_BILLING = 'true';
      expect(getFeatureFlag('ENABLE_STRIPE_BILLING')).toBe(true);
    });

    it('should return false when env var is not "true"', () => {
      process.env.NEXT_PUBLIC_ENABLE_GOOGLE_SSO = 'false';
      expect(getFeatureFlag('ENABLE_GOOGLE_SSO')).toBe(false);
    });

    it('should return false for empty string env var', () => {
      process.env.NEXT_PUBLIC_ENABLE_DARK_MODE = '';
      expect(getFeatureFlag('ENABLE_DARK_MODE')).toBe(false);
    });
  });

  describe('getAllFeatureFlags', () => {
    it('should return all flags with defaults', () => {
      delete process.env.NEXT_PUBLIC_ENABLE_STRIPE_BILLING;
      delete process.env.NEXT_PUBLIC_ENABLE_USAGE_LIMITS;
      const flags = getAllFeatureFlags();
      expect(Object.keys(flags)).toHaveLength(23);
      expect(flags.ENABLE_GOOGLE_SSO).toBe(true);
      expect(flags.ENABLE_STRIPE_BILLING).toBe(false);
    });

    it('should respect env var overrides', () => {
      process.env.NEXT_PUBLIC_ENABLE_STRIPE_BILLING = 'true';
      const flags = getAllFeatureFlags();
      expect(flags.ENABLE_STRIPE_BILLING).toBe(true);
    });
  });

  describe('isFeatureEnabled', () => {
    it('should delegate to getFeatureFlag', () => {
      expect(isFeatureEnabled('ENABLE_GOOGLE_SSO')).toBe(true);
      expect(isFeatureEnabled('ENABLE_MAINTENANCE_MODE')).toBe(false);
    });
  });
});
