import { render, screen } from '@testing-library/react';
import { CatalogClient } from '@/app/(dashboard)/catalog/catalog-client';
import { useCatalog } from '@/hooks/use-catalog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/hooks/use-catalog');
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
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <button className={className} {...props}>
      {children}
    </button>
  ),
}));
jest.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

const mockUseCatalog = useCatalog as jest.MockedFunction<typeof useCatalog>;

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const mockEntry = {
  id: 'entry-1',
  name: 'siza-web',
  display_name: 'Siza Web',
  type: 'service' as const,
  lifecycle: 'production' as const,
  owner_id: 'user-1',
  team: 'Platform',
  repository_url: 'https://github.com/Forge-Space/siza',
  documentation_url: null,
  tags: ['typescript', 'nextjs', 'react'] as string[],
  dependencies: ['forge-patterns'] as string[],
  project_id: null,
  parent_id: null,
  metadata: {},
  description: null,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

function renderWithProviders(ui: React.ReactElement) {
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

beforeEach(() => jest.clearAllMocks());

describe('CatalogClient', () => {
  it('shows loading skeleton while fetching', () => {
    mockUseCatalog.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useCatalog>);

    renderWithProviders(<CatalogClient />);
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
  });

  it('shows empty state when no entries', () => {
    mockUseCatalog.mockReturnValue({
      data: { entries: [], pagination: { page: 1, limit: 20, total: 0, pages: 1 } },
      isLoading: false,
    } as unknown as ReturnType<typeof useCatalog>);

    renderWithProviders(<CatalogClient />);
    expect(screen.getByText('Your Service Catalog')).toBeInTheDocument();
    expect(screen.getByText('Register First Service')).toBeInTheDocument();
  });

  it('renders catalog entries in grid view', () => {
    mockUseCatalog.mockReturnValue({
      data: {
        entries: [mockEntry],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useCatalog>);

    renderWithProviders(<CatalogClient />);
    expect(screen.getByText('Siza Web')).toBeInTheDocument();
    expect(screen.getByText('siza-web')).toBeInTheDocument();
    expect(screen.getByText('production')).toBeInTheDocument();
    expect(screen.getByText(/Platform/)).toBeInTheDocument();
  });

  it('renders tags with overflow count', () => {
    const entryWithManyTags = {
      ...mockEntry,
      tags: ['ts', 'react', 'next', 'node', 'docker'],
    };
    mockUseCatalog.mockReturnValue({
      data: {
        entries: [entryWithManyTags],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useCatalog>);

    renderWithProviders(<CatalogClient />);
    expect(screen.getByText('ts')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('shows dependency count', () => {
    mockUseCatalog.mockReturnValue({
      data: {
        entries: [mockEntry],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useCatalog>);

    renderWithProviders(<CatalogClient />);
    expect(screen.getByText('1 deps')).toBeInTheDocument();
  });

  it('shows pagination when multiple pages', () => {
    mockUseCatalog.mockReturnValue({
      data: {
        entries: [mockEntry],
        pagination: { page: 1, limit: 20, total: 45, pages: 3 },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useCatalog>);

    renderWithProviders(<CatalogClient />);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('hides pagination for single page', () => {
    mockUseCatalog.mockReturnValue({
      data: {
        entries: [mockEntry],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useCatalog>);

    renderWithProviders(<CatalogClient />);
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
  });

  it('shows production stats in subtitle', () => {
    mockUseCatalog.mockReturnValue({
      data: {
        entries: [mockEntry],
        pagination: { page: 1, limit: 20, total: 5, pages: 1 },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useCatalog>);

    renderWithProviders(<CatalogClient />);
    expect(screen.getByText('1 production')).toBeInTheDocument();
  });

  it('links catalog cards to detail pages', () => {
    mockUseCatalog.mockReturnValue({
      data: {
        entries: [mockEntry],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useCatalog>);

    renderWithProviders(<CatalogClient />);
    const link = screen.getByText('Siza Web').closest('a');
    expect(link).toHaveAttribute('href', '/catalog/entry-1');
  });
});
