import AboutPageClient from './about-client';
import { getEcosystemSnapshot } from '@/lib/marketing/ecosystem-data';
import { getMarketingPageMetadata, getMarketingWebPageJsonLd } from '@/lib/marketing/seo';

export const metadata = getMarketingPageMetadata('about');

export default async function AboutPage() {
  const snapshot = await getEcosystemSnapshot();
  const webPageJsonLd = getMarketingWebPageJsonLd('about');

  return (
    <>
      <script
        id="ld-json-about-webpage"
        key="ld-json-about-webpage"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <AboutPageClient snapshot={snapshot} />
    </>
  );
}
