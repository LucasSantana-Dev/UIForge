/**
 * SkillCard Component Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillCard } from '@/components/skills/SkillCard';

const makeSkill = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'skill-1',
    name: 'Component Builder',
    slug: 'component-builder',
    description: 'Builds UI components',
    icon: 'Component',
    source_type: 'official' as const,
    category: 'component' as const,
    parameter_schema: null,
    preferred_provider: null,
    complexity_boost: 0,
    requires_vision: false,
    frameworks: [],
    install_count: 0,
    is_active: true,
    created_by: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    version: null,
    author: null,
    license: null,
    tags: [],
    allowed_tools: [],
    argument_hint: null,
    invocation_mode: 'user' as const,
    raw_frontmatter: null,
    instructions: '',
    source_url: null,
    ...overrides,
  }) as any;

describe('SkillCard', () => {
  it('renders skill name and description', () => {
    render(<SkillCard skill={makeSkill()} selected={false} onToggle={jest.fn()} />);
    expect(screen.getByText('Component Builder')).toBeInTheDocument();
    expect(screen.getByText('Builds UI components')).toBeInTheDocument();
  });

  it('shows Official badge for official source_type', () => {
    render(
      <SkillCard
        skill={makeSkill({ source_type: 'official' })}
        selected={false}
        onToggle={jest.fn()}
      />
    );
    expect(screen.getByText('Official')).toBeInTheDocument();
  });

  it('does not show Official badge for non-official source_type', () => {
    render(
      <SkillCard
        skill={makeSkill({ source_type: 'community' })}
        selected={false}
        onToggle={jest.fn()}
      />
    );
    expect(screen.queryByText('Official')).not.toBeInTheDocument();
  });

  it('has aria-pressed=false when not selected', () => {
    render(<SkillCard skill={makeSkill()} selected={false} onToggle={jest.fn()} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('has aria-pressed=true when selected', () => {
    render(<SkillCard skill={makeSkill()} selected onToggle={jest.fn()} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onToggle with skillId on click', async () => {
    const onToggle = jest.fn();
    render(<SkillCard skill={makeSkill({ id: 'sk-42' })} selected={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith('sk-42');
  });

  it('is disabled and not clickable when disabled=true and not selected', async () => {
    const onToggle = jest.fn();
    render(<SkillCard skill={makeSkill()} selected={false} onToggle={onToggle} disabled />);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('is NOT disabled when disabled=true but selected (allows deselection)', () => {
    render(<SkillCard skill={makeSkill()} selected onToggle={jest.fn()} disabled />);
    const btn = screen.getByRole('button');
    expect(btn).not.toBeDisabled();
  });

  it('falls back to Puzzle icon when icon is unknown', () => {
    // Should not throw with unknown icon value
    expect(() =>
      render(
        <SkillCard
          skill={makeSkill({ icon: 'UnknownIcon' })}
          selected={false}
          onToggle={jest.fn()}
        />
      )
    ).not.toThrow();
  });

  it('falls back to Puzzle icon when icon is null', () => {
    expect(() =>
      render(<SkillCard skill={makeSkill({ icon: null })} selected={false} onToggle={jest.fn()} />)
    ).not.toThrow();
  });
});
