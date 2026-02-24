import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailButton } from '../components/EmailButton';

interface EmailChangeProps {
  confirmUrl: string;
  newEmail: string;
}

export function EmailChange({ confirmUrl, newEmail }: EmailChangeProps) {
  return (
    <EmailLayout preview="Confirm your new email address for Siza">
      <Text className="m-0 text-lg font-semibold text-[#18181b]">Confirm email change</Text>
      <Text className="mt-2 text-sm text-[#52525b]">
        You requested to change your email address to <strong>{newEmail}</strong>. Click the button
        below to confirm.
      </Text>
      <Section className="mt-6 text-center">
        <EmailButton href={confirmUrl}>Confirm new email</EmailButton>
      </Section>
      <Text className="mt-6 text-xs text-[#a1a1aa]">
        If you didn&apos;t request this change, please secure your account immediately.
      </Text>
    </EmailLayout>
  );
}

export default EmailChange;
