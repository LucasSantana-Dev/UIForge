import { render, screen, fireEvent } from '@testing-library/react';
import { PhaseNavigator } from '@/components/roadmap/PhaseNavigator';

const mockPhases = [
  {
    number: 1,
    title: 'Foundation',
    subtitle: 'Core infrastructure',
    status: 'active' as const,
    estimatedDate: 'Q1 2026',
    items: [],
  },
  {
    number: 2,
    title: 'Growth',
    subtitle: 'Feature expansion',
    status: 'planned' as const,
    estimatedDate: 'Q2 2026',
    items: [],
  },
  {
    number: 3,
    title: 'Scale',
    subtitle: 'Enterprise features',
    status: 'future' as const,
    estimatedDate: 'Q3 2026',
    items: [],
  },
];

describe('PhaseNavigator', () => {
  const onSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the phase navigation group', () => {
    render(<PhaseNavigator phases={mockPhases} activePhase={1} onSelect={onSelect} />);
    const group = screen.getByRole('group', { name: /phase navigation/i });
    expect(group).toBeInTheDocument();
  });

  it('renders a button for each phase', () => {
    render(<PhaseNavigator phases={mockPhases} activePhase={1} onSelect={onSelect} />);
    expect(screen.getByText(/Phase 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Phase 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Phase 3/i)).toBeInTheDocument();
  });

  it('marks active phase button with aria-pressed=true', () => {
    render(<PhaseNavigator phases={mockPhases} activePhase={2} onSelect={onSelect} />);
    const buttons = screen.getAllByRole('button');
    // phase 2 is activePhase
    const phase2Btn = buttons.find((b) => b.textContent?.includes('Phase 2'));
    expect(phase2Btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('marks non-active phases with aria-pressed=false', () => {
    render(<PhaseNavigator phases={mockPhases} activePhase={1} onSelect={onSelect} />);
    const buttons = screen.getAllByRole('button');
    const phase2Btn = buttons.find((b) => b.textContent?.includes('Phase 2'));
    const phase3Btn = buttons.find((b) => b.textContent?.includes('Phase 3'));
    expect(phase2Btn).toHaveAttribute('aria-pressed', 'false');
    expect(phase3Btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onSelect with the correct phase number when clicked', () => {
    render(<PhaseNavigator phases={mockPhases} activePhase={1} onSelect={onSelect} />);
    const buttons = screen.getAllByRole('button');
    const phase3Btn = buttons.find((b) => b.textContent?.includes('Phase 3'))!;
    fireEvent.click(phase3Btn);
    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it('handles null activePhase — all buttons aria-pressed=false', () => {
    render(<PhaseNavigator phases={mockPhases} activePhase={null} onSelect={onSelect} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-pressed', 'false');
    });
  });
});
