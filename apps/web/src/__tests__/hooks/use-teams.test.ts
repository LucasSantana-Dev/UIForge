import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useTeams,
  useTeam,
  useCreateTeam,
  useAddTeamMember,
  useUpdateMemberRole,
  useRemoveTeamMember,
} from '@/hooks/use-teams';

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

describe('useTeams', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches teams list', async () => {
    const teams = [{ id: '1', name: 'Team A', slug: 'team-a' }];
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => teams });

    const { result } = renderHook(() => useTeams(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFetch).toHaveBeenCalledWith('/api/teams');
    expect(result.current.data).toEqual(teams);
  });

  it('handles fetch error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) });

    const { result } = renderHook(() => useTeams(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeTruthy();
  });
});

describe('useTeam', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches single team by slug', async () => {
    const team = { id: '1', name: 'Team A', slug: 'team-a' };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => team });

    const { result } = renderHook(() => useTeam('team-a'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFetch).toHaveBeenCalledWith('/api/teams/team-a');
    expect(result.current.data).toEqual(team);
  });

  it('is disabled when slug is empty', () => {
    const { result } = renderHook(() => useTeam(''), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('useCreateTeam', () => {
  beforeEach(() => jest.clearAllMocks());

  it('posts to /api/teams', async () => {
    const newTeam = { id: '2', name: 'New Team', slug: 'new-team' };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => newTeam });

    const { result } = renderHook(() => useCreateTeam(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ name: 'New Team', slug: 'new-team' });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/teams',
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('useAddTeamMember', () => {
  beforeEach(() => jest.clearAllMocks());

  it('posts to /api/teams/[slug]/members', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

    const { result } = renderHook(() => useAddTeamMember('team-a'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ userId: 'user-1', role: 'member' });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('team-a'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('useUpdateMemberRole', () => {
  beforeEach(() => jest.clearAllMocks());

  it('patches member role', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

    const { result } = renderHook(() => useUpdateMemberRole('team-a'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ userId: 'user-1', role: 'admin' });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('team-a'),
      expect.objectContaining({ method: 'PATCH' })
    );
  });
});

describe('useRemoveTeamMember', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deletes team member', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

    const { result } = renderHook(() => useRemoveTeamMember('team-a'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('user-1');
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('team-a'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
