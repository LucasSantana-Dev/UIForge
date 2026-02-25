import { createElement } from 'react';
import { sendEmail } from './service';
import { Welcome } from '@/emails/templates/Welcome';
import { getFeatureFlag } from '@/lib/features/flags';

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

export async function sendWelcomeEmail(to: string) {
  if (!getFeatureFlag('ENABLE_RESEND_EMAILS')) return;

  return sendEmail({
    to,
    subject: 'Welcome to Siza',
    react: createElement(Welcome, {
      dashboardUrl: `${APP_URL}/dashboard`,
    }),
  });
}

export async function sendVerificationEmail(to: string, token: string) {
  if (!getFeatureFlag('ENABLE_RESEND_EMAILS')) return;

  const { EmailVerification } = await import('@/emails/templates/EmailVerification');

  return sendEmail({
    to,
    subject: 'Verify your email - Siza',
    react: createElement(EmailVerification, {
      confirmUrl: `${APP_URL}/auth/callback?token=${token}&type=signup`,
    }),
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  if (!getFeatureFlag('ENABLE_RESEND_EMAILS')) return;

  const { PasswordReset } = await import('@/emails/templates/PasswordReset');

  return sendEmail({
    to,
    subject: 'Reset your password - Siza',
    react: createElement(PasswordReset, {
      resetUrl: `${APP_URL}/reset-password?token=${token}`,
    }),
  });
}

export async function sendEmailChangeEmail(to: string, newEmail: string, token: string) {
  if (!getFeatureFlag('ENABLE_RESEND_EMAILS')) return;

  const { EmailChange } = await import('@/emails/templates/EmailChange');

  return sendEmail({
    to,
    subject: 'Confirm your new email - Siza',
    react: createElement(EmailChange, {
      confirmUrl: `${APP_URL}/auth/callback?token=${token}&type=email_change`,
      newEmail,
    }),
  });
}
