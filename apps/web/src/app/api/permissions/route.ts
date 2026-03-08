import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/api/auth';
import { jsonResponse, errorResponse } from '@/lib/api/response';
import { UnauthorizedError } from '@/lib/api/errors';
import {
  getEntityPermissions,
  grantEntityPermission,
  revokeEntityPermission,
  checkEntityPermission,
  type EntityType,
  type EntityPermission,
} from '@/lib/repositories/rbac.repo';
import { captureServerError } from '@/lib/sentry/server';

const VALID_ENTITY_TYPES: EntityType[] = ['catalog_entry', 'project', 'template', 'golden_path'];
const VALID_PERMISSIONS: EntityPermission[] = ['view', 'edit', 'admin', 'delete'];

export async function GET(request: NextRequest) {
  try {
    const { user } = await verifySession();

    const entityType = request.nextUrl.searchParams.get('entityType') as EntityType | null;
    const entityId = request.nextUrl.searchParams.get('entityId');

    if (!entityType || !entityId || !VALID_ENTITY_TYPES.includes(entityType)) {
      return errorResponse('entityType and entityId are required', 400);
    }

    const hasAccess = await checkEntityPermission(entityType, entityId, user.id, 'admin');
    if (!hasAccess) {
      return errorResponse('Insufficient permissions', 403);
    }

    const permissions = await getEntityPermissions(entityType, entityId);
    return jsonResponse({ data: permissions });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, error.statusCode);
    }
    captureServerError(error, { route: '/api/permissions' });
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await verifySession();

    const body = await request.json();
    const { entityType, entityId, permission, teamId, userId } = body;

    if (!entityType || !entityId || !permission || !VALID_ENTITY_TYPES.includes(entityType)) {
      return errorResponse('entityType, entityId, and permission are required', 400);
    }

    if (!VALID_PERMISSIONS.includes(permission)) {
      return errorResponse('Invalid permission level', 400);
    }

    if (!teamId && !userId) {
      return errorResponse('Either teamId or userId is required', 400);
    }

    const hasAccess = await checkEntityPermission(entityType, entityId, user.id, 'admin');
    if (!hasAccess) {
      return errorResponse('Insufficient permissions', 403);
    }

    await grantEntityPermission(entityType, entityId, permission, user.id, {
      teamId,
      userId,
    });

    return jsonResponse({ granted: true }, 201);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, error.statusCode);
    }
    if (String(error).includes('duplicate key')) {
      return errorResponse('Permission already exists', 409);
    }
    captureServerError(error, { route: '/api/permissions' });
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await verifySession();

    const permissionId = request.nextUrl.searchParams.get('id');
    if (!permissionId) {
      return errorResponse('id query parameter required', 400);
    }

    await revokeEntityPermission(permissionId);
    return jsonResponse({ revoked: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, error.statusCode);
    }
    captureServerError(error, { route: '/api/permissions' });
    return errorResponse('Internal server error', 500);
  }
}
