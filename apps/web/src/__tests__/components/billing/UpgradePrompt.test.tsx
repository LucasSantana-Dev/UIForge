import { render, screen } from '@testing-library/react';
import { UpgradePrompt } from '@/components/billing/UpgradePrompt';

jest.mock('next/link', () => {
  function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('UpgradePrompt', () => {
  it('shows resource name in heading', () => {
    render(<UpgradePrompt resource="Generations" />);
    expect(screen.getByText('Generations limit reached')).toBeInTheDocument();
  });

  it('shows upgrade description', () => {
    render(<UpgradePrompt resource="Projects" />);
    expect(
      screen.getByText('Upgrade to Pro for more capacity and advanced features.')
    ).toBeInTheDocument();
  });

  it('links to /billing', () => {
    render(<UpgradePrompt resource="Generations" />);
    const link = screen.getByText('View plans');
    expect(link).toHaveAttribute('href', '/billing');
  });

  it('renders with different resource names', () => {
    render(<UpgradePrompt resource="Components" />);
    expect(screen.getByText('Components limit reached')).toBeInTheDocument();
  });
});
