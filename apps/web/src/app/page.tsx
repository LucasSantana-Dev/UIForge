import nextDynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/server';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsBar } from '@/components/landing/StatsBar';
import { CodeShowcase } from '@/components/landing/CodeShowcase';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { getEcosystemSnapshot } from '@/lib/marketing/ecosystem-data';

const CapabilitiesSection = nextDynamic(
  () => import('@/components/landing/CapabilitiesSection').then((m) => m.CapabilitiesSection),
  { ssr: true }
);
const EcosystemSection = nextDynamic(
  () => import('@/components/landing/EcosystemSection').then((m) => m.EcosystemSection),
  { ssr: true }
);
const CTASection = nextDynamic(
  () => import('@/components/landing/CTASection').then((m) => m.CTASection),
  { ssr: true }
);

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const snapshot = await getEcosystemSnapshot();

  return (
    <div className="relative isolate overflow-hidden">
      <LandingNav user={user} />
      <main id="main-content" className="relative z-10">
        <HeroSection user={user} />
        <StatsBar snapshot={snapshot} />
        <CapabilitiesSection />
        <CodeShowcase />
        <EcosystemSection snapshot={snapshot} />
        <DashboardPreview />
        <CTASection user={user} />
      </main>
      <LandingFooter />
    </div>
  );
}
