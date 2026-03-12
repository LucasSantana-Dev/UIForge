'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { StepIndicator } from './StepIndicator';
import { WelcomeStep } from './WelcomeStep';
import { ProjectStep } from './ProjectStep';
import { GenerateStep } from './GenerateStep';
import { DoneStep } from './DoneStep';
import { trackEvent } from '@/components/analytics/AnalyticsProvider';

interface StepData {
  project: { id: string; name: string; framework: string } | null;
  generatedCode: string | null;
}

const stepKeys = ['welcome', 'project', 'generate', 'done'] as const;
type OnboardingStepKey = (typeof stepKeys)[number];

const stepNudges: Record<OnboardingStepKey, string> = {
  welcome:
    'To qualify for core flow, complete onboarding, create one project, and finish one generation.',
  project: 'Creating your first project unlocks the next qualification step.',
  generate: 'Complete one generation now to qualify faster.',
  done: 'You can continue from the dashboard and keep your qualification progress.',
};

function trackOnboardingEvent(
  action: string,
  step: OnboardingStepKey,
  params: Record<string, string | number | boolean | null> = {}
) {
  trackEvent({
    action,
    category: 'Onboarding',
    label: step,
    params: { step, ...params },
  });
}

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<StepData>({
    project: null,
    generatedCode: null,
  });
  const currentStepKey = stepKeys[currentStep] ?? 'welcome';

  useEffect(() => {
    trackOnboardingEvent('onboarding_step_viewed', currentStepKey, {
      stepIndex: currentStep + 1,
    });
  }, [currentStep, currentStepKey]);

  const handleNext = useCallback(
    (step: OnboardingStepKey, updates?: Partial<StepData>) => {
      if (updates) setStepData((prev) => ({ ...prev, ...updates }));
      trackOnboardingEvent('onboarding_step_completed', step, { stepIndex: currentStep + 1 });
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    },
    [currentStep]
  );

  const handleSkip = useCallback(
    async (step: OnboardingStepKey) => {
      trackOnboardingEvent('onboarding_step_skipped', step, { stepIndex: currentStep + 1 });
      trackOnboardingEvent('onboarding_cta_clicked', step, { cta: 'skip' });
      try {
        await fetch('/api/onboarding/complete', { method: 'POST' });
      } catch {
        // Non-blocking
      }
      router.push('/projects');
    },
    [currentStep, router]
  );

  return (
    <div className="w-full max-w-2xl space-y-10">
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-surface-3 bg-surface-1 px-4 py-2">
          <Image src="/monogram.svg" alt="Siza" width={20} height={20} />
          <span className="text-xl font-display font-bold text-text-primary">Siza</span>
        </div>
      </div>

      <StepIndicator currentStep={currentStep} />

      <p className="text-center text-sm text-violet-200/80">{stepNudges[currentStepKey]}</p>

      {currentStep === 0 && (
        <WelcomeStep
          onNext={() => {
            trackOnboardingEvent('onboarding_cta_clicked', 'welcome', { cta: 'get_started' });
            handleNext('welcome');
          }}
          onSkip={() => handleSkip('welcome')}
        />
      )}
      {currentStep === 1 && (
        <ProjectStep
          onNext={(updates) => handleNext('project', updates)}
          onSkip={() => handleSkip('project')}
        />
      )}
      {currentStep === 2 && (
        <GenerateStep
          project={stepData.project}
          onNext={(updates) => handleNext('generate', updates)}
          onSkip={() => handleSkip('generate')}
        />
      )}
      {currentStep === 3 && (
        <DoneStep
          project={stepData.project}
          onComplete={() => trackOnboardingEvent('onboarding_step_completed', 'done')}
          onCtaClick={(cta) => trackOnboardingEvent('onboarding_cta_clicked', 'done', { cta })}
        />
      )}
    </div>
  );
}
