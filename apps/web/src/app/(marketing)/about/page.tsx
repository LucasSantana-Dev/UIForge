import AboutPageClient from './about-client';
import { getEcosystemSnapshot } from '@/lib/marketing/ecosystem-data';

export default async function AboutPage() {
  const snapshot = await getEcosystemSnapshot();
  return <AboutPageClient snapshot={snapshot} />;
}
