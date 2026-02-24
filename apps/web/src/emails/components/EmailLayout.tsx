import { Body, Container, Head, Html, Preview, Tailwind } from '@react-email/components';
import type { ReactNode } from 'react';
import { EmailHeader } from './EmailHeader';
import { EmailFooter } from './EmailFooter';

interface EmailLayoutProps {
  preview: string;
  children: ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="mx-auto my-0 bg-[#f4f4f5] font-sans">
          <Container className="mx-auto max-w-[560px] px-4 py-8">
            <EmailHeader />
            <Container className="rounded-lg border border-solid border-[#e4e4e7] bg-white p-8">
              {children}
            </Container>
            <EmailFooter />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
