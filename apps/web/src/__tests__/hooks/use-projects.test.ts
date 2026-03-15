import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockSingle = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockGetUser = jest.fn();

const mockChain = {
  select: mockSelect,
  eq: mockEq,
  order: mockOrder,
  single: mockSingle,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
};

mockSelect.mockReturnValue(mockChain);
mockEq.mockReturnValue(mockChain);
mockInsert.mockReturnValue(mockChain);
mockUpdate.mockReturnValue(mockChain);
mockDelete.mockReturnValue(mockChain);

const mockFrom = jest.fn(() => mockChain);

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
    auth: { getUser: mockGetUser },
  }),
}));

import {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '@/hooks/use-projects';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useProjects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelect.mockReturnValue(mockChain);
    mockEq.mockReturnValue(mockChain);
    mockInsert.mockReturnValue(mockChain);
    mockUpdate.mockReturnValue(mockChain);
    mockDelete.mockReturnValue(mockChain);
    mockOrder.mockResolvedValue({ data: [], error: null });
  });

  it('fetches projects from supabase', async () => {
    const projects = [{ id: '1', name: 'Project A' }];
    mockOrder.mockResolvedValue({ data: projects, error: null });

    const { result } = renderHook(() => useProjects(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFrom).toHaveBeenCalledWith('projects');
    expect(result.current.data).toEqual(projects);
  });

  it('handles supabase error', async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const { result } = renderHook(() => useProjects(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeTruthy();
  });
});

describe('useProject', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSingle.mockResolvedValue({ data: null, error: null });
  });

  it('fetches single project by id', async () => {
    const project = { id: 'proj-1', name: 'Project A' };
    mockSingle.mockResolvedValue({ data: project, error: null });

    const { result } = renderHook(() => useProject('proj-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(project);
  });

  it('is disabled when id is empty', () => {
    const { result } = renderHook(() => useProject(''), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useCreateProject', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    mockSingle.mockResolvedValue({ data: { id: 'new-proj' }, error: null });
    mockInsert.mockReturnValue({ select: jest.fn().mockReturnValue({ single: mockSingle }) });
  });

  it('creates a project with user id', async () => {
    const { result } = renderHook(() => useCreateProject(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ name: 'New Project', description: 'desc' });
    });

    expect(mockGetUser).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalled();
  });
});

describe('useUpdateProject', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSingle.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
    mockUpdate.mockReturnValue({
      eq: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: mockSingle }) }),
    });
  });

  it('updates a project', async () => {
    const { result } = renderHook(() => useUpdateProject(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ id: 'proj-1', name: 'Updated' });
    });

    expect(mockUpdate).toHaveBeenCalled();
  });
});

describe('useDeleteProject', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEq.mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ eq: mockEq });
  });

  it('deletes a project', async () => {
    const { result } = renderHook(() => useDeleteProject(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync('proj-1');
    });

    expect(mockDelete).toHaveBeenCalled();
  });
});
