/**
 * Sign In Page Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignInPage from '@/app/(auth)/signin/page';

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignInWithGoogle = jest.fn();
const mockSignInWithGitHub = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), refresh: mockRefresh }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { signInWithPassword: mockSignInWithPassword } }),
}));

jest.mock('@/lib/auth/oauth', () => ({
  signInWithGoogle: (...args: any[]) => mockSignInWithGoogle(...args),
  signInWithGitHub: (...args: any[]) => mockSignInWithGitHub(...args),
}));

jest.mock('@/components/auth/oauth-button', () => ({
  OAuthButton: ({ provider, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      Continue with {provider === 'google' ? 'Google' : 'GitHub'}
    </button>
  ),
}));

describe('SignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockSignInWithGoogle.mockResolvedValue({ error: null });
    mockSignInWithGitHub.mockResolvedValue({ error: null });
  });

  it('should render sign in form with email and password', () => {
    render(<SignInPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show sign up link', () => {
    render(<SignInPage />);
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/signup');
  });

  it('should show forgot password link', () => {
    render(<SignInPage />);
    expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute(
      'href',
      '/forgot-password'
    );
  });

  it('should submit form with email and password', async () => {
    const user = userEvent.setup();
    render(<SignInPage />);
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should redirect to dashboard on success', async () => {
    const user = userEvent.setup();
    render(<SignInPage />);
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show error on sign in failure', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
    const user = userEvent.setup();
    render(<SignInPage />);
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    let resolveSignIn: (value: any) => void;
    mockSignInWithPassword.mockReturnValue(
      new Promise((resolve) => {
        resolveSignIn = resolve;
      })
    );
    const user = userEvent.setup();
    render(<SignInPage />);
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    resolveSignIn!({ error: null });
  });

  it('should render OAuth buttons', () => {
    render(<SignInPage />);
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with github/i })).toBeInTheDocument();
  });

  it('should handle Google OAuth error', async () => {
    mockSignInWithGoogle.mockResolvedValue({ error: { message: 'Google auth failed' } });
    const user = userEvent.setup();
    render(<SignInPage />);
    await user.click(screen.getByRole('button', { name: /continue with google/i }));
    await waitFor(() => {
      expect(screen.getByText(/google auth failed/i)).toBeInTheDocument();
    });
  });
});
