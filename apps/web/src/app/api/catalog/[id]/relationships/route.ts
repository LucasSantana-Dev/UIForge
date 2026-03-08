import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getRelationshipsForEntity,
  createRelationship,
  deleteRelationship,
} from '@/lib/repositories/relationship.repo';
import type { RelationType } from '@/lib/repositories/relationship.repo';
import { captureServerError } from '@/lib/sentry/server';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;

  try {
    const relationships = await getRelationshipsForEntity(id);
    return NextResponse.json({ data: relationships });
  } catch (err) {
    captureServerError(err, { route: `/api/catalog/${id}/relationships` });
    return NextResponse.json({ error: 'Failed to fetch relationships' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);

  if (!body?.targetId || !body?.type) {
    return NextResponse.json({ error: 'targetId and type are required' }, { status: 400 });
  }

  try {
    const rel = await createRelationship(
      id,
      body.targetId,
      body.type as RelationType,
      user.id,
      body.metadata
    );
    return NextResponse.json({ data: rel }, { status: 201 });
  } catch (err) {
    if (
      (err as Error).message?.includes('unique') ||
      (err as Error).message?.includes('duplicate')
    ) {
      return NextResponse.json({ error: 'Relationship already exists' }, { status: 409 });
    }
    captureServerError(err, { route: `/api/catalog/${id}/relationships` });
    return NextResponse.json({ error: 'Failed to create relationship' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const relationshipId = url.searchParams.get('relationshipId');

  if (!relationshipId) {
    return NextResponse.json({ error: 'relationshipId query param required' }, { status: 400 });
  }

  try {
    await deleteRelationship(relationshipId);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    const { id } = await ctx.params;
    captureServerError(err, { route: `/api/catalog/${id}/relationships` });
    return NextResponse.json({ error: 'Failed to delete relationship' }, { status: 500 });
  }
}
