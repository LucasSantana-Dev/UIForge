import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeGenerator } from '@/components/generator/ThemeGenerator';

const DESIGN_DEFAULTS = {
  colorMode: 'dark' as const,
  primaryColor: '#8B5CF6',
  secondaryColor: '#3B82F6',
  accentColor: '#22C55E',
  animation: 'subtle' as const,
  spacing: 'default' as const,
  borderRadius: 'medium' as const,
  typography: 'system' as const,
};

const mockCreateTheme = jest.fn(() => 'theme-123');
const mockSetActiveTheme = jest.fn();

jest.mock('@/stores/theme-store', () => ({
  useThemeStore: (selector: any) => {
    const state = {
      createTheme: mockCreateTheme,
      setActiveTheme: mockSetActiveTheme,
    };
    return selector(state);
  },
}));

const mockGenerated = {
  primaryColor: '#ff0000',
  secondaryColor: '#00ff00',
  accentColor: '#0000ff',
  colorMode: 'dark',
  animation: 'subtle',
  spacing: 'default',
  borderRadius: 'medium',
  typography: 'system',
};

jest.mock('@/lib/themes/generator', () => ({
  THEME_GENERATOR_PRESETS: [
    { value: 'balanced', label: 'Balanced' },
    { value: 'vibrant', label: 'Vibrant' },
    { value: 'muted', label: 'Muted' },
  ],
  generateThemeFromInput: jest.fn(() => mockGenerated),
}));

describe('ThemeGenerator', () => {
  const defaultProps = {
    projectId: 'proj-1',
    values: DESIGN_DEFAULTS,
    onApply: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ThemeGenerator {...defaultProps} />);
    expect(screen.getByText('Theme Generator')).toBeInTheDocument();
  });

  it('renders preset selector with options', () => {
    render(<ThemeGenerator {...defaultProps} />);
    const select = screen.getByLabelText('Preset');
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Balanced' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Vibrant' })).toBeInTheDocument();
  });

  it('renders seed color input', () => {
    render(<ThemeGenerator {...defaultProps} />);
    expect(screen.getByLabelText('Seed Color')).toBeInTheDocument();
  });

  it('renders mood input', () => {
    render(<ThemeGenerator {...defaultProps} />);
    expect(screen.getByLabelText('Mood')).toBeInTheDocument();
  });

  it('calls onApply with generated theme when Apply is clicked', () => {
    const onApply = jest.fn();
    render(<ThemeGenerator {...defaultProps} onApply={onApply} />);
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));
    expect(onApply).toHaveBeenCalledWith(mockGenerated);
  });

  it('calls createTheme and setActiveTheme when Save Theme is clicked', () => {
    const onApply = jest.fn();
    render(<ThemeGenerator {...defaultProps} onApply={onApply} />);
    fireEvent.click(screen.getByRole('button', { name: /save theme/i }));
    expect(mockCreateTheme).toHaveBeenCalled();
    expect(mockSetActiveTheme).toHaveBeenCalledWith('proj-1', 'theme-123');
    expect(onApply).toHaveBeenCalledWith(mockGenerated);
  });

  it('updates preset on select change', () => {
    render(<ThemeGenerator {...defaultProps} />);
    const select = screen.getByLabelText('Preset');
    fireEvent.change(select, { target: { value: 'vibrant' } });
    expect(select).toHaveValue('vibrant');
  });

  it('updates mood input on change', () => {
    render(<ThemeGenerator {...defaultProps} />);
    const moodInput = screen.getByLabelText('Mood');
    fireEvent.change(moodInput, { target: { value: 'bold' } });
    expect(moodInput).toHaveValue('bold');
  });

  it('shows Deterministic label', () => {
    render(<ThemeGenerator {...defaultProps} />);
    expect(screen.getByText('Deterministic')).toBeInTheDocument();
  });
});
