import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectFilters from '@/components/projects/ProjectFilters';

const defaultProps = {
  searchQuery: '',
  onSearchChange: jest.fn(),
  sortBy: 'updated' as const,
  onSortChange: jest.fn(),
};

describe('ProjectFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input with current value', () => {
    render(<ProjectFilters {...defaultProps} searchQuery="test query" />);
    const input = screen.getByPlaceholderText('Search projects...');
    expect(input).toHaveValue('test query');
  });

  it('calls onSearchChange when typing in search input', () => {
    render(<ProjectFilters {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search projects...');
    fireEvent.change(input, { target: { value: 'my project' } });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('my project');
  });

  it('calls onSortChange when sort is changed to created', () => {
    render(<ProjectFilters {...defaultProps} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'created' } });
    expect(defaultProps.onSortChange).toHaveBeenCalledWith('created');
  });

  it('calls onSortChange when sort is changed to name', () => {
    render(<ProjectFilters {...defaultProps} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'name' } });
    expect(defaultProps.onSortChange).toHaveBeenCalledWith('name');
  });

  it('shows current sort value in select', () => {
    render(<ProjectFilters {...defaultProps} sortBy="name" />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('name');
  });
});
