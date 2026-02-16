import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: generationId } = await params;
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, 100, 60000);

    if (!rateLimitResult.allowed) {
      const response = errorResponse('Too many requests', 429);
      setRateLimitHeaders(response, rateLimitResult, 100);
      return response;
    }

    // Verify authentication
    const session = await verifySession();
    const { user } = session;

    // Fetch generation
    const supabase = await createClient();
    const { data: generation, error } = await supabase
      .from('generations')
      .select('*')
      .eq('id', generationId)
      .single();

    if (error || !generation) {
      return errorResponse('Generation not found', 404);
    }

    // Verify ownership
    if (generation.user_id !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    return successResponse({ generation });

  } catch (error) {
    console.error('Generation GET error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: generationId } = await params;
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, 50, 60000);

    if (!rateLimitResult.allowed) {
      const response = errorResponse('Too many requests', 429);
      setRateLimitHeaders(response, rateLimitResult, 50);
      return response;
    }

    // Verify authentication
    const session = await verifySession();
    const { user } = session;

    const body = await request.json();

    // Fetch generation to verify ownership
    const supabase = await createClient();
    const { data: existingGeneration, error: fetchError } = await supabase
      .from('generations')
      .select('id, user_id, project_id')
      .eq('id', generationId)
      .single();

    if (fetchError || !existingGeneration) {
      return errorResponse('Generation not found', 404);
    }

    if (existingGeneration.user_id !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    // Update generation with whitelist
    const allowedFields = ['prompt', 'parameters', 'result', 'status'];
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    // Copy only allowed fields from body
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    const { data: generation, error } = await supabase
      .from('generations')
      .update(updates)
      .eq('id', generationId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update generation:', error);
      return errorResponse('Failed to update generation', 500);
    }

    return successResponse({ generation });

  } catch (error) {
    console.error('Generation PATCH error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: generationId } = await params;
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, 20, 60000);

    if (!rateLimitResult.allowed) {
      const response = errorResponse('Too many requests', 429);
      setRateLimitHeaders(response, rateLimitResult, 20);
      return response;
    }

    // Verify authentication
    const session = await verifySession();
    const { user } = session;

    // Fetch generation to verify ownership
    const supabase = await createClient();
    const { data: existingGeneration, error: fetchError } = await supabase
      .from('generations')
      .select('id, user_id, project_id')
      .eq('id', generationId)
      .single();

    if (fetchError || !existingGeneration) {
      return errorResponse('Generation not found', 404);
    }

    if (existingGeneration.user_id !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    // Delete generation
    const { error } = await supabase
      .from('generations')
      .delete()
      .eq('id', generationId);

    if (error) {
      console.error('Failed to delete generation:', error);
      return errorResponse('Failed to delete generation', 500);
    }

    return successResponse({ message: 'Generation deleted successfully' });

  } catch (error) {
    console.error('Generation DELETE error:', error);
    return errorResponse('Internal server error', 500);
  }
}
