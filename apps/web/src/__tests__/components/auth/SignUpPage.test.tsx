/**
 * Sign Up Page Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpPage from '@/app/(auth)/signup/page';

const mockSignUp = jest.fn();
const mockSignInWithGoogle = jest.fn();
const mockSignInWithGitHub = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { signUp: mockSignUp } }),
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

describe('SignUpPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignUp.mockResolvedValue({ error: null });
    mockSignInWithGoogle.mockResolvedValue({ error: null });
    mockSignInWithGitHub.mockResolvedValue({ error: null });
  });

  it('should render sign up form', () => {
    render(<SignUpPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should show sign in link', () => {
    render(<SignUpPage />);
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/signin');
  });

  it('should show password requirements', () => {
    render(<SignUpPage />);
    expect(screen.getByText(/must be at least 6 characters/i)).toBeInTheDocument();
  });

  it('should submit form with email and password', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@example.com', password: 'password123' })
      );
    });
  });

  it('should show success message after sign up', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  it('should show error on sign up failure', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'User already registered' } });
    const user = userEvent.setup();
    render(<SignUpPage />);
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/user already registered/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    let resolveSignUp: (value: any) => void;
    mockSignUp.mockReturnValue(
      new Promise((resolve) => {
        resolveSignUp = resolve;
      })
    );
    const user = userEvent.setup();
    render(<SignUpPage />);
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    resolveSignUp!({ error: null });
  });

  it('should render OAuth buttons', () => {
    render(<SignUpPage />);
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with github/i })).toBeInTheDocument();
  });

  it('should handle GitHub OAuth error', async () => {
    mockSignInWithGitHub.mockResolvedValue({ error: { message: 'GitHub auth failed' } });
    const user = userEvent.setup();
    render(<SignUpPage />);
    await user.click(screen.getByRole('button', { name: /continue with github/i }));
    await waitFor(() => {
      expect(screen.getByText(/github auth failed/i)).toBeInTheDocument();
    });
  });
});
