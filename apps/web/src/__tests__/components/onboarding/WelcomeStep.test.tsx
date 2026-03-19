import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockTrackEvent = jest.fn();

jest.mock('@/components/analytics/AnalyticsProvider', () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

jest.mock('@siza/ui', () => ({
  Button: ({ children, onClick, ...props }: React.ComponentProps<'button'>) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Card: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div {...props}>{children}</div>
  ),
}));

import { WelcomeStep } from '@/components/onboarding/WelcomeStep';

describe('WelcomeStep', () => {
  const onNext = jest.fn();
  const onSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the welcome heading', () => {
    render(<WelcomeStep onNext={onNext} onSkip={onSkip} />);
    expect(screen.getByText('Welcome to Siza')).toBeInTheDocument();
  });

  it('renders the 3 feature cards', () => {
    render(<WelcomeStep onNext={onNext} onSkip={onSkip} />);
    expect(screen.getByText('AI Generation')).toBeInTheDocument();
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    expect(screen.getByText('Iterate Fast')).toBeInTheDocument();
  });

  it('renders Skip tutorial and Get started buttons', () => {
    render(<WelcomeStep onNext={onNext} onSkip={onSkip} />);
    expect(screen.getByRole('button', { name: 'Skip tutorial' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Get started' })).toBeInTheDocument();
  });

  it('calls onSkip and trackEvent when Skip tutorial is clicked', async () => {
    const user = userEvent.setup();
    render(<WelcomeStep onNext={onNext} onSkip={onSkip} />);

    await user.click(screen.getByRole('button', { name: 'Skip tutorial' }));

    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'onboarding_cta_clicked', label: 'welcome' })
    );
  });

  it('calls onNext and trackEvent when Get started is clicked', async () => {
    const user = userEvent.setup();
    render(<WelcomeStep onNext={onNext} onSkip={onSkip} />);

    await user.click(screen.getByRole('button', { name: 'Get started' }));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'onboarding_cta_clicked', label: 'welcome' })
    );
  });

  it('does not call onNext when Skip is clicked', async () => {
    const user = userEvent.setup();
    render(<WelcomeStep onNext={onNext} onSkip={onSkip} />);

    await user.click(screen.getByRole('button', { name: 'Skip tutorial' }));

    expect(onNext).not.toHaveBeenCalled();
  });
});
