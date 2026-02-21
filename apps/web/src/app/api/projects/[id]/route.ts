/**
 * Individual Project API Routes
 * GET /api/projects/[id] - Get project by ID
 * PATCH /api/projects/[id] - Update project
 * DELETE /api/projects/[id] - Delete project
 */

import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  verifySession,
  successResponse,
  noContentResponse,
  errorResponse,
  apiErrorResponse,
  updateProjectSchema,
  NotFoundError,
  ForbiddenError,
  type APIError,
} from '@/lib/api';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';

// Rate limit: 120 req/min for CRUD operations
const RATE_LIMIT = 120;
const RATE_WINDOW = 60000; // 1 minute

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Rate limiting
    const rateResult = await checkRateLimit(request, RATE_LIMIT, RATE_WINDOW);
    if (!rateResult.allowed) {
      const response = errorResponse('Rate limit exceeded', 429, {
        retry_after: Math.ceil((rateResult.resetAt - Date.now()) / 1000),
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    // Authentication
    const session = await verifySession();

    const supabase = await createClient();

    // Fetch project
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();

    if (error || !data) {
      throw new NotFoundError('Project not found');
    }

    // Verify ownership (only owner can view private projects)
    if (!data.is_public && data.user_id !== session.user.id) {
      throw new ForbiddenError('You do not have access to this project');
    }

    const response = successResponse(data);
    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error);
    if ((error as APIError).statusCode) {
      const response = apiErrorResponse(error as APIError);
      return response;
    }
    return errorResponse('An unexpected error occurred', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Rate limiting
    const rateResult = await checkRateLimit(request, RATE_LIMIT, RATE_WINDOW);
    if (!rateResult.allowed) {
      const response = errorResponse('Rate limit exceeded', 429, {
        retry_after: Math.ceil((rateResult.resetAt - Date.now()) / 1000),
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    // Authentication
    const session = await verifySession();

    // Parse and validate body
    const body = await request.json();
    const validation = updateProjectSchema.safeParse(body);

    if (!validation.success) {
      const response = errorResponse('Invalid request body', 400, {
        errors: validation.error.issues,
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const supabase = await createClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new NotFoundError('Project not found');
    }

    if (existing.user_id !== session.user.id) {
      throw new ForbiddenError('You do not own this project');
    }

    // Update project
    const { data, error } = await supabase
      .from('projects')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Project update error:', error);
      const response = errorResponse('Failed to update project', 500);
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const response = successResponse(data, 'Project updated successfully');
    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    console.error('PATCH /api/projects/[id] error:', error);
    if ((error as APIError).statusCode) {
      return apiErrorResponse(error as APIError);
    }
    return errorResponse('An unexpected error occurred', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Rate limiting
    const rateResult = await checkRateLimit(request, RATE_LIMIT, RATE_WINDOW);
    if (!rateResult.allowed) {
      const response = errorResponse('Rate limit exceeded', 429, {
        retry_after: Math.ceil((rateResult.resetAt - Date.now()) / 1000),
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    // Authentication
    const session = await verifySession();

    const supabase = await createClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new NotFoundError('Project not found');
    }

    if (existing.user_id !== session.user.id) {
      throw new ForbiddenError('You do not own this project');
    }

    // Delete project (cascade will handle related records)
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      console.error('Project deletion error:', error);
      const response = errorResponse('Failed to delete project', 500);
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const response = noContentResponse();
    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error);
    if ((error as APIError).statusCode) {
      return apiErrorResponse(error as APIError);
    }
    return errorResponse('An unexpected error occurred', 500);
  }
}
