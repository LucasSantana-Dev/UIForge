import { Img, Section, Text } from '@react-email/components';

export function EmailHeader() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://siza.forgespace.co';

  return (
    <Section className="mb-6 text-center">
      <Img src={`${baseUrl}/siza-logo.svg`} width="40" height="40" alt="Siza" className="mx-auto" />
      <Text className="m-0 mt-2 text-xl font-bold text-[#18181b]">Siza</Text>
    </Section>
  );
}
