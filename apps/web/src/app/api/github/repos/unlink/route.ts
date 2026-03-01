import { verifySession } from '@/lib/api/auth';
import { unlinkRepo } from '@/lib/github/pipeline';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await verifySession();
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    await unlinkRepo(projectId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to unlink repo';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
