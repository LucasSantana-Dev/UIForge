export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import ProjectDetail from '@/components/projects/ProjectDetail';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={<div>Loading project...</div>}>
      <ProjectDetail projectId={resolvedParams.id} />
    </Suspense>
  );
}
