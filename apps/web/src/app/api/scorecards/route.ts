import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'projectId required' }, { status: 400 });
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return NextResponse.json(
      { error: 'Project not found or access denied' },
      { status: 403 }
    );
  }

  const SCORECARD_COLS = 'id, project_id, overall_score, security_score, quality_score, performance_score, compliance_score, breakdowns, violations, recommendations, created_at';
  const isHistory = searchParams.get('history') === 'true';
  const rawLimit = parseInt(searchParams.get('limit') ?? '30', 10);
  const limit = Math.min(Math.max(Number.isNaN(rawLimit) ? 30 : rawLimit, 1), 100);

  if (isHistory) {
    const { data: scorecards, error } = await supabase
      .from('project_scorecards')
      .select(SCORECARD_COLS)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ scorecards: scorecards ?? [] });
  }

  const { data: scorecard, error } = await supabase
    .from('project_scorecards')
    .select(SCORECARD_COLS)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ scorecard: scorecard ?? null });
}
