import { Link, Section, Text } from '@react-email/components';

export function EmailFooter() {
  return (
    <Section className="mt-8 text-center">
      <Text className="m-0 text-xs text-[#71717a]">
        <Link href="https://siza.dev" className="text-[#71717a] underline">
          Siza
        </Link>
        {' - '}AI-powered UI generation
      </Text>
      <Text className="m-0 mt-1 text-xs text-[#a1a1aa]">
        You received this email because you signed up for Siza. If you didn&apos;t, you can safely
        ignore this email.
      </Text>
    </Section>
  );
}
