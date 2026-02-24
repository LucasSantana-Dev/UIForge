import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GenerationEvent {
  type: 'start' | 'chunk' | 'complete' | 'error';
  content?: string;
  message?: string;
  timestamp: number;
}

export interface GeminiGenerateOptions {
  prompt: string;
  framework: string;
  componentLibrary?: string;
  style?: string;
  typescript?: boolean;
  apiKey?: string;
  contextAddition?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

const SYSTEM_PROMPT = `You are a UI component generator. Generate a single, self-contained React component.

Rules:
- Export the component as the default export
- Include all necessary imports at the top
- Use only the specified component library for styling
- The component must be complete and ready to use
- Do not include any explanation, markdown, or code fences — output ONLY the code
- Do not wrap the code in backticks or any formatting`;

function buildPrompt(options: GeminiGenerateOptions): string {
  const parts = [`Generate a ${options.framework} component:`, options.prompt];

  if (options.componentLibrary && options.componentLibrary !== 'none') {
    parts.push(`Use ${options.componentLibrary} for styling.`);
  }
  if (options.style) {
    parts.push(`Design style: ${options.style}.`);
  }
  if (options.typescript) {
    parts.push('Use TypeScript with proper type annotations.');
  } else {
    parts.push('Use JavaScript.');
  }

  return parts.join('\n');
}

export async function* generateComponentStream(
  options: GeminiGenerateOptions
): AsyncGenerator<GenerationEvent> {
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    yield {
      type: 'error',
      message: 'Gemini API key is required. Set GEMINI_API_KEY or provide your own key.',
      timestamp: Date.now(),
    };
    return;
  }

  yield { type: 'start', timestamp: Date.now() };

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const systemPrompt = options.contextAddition
      ? `${SYSTEM_PROMPT}\n\n${options.contextAddition}`
      : SYSTEM_PROMPT;
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });

    const userPrompt = buildPrompt(options);

    const content =
      options.imageBase64 && options.imageMimeType
        ? [
            { text: userPrompt },
            {
              inlineData: {
                mimeType: options.imageMimeType,
                data: options.imageBase64,
              },
            },
          ]
        : userPrompt;

    const result = await model.generateContentStream(content);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield { type: 'chunk', content: text, timestamp: Date.now() };
      }
    }

    yield { type: 'complete', timestamp: Date.now() };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed';
    yield { type: 'error', message, timestamp: Date.now() };
  }
}
