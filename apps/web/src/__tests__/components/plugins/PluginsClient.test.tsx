import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { PluginsClient } from '@/app/(dashboard)/plugins/plugins-client';
import { usePlugins, useInstallPlugin, useUninstallPlugin } from '@/hooks/use-plugins';

jest.mock('@/hooks/use-plugins');

jest.mock('@/components/plugins/PluginCard', () => ({
  PluginCard: ({ plugin }: { plugin: { name: string } }) => <div>{plugin.name}</div>,
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockUsePlugins = usePlugins as jest.MockedFunction<typeof usePlugins>;
const mockUseInstallPlugin = useInstallPlugin as jest.MockedFunction<typeof useInstallPlugin>;
const mockUseUninstallPlugin = useUninstallPlugin as jest.MockedFunction<typeof useUninstallPlugin>;

describe('PluginsClient', () => {
  const installMutate = jest.fn();
  const uninstallMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseInstallPlugin.mockReturnValue({
      mutate: installMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useInstallPlugin>);
    mockUseUninstallPlugin.mockReturnValue({
      mutate: uninstallMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUninstallPlugin>);
  });

  it('renders API error state and retries plugin fetch', () => {
    const refetch = jest.fn();
    mockUsePlugins.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch plugins'),
      refetch,
    } as unknown as ReturnType<typeof usePlugins>);

    render(<PluginsClient />);

    expect(screen.getByText('Failed to fetch plugins')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
