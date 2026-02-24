'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSubscription } from '@/hooks/use-subscription';
import { SubscriptionStatus } from '@/components/billing/SubscriptionStatus';
import { UsageChart } from '@/components/billing/UsageChart';
import { PLANS } from '@/lib/stripe/plans';
import { ExternalLink } from 'lucide-react';

export function BillingClient() {
  const { subscription, usage, isLoading } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      // Portal creation failed
    } finally {
      setPortalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-32 rounded-lg bg-muted" />
          <div className="h-32 rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  const plan = subscription?.plan ?? 'free';
  const currentPlan = PLANS[plan as keyof typeof PLANS] ?? PLANS.free;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Billing</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your subscription and usage</p>

      <div className="mt-8 space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Current plan</h2>
              <div className="mt-2">
                <SubscriptionStatus
                  plan={plan}
                  status={subscription?.status ?? 'active'}
                  cancelAtPeriodEnd={subscription?.cancel_at_period_end}
                />
              </div>
              {subscription?.current_period_end && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {subscription.cancel_at_period_end ? 'Cancels' : 'Renews'} on{' '}
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {plan !== 'free' && (
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {portalLoading ? 'Loading...' : 'Manage'}
                </button>
              )}
              {plan === 'free' && (
                <Link
                  href="/pricing"
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Upgrade
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">Usage this month</h2>
          <div className="mt-4 space-y-4">
            <UsageChart
              label="AI Generations"
              current={usage?.generations_count ?? 0}
              limit={usage?.generations_limit ?? currentPlan.limits.generationsPerMonth}
            />
            <UsageChart
              label="Projects"
              current={usage?.projects_count ?? 0}
              limit={usage?.projects_limit ?? currentPlan.limits.maxProjects}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">Plan features</h2>
          <ul className="mt-3 space-y-1.5">
            {currentPlan.features.map((feature) => (
              <li key={feature} className="text-sm text-muted-foreground">
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
