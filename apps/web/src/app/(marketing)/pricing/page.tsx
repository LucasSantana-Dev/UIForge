import { PricingPageClient } from './pricing-client';
import { getMarketingPageMetadata, getMarketingWebPageJsonLd } from '@/lib/marketing/seo';

export const metadata = getMarketingPageMetadata('pricing');

export default function PricingPage() {
  const webPageJsonLd = getMarketingWebPageJsonLd('pricing');

  return (
    <>
      <script
        id="ld-json-pricing-webpage"
        key="ld-json-pricing-webpage"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <PricingPageClient />
    </>
  );
}
