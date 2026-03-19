import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSelector } from '@/components/generator/ThemeSelector';
import type { DesignContextValues } from '@/components/generator/DesignContext';

jest.mock('@/stores/theme-store', () => ({
  useThemeStore: jest.fn(),
}));

jest.mock('lucide-react', () => ({
  ChevronDownIcon: () => <svg data-testid="chevron-icon" />,
  PlusIcon: () => <svg data-testid="plus-icon" />,
  CheckIcon: () => <svg data-testid="check-icon" />,
  XIcon: () => <svg data-testid="x-icon" />,
  CopyIcon: () => <svg data-testid="copy-icon" />,
  TrashIcon: () => <svg data-testid="trash-icon" />,
  DownloadIcon: () => <svg data-testid="download-icon" />,
  UploadIcon: () => <svg data-testid="upload-icon" />,
  PaletteIcon: () => <svg data-testid="palette-icon" />,
}));

import { useThemeStore } from '@/stores/theme-store';
const mockUseThemeStore = useThemeStore as jest.MockedFunction<typeof useThemeStore>;

const mockThemes = [
  {
    id: 'default',
    name: 'Default',
    builtIn: true,
    primaryColor: '#8B5CF6',
    secondaryColor: '#3B82F6',
    accentColor: '#22C55E',
    colorMode: 'dark' as const,
    animation: 'subtle' as const,
    spacing: 'default' as const,
    borderRadius: 'medium' as const,
    typography: 'system' as const,
  },
  {
    id: 'custom-1',
    name: 'My Theme',
    builtIn: false,
    primaryColor: '#FF0000',
    secondaryColor: '#00FF00',
    accentColor: '#0000FF',
    colorMode: 'dark' as const,
    animation: 'subtle' as const,
    spacing: 'default' as const,
    borderRadius: 'medium' as const,
    typography: 'system' as const,
  },
];

const mockGetThemes = jest.fn().mockReturnValue(mockThemes);
const mockGetActiveTheme = jest.fn().mockReturnValue(mockThemes[0]);
const mockSetActiveTheme = jest.fn();
const mockCreateTheme = jest.fn().mockReturnValue('new-id');
const mockDeleteTheme = jest.fn();
const mockDuplicateTheme = jest.fn().mockReturnValue('dup-id');
const mockExportTheme = jest.fn().mockReturnValue('{"name":"Default"}');
const mockImportTheme = jest.fn().mockReturnValue(null);
const mockImportBrand = jest.fn().mockReturnValue(null);

const mockStore = {
  getThemes: mockGetThemes,
  getActiveTheme: mockGetActiveTheme,
  setActiveTheme: mockSetActiveTheme,
  createTheme: mockCreateTheme,
  deleteTheme: mockDeleteTheme,
  duplicateTheme: mockDuplicateTheme,
  exportTheme: mockExportTheme,
  importTheme: mockImportTheme,
  importBrand: mockImportBrand,
};

const defaultValues: DesignContextValues = {
  primaryColor: '#8B5CF6',
  secondaryColor: '#3B82F6',
  accentColor: '#22C55E',
  colorMode: 'dark',
  animation: 'subtle',
  spacing: 'default',
  borderRadius: 'medium',
  typography: 'system',
};

describe('ThemeSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseThemeStore.mockReturnValue(mockStore as any);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  it('shows active theme name in toggle button', () => {
    render(
      <ThemeSelector projectId="proj-1" currentValues={defaultValues} onSelectTheme={jest.fn()} />
    );
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('shows "Select Theme" when no active theme', () => {
    mockGetActiveTheme.mockReturnValueOnce(null);
    render(
      <ThemeSelector projectId="proj-1" currentValues={defaultValues} onSelectTheme={jest.fn()} />
    );
    expect(screen.getByText('Select Theme')).toBeInTheDocument();
  });

  it('opens dropdown when toggle button is clicked', () => {
    render(
      <ThemeSelector projectId="proj-1" currentValues={defaultValues} onSelectTheme={jest.fn()} />
    );
    fireEvent.click(screen.getByText('Default'));
    expect(screen.getByText('My Theme')).toBeInTheDocument();
    expect(screen.getByText('Save Current as Theme')).toBeInTheDocument();
  });

  it('calls setActiveTheme and onSelectTheme when theme is selected', () => {
    const onSelectTheme = jest.fn();
    render(
      <ThemeSelector
        projectId="proj-1"
        currentValues={defaultValues}
        onSelectTheme={onSelectTheme}
      />
    );
    fireEvent.click(screen.getByText('Default'));
    fireEvent.click(screen.getByText('My Theme'));
    expect(mockSetActiveTheme).toHaveBeenCalledWith('proj-1', 'custom-1');
    expect(onSelectTheme).toHaveBeenCalled();
  });

  it('shows save input when Save Current as Theme is clicked', () => {
    render(
      <ThemeSelector projectId="proj-1" currentValues={defaultValues} onSelectTheme={jest.fn()} />
    );
    fireEvent.click(screen.getByText('Default'));
    fireEvent.click(screen.getByText('Save Current as Theme'));
    expect(screen.getByPlaceholderText('Theme name...')).toBeInTheDocument();
  });

  it('confirm save is disabled when theme name is empty', () => {
    render(
      <ThemeSelector projectId="proj-1" currentValues={defaultValues} onSelectTheme={jest.fn()} />
    );
    fireEvent.click(screen.getByText('Default'));
    fireEvent.click(screen.getByText('Save Current as Theme'));
    // Find confirm button - disabled when name empty
    const input = screen.getByPlaceholderText('Theme name...');
    expect(input).toBeInTheDocument();
    // The confirm SVG button should be disabled when input is empty
    const buttons = screen.getAllByRole('button');
    const confirmBtn = buttons.find((b) => b.querySelector('[data-testid="check-icon"]') !== null);
    expect(confirmBtn).toBeDisabled();
  });

  it('calls createTheme when save is confirmed', () => {
    render(
      <ThemeSelector projectId="proj-1" currentValues={defaultValues} onSelectTheme={jest.fn()} />
    );
    fireEvent.click(screen.getByText('Default'));
    fireEvent.click(screen.getByText('Save Current as Theme'));
    const input = screen.getByPlaceholderText('Theme name...');
    fireEvent.change(input, { target: { value: 'My New Theme' } });
    const buttons = screen.getAllByRole('button');
    const confirmBtn = buttons.find((b) => b.querySelector('[data-testid="check-icon"]') !== null);
    fireEvent.click(confirmBtn!);
    expect(mockCreateTheme).toHaveBeenCalledWith(expect.objectContaining({ name: 'My New Theme' }));
  });

  it('shows import textarea when Import Theme / Brand is clicked', () => {
    render(
      <ThemeSelector projectId="proj-1" currentValues={defaultValues} onSelectTheme={jest.fn()} />
    );
    fireEvent.click(screen.getByText('Default'));
    fireEvent.click(screen.getByText('Import Theme / Brand'));
    expect(screen.getByPlaceholderText(/Paste theme JSON/i)).toBeInTheDocument();
  });

  it('shows error when invalid JSON is imported', () => {
    // Both importBrand and importTheme return null = failure
    mockImportBrand.mockReturnValueOnce(null);
    mockImportTheme.mockReturnValueOnce(null);
    render(
      <ThemeSelector projectId="proj-1" currentValues={defaultValues} onSelectTheme={jest.fn()} />
    );
    fireEvent.click(screen.getByText('Default'));
    fireEvent.click(screen.getByText('Import Theme / Brand'));
    const textarea = screen.getByPlaceholderText(/Paste theme JSON/i);
    fireEvent.change(textarea, { target: { value: 'invalid json' } });
    fireEvent.click(screen.getByRole('button', { name: /^Import$/ }));
    expect(screen.getByText(/Invalid theme or brand identity JSON/i)).toBeInTheDocument();
  });

  it('calls exportTheme and copies to clipboard', () => {
    render(
      <ThemeSelector projectId="proj-1" currentValues={defaultValues} onSelectTheme={jest.fn()} />
    );
    fireEvent.click(screen.getByText('Default'));
    const exportBtns = screen.getAllByTitle('Export to clipboard');
    fireEvent.click(exportBtns[0]);
    expect(mockExportTheme).toHaveBeenCalled();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('{"name":"Default"}');
  });

  it('calls duplicateTheme when Duplicate is clicked', () => {
    render(
      <ThemeSelector projectId="proj-1" currentValues={defaultValues} onSelectTheme={jest.fn()} />
    );
    fireEvent.click(screen.getByText('Default'));
    // Duplicate buttons exist for each theme
    const duplicateButtons = screen.getAllByTitle('Duplicate');
    fireEvent.click(duplicateButtons[1]); // custom theme (index 1)
    expect(mockDuplicateTheme).toHaveBeenCalledWith('custom-1', 'My Theme (Copy)');
  });

  it('does not show Delete button for built-in themes', () => {
    render(
      <ThemeSelector projectId="proj-1" currentValues={defaultValues} onSelectTheme={jest.fn()} />
    );
    fireEvent.click(screen.getByText('Default'));
    const deleteButtons = screen.queryAllByTitle('Delete');
    // Only 1 delete (custom theme), not 2 (built-in has none)
    expect(deleteButtons).toHaveLength(1);
  });

  it('calls deleteTheme for non-built-in themes', () => {
    render(
      <ThemeSelector projectId="proj-1" currentValues={defaultValues} onSelectTheme={jest.fn()} />
    );
    fireEvent.click(screen.getByText('Default'));
    const deleteBtn = screen.getByTitle('Delete');
    fireEvent.click(deleteBtn);
    expect(mockDeleteTheme).toHaveBeenCalledWith('custom-1');
  });

  it('Escape key cancels save mode', () => {
    render(
      <ThemeSelector projectId="proj-1" currentValues={defaultValues} onSelectTheme={jest.fn()} />
    );
    fireEvent.click(screen.getByText('Default'));
    fireEvent.click(screen.getByText('Save Current as Theme'));
    const input = screen.getByPlaceholderText('Theme name...');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByPlaceholderText('Theme name...')).not.toBeInTheDocument();
  });
});
