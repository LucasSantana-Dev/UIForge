/**
 * Zero-Cost Local AI Provider
 * Replaces paid AI APIs (OpenAI, Anthropic, Gemini) with self-hosted Ollama
 */

export interface LocalAIProvider {
  name: string;
  model: string;
  generate(prompt: string): Promise<string>;
  stream(prompt: string): AsyncGenerator<string>;
}

export class OllamaProvider implements LocalAIProvider {
  name = "ollama";
  model = "llama2"; // Free, self-hosted model

  async generate(prompt: string): Promise<string> {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json() as { response: string };
      return data.response;
    } catch (error) {
      console.error('Local AI generation failed:', error);
      throw new Error('AI service temporarily unavailable');
    }
  }

  async* stream(prompt: string): AsyncGenerator<string> {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line) as { response?: string; done?: boolean };
              if (data.response) {
                yield data.response;
              }
              if (data.done) {
                return;
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      console.error('Local AI streaming failed:', error);
      throw new Error('AI streaming service temporarily unavailable');
    }
  }
}

// Singleton instance for the application
export const localAI = new OllamaProvider();

// Helper function to check if Ollama is available
export async function checkOllamaAvailability(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Helper function to get available models
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) {
      return [];
    }

    const data = await response.json() as { models: Array<{ name: string }> };
    return data.models?.map((model) => model.name) || [];
  } catch {
    return [];
  }
}
