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

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
  }),
}));

import {
  useEntityPermissions,
  useGrantPermission,
  useRevokePermission,
} from '@/hooks/use-entity-permissions';

describe('useEntityPermissions', () => {
  it('fetches permissions for entity', async () => {
    const permissions = [{ id: 'perm-1', permission: 'read', userId: 'user-1' }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ permissions }),
    });

    const { result } = renderHook(() => useEntityPermissions('component', 'entity-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ permissions });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/permissions?entityType=component&entityId=entity-1')
    );
  });

  it('is disabled when entityType is empty', () => {
    const { result } = renderHook(() => useEntityPermissions('', 'entity-1'), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('is disabled when entityId is empty', () => {
    const { result } = renderHook(() => useEntityPermissions('component', ''), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('handles fetch error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Forbidden' } }),
    });

    const { result } = renderHook(() => useEntityPermissions('component', 'entity-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useGrantPermission', () => {
  it('grants a permission via POST', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ permission: { id: 'perm-2', permission: 'write' } }),
    });

    const { result } = renderHook(() => useGrantPermission('component', 'entity-1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ permission: 'write', userId: 'user-2' });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/permissions',
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('useRevokePermission', () => {
  it('revokes a permission via DELETE', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useRevokePermission('component', 'entity-1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('perm-1');
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/permissions'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
