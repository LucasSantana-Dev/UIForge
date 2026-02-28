'use client';

import { useGenerationProgress } from '@/hooks/use-generation';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Brain,
  Code2,
  Shield,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenerationProgressProps {
  isGenerating: boolean;
  progress: number;
  events: any[];
  error: string | null;
}

const STEPS = [
  {
    label: 'Analyzing',
    icon: Brain,
    threshold: 0,
  },
  {
    label: 'Generating',
    icon: Code2,
    threshold: 25,
  },
  {
    label: 'Quality check',
    icon: Shield,
    threshold: 75,
  },
  {
    label: 'Complete',
    icon: Sparkles,
    threshold: 100,
  },
];

export default function GenerationProgress({
  isGenerating,
  progress,
  events,
  error,
}: GenerationProgressProps) {
  const { statusMessage, getEventIcon } =
    useGenerationProgress({
      isGenerating,
      progress,
      events,
      error,
    });

  const activeStep = STEPS.findIndex(
    (s, i) =>
      i === STEPS.length - 1 ||
      progress < STEPS[i + 1].threshold
  );

  return (
    <div className="flex flex-col space-y-4 p-4 bg-surface-2 rounded-lg">
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isComplete = progress >= step.threshold;
          const isActive = i === activeStep && isGenerating;
          return (
            <div key={step.label} className="flex items-center gap-1 flex-1">
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all duration-300',
                  isComplete && !error
                    ? 'text-success bg-success/10'
                    : isActive
                      ? 'text-brand-light bg-brand/10'
                      : 'text-text-muted bg-surface-3/50'
                )}
              >
                {isActive ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isComplete && !error ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <Icon className="h-3 w-3" />
                )}
                <span className="hidden sm:inline">
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-px transition-colors duration-300',
                    progress >= STEPS[i + 1].threshold
                      ? 'bg-success/30'
                      : 'bg-surface-3'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

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
            error
              ? 'text-error'
              : progress === 100
                ? 'text-success'
                : 'text-text-secondary'
          )}
        >
          {statusMessage}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-text-secondary">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-surface-3 rounded-full h-1.5 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-siza',
              isGenerating
                ? 'bg-gradient-to-r from-brand to-brand-light'
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

      {events.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-text-primary">
            Activity Log
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {events.slice(-5).map((event, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center space-x-2 text-xs p-2 rounded transition-all duration-200',
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
                        : event.type === 'quality'
                          ? `Quality: ${Math.round((event.report?.score ?? 0) * 100)}%`
                          : event.type === 'error'
                            ? event.message ||
                              'Error occurred'
                            : 'Processing...'}
                </span>
                <span className="text-text-muted">
                  {new Date(
                    event.timestamp
                  ).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-error/10 border border-error/30 text-error p-3 rounded-lg">
          <p className="text-sm font-medium">
            Error Details
          </p>
          <p className="text-xs mt-1 opacity-80">{error}</p>
        </div>
      )}
    </div>
  );
}
