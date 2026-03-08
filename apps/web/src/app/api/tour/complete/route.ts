import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const { user } = await verifySession();
    const supabase = await createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ tour_completed_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to save tour completion' }, { status: 500 });
    }

    return NextResponse.json({ completed: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
