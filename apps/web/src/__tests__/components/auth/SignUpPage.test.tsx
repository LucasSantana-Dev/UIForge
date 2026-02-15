import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUpPage from '@/app/(auth)/signup/page';
import { mockSupabaseClient, resetSupabaseMocks } from '../../setup/supabase-mock';

describe('SignUpPage', () => {
  beforeEach(() => {
    resetSupabaseMocks();
  });

  it('renders the sign up form', () => {
    render(<SignUpPage />);

    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('handles successful sign up', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null,
    });

    render(<SignUpPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      });
    });

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  it('handles sign up error', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Email already registered', name: 'AuthError', status: 400 },
    });

    render(<SignUpPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, {
      target: { value: 'existing@example.com' },
    });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows loading state during sign up', async () => {
    mockSupabaseClient.auth.signUp.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { user: null }, error: null }), 100))
    );

    render(<SignUpPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for loading state to be set
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    });
  });

  it('has link to sign in page', () => {
    render(<SignUpPage />);

    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toHaveAttribute('href', '/signin');
  });
});
