import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailButton } from '../components/EmailButton';

interface EmailVerificationProps {
  confirmUrl: string;
}

export function EmailVerification({ confirmUrl }: EmailVerificationProps) {
  return (
    <EmailLayout preview="Verify your email address for Siza">
      <Text className="m-0 text-lg font-semibold text-[#18181b]">Verify your email</Text>
      <Text className="mt-2 text-sm text-[#52525b]">
        Thanks for signing up for Siza. Please verify your email address by clicking the button
        below.
      </Text>
      <Section className="mt-6 text-center">
        <EmailButton href={confirmUrl}>Verify email address</EmailButton>
      </Section>
      <Text className="mt-6 text-xs text-[#a1a1aa]">
        If the button doesn&apos;t work, copy and paste this URL into your browser: {confirmUrl}
      </Text>
    </EmailLayout>
  );
}

export default EmailVerification;
