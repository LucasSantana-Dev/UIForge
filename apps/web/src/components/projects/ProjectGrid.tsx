'use client';

import ProjectCard from './ProjectCard';
import type { Database } from '@/lib/supabase/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectGridProps {
  projects: Project[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
