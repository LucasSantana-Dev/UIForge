/**
 * SkillBadge Component Tests
 */

import { render, screen } from '@testing-library/react';
import { SkillBadge } from '@/components/skills/SkillBadge';

describe('SkillBadge', () => {
  it('renders nothing when count is 0', () => {
    const { container } = render(<SkillBadge count={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders badge with count when count > 0', () => {
    render(<SkillBadge count={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders badge with count=1', () => {
    render(<SkillBadge count={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders badge with large count', () => {
    render(<SkillBadge count={99} />);
    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('applies rounded-full styling', () => {
    render(<SkillBadge count={2} />);
    const badge = screen.getByText('2');
    expect(badge).toHaveClass('rounded-full');
  });
});
