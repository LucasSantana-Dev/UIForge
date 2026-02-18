export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import ComponentGenerator from '@/components/generator/ComponentGenerator';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

export default async function GeneratePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <Link
          href={`/projects/${id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Project
        </Link>
      </div>

      <Suspense fallback={<div>Loading generator...</div>}>
        <ComponentGenerator projectId={id} />
      </Suspense>
    </div>
  );
}
