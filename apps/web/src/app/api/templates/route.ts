import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { successResponse, createdResponse, errorResponse } from '@/lib/api/response';
import { UnauthorizedError, ValidationError } from '@/lib/api/errors';
import { templateQuerySchema, createTemplateSchema } from '@/lib/api/validation/templates';

export async function GET(request: NextRequest) {
  try {
    const { allowed, remaining, resetAt } = await checkRateLimit(request, 120, 60_000);
    if (!allowed) {
      const response = errorResponse('Rate limit exceeded', 429);
      setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
      return response;
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validated = templateQuerySchema.parse(queryParams);

    const supabase = await createClient();
    let query = supabase.from('templates').select('*');

    if (validated.category) {
      query = query.eq('category', validated.category);
    }
    if (validated.framework) {
      query = query.eq('framework', validated.framework);
    }
    if (validated.search) {
      query = query.or(`name.ilike.%${validated.search}%,description.ilike.%${validated.search}%`);
    }

    const ascending = validated.sort === 'name';
    query = query
      .order(validated.sort, { ascending })
      .range(validated.offset, validated.offset + validated.limit - 1);

    const { data: templates, error: dbError } = await query;

    if (dbError) {
      console.error('Failed to fetch templates:', dbError);
      return errorResponse('Failed to fetch templates', 500);
    }

    const response = successResponse({ templates: templates || [] });
    setRateLimitHeaders(response, { allowed, remaining, resetAt }, 120);
    return response;
  } catch (error) {
    if (error instanceof ValidationError) {
      return errorResponse(error.message, error.statusCode);
    }
    console.error('GET /api/templates error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { allowed, remaining, resetAt } = await checkRateLimit(request, 30, 60_000);
    if (!allowed) {
      const response = errorResponse('Rate limit exceeded', 429);
      setRateLimitHeaders(response, { allowed, remaining, resetAt }, 30);
      return response;
    }

    const { user } = await verifySession();

    let body;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError('Invalid JSON in request body');
    }

    const parseResult = createTemplateSchema.safeParse(body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid template data', parseResult.error.flatten());
    }

    const validated = parseResult.data;

    const supabase = await createClient();
    const { data: template, error: dbError } = await supabase
      .from('templates')
      .insert({
        name: validated.name,
        description: validated.description,
        category: validated.category,
        framework: validated.framework,
        code: validated.code,
        is_official: false,
        created_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to create template:', dbError);
      return errorResponse('Failed to create template', 500);
    }

    const response = createdResponse({ template });
    setRateLimitHeaders(response, { allowed, remaining, resetAt }, 30);
    return response;
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ValidationError) {
      return errorResponse(error.message, error.statusCode);
    }
    console.error('POST /api/templates error:', error);
    return errorResponse('Internal server error', 500);
  }
}
