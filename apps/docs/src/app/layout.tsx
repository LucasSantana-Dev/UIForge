import './globals.css';
import { DM_Sans, IBM_Plex_Mono, Sora } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
});

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Forge Space Docs',
    default: 'Forge Space Documentation',
  },
  description:
    'The accessible IDP preventing AI limbo engineering. Generate governed code from prompt to production.',
  icons: {
    icon: '/siza-icon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${ibmPlexMono.variable} ${sora.variable} dark`}
      style={
        {
          colorScheme: 'dark',
          fontFamily: "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif",
          '--font-heading': 'var(--font-sora)',
        } as React.CSSProperties
      }
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: 'if(typeof __name==="undefined")globalThis.__name=function(fn){return fn}',
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: ':root{--font-sans:var(--font-dm-sans);--font-mono:var(--font-ibm-plex-mono)}',
          }}
        />
      </head>
      <body>
        <RootProvider theme={{ defaultTheme: 'dark', forcedTheme: 'dark' }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
