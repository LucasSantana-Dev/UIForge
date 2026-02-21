import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'UIForge - AI-Driven UI Generation',
    short_name: 'UIForge',
    description: 'Generate production-ready UI components with AI. Zero-cost platform for developers.',
    start_url: '/',
    display: 'standalone',
    background_color: '#121214',
    theme_color: '#9333ea',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    categories: ['productivity', 'developer', 'design', 'ai'],
    screenshots: [
      {
        src: '/screenshot-desktop.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
      },
      {
        src: '/screenshot-mobile.png',
        sizes: '375x667',
        type: 'image/png',
        form_factor: 'narrow',
      },
    ],
  };
}