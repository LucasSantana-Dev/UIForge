import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FigmaExportDialog } from '@/components/wireframe/FigmaExportDialog';

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ id, value, onChange, placeholder }: any) => (
    <input id={id} value={value} onChange={onChange} placeholder={placeholder} />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value}>
      <button
        data-testid="select-trigger"
        onClick={() => onValueChange && onValueChange('figma-plugin')}
      />
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: any) => <div role="alert">{children}</div>,
  AlertDescription: ({ children }: any) => <span>{children}</span>,
}));

jest.mock('lucide-react', () => ({
  Loader2: () => <svg data-testid="icon-loader" />,
  Download: () => <svg data-testid="icon-download" />,
  CheckCircle: () => <svg data-testid="icon-check" />,
  AlertCircle: () => <svg data-testid="icon-alert" />,
}));

const mockWireframe = {
  wireframe: {
    type: 'pricing',
    width: 1440,
    height: 900,
    elements: [
      { id: 'el1', type: 'container' },
      { id: 'el2', type: 'text' },
    ],
  },
  metadata: {
    framework: 'react',
    componentType: 'PricingCard',
    generatedAt: '2026-03-15T12:00:00Z',
    outputFormat: 'json',
  },
};

describe('FigmaExportDialog', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('renders dialog with title', () => {
    render(<FigmaExportDialog wireframe={mockWireframe} onClose={mockOnClose} />);
    expect(screen.getByRole('heading', { name: /Export to Figma/i })).toBeInTheDocument();
  });

  it('shows wireframe details', () => {
    render(<FigmaExportDialog wireframe={mockWireframe} onClose={mockOnClose} />);
    expect(screen.getByText('pricing')).toBeInTheDocument();
    expect(screen.getByText('1440 × 900')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // elements count
    expect(screen.getByText('react')).toBeInTheDocument(); // framework
  });

  it('has default file name input', () => {
    render(<FigmaExportDialog wireframe={mockWireframe} onClose={mockOnClose} />);
    const input = screen.getByDisplayValue('Siza Wireframe');
    expect(input).toBeInTheDocument();
  });

  it('calls onClose when Close button clicked', () => {
    render(<FigmaExportDialog wireframe={mockWireframe} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('Export to Figma button is disabled when fileName is empty', () => {
    render(<FigmaExportDialog wireframe={mockWireframe} onClose={mockOnClose} />);
    const input = screen.getByDisplayValue('Siza Wireframe');
    fireEvent.change(input, { target: { value: '' } });
    const exportBtn = screen.getByRole('button', { name: /Export to Figma/i });
    expect(exportBtn).toBeDisabled();
  });

  it('calls fetch and shows success result', async () => {
    const mockResult = { format: 'json', data: { test: true }, instructions: 'Copy this JSON' };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResult,
    });

    render(<FigmaExportDialog wireframe={mockWireframe} onClose={mockOnClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Export to Figma/i }));

    await waitFor(() => {
      expect(screen.getByText('Export Successful')).toBeInTheDocument();
    });
    expect(screen.getByText('Copy this JSON')).toBeInTheDocument();
    expect(screen.getByText('Download JSON')).toBeInTheDocument();
    expect(screen.getByText('Copy to Clipboard')).toBeInTheDocument();
  });

  it('shows error when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    });

    render(<FigmaExportDialog wireframe={mockWireframe} onClose={mockOnClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Export to Figma/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText('Server error')).toBeInTheDocument();
  });

  it('hides Export to Figma button after successful export', async () => {
    const mockResult = { format: 'json', data: { test: true } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResult,
    });

    render(<FigmaExportDialog wireframe={mockWireframe} onClose={mockOnClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Export to Figma/i }));

    await waitFor(() => {
      expect(screen.getByText('Export Successful')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /Export to Figma/i })).not.toBeInTheDocument();
  });
});
