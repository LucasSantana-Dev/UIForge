import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FeedbackPanel from '@/components/generator/FeedbackPanel';

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, ...rest }: any) => (
    <button onClick={onClick} data-variant={variant} data-size={size} {...rest}>
      {children}
    </button>
  ),
}));

beforeEach(() => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true })) as jest.Mock;
  jest.clearAllMocks();
});

describe('FeedbackPanel', () => {
  it('renders null when generationId is null', () => {
    const { container } = render(<FeedbackPanel generationId={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders "Rate this generation" when generationId is provided', () => {
    render(<FeedbackPanel generationId="gen-abc" />);
    expect(screen.getByText('Rate this generation:')).toBeInTheDocument();
  });

  it('clicking thumbs up calls fetch with score 1.0', async () => {
    render(<FeedbackPanel generationId="gen-abc" />);
    const buttons = screen.getAllByRole('button');
    // First button is thumbs up
    fireEvent.click(buttons[0]);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/generations/gen-abc',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ quality_score: 1.0, user_feedback: 'thumbs_up' }),
        })
      );
    });
  });

  it('clicking thumbs down calls fetch with score 0.3', async () => {
    render(<FeedbackPanel generationId="gen-abc" />);
    const buttons = screen.getAllByRole('button');
    // Second button is thumbs down
    fireEvent.click(buttons[1]);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/generations/gen-abc',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ quality_score: 0.3, user_feedback: 'thumbs_down' }),
        })
      );
    });
  });

  it('shows "Thanks for your feedback!" after submission', async () => {
    render(<FeedbackPanel generationId="gen-abc" />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    await waitFor(() => {
      expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument();
    });
  });

  it('shows RAG-enhanced label when ragEnriched=true', () => {
    render(<FeedbackPanel generationId="gen-abc" ragEnriched={true} />);
    expect(screen.getByText('RAG-enhanced')).toBeInTheDocument();
  });

  it('does NOT show RAG-enhanced when ragEnriched=false', () => {
    render(<FeedbackPanel generationId="gen-abc" ragEnriched={false} />);
    expect(screen.queryByText('RAG-enhanced')).toBeNull();
  });

  it('shows RAG-enhanced label in submitted state when ragEnriched=true', async () => {
    render(<FeedbackPanel generationId="gen-abc" ragEnriched={true} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    await waitFor(() => {
      expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument();
      expect(screen.getByText('RAG-enhanced')).toBeInTheDocument();
    });
  });

  it('does not show RAG-enhanced in submitted state when ragEnriched=false', async () => {
    render(<FeedbackPanel generationId="gen-abc" ragEnriched={false} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    await waitFor(() => {
      expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument();
    });
    expect(screen.queryByText('RAG-enhanced')).toBeNull();
  });
});
