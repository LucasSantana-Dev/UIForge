import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const framework = searchParams.get('framework');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const offset = (page - 1) * limit;

  const supabase = await createClient();

  let query = supabase
    .from('generations')
    .select(
      'id, prompt, component_name, generated_code, framework, component_library, style, ai_provider, model_used, generation_time_ms, quality_score, created_at',
      { count: 'exact' }
    )
    .eq('is_featured', true)
    .eq('status', 'completed');

  if (framework) {
    query = query.eq('framework', framework);
  }

  const { data, count, error } = await query
    .order('quality_score', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }

  const total = count ?? 0;
  const payload = {
    generations: data ?? [],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  } as {
    generations: typeof data;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    message?: string;
  };

  if (total === 0) {
    payload.message = 'No featured generations available yet.';
  }

  return NextResponse.json(payload);
}
