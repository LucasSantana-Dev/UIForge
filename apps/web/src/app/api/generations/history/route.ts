import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { successResponse, errorResponse } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = await checkRateLimit(request, 100, 60000);
    if (!rateLimitResult.allowed) {
      return errorResponse('Too many requests', 429);
    }

    const { user } = await verifySession();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const framework = searchParams.get('framework');
    const provider = searchParams.get('provider');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    let query = supabase
      .from('generations')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (framework) {
      query = query.eq('framework', framework);
    }
    if (provider) {
      query = query.eq('ai_provider', provider);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: generations, error, count } = await query;

    if (error) {
      console.error('Failed to fetch generation history:', error);
      return errorResponse('Failed to fetch history', 500);
    }

    return successResponse({
      generations: generations || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('History GET error:', error);
    return errorResponse('Internal server error', 500);
  }
}
