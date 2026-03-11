import type { Metadata } from 'next';
import { GalleryClient } from './gallery-client';
import { getMarketingPageMetadata, getMarketingWebPageJsonLd } from '@/lib/marketing/seo';

export const metadata: Metadata = getMarketingPageMetadata('gallery');

export default function GalleryPage() {
  const webPageJsonLd = getMarketingWebPageJsonLd('gallery');

  return (
    <>
      <script
        id="ld-json-gallery-webpage"
        key="ld-json-gallery-webpage"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <GalleryClient />
    </>
  );
}
