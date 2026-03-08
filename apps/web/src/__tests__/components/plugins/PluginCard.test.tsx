import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PluginCard } from '@/components/plugins/PluginCard';

describe('PluginCard', () => {
  const mockPlugin = {
    slug: 'security-scanner',
    name: 'Security Scanner',
    description: 'Advanced security vulnerability detection',
    version: '1.2.0',
    author: 'Forge Security Team',
    icon: 'Shield',
    category: 'security',
    status: 'stable',
    widget_slots: ['catalog.entity.overview', 'catalog.entity.security'],
  };

  const mockOnInstall = jest.fn();
  const mockOnUninstall = jest.fn();
  const mockOnConfigure = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders plugin name', () => {
    render(
      <PluginCard plugin={mockPlugin} onInstall={mockOnInstall} onUninstall={mockOnUninstall} />
    );

    expect(screen.getByText('Security Scanner')).toBeInTheDocument();
  });

  it('renders plugin description', () => {
    render(
      <PluginCard plugin={mockPlugin} onInstall={mockOnInstall} onUninstall={mockOnUninstall} />
    );

    expect(screen.getByText('Advanced security vulnerability detection')).toBeInTheDocument();
  });

  it('renders plugin version', () => {
    render(
      <PluginCard plugin={mockPlugin} onInstall={mockOnInstall} onUninstall={mockOnUninstall} />
    );

    expect(screen.getByText('v1.2.0')).toBeInTheDocument();
  });

  it('renders plugin author', () => {
    render(
      <PluginCard plugin={mockPlugin} onInstall={mockOnInstall} onUninstall={mockOnUninstall} />
    );

    expect(screen.getByText('by Forge Security Team')).toBeInTheDocument();
  });

  it('shows category badge', () => {
    render(
      <PluginCard plugin={mockPlugin} onInstall={mockOnInstall} onUninstall={mockOnUninstall} />
    );

    const categoryBadge = screen.getByText('security');
    expect(categoryBadge).toBeInTheDocument();
    expect(categoryBadge).toHaveClass('bg-red-500/10', 'text-red-400');
  });

  it('shows widget slot tags', () => {
    render(
      <PluginCard plugin={mockPlugin} onInstall={mockOnInstall} onUninstall={mockOnUninstall} />
    );

    expect(screen.getByText('catalog.entity.overview')).toBeInTheDocument();
    expect(screen.getByText('catalog.entity.security')).toBeInTheDocument();
  });

  it('shows Install button when not installed', () => {
    render(
      <PluginCard plugin={mockPlugin} onInstall={mockOnInstall} onUninstall={mockOnUninstall} />
    );

    const installButton = screen.getByRole('button', { name: /install/i });
    expect(installButton).toBeInTheDocument();
    expect(installButton).not.toBeDisabled();
  });

  it('shows uninstall button when installed', () => {
    const installedPlugin = {
      ...mockPlugin,
      installation: {
        id: 'inst-123',
        enabled: true,
        config: {},
      },
    };

    render(
      <PluginCard
        plugin={installedPlugin}
        onInstall={mockOnInstall}
        onUninstall={mockOnUninstall}
      />
    );

    const uninstallButton = screen.getByRole('button', { name: /uninstall/i });
    expect(uninstallButton).toBeInTheDocument();
  });

  it('shows configure button when installed and onConfigure provided', () => {
    const installedPlugin = {
      ...mockPlugin,
      installation: {
        id: 'inst-123',
        enabled: true,
        config: {},
      },
    };

    render(
      <PluginCard
        plugin={installedPlugin}
        onInstall={mockOnInstall}
        onUninstall={mockOnUninstall}
        onConfigure={mockOnConfigure}
      />
    );

    const configureButton = screen.getByRole('button', { name: /configure/i });
    expect(configureButton).toBeInTheDocument();
  });

  it('does not show configure button when onConfigure not provided', () => {
    const installedPlugin = {
      ...mockPlugin,
      installation: {
        id: 'inst-123',
        enabled: true,
        config: {},
      },
    };

    render(
      <PluginCard
        plugin={installedPlugin}
        onInstall={mockOnInstall}
        onUninstall={mockOnUninstall}
      />
    );

    const configureButton = screen.queryByRole('button', { name: /configure/i });
    expect(configureButton).not.toBeInTheDocument();
  });

  it('shows CheckCircle2 icon when installed', () => {
    const installedPlugin = {
      ...mockPlugin,
      installation: {
        id: 'inst-123',
        enabled: true,
        config: {},
      },
    };

    const { container } = render(
      <PluginCard
        plugin={installedPlugin}
        onInstall={mockOnInstall}
        onUninstall={mockOnUninstall}
      />
    );

    // CheckCircle2 has specific class text-emerald-500
    const checkIcon = container.querySelector('.text-emerald-500');
    expect(checkIcon).toBeInTheDocument();
  });

  it('calls onInstall with slug when Install clicked', () => {
    render(
      <PluginCard plugin={mockPlugin} onInstall={mockOnInstall} onUninstall={mockOnUninstall} />
    );

    const installButton = screen.getByRole('button', { name: /install/i });
    fireEvent.click(installButton);

    expect(mockOnInstall).toHaveBeenCalledTimes(1);
    expect(mockOnInstall).toHaveBeenCalledWith('security-scanner');
  });

  it('calls onUninstall with slug when uninstall clicked', () => {
    const installedPlugin = {
      ...mockPlugin,
      installation: {
        id: 'inst-123',
        enabled: true,
        config: {},
      },
    };

    render(
      <PluginCard
        plugin={installedPlugin}
        onInstall={mockOnInstall}
        onUninstall={mockOnUninstall}
      />
    );

    const uninstallButton = screen.getByRole('button', { name: /uninstall/i });
    fireEvent.click(uninstallButton);

    expect(mockOnUninstall).toHaveBeenCalledTimes(1);
    expect(mockOnUninstall).toHaveBeenCalledWith('security-scanner');
  });

  it('calls onConfigure with slug when configure clicked', () => {
    const installedPlugin = {
      ...mockPlugin,
      installation: {
        id: 'inst-123',
        enabled: true,
        config: {},
      },
    };

    render(
      <PluginCard
        plugin={installedPlugin}
        onInstall={mockOnInstall}
        onUninstall={mockOnUninstall}
        onConfigure={mockOnConfigure}
      />
    );

    const configureButton = screen.getByRole('button', { name: /configure/i });
    fireEvent.click(configureButton);

    expect(mockOnConfigure).toHaveBeenCalledTimes(1);
    expect(mockOnConfigure).toHaveBeenCalledWith('security-scanner');
  });

  it('disables Install button when installing is true', () => {
    render(
      <PluginCard
        plugin={mockPlugin}
        onInstall={mockOnInstall}
        onUninstall={mockOnUninstall}
        installing
      />
    );

    const installButton = screen.getByRole('button', { name: /install/i });
    expect(installButton).toBeDisabled();
  });

  it('does not call onInstall when Install button is disabled', () => {
    render(
      <PluginCard
        plugin={mockPlugin}
        onInstall={mockOnInstall}
        onUninstall={mockOnUninstall}
        installing
      />
    );

    const installButton = screen.getByRole('button', { name: /install/i });
    fireEvent.click(installButton);

    expect(mockOnInstall).not.toHaveBeenCalled();
  });

  it('renders with null description', () => {
    const pluginWithNullDesc = {
      ...mockPlugin,
      description: null,
    };

    render(
      <PluginCard
        plugin={pluginWithNullDesc}
        onInstall={mockOnInstall}
        onUninstall={mockOnUninstall}
      />
    );

    expect(screen.getByText('Security Scanner')).toBeInTheDocument();
  });

  it('renders with null icon (defaults to Shield)', () => {
    const pluginWithNullIcon = {
      ...mockPlugin,
      icon: null,
    };

    render(
      <PluginCard
        plugin={pluginWithNullIcon}
        onInstall={mockOnInstall}
        onUninstall={mockOnUninstall}
      />
    );

    // Component should render without errors
    expect(screen.getByText('Security Scanner')).toBeInTheDocument();
  });

  it('renders with unknown category (defaults to governance style)', () => {
    const pluginWithUnknownCategory = {
      ...mockPlugin,
      category: 'unknown-category',
    };

    render(
      <PluginCard
        plugin={pluginWithUnknownCategory}
        onInstall={mockOnInstall}
        onUninstall={mockOnUninstall}
      />
    );

    const categoryBadge = screen.getByText('unknown-category');
    expect(categoryBadge).toBeInTheDocument();
    expect(categoryBadge).toHaveClass('bg-violet-500/10', 'text-violet-400');
  });

  it('renders with empty widget_slots array', () => {
    const pluginWithNoSlots = {
      ...mockPlugin,
      widget_slots: [],
    };

    render(
      <PluginCard
        plugin={pluginWithNoSlots}
        onInstall={mockOnInstall}
        onUninstall={mockOnUninstall}
      />
    );

    expect(screen.getByText('Security Scanner')).toBeInTheDocument();
    expect(screen.queryByText('catalog.entity.overview')).not.toBeInTheDocument();
  });
});
