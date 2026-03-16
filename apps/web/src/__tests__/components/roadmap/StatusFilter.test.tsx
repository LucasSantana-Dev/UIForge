import { render, screen, fireEvent } from '@testing-library/react';
import { StatusFilter } from '@/components/roadmap/StatusFilter';

const mockCounts = {
  all: 10,
  done: 4,
  'in-progress': 3,
  planned: 3,
};

describe('StatusFilter', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the filter group with correct aria-label', () => {
    render(<StatusFilter active="all" onChange={onChange} counts={mockCounts} />);
    const group = screen.getByRole('group', { name: /filter by status/i });
    expect(group).toBeInTheDocument();
  });

  it('renders All, Done, In Progress, and Planned filter buttons', () => {
    render(<StatusFilter active="all" onChange={onChange} counts={mockCounts} />);
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /in progress/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /planned/i })).toBeInTheDocument();
  });

  it('shows counts inside buttons', () => {
    render(<StatusFilter active="all" onChange={onChange} counts={mockCounts} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    // Both in-progress and planned have count 3 — two matches expected
    expect(screen.getAllByText('3')).toHaveLength(2);
  });

  it('marks active filter with aria-pressed=true', () => {
    render(<StatusFilter active="done" onChange={onChange} counts={mockCounts} />);
    const doneBtn = screen.getByRole('button', { name: /done/i });
    expect(doneBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('marks inactive filters with aria-pressed=false', () => {
    render(<StatusFilter active="all" onChange={onChange} counts={mockCounts} />);
    const doneBtn = screen.getByRole('button', { name: /done/i });
    const inProgressBtn = screen.getByRole('button', { name: /in progress/i });
    const plannedBtn = screen.getByRole('button', { name: /planned/i });
    expect(doneBtn).toHaveAttribute('aria-pressed', 'false');
    expect(inProgressBtn).toHaveAttribute('aria-pressed', 'false');
    expect(plannedBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange with "done" when Done button is clicked', () => {
    render(<StatusFilter active="all" onChange={onChange} counts={mockCounts} />);
    fireEvent.click(screen.getByRole('button', { name: /done/i }));
    expect(onChange).toHaveBeenCalledWith('done');
  });

  it('calls onChange with "in-progress" when In Progress button is clicked', () => {
    render(<StatusFilter active="all" onChange={onChange} counts={mockCounts} />);
    fireEvent.click(screen.getByRole('button', { name: /in progress/i }));
    expect(onChange).toHaveBeenCalledWith('in-progress');
  });

  it('calls onChange with "all" when All button is clicked', () => {
    render(<StatusFilter active="done" onChange={onChange} counts={mockCounts} />);
    fireEvent.click(screen.getByRole('button', { name: /all/i }));
    expect(onChange).toHaveBeenCalledWith('all');
  });

  it('calls onChange with "planned" when Planned button is clicked', () => {
    render(<StatusFilter active="all" onChange={onChange} counts={mockCounts} />);
    fireEvent.click(screen.getByRole('button', { name: /planned/i }));
    expect(onChange).toHaveBeenCalledWith('planned');
  });
});
