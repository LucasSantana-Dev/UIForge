import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await verifySession();
    const { id } = await params;

    const supabase = await createClient();

    const { data: generation, error: fetchError } = await supabase
      .from('generations')
      .select('id, user_id, is_featured')
      .eq('id', id)
      .single();

    if (fetchError || !generation) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 });
    }

    if (generation.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only feature your own generations' },
        { status: 403 }
      );
    }

    const { error: updateError } = await supabase
      .from('generations')
      .update({ is_featured: !generation.is_featured })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({
      is_featured: !generation.is_featured,
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
