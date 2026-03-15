import { renderHook } from '@testing-library/react';
import { useFeatureFlag, useFeatureFlags } from '@/hooks/use-feature-flag';

const mockGetFeatureFlag = jest.fn();
const mockUseFeatureFlagContext = jest.fn();

jest.mock('@/lib/features/flags', () => ({
  getFeatureFlag: (...args: unknown[]) => mockGetFeatureFlag(...args),
}));

jest.mock('@/lib/features/provider', () => ({
  useFeatureFlagContext: () => mockUseFeatureFlagContext(),
}));

describe('useFeatureFlag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFeatureFlagContext.mockReturnValue({ flags: {} });
  });

  it('returns value from getFeatureFlag when centralized is disabled', () => {
    // ENABLE_CENTRALIZED_FEATURE_FLAGS = false, ENABLE_USAGE_LIMITS = true
    mockGetFeatureFlag.mockImplementation((name: string) => {
      if (name === 'ENABLE_CENTRALIZED_FEATURE_FLAGS') return false;
      if (name === 'ENABLE_USAGE_LIMITS') return true;
      return false;
    });

    const { result } = renderHook(() => useFeatureFlag('ENABLE_USAGE_LIMITS'));

    expect(result.current).toBe(true);
  });

  it('returns value from context when centralized is enabled and flag exists', () => {
    mockUseFeatureFlagContext.mockReturnValue({
      flags: { ENABLE_USAGE_LIMITS: false },
    });
    mockGetFeatureFlag.mockImplementation((name: string) => {
      if (name === 'ENABLE_CENTRALIZED_FEATURE_FLAGS') return true;
      return true;
    });

    const { result } = renderHook(() => useFeatureFlag('ENABLE_USAGE_LIMITS'));

    expect(result.current).toBe(false);
  });

  it('falls back to getFeatureFlag when centralized enabled but flag not in context', () => {
    mockUseFeatureFlagContext.mockReturnValue({ flags: {} });
    mockGetFeatureFlag.mockImplementation((name: string) => {
      if (name === 'ENABLE_CENTRALIZED_FEATURE_FLAGS') return true;
      if (name === 'ENABLE_USAGE_LIMITS') return true;
      return false;
    });

    const { result } = renderHook(() => useFeatureFlag('ENABLE_USAGE_LIMITS'));

    expect(result.current).toBe(true);
  });
});

describe('useFeatureFlags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFeatureFlagContext.mockReturnValue({ flags: {} });
    mockGetFeatureFlag.mockImplementation((name: string) => {
      if (name === 'ENABLE_CENTRALIZED_FEATURE_FLAGS') return false;
      if (name === 'ENABLE_USAGE_LIMITS') return true;
      if (name === 'ENABLE_STRIPE_BILLING') return false;
      return false;
    });
  });

  it('returns partial record for requested flag names', () => {
    const { result } = renderHook(() =>
      useFeatureFlags(['ENABLE_USAGE_LIMITS', 'ENABLE_STRIPE_BILLING'])
    );

    expect(result.current).toEqual({
      ENABLE_USAGE_LIMITS: true,
      ENABLE_STRIPE_BILLING: false,
    });
  });

  it('returns empty object for empty names array', () => {
    const { result } = renderHook(() => useFeatureFlags([]));
    expect(result.current).toEqual({});
  });
});
