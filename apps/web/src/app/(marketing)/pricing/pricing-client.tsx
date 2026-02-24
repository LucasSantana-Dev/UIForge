'use client';

import { useRouter } from 'next/navigation';
import { PricingCard } from '@/components/billing/PricingCard';
import { PLANS } from '@/lib/stripe/plans';
import { useSubscription } from '@/hooks/use-subscription';
import { Code2 } from 'lucide-react';
import Link from 'next/link';

export function PricingPageClient() {
  const router = useRouter();
  const { subscription } = useSubscription();

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
          <h1 className="mt-8 text-4xl font-bold">Simple, transparent pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <PricingCard
            plan={PLANS.free}
            currentPlan={subscription?.plan}
            onSelect={handleSelectPlan}
          />
          <PricingCard
            plan={PLANS.pro}
            currentPlan={subscription?.plan}
            onSelect={handleSelectPlan}
            highlighted
          />
          <PricingCard
            plan={PLANS.enterprise}
            currentPlan={subscription?.plan}
            onSelect={handleSelectPlan}
          />
        </div>
      </div>
    </div>
  );
}
