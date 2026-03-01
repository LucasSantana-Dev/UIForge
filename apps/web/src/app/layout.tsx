import type { Metadata } from 'next';
import { DM_Sans, Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import { QueryProvider } from '@/components/providers/query-provider';
import { FeatureFlagProvider } from '@/lib/features/provider';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  preload: false,
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-plus-jakarta',
  preload: false,
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-ibm-plex-mono',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://siza.forgespace.co'),
  title: 'Siza — Vibe Code the Right Way',
  description:
    'AI-powered full-stack generation with real architecture, security by default, and quality gates. Open source, MIT licensed.',
  keywords: [
    'full-stack generation',
    'AI code generation',
    'vibe coding',
    'architecture',
    'security',
    'code quality',
    'React',
    'Next.js',
    'MCP',
  ],
  authors: [{ name: 'Siza Team' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Siza — Vibe Code the Right Way',
    description: 'Full-stack AI generation with architecture, security, and quality built in.',
    url: 'https://siza.forgespace.co',
    siteName: 'Siza',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Siza — Vibe Code the Right Way',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Siza — Vibe Code the Right Way',
    description: 'Full-stack AI generation with architecture, security, and quality built in.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://siza.forgespace.co',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${plusJakarta.variable} ${ibmPlexMono.variable}`}
    >
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
