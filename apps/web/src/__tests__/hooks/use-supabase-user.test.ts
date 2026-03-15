import { renderHook, waitFor } from '@testing-library/react';

const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockSetUser = jest.fn();
const mockSetLoading = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}));

jest.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    user: null,
    loading: false,
    setUser: mockSetUser,
    setLoading: mockSetLoading,
  }),
}));

import { useSupabaseUser } from '@/hooks/use-supabase-user';

describe('useSupabaseUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
  });

  it('calls getSession on mount', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    renderHook(() => useSupabaseUser());

    await waitFor(() => expect(mockGetSession).toHaveBeenCalled());
  });

  it('sets user from session', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    renderHook(() => useSupabaseUser());

    await waitFor(() => expect(mockSetUser).toHaveBeenCalledWith(mockUser));
  });

  it('sets user to null when no session', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    renderHook(() => useSupabaseUser());

    await waitFor(() => expect(mockSetUser).toHaveBeenCalledWith(null));
  });

  it('registers auth state change listener', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    renderHook(() => useSupabaseUser());

    await waitFor(() => expect(mockOnAuthStateChange).toHaveBeenCalled());
  });

  it('unsubscribes on unmount', async () => {
    const unsubscribe = jest.fn();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe } },
    });

    const { unmount } = renderHook(() => useSupabaseUser());

    await waitFor(() => expect(mockOnAuthStateChange).toHaveBeenCalled());
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
