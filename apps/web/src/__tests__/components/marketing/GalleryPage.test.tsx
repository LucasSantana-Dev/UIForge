import { render, screen, waitFor } from '@testing-library/react';
import GalleryPage from '@/app/(marketing)/gallery/page';

const mockUseSupabaseUser = jest.fn();

jest.mock('@/hooks/use-supabase-user', () => ({
  useSupabaseUser: () => mockUseSupabaseUser(),
}));

describe('GalleryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        generations: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
        },
        message: 'No featured generations yet',
      }),
    }) as jest.Mock;
  });

  it('shows signed-out empty-state actions', async () => {
    mockUseSupabaseUser.mockReturnValue({ user: null, loading: false });

    render(<GalleryPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /no featured generations yet/i })
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: /browse templates/i })).toHaveAttribute(
      'href',
      '/templates'
    );
    expect(screen.getByRole('link', { name: /start free/i })).toHaveAttribute('href', '/signup');
  });

  it('shows signed-in empty-state actions', async () => {
    mockUseSupabaseUser.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      loading: false,
    });

    render(<GalleryPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /no featured generations yet/i })
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: /browse templates/i })).toHaveAttribute(
      'href',
      '/templates'
    );
    expect(screen.getByRole('link', { name: /generate now/i })).toHaveAttribute(
      'href',
      '/generate'
    );
  });

  it('hides auth-dependent empty-state actions while auth is loading', async () => {
    mockUseSupabaseUser.mockReturnValue({ user: null, loading: true });

    render(<GalleryPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /no featured generations yet/i })
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: /browse templates/i })).toHaveAttribute(
      'href',
      '/templates'
    );
    expect(screen.queryByRole('link', { name: /start free/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /generate now/i })).not.toBeInTheDocument();
  });
});
