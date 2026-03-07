export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { DependencyGraph } from '@/components/catalog/DependencyGraph';

export default function CatalogGraphPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/catalog"
            className="text-xs text-text-muted hover:text-violet-400 transition-colors"
          >
            Catalog
          </Link>
          <span className="text-xs text-text-muted">/</span>
          <span className="text-xs text-text-secondary">Graph</span>
        </div>
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
