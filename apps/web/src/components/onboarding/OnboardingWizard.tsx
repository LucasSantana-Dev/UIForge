'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { StepIndicator } from './StepIndicator';
import { WelcomeStep } from './WelcomeStep';
import { ProjectStep } from './ProjectStep';
import { GenerateStep } from './GenerateStep';
import { DoneStep } from './DoneStep';

interface StepData {
  project: { id: string; name: string; framework: string } | null;
  generatedCode: string | null;
}

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<StepData>({
    project: null,
    generatedCode: null,
  });

  const handleNext = useCallback((updates?: Partial<StepData>) => {
    if (updates) {
      setStepData((prev) => ({ ...prev, ...updates }));
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  }, []);

  const handleSkip = useCallback(async () => {
    try {
      await fetch('/api/onboarding/complete', { method: 'POST' });
    } catch {
      // Non-blocking
    }
    router.push('/projects');
  }, [router]);

  return (
    <div className="w-full max-w-2xl space-y-10">
      <div className="flex justify-center">
        <span className="text-xl font-bold text-white">siza</span>
      </div>

      <StepIndicator currentStep={currentStep} />

      {currentStep === 0 && <WelcomeStep onNext={() => handleNext()} onSkip={handleSkip} />}
      {currentStep === 1 && <ProjectStep onNext={handleNext} onSkip={handleSkip} />}
      {currentStep === 2 && (
        <GenerateStep project={stepData.project} onNext={handleNext} onSkip={handleSkip} />
      )}
      {currentStep === 3 && <DoneStep project={stepData.project} />}
    </div>
  );
}
