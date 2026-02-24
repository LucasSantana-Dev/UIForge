'use client';

import { useState } from 'react';
import { useGenerations } from '@/hooks/use-generations';
import { ClockIcon, CodeIcon, DownloadIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface GenerationHistoryProps {
  projectId: string;
  onSelectGeneration?: (code: string) => void;
}

export default function GenerationHistory({
  projectId,
  onSelectGeneration,
}: GenerationHistoryProps) {
  const [expanded, setExpanded] = useState(false);
  const { data: generations, isLoading, error } = useGenerations(projectId);

  if (isLoading) {
    return <div className="p-4 text-center text-sm text-text-secondary">Loading history...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-sm text-red-600">Error loading history</div>;
  }

  if (!generations || generations.length === 0) {
    return <div className="p-4 text-center text-sm text-text-secondary">No generations yet</div>;
  }

  return (
    <div className="border-t border-surface-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-text-primary hover:bg-surface-0 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <ClockIcon className="h-4 w-4" />
          <span>Generation History ({generations.length})</span>
        </div>
        <div
          className={cn(
            'transform transition-transform duration-200',
            expanded ? 'rotate-180' : ''
          )}
        >
          ▼
        </div>
      </button>

      {expanded && (
        <div className="max-h-64 overflow-y-auto border-t border-surface-3">
          {generations.map((generation) => (
            <div
              key={generation.id}
              className="p-3 border-b border-surface-3 last:border-b-0 hover:bg-surface-0 transition-colors"
            >
              <div className="flex items-start justify-between space-x-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-text-primary truncate">
                      {generation.component_name}
                    </span>
                    <span className="text-xs px-2 py-1 bg-brand/10 text-brand rounded-full">
                      {generation.framework}
                    </span>
                    {generation.component_library && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        {generation.component_library}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2 mb-2">
                    {generation.prompt.substring(0, 100)}
                    {generation.prompt.length > 100 && '...'}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-text-secondary">
                    <span className="flex items-center space-x-1">
                      <CodeIcon className="h-3 w-3" />
                      {generation.generated_code.length} chars
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(generation.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                    {generation.tokens_used && <span>{generation.tokens_used} tokens</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onSelectGeneration?.(generation.generated_code)}
                    className="p-1 text-text-secondary hover:text-brand hover:bg-brand/10 rounded transition-colors"
                    title="Use this code"
                  >
                    <CodeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generation.generated_code);
                    }}
                    className="p-1 text-text-secondary hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Copy code"
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
