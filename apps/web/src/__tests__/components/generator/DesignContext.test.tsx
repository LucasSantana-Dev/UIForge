import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DesignContext, DESIGN_DEFAULTS } from '@/components/generator/DesignContext';

jest.mock('@/components/generator/ColorPicker', () => ({
  ColorPicker: ({ label, value, onChange }: any) => (
    <div>
      <label htmlFor={`color-${label}`}>{label}</label>
      <input
        id={`color-${label}`}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={`color-picker-${label.toLowerCase()}`}
      />
    </div>
  ),
}));

jest.mock('@/components/generator/ThemeSelector', () => ({
  ThemeSelector: () => <div data-testid="theme-selector" />,
}));

jest.mock('@/components/generator/ThemeGenerator', () => ({
  ThemeGenerator: () => <div data-testid="theme-generator" />,
}));

jest.mock('@/stores/theme-store', () => ({
  useThemeStore: (selector: any) => {
    const state = { getActiveTheme: () => () => null };
    return selector(state);
  },
}));

describe('DesignContext', () => {
  const defaultProps = {
    projectId: 'proj-1',
    values: DESIGN_DEFAULTS,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<DesignContext {...defaultProps} />);
    expect(screen.getByText('Design Settings')).toBeInTheDocument();
  });

  it('renders ThemeSelector and ThemeGenerator subcomponents', () => {
    render(<DesignContext {...defaultProps} />);
    expect(screen.getByTestId('theme-selector')).toBeInTheDocument();
    expect(screen.getByTestId('theme-generator')).toBeInTheDocument();
  });

  it('renders color mode radio group with 3 options', () => {
    render(<DesignContext {...defaultProps} />);
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Both' })).toBeInTheDocument();
  });

  it('calls onChange with updated colorMode when radio clicked', () => {
    const onChange = jest.fn();
    render(<DesignContext {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Light' }));
    expect(onChange).toHaveBeenCalledWith({ ...DESIGN_DEFAULTS, colorMode: 'light' });
  });

  it('renders Animation select with correct default', () => {
    render(<DesignContext {...defaultProps} />);
    const animSelect = screen.getByLabelText('Animation');
    expect(animSelect).toHaveValue(DESIGN_DEFAULTS.animation);
  });

  it('calls onChange when animation select changes', () => {
    const onChange = jest.fn();
    render(<DesignContext {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Animation'), { target: { value: 'rich' } });
    expect(onChange).toHaveBeenCalledWith({ ...DESIGN_DEFAULTS, animation: 'rich' });
  });

  it('renders Spacing select', () => {
    render(<DesignContext {...defaultProps} />);
    expect(screen.getByLabelText('Spacing')).toHaveValue(DESIGN_DEFAULTS.spacing);
  });

  it('calls onChange when spacing select changes', () => {
    const onChange = jest.fn();
    render(<DesignContext {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Spacing'), { target: { value: 'compact' } });
    expect(onChange).toHaveBeenCalledWith({ ...DESIGN_DEFAULTS, spacing: 'compact' });
  });

  it('renders Border Radius select', () => {
    render(<DesignContext {...defaultProps} />);
    const borderRadiusSelect = screen.getByLabelText('Border Radius');
    expect(borderRadiusSelect).toBeInTheDocument();
    expect(borderRadiusSelect).toHaveValue(DESIGN_DEFAULTS.borderRadius);
  });

  it('renders Typography select with correct default', () => {
    render(<DesignContext {...defaultProps} />);
    expect(screen.getByLabelText('Typography')).toHaveValue(DESIGN_DEFAULTS.typography);
  });

  it('calls onChange when typography changes', () => {
    const onChange = jest.fn();
    render(<DesignContext {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Typography'), { target: { value: 'mono' } });
    expect(onChange).toHaveBeenCalledWith({ ...DESIGN_DEFAULTS, typography: 'mono' });
  });

  it('dark color mode button is marked aria-checked=true by default', () => {
    render(<DesignContext {...defaultProps} />);
    const darkBtn = screen.getByRole('radio', { name: 'Dark' });
    expect(darkBtn).toHaveAttribute('aria-checked', 'true');
  });
});
