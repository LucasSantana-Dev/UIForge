import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailButton } from '../components/EmailButton';

interface PasswordResetProps {
  resetUrl: string;
}

export function PasswordReset({ resetUrl }: PasswordResetProps) {
  return (
    <EmailLayout preview="Reset your Siza password">
      <Text className="m-0 text-lg font-semibold text-[#18181b]">Reset your password</Text>
      <Text className="mt-2 text-sm text-[#52525b]">
        We received a request to reset your password. Click the button below to choose a new one.
        This link expires in 1 hour.
      </Text>
      <Section className="mt-6 text-center">
        <EmailButton href={resetUrl}>Reset password</EmailButton>
      </Section>
      <Text className="mt-6 text-xs text-[#a1a1aa]">
        If you didn&apos;t request a password reset, you can safely ignore this email. Your password
        won&apos;t change.
      </Text>
    </EmailLayout>
  );
}

export default PasswordReset;
