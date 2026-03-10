import RoadmapClientPage from './roadmap-client';
import { getEcosystemSnapshot } from '@/lib/marketing/ecosystem-data';

export default async function RoadmapPage() {
  const snapshot = await getEcosystemSnapshot();
  return <RoadmapClientPage repoCount={snapshot.repoCount} />;
}
