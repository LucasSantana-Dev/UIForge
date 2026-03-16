import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeSelector } from '@/components/generator/ThemeSelector';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronDownIcon: () => <svg data-testid="chevron-down-icon" />,
  PlusIcon: () => <svg data-testid="plus-icon" />,
  CopyIcon: () => <svg data-testid="copy-icon" />,
  TrashIcon: () => <svg data-testid="trash-icon" />,
  DownloadIcon: () => <svg data-testid="download-icon" />,
  UploadIcon: () => <svg data-testid="upload-icon" />,
  CheckIcon: () => <svg data-testid="check-icon" />,
  XIcon: () => <svg data-testid="x-icon" />,
}));

// Mock theme store
const mockGetThemes = jest.fn();
const mockGetActiveTheme = jest.fn();
const mockSetActiveTheme = jest.fn();
const mockCreateTheme = jest.fn();
const mockDeleteTheme = jest.fn();
const mockDuplicateTheme = jest.fn();
const mockExportTheme = jest.fn();
const mockImportTheme = jest.fn();
const mockImportBrand = jest.fn();

jest.mock('@/stores/theme-store', () => ({
  useThemeStore: () => ({
    getThemes: mockGetThemes,
    getActiveTheme: mockGetActiveTheme,
    setActiveTheme: mockSetActiveTheme,
    createTheme: mockCreateTheme,
    deleteTheme: mockDeleteTheme,
    duplicateTheme: mockDuplicateTheme,
    exportTheme: mockExportTheme,
    importTheme: mockImportTheme,
    importBrand: mockImportBrand,
  }),
}));

const mockBuiltInTheme = {
  id: 'theme-default',
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
};

const mockCustomTheme = {
  id: 'theme-custom',
  name: 'My Custom Theme',
  builtIn: false,
  primaryColor: '#FF0000',
  secondaryColor: '#00FF00',
  accentColor: '#0000FF',
  colorMode: 'dark' as const,
  animation: 'subtle' as const,
  spacing: 'default' as const,
  borderRadius: 'medium' as const,
  typography: 'system' as const,
};

const defaultCurrentValues = {
  colorMode: 'dark' as const,
  primaryColor: '#8B5CF6',
  secondaryColor: '#3B82F6',
  accentColor: '#22C55E',
  animation: 'subtle' as const,
  spacing: 'default' as const,
  borderRadius: 'medium' as const,
  typography: 'system' as const,
};

describe('ThemeSelector', () => {
  const mockOnSelectTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetThemes.mockReturnValue([mockBuiltInTheme, mockCustomTheme]);
    mockGetActiveTheme.mockReturnValue(mockBuiltInTheme);
    mockCreateTheme.mockReturnValue('theme-new');
    mockDuplicateTheme.mockReturnValue('theme-copy');
    mockExportTheme.mockReturnValue('{"json":"data"}');
    mockImportTheme.mockReturnValue(null);
    mockImportBrand.mockReturnValue(null);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  it('shows active theme name in toggle button', () => {
    render(
      <ThemeSelector
        projectId="proj-1"
        currentValues={defaultCurrentValues}
        onSelectTheme={mockOnSelectTheme}
      />
    );
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('shows "Select Theme" when no active theme', () => {
    mockGetActiveTheme.mockReturnValue(null);
    render(
      <ThemeSelector
        projectId="proj-1"
        currentValues={defaultCurrentValues}
        onSelectTheme={mockOnSelectTheme}
      />
    );
    expect(screen.getByText('Select Theme')).toBeInTheDocument();
  });

  it('opens dropdown on toggle button click and shows themes', () => {
    render(
      <ThemeSelector
        projectId="proj-1"
        currentValues={defaultCurrentValues}
        onSelectTheme={mockOnSelectTheme}
      />
    );
    const toggleBtn = screen.getAllByRole('button')[0];
    fireEvent.click(toggleBtn);
    expect(screen.getByText('My Custom Theme')).toBeInTheDocument();
    expect(screen.getByText('Save Current as Theme')).toBeInTheDocument();
    expect(screen.getByText('Import Theme / Brand')).toBeInTheDocument();
  });

  it('selects theme on click and calls onSelectTheme', () => {
    render(
      <ThemeSelector
        projectId="proj-1"
        currentValues={defaultCurrentValues}
        onSelectTheme={mockOnSelectTheme}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('My Custom Theme'));
    expect(mockSetActiveTheme).toHaveBeenCalledWith('proj-1', 'theme-custom');
    expect(mockOnSelectTheme).toHaveBeenCalledWith(
      expect.objectContaining({ primaryColor: '#FF0000' })
    );
  });

  it('shows save input when "Save Current as Theme" clicked', () => {
    render(
      <ThemeSelector
        projectId="proj-1"
        currentValues={defaultCurrentValues}
        onSelectTheme={mockOnSelectTheme}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Save Current as Theme'));
    expect(screen.getByPlaceholderText('Theme name...')).toBeInTheDocument();
  });

  it('confirm save button disabled when name is empty', () => {
    render(
      <ThemeSelector
        projectId="proj-1"
        currentValues={defaultCurrentValues}
        onSelectTheme={mockOnSelectTheme}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Save Current as Theme'));
    const confirmBtn = screen.getByTitle('Save theme');
    expect(confirmBtn).toBeDisabled();
  });

  it('saves theme when name is provided and confirm clicked', () => {
    render(
      <ThemeSelector
        projectId="proj-1"
        currentValues={defaultCurrentValues}
        onSelectTheme={mockOnSelectTheme}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Save Current as Theme'));
    fireEvent.change(screen.getByPlaceholderText('Theme name...'), {
      target: { value: 'New Theme' },
    });
    fireEvent.click(screen.getByTitle('Save theme'));
    expect(mockCreateTheme).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Theme' }));
    expect(mockSetActiveTheme).toHaveBeenCalledWith('proj-1', 'theme-new');
  });

  it('shows import textarea when "Import Theme / Brand" clicked', () => {
    render(
      <ThemeSelector
        projectId="proj-1"
        currentValues={defaultCurrentValues}
        onSelectTheme={mockOnSelectTheme}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Import Theme / Brand'));
    expect(
      screen.getByPlaceholderText('Paste theme JSON or brand identity JSON...')
    ).toBeInTheDocument();
  });

  it('shows error when import JSON is invalid', () => {
    render(
      <ThemeSelector
        projectId="proj-1"
        currentValues={defaultCurrentValues}
        onSelectTheme={mockOnSelectTheme}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Import Theme / Brand'));
    fireEvent.change(screen.getByPlaceholderText('Paste theme JSON or brand identity JSON...'), {
      target: { value: '{"invalid":"json"}' },
    });
    fireEvent.click(screen.getByText('Import'));
    expect(screen.getByText('Invalid theme or brand identity JSON')).toBeInTheDocument();
  });

  it('exports theme to clipboard when export button clicked', async () => {
    render(
      <ThemeSelector
        projectId="proj-1"
        currentValues={defaultCurrentValues}
        onSelectTheme={mockOnSelectTheme}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    const exportBtns = screen.getAllByTitle('Export to clipboard');
    fireEvent.click(exportBtns[0]);
    expect(mockExportTheme).toHaveBeenCalledWith('theme-default');
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('{"json":"data"}');
    });
  });

  it('duplicates theme when duplicate button clicked', () => {
    mockGetThemes
      .mockReturnValueOnce([mockBuiltInTheme, mockCustomTheme])
      .mockReturnValueOnce([mockBuiltInTheme, mockCustomTheme])
      .mockReturnValue([
        mockBuiltInTheme,
        mockCustomTheme,
        { ...mockCustomTheme, id: 'theme-copy', name: 'My Custom Theme (Copy)' },
      ]);

    render(
      <ThemeSelector
        projectId="proj-1"
        currentValues={defaultCurrentValues}
        onSelectTheme={mockOnSelectTheme}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    const dupBtns = screen.getAllByTitle('Duplicate');
    fireEvent.click(dupBtns[1]); // Second theme (custom)
    expect(mockDuplicateTheme).toHaveBeenCalledWith('theme-custom', 'My Custom Theme (Copy)');
    expect(mockSetActiveTheme).toHaveBeenCalledWith('proj-1', 'theme-copy');
  });

  it('deletes non-built-in theme when delete button clicked', () => {
    render(
      <ThemeSelector
        projectId="proj-1"
        currentValues={defaultCurrentValues}
        onSelectTheme={mockOnSelectTheme}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    const deleteBtns = screen.getAllByTitle('Delete');
    expect(deleteBtns).toHaveLength(1); // Only custom theme has delete
    fireEvent.click(deleteBtns[0]);
    expect(mockDeleteTheme).toHaveBeenCalledWith('theme-custom');
  });

  it('does not show delete button for built-in themes', () => {
    render(
      <ThemeSelector
        projectId="proj-1"
        currentValues={defaultCurrentValues}
        onSelectTheme={mockOnSelectTheme}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    const deleteBtns = screen.getAllByTitle('Delete');
    // Only 1 delete button (for custom theme), not for built-in
    expect(deleteBtns).toHaveLength(1);
  });

  it('cancels save on Escape key', () => {
    render(
      <ThemeSelector
        projectId="proj-1"
        currentValues={defaultCurrentValues}
        onSelectTheme={mockOnSelectTheme}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Save Current as Theme'));
    const input = screen.getByPlaceholderText('Theme name...');
    fireEvent.keyDown(input, { key: 'Escape' });
    // Save input should be hidden
    expect(screen.queryByPlaceholderText('Theme name...')).not.toBeInTheDocument();
  });
});
