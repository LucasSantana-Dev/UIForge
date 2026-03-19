import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useComponents,
  useComponent,
  useCreateComponent,
  useUpdateComponent,
  useDeleteComponent,
} from '@/hooks/use-components';

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

const mockComponent = {
  id: 'comp-1',
  project_id: 'proj-1',
  user_id: 'user-1',
  name: 'Button',
  component_type: 'ui',
  framework: 'react',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('useComponents', () => {
  it('fetches components for a project', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ components: [mockComponent] }),
    });

    const { result } = renderHook(() => useComponents('proj-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([mockComponent]);
    expect(mockFetch).toHaveBeenCalledWith('/api/components?project_id=proj-1');
  });

  it('is disabled when projectId is undefined', () => {
    const { result } = renderHook(() => useComponents(undefined), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws on error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Not found' } }),
    });

    const { result } = renderHook(() => useComponents('proj-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as Error).message).toBe('Not found');
  });
});

describe('useComponent', () => {
  it('fetches a single component', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ component: { ...mockComponent, code_content: '<Button />' } }),
    });

    const { result } = renderHook(() => useComponent('comp-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.code_content).toBe('<Button />');
    expect(mockFetch).toHaveBeenCalledWith('/api/components/comp-1');
  });

  it('is disabled when componentId is undefined', () => {
    const { result } = renderHook(() => useComponent(undefined), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('useCreateComponent', () => {
  it('POSTs to /api/components', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ component: mockComponent }),
    });

    const { result } = renderHook(() => useCreateComponent(), { wrapper: createWrapper() });

    const input = {
      project_id: 'proj-1',
      name: 'Button',
      component_type: 'ui',
      framework: 'react',
      code_content: '<Button />',
    };

    let returnedData: typeof mockComponent | undefined;
    await act(async () => {
      returnedData = await result.current.mutateAsync(input);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/components',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(input),
      })
    );
    expect(returnedData).toEqual(mockComponent);
  });

  it('throws on error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Validation failed' } }),
    });

    const { result } = renderHook(() => useCreateComponent(), { wrapper: createWrapper() });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          project_id: 'proj-1',
          name: 'Button',
          component_type: 'ui',
          framework: 'react',
          code_content: '<Button />',
        })
      ).rejects.toThrow('Validation failed');
    });
  });
});

describe('useUpdateComponent', () => {
  it('PATCHes /api/components/:id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ component: { ...mockComponent, name: 'Updated Button' } }),
    });

    const { result } = renderHook(() => useUpdateComponent('comp-1'), { wrapper: createWrapper() });

    let returnedData: (typeof mockComponent & { name: string }) | undefined;
    await act(async () => {
      returnedData = await result.current.mutateAsync({ name: 'Updated Button' });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/components/comp-1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Button' }),
      })
    );
    expect(returnedData?.name).toBe('Updated Button');
  });
});

describe('useDeleteComponent', () => {
  it('DELETEs /api/components/:id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useDeleteComponent(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ componentId: 'comp-1', projectId: 'proj-1' });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/components/comp-1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('throws on error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Not found' } }),
    });

    const { result } = renderHook(() => useDeleteComponent(), { wrapper: createWrapper() });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ componentId: 'comp-1', projectId: 'proj-1' })
      ).rejects.toThrow('Not found');
    });
  });
});
