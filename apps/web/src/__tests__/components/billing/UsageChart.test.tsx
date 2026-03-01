import { render, screen } from '@testing-library/react';
import { UsageChart } from '@/components/billing/UsageChart';

describe('UsageChart', () => {
  it('renders label', () => {
    render(<UsageChart label="Generations" current={10} limit={100} />);
    expect(screen.getByText('Generations')).toBeInTheDocument();
  });

  it('renders current / limit text', () => {
    render(<UsageChart label="Generations" current={10} limit={100} />);
    expect(screen.getByText('10 / 100')).toBeInTheDocument();
  });

  it('shows "Unlimited" when limit is -1', () => {
    render(<UsageChart label="Generations" current={42} limit={-1} />);
    expect(screen.getByText('42 / Unlimited')).toBeInTheDocument();
  });

  it('sets progress bar width based on percentage', () => {
    const { container } = render(<UsageChart label="Generations" current={50} limit={100} />);
    const progressBar = container.querySelector('[style]');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('caps progress bar at 100%', () => {
    const { container } = render(<UsageChart label="Generations" current={150} limit={100} />);
    const progressBar = container.querySelector('[style]');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });

  it('sets progress bar to 0% for unlimited', () => {
    const { container } = render(<UsageChart label="Generations" current={42} limit={-1} />);
    const progressBar = container.querySelector('[style]');
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('uses yellow color when near limit (>=80%)', () => {
    const { container } = render(<UsageChart label="Generations" current={80} limit={100} />);
    const progressBar = container.querySelector('[style]');
    expect(progressBar?.className).toContain('bg-yellow-400');
  });

  it('uses primary color when below 80%', () => {
    const { container } = render(<UsageChart label="Generations" current={79} limit={100} />);
    const progressBar = container.querySelector('[style]');
    expect(progressBar?.className).toContain('bg-primary');
    expect(progressBar?.className).not.toContain('bg-yellow-400');
  });

  it('uses primary color for unlimited plans', () => {
    const { container } = render(<UsageChart label="Generations" current={999} limit={-1} />);
    const progressBar = container.querySelector('[style]');
    expect(progressBar?.className).toContain('bg-primary');
  });
});
