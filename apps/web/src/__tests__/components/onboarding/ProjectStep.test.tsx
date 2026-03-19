import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockTrackEvent = jest.fn();
const mockMutateAsync = jest.fn();
const mockUseCreateProject = jest.fn();

jest.mock('@/components/analytics/AnalyticsProvider', () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

jest.mock('@/hooks/use-projects', () => ({
  useCreateProject: () => mockUseCreateProject(),
}));

jest.mock('@siza/ui', () => ({
  Button: ({ children, onClick, disabled, type, ...props }: React.ComponentProps<'button'>) => (
    <button onClick={onClick} disabled={disabled} type={type} {...props}>
      {children}
    </button>
  ),
  Input: (props: React.ComponentProps<'input'>) => <input {...props} />,
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
  Select: ({
    children,
    value,
    onValueChange: _onValueChange,
  }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (v: string) => void;
  }) => (
    <div data-testid="select" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-trigger">{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
}));

import { ProjectStep } from '@/components/onboarding/ProjectStep';

const defaultMock = {
  mutateAsync: mockMutateAsync,
  isPending: false,
};

describe('ProjectStep', () => {
  const onNext = jest.fn();
  const onSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCreateProject.mockReturnValue(defaultMock);
    mockMutateAsync.mockResolvedValue({
      id: 'proj-1',
      name: 'My First Project',
      framework: 'react',
    });
  });

  it('renders the create project heading', () => {
    render(<ProjectStep onNext={onNext} onSkip={onSkip} />);
    expect(screen.getByText('Create your first project')).toBeInTheDocument();
  });

  it('renders project name input with default value', () => {
    render(<ProjectStep onNext={onNext} onSkip={onSkip} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('My First Project');
  });

  it('renders Create project and Skip buttons', () => {
    render(<ProjectStep onNext={onNext} onSkip={onSkip} />);
    expect(screen.getByRole('button', { name: 'Create project' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();
  });

  it('calls onSkip and trackEvent when Skip is clicked', async () => {
    const user = userEvent.setup();
    render(<ProjectStep onNext={onNext} onSkip={onSkip} />);

    await user.click(screen.getByRole('button', { name: 'Skip' }));

    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'onboarding_cta_clicked', label: 'project' })
    );
  });

  it('submits form and calls onNext with created project', async () => {
    const user = userEvent.setup();
    render(<ProjectStep onNext={onNext} onSkip={onSkip} />);

    await user.click(screen.getByRole('button', { name: 'Create project' }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'My First Project', framework: 'react' })
      );
      expect(onNext).toHaveBeenCalledWith({
        project: { id: 'proj-1', name: 'My First Project', framework: 'react' },
      });
    });
  });

  it('shows error message when mutation fails', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    render(<ProjectStep onNext={onNext} onSkip={onSkip} />);

    await user.click(screen.getByRole('button', { name: 'Create project' }));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
    expect(onNext).not.toHaveBeenCalled();
  });

  it('shows Creating... when isPending', () => {
    mockUseCreateProject.mockReturnValue({ ...defaultMock, isPending: true });
    render(<ProjectStep onNext={onNext} onSkip={onSkip} />);
    expect(screen.getByRole('button', { name: 'Creating...' })).toBeInTheDocument();
  });

  it('disables submit button when isPending', () => {
    mockUseCreateProject.mockReturnValue({ ...defaultMock, isPending: true });
    render(<ProjectStep onNext={onNext} onSkip={onSkip} />);
    expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled();
  });
});
