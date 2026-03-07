export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import CatalogDetail from '@/components/catalog/CatalogDetail';

export default async function CatalogEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={<div>Loading catalog entry...</div>}>
      <CatalogDetail entryId={resolvedParams.id} />
    </Suspense>
  );
}
