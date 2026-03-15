import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSubscription } from '@/hooks/use-subscription';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useSubscription', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading state initially', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ subscription: null, usage: null }),
    });

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('fetches subscription data from /api/usage/current', async () => {
    const mockData = {
      subscription: { plan: 'pro', status: 'active' },
      usage: { generations_used: 5, generations_limit: 100 },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockFetch).toHaveBeenCalledWith('/api/usage/current');
    expect(result.current.subscription).toEqual(mockData.subscription);
    expect(result.current.usage).toEqual(mockData.usage);
  });

  it('computes isPro correctly for pro plan', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        subscription: { plan: 'pro', status: 'active' },
        usage: {},
      }),
    });

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isPro).toBe(true);
    expect(result.current.isEnterprise).toBe(false);
  });

  it('computes isEnterprise correctly for enterprise plan', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        subscription: { plan: 'enterprise', status: 'active' },
        usage: {},
      }),
    });

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isEnterprise).toBe(true);
  });

  it('returns error state on fetch failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    });

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeTruthy();
  });

  it('exposes refetch function', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ subscription: null, usage: null }),
    });

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(typeof result.current.refetch).toBe('function');
  });
});
