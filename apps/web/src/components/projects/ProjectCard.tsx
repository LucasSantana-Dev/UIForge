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
    <div className="bg-surface-1 rounded-xl border border-surface-3 shadow-card transition-all duration-200 ease-siza hover:shadow-card-hover hover:-translate-y-0.5 hover:border-[var(--border-hover)] overflow-hidden group">
      <Link href={`/projects/${project.id}`}>
        <div className="aspect-video bg-surface-2 flex items-center justify-center">
          {project.thumbnail_url ? (
            <img
              src={project.thumbnail_url}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-text-muted text-4xl font-bold">
              {project.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <Link href={`/projects/${project.id}`} className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary hover:text-brand-light transition-colors">
              {project.name}
            </h3>
            {project.description && (
              <p className="mt-1 text-sm text-text-secondary line-clamp-2">{project.description}</p>
            )}
          </Link>
          <ProjectActions projectId={project.id} projectName={project.name} />
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
          <span className="capitalize">{project.framework}</span>
          <span>
            Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}
