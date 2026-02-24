'use client';

import { useGenerationProgress } from '@/hooks/use-generation';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenerationProgressProps {
  isGenerating: boolean;
  progress: number;
  events: any[];
  error: string | null;
}

export default function GenerationProgress({
  isGenerating,
  progress,
  events,
  error,
}: GenerationProgressProps) {
  const { statusMessage, getEventIcon } = useGenerationProgress({
    isGenerating,
    progress,
    events,
    error,
  });

  return (
    <div className="flex flex-col space-y-4 p-4 bg-surface-2 rounded-lg">
      {/* Status */}
      <div className="flex items-center space-x-3">
        {isGenerating ? (
          <Loader2 className="h-5 w-5 text-brand animate-spin" />
        ) : error ? (
          <AlertCircle className="h-5 w-5 text-error" />
        ) : progress === 100 ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <div className="h-5 w-5 rounded-full bg-surface-3" />
        )}

        <span
          className={cn(
            'text-sm font-medium',
            error ? 'text-error' : progress === 100 ? 'text-success' : 'text-text-secondary'
          )}
        >
          {statusMessage}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-text-secondary">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-surface-3 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300 ease-out',
              isGenerating
                ? 'bg-gradient-to-r from-brand to-indigo animate-pulse'
                : error
                  ? 'bg-error'
                  : progress === 100
                    ? 'bg-success'
                    : 'bg-brand'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Event Log */}
      {events.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-text-primary">Activity Log</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {events.slice(-5).map((event, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center space-x-2 text-xs p-2 rounded',
                  event.type === 'error'
                    ? 'bg-error/10 text-error'
                    : event.type === 'complete'
                      ? 'bg-success/10 text-success'
                      : 'bg-brand/10 text-brand-light'
                )}
              >
                <span>{getEventIcon(event.type)}</span>
                <span className="flex-1 truncate">
                  {event.type === 'chunk'
                    ? `Generated ${event.content?.length || 0} characters`
                    : event.type === 'complete'
                      ? `Complete (${event.totalLength} characters)`
                      : event.type === 'start'
                        ? 'Started generation'
                        : event.type === 'error'
                          ? event.message || 'Error occurred'
                          : 'Processing...'}
                </span>
                <span className="text-text-muted">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Details */}
      {error && (
        <div className="bg-error/10 border border-error text-error p-3 rounded-md">
          <p className="text-sm font-medium">Error Details</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}
