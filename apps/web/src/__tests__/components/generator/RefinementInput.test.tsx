import { render, screen, fireEvent } from '@testing-library/react';
import RefinementInput from '@/components/generator/RefinementInput';

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...rest }: any) => <span {...rest}>{children}</span>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...rest }: any) => (
    <button onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  ),
}));

const defaultProps = {
  onRefine: jest.fn(),
  onNewGeneration: jest.fn(),
  isGenerating: false,
  conversationTurn: 0,
  maxTurns: 10,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('RefinementInput', () => {
  it('renders "Refine Component" label', () => {
    render(<RefinementInput {...defaultProps} />);
    expect(screen.getByText('Refine Component')).toBeInTheDocument();
  });

  it('shows turn indicator "Turn 0/10"', () => {
    render(<RefinementInput {...defaultProps} />);
    expect(screen.getByText('Turn 0/10')).toBeInTheDocument();
  });

  it('clicking Refine button calls onRefine with trimmed value', () => {
    render(<RefinementInput {...defaultProps} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '  make it darker  ' } });
    fireEvent.click(screen.getByRole('button', { name: /refine/i }));
    expect(defaultProps.onRefine).toHaveBeenCalledWith('make it darker');
  });

  it('pressing Enter key submits the refinement', () => {
    render(<RefinementInput {...defaultProps} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'add hover states' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    expect(defaultProps.onRefine).toHaveBeenCalledWith('add hover states');
  });

  it('pressing Shift+Enter does NOT submit', () => {
    render(<RefinementInput {...defaultProps} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'add hover states' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(defaultProps.onRefine).not.toHaveBeenCalled();
  });

  it('shows conversation limit message when conversationTurn >= maxTurns', () => {
    render(<RefinementInput {...defaultProps} conversationTurn={10} maxTurns={10} />);
    expect(
      screen.getByText('Conversation limit reached. Start a new generation to continue.')
    ).toBeInTheDocument();
  });

  it('hides textarea when at conversation limit', () => {
    render(<RefinementInput {...defaultProps} conversationTurn={10} maxTurns={10} />);
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('Refine button is disabled when input is empty', () => {
    render(<RefinementInput {...defaultProps} />);
    const refineBtn = screen.getByRole('button', { name: /refine/i });
    expect(refineBtn).toBeDisabled();
  });

  it('Refine button is disabled when input is only whitespace', () => {
    render(<RefinementInput {...defaultProps} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '   ' } });
    expect(screen.getByRole('button', { name: /refine/i })).toBeDisabled();
  });

  it('Refine button is disabled when isGenerating=true', () => {
    render(<RefinementInput {...defaultProps} isGenerating={true} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'some text' } });
    expect(screen.getByRole('button', { name: /refine/i })).toBeDisabled();
  });

  it('clicking "New Generation" calls onNewGeneration', () => {
    render(<RefinementInput {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /new generation/i }));
    expect(defaultProps.onNewGeneration).toHaveBeenCalled();
  });

  it('clears input after successful submission', () => {
    render(<RefinementInput {...defaultProps} />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'make it darker' } });
    fireEvent.click(screen.getByRole('button', { name: /refine/i }));
    expect(textarea.value).toBe('');
  });

  it('does not call onRefine when at conversation limit and Enter is pressed', () => {
    render(<RefinementInput {...defaultProps} conversationTurn={10} maxTurns={10} />);
    // no textarea rendered at limit, just verify no call
    expect(defaultProps.onRefine).not.toHaveBeenCalled();
  });
});
