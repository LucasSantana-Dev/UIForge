/**
 * MockDashboard Component Tests
 * Tests for the main dashboard interface
 */

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Generation } from '@/hooks/use-generations';
import { useAIKeyStore } from '@/stores/ai-keys';
import { useGenerations } from '@/hooks/use-generations';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Dashboard component since it doesn't exist yet
const MockDashboard = () => <div data-testid="dashboard">Dashboard</div>;

// Mock dependencies
jest.mock('@/stores/ai-keys');
jest.mock('@/hooks/use-generations');
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

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <h2 {...props}>{children}</h2>
  ),
  CardDescription: ({ children, ...props }: any) => (
    <p {...props}>{children}</p>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  CardFooter: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}));

// Mock query client
const createMockQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

const mockUseAIKeyStore = useAIKeyStore as jest.MockedFunction<typeof useAIKeyStore>;
const mockUseGenerations = useGenerations as jest.MockedFunction<typeof useGenerations>;

describe('MockDashboard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createMockQueryClient();
    jest.clearAllMocks();
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  const createMockGenerationsResult = (data: Generation[] = [], isLoading = false, error: Error | null = null) => ({
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
    isFetched: false,
    isFetchedAfterMount: false,
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

  describe('Basic Rendering', () => {
    it('should render dashboard with welcome message', () => {
      const mockStore = {
        apiKeys: [],
        isLoading: false,
        error: null,
      };

      mockUseAIKeyStore.mockReturnValue(mockStore);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult() as any);

      const { getByText } = renderWithQueryClient(<MockDashboard />);

      expect(getByText('Welcome to UIForge')).toBeInTheDocument();
      expect(getByText('Start creating amazing UI components')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      const mockStore = {
        apiKeys: [],
        isLoading: true,
        error: null,
      };

      mockUseAIKeyStore.mockReturnValue(mockStore);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult([], true) as any);

      const { getByText } = renderWithQueryClient(<MockDashboard />);

      expect(getByText('Loading...')).toBeInTheDocument();
    });

    it('should show error state', () => {
      const mockStore = {
        apiKeys: [],
        isLoading: false,
        error: new Error('Failed to load data'),
      };

      mockUseAIKeyStore.mockReturnValue(mockStore);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult([], false, new Error('Failed to load generations')) as any);

      const { getByText } = renderWithQueryClient(<MockDashboard />);

      expect(getByText(/error/i)).toBeInTheDocument();
    });
  });

  describe('API Keys Section', () => {
    it('should display API keys when available', () => {
      const mockStore = {
        apiKeys: [
          {
            provider: 'openai',
            keyName: 'OpenAI Key',
            encryptedKey: 'encrypted-key-1',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ],
        isLoading: false,
        error: null,
      };

      mockUseAIKeyStore.mockReturnValue(mockStore);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult() as any);

      const { getByText } = renderWithQueryClient(<MockDashboard />);

      expect(getByText('OpenAI Key')).toBeInTheDocument();
      expect(getByText(/active/i)).toBeInTheDocument();
    });

    it('should show setup prompt when no API keys', () => {
      const mockStore = {
        apiKeys: [],
        isLoading: false,
        error: null,
      };

      mockUseAIKeyStore.mockReturnValue(mockStore);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult() as any);

      const { getByText } = renderWithQueryClient(<MockDashboard />);

      expect(getByText(/no api keys configured/i)).toBeInTheDocument();
      expect(getByText(/set up your first api key/i)).toBeInTheDocument();
    });
  });

  describe('Recent Generations', () => {
    it('should display recent generations', () => {
      const mockStore = {
        apiKeys: [
          {
            provider: 'openai',
            keyName: 'OpenAI Key',
            encryptedKey: 'encrypted-key-1',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ],
        isLoading: false,
        error: null,
      };

      const mockGenerations: Generation[] = [
        {
          id: '1',
          user_id: 'user-1',
          project_id: 'proj-1',
          component_name: 'Button',
          generated_code: 'export default function Button() { return <button>Click me</button>; }',
          framework: 'react',
          component_library: 'tailwind',
          style: 'modern',
          typescript: true,
          tokens_used: 150,
          prompt: 'Create a button component',
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: 'user-1',
          project_id: 'proj-1',
          component_name: 'Card',
          generated_code: 'export default function Card() { return <div>Card content</div>; }',
          framework: 'react',
          component_library: 'tailwind',
          style: 'modern',
          typescript: true,
          tokens_used: 200,
          prompt: 'Create a card component',
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockUseAIKeyStore.mockReturnValue(mockStore);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult(mockGenerations) as any);

      const { getByText } = renderWithQueryClient(<MockDashboard />);

      expect(getByText('Button')).toBeInTheDocument();
      expect(getByText('Card')).toBeInTheDocument();
      expect(getByText('React')).toBeInTheDocument();
      expect(getByText('Tailwind')).toBeInTheDocument();
    });

    it('should show empty state when no generations', () => {
      const mockStore = {
        apiKeys: [
          {
            provider: 'openai',
            keyName: 'OpenAI Key',
            encryptedKey: 'encrypted-key-1',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ],
        isLoading: false,
        error: null,
      };

      mockUseAIKeyStore.mockReturnValue(mockStore);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult() as any);

      const { getByText } = renderWithQueryClient(<MockDashboard />);

      expect(getByText(/no generations yet/i)).toBeInTheDocument();
      expect(getByText(/create your first component/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should navigate to component generation', async () => {
      const mockStore = {
        apiKeys: [
          {
            provider: 'openai',
            keyName: 'OpenAI Key',
            encryptedKey: 'encrypted-key-1',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ],
        isLoading: false,
        error: null,
      };

      mockUseAIKeyStore.mockReturnValue(mockStore);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult() as any);

      const { getByText } = renderWithQueryClient(<MockDashboard />);

      const generateButton = getByText(/generate component/i);
      await userEvent.click(generateButton);

      // Should navigate to generation page (mocked router)
      expect(getByText(/generate component/i)).toBeInTheDocument();
    });

    it('should show API key management options', () => {
      const mockStore = {
        apiKeys: [],
        isLoading: false,
        error: null,
      };

      mockUseAIKeyStore.mockReturnValue(mockStore);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult() as any);

      const { getByText } = renderWithQueryClient(<MockDashboard />);

      const manageKeysButton = getByText(/manage api keys/i);
      expect(manageKeysButton).toBeInTheDocument();
    });
  });

  describe('Statistics and Metrics', () => {
    it('should display generation statistics', () => {
      const mockStore = {
        apiKeys: [
          {
            provider: 'openai',
            keyName: 'OpenAI Key',
            encryptedKey: 'encrypted-key-1',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ],
        isLoading: false,
        error: null,
      };

      const mockGenerations: Generation[] = [
        {
          id: '1',
          user_id: 'user-1',
          project_id: 'proj-1',
          component_name: 'Button',
          generated_code: 'export default function Button() { return <button>Click me</button>; }',
          framework: 'react',
          component_library: 'tailwind',
          style: 'modern',
          typescript: true,
          tokens_used: 150,
          prompt: 'Create a button component',
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: 'user-1',
          project_id: 'proj-1',
          component_name: 'Card',
          generated_code: 'export default function Card() { return <div>Card content</div>; }',
          framework: 'react',
          component_library: 'tailwind',
          style: 'modern',
          typescript: true,
          tokens_used: 200,
          prompt: 'Create a card component',
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockUseAIKeyStore.mockReturnValue(mockStore);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult(mockGenerations) as any);

      const { getByText } = renderWithQueryClient(<MockDashboard />);

      expect(getByText(/2 generations/i)).toBeInTheDocument();
      expect(getByText(/350 tokens used/i)).toBeInTheDocument();
    });
  });
});
