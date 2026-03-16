'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PricingCard } from '@/components/billing/PricingCard';
import { PLANS } from '@/lib/stripe/plans';
import { Code2 } from 'lucide-react';
import Link from 'next/link';

export function PricingPageClient() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);

  const handleSelectPlan = async (priceId: string) => {
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { url, error } = await res.json();
      if (error) {
        if (res.status === 401) {
          router.push('/signin');
          return;
        }
        return;
      }

      if (url) window.location.href = url;
    } catch {
      // Checkout creation failed — user can retry
    }
  };

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Code2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Siza</span>
          </Link>
          <h1 className="mt-8 text-4xl font-bold">Free for individuals, paid for scale</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free with generous limits. BYOK unlocks unlimited generations. Upgrade when you
            need team features.
          </p>

          {/* Annual / Monthly toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-background px-4 py-2">
            <span className={`text-sm ${!isAnnual ? 'font-semibold' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              role="switch"
              aria-checked={isAnnual}
              onClick={() => setIsAnnual((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isAnnual ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow transition-transform ${
                  isAnnual ? 'translate-x-6' : ''
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'font-semibold' : 'text-muted-foreground'}`}>
              Annual
              <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Save 17%
              </span>
            </span>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <PricingCard
            plan={PLANS.free}
            currentPlan={undefined}
            onSelect={handleSelectPlan}
            isAnnual={isAnnual}
          />
          <PricingCard
            plan={PLANS.pro}
            currentPlan={undefined}
            onSelect={handleSelectPlan}
            highlighted
            isAnnual={isAnnual}
          />
          <PricingCard
            plan={PLANS.team}
            currentPlan={undefined}
            onSelect={handleSelectPlan}
            isAnnual={isAnnual}
          />
          <PricingCard
            plan={PLANS.enterprise}
            currentPlan={undefined}
            onSelect={handleSelectPlan}
            isAnnual={isAnnual}
          />
        </div>
      </div>
    </div>
  );
}
