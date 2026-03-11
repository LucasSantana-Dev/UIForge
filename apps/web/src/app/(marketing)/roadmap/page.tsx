import RoadmapClientPage from './roadmap-client';
import { getEcosystemSnapshot } from '@/lib/marketing/ecosystem-data';
import { getMarketingPageMetadata, getMarketingWebPageJsonLd } from '@/lib/marketing/seo';

export const metadata = getMarketingPageMetadata('roadmap');

export default async function RoadmapPage() {
  const snapshot = await getEcosystemSnapshot();
  const webPageJsonLd = getMarketingWebPageJsonLd('roadmap');

  return (
    <>
      <script
        id="ld-json-roadmap-webpage"
        key="ld-json-roadmap-webpage"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <RoadmapClientPage repoCount={snapshot.repoCount} />
    </>
  );
}
