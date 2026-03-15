import { render, screen } from '@testing-library/react';
import { FeatureFlagProvider, useFeatureFlagContext } from '@/lib/features/provider';
import { DEFAULT_FEATURE_FLAGS, getFeatureFlag } from '@/lib/features/flags';
import { fetchFlags } from '@/lib/features/client';

jest.mock('@/lib/features/client', () => ({
  fetchFlags: jest.fn(),
  clearFlagCache: jest.fn(),
}));

jest.mock('@/lib/features/flags', () => {
  const actual = jest.requireActual('@/lib/features/flags');
  return {
    ...actual,
    getFeatureFlag: jest.fn().mockReturnValue(false),
  };
});

const mockFetchFlags = fetchFlags as jest.MockedFunction<typeof fetchFlags>;
const mockGetFeatureFlag = getFeatureFlag as jest.MockedFunction<typeof getFeatureFlag>;

function TestConsumer() {
  const { flags, isLoading } = useFeatureFlagContext();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="flags">{JSON.stringify(flags)}</span>
    </div>
  );
}

describe('FeatureFlagProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockGetFeatureFlag.mockReturnValue(false);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('provides default flags when centralized flags are disabled', () => {
    render(
      <FeatureFlagProvider>
        <TestConsumer />
      </FeatureFlagProvider>
    );

    const flagsEl = screen.getByTestId('flags');
    expect(JSON.parse(flagsEl.textContent!)).toEqual(DEFAULT_FEATURE_FLAGS);
    expect(mockFetchFlags).not.toHaveBeenCalled();
  });

  it('renders children', () => {
    render(
      <FeatureFlagProvider>
        <div data-testid="child">Hello</div>
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('shows not loading when centralized flags are disabled', () => {
    render(
      <FeatureFlagProvider>
        <TestConsumer />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });
});

describe('FeatureFlagProvider — centralized flags enabled', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockGetFeatureFlag.mockReturnValue(true);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fetches flags on mount when centralized flags enabled', async () => {
    const resolved = { ...DEFAULT_FEATURE_FLAGS, ENABLE_GALLERY: true } as Record<
      import('@/lib/features/types').FeatureFlagName,
      boolean
    >;
    mockFetchFlags.mockResolvedValue(resolved);

    render(
      <FeatureFlagProvider userId="user-1">
        <TestConsumer />
      </FeatureFlagProvider>
    );

    // Wait for async fetchFlags to resolve
    await screen.findByTestId('flags');
    expect(mockFetchFlags).toHaveBeenCalledWith('user-1');
  });

  it('polls flags every 30s and clears cache', async () => {
    const { clearFlagCache } = require('@/lib/features/client');
    mockFetchFlags.mockResolvedValue(DEFAULT_FEATURE_FLAGS);

    render(
      <FeatureFlagProvider>
        <TestConsumer />
      </FeatureFlagProvider>
    );

    await screen.findByTestId('flags');
    expect(mockFetchFlags).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(30_000);
    await screen.findByTestId('flags');

    expect(clearFlagCache).toHaveBeenCalled();
    expect(mockFetchFlags).toHaveBeenCalledTimes(2);
  });

  it('clears polling interval on unmount', async () => {
    mockFetchFlags.mockResolvedValue(DEFAULT_FEATURE_FLAGS);
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { unmount } = render(
      <FeatureFlagProvider>
        <TestConsumer />
      </FeatureFlagProvider>
    );

    await screen.findByTestId('flags');
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});

describe('useFeatureFlagContext', () => {
  it('returns default context outside provider', () => {
    function Bare() {
      const ctx = useFeatureFlagContext();
      return <span data-testid="flags">{JSON.stringify(ctx.flags)}</span>;
    }

    render(<Bare />);
    expect(JSON.parse(screen.getByTestId('flags').textContent!)).toEqual(DEFAULT_FEATURE_FLAGS);
  });

  it('exposes refresh function from context', () => {
    function RefreshConsumer() {
      const { refresh } = useFeatureFlagContext();
      return <span data-testid="refresh-type">{typeof refresh}</span>;
    }

    render(
      <FeatureFlagProvider>
        <RefreshConsumer />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('refresh-type')).toHaveTextContent('function');
  });
});
