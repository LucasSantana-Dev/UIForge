'use client';

import { Check } from 'lucide-react';

const STEPS = ['Welcome', 'Project', 'Generate', 'Done'];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((label, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;

        return (
          <div key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${
                  isCompleted
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : isActive
                      ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                      : 'border-white/10 text-white/30'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`hidden text-xs sm:block ${
                  isActive ? 'text-violet-400' : isCompleted ? 'text-emerald-400' : 'text-white/30'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-6 sm:w-10 ${i < currentStep ? 'bg-emerald-500' : 'bg-white/10'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
