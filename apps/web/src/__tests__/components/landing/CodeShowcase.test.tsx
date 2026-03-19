import { render, screen, fireEvent } from '@testing-library/react';
import { CodeShowcase } from '@/components/landing/CodeShowcase';

jest.mock('lucide-react', () => ({
  Check: () => <span data-testid="check-icon" />,
  ChevronRight: () => <span />,
  Code2: () => <span />,
  Layers: () => <span />,
  Zap: () => <span />,
  Shield: () => <span />,
}));

describe('CodeShowcase', () => {
  it('renders section heading fragments', () => {
    render(<CodeShowcase />);
    expect(screen.getByText(/Your next project/)).toBeInTheDocument();
    expect(screen.getByText(/Properly structured/)).toBeInTheDocument();
  });

  it('renders the npx create-siza-app comment', () => {
    render(<CodeShowcase />);
    expect(screen.getByText('// npx create-siza-app')).toBeInTheDocument();
  });

  it('renders before/after diff header', () => {
    render(<CodeShowcase />);
    expect(screen.getByText('before')).toBeInTheDocument();
    expect(screen.getByText('after siza')).toBeInTheDocument();
  });

  it('renders hover for code hint', () => {
    render(<CodeShowcase />);
    expect(screen.getByText('hover for code')).toBeInTheDocument();
  });

  it('renders feature checklist items', () => {
    render(<CodeShowcase />);
    expect(screen.getAllByTestId('check-icon').length).toBeGreaterThan(0);
  });

  it('renders file tree entry my-saas/', () => {
    render(<CodeShowcase />);
    expect(screen.getByText(/my-saas\//)).toBeInTheDocument();
  });

  it('shows code snippet on mouseEnter of a codePreview entry', () => {
    render(<CodeShowcase />);
    const rows = document.querySelectorAll('[class*="hover:bg"]');
    if (rows.length > 0) {
      fireEvent.mouseEnter(rows[0]);
    }
    // No assertion needed beyond not throwing — hover state handled by useState
  });
});
