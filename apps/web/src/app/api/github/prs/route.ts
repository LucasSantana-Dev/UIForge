import { verifySession } from '@/lib/api/auth';
import { getProjectPRs } from '@/lib/services/github.service';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { user } = await verifySession();
    const projectId = request.nextUrl.searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId query parameter' },
        { status: 400 }
      );
    }

    const prs = await getProjectPRs(user.id, projectId);
    return NextResponse.json({ prs });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to get PRs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
