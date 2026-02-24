import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/server';
import { getFeatureFlag } from '@/lib/features/flags';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (!getFeatureFlag('ENABLE_STRIPE_BILLING')) {
    return NextResponse.json({ error: 'Billing is not enabled' }, { status: 403 });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    const stripe = getStripe();
    const origin = new URL(request.url).origin;

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}
