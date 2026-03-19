import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectList from '@/components/projects/ProjectList';

const mockUseProjects = jest.fn();
const mockUseRealtimeProjects = jest.fn();

jest.mock('@/hooks/use-projects', () => ({
  useProjects: () => mockUseProjects(),
  useDeleteProject: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock('@/hooks/use-realtime-projects', () => ({
  useRealtimeProjects: () => mockUseRealtimeProjects(),
}));

jest.mock('@/components/projects/ProjectGrid', () => ({
  __esModule: true,
  default: ({ projects, viewMode }: { projects: unknown[]; viewMode: string }) => (
    <div data-testid="project-grid" data-count={projects.length} data-view-mode={viewMode} />
  ),
}));

jest.mock('@/components/projects/ProjectFilters', () => ({
  __esModule: true,
  default: ({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
  }: {
    searchQuery: string;
    onSearchChange: (v: string) => void;
    sortBy: string;
    onSortChange: (v: string) => void;
  }) => (
    <div data-testid="project-filters">
      <input
        data-testid="search-input"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select
        data-testid="sort-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="updated">updated</option>
        <option value="created">created</option>
        <option value="name">name</option>
      </select>
    </div>
  ),
}));

jest.mock('@/components/ui/EmptyState', () => ({
  __esModule: true,
  default: () => <div data-testid="empty-state" />,
}));

jest.mock('@siza/ui', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

jest.mock('lucide-react', () => ({
  FolderIcon: () => <span />,
  LayoutGridIcon: () => <span />,
  ListIcon: () => <span />,
}));

const makeProject = (id: string, name: string) => ({
  id,
  name,
  framework: 'react' as const,
  description: '',
  thumbnail_url: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
  user_id: 'user-1',
  component_library: 'shadcn',
  is_public: false,
  is_template: false,
});

describe('ProjectList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRealtimeProjects.mockReturnValue(undefined);
  });

  it('shows skeletons while loading', () => {
    mockUseProjects.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<ProjectList />);
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('shows error message on fetch failure', () => {
    mockUseProjects.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    });
    render(<ProjectList />);
    expect(screen.getByText(/Failed to load projects/i)).toBeInTheDocument();
  });

  it('shows empty state when no projects', () => {
    mockUseProjects.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<ProjectList />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders ProjectGrid with projects', () => {
    const projects = [makeProject('1', 'Alpha'), makeProject('2', 'Beta')];
    mockUseProjects.mockReturnValue({ data: projects, isLoading: false, error: null });
    render(<ProjectList />);
    const grid = screen.getByTestId('project-grid');
    expect(grid).toHaveAttribute('data-count', '2');
  });

  it('toggles viewMode to list when list button is clicked', () => {
    mockUseProjects.mockReturnValue({
      data: [makeProject('1', 'Alpha')],
      isLoading: false,
      error: null,
    });
    render(<ProjectList />);
    const listBtn = screen.getByRole('button', { name: /list view/i });
    fireEvent.click(listBtn);
    const grid = screen.getByTestId('project-grid');
    expect(grid).toHaveAttribute('data-view-mode', 'list');
  });

  it('toggles viewMode to grid when grid button is clicked', () => {
    mockUseProjects.mockReturnValue({
      data: [makeProject('1', 'Alpha')],
      isLoading: false,
      error: null,
    });
    render(<ProjectList />);
    // Switch to list first, then back to grid
    fireEvent.click(screen.getByRole('button', { name: /list view/i }));
    fireEvent.click(screen.getByRole('button', { name: /grid view/i }));
    const grid = screen.getByTestId('project-grid');
    expect(grid).toHaveAttribute('data-view-mode', 'grid');
  });

  it('filters projects by search query', () => {
    const projects = [makeProject('1', 'Alpha'), makeProject('2', 'Beta')];
    mockUseProjects.mockReturnValue({ data: projects, isLoading: false, error: null });
    render(<ProjectList />);
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'alpha' } });
    const grid = screen.getByTestId('project-grid');
    expect(grid).toHaveAttribute('data-count', '1');
  });
});
