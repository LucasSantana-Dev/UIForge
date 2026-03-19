/**
 * GenerationFilters Component Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerationFilters } from '@/components/history/GenerationFilters';

const defaultFilters = { framework: '', provider: '', status: '' };

describe('GenerationFilters', () => {
  it('renders three select dropdowns', () => {
    render(<GenerationFilters filters={defaultFilters} onChange={jest.fn()} />);
    expect(screen.getAllByRole('combobox')).toHaveLength(3);
  });

  it('renders framework options', () => {
    render(<GenerationFilters filters={defaultFilters} onChange={jest.fn()} />);
    expect(screen.getByText('All Frameworks')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();
    expect(screen.getByText('Angular')).toBeInTheDocument();
    expect(screen.getByText('Svelte')).toBeInTheDocument();
  });

  it('renders provider options', () => {
    render(<GenerationFilters filters={defaultFilters} onChange={jest.fn()} />);
    expect(screen.getByText('All Providers')).toBeInTheDocument();
    expect(screen.getByText('Google Gemini')).toBeInTheDocument();
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
  });

  it('renders status options', () => {
    render(<GenerationFilters filters={defaultFilters} onChange={jest.fn()} />);
    expect(screen.getByText('All Statuses')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('does not show Clear filters button when all filters are empty', () => {
    render(<GenerationFilters filters={defaultFilters} onChange={jest.fn()} />);
    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });

  it('shows Clear filters button when any filter is active', () => {
    render(
      <GenerationFilters filters={{ ...defaultFilters, framework: 'react' }} onChange={jest.fn()} />
    );
    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('calls onChange with cleared filters when Clear filters clicked', async () => {
    const onChange = jest.fn();
    render(
      <GenerationFilters
        filters={{ framework: 'react', provider: 'google', status: 'completed' }}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByText('Clear filters'));
    expect(onChange).toHaveBeenCalledWith({ framework: '', provider: '', status: '' });
  });

  it('calls onChange with updated framework when framework select changes', async () => {
    const onChange = jest.fn();
    render(<GenerationFilters filters={defaultFilters} onChange={onChange} />);
    const [frameworkSelect] = screen.getAllByRole('combobox');
    await userEvent.selectOptions(frameworkSelect, 'vue');
    expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, framework: 'vue' });
  });

  it('calls onChange with updated provider when provider select changes', async () => {
    const onChange = jest.fn();
    render(<GenerationFilters filters={defaultFilters} onChange={onChange} />);
    const [, providerSelect] = screen.getAllByRole('combobox');
    await userEvent.selectOptions(providerSelect, 'openai');
    expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, provider: 'openai' });
  });

  it('calls onChange with updated status when status select changes', async () => {
    const onChange = jest.fn();
    render(<GenerationFilters filters={defaultFilters} onChange={onChange} />);
    const [, , statusSelect] = screen.getAllByRole('combobox');
    await userEvent.selectOptions(statusSelect, 'failed');
    expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, status: 'failed' });
  });
});
