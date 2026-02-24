import type { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL_NAME = 'gemini-2.0-flash';

function buildPrompt(options: {
  description: string;
  framework?: string;
  componentLibrary?: string;
  style?: string;
  typescript?: boolean;
}): string {
  const {
    framework = 'react',
    componentLibrary = 'tailwind',
    description,
    style = 'modern',
    typescript = true,
  } = options;

  const lang = typescript ? 'TypeScript' : 'JavaScript';
  const ext = typescript
    ? framework === 'react'
      ? 'tsx'
      : 'ts'
    : framework === 'react'
      ? 'jsx'
      : 'js';

  const libInstruction =
    componentLibrary === 'tailwind'
      ? 'Tailwind CSS classes'
      : componentLibrary === 'shadcn'
        ? 'shadcn/ui components with Tailwind'
        : componentLibrary === 'none'
          ? 'inline styles or CSS modules'
          : `${componentLibrary} components`;

  return `You are a senior React developer. Generate a ${framework} component.

**Description**: ${description}

**Requirements**:
- Framework: ${framework}
- Language: ${lang} (.${ext})
- Styling: ${libInstruction}
- Design: ${style}

**Rules**:
1. Output ONLY the component code inside a single markdown code block
2. Include all necessary imports
3. Export the component as default
4. Make it self-contained and production-ready
5. Use proper ${lang} types for all props
6. Follow ${style} design principles
7. No explanations, no extra text outside the code block`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.description || typeof body.description !== 'string') {
      return new Response(JSON.stringify({ error: 'Description is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = body.userApiKey || process.env.GEMINI_API_KEY || '';

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'No API key. Add a Gemini key in Settings or set GEMINI_API_KEY.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = buildPrompt(body);

    const result = await model.generateContentStream(prompt);
    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            const send = (data: Record<string, unknown>) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            send({ type: 'start', timestamp: Date.now() });

            let fullCode = '';

            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                fullCode += text;
                send({
                  type: 'chunk',
                  content: text,
                  timestamp: Date.now(),
                });
              }
            }

            const codeMatch = fullCode.match(/```(?:tsx?|jsx?|vue|svelte)?\n([\s\S]*?)\n```/);
            const extractedCode = codeMatch ? codeMatch[1].trim() : fullCode.trim();

            send({
              type: 'complete',
              code: extractedCode,
              totalLength: extractedCode.length,
              timestamp: Date.now(),
            });

            controller.close();
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Generation failed';
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`)
            );
            controller.close();
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      }
    );
  } catch (error) {
    console.error('Generation error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
