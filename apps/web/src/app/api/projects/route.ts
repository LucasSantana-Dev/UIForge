/**
 * Projects API Routes
 * GET /api/projects - List projects
 * POST /api/projects - Create project
 */

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

// Rate limit: 120 req/min for CRUD operations
const RATE_LIMIT = 120;
const RATE_WINDOW = 60000; // 1 minute

export async function GET(request: NextRequest) {
  try {
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const query = projectQuerySchema.parse(Object.fromEntries(searchParams.entries()));

    const supabase = await createClient();

    // Build query
    let dbQuery = supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id);

    // Apply filters
    if (query.search) {
      dbQuery = dbQuery.or(`name.ilike.%${query.search}%,description.ilike.%${query.search}%`);
    }

    if (query.framework) {
      dbQuery = dbQuery.eq('framework', query.framework);
    }

    if (query.is_public !== undefined) {
      dbQuery = dbQuery.eq('is_public', query.is_public);
    }

    // Apply sorting
    if (query.sort) {
      dbQuery = dbQuery.order(query.sort, {
        ascending: query.order === 'asc',
      });
    }

    // Apply pagination
    const from = (query.page - 1) * query.limit;
    const to = from + query.limit - 1;
    dbQuery = dbQuery.range(from, to);

    const { data, error, count } = await dbQuery;

    if (error) {
      console.error('Projects fetch error:', error);
      const response = errorResponse('Failed to fetch projects', 500);
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const response = successResponse({
      projects: data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / query.limit),
      },
    });

    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    console.error('GET /api/projects error:', error);
    if ((error as APIError).statusCode) {
      return apiErrorResponse(error as APIError);
    }
    return errorResponse('An unexpected error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Usage quota check
    const quota = await checkProjectQuota(session.user.id);
    if (!quota.allowed) {
      const response = errorResponse('Project quota exceeded', 429, {
        quota: {
          current: quota.current,
          limit: quota.limit,
          remaining: quota.remaining,
        },
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    // Parse and validate body
    const body = await request.json();
    const validation = createProjectSchema.safeParse(body);

    if (!validation.success) {
      const response = errorResponse('Invalid request body', 400, {
        errors: validation.error.issues,
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const supabase = await createClient();

    // Create project
    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...validation.data,
        user_id: session.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Project creation error:', error);
      const response = errorResponse('Failed to create project', 500);
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    incrementProjectCount(session.user.id).catch(() => {});

    const response = createdResponse(data, 'Project created successfully');
    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    console.error('POST /api/projects error:', error);
    if ((error as APIError).statusCode) {
      return apiErrorResponse(error as APIError);
    }
    return errorResponse('An unexpected error occurred', 500);
  }
}
