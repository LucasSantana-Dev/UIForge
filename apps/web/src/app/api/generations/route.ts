import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, 100, 60000);
    const response = new NextResponse();
    setRateLimitHeaders(response, rateLimitResult, 100);

    if (!rateLimitResult.allowed) {
      return errorResponse('Too many requests', 429);
    }

    // Verify authentication
    const session = await verifySession();
    const { user } = session;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return errorResponse('Project ID is required', 400);
    }

    // Verify project ownership
    const supabase = await createClient();
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return errorResponse('Project not found', 404);
    }

    if (project.user_id !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    // Fetch generations
    const { data: generations, error } = await supabase
      .from('generations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch generations:', error);
      return errorResponse('Failed to fetch generations', 500);
    }

    return successResponse({ generations });

  } catch (error) {
    console.error('Generations GET error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, 20, 60000);
    const response = new NextResponse();
    setRateLimitHeaders(response, rateLimitResult, 20);

    if (!rateLimitResult.allowed) {
      return errorResponse('Too many requests', 429);
    }

    // Verify authentication
    const session = await verifySession();
    const { user } = session;

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['project_id', 'prompt', 'component_name', 'generated_code', 'framework'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return errorResponse(`${field} is required`, 400);
      }
    }

    // Verify project ownership
    const supabase = await createClient();
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', body.project_id.toString())
      .single();

    if (projectError || !project) {
      return errorResponse('Project not found', 404);
    }

    if (project.user_id !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    // Create generation record
    const { data: generation, error } = await supabase
      .from('generations')
      .insert({
        project_id: body.project_id.toString(),
        user_id: user.id,
        prompt: body.prompt,
        component_name: body.component_name,
        generated_code: body.generated_code,
        framework: body.framework,
        component_library: body.component_library || null,
        style: body.style || null,
        typescript: body.typescript || false,
        status: 'completed',
        tokens_used: body.tokens_used || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create generation:', error);
      return errorResponse('Failed to create generation', 500);
    }

    return successResponse({
      generation: {
        ...generation,
        project_id: generation.project_id?.toString() || '',
        tokens_used: generation.tokens_used || null,
      }
    }, 201);

  } catch (error) {
    console.error('Generations POST error:', error);
    return errorResponse('Internal server error', 500);
  }
}
