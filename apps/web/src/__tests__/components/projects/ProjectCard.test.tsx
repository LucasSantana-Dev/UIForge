import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectCard from '@/components/projects/ProjectCard';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 hours ago',
}));

jest.mock('@/components/projects/ProjectActions', () => ({
  __esModule: true,
  default: ({ projectId }: { projectId: string }) => (
    <div data-testid="project-actions" data-project-id={projectId} />
  ),
}));

const baseProject = {
  id: 'proj-1',
  name: 'My Project',
  framework: 'react' as const,
  description: 'A test project',
  thumbnail_url: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
  user_id: 'user-1',
  component_library: 'shadcn',
  is_public: false,
  is_template: false,
};

describe('ProjectCard', () => {
  it('renders the project name', () => {
    render(<ProjectCard project={baseProject as any} />);
    expect(screen.getByText('My Project')).toBeInTheDocument();
  });

  it('links to the project detail page', () => {
    render(<ProjectCard project={baseProject as any} />);
    // Two links exist (thumbnail + name/description area)
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute('href', '/projects/proj-1');
  });

  it('renders first letter fallback when no thumbnail_url', () => {
    render(<ProjectCard project={baseProject as any} />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('renders thumbnail img when thumbnail_url is provided', () => {
    const project = { ...baseProject, thumbnail_url: 'https://example.com/thumb.png' };
    render(<ProjectCard project={project as any} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/thumb.png');
  });

  it('shows the framework badge', () => {
    render(<ProjectCard project={baseProject as any} />);
    // framework appears in both badge and Framework section
    const frameworkTexts = screen.getAllByText('react');
    expect(frameworkTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('shows the description', () => {
    render(<ProjectCard project={baseProject as any} />);
    expect(screen.getByText('A test project')).toBeInTheDocument();
  });

  it('shows the relative updated_at time', () => {
    render(<ProjectCard project={baseProject as any} />);
    expect(screen.getByText(/2 hours ago/)).toBeInTheDocument();
  });

  it('renders ProjectActions with correct projectId', () => {
    render(<ProjectCard project={baseProject as any} />);
    const actions = screen.getByTestId('project-actions');
    expect(actions).toHaveAttribute('data-project-id', 'proj-1');
  });
});
