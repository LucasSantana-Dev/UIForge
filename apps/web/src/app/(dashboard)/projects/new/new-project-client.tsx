'use client';

import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import CreateProjectForm from '@/components/projects/CreateProjectForm';

export function NewProjectClient() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/projects"
          className="inline-flex items-center text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>
      </div>

      <div className="bg-surface-1 rounded-lg border border-surface-3 p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Create New Project</h1>
        <CreateProjectForm />
      </div>
    </div>
  );
}
