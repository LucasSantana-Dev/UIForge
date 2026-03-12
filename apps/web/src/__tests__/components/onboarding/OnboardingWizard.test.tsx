import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { trackEvent } from '@/components/analytics/AnalyticsProvider';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

jest.mock('@/components/analytics/AnalyticsProvider', () => ({
  trackEvent: jest.fn(),
}));

jest.mock('@/components/onboarding/StepIndicator', () => ({
  StepIndicator: ({ currentStep }: { currentStep: number }) => <div>step-{currentStep}</div>,
}));

jest.mock('@/components/onboarding/WelcomeStep', () => ({
  WelcomeStep: ({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) => (
    <div>
      <button onClick={onNext}>welcome-next</button>
      <button onClick={onSkip}>welcome-skip</button>
    </div>
  ),
}));

jest.mock('@/components/onboarding/ProjectStep', () => ({
  ProjectStep: ({
    onNext,
    onSkip,
  }: {
    onNext: (value: { project: { id: string; name: string; framework: string } }) => void;
    onSkip: () => void;
  }) => (
    <div>
      <button
        onClick={() => onNext({ project: { id: 'p-1', name: 'Project One', framework: 'react' } })}
      >
        project-next
      </button>
      <button onClick={onSkip}>project-skip</button>
    </div>
  ),
}));

jest.mock('@/components/onboarding/GenerateStep', () => ({
  GenerateStep: ({
    onNext,
    onSkip,
  }: {
    onNext: (value: { generatedCode: string }) => void;
    onSkip: () => void;
  }) => (
    <div>
      <button onClick={() => onNext({ generatedCode: '<div />' })}>generate-next</button>
      <button onClick={onSkip}>generate-skip</button>
    </div>
  ),
}));

jest.mock('@/components/onboarding/DoneStep', () => ({
  DoneStep: ({
    onComplete,
    onCtaClick,
  }: {
    onComplete?: () => void;
    onCtaClick?: (value: string) => void;
  }) => (
    <button
      onClick={() => {
        onCtaClick?.('get_started');
        onComplete?.();
      }}
    >
      done-complete
    </button>
  ),
}));

describe('OnboardingWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as jest.Mock;
  });

  it('renders qualification nudge and tracks initial step view', async () => {
    render(<OnboardingWizard />);

    expect(
      screen.getByText(
        'To qualify for core flow, complete onboarding, create one project, and finish one generation.'
      )
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'onboarding_step_viewed',
          label: 'welcome',
        })
      );
    });
  });

  it('tracks step completion and CTA clicks on transitions', async () => {
    const user = userEvent.setup();
    render(<OnboardingWizard />);

    await user.click(screen.getByRole('button', { name: 'welcome-next' }));

    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'onboarding_cta_clicked',
          label: 'welcome',
          params: expect.objectContaining({ cta: 'get_started' }),
        })
      );
      expect(trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'onboarding_step_completed',
          label: 'welcome',
        })
      );
      expect(trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'onboarding_step_viewed',
          label: 'project',
        })
      );
    });
  });

  it('tracks skip telemetry and redirects to projects', async () => {
    const user = userEvent.setup();
    render(<OnboardingWizard />);

    await user.click(screen.getByRole('button', { name: 'welcome-skip' }));

    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'onboarding_step_skipped',
          label: 'welcome',
        })
      );
      expect(trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'onboarding_cta_clicked',
          label: 'welcome',
          params: expect.objectContaining({ cta: 'skip' }),
        })
      );
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/onboarding/complete', { method: 'POST' });
      expect(mockPush).toHaveBeenCalledWith('/projects');
    });
  });
});
