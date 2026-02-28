import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DesignAnalysisPanel from '@/components/generator/DesignAnalysisPanel';
import type { DesignAnalysis } from '@/lib/services/image-analysis';

const mockAnalysis: DesignAnalysis = {
  layout: 'Two-column layout with sidebar',
  components: ['Button', 'Card', 'Navbar', 'Input', 'Avatar', 'Badge'],
  colors: ['#7C3AED', '#6366F1', '#22C55E', '#EF4444'],
  typography: 'Sans-serif, 16px base, bold headings',
  spacing: 'Spacious with 24px gaps',
  interactions: ['Hover effects on cards', 'Fade-in animations'],
  suggestedPrompt: 'Create a dashboard with a sidebar navigation and main content area',
};

describe('DesignAnalysisPanel', () => {
  const defaultProps = {
    imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk',
    imageMimeType: 'image/png',
    onApply: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should render analyze button initially', () => {
    render(<DesignAnalysisPanel {...defaultProps} />);
    expect(screen.getByRole('button', { name: /analyze design/i })).toBeInTheDocument();
  });

  it('should show loading state while analyzing', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<DesignAnalysisPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /analyze design/i }));

    expect(screen.getByText(/analyzing design/i)).toBeInTheDocument();
  });

  it('should display analysis results after successful fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ analysis: mockAnalysis }),
    });

    render(<DesignAnalysisPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /analyze design/i }));

    await waitFor(() => {
      expect(screen.getByText('Design Analysis')).toBeInTheDocument();
    });

    expect(screen.getByText(mockAnalysis.layout)).toBeInTheDocument();
    expect(screen.getByText(/Button, Card, Navbar, Input, Avatar/)).toBeInTheDocument();
    expect(screen.getByText(/\+1 more/)).toBeInTheDocument();
  });

  it('should call onApply with analysis when Apply button clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ analysis: mockAnalysis }),
    });

    render(<DesignAnalysisPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /analyze design/i }));

    await waitFor(() => {
      expect(screen.getByText('Design Analysis')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /apply to form/i }));
    expect(defaultProps.onApply).toHaveBeenCalledWith(mockAnalysis);
  });

  it('should show error message on fetch failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Rate limit exceeded' }),
    });

    render(<DesignAnalysisPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /analyze design/i }));

    await waitFor(() => {
      expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument();
    });
  });

  it('should render color swatches from analysis', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ analysis: mockAnalysis }),
    });

    render(<DesignAnalysisPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /analyze design/i }));

    await waitFor(() => {
      expect(screen.getByText('Design Analysis')).toBeInTheDocument();
    });

    const swatches = screen.getAllByTitle(/#[0-9A-Fa-f]{6}/);
    expect(swatches.length).toBe(4);
    expect(swatches[0]).toHaveAttribute('title', '#7C3AED');
  });

  it('should show suggested prompt preview', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ analysis: mockAnalysis }),
    });

    render(<DesignAnalysisPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /analyze design/i }));

    await waitFor(() => {
      expect(screen.getByText(/Create a dashboard with a sidebar/)).toBeInTheDocument();
    });
  });

  it('should send correct payload to API', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ analysis: mockAnalysis }),
    });

    render(<DesignAnalysisPanel {...defaultProps} userApiKey="sk-test" />);
    fireEvent.click(screen.getByRole('button', { name: /analyze design/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/generate/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: defaultProps.imageBase64,
          imageMimeType: defaultProps.imageMimeType,
          userApiKey: 'sk-test',
        }),
      });
    });
  });
});
