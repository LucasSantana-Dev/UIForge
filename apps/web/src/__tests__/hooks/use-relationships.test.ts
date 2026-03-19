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
  useRelationships,
  useCreateRelationship,
  useDeleteRelationship,
} from '@/hooks/use-relationships';

describe('useRelationships', () => {
  it('fetches relationships for an entity', async () => {
    const relationships = [
      { id: 'rel-1', sourceId: 'entity-1', targetId: 'entity-2', type: 'depends-on' },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ relationships }),
    });

    const { result } = renderHook(() => useRelationships('entity-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ relationships });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/catalog/entity-1/relationships')
    );
  });

  it('is disabled when entityId is empty', () => {
    const { result } = renderHook(() => useRelationships(''), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('handles fetch error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Not found' } }),
    });

    const { result } = renderHook(() => useRelationships('entity-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useCreateRelationship', () => {
  it('creates a relationship via POST', async () => {
    const relationship = {
      id: 'rel-2',
      sourceId: 'entity-1',
      targetId: 'entity-3',
      type: 'dependsOn',
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ relationship }),
    });

    const { result } = renderHook(() => useCreateRelationship(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({
        sourceId: 'entity-1',
        targetId: 'entity-3',
        type: 'dependsOn' as const,
        metadata: { note: 'test' },
      });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/catalog/entity-1/relationships',
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('useDeleteRelationship', () => {
  it('deletes a relationship via DELETE', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useDeleteRelationship(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ entityId: 'entity-1', relationshipId: 'rel-1' });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/catalog/entity-1/relationships?relationshipId=rel-1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
