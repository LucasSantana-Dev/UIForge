import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailButton } from '../components/EmailButton';

interface ReengagementProps {
  generateUrl: string;
  firstName?: string;
}

export function Reengagement({ generateUrl, firstName }: ReengagementProps) {
  const greeting = firstName ? `Hey ${firstName},` : 'Hey,';

  return (
    <EmailLayout preview="Your first AI-generated component is one click away">
      <Text className="m-0 text-lg font-semibold text-[#18181b]">{greeting}</Text>
      <Text className="mt-2 text-sm text-[#52525b]">
        You signed up for Siza but haven&apos;t generated your first component yet.
      </Text>
      <Text className="mt-4 text-sm text-[#52525b]">
        It takes 30 seconds. Just describe the UI you want and Siza writes the React code for you —
        ready to copy into your project.
      </Text>
      <Text className="mt-4 text-sm text-[#52525b]">Try something like:</Text>
      <Text className="mt-1 text-sm text-[#71717a] font-mono bg-[#f4f4f5] rounded px-3 py-2">
        &ldquo;A login form with email and password fields and a submit button&rdquo;
      </Text>
      <Section className="mt-6 text-center">
        <EmailButton href={generateUrl}>Generate my first component</EmailButton>
      </Section>
      <Text className="mt-6 text-xs text-[#a1a1aa]">
        You&apos;re receiving this because you signed up for Siza. Reply to unsubscribe.
      </Text>
    </EmailLayout>
  );
}

export default Reengagement;
