import type { Metadata } from 'next';
import { DM_Sans, Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  preload: false,
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
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
  title: {
    default: 'Siza — Vibe Code the Right Way',
    template: '%s | Siza',
  },
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
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/monogram.svg', type: 'image/svg+xml' },
    ],
    apple: '/monogram.png',
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${plusJakartaSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
