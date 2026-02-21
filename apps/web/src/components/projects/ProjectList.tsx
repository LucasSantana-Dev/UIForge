'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { useRealtimeProjects } from '@/hooks/use-realtime-projects';
import ProjectGrid from './ProjectGrid';
import ProjectFilters from './ProjectFilters';
import EmptyState from '@/components/ui/EmptyState';
import { FolderIcon } from 'lucide-react';

export default function ProjectList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'name'>('updated');
  const { data: projects, isLoading, error } = useProjects();

  useRealtimeProjects();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load projects. Please try again.</p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <EmptyState
        icon={FolderIcon}
        title="No projects yet"
        description="Get started by creating your first project"
        actionLabel="Create Project"
        actionHref="/projects/new"
      />
    );
  }

  const filteredProjects = projects
    .filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'created') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  return (
    <div className="space-y-6">
      <ProjectFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      <ProjectGrid projects={filteredProjects} />
    </div>
  );
}
