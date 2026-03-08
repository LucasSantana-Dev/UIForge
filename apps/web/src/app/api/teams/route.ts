import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/api/auth';
import { jsonResponse, errorResponse } from '@/lib/api/response';
import { UnauthorizedError } from '@/lib/api/errors';
import { getTeamsForUser, createTeam } from '@/lib/repositories/rbac.repo';
import { captureServerError } from '@/lib/sentry/server';

export async function GET() {
  try {
    const { user } = await verifySession();
    const teams = await getTeamsForUser(user.id);
    return jsonResponse({ data: teams });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, error.statusCode);
    }
    captureServerError(error, { route: '/api/teams' });
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await verifySession();
    const body = await request.json();

    const { name, slug, description } = body;
    if (!name || !slug) {
      return errorResponse('Name and slug are required', 400);
    }

    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(slug)) {
      return errorResponse('Slug must be lowercase alphanumeric with hyphens', 400);
    }

    const team = await createTeam(name, slug, user.id, description);
    return jsonResponse({ data: team }, 201);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, error.statusCode);
    }
    if (String(error).includes('duplicate key')) {
      return errorResponse('Team slug already exists', 409);
    }
    captureServerError(error, { route: '/api/teams' });
    return errorResponse('Internal server error', 500);
  }
}
