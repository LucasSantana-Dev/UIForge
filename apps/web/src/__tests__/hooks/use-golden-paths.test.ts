import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

const mockFetch = jest.fn();

beforeEach(() => {
  Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });
  mockFetch.mockReset();
});

import {
  useGoldenPaths,
  useGoldenPath,
  useCreateGoldenPath,
  useDeleteGoldenPath,
  useScaffoldProject,
} from '@/hooks/use-golden-paths';

describe('useGoldenPaths', () => {
  it('fetches list of golden paths', async () => {
    const goldenPaths = [{ id: 'gp-1', name: 'React App', slug: 'react-app' }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: goldenPaths }),
    });

    const { result } = renderHook(() => useGoldenPaths(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(goldenPaths);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/golden-paths'));
  });

  it('passes filter params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const { result } = renderHook(() => useGoldenPaths({ framework: 'react' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('framework=react'));
  });
});

describe('useGoldenPath', () => {
  it('fetches single golden path by id', async () => {
    const goldenPath = { id: 'gp-1', name: 'React App' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: goldenPath }),
    });

    const { result } = renderHook(() => useGoldenPath('gp-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(goldenPath);
  });

  it('is disabled when id is empty', () => {
    const { result } = renderHook(() => useGoldenPath(''), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useCreateGoldenPath', () => {
  it('creates a golden path via POST', async () => {
    const goldenPath = { id: 'gp-2', name: 'Vue App' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ goldenPath }),
    });

    const { result } = renderHook(() => useCreateGoldenPath(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({
        name: 'Vue App',
        slug: 'vue-app',
        description: 'Vue template',
      });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/golden-paths',
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('useDeleteGoldenPath', () => {
  it('deletes a golden path via DELETE', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useDeleteGoldenPath(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync('gp-1');
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/golden-paths/gp-1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

describe('useScaffoldProject', () => {
  it('scaffolds a project via POST', async () => {
    const project = { id: 'proj-1', name: 'My Vue App' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ project }),
    });

    const { result } = renderHook(() => useScaffoldProject(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({
        goldenPathId: 'gp-1',
        projectName: 'My Vue App',
        parameters: { region: 'us-east-1' },
      });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/golden-paths/scaffold',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          golden_path_id: 'gp-1',
          project_name: 'My Vue App',
          parameters: { region: 'us-east-1' },
        }),
      })
    );
  });
});
