import React from 'react';
import { render, screen } from '@testing-library/react';
import { QuotaGuard } from '@/components/generator/QuotaGuard';

jest.mock('@/components/billing/UpgradePrompt', () => ({
  UpgradePrompt: ({ resource }: { resource: string }) => (
    <div data-testid="upgrade-prompt">Upgrade: {resource}</div>
  ),
}));

describe('QuotaGuard', () => {
  it('renders nothing when no error and not exceeded', () => {
    const { container } = render(<QuotaGuard error={null} usage={null} isQuotaExceeded={false} />);
    expect(container.textContent).toBe('');
  });

  it('shows upgrade prompt for quota errors', () => {
    render(<QuotaGuard error="Generation quota exceeded" usage={null} isQuotaExceeded={false} />);
    expect(screen.getByTestId('upgrade-prompt')).toBeDefined();
  });

  it('shows error message for non-quota errors', () => {
    render(<QuotaGuard error="Network error" usage={null} isQuotaExceeded={false} />);
    expect(screen.getByText('Network error')).toBeDefined();
  });

  it('shows upgrade prompt when quota exceeded', () => {
    render(
      <QuotaGuard
        error={null}
        usage={{ generations_count: 100, generations_limit: 100 }}
        isQuotaExceeded={true}
      />
    );
    expect(screen.getByTestId('upgrade-prompt')).toBeDefined();
  });

  it('shows usage counter', () => {
    render(
      <QuotaGuard
        error={null}
        usage={{ generations_count: 50, generations_limit: 100 }}
        isQuotaExceeded={false}
      />
    );
    expect(screen.getByText('50 / 100 generations this month')).toBeDefined();
  });

  it('shows nearing limit warning', () => {
    render(
      <QuotaGuard
        error={null}
        usage={{ generations_count: 85, generations_limit: 100 }}
        isQuotaExceeded={false}
      />
    );
    expect(screen.getByText('Nearing limit')).toBeDefined();
  });

  it('hides usage for unlimited plans', () => {
    const { container } = render(
      <QuotaGuard
        error={null}
        usage={{ generations_count: 50, generations_limit: -1 }}
        isQuotaExceeded={false}
      />
    );
    expect(container.querySelector('.text-text-secondary')).toBeNull();
  });
});
