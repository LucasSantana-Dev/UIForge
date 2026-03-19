import { render, screen } from '@testing-library/react';
import { AuthCardShell, AuthSplitShell } from '@/components/migration/migration-primitives';

describe('AuthCardShell', () => {
  it('renders children', () => {
    render(
      <AuthCardShell>
        <div>Sign in form</div>
      </AuthCardShell>
    );
    expect(screen.getByText('Sign in form')).toBeInTheDocument();
  });

  it('renders main element with id main-content', () => {
    const { container } = render(
      <AuthCardShell>
        <span />
      </AuthCardShell>
    );
    const main = container.querySelector('main');
    expect(main).toHaveAttribute('id', 'main-content');
  });

  it('applies custom className', () => {
    const { container } = render(
      <AuthCardShell className="custom-cls">
        <span />
      </AuthCardShell>
    );
    const main = container.querySelector('main');
    expect(main?.className).toContain('custom-cls');
  });
});

describe('AuthSplitShell', () => {
  it('renders children in the right panel', () => {
    render(
      <AuthSplitShell>
        <div>Auth form content</div>
      </AuthSplitShell>
    );
    expect(screen.getByText('Auth form content')).toBeInTheDocument();
  });

  it('renders the Siza brand in the left panel', () => {
    render(
      <AuthSplitShell>
        <span />
      </AuthSplitShell>
    );
    expect(screen.getByText('Siza')).toBeInTheDocument();
  });

  it('renders feature bullets', () => {
    render(
      <AuthSplitShell>
        <span />
      </AuthSplitShell>
    );
    expect(screen.getByText('AI-generated UI in seconds')).toBeInTheDocument();
    expect(screen.getByText('Framework-aware output')).toBeInTheDocument();
    expect(screen.getByText('Live preview + copy')).toBeInTheDocument();
    expect(screen.getByText('Privacy-first')).toBeInTheDocument();
  });

  it('renders trust signals', () => {
    render(
      <AuthSplitShell>
        <span />
      </AuthSplitShell>
    );
    expect(screen.getByText('1,200+ developers')).toBeInTheDocument();
    expect(screen.getByText('40k+ components generated')).toBeInTheDocument();
    expect(screen.getByText('SOC 2 in progress')).toBeInTheDocument();
  });

  it('renders main element with id main-content', () => {
    const { container } = render(
      <AuthSplitShell>
        <span />
      </AuthSplitShell>
    );
    expect(container.querySelector('#main-content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <AuthSplitShell className="custom-class">
        <span />
      </AuthSplitShell>
    );
    const main = container.querySelector('main');
    expect(main?.className).toContain('custom-class');
  });
});
