import { useState, useEffect } from 'react';
import { FolderOpenIcon, ClockIcon } from 'lucide-react';

interface RecentProjectsProps {
  onOpen: (path: string) => void;
}

export function RecentProjects({ onOpen }: RecentProjectsProps) {
  const [projects, setProjects] = useState<string[]>([]);

  useEffect(() => {
    window.siza.getPreference('recentProjects').then((recent) => {
      if (Array.isArray(recent)) setProjects(recent);
    });
  }, []);

  if (projects.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-text-muted uppercase">
        <ClockIcon className="w-3.5 h-3.5" />
        Recent Projects
      </div>
      {projects.map((path) => (
        <button
          key={path}
          onClick={() => onOpen(path)}
          className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-surface-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <FolderOpenIcon className="w-4 h-4 shrink-0" />
          <span className="truncate">{path.split('/').pop()}</span>
        </button>
      ))}
    </div>
  );
}
