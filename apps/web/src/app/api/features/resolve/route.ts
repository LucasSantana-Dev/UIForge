import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('feature_flags')
      .select('id, name, enabled, enabled_for_users')
      .order('name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const resolved = (data ?? []).map((flag) => ({
      ...flag,
      enabled: flag.enabled || (userId && flag.enabled_for_users?.includes(userId)) || false,
    }));

    return NextResponse.json(
      { data: resolved },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to resolve feature flags' }, { status: 500 });
  }
}
