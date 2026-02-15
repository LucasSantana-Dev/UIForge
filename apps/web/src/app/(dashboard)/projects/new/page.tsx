import CreateProjectForm from '@/components/projects/CreateProjectForm';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/projects"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h1>
        <CreateProjectForm />
      </div>
    </div>
  );
}
