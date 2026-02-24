'use client';

import { useState } from 'react';
import type { PlanDefinition } from '@/lib/stripe/plans';
import { Check } from 'lucide-react';

interface PricingCardProps {
  plan: PlanDefinition;
  currentPlan?: string;
  onSelect: (priceId: string) => void;
  highlighted?: boolean;
}

export function PricingCard({ plan, currentPlan, onSelect, highlighted }: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  const isCurrent = currentPlan === plan.id;
  const isEnterprise = plan.id === 'enterprise';

  const handleClick = async () => {
    if (isCurrent || isEnterprise || !plan.stripePriceId) return;
    setLoading(true);
    onSelect(plan.stripePriceId);
  };

  return (
    <div
      className={`relative rounded-lg border p-6 ${
        highlighted ? 'border-primary shadow-lg ring-1 ring-primary' : 'border-border'
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
          Most popular
        </span>
      )}

      <h3 className="text-lg font-semibold">{plan.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

      <div className="mt-4">
        {plan.priceMonthly === 0 ? (
          <span className="text-3xl font-bold">Free</span>
        ) : plan.priceMonthly === -1 ? (
          <span className="text-3xl font-bold">Custom</span>
        ) : (
          <>
            <span className="text-3xl font-bold">${plan.priceMonthly}</span>
            <span className="text-sm text-muted-foreground">/month</span>
          </>
        )}
      </div>

      <ul className="mt-6 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={handleClick}
        disabled={isCurrent || loading}
        className={`mt-6 w-full rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${
          highlighted
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'border bg-background hover:bg-muted'
        }`}
      >
        {isCurrent
          ? 'Current plan'
          : isEnterprise
            ? 'Contact sales'
            : loading
              ? 'Redirecting...'
              : `Upgrade to ${plan.name}`}
      </button>
    </div>
  );
}
