import { render, screen } from '@testing-library/react';
import { SubscriptionStatus } from '@/components/billing/SubscriptionStatus';

describe('SubscriptionStatus', () => {
  it('capitalizes plan name', () => {
    render(<SubscriptionStatus plan="pro" status="active" />);
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('capitalizes multi-word plan name first letter', () => {
    render(<SubscriptionStatus plan="free" status="active" />);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('shows status text', () => {
    render(<SubscriptionStatus plan="pro" status="active" />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('uses green styling for active status', () => {
    render(<SubscriptionStatus plan="pro" status="active" />);
    const badge = screen.getByText('active');
    expect(badge.className).toContain('text-green-400');
  });

  it('uses yellow styling for past_due status', () => {
    render(<SubscriptionStatus plan="pro" status="past_due" />);
    const badge = screen.getByText('past_due');
    expect(badge.className).toContain('text-yellow-400');
  });

  it('uses red styling for canceled status', () => {
    render(<SubscriptionStatus plan="pro" status="canceled" />);
    const badge = screen.getByText('canceled');
    expect(badge.className).toContain('text-red-400');
  });

  it('shows "Canceling" when cancelAtPeriodEnd is true', () => {
    render(<SubscriptionStatus plan="pro" status="active" cancelAtPeriodEnd />);
    expect(screen.getByText('Canceling')).toBeInTheDocument();
    expect(screen.queryByText('active')).not.toBeInTheDocument();
  });

  it('shows status text when cancelAtPeriodEnd is false', () => {
    render(<SubscriptionStatus plan="pro" status="active" cancelAtPeriodEnd={false} />);
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.queryByText('Canceling')).not.toBeInTheDocument();
  });
});
