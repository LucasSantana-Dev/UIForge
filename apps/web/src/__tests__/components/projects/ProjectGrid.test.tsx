/**
 * ProjectGrid Component Tests
 */

import { render, screen } from '@testing-library/react';
import ProjectGrid from '@/components/projects/ProjectGrid';

jest.mock('@/components/projects/ProjectCard', () => ({
  __esModule: true,
  default: ({ project, compact }: { project: { id: string; name: string }; compact?: boolean }) => (
    <div data-testid={`project-card-${project.id}`} data-compact={String(compact ?? false)}>
      {project.name}
    </div>
  ),
}));

const makeProject = (id: string, name: string) => ({
  id,
  name,
  framework: 'react',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  user_id: 'user-1',
  description: null,
  thumbnail_url: null,
  component_library: null,
  is_public: null,
  is_template: null,
});

describe('ProjectGrid', () => {
  const projects = [
    makeProject('proj-1', 'Alpha'),
    makeProject('proj-2', 'Beta'),
    makeProject('proj-3', 'Gamma'),
  ];

  it('renders a card for each project', () => {
    render(<ProjectGrid projects={projects as any} viewMode="grid" />);
    expect(screen.getByTestId('project-card-proj-1')).toBeInTheDocument();
    expect(screen.getByTestId('project-card-proj-2')).toBeInTheDocument();
    expect(screen.getByTestId('project-card-proj-3')).toBeInTheDocument();
  });

  it('passes compact=false in grid mode', () => {
    render(<ProjectGrid projects={projects as any} viewMode="grid" />);
    const card = screen.getByTestId('project-card-proj-1');
    expect(card).toHaveAttribute('data-compact', 'false');
  });

  it('passes compact=true in list mode', () => {
    render(<ProjectGrid projects={projects as any} viewMode="list" />);
    const card = screen.getByTestId('project-card-proj-1');
    expect(card).toHaveAttribute('data-compact', 'true');
  });

  it('renders nothing when projects array is empty', () => {
    const { container } = render(<ProjectGrid projects={[]} viewMode="grid" />);
    expect(container.querySelectorAll('[data-testid^="project-card-"]')).toHaveLength(0);
  });
});
