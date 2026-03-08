import type { Metadata } from 'next';
import { GalleryClient } from './gallery-client';

export const metadata: Metadata = {
  title: 'Gallery — Siza',
  description:
    'Explore AI-generated UI components. See what Siza can build — React, Vue, Svelte, and more.',
  openGraph: {
    title: 'Gallery — Siza',
    description: 'Explore AI-generated UI components built with Siza.',
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
