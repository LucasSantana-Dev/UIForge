'use client';

import { cn } from '../../lib/utils';

interface ProgressStep {
  label: string;
  icon?: React.ReactNode;
  threshold: number;
}

interface GenerationProgressProps {
  isGenerating: boolean;
  progress: number;
  statusMessage: string;
  steps?: ProgressStep[];
  error?: string | null;
}

const DEFAULT_STEPS: ProgressStep[] = [
  { label: 'Analyzing', threshold: 0 },
  { label: 'Generating', threshold: 25 },
  { label: 'Quality check', threshold: 75 },
  { label: 'Complete', threshold: 100 },
];

export function GenerationProgress({
  isGenerating,
  progress,
  statusMessage,
  steps = DEFAULT_STEPS,
  error,
}: GenerationProgressProps) {
  const activeStep = steps.findIndex(
    (s, i) => i === steps.length - 1 || progress < steps[i + 1].threshold
  );

  return (
    <div className="flex flex-col space-y-4 p-4 bg-zinc-800 rounded-lg">
      <div className="flex items-center gap-1">
        {steps.map((step, i) => {
          const isComplete = progress >= step.threshold;
          const isActive = i === activeStep && isGenerating;
          return (
            <div key={step.label} className="flex items-center gap-1 flex-1">
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all duration-300',
                  isComplete && !error
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : isActive
                      ? 'text-purple-300 bg-purple-500/10'
                      : 'text-zinc-500 bg-zinc-700/50'
                )}
              >
                {step.icon}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-px transition-colors duration-300',
                    progress >= steps[i + 1].threshold ? 'bg-emerald-500/30' : 'bg-zinc-700'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="text-sm font-medium opacity-80">{statusMessage}</div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs opacity-60">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-zinc-700 rounded-full h-1.5 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              error
                ? 'bg-red-500'
                : progress === 100
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-purple-500 to-purple-400'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg">
          <p className="text-sm font-medium">Error Details</p>
          <p className="text-xs mt-1 opacity-80">{error}</p>
        </div>
      )}
    </div>
  );
}
