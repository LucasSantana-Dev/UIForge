import React from 'react';
import { render, screen } from '@testing-library/react';
import PRStatus from '@/components/dashboard/PRStatus';

const mockPRs = [
  {
    number: 1,
    title: 'Add feature X',
    htmlUrl: 'https://github.com/org/repo/pull/1',
    state: 'open' as const,
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    number: 2,
    title: 'Fix bug Y',
    htmlUrl: 'https://github.com/org/repo/pull/2',
    state: 'merged' as const,
    createdAt: '2026-03-02T00:00:00Z',
  },
  {
    number: 3,
    title: 'Remove old code',
    htmlUrl: 'https://github.com/org/repo/pull/3',
    state: 'closed' as const,
    createdAt: '2026-03-03T00:00:00Z',
  },
];

describe('PRStatus', () => {
  it('renders nothing when prs is empty', () => {
    const { container } = render(<PRStatus prs={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Recent PRs heading when prs exist', () => {
    render(<PRStatus prs={mockPRs} />);
    expect(screen.getByText('Recent PRs')).toBeInTheDocument();
  });

  it('renders all PR titles', () => {
    render(<PRStatus prs={mockPRs} />);
    expect(screen.getByText(/Add feature X/)).toBeInTheDocument();
    expect(screen.getByText(/Fix bug Y/)).toBeInTheDocument();
    expect(screen.getByText(/Remove old code/)).toBeInTheDocument();
  });

  it('renders links to PR htmlUrls', () => {
    render(<PRStatus prs={mockPRs} />);
    const links = screen.getAllByRole('link');
    expect(links.some((l) => l.getAttribute('href') === mockPRs[0].htmlUrl)).toBe(true);
  });

  it('shows open state badge', () => {
    render(<PRStatus prs={[mockPRs[0]]} />);
    expect(screen.getByText('open')).toBeInTheDocument();
  });

  it('shows merged state badge', () => {
    render(<PRStatus prs={[mockPRs[1]]} />);
    expect(screen.getByText('merged')).toBeInTheDocument();
  });

  it('shows closed state badge', () => {
    render(<PRStatus prs={[mockPRs[2]]} />);
    expect(screen.getByText('closed')).toBeInTheDocument();
  });
});
