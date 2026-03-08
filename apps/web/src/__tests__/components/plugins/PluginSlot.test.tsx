import React from 'react';
import { render, screen } from '@testing-library/react';
import { PluginSlot } from '@/components/plugins/PluginSlot';
import { usePlugins } from '@/hooks/use-plugins';

jest.mock('@/hooks/use-plugins', () => ({
  usePlugins: jest.fn(),
}));

const mockUsePlugins = usePlugins as jest.MockedFunction<typeof usePlugins>;

describe('PluginSlot', () => {
  const mockPlugins = [
    {
      slug: 'security-scanner',
      name: 'Security Scanner',
      description: 'Advanced security vulnerability detection',
      version: '1.2.0',
      author: 'Forge Security Team',
      icon: 'Shield',
      category: 'security',
      status: 'stable',
      widget_slots: ['catalog.entity.overview', 'catalog.entity.security'],
      installation: {
        id: 'inst-123',
        enabled: true,
        config: {},
      },
    },
    {
      slug: 'quality-checker',
      name: 'Quality Checker',
      description: 'Code quality analysis',
      version: '2.0.0',
      author: 'Quality Team',
      icon: 'ClipboardCheck',
      category: 'quality',
      status: 'stable',
      widget_slots: ['catalog.entity.overview'],
      installation: {
        id: 'inst-456',
        enabled: true,
        config: {},
      },
    },
    {
      slug: 'disabled-plugin',
      name: 'Disabled Plugin',
      description: 'This plugin is disabled',
      version: '1.0.0',
      author: 'Test',
      icon: 'Package',
      category: 'monitoring',
      status: 'stable',
      widget_slots: ['catalog.entity.overview'],
      installation: {
        id: 'inst-789',
        enabled: false,
        config: {},
      },
    },
    {
      slug: 'not-installed',
      name: 'Not Installed',
      description: 'This plugin is not installed',
      version: '1.0.0',
      author: 'Test',
      icon: 'Package',
      category: 'integration',
      status: 'stable',
      widget_slots: ['catalog.entity.overview'],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when no plugins match the slot', () => {
    mockUsePlugins.mockReturnValue({
      data: { data: mockPlugins },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const { container } = render(<PluginSlot name="non-existent-slot" />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when no data loaded yet', () => {
    mockUsePlugins.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    } as any);

    const { container } = render(<PluginSlot name="catalog.entity.overview" />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when data is null', () => {
    mockUsePlugins.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const { container } = render(<PluginSlot name="catalog.entity.overview" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders matching plugin widgets', () => {
    mockUsePlugins.mockReturnValue({
      data: { data: mockPlugins },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<PluginSlot name="catalog.entity.overview" />);

    // Should render Security Scanner and Quality Checker (both enabled and match slot)
    expect(screen.getByText('Security Scanner')).toBeInTheDocument();
    expect(screen.getByText('Quality Checker')).toBeInTheDocument();

    // Should NOT render Disabled Plugin or Not Installed
    expect(screen.queryByText('Disabled Plugin')).not.toBeInTheDocument();
    expect(screen.queryByText('Not Installed')).not.toBeInTheDocument();
  });

  it('filters plugins by slot name', () => {
    mockUsePlugins.mockReturnValue({
      data: { data: mockPlugins },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<PluginSlot name="catalog.entity.security" />);

    // Only Security Scanner has the catalog.entity.security slot
    expect(screen.getByText('Security Scanner')).toBeInTheDocument();
    expect(screen.queryByText('Quality Checker')).not.toBeInTheDocument();
  });

  it('only shows installed and enabled plugins', () => {
    mockUsePlugins.mockReturnValue({
      data: { data: mockPlugins },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<PluginSlot name="catalog.entity.overview" />);

    // Disabled Plugin has installation but enabled=false
    expect(screen.queryByText('Disabled Plugin')).not.toBeInTheDocument();

    // Not Installed has no installation object
    expect(screen.queryByText('Not Installed')).not.toBeInTheDocument();

    // Only enabled plugins should show
    expect(screen.getByText('Security Scanner')).toBeInTheDocument();
    expect(screen.getByText('Quality Checker')).toBeInTheDocument();
  });

  it('shows "Active on this entity" when entityId provided', () => {
    mockUsePlugins.mockReturnValue({
      data: { data: mockPlugins },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<PluginSlot name="catalog.entity.overview" entityId="entity-123" />);

    const activeIndicators = screen.getAllByText('Active on this entity');
    // Should have 2 instances (Security Scanner + Quality Checker)
    expect(activeIndicators).toHaveLength(2);
  });

  it('does not show "Active on this entity" when entityId not provided', () => {
    mockUsePlugins.mockReturnValue({
      data: { data: mockPlugins },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<PluginSlot name="catalog.entity.overview" />);

    expect(screen.queryByText('Active on this entity')).not.toBeInTheDocument();
  });

  it('applies className prop', () => {
    mockUsePlugins.mockReturnValue({
      data: { data: mockPlugins },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const { container } = render(
      <PluginSlot name="catalog.entity.overview" className="custom-class" />
    );

    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders plugin descriptions', () => {
    mockUsePlugins.mockReturnValue({
      data: { data: mockPlugins },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<PluginSlot name="catalog.entity.overview" />);

    expect(screen.getByText('Advanced security vulnerability detection')).toBeInTheDocument();
    expect(screen.getByText('Code quality analysis')).toBeInTheDocument();
  });

  it('renders plugin categories', () => {
    mockUsePlugins.mockReturnValue({
      data: { data: mockPlugins },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<PluginSlot name="catalog.entity.overview" />);

    expect(screen.getByText('security')).toBeInTheDocument();
    expect(screen.getByText('quality')).toBeInTheDocument();
  });

  it('handles plugins with null description', () => {
    const pluginsWithNullDesc = [
      {
        ...mockPlugins[0],
        description: null,
      },
    ];

    mockUsePlugins.mockReturnValue({
      data: { data: pluginsWithNullDesc },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<PluginSlot name="catalog.entity.overview" />);

    expect(screen.getByText('Security Scanner')).toBeInTheDocument();
  });

  it('handles empty data array', () => {
    mockUsePlugins.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const { container } = render(<PluginSlot name="catalog.entity.overview" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders multiple widgets with unique keys', () => {
    mockUsePlugins.mockReturnValue({
      data: { data: mockPlugins },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const { container } = render(<PluginSlot name="catalog.entity.overview" />);

    // Count the number of plugin widget containers
    const widgets = container.querySelectorAll('.rounded-lg.border');
    expect(widgets.length).toBe(2); // Security Scanner + Quality Checker
  });
});
