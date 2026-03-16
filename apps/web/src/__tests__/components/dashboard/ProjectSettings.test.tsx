import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectSettings from '@/components/dashboard/ProjectSettings';

jest.mock('@/components/dashboard/RepoSelector', () => {
  const MockRepoSelector = ({
    linkedRepo,
    onLink,
    onUnlink,
  }: {
    projectId: string;
    linkedRepo: { fullName: string; id: string } | null;
    onLink: (id: string) => void;
    onUnlink: () => void;
  }) => (
    <div data-testid="repo-selector">
      {linkedRepo ? (
        <>
          <span>Linked: {linkedRepo.fullName}</span>
          <button onClick={onUnlink}>Unlink</button>
        </>
      ) : (
        <button onClick={() => onLink('repo-1')}>Link Repo</button>
      )}
    </div>
  );
  MockRepoSelector.displayName = 'RepoSelector';
  return MockRepoSelector;
});

jest.mock('@/components/dashboard/PRStatus', () => {
  const MockPRStatus = ({ prs }: { prs: Array<{ number: number }> }) => (
    <div data-testid="pr-status">PRs: {prs.length}</div>
  );
  MockPRStatus.displayName = 'PRStatus';
  return MockPRStatus;
});

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    asChild,
    variant: _variant,
    size: _size,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    variant?: string;
    size?: string;
  }) => {
    if (asChild) return <div>{children}</div>;
    return <button>{children}</button>;
  },
}));

jest.mock('lucide-react', () => ({
  Github: () => <svg data-testid="github-icon" />,
  ExternalLink: () => <svg data-testid="external-link-icon" />,
}));

const mockPRs = [
  {
    number: 1,
    title: 'PR title',
    htmlUrl: 'https://github.com/org/repo/pull/1',
    state: 'open' as const,
    createdAt: '2026-01-01',
  },
];

describe('ProjectSettings', () => {
  it('renders GitHub Repository heading', () => {
    render(<ProjectSettings projectId="proj-1" />);
    expect(screen.getByText('GitHub Repository')).toBeInTheDocument();
  });

  it('renders RepoSelector', () => {
    render(<ProjectSettings projectId="proj-1" />);
    expect(screen.getByTestId('repo-selector')).toBeInTheDocument();
  });

  it('shows View on GitHub link when repo is linked', () => {
    render(
      <ProjectSettings
        projectId="proj-1"
        initialLinkedRepo={{ fullName: 'myorg/myrepo', id: 'repo-1' }}
      />
    );
    expect(screen.getByText('View on GitHub')).toBeInTheDocument();
  });

  it('does not show View on GitHub when no repo linked', () => {
    render(<ProjectSettings projectId="proj-1" />);
    expect(screen.queryByText('View on GitHub')).not.toBeInTheDocument();
  });

  it('shows PRStatus when repo is linked and initialPRs exist', () => {
    render(
      <ProjectSettings
        projectId="proj-1"
        initialLinkedRepo={{ fullName: 'myorg/myrepo', id: 'repo-1' }}
        initialPRs={mockPRs}
      />
    );
    expect(screen.getByTestId('pr-status')).toBeInTheDocument();
  });

  it('does not show PRStatus when no repo is linked', () => {
    render(<ProjectSettings projectId="proj-1" initialPRs={mockPRs} />);
    expect(screen.queryByTestId('pr-status')).not.toBeInTheDocument();
  });
});
