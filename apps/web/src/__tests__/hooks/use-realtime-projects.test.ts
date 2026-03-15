import { renderHook } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRealtimeProjects } from '@/hooks/use-realtime-projects';

type PostgresChangeCallback = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
}) => void;

let capturedCallback: PostgresChangeCallback | null = null;
const mockSubscribe = jest.fn();
const mockRemoveChannel = jest.fn();
const mockChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: mockSubscribe.mockReturnThis(),
};

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    channel: jest.fn((name: string) => {
      void name;
      return mockChannel;
    }),
    removeChannel: mockRemoveChannel,
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  capturedCallback = null;
  mockChannel.on.mockImplementation(
    (_event: string, _filter: unknown, cb: PostgresChangeCallback) => {
      capturedCallback = cb;
      return mockChannel;
    }
  );
});

describe('useRealtimeProjects', () => {
  it('subscribes to projects-changes channel on mount', () => {
    const { wrapper } = createWrapper();
    renderHook(() => useRealtimeProjects(), { wrapper });

    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'projects' },
      expect.any(Function)
    );
    expect(mockSubscribe).toHaveBeenCalled();
  });

  it('invalidates projects query on INSERT', () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useRealtimeProjects(), { wrapper });

    capturedCallback!({ eventType: 'INSERT', new: {}, old: {} });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['projects'] });
  });

  it('sets query data and invalidates on UPDATE', () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const setDataSpy = jest.spyOn(queryClient, 'setQueryData');

    renderHook(() => useRealtimeProjects(), { wrapper });

    const updatedProject = { id: 'proj-1', name: 'Updated Project' };
    capturedCallback!({ eventType: 'UPDATE', new: updatedProject, old: {} });

    expect(setDataSpy).toHaveBeenCalledWith(['projects', 'proj-1'], updatedProject);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['projects'] });
  });

  it('invalidates projects query on DELETE', () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useRealtimeProjects(), { wrapper });

    capturedCallback!({ eventType: 'DELETE', new: {}, old: { id: 'proj-1' } });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['projects'] });
  });

  it('removes channel on unmount', () => {
    const { wrapper } = createWrapper();
    const { unmount } = renderHook(() => useRealtimeProjects(), { wrapper });

    unmount();

    expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannel);
  });
});
