import { POST as postResendVerification } from '@/app/api/auth/resend-verification/route';
import { POST as postWelcome } from '@/app/api/auth/welcome/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/email/auth-emails', () => ({ sendWelcomeEmail: jest.fn() }));

const mockResend = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ auth: { resend: mockResend } })),
}));

import { verifySession } from '@/lib/api/auth';
import { sendWelcomeEmail } from '@/lib/email/auth-emails';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockSendWelcomeEmail = sendWelcomeEmail as jest.MockedFunction<typeof sendWelcomeEmail>;

const USER = { id: 'u1', email: 'user@test.com' };

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockResend.mockResolvedValue({ error: null });
  mockSendWelcomeEmail.mockResolvedValue(undefined);
});

describe('POST /api/auth/resend-verification', () => {
  function makeRequest(body: Record<string, unknown>) {
    return new Request('http://localhost/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('resends verification email successfully', async () => {
    const res = await postResendVerification(makeRequest({ email: 'user@test.com' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toMatch(/Verification email sent/i);
    expect(mockResend).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'signup',
        email: 'user@test.com',
      })
    );
  });

  it('returns 400 when email is missing', async () => {
    const res = await postResendVerification(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Email is required/i);
  });

  it('returns 400 when email is not a string', async () => {
    const res = await postResendVerification(makeRequest({ email: 123 }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Email is required/i);
  });

  it('returns 400 when supabase returns an error', async () => {
    mockResend.mockResolvedValue({ error: { message: 'Rate limit exceeded' } });
    const res = await postResendVerification(makeRequest({ email: 'user@test.com' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Rate limit exceeded');
  });

  it('returns 500 on unexpected error', async () => {
    mockResend.mockRejectedValue(new Error('supabase error'));
    const res = await postResendVerification(makeRequest({ email: 'user@test.com' }));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/Failed to resend verification email/i);
  });
});

describe('POST /api/auth/welcome', () => {
  it('sends welcome email successfully', async () => {
    const res = await postWelcome();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toMatch(/Welcome email sent/i);
    expect(mockSendWelcomeEmail).toHaveBeenCalledWith(USER.email);
  });

  it('returns 401 when user has no email', async () => {
    mockVerifySession.mockResolvedValue({ user: { id: 'u1', email: null } } as never);
    const res = await postWelcome();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 500 on unexpected error', async () => {
    mockSendWelcomeEmail.mockRejectedValue(new Error('email service error'));
    const res = await postWelcome();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/Failed to send welcome email/i);
  });
});
