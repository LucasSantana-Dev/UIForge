import { GoogleGenerativeAI } from '@google/generative-ai';

export interface DesignAnalysis {
  layout: string;
  components: string[];
  colors: string[];
  typography: string;
  spacing: string;
  interactions: string[];
  suggestedPrompt: string;
}

const ANALYSIS_PROMPT = `Analyze this UI screenshot and extract design details.
Return ONLY valid JSON with this exact structure:
{
  "layout": "description of the layout structure (e.g. sidebar + main content, grid, single column)",
  "components": ["list", "of", "UI", "components", "visible"],
  "colors": ["#hex1", "#hex2", "...primary colors used"],
  "typography": "description of font styles, sizes, weights observed",
  "spacing": "description of spacing patterns (tight, spacious, grid-based, etc.)",
  "interactions": ["hover effects", "animations", "transitions observed or implied"],
  "suggestedPrompt": "A detailed prompt that could recreate this UI as a React component"
}`;

export async function analyzeDesignImage(
  imageBase64: string,
  mimeType: string,
  apiKey?: string
): Promise<DesignAnalysis> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('Gemini API key is required');
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent([
    { text: ANALYSIS_PROMPT },
    { inlineData: { mimeType, data: imageBase64 } },
  ]);

  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse design analysis response');
  }

  return JSON.parse(jsonMatch[0]) as DesignAnalysis;
}
