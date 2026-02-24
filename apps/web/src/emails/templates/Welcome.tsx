import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailButton } from '../components/EmailButton';

interface WelcomeProps {
  dashboardUrl: string;
}

export function Welcome({ dashboardUrl }: WelcomeProps) {
  return (
    <EmailLayout preview="Welcome to Siza - start generating UI components with AI">
      <Text className="m-0 text-lg font-semibold text-[#18181b]">Welcome to Siza!</Text>
      <Text className="mt-2 text-sm text-[#52525b]">
        Your email is verified and your account is ready. Siza helps you generate beautiful UI
        components using AI.
      </Text>
      <Text className="mt-4 text-sm text-[#52525b]">Here&apos;s what you can do:</Text>
      <Text className="mt-1 text-sm text-[#52525b]">
        &bull; Generate React components from natural language prompts{'\n'}
        &bull; Organize components into projects{'\n'}
        &bull; Export directly to your codebase
      </Text>
      <Section className="mt-6 text-center">
        <EmailButton href={dashboardUrl}>Go to dashboard</EmailButton>
      </Section>
    </EmailLayout>
  );
}

export default Welcome;
