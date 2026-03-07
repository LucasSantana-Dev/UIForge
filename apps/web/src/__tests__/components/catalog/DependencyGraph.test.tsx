import { render, screen, fireEvent } from '@testing-library/react';
import { DependencyGraph } from '@/components/catalog/DependencyGraph';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockGraph = {
  nodes: [
    {
      id: 'n1',
      name: 'siza-web',
      display_name: 'Siza Web',
      type: 'service',
      lifecycle: 'production',
      owner_id: 'u1',
      team: 'Platform',
      tags: [],
      dependencies: [],
      repository_url: null,
      documentation_url: null,
      project_id: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    },
    {
      id: 'n2',
      name: 'core',
      display_name: 'Core Library',
      type: 'library',
      lifecycle: 'experimental',
      owner_id: 'u1',
      team: 'Platform',
      tags: [],
      dependencies: [],
      repository_url: null,
      documentation_url: null,
      project_id: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    },
  ],
  edges: [{ source: 'n1', target: 'n2', type: 'dependency' }],
};

let mockLoading = false;
let mockData: typeof mockGraph | undefined = undefined;

jest.mock('@/hooks/use-catalog', () => ({
  useCatalogGraph: () => ({ data: mockData, isLoading: mockLoading }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockLoading = false;
  mockData = undefined;
});

describe('DependencyGraph', () => {
  it('shows loading skeleton', () => {
    mockLoading = true;
    const { container } = render(<DependencyGraph />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('shows empty state when no nodes', () => {
    mockData = { nodes: [], edges: [] };
    render(<DependencyGraph />);
    expect(screen.getByText('No catalog entries to visualize')).toBeInTheDocument();
  });

  it('renders nodes with display names', () => {
    mockData = mockGraph;
    render(<DependencyGraph />);
    expect(screen.getByText('Siza Web')).toBeInTheDocument();
    expect(screen.getByText('Core Library')).toBeInTheDocument();
  });

  it('renders type labels on nodes', () => {
    mockData = mockGraph;
    render(<DependencyGraph />);
    expect(screen.getByText(/service \u00b7 1 dep/)).toBeInTheDocument();
    expect(screen.getAllByText('library').length).toBeGreaterThanOrEqual(1);
  });

  it('renders legend with type colors and edge types', () => {
    mockData = mockGraph;
    render(<DependencyGraph />);
    expect(screen.getByText('dependency')).toBeInTheDocument();
    expect(screen.getByText('hierarchy')).toBeInTheDocument();
  });

  it('navigates to entry detail on click', () => {
    mockData = mockGraph;
    render(<DependencyGraph />);
    const node = screen.getByText('Siza Web').closest('g');
    if (node) fireEvent.click(node);
    expect(mockPush).toHaveBeenCalledWith('/catalog/n1');
  });

  it('renders SVG edges between nodes', () => {
    mockData = mockGraph;
    const { container } = render(<DependencyGraph />);
    const paths = container.querySelectorAll('path[stroke-dasharray="4,4"]');
    expect(paths.length).toBe(1);
  });

  it('renders lifecycle indicator circles', () => {
    mockData = mockGraph;
    const { container } = render(<DependencyGraph />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2);
  });
});
