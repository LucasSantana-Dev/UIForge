'use client';

import { useState } from 'react';
import { useGenerations, useDeleteGeneration } from '@/hooks/use-generations';
import {
  ClockIcon,
  CodeIcon,
  CopyIcon,
  CheckIcon,
  TrashIcon,
  GitBranchIcon,
  InboxIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface GenerationHistoryProps {
  projectId: string;
  onSelectGeneration?: (code: string, generationId: string) => void;
  onForkGeneration?: (code: string, prompt: string) => void;
}

export default function GenerationHistory({
  projectId,
  onSelectGeneration,
  onForkGeneration,
}: GenerationHistoryProps) {
  const { data: generations, isLoading, error } = useGenerations(projectId);
  const deleteGeneration = useDeleteGeneration();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (generationId: string) => {
    try {
      await deleteGeneration.mutateAsync({ generationId, projectId });
    } catch {
      // Error handled by React Query
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-sm text-text-secondary">
        Loading history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-sm text-red-500">
        Failed to load history
      </div>
    );
  }

  if (!generations || generations.length === 0) {
    return (
      <div className="p-6 text-center space-y-2">
        <InboxIcon className="h-8 w-8 mx-auto text-text-muted" />
        <p className="text-sm text-text-secondary">No generations yet</p>
        <p className="text-xs text-text-muted">
          Create your first component!
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-surface-3">
      {generations.map((gen) => (
        <div
          key={gen.id}
          className="p-3 hover:bg-surface-0 transition-colors"
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-sm font-medium text-text-primary truncate">
              {gen.component_name}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {gen.framework}
              </Badge>
              {(gen as any).quality_score != null && (
                <Badge
                  variant={(gen as any).quality_score >= 80 ? 'default' : 'secondary'}
                  className="text-[10px] px-1.5 py-0"
                >
                  {(gen as any).quality_score}%
                </Badge>
              )}
            </div>
          </div>

          <p className="text-xs text-text-secondary line-clamp-2 mb-2">
            {gen.prompt.substring(0, 100)}
            {gen.prompt.length > 100 && '...'}
          </p>

          {(gen as any).parent_generation_id && (
            <div className="flex items-center gap-1 mb-2 text-[10px] text-text-muted">
              <GitBranchIcon className="h-3 w-3" />
              Refinement
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted">
              {formatDistanceToNow(new Date(gen.created_at), {
                addSuffix: true,
              })}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Load code"
                onClick={() =>
                  onSelectGeneration?.(gen.generated_code, gen.id)
                }
              >
                <CodeIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Fork as new conversation"
                onClick={() =>
                  onForkGeneration?.(gen.generated_code, gen.prompt)
                }
              >
                <GitBranchIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Copy code"
                onClick={() => handleCopy(gen.generated_code, gen.id)}
              >
                {copiedId === gen.id ? (
                  <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <CopyIcon className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-text-muted hover:text-red-500"
                title="Delete"
                onClick={() => handleDelete(gen.id)}
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
