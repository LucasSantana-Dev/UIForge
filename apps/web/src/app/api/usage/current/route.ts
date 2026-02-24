import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('billing_period_start', periodStart)
      .single();

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan, status, current_period_end, cancel_at_period_end')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      usage: usage ?? {
        generations_count: 0,
        tokens_used: 0,
        projects_count: 0,
        generations_limit: 10,
        projects_limit: 2,
      },
      subscription: sub ?? {
        plan: 'free',
        status: 'active',
        current_period_end: null,
        cancel_at_period_end: false,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 });
  }
}
