import { render, screen, fireEvent } from '@testing-library/react';
import { TourOverlay } from '@/components/tour/TourOverlay';

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}));

jest.mock('@/components/tour/tour-steps', () => ({
  TOUR_STEPS: [
    {
      target: '[data-tour="generate"]',
      title: 'Step One Title',
      description: 'Step one description text.',
      placement: 'right',
    },
    {
      target: '[data-tour="projects"]',
      title: 'Step Two Title',
      description: 'Step two description text.',
      placement: 'right',
    },
  ],
}));

jest.mock('lucide-react', () => ({
  X: () => <svg data-testid="x-icon" />,
  ChevronRight: () => <svg data-testid="chevron-right-icon" />,
  ChevronLeft: () => <svg data-testid="chevron-left-icon" />,
}));

// Stub document.querySelector for target element lookup
beforeEach(() => {
  jest.spyOn(document, 'querySelector').mockReturnValue(null);
});

afterEach(() => {
  jest.restoreAllMocks();
});

const defaultProps = {
  onComplete: jest.fn(),
  onDismiss: jest.fn(),
};

describe('TourOverlay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog with role="dialog" and aria-modal="true"', () => {
    render(<TourOverlay {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('renders the first step title and description', () => {
    render(<TourOverlay {...defaultProps} />);
    expect(screen.getByText('Step One Title')).toBeInTheDocument();
    expect(screen.getByText('Step one description text.')).toBeInTheDocument();
  });

  it('shows step counter "1 of 2"', () => {
    render(<TourOverlay {...defaultProps} />);
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
  });

  it('shows "Next" button on first step', () => {
    render(<TourOverlay {...defaultProps} />);
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('does not show Back button on first step', () => {
    render(<TourOverlay {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
  });

  it('calls onDismiss when X button is clicked', () => {
    render(<TourOverlay {...defaultProps} />);
    // Both backdrop div and X button have aria-label="Dismiss tour"; X is the last one (a <button>)
    const dismissButtons = screen.getAllByRole('button', { name: /dismiss tour/i });
    fireEvent.click(dismissButtons[dismissButtons.length - 1]);
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when backdrop is clicked', () => {
    render(<TourOverlay {...defaultProps} />);
    // Backdrop is a div with role="button" — first element with aria-label="Dismiss tour"
    const dismissElements = screen.getAllByRole('button', { name: /dismiss tour/i });
    fireEvent.click(dismissElements[0]);
    expect(defaultProps.onDismiss).toHaveBeenCalled();
  });

  it('advances to next step when Next is clicked', () => {
    render(<TourOverlay {...defaultProps} />);
    const nextBtn = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step Two Title')).toBeInTheDocument();
    expect(screen.getByText('2 of 2')).toBeInTheDocument();
  });

  it('shows "Done" instead of "Next" on the last step', () => {
    render(<TourOverlay {...defaultProps} />);
    // advance to last step
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^next$/i })).not.toBeInTheDocument();
  });

  it('shows Back button on second step', () => {
    render(<TourOverlay {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('goes back to previous step when Back is clicked', () => {
    render(<TourOverlay {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText('Step One Title')).toBeInTheDocument();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
  });

  it('calls onComplete when Done is clicked on the last step', () => {
    render(<TourOverlay {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /done/i }));
    expect(defaultProps.onComplete).toHaveBeenCalledTimes(1);
  });
});
