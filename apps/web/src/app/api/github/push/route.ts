import { verifySession } from '@/lib/api/auth';
import { createPRFromGeneration } from '@/lib/services/github.service';
import { runAllGates } from '@/lib/quality/gates';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { user } = await verifySession();
    const body = await request.json();

    const { projectId, generationId, componentName, code, prompt, model } = body;

    if (!projectId || !componentName || !code) {
      return NextResponse.json(
        {
          error: 'Missing required fields: projectId, componentName, code',
        },
        { status: 400 }
      );
    }

    const qualityReport = runAllGates(code);
    if (!qualityReport.passed) {
      return NextResponse.json(
        { error: 'Quality gates failed', report: qualityReport },
        { status: 422 }
      );
    }

    const pr = await createPRFromGeneration({
      userId: user.id,
      projectId,
      generationId,
      componentName,
      code,
      prompt: prompt || componentName,
      model: model || 'gemini-2.0-flash',
    });

    return NextResponse.json({ pr });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create PR';
    const status = message.includes('No GitHub repo linked') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
