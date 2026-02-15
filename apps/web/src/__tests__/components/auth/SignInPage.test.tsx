import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignInPage from '@/app/(auth)/signin/page';
import { mockSupabaseClient, resetSupabaseMocks } from '../../setup/supabase-mock';

// Mock Next.js router - already mocked in jest.setup.js but we need to access the mocks
const mockPush = jest.fn();
const mockRefresh = jest.fn();

// Override the global mock for this test file
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe('SignInPage', () => {
  beforeEach(() => {
    resetSupabaseMocks();
    mockPush.mockClear();
    mockRefresh.mockClear();
  });

  it('renders the sign in form', () => {
    render(<SignInPage />);

    expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles successful sign in', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' }, session: {} },
      error: null,
    });

    render(<SignInPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    // Should redirect to dashboard
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('handles sign in error', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials', name: 'AuthError', status: 400 },
    });

    render(<SignInPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Should not redirect
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows loading state during sign in', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { user: null, session: null }, error: null }), 100))
    );

    render(<SignInPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for loading state to be set
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
  });

  it('has link to sign up page', () => {
    render(<SignInPage />);

    const signUpLink = screen.getByRole('link', { name: /sign up/i });
    expect(signUpLink).toHaveAttribute('href', '/signup');
  });
});
