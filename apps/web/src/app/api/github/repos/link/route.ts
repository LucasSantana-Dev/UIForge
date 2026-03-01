import { verifySession } from '@/lib/api/auth';
import { linkRepoToProject } from '@/lib/github/pipeline';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await verifySession();
    const { repoId, projectId } = await request.json();

    if (!repoId || !projectId) {
      return NextResponse.json({ error: 'Missing repoId or projectId' }, { status: 400 });
    }

    await linkRepoToProject(repoId, projectId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to link repo';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
