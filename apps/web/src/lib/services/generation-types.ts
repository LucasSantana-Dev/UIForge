export interface GenerationEvent {
  type: 'start' | 'chunk' | 'complete' | 'error' | 'fallback' | 'routing';
  content?: string;
  message?: string;
  provider?: string;
  model?: string;
  reason?: string;
  timestamp: number;
}

export interface GenerateStreamOptions {
  prompt: string;
  framework: string;
  componentLibrary?: string;
  style?: string;
  typescript?: boolean;
  apiKey?: string;
  contextAddition?: string;
  imageBase64?: string;
  imageMimeType?: string;
  conversationContext?: {
    previousCode: string;
    refinementPrompt: string;
    originalPrompt: string;
  };
}
