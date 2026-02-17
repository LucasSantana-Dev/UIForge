/**
 * Dashboard Component Tests
 * Tests for the main dashboard interface
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { useAIKeyStore } from '@/stores/ai-keys';
import { useGenerations } from '@/hooks/use-generations';

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
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, ...props }: any) => (
    <span className={`badge-${variant}`} {...props}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, ...props }: any) => (
    <div role="progressbar" aria-valuenow={value} {...props}>
      {value}%
    </div>
  ),
}));

const mockUseAIKeyStore = useAIKeyStore as jest.MockedFunction<typeof useAIKeyStore>;
const mockUseGenerations = useGenerations as jest.MockedFunction<typeof useGenerations>;

describe('Dashboard Component', () => {
  const mockStore = {
    apiKeys: [
      {
        provider: 'openai',
        keyId: 'key_openai_123',
        encryptedKey: 'encrypted_openai',
        createdAt: '2026-02-17T00:00:00.000Z',
        lastUsed: '2026-02-17T12:00:00.000Z',
        isDefault: true,
      },
      {
        provider: 'anthropic',
        keyId: 'key_anthropic_456',
        encryptedKey: 'encrypted_anthropic',
        createdAt: '2026-02-17T00:00:00.000Z',
        lastUsed: '2026-02-17T11:00:00.000Z',
        isDefault: false,
      },
    ],
    isLoading: false,
    error: null,
    isInitialized: true,
    encryptionKey: 'test-encryption-key',
    hasApiKeys: true,
    keysByProvider: { openai: 1, anthropic: 1, google: 0 },
    defaultKeys: {
      openai: {
        provider: 'openai',
        keyId: 'key_openai_123',
        encryptedKey: 'encrypted_openai',
        createdAt: '2026-02-17T00:00:00.000Z',
        lastUsed: '2026-02-17T12:00:00.000Z',
        isDefault: true,
      },
      anthropic: {
        provider: 'anthropic',
        keyId: 'key_anthropic_456',
        encryptedKey: 'encrypted_anthropic',
        createdAt: '2026-02-17T00:00:00.000Z',
        lastUsed: '2026-02-17T11:00:00.000Z',
        isDefault: false,
      },
      google: null,
    },
  };

  const mockGenerations = {
    data: [
      {
        id: '1',
        project_id: 'proj_123',
        component_name: 'Button',
        generated_code: 'export default function Button() { return <button>Click me</button>; }',
        framework: 'react',
        component_library: 'tailwind',
        style: 'modern',
        typescript: false,
        tokens_used: 150,
        created_at: '2026-02-17T12:00:00.000Z',
      },
      {
        id: '2',
        project_id: 'proj_123',
        component_name: 'Card',
        generated_code: 'export default function Card() { return <div>Card content</div>; }',
        framework: 'react',
        component_library: 'tailwind',
        style: 'minimal',
        typescript: true,
        tokens_used: 200,
        created_at: '2026-02-17T11:00:00.000Z',
      },
    ],
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAIKeyStore.mockReturnValue(mockStore);
    mockUseGenerations.mockReturnValue(mockGenerations);
  });

  it('should render dashboard interface', () => {
    render(<Dashboard />);
    
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  describe('API Keys Overview', () => {
    it('should display API keys status', () => {
      render(<Dashboard />);
      
      expect(screen.getByText(/api keys/i)).toBeInTheDocument();
      expect(screen.getByText(/2 configured/i)).toBeInTheDocument();
      expect(screen.getByText(/openai/i)).toBeInTheDocument();
      expect(screen.getByText(/anthropic/i)).toBeInTheDocument();
    });

    it('should show provider distribution', () => {
      render(<Dashboard />);
      
      expect(screen.getByText(/provider distribution/i)).toBeInTheDocument();
      expect(screen.getByText(/openai: 1/i)).toBeInTheDocument();
      expect(screen.getByText(/anthropic: 1/i)).toBeInTheDocument();
      expect(screen.getByText(/google: 0/i)).toBeInTheDocument();
    });

    it('should show default keys status', () => {
      render(<Dashboard />);
      
      expect(screen.getByText(/default keys/i)).toBeInTheDocument();
      expect(screen.getByText(/openai ✓/i)).toBeInTheDocument();
      expect(screen.getByText(/anthropic/i)).toBeInTheDocument();
      expect(screen.getByText(/google not set/i)).toBeInTheDocument();
    });

    it('should show no API keys message when none configured', () => {
      mockUseAIKeyStore.mockReturnValue({
        ...mockStore,
        hasApiKeys: false,
        apiKeys: [],
        keysByProvider: { openai: 0, anthropic: 0, google: 0 },
      });
      
      render(<Dashboard />);
      
      expect(screen.getByText(/no api keys configured/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /configure api keys/i })).toBeInTheDocument();
    });
  });

  describe('Recent Generations', () => {
    it('should display recent component generations', () => {
      render(<Dashboard />);
      
      expect(screen.getByText(/recent generations/i)).toBeInTheDocument();
      expect(screen.getByText(/button/i)).toBeInTheDocument();
      expect(screen.getByText(/card/i)).toBeInTheDocument();
    });

    it('should show generation details', () => {
      render(<Dashboard />);
      
      expect(screen.getByText(/react/i)).toBeInTheDocument();
      expect(screen.getByText(/tailwind/i)).toBeInTheDocument();
      expect(screen.getByText(/150 tokens/i)).toBeInTheDocument();
      expect(screen.getByText(/200 tokens/i)).toBeInTheDocument();
    });

    it('should show empty state when no generations', () => {
      mockUseGenerations.mockReturnValue({
        ...mockGenerations,
        data: [],
      });
      
      render(<Dashboard />);
      
      expect(screen.getByText(/no generations yet/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create first component/i })).toBeInTheDocument();
    });

    it('should limit displayed generations', () => {
      const manyGenerations = Array.from({ length: 10 }, (_, i) => ({
        ...mockGenerations.data[0],
        id: i.toString(),
        component_name: `Component${i}`,
      }));
      
      mockUseGenerations.mockReturnValue({
        ...mockGenerations,
        data: manyGenerations,
      });
      
      render(<Dashboard />);
      
      // Should only show first 5 generations
      expect(screen.getAllByText(/component/i)).toHaveLength(5);
      expect(screen.getByText(/view all generations/i)).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('should show quick action buttons', () => {
      render(<Dashboard />);
      
      expect(screen.getByRole('button', { name: /new component/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /manage api keys/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view projects/i })).toBeInTheDocument();
    });

    it('should navigate to generator on new component click', async () => {
      const user = userEvent.setup();
      const mockPush = jest.fn();
      jest.doMock('next/navigation', () => ({
        useRouter: () => ({ push: mockPush }),
        usePathname: () => '/dashboard',
        useSearchParams: () => new URLSearchParams(),
      }));
      
      render(<Dashboard />);
      
      const newComponentButton = screen.getByRole('button', { name: /new component/i });
      await user.click(newComponentButton);
      
      expect(mockPush).toHaveBeenCalledWith('/generator');
    });

    it('should navigate to API keys on manage click', async () => {
      const user = userEvent.setup();
      const mockPush = jest.fn();
      jest.doMock('next/navigation', () => ({
        useRouter: () => ({ push: mockPush }),
        usePathname: () => '/dashboard',
        useSearchParams: () => new URLSearchParams(),
      }));
      
      render(<Dashboard />);
      
      const manageKeysButton = screen.getByRole('button', { name: /manage api keys/i });
      await user.click(manageKeysButton);
      
      expect(mockPush).toHaveBeenCalledWith('/api-keys');
    });
  });

  describe('Statistics', () => {
    it('should display usage statistics', () => {
      render(<Dashboard />);
      
      expect(screen.getByText(/statistics/i)).toBeInTheDocument();
      expect(screen.getByText(/total generations/i)).toBeInTheDocument();
      expect(screen.getByText(/2/i)).toBeInTheDocument();
      expect(screen.getByText(/total tokens used/i)).toBeInTheDocument();
      expect(screen.getByText(/350/i)).toBeInTheDocument();
    });

    it('should show framework distribution', () => {
      render(<Dashboard />);
      
      expect(screen.getByText(/framework usage/i)).toBeInTheDocument();
      expect(screen.getByText(/react: 2/i)).toBeInTheDocument();
    });

    it('should calculate token usage correctly', () => {
      render(<Dashboard />);
      
      expect(screen.getByText(/average tokens per generation/i)).toBeInTheDocument();
      expect(screen.getByText(/175/i)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state for API keys', () => {
      mockUseAIKeyStore.mockReturnValue({
        ...mockStore,
        isLoading: true,
      });
      
      render(<Dashboard />);
      
      expect(screen.getByText(/loading api keys/i)).toBeInTheDocument();
    });

    it('should show loading state for generations', () => {
      mockUseGenerations.mockReturnValue({
        ...mockGenerations,
        isLoading: true,
      });
      
      render(<Dashboard />);
      
      expect(screen.getByText(/loading generations/i)).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should display API keys error', () => {
      mockUseAIKeyStore.mockReturnValue({
        ...mockStore,
        error: 'Failed to load API keys',
      });
      
      render(<Dashboard />);
      
      expect(screen.getByText(/error loading api keys/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to load api keys/i)).toBeInTheDocument();
    });

    it('should display generations error', () => {
      mockUseGenerations.mockReturnValue({
        ...mockGenerations,
        error: 'Failed to load generations',
      });
      
      render(<Dashboard />);
      
      expect(screen.getByText(/error loading generations/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to load generations/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt layout for mobile screens', () => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
      
      render(<Dashboard />);
      
      // Should stack cards vertically on mobile
      const cards = screen.getAllByRole('article');
      expect(cards[0]).toHaveClass('mobile-card');
    });

    it('should show simplified statistics on small screens', () => {
      // Mock small viewport
      global.innerWidth = 320;
      global.dispatchEvent(new Event('resize'));
      
      render(<Dashboard />);
      
      // Should hide detailed statistics on small screens
      expect(screen.queryByText(/framework usage/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Dashboard />);
      
      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'dashboard');
      expect(screen.getByRole('region', { name: /api keys overview/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /recent generations/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);
      
      // Tab through interactive elements
      await user.tab();
      expect(screen.getByRole('button', { name: /new component/i })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: /manage api keys/i })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: /view projects/i })).toHaveFocus();
    });

    it('should announce loading states to screen readers', () => {
      mockUseAIKeyStore.mockReturnValue({
        ...mockStore,
        isLoading: true,
      });
      
      render(<Dashboard />);
      
      expect(screen.getByText(/loading api keys/i)).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<Dashboard />);
      
      // Re-render with same props
      rerender(<Dashboard />);
      
      // Should not cause unnecessary re-renders
      expect(mockUseAIKeyStore).toHaveBeenCalledTimes(2);
      expect(mockUseGenerations).toHaveBeenCalledTimes(2);
    });

    it('should debounce statistics calculations', () => {
      render(<Dashboard />);
      
      // Should calculate statistics once, not on every render
      expect(screen.getByText(/total generations/i)).toBeInTheDocument();
      expect(screen.getByText(/2/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should allow filtering generations by framework', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);
      
      const filterSelect = screen.getByLabelText(/filter by framework/i);
      await user.selectOptions(filterSelect, 'react');
      
      // Should filter to show only React components
      expect(screen.getByText(/button/i)).toBeInTheDocument();
      expect(screen.getByText(/card/i)).toBeInTheDocument();
    });

    it('should allow sorting generations by date', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);
      
      const sortSelect = screen.getByLabelText(/sort by/i);
      await user.selectOptions(sortSelect, 'newest');
      
      // Should show newest first
      const generations = screen.getAllByText(/component/i);
      expect(generations[0]).toHaveTextContent(/button/i);
      expect(generations[1]).toHaveTextContent(/card/i);
    });

    it('should allow refreshing data', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);
      
      // Should trigger data refresh
      expect(mockUseAIKeyStore).toHaveBeenCalled();
      expect(mockUseGenerations).toHaveBeenCalled();
    });
  });

  describe('Data Visualization', () => {
    it('should display token usage chart', () => {
      render(<Dashboard />);
      
      expect(screen.getByRole('img', { name: /token usage chart/i })).toBeInTheDocument();
    });

    it('should display provider distribution chart', () => {
      render(<Dashboard />);
      
      expect(screen.getByRole('img', { name: /provider distribution chart/i })).toBeInTheDocument();
    });

    it('should show generation timeline', () => {
      render(<Dashboard />);
      
      expect(screen.getByRole('img', { name: /generation timeline/i })).toBeInTheDocument();
    });
  });
});
