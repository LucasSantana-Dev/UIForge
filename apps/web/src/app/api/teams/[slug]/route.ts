import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/api/auth';
import { jsonResponse, errorResponse } from '@/lib/api/response';
import { UnauthorizedError } from '@/lib/api/errors';
import {
  getTeamBySlug,
  addTeamMember,
  updateMemberRole,
  removeTeamMember,
  getUserRoleInTeam,
} from '@/lib/repositories/rbac.repo';
import { captureServerError } from '@/lib/sentry/server';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { user } = await verifySession();
    const { slug } = await context.params;

    const team = await getTeamBySlug(slug);
    if (!team) {
      return errorResponse('Team not found', 404);
    }

    const role = await getUserRoleInTeam(team.id, user.id);

    return jsonResponse({ data: team, userRole: role });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, error.statusCode);
    }
    captureServerError(error, { route: '/api/teams/[slug]' });
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { user } = await verifySession();
    const { slug } = await context.params;

    const team = await getTeamBySlug(slug);
    if (!team) {
      return errorResponse('Team not found', 404);
    }

    const callerRole = await getUserRoleInTeam(team.id, user.id);
    if (!callerRole || !['admin', 'owner'].includes(callerRole)) {
      return errorResponse('Insufficient permissions', 403);
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return errorResponse('userId and role are required', 400);
    }

    const validRoles = ['viewer', 'editor', 'admin'];
    if (!validRoles.includes(role)) {
      return errorResponse('Invalid role', 400);
    }

    await addTeamMember(team.id, userId, role, user.id);
    return jsonResponse({ added: true }, 201);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, error.statusCode);
    }
    if (String(error).includes('duplicate key')) {
      return errorResponse('User already in team', 409);
    }
    captureServerError(error, { route: '/api/teams/[slug]' });
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { user } = await verifySession();
    const { slug } = await context.params;

    const team = await getTeamBySlug(slug);
    if (!team) {
      return errorResponse('Team not found', 404);
    }

    const callerRole = await getUserRoleInTeam(team.id, user.id);
    if (!callerRole || !['admin', 'owner'].includes(callerRole)) {
      return errorResponse('Insufficient permissions', 403);
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return errorResponse('userId and role are required', 400);
    }

    if (role === 'owner') {
      return errorResponse('Cannot assign owner role', 400);
    }

    await updateMemberRole(team.id, userId, role);
    return jsonResponse({ updated: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, error.statusCode);
    }
    captureServerError(error, { route: '/api/teams/[slug]' });
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { user } = await verifySession();
    const { slug } = await context.params;

    const team = await getTeamBySlug(slug);
    if (!team) {
      return errorResponse('Team not found', 404);
    }

    const callerRole = await getUserRoleInTeam(team.id, user.id);
    if (!callerRole || !['admin', 'owner'].includes(callerRole)) {
      return errorResponse('Insufficient permissions', 403);
    }

    const memberId = request.nextUrl.searchParams.get('userId');
    if (!memberId) {
      return errorResponse('userId query parameter required', 400);
    }

    if (memberId === team.owner_id) {
      return errorResponse('Cannot remove team owner', 400);
    }

    await removeTeamMember(team.id, memberId);
    return jsonResponse({ removed: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, error.statusCode);
    }
    captureServerError(error, { route: '/api/teams/[slug]' });
    return errorResponse('Internal server error', 500);
  }
}
