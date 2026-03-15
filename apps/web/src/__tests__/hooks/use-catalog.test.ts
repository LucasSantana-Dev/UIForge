import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useCatalog,
  useCatalogGraph,
  useCatalogStats,
  useCatalogDiscovery,
  useImportDiscovered,
} from '@/hooks/use-catalog';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

const mockFetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });
});

describe('useCatalog', () => {
  it('fetches catalog entries', async () => {
    const mockData = {
      entries: [{ id: '1', name: 'Service A' }],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useCatalog(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledWith('/api/catalog?');
  });

  it('passes filters as query params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entries: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }),
    });

    const { result } = renderHook(() => useCatalog({ search: 'api', type: 'service', page: 2 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('search=api');
    expect(url).toContain('type=service');
    expect(url).toContain('page=2');
  });

  it('throws on error response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    const { result } = renderHook(() => useCatalog(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useCatalogGraph', () => {
  it('fetches catalog graph', async () => {
    const mockGraph = { nodes: [], edges: [] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGraph,
    });

    const { result } = renderHook(() => useCatalogGraph(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockGraph);
    expect(mockFetch).toHaveBeenCalledWith('/api/catalog/graph');
  });

  it('throws on error response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    const { result } = renderHook(() => useCatalogGraph(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useCatalogStats', () => {
  it('fetches catalog stats', async () => {
    const mockStats = { total: 10, production: 5, servicesAndApis: 3, libsAndComponents: 2 };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    const { result } = renderHook(() => useCatalogStats(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockStats);
    expect(mockFetch).toHaveBeenCalledWith('/api/catalog/stats');
  });
});

describe('useCatalogDiscovery', () => {
  it('is disabled by default (enabled: false)', () => {
    const { result } = renderHook(() => useCatalogDiscovery(), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('useImportDiscovered', () => {
  it('POSTs to /api/catalog/discover', async () => {
    const mockResult = { imported: 2 };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult,
    });

    const { result } = renderHook(() => useImportDiscovered(), { wrapper: createWrapper() });

    let returnedData: typeof mockResult | undefined;
    await act(async () => {
      returnedData = await result.current.mutateAsync([
        { installationId: 1, fullName: 'org/repo' },
      ]);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/catalog/discover',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ repos: [{ installationId: 1, fullName: 'org/repo' }] }),
      })
    );
    expect(returnedData).toEqual(mockResult);
  });

  it('throws on error response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    const { result } = renderHook(() => useImportDiscovered(), { wrapper: createWrapper() });

    await act(async () => {
      await expect(
        result.current.mutateAsync([{ installationId: 1, fullName: 'org/repo' }])
      ).rejects.toThrow('Failed to import');
    });
  });
});
