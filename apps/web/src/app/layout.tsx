import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/components/providers/query-provider';
import { ServiceWorkerProvider } from '@/components/providers/service-worker-provider';
import { AccessibilityProvider } from '@/components/providers/accessibility-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'UIForge - AI-Driven UI Generation',
    template: '%s | UIForge'
  },
  description:
    'Generate production-ready UI components with AI. Zero-cost platform for developers. Transform natural language into React, Vue, Angular, and Svelte components.',
  keywords: ['UI generation', 'AI', 'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Components', 'Code generation', 'Web development'],
  authors: [{ name: 'UIForge Team', url: 'https://github.com/LucasSantana-Dev/uiforge-webapp' }],
  creator: 'UIForge Team',
  publisher: 'UIForge',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://uiforge.app',
    title: 'UIForge - AI-Driven UI Generation',
    description: 'Generate production-ready UI components with AI. Zero-cost platform for developers.',
    siteName: 'UIForge',
    images: [
      {
        url: '/og-image-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'UIForge - AI-Driven UI Generation',
      },
      {
        url: '/og-image-1200x1200.png',
        width: 1200,
        height: 1200,
        alt: 'UIForge - AI-Driven UI Generation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UIForge - AI-Driven UI Generation',
    description: 'Generate production-ready UI components with AI. Zero-cost platform for developers.',
    images: ['/og-image-1200x630.png'],
    creator: '@uiforge',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} dark`}>
      <head>
        <link rel="dns-prefetch" href="https://api.supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <AccessibilityProvider>
          <ServiceWorkerProvider>
            <QueryProvider>{children}</QueryProvider>
          </ServiceWorkerProvider>
        </AccessibilityProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('load', () => {
                  import('/lib/web-vitals.js').then(({ reportWebVitals }) => {
                    reportWebVitals(console.log);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
