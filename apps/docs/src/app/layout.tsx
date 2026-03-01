import './globals.css';
import { Inter, JetBrains_Mono, Outfit } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Siza Docs',
    default: 'Siza Documentation',
  },
  description: 'The Open Full-Stack AI Workspace — documentation',
  icons: {
    icon: '/siza-icon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      style={{ '--font-heading': 'var(--font-outfit)' } as React.CSSProperties}
      className={`${inter.variable} ${jetbrainsMono.variable} ${outfit.variable} dark`}
      style={{
        colorScheme: 'dark',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
      }}
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
            __html: ':root{--font-sans:var(--font-inter);--font-mono:var(--font-jetbrains-mono)}',
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
