'use client';

import { useState } from 'react';
import RepoSelector from './RepoSelector';
import PRStatus from './PRStatus';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink } from 'lucide-react';

interface LinkedRepo {
  fullName: string;
  id: string;
}

interface PR {
  number: number;
  title: string;
  htmlUrl: string;
  state: 'open' | 'closed' | 'merged';
  createdAt: string;
}

interface ProjectSettingsProps {
  projectId: string;
  initialLinkedRepo?: LinkedRepo | null;
  initialPRs?: PR[];
}

export default function ProjectSettings({
  projectId,
  initialLinkedRepo = null,
  initialPRs = [],
}: ProjectSettingsProps) {
  const [linkedRepo, setLinkedRepo] = useState<LinkedRepo | null>(initialLinkedRepo);
  const [loading, setLoading] = useState(false);

  async function handleLink(repoId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/github/repos/${repoId}/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      if (res.ok) {
        const data = await res.json();
        setLinkedRepo({
          fullName: data.fullName,
          id: data.id,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlink() {
    setLoading(true);
    try {
      await fetch(`/api/github/repos/unlink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      setLinkedRepo(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          <h3 className="font-semibold">GitHub Repository</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Link a GitHub repository to automatically create PRs when you generate components.
        </p>
        {loading && <div className="animate-pulse h-8 bg-muted rounded" />}
        <RepoSelector
          projectId={projectId}
          linkedRepo={linkedRepo}
          onLink={handleLink}
          onUnlink={handleUnlink}
        />
        {linkedRepo && (
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://github.com/${linkedRepo.fullName}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on GitHub
            </a>
          </Button>
        )}
      </div>

      {linkedRepo && initialPRs.length > 0 && (
        <div className="rounded-lg border p-4">
          <PRStatus prs={initialPRs} />
        </div>
      )}
    </div>
  );
}
