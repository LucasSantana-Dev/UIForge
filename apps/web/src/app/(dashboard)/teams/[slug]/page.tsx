export const dynamic = 'force-dynamic';

import { TeamDetailClient } from './team-detail-client';

export default async function TeamDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TeamDetailClient slug={slug} />;
}
