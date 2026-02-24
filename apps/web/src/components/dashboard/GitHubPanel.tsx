'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, RefreshCw } from 'lucide-react';

interface Installation {
  id: string;
  installationId: number;
  accountLogin: string;
  accountType: string;
}

interface Repo {
  id: number;
  fullName: string;
  defaultBranch: string;
  private: boolean;
  description: string | null;
  language: string | null;
  installationId: string;
  accountLogin: string;
}

export default function GitHubPanel() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch('/api/github/repos');
      if (res.ok) {
        const data = await res.json();
        setInstallations(data.installations ?? []);
        setRepos(data.repos ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!installations.length) {
    return (
      <div className="rounded-lg border p-6 text-center space-y-4">
        <Github className="h-10 w-10 mx-auto text-muted-foreground" />
        <div>
          <h3 className="font-semibold">Connect GitHub</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Install the Siza GitHub App to push generated components directly to your repos.
          </p>
        </div>
        <Button asChild>
          <a href="/api/github/install">
            <Github className="mr-2 h-4 w-4" />
            Install GitHub App
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Github className="h-4 w-4" />
          GitHub
        </h3>
        <Button variant="ghost" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {installations.map((inst) => (
          <div key={inst.id} className="text-sm flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="font-medium">{inst.accountLogin}</span>
            <span className="text-muted-foreground">({inst.accountType})</span>
          </div>
        ))}
      </div>

      {repos.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">
            {repos.length} repos accessible
          </p>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {repos.slice(0, 10).map((repo) => (
              <a
                key={repo.id}
                href={`https://github.com/${repo.fullName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm
                  hover:bg-accent rounded px-2 py-1 -mx-2"
              >
                <span className="truncate flex-1">{repo.fullName}</span>
                {repo.language && (
                  <span className="text-xs text-muted-foreground">{repo.language}</span>
                )}
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
