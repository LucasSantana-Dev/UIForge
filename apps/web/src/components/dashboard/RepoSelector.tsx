'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Github, Check, Unlink } from 'lucide-react';

interface Repo {
  id: number;
  fullName: string;
  defaultBranch: string;
  private: boolean;
  description: string | null;
  language: string | null;
  installationId: string;
}

interface RepoSelectorProps {
  projectId: string;
  linkedRepo?: { fullName: string; id: string } | null;
  onLink: (repoId: string) => void;
  onUnlink: () => void;
}

export default function RepoSelector({ linkedRepo, onLink, onUnlink }: RepoSelectorProps) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setLoading(true);
    fetch('/api/github/repos')
      .then((r) => r.json())
      .then((data) => setRepos(data.repos ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (linkedRepo) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Github className="h-4 w-4" />
        <span className="font-medium">{linkedRepo.fullName}</span>
        <Check className="h-4 w-4 text-green-500" />
        <Button variant="ghost" size="sm" onClick={onUnlink} className="ml-auto">
          <Unlink className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!open ? (
        <Button variant="outline" size="sm" onClick={handleOpen}>
          <Github className="mr-2 h-4 w-4" />
          Link Repository
        </Button>
      ) : (
        <div className="rounded-lg border p-3 space-y-2">
          <p className="text-sm font-medium">Select a repository</p>
          {loading ? (
            <div className="animate-pulse h-8 bg-muted rounded" />
          ) : repos.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No repos found.{' '}
              <a href="/api/github/install" className="text-primary underline">
                Install the GitHub App
              </a>{' '}
              first.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {repos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => {
                    onLink(repo.id.toString());
                    setOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5
                    text-sm hover:bg-accent rounded flex
                    items-center gap-2"
                >
                  <span className="truncate flex-1">{repo.fullName}</span>
                  {repo.private && (
                    <span
                      className="text-xs bg-muted px-1.5
                      py-0.5 rounded"
                    >
                      Private
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
