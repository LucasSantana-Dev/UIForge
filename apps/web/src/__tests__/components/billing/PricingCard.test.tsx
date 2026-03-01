import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PricingCard } from '@/components/billing/PricingCard';
import type { PlanDefinition } from '@/lib/stripe/plans';

const freePlan: PlanDefinition = {
  id: 'free',
  name: 'Free',
  description: 'For individuals',
  priceMonthly: 0,
  stripePriceId: null,
  features: ['5 generations', '1 project'],
  limits: { generationsPerMonth: 5, maxProjects: 1, maxComponentsPerProject: 10, seats: 1 },
};

const proPlan: PlanDefinition = {
  id: 'pro',
  name: 'Pro',
  description: 'For professionals',
  priceMonthly: 19,
  stripePriceId: 'price_pro_123',
  features: ['100 generations', '10 projects', 'Priority support'],
  limits: { generationsPerMonth: 100, maxProjects: 10, maxComponentsPerProject: 100, seats: 1 },
};

const teamPlan: PlanDefinition = {
  id: 'team',
  name: 'Team',
  description: 'For small teams',
  priceMonthly: 49,
  stripePriceId: 'price_team_123',
  features: ['2,500 generations', 'Unlimited projects', '5 team seats'],
  limits: { generationsPerMonth: 2500, maxProjects: -1, maxComponentsPerProject: -1, seats: 5 },
};

const enterprisePlan: PlanDefinition = {
  id: 'enterprise',
  name: 'Enterprise',
  description: 'For teams',
  priceMonthly: -1,
  stripePriceId: null,
  features: ['Unlimited generations', 'Custom integrations'],
  limits: { generationsPerMonth: -1, maxProjects: -1, maxComponentsPerProject: -1, seats: -1 },
};

describe('PricingCard', () => {
  it('renders plan name and description', () => {
    render(<PricingCard plan={proPlan} onSelect={jest.fn()} />);
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('For professionals')).toBeInTheDocument();
  });

  it('renders all features with check icons', () => {
    render(<PricingCard plan={proPlan} onSelect={jest.fn()} />);
    expect(screen.getByText('100 generations')).toBeInTheDocument();
    expect(screen.getByText('10 projects')).toBeInTheDocument();
    expect(screen.getByText('Priority support')).toBeInTheDocument();
  });

  it('shows "Free" price for free plans', () => {
    render(<PricingCard plan={freePlan} onSelect={jest.fn()} />);
    const freeTexts = screen.getAllByText('Free');
    expect(freeTexts.length).toBeGreaterThanOrEqual(2);
  });

  it('shows price with /month for paid plans', () => {
    render(<PricingCard plan={proPlan} onSelect={jest.fn()} />);
    expect(screen.getByText('$19')).toBeInTheDocument();
    expect(screen.getByText('/month')).toBeInTheDocument();
  });

  it('shows "Custom" for enterprise pricing', () => {
    render(<PricingCard plan={enterprisePlan} onSelect={jest.fn()} />);
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('shows "Current plan" when plan matches currentPlan', () => {
    render(<PricingCard plan={proPlan} currentPlan="pro" onSelect={jest.fn()} />);
    expect(screen.getByText('Current plan')).toBeInTheDocument();
  });

  it('shows "Upgrade to {name}" when not current plan', () => {
    render(<PricingCard plan={proPlan} currentPlan="free" onSelect={jest.fn()} />);
    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
  });

  it('shows "Contact sales" for enterprise plan', () => {
    render(<PricingCard plan={enterprisePlan} onSelect={jest.fn()} />);
    expect(screen.getByText('Contact sales')).toBeInTheDocument();
  });

  it('shows "Most popular" badge when highlighted', () => {
    render(<PricingCard plan={proPlan} highlighted onSelect={jest.fn()} />);
    expect(screen.getByText('Most popular')).toBeInTheDocument();
  });

  it('does not show "Most popular" when not highlighted', () => {
    render(<PricingCard plan={proPlan} onSelect={jest.fn()} />);
    expect(screen.queryByText('Most popular')).not.toBeInTheDocument();
  });

  it('calls onSelect with stripePriceId when clicked', async () => {
    const onSelect = jest.fn();
    render(<PricingCard plan={proPlan} currentPlan="free" onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Upgrade to Pro'));
    expect(onSelect).toHaveBeenCalledWith('price_pro_123');
  });

  it('does not call onSelect when plan is current', async () => {
    const onSelect = jest.fn();
    render(<PricingCard plan={proPlan} currentPlan="pro" onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Current plan'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does not call onSelect for enterprise plan', async () => {
    const onSelect = jest.fn();
    render(<PricingCard plan={enterprisePlan} onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Contact sales'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('shows price for team plan', () => {
    render(<PricingCard plan={teamPlan} onSelect={jest.fn()} />);
    expect(screen.getByText('$49')).toBeInTheDocument();
    expect(screen.getByText('/month')).toBeInTheDocument();
  });

  it('shows "Redirecting..." after clicking upgrade', async () => {
    const onSelect = jest.fn();
    render(<PricingCard plan={proPlan} currentPlan="free" onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Upgrade to Pro'));
    expect(screen.getByText('Redirecting...')).toBeInTheDocument();
  });

  it('does not call onSelect when stripePriceId is null', async () => {
    const onSelect = jest.fn();
    const planWithoutPrice = { ...proPlan, stripePriceId: null };
    render(<PricingCard plan={planWithoutPrice} currentPlan="free" onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Upgrade to Pro'));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
