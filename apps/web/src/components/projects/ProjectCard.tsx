'use client';

import Link from 'next/link';
import type { Database } from '@/lib/supabase/database.types';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRightIcon } from 'lucide-react';
import ProjectActions from './ProjectActions';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectCardProps {
  project: Project;
  compact?: boolean;
}

export default function ProjectCard({ project, compact = false }: ProjectCardProps) {
  return (
    <div
      className={`group overflow-hidden rounded-xl border border-border bg-surface shadow-card transition-all duration-200 ease-siza hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover ${
        compact ? 'md:flex md:items-stretch' : ''
      }`}
    >
      <Link href={`/projects/${project.id}`}>
        <div
          className={`flex items-center justify-center bg-surface-alt ${compact ? 'aspect-[4/3] w-full md:w-56' : 'aspect-video'}`}
        >
          {project.thumbnail_url ? (
            <img
              src={project.thumbnail_url}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground text-4xl font-bold">
              {project.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between">
          <Link href={`/projects/${project.id}`} className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                {project.framework}
              </span>
            </div>
            <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary">
              {project.name}
            </h3>
            {project.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
          </Link>
          <ProjectActions projectId={project.id} projectName={project.name} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col">
            <span className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-subtle">
              Framework
            </span>
            <span className="font-medium text-foreground capitalize">{project.framework}</span>
          </div>
          <div className="flex flex-col">
            <span className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-subtle">
              Last Run
            </span>
            <span className="font-medium text-foreground">
              {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end">
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary/70 transition-colors hover:text-primary"
          >
            Open project
            <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
