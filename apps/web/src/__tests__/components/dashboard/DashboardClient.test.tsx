import { render, screen } from '@testing-library/react';
import { DashboardClient } from '@/app/(dashboard)/dashboard/dashboard-client';
import { useProjects } from '@/hooks/use-projects';
import { useSubscription } from '@/hooks/use-subscription';
import { useAIKeys } from '@/stores/ai-keys';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/hooks/use-projects');
jest.mock('@/hooks/use-subscription');
jest.mock('@/stores/ai-keys');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
jest.mock('@siza/ui', () => ({
  Skeleton: ({ className }: { className?: string }) => <div className={className}>Loading...</div>,
}));
jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    asChild,
    className,
    ...props
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    className?: string;
  }) => {
    if (asChild) {
      return <>{children}</>;
    }
    return (
      <button className={className} {...props}>
        {children}
      </button>
    );
  },
}));

const mockUseProjects = useProjects as jest.MockedFunction<typeof useProjects>;
const mockUseSubscription = useSubscription as jest.MockedFunction<typeof useSubscription>;
const mockUseAIKeys = useAIKeys as jest.MockedFunction<typeof useAIKeys>;

const createMockQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const mockProjects = [
  {
    id: '1',
    user_id: 'user1',
    name: 'Project Alpha',
    description: 'First project',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    user_id: 'user1',
    name: 'Project Beta',
    description: null,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

describe('DashboardClient', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createMockQueryClient();
    jest.clearAllMocks();
    mockUseAIKeys.mockReturnValue([]);
  });

  const renderWithQueryClient = (component: React.ReactElement) =>
    render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);

  describe('Loading State', () => {
    it('shows skeleton loading when projects are loading', () => {
      mockUseProjects.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: null,
        usage: null,
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      expect(screen.getAllByText(/loading/i).length).toBeGreaterThan(0);
    });

    it('shows skeleton loading when usage is loading', () => {
      mockUseProjects.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: null,
        usage: null,
        isLoading: true,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      expect(screen.getAllByText(/loading/i).length).toBeGreaterThan(0);
    });
  });

  describe('Page Heading', () => {
    it('renders dashboard heading', () => {
      mockUseProjects.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: { plan: 'free', status: 'active' },
        usage: {
          generations_count: 0,
          generations_limit: 50,
          projects_count: 0,
          projects_limit: 2,
          tokens_used: 0,
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Overview of your workspace')).toBeInTheDocument();
    });
  });

  describe('Plan Badge', () => {
    it('shows Free badge for free plan', () => {
      mockUseProjects.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: { plan: 'free', status: 'active' },
        usage: {
          generations_count: 0,
          generations_limit: 50,
          projects_count: 0,
          projects_limit: 2,
          tokens_used: 0,
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      expect(screen.getByText('Free')).toBeInTheDocument();
    });

    it('shows Pro badge for pro plan', () => {
      mockUseProjects.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: { plan: 'pro', status: 'active' },
        usage: {
          generations_count: 100,
          generations_limit: -1,
          projects_count: 5,
          projects_limit: -1,
          tokens_used: 5000,
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      expect(screen.getByText('Pro')).toBeInTheDocument();
    });

    it('shows Team badge for enterprise plan', () => {
      mockUseProjects.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: { plan: 'enterprise', status: 'active' },
        usage: {
          generations_count: 500,
          generations_limit: -1,
          projects_count: 20,
          projects_limit: -1,
          tokens_used: 50000,
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      expect(screen.getByText('Team')).toBeInTheDocument();
    });
  });

  describe('Stat Cards', () => {
    it('shows project count stat card', () => {
      mockUseProjects.mockReturnValue({
        data: mockProjects,
        isLoading: false,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: { plan: 'free', status: 'active' },
        usage: {
          generations_count: 10,
          generations_limit: 50,
          projects_count: 2,
          projects_limit: 2,
          tokens_used: 1000,
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      expect(screen.getByText('Total Projects')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('shows generation count stat card', () => {
      mockUseProjects.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: { plan: 'free', status: 'active' },
        usage: {
          generations_count: 25,
          generations_limit: 50,
          projects_count: 0,
          projects_limit: 2,
          tokens_used: 2500,
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      expect(screen.getAllByText('Generations').length).toBeGreaterThan(0);
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('of 50 this month')).toBeInTheDocument();
    });

    it('shows unlimited for pro plan generations', () => {
      mockUseProjects.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: { plan: 'pro', status: 'active' },
        usage: {
          generations_count: 100,
          generations_limit: -1,
          projects_count: 5,
          projects_limit: -1,
          tokens_used: 10000,
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      expect(screen.getAllByText('Generations').length).toBeGreaterThan(0);
      expect(screen.getAllByText('100').length).toBeGreaterThan(0);
      expect(screen.getByText('Unlimited')).toBeInTheDocument();
    });
  });

  describe('Usage Bar', () => {
    it('shows green usage bar when usage is low', () => {
      mockUseProjects.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: { plan: 'free', status: 'active' },
        usage: {
          generations_count: 10,
          generations_limit: 50,
          projects_count: 0,
          projects_limit: 2,
          tokens_used: 500,
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      const usageSection = screen.getByText('Usage This Month').closest('div');
      expect(usageSection).toBeInTheDocument();
      expect(
        screen.getByText((content, element) => {
          return element?.textContent === '10 / 50';
        })
      ).toBeInTheDocument();
    });

    it('handles null usage gracefully', () => {
      mockUseProjects.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: null,
        usage: null,
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    });
  });

  describe('Upgrade CTA', () => {
    it('shows upgrade to pro CTA when plan is free', () => {
      mockUseProjects.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: { plan: 'free', status: 'active' },
        usage: {
          generations_count: 10,
          generations_limit: 50,
          projects_count: 0,
          projects_limit: 2,
          tokens_used: 500,
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
      expect(
        screen.getByText('Upgrade for unlimited generations and projects')
      ).toBeInTheDocument();
    });

    it('does not show upgrade CTA when plan is pro', () => {
      mockUseProjects.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: { plan: 'pro', status: 'active' },
        usage: {
          generations_count: 100,
          generations_limit: -1,
          projects_count: 5,
          projects_limit: -1,
          tokens_used: 10000,
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      expect(screen.queryByText('Upgrade to Pro')).not.toBeInTheDocument();
    });

    it('shows upgrade quick action for free plan', () => {
      mockUseProjects.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: { plan: 'free', status: 'active' },
        usage: {
          generations_count: 10,
          generations_limit: 50,
          projects_count: 0,
          projects_limit: 2,
          tokens_used: 500,
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      expect(screen.getByText('Upgrade Plan')).toBeInTheDocument();
      expect(screen.getByText('Unlock unlimited generations')).toBeInTheDocument();
    });

    it('does not show upgrade quick action for pro plan', () => {
      mockUseProjects.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: { plan: 'pro', status: 'active' },
        usage: {
          generations_count: 100,
          generations_limit: -1,
          projects_count: 5,
          projects_limit: -1,
          tokens_used: 10000,
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      expect(screen.queryByText('Upgrade Plan')).not.toBeInTheDocument();
    });
  });

  describe('Recent Projects', () => {
    it('shows recent projects list', () => {
      mockUseProjects.mockReturnValue({
        data: mockProjects,
        isLoading: false,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: { plan: 'free', status: 'active' },
        usage: {
          generations_count: 0,
          generations_limit: 50,
          projects_count: 2,
          projects_limit: 2,
          tokens_used: 0,
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      expect(screen.getByText('Recent Projects')).toBeInTheDocument();
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project Beta')).toBeInTheDocument();
      expect(screen.getByText('First project')).toBeInTheDocument();
    });

    it('shows empty state when no projects', () => {
      mockUseProjects.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: { plan: 'free', status: 'active' },
        usage: {
          generations_count: 0,
          generations_limit: 50,
          projects_count: 0,
          projects_limit: 2,
          tokens_used: 0,
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      expect(screen.getByText('No projects yet')).toBeInTheDocument();
      expect(screen.getByText('Create your first project to get started')).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('shows all quick action links', () => {
      mockUseProjects.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      mockUseSubscription.mockReturnValue({
        subscription: { plan: 'free', status: 'active' },
        usage: {
          generations_count: 0,
          generations_limit: 50,
          projects_count: 0,
          projects_limit: 2,
          tokens_used: 0,
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<DashboardClient />);

      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('AI-powered code generation')).toBeInTheDocument();
      expect(screen.getByText('Start a new workspace')).toBeInTheDocument();
      expect(screen.getByText('Pre-built component library')).toBeInTheDocument();
      expect(screen.getByText('Past generations and iterations')).toBeInTheDocument();
    });
  });
});
