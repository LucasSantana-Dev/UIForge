import { render, screen, waitFor } from '@testing-library/react';
import CatalogDetail from '@/components/catalog/CatalogDetail';

jest.mock('marked', () => ({
  marked: { parse: (content: string) => '<div>' + content + '</div>' },
}));

jest.mock('@/hooks/use-relationships', () => ({
  useRelationships: () => ({ data: null, isLoading: false }),
  useCreateRelationship: () => ({ mutate: jest.fn() }),
  useDeleteRelationship: () => ({ mutate: jest.fn() }),
}));

jest.mock('@/components/plugins/PluginSlot', () => ({
  __esModule: true,
  PluginSlot: () => null,
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockEntry = {
  id: 'entry-1',
  name: 'siza-web',
  display_name: 'Siza Web',
  type: 'service',
  lifecycle: 'production',
  owner_id: 'user-1',
  team: 'Platform',
  tags: ['typescript', 'nextjs'],
  dependencies: ['dep-1'],
  dependents: ['dep-2'],
  repository_url: 'https://github.com/Forge-Space/siza',
  documentation_url: 'https://docs.forgespace.co',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: null }),
  });
});

describe('CatalogDetail', () => {
  it('shows loading state initially', () => {
    (global.fetch as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<CatalogDetail entryId="entry-1" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders entry details after fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockEntry, isOwner: false }),
    });

    render(<CatalogDetail entryId="entry-1" />);

    await waitFor(() => {
      expect(screen.getByText('Siza Web')).toBeInTheDocument();
    });
    expect(screen.getByText('production')).toBeInTheDocument();
    expect(screen.getByText('Platform')).toBeInTheDocument();
  });

  it('renders tags', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockEntry, isOwner: false }),
    });

    render(<CatalogDetail entryId="entry-1" />);

    await waitFor(() => {
      expect(screen.getByText('typescript')).toBeInTheDocument();
    });
    expect(screen.getByText('nextjs')).toBeInTheDocument();
  });

  it('renders repository and documentation links', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockEntry, isOwner: false }),
    });

    render(<CatalogDetail entryId="entry-1" />);

    await waitFor(() => {
      expect(screen.getByText('Repository')).toBeInTheDocument();
    });
    expect(screen.getByText('Documentation')).toBeInTheDocument();
  });

  it('shows edit/delete buttons for owner', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockEntry, isOwner: true }),
    });

    render(<CatalogDetail entryId="entry-1" />);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('hides edit/delete buttons for non-owner', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockEntry, isOwner: false }),
    });

    render(<CatalogDetail entryId="entry-1" />);

    await waitFor(() => {
      expect(screen.getByText('Siza Web')).toBeInTheDocument();
    });
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('shows error when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<CatalogDetail entryId="entry-1" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch catalog entry')).toBeInTheDocument();
    });
  });

  it('renders dependencies as links', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockEntry, isOwner: false }),
    });

    render(<CatalogDetail entryId="entry-1" />);

    await waitFor(() => {
      expect(screen.getByText('Dependencies')).toBeInTheDocument();
    });
    const depLink = screen.getByText('dep-1');
    expect(depLink.closest('a')).toHaveAttribute('href', '/catalog/dep-1');
  });

  it('renders scorecard when present', async () => {
    const entryWithScorecard = {
      ...mockEntry,
      scorecard: {
        overall: 85,
        categories: [{ name: 'Security', score: 90 }],
      },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: entryWithScorecard, isOwner: false }),
    });

    render(<CatalogDetail entryId="entry-1" />);

    await waitFor(() => {
      expect(screen.getByText('Quality Scorecard')).toBeInTheDocument();
    });
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });
});
