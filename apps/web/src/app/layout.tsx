import type { Metadata } from 'next';
import { Inter, Outfit, JetBrains_Mono } from 'next/font/google';
import { QueryProvider } from '@/components/providers/query-provider';
import { FeatureFlagProvider } from '@/lib/features/provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  preload: false,
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-outfit',
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  preload: false,
});

export const metadata: Metadata = {
  title: 'Siza - AI-Driven UI Generation',
  description:
    'Generate production-ready UI components with AI. Generous free tier for developers.',
  keywords: ['UI generation', 'AI', 'React', 'Next.js', 'Vue', 'Components'],
  authors: [{ name: 'Siza Team' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Siza - AI-Driven UI Generation',
    description: 'Generate production-ready UI components with AI',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        <QueryProvider>
          <FeatureFlagProvider>{children}</FeatureFlagProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
