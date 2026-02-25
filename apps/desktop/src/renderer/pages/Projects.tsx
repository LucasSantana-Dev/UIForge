import { useState, useEffect, useCallback } from 'react';
import { Button } from '@siza/ui';
import {
  FolderOpenIcon,
  FolderIcon,
  FileIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from 'lucide-react';
import type { FileEntry } from '../../shared/types';

function FileTreeNode({ entry }: { entry: FileEntry }) {
  const [expanded, setExpanded] = useState(false);

  if (!entry.isDirectory) {
    return (
      <div className="flex items-center gap-2 py-1 px-2 text-sm text-text-secondary hover:bg-surface-2 rounded">
        <FileIcon className="w-4 h-4 text-text-muted shrink-0" />
        <span className="truncate">{entry.name}</span>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 py-1 px-2 text-sm text-text-primary hover:bg-surface-2 rounded w-full text-left"
      >
        {expanded ? (
          <ChevronDownIcon className="w-4 h-4 shrink-0" />
        ) : (
          <ChevronRightIcon className="w-4 h-4 shrink-0" />
        )}
        <FolderIcon className="w-4 h-4 text-brand shrink-0" />
        <span className="truncate">{entry.name}</span>
      </button>
      {expanded && entry.children && (
        <div className="ml-4">
          {entry.children.map((child) => (
            <FileTreeNode key={child.path} entry={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Projects() {
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [recentProjects, setRecentProjects] = useState<string[]>([]);

  useEffect(() => {
    window.siza.getPreference('recentProjects').then((recent) => {
      if (Array.isArray(recent)) setRecentProjects(recent);
    });
  }, []);

  const openProject = useCallback(async (path?: string) => {
    const dir = path ?? (await window.siza.selectDirectory());
    if (!dir) return;
    setProjectPath(dir);
    const entries = await window.siza.listDirectory(dir);
    setFiles(entries);

    const recent = await window.siza.getPreference('recentProjects');
    const updated = [dir, ...(recent || []).filter((p: string) => p !== dir)].slice(0, 10);
    await window.siza.setPreference('recentProjects', updated);
    setRecentProjects(updated);
  }, []);

  return (
    <div className="flex h-full">
      <div className="w-72 border-r border-surface-3 flex flex-col">
        <div className="p-4 border-b border-surface-3">
          <Button onClick={() => openProject()} className="w-full">
            <FolderOpenIcon className="w-4 h-4 mr-2" />
            Open Project
          </Button>
        </div>
        {recentProjects.length > 0 && (
          <div className="p-4 border-b border-surface-3">
            <h3 className="text-xs font-medium text-text-muted uppercase mb-2">Recent</h3>
            {recentProjects.map((path) => (
              <button
                key={path}
                onClick={() => openProject(path)}
                className="block w-full text-left text-sm text-text-secondary hover:text-text-primary py-1 truncate"
                title={path}
              >
                {path.split('/').pop()}
              </button>
            ))}
          </div>
        )}
        {projectPath && (
          <div className="flex-1 overflow-y-auto p-2">
            {files.map((entry) => (
              <FileTreeNode key={entry.path} entry={entry} />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        {projectPath ? (
          <div className="text-center text-text-secondary">
            <FolderOpenIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{projectPath}</p>
            <p className="text-xs text-text-muted mt-1">{files.length} items</p>
          </div>
        ) : (
          <div className="text-center text-text-secondary">
            <FolderIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Open a project to browse files</p>
          </div>
        )}
      </div>
    </div>
  );
}
