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
  usePlugins,
  usePlugin,
  useInstallPlugin,
  useUninstallPlugin,
  useUpdatePluginConfig,
} from '@/hooks/use-plugins';

describe('usePlugins', () => {
  it('fetches list of plugins', async () => {
    const plugins = [{ slug: 'my-plugin', name: 'My Plugin', installed: false }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ plugins }),
    });

    const { result } = renderHook(() => usePlugins(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ plugins });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/plugins'));
  });

  it('passes filter params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ plugins: [] }),
    });

    const { result } = renderHook(() => usePlugins({ category: 'analytics' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('category=analytics'));
  });
});

describe('usePlugin', () => {
  it('fetches single plugin by slug', async () => {
    const plugin = { slug: 'my-plugin', name: 'My Plugin' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ plugin }),
    });

    const { result } = renderHook(() => usePlugin('my-plugin'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ plugin });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/plugins/my-plugin'));
  });

  it('is disabled when slug is empty', () => {
    const { result } = renderHook(() => usePlugin(''), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useInstallPlugin', () => {
  it('installs a plugin via POST', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useInstallPlugin(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ slug: 'my-plugin', config: { key: 'value' } });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/plugins/my-plugin',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('installs without config', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useInstallPlugin(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ slug: 'my-plugin' });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/plugins/my-plugin',
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('useUninstallPlugin', () => {
  it('uninstalls a plugin via DELETE', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useUninstallPlugin(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync('my-plugin');
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/plugins/my-plugin',
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

describe('useUpdatePluginConfig', () => {
  it('updates plugin config via PATCH', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ plugin: { slug: 'my-plugin', config: { key: 'new-value' } } }),
    });

    const { result } = renderHook(() => useUpdatePluginConfig(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ slug: 'my-plugin', config: { key: 'new-value' } });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/plugins/my-plugin',
      expect.objectContaining({ method: 'PATCH' })
    );
  });
});
