/**
 * ProjectDetail Component Tests
 * Tests for the project detail IDE interface
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectDetail from '@/components/projects/ProjectDetail';
import { useProject } from '@/hooks/use-projects';
import { useComponents, type Component } from '@/hooks/use-components';
import { useGenerations, type Generation } from '@/hooks/use-generations';

// Mock dependencies
jest.mock('@/hooks/use-projects');
jest.mock('@/hooks/use-components');
jest.mock('@/hooks/use-generations');
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 hours ago'),
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/projects/test-project',
}));
jest.mock('next/link', () => {
  return function MockLink({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

// Mock UI components
jest.mock('@/components/generator/CodeEditor', () => {
  return function MockCodeEditor({ code }: any) {
    return <div data-testid="code-editor">{code || 'No code'}</div>;
  };
});
jest.mock('@/components/generator/LivePreview', () => {
  return function MockLivePreview({ code, framework }: any) {
    return (
      <div data-testid="live-preview" data-framework={framework}>
        Preview: {code}
      </div>
    );
  };
});
jest.mock('@/components/projects/ProjectActions', () => {
  return function MockProjectActions({ projectId, projectName }: any) {
    return (
      <div data-testid="project-actions" data-project-id={projectId}>
        {projectName}
      </div>
    );
  };
});
jest.mock('@siza/ui', () => ({
  Skeleton: function MockSkeleton({ className }: any) {
    return <div data-testid="skeleton" className={className} />;
  },
}));
jest.mock('@/components/ui/button', () => ({
  Button: function MockButton({ children, asChild, ...props }: any) {
    if (asChild) {
      return <>{children}</>;
    }
    return <button {...props}>{children}</button>;
  },
}));

const mockUseProject = useProject as jest.MockedFunction<typeof useProject>;
const mockUseComponents = useComponents as jest.MockedFunction<typeof useComponents>;
const mockUseGenerations = useGenerations as jest.MockedFunction<typeof useGenerations>;

const createMockQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const createMockQueryResult = <T,>(
  data: T | undefined,
  isLoading = false,
  error: Error | null = null
) => ({
  data,
  isLoading,
  error,
  isError: !!error,
  isPending: isLoading,
  isSuccess: !error && !isLoading,
  isFetching: false,
  isLoadingError: false,
  isRefetchError: false,
  isPlaceholderData: false,
  isRefetching: false,
  isFetched: true,
  isFetchedAfterMount: true,
  fetchStatus: 'idle' as const,
  refetch: jest.fn(),
  hasNextPage: false,
  fetchNextPage: jest.fn(),
  hasPreviousPage: false,
  fetchPreviousPage: jest.fn(),
  status: 'success' as const,
  dataUpdatedAt: 0,
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: null,
});

describe('ProjectDetail Component', () => {
  let queryClient: QueryClient;

  const mockProject = {
    id: 'test-project',
    name: 'Test Project',
    description: 'Test project description',
    framework: 'react',
    component_library: 'shadcn',
    created_at: '2026-03-06T00:00:00.000Z',
    updated_at: '2026-03-06T00:00:00.000Z',
    user_id: 'user-123',
  };

  const mockComponents: Component[] = [
    {
      id: 'comp-1',
      project_id: 'test-project',
      user_id: 'user-123',
      name: 'Button',
      component_type: 'ui',
      framework: 'react',
      created_at: '2026-03-06T00:00:00.000Z',
      updated_at: '2026-03-06T00:00:00.000Z',
    },
    {
      id: 'comp-2',
      project_id: 'test-project',
      user_id: 'user-123',
      name: 'Card',
      component_type: 'ui',
      framework: 'react',
      created_at: '2026-03-06T00:00:00.000Z',
      updated_at: '2026-03-06T00:00:00.000Z',
    },
  ];

  const mockGenerations: Generation[] = [
    {
      id: 'gen-1',
      project_id: 'test-project',
      user_id: 'user-123',
      component_name: 'Button',
      generated_code: 'export default function Button() { return <button>Click</button>; }',
      framework: 'react',
      component_library: 'tailwind',
      typescript: true,
      status: 'completed',
      prompt: 'Create a button',
      created_at: '2026-03-06T00:00:00.000Z',
      updated_at: '2026-03-06T00:00:00.000Z',
    },
    {
      id: 'gen-2',
      project_id: 'test-project',
      user_id: 'user-123',
      component_name: 'Card',
      generated_code: 'export default function Card() { return <div>Card</div>; }',
      framework: 'react',
      component_library: 'tailwind',
      typescript: true,
      status: 'failed',
      prompt: 'Create a card',
      created_at: '2026-03-06T00:00:00.000Z',
      updated_at: '2026-03-06T00:00:00.000Z',
    },
    {
      id: 'gen-3',
      project_id: 'test-project',
      user_id: 'user-123',
      component_name: 'Input',
      generated_code: '',
      framework: 'react',
      typescript: true,
      status: 'in_progress',
      prompt: 'Create an input',
      created_at: '2026-03-06T00:00:00.000Z',
      updated_at: '2026-03-06T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    queryClient = createMockQueryClient();
    jest.clearAllMocks();
  });

  const renderWithQueryClient = (component: React.ReactElement) =>
    render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);

  describe('Loading State', () => {
    it('should show loading skeletons when projectLoading is true', () => {
      mockUseProject.mockReturnValue(createMockQueryResult(undefined, true) as any);
      mockUseComponents.mockReturnValue(createMockQueryResult([], false) as any);
      mockUseGenerations.mockReturnValue(createMockQueryResult([], false) as any);

      renderWithQueryClient(<ProjectDetail projectId="test-project" />);

      const skeletons = screen.getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should show error state when project is null', () => {
      mockUseProject.mockReturnValue(createMockQueryResult(undefined, false) as any);
      mockUseComponents.mockReturnValue(createMockQueryResult([], false) as any);
      mockUseGenerations.mockReturnValue(createMockQueryResult([], false) as any);

      renderWithQueryClient(<ProjectDetail projectId="test-project" />);

      expect(screen.getByText('Failed to load project.')).toBeInTheDocument();
      expect(screen.getByText('Back to Projects')).toBeInTheDocument();
    });
  });

  describe('Project Header', () => {
    beforeEach(() => {
      mockUseProject.mockReturnValue(createMockQueryResult(mockProject, false) as any);
      mockUseComponents.mockReturnValue(createMockQueryResult(mockComponents, false) as any);
      mockUseGenerations.mockReturnValue(createMockQueryResult(mockGenerations, false) as any);
    });

    it('should render project name and framework in header', () => {
      renderWithQueryClient(<ProjectDetail projectId="test-project" />);

      const projectName = screen.getAllByText('Test Project')[0];
      expect(projectName).toBeInTheDocument();
      const frameworkLabel = screen.getAllByText('react')[0];
      expect(frameworkLabel).toBeInTheDocument();
    });

    it('should show component count in header', () => {
      renderWithQueryClient(<ProjectDetail projectId="test-project" />);

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should show generation count in header', () => {
      renderWithQueryClient(<ProjectDetail projectId="test-project" />);

      expect(screen.getByText('1/3')).toBeInTheDocument();
    });
  });

  describe('Component List', () => {
    beforeEach(() => {
      mockUseProject.mockReturnValue(createMockQueryResult(mockProject, false) as any);
      mockUseComponents.mockReturnValue(createMockQueryResult(mockComponents, false) as any);
      mockUseGenerations.mockReturnValue(createMockQueryResult([], false) as any);
    });

    it('should render component list items in sidebar', () => {
      renderWithQueryClient(<ProjectDetail projectId="test-project" />);

      expect(screen.getByText('Button')).toBeInTheDocument();
      expect(screen.getByText('Card')).toBeInTheDocument();
    });

    it('should show empty state for no components', () => {
      mockUseComponents.mockReturnValue(createMockQueryResult([], false) as any);

      renderWithQueryClient(<ProjectDetail projectId="test-project" />);

      expect(screen.getByText('No components yet')).toBeInTheDocument();
    });
  });

  describe('Generation History', () => {
    beforeEach(() => {
      mockUseProject.mockReturnValue(createMockQueryResult(mockProject, false) as any);
      mockUseComponents.mockReturnValue(createMockQueryResult([], false) as any);
      mockUseGenerations.mockReturnValue(createMockQueryResult(mockGenerations, false) as any);
    });

    it('should render generation list items with status dots when switching to History tab', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<ProjectDetail projectId="test-project" />);

      const historyTab = screen.getByRole('button', { name: /history \(3\)/i });
      await user.click(historyTab);

      expect(screen.getByText('Button')).toBeInTheDocument();
      expect(screen.getByText('Card')).toBeInTheDocument();
      expect(screen.getByText('Input')).toBeInTheDocument();
    });

    it('should show empty state for no generations', async () => {
      const user = userEvent.setup();
      mockUseGenerations.mockReturnValue(createMockQueryResult([], false) as any);

      renderWithQueryClient(<ProjectDetail projectId="test-project" />);

      const historyTab = screen.getByRole('button', { name: /history \(0\)/i });
      await user.click(historyTab);

      expect(screen.getByText('No generations yet')).toBeInTheDocument();
    });
  });

  describe('Code Editor and Preview', () => {
    beforeEach(() => {
      mockUseProject.mockReturnValue(createMockQueryResult(mockProject, false) as any);
      mockUseComponents.mockReturnValue(createMockQueryResult([], false) as any);
      mockUseGenerations.mockReturnValue(createMockQueryResult(mockGenerations, false) as any);
    });

    it('should show "Select a component" empty state when nothing selected', () => {
      renderWithQueryClient(<ProjectDetail projectId="test-project" />);

      expect(screen.getByText('Select a component')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Choose a component or generation from the sidebar to view its code and preview.'
        )
      ).toBeInTheDocument();
    });

    it('should show code editor when clicking a generation', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<ProjectDetail projectId="test-project" />);

      const historyTab = screen.getByRole('button', { name: /history \(3\)/i });
      await user.click(historyTab);

      const buttonGeneration = screen.getByText('Button');
      await user.click(buttonGeneration);

      expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      expect(
        screen.getByText('export default function Button() { return <button>Click</button>; }')
      ).toBeInTheDocument();
    });

    it('should switch to preview tab', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<ProjectDetail projectId="test-project" />);

      const historyTab = screen.getByRole('button', { name: /history \(3\)/i });
      await user.click(historyTab);

      const buttonGeneration = screen.getByText('Button');
      await user.click(buttonGeneration);

      const previewTab = screen.getByRole('button', { name: /preview/i });
      await user.click(previewTab);

      expect(screen.getByTestId('live-preview')).toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    beforeEach(() => {
      mockUseProject.mockReturnValue(createMockQueryResult(mockProject, false) as any);
      mockUseComponents.mockReturnValue(createMockQueryResult(mockComponents, false) as any);
      mockUseGenerations.mockReturnValue(createMockQueryResult(mockGenerations, false) as any);
    });

    it('should switch between components and history tabs', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<ProjectDetail projectId="test-project" />);

      expect(screen.getByText('Button')).toBeInTheDocument();
      expect(screen.getByText('Card')).toBeInTheDocument();

      const historyTab = screen.getByRole('button', { name: /history \(3\)/i });
      await user.click(historyTab);

      const allButtonText = screen.getAllByText('Button');
      expect(allButtonText.length).toBeGreaterThan(0);

      const componentsTab = screen.getByRole('button', { name: /components \(2\)/i });
      await user.click(componentsTab);

      expect(screen.getByText('Button')).toBeInTheDocument();
    });
  });
});
