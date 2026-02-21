'use client';

import Link from 'next/link';
import type { Database } from '@/lib/supabase/database.types';
import { formatDistanceToNow } from 'date-fns';
import ProjectActions from './ProjectActions';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors overflow-hidden group">
      <Link href={`/projects/${project.id}`}>
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          {project.thumbnail_url ? (
            <img
              src={project.thumbnail_url}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 text-4xl font-bold">
              {project.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <Link href={`/projects/${project.id}`} className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
              {project.name}
            </h3>
            {project.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{project.description}</p>
            )}
          </Link>
          <ProjectActions projectId={project.id} projectName={project.name} />
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span className="capitalize">{project.framework}</span>
          <span>
            Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}
