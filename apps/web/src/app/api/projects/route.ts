import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  verifySession,
  successResponse,
  createdResponse,
  errorResponse,
  apiErrorResponse,
  createProjectSchema,
  projectQuerySchema,
  type APIError,
} from '@/lib/api';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { checkProjectQuota } from '@/lib/usage/limits';
import { incrementProjectCount } from '@/lib/usage/tracker';
import { listProjects, type ProjectListQuery } from '@/lib/services/project.service';

const RATE_LIMIT = 120;
const RATE_WINDOW = 60000;

export async function GET(request: NextRequest) {
  try {
    const rateResult = await checkRateLimit(request, RATE_LIMIT, RATE_WINDOW);
    if (!rateResult.allowed) {
      const response = errorResponse('Rate limit exceeded', 429, {
        retry_after: Math.ceil((rateResult.resetAt - Date.now()) / 1000),
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const session = await verifySession();
    const { searchParams } = new URL(request.url);
    const query = projectQuerySchema.parse(Object.fromEntries(searchParams.entries()));

    const result = await listProjects(session.user.id, query as ProjectListQuery);

    const response = successResponse({
      projects: result.data,
      pagination: result.pagination,
    });
    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    if ((error as APIError).statusCode) {
      return apiErrorResponse(error as APIError);
    }
    return errorResponse('An unexpected error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateResult = await checkRateLimit(request, RATE_LIMIT, RATE_WINDOW);
    if (!rateResult.allowed) {
      const response = errorResponse('Rate limit exceeded', 429, {
        retry_after: Math.ceil((rateResult.resetAt - Date.now()) / 1000),
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const session = await verifySession();

    const quota = await checkProjectQuota(session.user.id);
    if (!quota.allowed) {
      const response = errorResponse('Project quota exceeded', 429, {
        quota: { current: quota.current, limit: quota.limit, remaining: quota.remaining },
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const body = await request.json();
    const validation = createProjectSchema.safeParse(body);
    if (!validation.success) {
      const response = errorResponse('Invalid request body', 400, {
        errors: validation.error.issues,
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...validation.data, user_id: session.user.id })
      .select()
      .single();

    if (error) {
      const response = errorResponse('Failed to create project', 500);
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    incrementProjectCount(session.user.id).catch(() => {});

    const response = createdResponse(data, 'Project created successfully');
    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    if ((error as APIError).statusCode) {
      return apiErrorResponse(error as APIError);
    }
    return errorResponse('An unexpected error occurred', 500);
  }
}
