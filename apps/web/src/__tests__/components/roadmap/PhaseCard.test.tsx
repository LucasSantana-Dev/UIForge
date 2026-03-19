import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhaseCard } from '@/components/roadmap/PhaseCard';
import type { Phase } from '@/components/roadmap/types';

jest.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useInView: () => true,
  useReducedMotion: () => true,
}));

jest.mock('@/components/landing/constants', () => ({
  EASE_SIZA: [0.16, 1, 0.3, 1],
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
    <div className={className}>{children}</div>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    className,
  }: React.PropsWithChildren<{ className?: string; variant?: string }>) => (
    <span className={className}>{children}</span>
  ),
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: { value: number }) => <div role="progressbar" aria-valuenow={value} />,
}));

jest.mock('lucide-react', () => ({
  Check: () => <svg data-testid="check-icon" />,
  Circle: () => <svg data-testid="circle-icon" />,
  Loader2: () => <svg data-testid="loader2-icon" />,
  ChevronDown: () => <svg data-testid="chevron-icon" />,
  ExternalLink: () => <svg data-testid="external-link-icon" />,
}));

jest.mock('clsx', () => ({
  clsx: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

const mockPhase: Phase = {
  number: 1,
  title: 'Foundation',
  subtitle: 'Core infrastructure setup',
  status: 'active',
  estimatedDate: 'Q1 2026',
  items: [
    { label: 'Auth system', status: 'done' },
    { label: 'Database schema', status: 'in-progress' },
    { label: 'API gateway', status: 'planned' },
  ],
};

const defaultProps = {
  phase: mockPhase,
  index: 0,
  totalPhases: 3,
  expanded: false,
  onToggle: jest.fn(),
  activeFilter: 'all' as const,
  scope: 'all' as const,
};

describe('PhaseCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders phase number and title', () => {
    render(<PhaseCard {...defaultProps} />);
    expect(screen.getByText('Phase 1')).toBeInTheDocument();
    expect(screen.getByText('Foundation')).toBeInTheDocument();
  });

  it('renders subtitle and estimated date', () => {
    render(<PhaseCard {...defaultProps} />);
    expect(screen.getByText('Core infrastructure setup')).toBeInTheDocument();
    expect(screen.getByText('Q1 2026')).toBeInTheDocument();
  });

  it('renders Current badge for active phase', () => {
    render(<PhaseCard {...defaultProps} />);
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('does not render Current badge for planned phase', () => {
    const plannedPhase = { ...mockPhase, status: 'planned' as const };
    render(<PhaseCard {...defaultProps} phase={plannedPhase} />);
    expect(screen.queryByText('Current')).not.toBeInTheDocument();
  });

  it('calls onToggle when header button is clicked', () => {
    render(<PhaseCard {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders progress bar', () => {
    render(<PhaseCard {...defaultProps} />);
    const progressBar = screen.getByRole('progressbar');
    // 1 done out of 3 items = 33%
    expect(progressBar).toHaveAttribute('aria-valuenow', '33');
  });

  it('renders phase progress as percentage text', () => {
    render(<PhaseCard {...defaultProps} />);
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('shows items when expanded=true', () => {
    render(<PhaseCard {...defaultProps} expanded={true} />);
    expect(screen.getByText('Auth system')).toBeInTheDocument();
    expect(screen.getByText('Database schema')).toBeInTheDocument();
    expect(screen.getByText('API gateway')).toBeInTheDocument();
  });

  it('hides items when expanded=false', () => {
    render(<PhaseCard {...defaultProps} expanded={false} />);
    expect(screen.queryByText('Auth system')).not.toBeInTheDocument();
  });

  it('filters items by status when activeFilter is set', () => {
    render(<PhaseCard {...defaultProps} expanded={true} activeFilter="done" />);
    expect(screen.getByText('Auth system')).toBeInTheDocument();
    expect(screen.queryByText('Database schema')).not.toBeInTheDocument();
    expect(screen.queryByText('API gateway')).not.toBeInTheDocument();
  });

  it('shows no items message when filter matches nothing', () => {
    render(
      <PhaseCard {...defaultProps} expanded={true} activeFilter="in-progress" scope="desktop" />
    );
    expect(screen.getByText('No items match the selected filter.')).toBeInTheDocument();
  });

  it('renders GitHub link when item has githubUrl', () => {
    const phaseWithUrl: Phase = {
      ...mockPhase,
      items: [
        { label: 'Auth system', status: 'done', githubUrl: 'https://github.com/test/issue/1' },
      ],
    };
    render(<PhaseCard {...defaultProps} phase={phaseWithUrl} expanded={true} />);
    const link = screen.getByRole('link', { name: /View Auth system on GitHub/i });
    expect(link).toHaveAttribute('href', 'https://github.com/test/issue/1');
  });

  it('has correct aria-expanded attribute on toggle button', () => {
    render(<PhaseCard {...defaultProps} expanded={true} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
