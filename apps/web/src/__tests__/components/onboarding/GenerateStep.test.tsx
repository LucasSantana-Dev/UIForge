import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockTrackEvent = jest.fn();
const mockStartGeneration = jest.fn();
const mockUseGeneration = jest.fn();

jest.mock('@/components/analytics/AnalyticsProvider', () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

jest.mock('@/hooks/use-generation', () => ({
  useGeneration: (projectId: string | undefined) => mockUseGeneration(projectId),
}));

jest.mock('@siza/ui', () => ({
  Button: ({ children, onClick, disabled, ...props }: React.ComponentProps<'button'>) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
  Card: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div {...props}>{children}</div>
  ),
}));

import { GenerateStep } from '@/components/onboarding/GenerateStep';

const defaultProject = { id: 'proj-1', name: 'My Project', framework: 'react' };

const defaultGenerationState = {
  isGenerating: false,
  progress: 0,
  code: null as string | null,
  error: null as string | null,
  startGeneration: mockStartGeneration,
};

describe('GenerateStep', () => {
  const onNext = jest.fn();
  const onSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGeneration.mockReturnValue(defaultGenerationState);
    mockStartGeneration.mockResolvedValue(null);
  });

  it('renders the generate component heading', () => {
    render(<GenerateStep project={defaultProject} onNext={onNext} onSkip={onSkip} />);
    expect(screen.getByText('Generate your first component')).toBeInTheDocument();
  });

  it('renders Generate and Skip buttons', () => {
    render(<GenerateStep project={defaultProject} onNext={onNext} onSkip={onSkip} />);
    expect(screen.getByRole('button', { name: 'Generate' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();
  });

  it('calls startGeneration when Generate is clicked', async () => {
    const user = userEvent.setup();
    render(<GenerateStep project={defaultProject} onNext={onNext} onSkip={onSkip} />);

    await user.click(screen.getByRole('button', { name: 'Generate' }));

    expect(mockStartGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        framework: 'react',
        componentName: 'PricingCard',
      })
    );
  });

  it('calls onSkip and trackEvent when Skip is clicked', async () => {
    const user = userEvent.setup();
    render(<GenerateStep project={defaultProject} onNext={onNext} onSkip={onSkip} />);

    await user.click(screen.getByRole('button', { name: 'Skip' }));

    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'onboarding_cta_clicked', label: 'generate' })
    );
  });

  it('shows progress bar when isGenerating', () => {
    mockUseGeneration.mockReturnValue({
      ...defaultGenerationState,
      isGenerating: true,
      progress: 45,
    });
    render(<GenerateStep project={defaultProject} onNext={onNext} onSkip={onSkip} />);

    expect(screen.getByText(/Generating\.\.\. 45%/)).toBeInTheDocument();
  });

  it('disables buttons when isGenerating', () => {
    mockUseGeneration.mockReturnValue({
      ...defaultGenerationState,
      isGenerating: true,
      progress: 30,
    });
    render(<GenerateStep project={defaultProject} onNext={onNext} onSkip={onSkip} />);

    expect(screen.getByRole('button', { name: 'Generating...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Skip' })).toBeDisabled();
  });

  it('shows error message when error is set', () => {
    mockUseGeneration.mockReturnValue({ ...defaultGenerationState, error: 'Generation failed' });
    render(<GenerateStep project={defaultProject} onNext={onNext} onSkip={onSkip} />);

    expect(screen.getByText('Generation failed')).toBeInTheDocument();
  });

  it('shows code preview and Continue button after successful generation', async () => {
    mockStartGeneration.mockResolvedValue({
      code: 'export function PricingCard() { return null; }',
    });
    mockUseGeneration.mockReturnValue({
      ...defaultGenerationState,
      code: 'export function PricingCard() { return null; }',
    });

    const user = userEvent.setup();
    render(<GenerateStep project={defaultProject} onNext={onNext} onSkip={onSkip} />);

    await user.click(screen.getByRole('button', { name: 'Generate' }));

    await waitFor(() => {
      expect(screen.getByText('Your first component')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('calls onNext with generatedCode when Continue is clicked', async () => {
    const generatedCode = 'export function PricingCard() { return null; }';
    mockStartGeneration.mockResolvedValue({ code: generatedCode });
    mockUseGeneration.mockReturnValue({
      ...defaultGenerationState,
      code: generatedCode,
    });

    const user = userEvent.setup();
    render(<GenerateStep project={defaultProject} onNext={onNext} onSkip={onSkip} />);

    await user.click(screen.getByRole('button', { name: 'Generate' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onNext).toHaveBeenCalledWith({ generatedCode });
  });

  it('works with null project', () => {
    render(<GenerateStep project={null} onNext={onNext} onSkip={onSkip} />);
    expect(screen.getByText('Generate your first component')).toBeInTheDocument();
  });
});
