import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useGenerations,
  useGeneration,
  useCreateGeneration,
  useUpdateGeneration,
  useDeleteGeneration,
} from '@/hooks/use-generations';

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
global.fetch = mockFetch;

describe('useGenerations', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches generations for a project', async () => {
    const generations = [{ id: 'gen-1', project_id: 'proj-1' }];
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ generations }) });

    const { result } = renderHook(() => useGenerations('proj-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('proj-1'));
    expect(result.current.data).toEqual(generations);
  });

  it('is disabled when projectId is empty', () => {
    const { result } = renderHook(() => useGenerations(''), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('useGeneration', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches single generation by id', async () => {
    const generation = { id: 'gen-1', project_id: 'proj-1' };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ generation }) });

    const { result } = renderHook(() => useGeneration('gen-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(generation);
  });

  it('is disabled when id is empty', () => {
    const { result } = renderHook(() => useGeneration(''), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useCreateGeneration', () => {
  beforeEach(() => jest.clearAllMocks());

  it('posts to generations endpoint', async () => {
    const newGen = { id: 'gen-2', project_id: 'proj-1' };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ generation: newGen }) });

    const { result } = renderHook(() => useCreateGeneration(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({
        project_id: 'proj-1',
        prompt: 'test',
        component_name: 'Button',
        generated_code: '<button />',
        framework: 'react',
        typescript: true,
      });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('useUpdateGeneration', () => {
  beforeEach(() => jest.clearAllMocks());

  it('patches generation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ generation: { id: 'gen-1', project_id: 'proj-1' } }),
    });

    const { result } = renderHook(() => useUpdateGeneration('gen-1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ status: 'completed' });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('gen-1'),
      expect.objectContaining({ method: 'PATCH' })
    );
  });
});

describe('useDeleteGeneration', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deletes generation', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

    const { result } = renderHook(() => useDeleteGeneration(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ generationId: 'gen-1', projectId: 'proj-1' });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('gen-1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
