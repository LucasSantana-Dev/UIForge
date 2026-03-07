import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { createdResponse, errorResponse } from '@/lib/api/response';
import { UnauthorizedError, ValidationError } from '@/lib/api/errors';
import { findGoldenPathById } from '@/lib/repositories/golden-path.repo';
import { createClient } from '@/lib/supabase/server';
import { captureServerError } from '@/lib/sentry/server';

const scaffoldSchema = z.object({
  golden_path_id: z.string().uuid(),
  project_name: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const { allowed, remaining, resetAt } = await checkRateLimit(
      request,
      10,
      60_000,
    );
    if (!allowed) {
      const response = errorResponse('Rate limit exceeded', 429);
      setRateLimitHeaders(response, { allowed, remaining, resetAt }, 10);
      return response;
    }

    const { user } = await verifySession();

    let body;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError('Invalid JSON in request body');
    }

    const parseResult = scaffoldSchema.safeParse(body);
    if (!parseResult.success) {
      throw new ValidationError(
        'Invalid scaffold request',
        parseResult.error.flatten(),
      );
    }

    const { golden_path_id, project_name } = parseResult.data;

    const goldenPath = await findGoldenPathById(golden_path_id);
    if (!goldenPath) {
      return errorResponse('Golden path not found', 404);
    }

    const supabase = await createClient();

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: project_name,
        description: `Scaffolded from ${goldenPath.display_name}`,
        framework: goldenPath.framework,
        user_id: user.id,
      })
      .select()
      .single();

    if (projectError) {
      captureServerError(projectError, {
        route: '/api/golden-paths/scaffold',
      });
      return errorResponse('Failed to create project', 500);
    }

    const { error: catalogError } = await supabase
      .from('catalog_entries')
      .insert({
        name: project_name.toLowerCase().replace(/\s+/g, '-'),
        display_name: project_name,
        type: goldenPath.catalog_type,
        lifecycle: goldenPath.catalog_lifecycle,
        owner_id: user.id,
        project_id: project.id,
        tags: goldenPath.tags,
      });

    if (catalogError) {
      captureServerError(catalogError, {
        route: '/api/golden-paths/scaffold',
        extra: { step: 'catalog_registration' },
      });
    }

    await supabase
      .from('golden_path_templates')
      .update({ usage_count: goldenPath.usage_count + 1 })
      .eq('id', golden_path_id);

    const response = createdResponse({
      data: {
        project,
        catalog_registered: !catalogError,
        golden_path: goldenPath.display_name,
      },
    });
    setRateLimitHeaders(response, { allowed, remaining, resetAt }, 10);
    return response;
  } catch (error) {
    if (
      error instanceof UnauthorizedError ||
      error instanceof ValidationError
    ) {
      return errorResponse(error.message, error.statusCode);
    }
    captureServerError(error, { route: '/api/golden-paths/scaffold' });
    return errorResponse('Internal server error', 500);
  }
}
