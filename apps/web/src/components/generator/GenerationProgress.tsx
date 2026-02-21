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
    <div className="flex flex-col space-y-4 p-4 bg-gray-50 rounded-lg">
      {/* Status */}
      <div className="flex items-center space-x-3">
        {isGenerating ? (
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
        ) : error ? (
          <AlertCircle className="h-5 w-5 text-red-600" />
        ) : progress === 100 ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
          <div className="h-5 w-5 rounded-full bg-gray-300" />
        )}

        <span
          className={cn(
            'text-sm font-medium',
            error ? 'text-red-600' : progress === 100 ? 'text-green-600' : 'text-gray-600'
          )}
        >
          {statusMessage}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300 ease-out',
              isGenerating
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse'
                : error
                  ? 'bg-red-500'
                  : progress === 100
                    ? 'bg-green-500'
                    : 'bg-blue-500'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Event Log */}
      {events.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Activity Log</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {events.slice(-5).map((event, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center space-x-2 text-xs p-2 rounded',
                  event.type === 'error'
                    ? 'bg-red-50 text-red-700'
                    : event.type === 'complete'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-blue-50 text-blue-700'
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
                <span className="text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Details */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
          <p className="text-sm font-medium">Error Details</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}
