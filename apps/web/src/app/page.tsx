import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsBar } from '@/components/landing/StatsBar';
import { CodeShowcase } from '@/components/landing/CodeShowcase';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { CapabilitiesSection } from '@/components/landing/CapabilitiesSection';
import { EcosystemSection } from '@/components/landing/EcosystemSection';
import { CTASection } from '@/components/landing/CTASection';
import { getEcosystemSnapshot } from '@/lib/marketing/ecosystem-data';
import {
  globalStructuredData,
  getMarketingPageMetadata,
  getMarketingWebPageJsonLd,
  softwareApplicationJsonLd,
} from '@/lib/marketing/seo';

export const metadata = getMarketingPageMetadata('home');

export default async function HomePage() {
  const snapshot = await getEcosystemSnapshot();
  const webPageJsonLd = getMarketingWebPageJsonLd('home');

  return (
    <div className="relative isolate overflow-hidden">
      <script
        id="ld-json-global-organization"
        key="ld-json-global-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(globalStructuredData) }}
      />
      <script
        id="ld-json-software-application"
        key="ld-json-software-application"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      <script
        id="ld-json-home-webpage"
        key="ld-json-home-webpage"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <LandingNav />
      <main id="main-content" className="relative z-10">
        <HeroSection />
        <StatsBar snapshot={snapshot} />
        <CapabilitiesSection />
        <CodeShowcase />
        <EcosystemSection snapshot={snapshot} />
        <DashboardPreview />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
