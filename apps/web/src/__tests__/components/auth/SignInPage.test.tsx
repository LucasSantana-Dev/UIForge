/**
 * Sign In Page Component Tests
 * Tests for the user authentication interface
 */

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignInPage } from '@/components/auth/SignInPage';
import { TEST_CONFIG } from '../../../../../test-config';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase auth
jest.mock('@/lib/supabase/client', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
}));

describe('SignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render sign in form', () => {
    const { getByLabelText, getByRole } = render(<SignInPage />);

    expect(getByLabelText(/email/i)).toBeInTheDocument();
    expect(getByLabelText(/password/i)).toBeInTheDocument();
    expect(getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show sign up link', () => {
    const { getByText } = render(<SignInPage />);

    expect(getByText(/don't have an account/i)).toBeInTheDocument();
    expect(getByText(/sign up/i)).toBeInTheDocument();
  });

  it('should validate email input', async () => {
    const { getByLabelText, getByRole, getByText } = render(<SignInPage />);

    const emailInput = getByLabelText(/email/i);
    const signInButton = getByRole('button', { name: /sign in/i });

    // Try to submit with empty email
    await userEvent.clear(emailInput);
    await userEvent.click(signInButton);

    expect(getByText(/email is required/i)).toBeInTheDocument();
  });

  it('should validate password input', async () => {
    const { getByLabelText, getByRole, getByText } = render(<SignInPage />);

    const passwordInput = getByLabelText(/password/i);
    const signInButton = getByRole('button', { name: /sign in/i });

    // Try to submit with empty password
    await userEvent.clear(passwordInput);
    await userEvent.click(signInButton);

    expect(getByText(/password is required/i)).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const { getByLabelText, getByRole, getByText } = render(<SignInPage />);

    const emailInput = getByLabelText(/email/i);
    const signInButton = getByRole('button', { name: /sign in/i });

    // Enter invalid email
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(signInButton);

    expect(getByText(/please enter a valid email/i)).toBeInTheDocument();
  });

  it('should handle form submission with valid data', async () => {
    const { signIn } = require('@/lib/supabase/client');
    const { getByLabelText, getByRole } = render(<SignInPage />);

    const emailInput = getByLabelText(/email/i);
    const passwordInput = getByLabelText(/password/i);
    const signInButton = getByRole('button', { name: /sign in/i });

    // Fill form with valid data
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, TEST_CONFIG.PASSWORDS.USER);

    // Submit form
    await userEvent.click(signInButton);

    // Should call signIn function
    expect(signIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: TEST_CONFIG.PASSWORDS.USER,
    });
  });

  it('should show loading state during submission', async () => {
    const { signIn } = require('@/lib/supabase/client');
    signIn.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { getByLabelText, getByRole } = render(<SignInPage />);

    const emailInput = getByLabelText(/email/i);
    const passwordInput = getByLabelText(/password/i);
    const signInButton = getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, TEST_CONFIG.PASSWORDS.USER);
    await userEvent.click(signInButton);

    // Should show loading state
    expect(signInButton).toBeDisabled();
    expect(signInButton).toHaveTextContent(/signing in/i);
  });

  it('should handle sign in errors', async () => {
    const { signIn } = require('@/lib/supabase/client');
    signIn.mockRejectedValue(new Error('Invalid credentials'));

    const { getByLabelText, getByRole, getByText } = render(<SignInPage />);

    const emailInput = getByLabelText(/email/i);
    const passwordInput = getByLabelText(/password/i);
    const signInButton = getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(signInButton);

    // Should show error message
    expect(getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('should navigate to sign up page', async () => {
    const { useRouter } = require('next/navigation');
    const mockPush = jest.fn();
    useRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
    });

    const { getByText } = render(<SignInPage />);

    const signUpLink = getByText(/sign up/i);
    await userEvent.click(signUpLink);

    expect(mockPush).toHaveBeenCalledWith('/signup');
  });

  it('should handle redirect after successful sign in', async () => {
    const { signIn } = require('@/lib/supabase/client');
    const { useRouter } = require('next/navigation');
    const mockReplace = jest.fn();
    useRouter.mockReturnValue({
      push: jest.fn(),
      replace: mockReplace,
    });

    signIn.mockResolvedValue({ user: { id: '123', email: 'test@example.com' } });

    const { getByLabelText, getByRole } = render(<SignInPage />);

    const emailInput = getByLabelText(/email/i);
    const passwordInput = getByLabelText(/password/i);
    const signInButton = getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, TEST_CONFIG.PASSWORDS.USER);
    await userEvent.click(signInButton);

    // Should redirect to dashboard
    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('should remember me option', () => {
    const { getByLabelText } = render(<SignInPage />);

    expect(getByLabelText(/remember me/i)).toBeInTheDocument();
  });

  it('should show forgot password link', () => {
    const { getByText } = render(<SignInPage />);

    expect(getByText(/forgot password/i)).toBeInTheDocument();
  });
});
