import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/components/providers/query-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UIForge - AI-Driven UI Generation',
  description:
    'Generate production-ready UI components with AI. Zero-cost platform for developers.',
  keywords: ['UI generation', 'AI', 'React', 'Next.js', 'Vue', 'Components'],
  authors: [{ name: 'UIForge Team' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'UIForge - AI-Driven UI Generation',
    description: 'Generate production-ready UI components with AI',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} dark`}>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
