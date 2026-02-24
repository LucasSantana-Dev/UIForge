/**
 * Sign Up Page Component Tests
 * Tests for the user registration interface
 */

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpPage from '@/app/(auth)/signup/page';
import { TEST_CONFIG } from '../../../../../../test-config';

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
  signUp: jest.fn(),
  signIn: jest.fn(),
}));

// TODO: Enable when feature is implemented
describe.skip('SignUpPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render sign up form', () => {
    const { getByLabelText, getByRole } = render(<SignUpPage />);

    expect(getByLabelText(/email/i)).toBeInTheDocument();
    expect(getByLabelText(/password/i)).toBeInTheDocument();
    expect(getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('should show sign in link', () => {
    const { getByText } = render(<SignUpPage />);

    expect(getByText(/already have an account/i)).toBeInTheDocument();
    expect(getByText(/sign in/i)).toBeInTheDocument();
  });

  it('should validate email input', async () => {
    const { getByLabelText, getByRole, getByText } = render(<SignUpPage />);

    const emailInput = getByLabelText(/email/i);
    const signUpButton = getByRole('button', { name: /sign up/i });

    // Try to submit with empty email
    await userEvent.clear(emailInput);
    await userEvent.click(signUpButton);

    expect(getByText(/email is required/i)).toBeInTheDocument();
  });

  it('should validate password input', async () => {
    const { getByLabelText, getByRole, getByText } = render(<SignUpPage />);

    const passwordInput = getByLabelText(/password/i);
    const signUpButton = getByRole('button', { name: /sign up/i });

    // Try to submit with empty password
    await userEvent.clear(passwordInput);
    await userEvent.click(signUpButton);

    expect(getByText(/password is required/i)).toBeInTheDocument();
  });

  it('should validate password confirmation', async () => {
    const { getByLabelText, getByRole, getByText } = render(<SignUpPage />);

    const passwordInput = getByLabelText(/password/i);
    const confirmPasswordInput = getByLabelText(/confirm password/i);
    const signUpButton = getByRole('button', { name: /sign up/i });

    // Enter different passwords
    await userEvent.type(passwordInput, TEST_CONFIG.PASSWORDS.USER);
    await userEvent.type(confirmPasswordInput, 'different456');
    await userEvent.click(signUpButton);

    expect(getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const { getByLabelText, getByRole, getByText } = render(<SignUpPage />);

    const emailInput = getByLabelText(/email/i);
    const signUpButton = getByRole('button', { name: /sign up/i });

    // Enter invalid email
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(signUpButton);

    expect(getByText(/please enter a valid email/i)).toBeInTheDocument();
  });

  it('should validate password strength', async () => {
    const { getByLabelText, getByRole, getByText } = render(<SignUpPage />);

    const passwordInput = getByLabelText(/password/i);
    const confirmPasswordInput = getByLabelText(/confirm password/i);
    const signUpButton = getByRole('button', { name: /sign up/i });

    // Enter weak password
    await userEvent.type(passwordInput, '123');
    await userEvent.type(confirmPasswordInput, '123');
    await userEvent.click(signUpButton);

    expect(getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('should handle form submission with valid data', async () => {
    const { signUp } = require('@/lib/supabase/client');
    const { getByLabelText, getByRole } = render(<SignUpPage />);

    const emailInput = getByLabelText(/email/i);
    const passwordInput = getByLabelText(/password/i);
    const confirmPasswordInput = getByLabelText(/confirm password/i);
    const signUpButton = getByRole('button', { name: /sign up/i });

    // Fill form with valid data
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, TEST_CONFIG.PASSWORDS.USER);
    await userEvent.type(confirmPasswordInput, 'password123');

    // Submit form
    await userEvent.click(signUpButton);

    // Should call signUp function
    expect(signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: TEST_CONFIG.PASSWORDS.USER,
    });
  });

  it('should show loading state during submission', async () => {
    const { signUp } = require('@/lib/supabase/client');
    signUp.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { getByLabelText, getByRole } = render(<SignUpPage />);

    const emailInput = getByLabelText(/email/i);
    const passwordInput = getByLabelText(/password/i);
    const confirmPasswordInput = getByLabelText(/confirm password/i);
    const signUpButton = getByRole('button', { name: /sign up/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, TEST_CONFIG.PASSWORDS.USER);
    await userEvent.type(confirmPasswordInput, 'password123');
    await userEvent.click(signUpButton);

    // Should show loading state
    expect(signUpButton).toBeDisabled();
    expect(signUpButton).toHaveTextContent(/signing up/i);
  });

  it('should handle sign up errors', async () => {
    const { signUp } = require('@/lib/supabase/client');
    signUp.mockRejectedValue(new Error('User already exists'));

    const { getByLabelText, getByRole, getByText } = render(<SignUpPage />);

    const emailInput = getByLabelText(/email/i);
    const passwordInput = getByLabelText(/password/i);
    const confirmPasswordInput = getByLabelText(/confirm password/i);
    const signUpButton = getByRole('button', { name: /sign up/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, TEST_CONFIG.PASSWORDS.USER);
    await userEvent.type(confirmPasswordInput, 'password123');
    await userEvent.click(signUpButton);

    // Should show error message
    expect(getByText(/user already exists/i)).toBeInTheDocument();
  });

  it('should navigate to sign in page', async () => {
    const { useRouter } = require('next/navigation');
    const mockPush = jest.fn();
    useRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
    });

    const { getByText } = render(<SignUpPage />);

    const signInLink = getByText(/sign in/i);
    await userEvent.click(signInLink);

    expect(mockPush).toHaveBeenCalledWith('/signin');
  });

  it('should handle redirect after successful sign up', async () => {
    const { signUp } = require('@/lib/supabase/client');
    const { useRouter } = require('next/navigation');
    const mockReplace = jest.fn();
    useRouter.mockReturnValue({
      push: jest.fn(),
      replace: mockReplace,
    });

    signUp.mockResolvedValue({ user: { id: '123', email: 'test@example.com' } });

    const { getByLabelText, getByRole } = render(<SignUpPage />);

    const emailInput = getByLabelText(/email/i);
    const passwordInput = getByLabelText(/password/i);
    const confirmPasswordInput = getByLabelText(/confirm password/i);
    const signUpButton = getByRole('button', { name: /sign up/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, TEST_CONFIG.PASSWORDS.USER);
    await userEvent.type(confirmPasswordInput, 'password123');
    await userEvent.click(signUpButton);

    // Should redirect to dashboard
    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('should show terms and conditions checkbox', () => {
    const { getByLabelText } = render(<SignUpPage />);

    expect(getByLabelText(/i agree to the terms and conditions/i)).toBeInTheDocument();
  });

  it('should require terms acceptance', async () => {
    const { getByLabelText, getByRole, getByText } = render(<SignUpPage />);

    const emailInput = getByLabelText(/email/i);
    const passwordInput = getByLabelText(/password/i);
    const confirmPasswordInput = getByLabelText(/confirm password/i);
    const signUpButton = getByRole('button', { name: /sign up/i });

    // Fill form but don't accept terms
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, TEST_CONFIG.PASSWORDS.USER);
    await userEvent.type(confirmPasswordInput, 'password123');
    await userEvent.click(signUpButton);

    expect(getByText(/you must accept the terms and conditions/i)).toBeInTheDocument();
  });
});
