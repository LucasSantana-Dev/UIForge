'use client';

import { useState } from 'react';
import type { PlanDefinition } from '@/lib/stripe/plans';
import { Check, Minus } from 'lucide-react';

const FREE_FEATURES = new Set([
  '10 AI generations per month',
  '2 projects',
  '50 components per project',
  'BYOK unlimited (bring your own key)',
  'Self-hostable',
  'Community support',
]);

interface PricingCardProps {
  plan: PlanDefinition;
  currentPlan?: string;
  onSelect: (priceId: string) => void;
  highlighted?: boolean;
  isAnnual?: boolean;
}

export function PricingCard({
  plan,
  currentPlan,
  onSelect,
  highlighted,
  isAnnual = false,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  const isCurrent = currentPlan === plan.id;
  const isEnterprise = plan.id === 'enterprise';
  const isFree = plan.id === 'free';

  const displayPrice = isAnnual && plan.priceAnnual != null ? plan.priceAnnual : plan.priceMonthly;
  const periodLabel = isAnnual ? '/year' : '/month';

  const handleClick = async () => {
    if (isCurrent || isEnterprise || !plan.stripePriceId) return;
    setLoading(true);
    onSelect(plan.stripePriceId);
  };

  return (
    <div
      className={`relative flex flex-col rounded-lg border ${
        highlighted
          ? 'border-primary shadow-lg ring-1 ring-primary'
          : isFree
            ? 'border-border bg-zinc-50 dark:bg-zinc-900/50'
            : 'border-border'
      }`}
    >
      {/* Gradient header band for highlighted cards */}
      {highlighted && (
        <div className="rounded-t-lg bg-gradient-to-r from-primary/80 to-primary px-6 py-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary-foreground">
            Most popular
          </span>
        </div>
      )}

      <div className={`flex flex-1 flex-col p-6 ${highlighted ? 'pt-4' : ''}`}>
        <h3 className={`text-lg font-semibold ${isFree ? 'text-muted-foreground' : ''}`}>
          {plan.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

        <div className="mt-4">
          {plan.priceMonthly === 0 ? (
            <span className="text-3xl font-bold">Free</span>
          ) : plan.priceMonthly === -1 ? (
            <span className="text-3xl font-bold">Custom</span>
          ) : (
            <>
              <span className="text-3xl font-bold">${displayPrice}</span>
              <span className="text-sm text-muted-foreground">{periodLabel}</span>
              {isAnnual && plan.priceAnnual != null && (
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  Save ${(plan.priceMonthly * 12 - plan.priceAnnual).toFixed(0)}/yr vs monthly
                </p>
              )}
            </>
          )}
        </div>

        <ul className="mt-6 flex-1 space-y-2">
          {plan.features.map((feature) => {
            const isIncludedInFree = FREE_FEATURES.has(feature);
            return (
              <li key={feature} className="flex items-start gap-2 text-sm">
                {isFree || isIncludedInFree ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Minus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
                )}
                <span className={!isFree && !isIncludedInFree ? 'text-foreground' : ''}>
                  {feature}
                </span>
              </li>
            );
          })}
        </ul>

        <button
          onClick={handleClick}
          disabled={isCurrent || loading}
          className={`mt-6 w-full rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${
            highlighted
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : isFree
                ? 'border border-border bg-background text-muted-foreground hover:bg-muted'
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
    </div>
  );
}
