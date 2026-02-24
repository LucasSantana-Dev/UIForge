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
  title: 'Siza — The Open Full-Stack AI Workspace',
  description:
    'Generate production-ready UI components with AI. MCP-native, privacy-first, zero-cost. From idea to production with zero lock-in.',
  keywords: [
    'UI generation',
    'AI',
    'React',
    'Next.js',
    'MCP',
    'Model Context Protocol',
    'open source',
    'BYOK',
    'components',
  ],
  authors: [{ name: 'Forge Space' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Siza — The Open Full-Stack AI Workspace',
    description:
      'AI-powered React component generation. MCP-native. Open source. Zero-cost forever.',
    type: 'website',
    siteName: 'Siza',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Siza — The Open Full-Stack AI Workspace',
    description:
      'AI-powered React component generation. MCP-native. Open source. Zero-cost forever.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-glow-brand"
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
