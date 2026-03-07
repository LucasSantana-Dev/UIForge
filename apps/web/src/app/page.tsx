import { createClient } from '@/lib/supabase/server';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsBar } from '@/components/landing/StatsBar';
import { CapabilitiesSection } from '@/components/landing/CapabilitiesSection';
import { CodeShowcase } from '@/components/landing/CodeShowcase';
import { EcosystemSection } from '@/components/landing/EcosystemSection';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { AmbientVideoBackground } from '@/components/migration/ambient-video-background';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative isolate overflow-hidden">
      <AmbientVideoBackground src="/ambient-bg.webm" />
      <LandingNav user={user} />
      <main id="main-content" className="relative z-10">
        <HeroSection user={user} />
        <StatsBar />
        <CapabilitiesSection />
        <CodeShowcase />
        <EcosystemSection />
        <DashboardPreview />
        <CTASection user={user} />
      </main>
      <LandingFooter />
    </div>
  );
}
