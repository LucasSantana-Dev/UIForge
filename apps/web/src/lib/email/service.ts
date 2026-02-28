import type { ReactElement } from 'react';
import { getResendClient } from './resend';

interface SendEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@forgespace.co';
const FROM_NAME = process.env.RESEND_FROM_NAME ?? 'Siza';
const REPLY_TO = process.env.RESEND_REPLY_TO_EMAIL ?? 'support@forgespace.co';

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    replyTo: REPLY_TO,
    to,
    subject,
    react,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}
