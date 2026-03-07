export const dynamic = 'force-dynamic';

import { DependencyGraph } from '@/components/catalog/DependencyGraph';

export default function CatalogGraphPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-text-primary">
          Catalog Graph
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Visualize service dependencies and hierarchy across your ecosystem
        </p>
      </div>
      <DependencyGraph />
    </div>
  );
}
