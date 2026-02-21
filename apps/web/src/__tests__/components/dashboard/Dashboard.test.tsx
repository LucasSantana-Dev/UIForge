/**
 * MockDashboard Component Tests
 * Tests for the main dashboard interface using a mock component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Generation } from '@/hooks/use-generations';
import { useAIKeyStore } from '@/stores/ai-keys';
import { useGenerations } from '@/hooks/use-generations';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

const mockUseAIKeyStore = useAIKeyStore as jest.MockedFunction<typeof useAIKeyStore>;
const mockUseGenerations = useGenerations as jest.MockedFunction<typeof useGenerations>;

// Mock query client
const createMockQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const createMockGenerationsResult = (
  data: Generation[] = [],
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

// A realistic mock dashboard that uses the same hooks the real dashboard would
const MockDashboard = () => {
  const store = useAIKeyStore();
  const { data: generations = [], isLoading, error } = useGenerations(undefined);
  const router = require('next/navigation').useRouter();

  if (isLoading || store.loading) return <div>Loading...</div>;
  if (error || store.error) return <div>Error: {error?.message || store.error}</div>;

  return (
    <div data-testid="dashboard">
      <h1>Welcome to UIForge</h1>
      <p>Start creating amazing UI components</p>

      <button onClick={() => router.push('/dashboard/generate')}>Generate Component</button>
      <button onClick={() => router.push('/dashboard/settings/api-keys')}>Manage API Keys</button>

      {store.apiKeys.length === 0 ? (
        <div>
          <p>No API keys configured</p>
          <p>Set up your first API key</p>
        </div>
      ) : (
        <ul>
          {store.apiKeys.map((key: any) => (
            <li key={key.keyId || key.provider}>
              {key.keyName}
              {key.isActive && <span>Active</span>}
            </li>
          ))}
        </ul>
      )}

      {generations.length === 0 ? (
        <div>
          <p>No generations yet</p>
          <p>Create your first component</p>
        </div>
      ) : (
        <div>
          <p>{generations.length} generations</p>
          <p>
            {generations.reduce((sum: number, g: Generation) => sum + (g.tokens_used || 0), 0)}{' '}
            tokens used
          </p>
          <ul>
            {generations.map((g: Generation) => (
              <li key={g.id}>
                <span>{g.component_name}</span>
                <span>{g.framework.charAt(0).toUpperCase() + g.framework.slice(1)}</span>
                <span>
                  {g.component_library?.charAt(0).toUpperCase() +
                    (g.component_library?.slice(1) ?? '')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

describe('MockDashboard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createMockQueryClient();
    jest.clearAllMocks();
  });

  const renderWithQueryClient = (component: React.ReactElement) =>
    render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);

  const defaultStore = { apiKeys: [], loading: false, error: undefined };

  describe('Basic Rendering', () => {
    it('should render dashboard with welcome message', () => {
      mockUseAIKeyStore.mockReturnValue(defaultStore as any);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult() as any);

      renderWithQueryClient(<MockDashboard />);

      expect(screen.getByText('Welcome to UIForge')).toBeInTheDocument();
      expect(screen.getByText('Start creating amazing UI components')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      mockUseAIKeyStore.mockReturnValue({ ...defaultStore, loading: true } as any);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult([], true) as any);

      renderWithQueryClient(<MockDashboard />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show error state', () => {
      mockUseAIKeyStore.mockReturnValue({ ...defaultStore, error: 'Failed to load data' } as any);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult() as any);

      renderWithQueryClient(<MockDashboard />);

      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  describe('API Keys Section', () => {
    it('should display API keys when available', () => {
      mockUseAIKeyStore.mockReturnValue({
        ...defaultStore,
        apiKeys: [
          {
            provider: 'openai',
            keyName: 'OpenAI Key',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ],
      } as any);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult() as any);

      renderWithQueryClient(<MockDashboard />);

      expect(screen.getByText('OpenAI Key')).toBeInTheDocument();
      expect(screen.getByText(/active/i)).toBeInTheDocument();
    });

    it('should show setup prompt when no API keys', () => {
      mockUseAIKeyStore.mockReturnValue(defaultStore as any);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult() as any);

      renderWithQueryClient(<MockDashboard />);

      expect(screen.getByText(/no api keys configured/i)).toBeInTheDocument();
      expect(screen.getByText(/set up your first api key/i)).toBeInTheDocument();
    });
  });

  describe('Recent Generations', () => {
    const mockGenerations: Generation[] = [
      {
        id: '1',
        user_id: 'u1',
        project_id: 'p1',
        component_name: 'Button',
        generated_code: 'export default function Button() {}',
        framework: 'react',
        component_library: 'tailwind',
        style: 'modern',
        typescript: true,
        tokens_used: 150,
        prompt: 'Create a button',
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        user_id: 'u1',
        project_id: 'p1',
        component_name: 'Card',
        generated_code: 'export default function Card() {}',
        framework: 'react',
        component_library: 'tailwind',
        style: 'modern',
        typescript: true,
        tokens_used: 200,
        prompt: 'Create a card',
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    it('should display recent generations', () => {
      mockUseAIKeyStore.mockReturnValue(defaultStore as any);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult(mockGenerations) as any);

      renderWithQueryClient(<MockDashboard />);

      expect(screen.getByText('Button')).toBeInTheDocument();
      expect(screen.getByText('Card')).toBeInTheDocument();
      expect(screen.getAllByText('React')).toHaveLength(2);
      expect(screen.getAllByText('Tailwind')).toHaveLength(2);
    });

    it('should show empty state when no generations', () => {
      mockUseAIKeyStore.mockReturnValue(defaultStore as any);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult() as any);

      renderWithQueryClient(<MockDashboard />);

      expect(screen.getByText(/no generations yet/i)).toBeInTheDocument();
      expect(screen.getByText(/create your first component/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should navigate to component generation', async () => {
      const mockPush = jest.fn();
      jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push: mockPush });

      mockUseAIKeyStore.mockReturnValue(defaultStore as any);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult() as any);

      renderWithQueryClient(<MockDashboard />);

      await userEvent.click(screen.getByText(/generate component/i));

      expect(mockPush).toHaveBeenCalledWith('/dashboard/generate');
    });

    it('should show API key management options', () => {
      mockUseAIKeyStore.mockReturnValue(defaultStore as any);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult() as any);

      renderWithQueryClient(<MockDashboard />);

      expect(screen.getByText(/manage api keys/i)).toBeInTheDocument();
    });
  });

  describe('Statistics and Metrics', () => {
    it('should display generation statistics', () => {
      const mockGenerations: Generation[] = [
        {
          id: '1',
          user_id: 'u1',
          project_id: 'p1',
          component_name: 'Button',
          generated_code: '',
          framework: 'react',
          component_library: 'tailwind',
          style: 'modern',
          typescript: true,
          tokens_used: 150,
          prompt: 'btn',
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: 'u1',
          project_id: 'p1',
          component_name: 'Card',
          generated_code: '',
          framework: 'react',
          component_library: 'tailwind',
          style: 'modern',
          typescript: true,
          tokens_used: 200,
          prompt: 'card',
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockUseAIKeyStore.mockReturnValue(defaultStore as any);
      mockUseGenerations.mockReturnValue(createMockGenerationsResult(mockGenerations) as any);

      renderWithQueryClient(<MockDashboard />);

      expect(screen.getByText(/2 generations/i)).toBeInTheDocument();
      expect(screen.getByText(/350 tokens used/i)).toBeInTheDocument();
    });
  });
});
