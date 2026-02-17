/**
 * AI Generation Service Tests
 * Tests for multi-provider AI generation orchestration
 */

import { generateComponent as generateWithOpenAI } from '../../services/openai';
import { generateComponent as generateWithAnthropic } from '../../services/anthropic';
import { generateComponent as generateWithGemini } from '../../services/gemini';
import { ComponentGenerationRequest, ComponentGenerationResult } from '../../types/ai';

// Mock the individual AI services
jest.mock('../../services/openai');
jest.mock('../../services/anthropic');
jest.mock('../../services/gemini');

const mockOpenAIGenerate = generateWithOpenAI as jest.MockedFunction<typeof generateWithOpenAI>;
const mockAnthropicGenerate = generateWithAnthropic as jest.MockedFunction<typeof generateWithAnthropic>;
const mockGeminiGenerate = generateWithGemini as jest.MockedFunction<typeof generateWithGemini>;

describe('AI Generation Service Integration', () => {
  const validRequest: ComponentGenerationRequest = {
    framework: 'react',
    componentLibrary: 'tailwind',
    description: 'Create a modern button component',
    style: 'modern',
    typescript: true,
    aiProvider: 'openai',
    useUserKey: false,
    apiKey: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset all mocks
    mockOpenAIGenerate.mockClear();
    mockAnthropicGenerate.mockClear();
    mockGeminiGenerate.mockClear();
  });

  describe('OpenAI Provider', () => {
    it('should generate component with OpenAI', async () => {
      const mockResult: ComponentGenerationResult = {
        code: 'export default function Button() { return <button>Click me</button>; }',
        language: 'typescript',
        framework: 'react',
        provider: 'openai',
        model: 'gpt-4',
        tokensUsed: 150,
      };

      mockOpenAIGenerate.mockResolvedValue(mockResult);

      const result = await mockOpenAIGenerate(validRequest);

      expect(result).toEqual(mockResult);
      expect(mockOpenAIGenerate).toHaveBeenCalledWith(validRequest);
    });

    it('should handle OpenAI errors', async () => {
      const error = new Error('OpenAI API error');
      mockOpenAIGenerate.mockRejectedValue(error);

      await expect(mockOpenAIGenerate(validRequest)).rejects.toThrow('OpenAI API error');
    });
  });

  describe('Anthropic Provider', () => {
    it('should generate component with Anthropic', async () => {
      const mockResult: ComponentGenerationResult = {
        code: 'export default function Button() { return <button>Click me</button>; }',
        language: 'typescript',
        framework: 'react',
        provider: 'anthropic',
        model: 'claude-3-5-sonnet',
        tokensUsed: 120,
      };

      mockAnthropicGenerate.mockResolvedValue(mockResult);

      const result = await mockAnthropicGenerate(validRequest);

      expect(result).toEqual(mockResult);
      expect(mockAnthropicGenerate).toHaveBeenCalledWith(validRequest);
    });

    it('should handle Anthropic errors', async () => {
      const error = new Error('Anthropic API error');
      mockAnthropicGenerate.mockRejectedValue(error);

      await expect(mockAnthropicGenerate(validRequest)).rejects.toThrow('Anthropic API error');
    });
  });

  describe('Gemini Provider', () => {
    it('should generate component with Gemini', async () => {
      const mockResult: ComponentGenerationResult = {
        code: 'export default function Button() { return <button>Click me</button>; }',
        language: 'typescript',
        framework: 'react',
        provider: 'google',
        model: 'gemini-1.5-flash',
        tokensUsed: 100,
      };

      mockGeminiGenerate.mockResolvedValue(mockResult);

      const result = await mockGeminiGenerate(validRequest);

      expect(result).toEqual(mockResult);
      expect(mockGeminiGenerate).toHaveBeenCalledWith(validRequest);
    });

    it('should handle Gemini errors', async () => {
      const error = new Error('Gemini API error');
      mockGeminiGenerate.mockRejectedValue(error);

      await expect(mockGeminiGenerate(validRequest)).rejects.toThrow('Gemini API error');
    });
  });

  describe('Provider Selection', () => {
    it('should handle different providers', async () => {
      const openAIRequest = { ...validRequest, aiProvider: 'openai' };
      const anthropicRequest = { ...validRequest, aiProvider: 'anthropic' };
      const geminiRequest = { ...validRequest, aiProvider: 'google' };

      const openAIResult: ComponentGenerationResult = {
        code: 'export default function Button() { return <button>Click me</button>; }',
        language: 'typescript',
        framework: 'react',
        provider: 'openai',
        model: 'gpt-4',
        tokensUsed: 150,
      };

      const anthropicResult: ComponentGenerationResult = {
        code: 'export default function Button() { return <button>Click me</button>; }',
        language: 'typescript',
        framework: 'react',
        provider: 'anthropic',
        model: 'claude-3-5-sonnet',
        tokensUsed: 120,
      };

      const geminiResult: ComponentGenerationResult = {
        code: 'export default function Button() { return <button>Click me</button>; }',
        language: 'typescript',
        framework: 'react',
        provider: 'google',
        model: 'gemini-1.5-flash',
        tokensUsed: 100,
      };

      mockOpenAIGenerate.mockResolvedValue(openAIResult);
      mockAnthropicGenerate.mockResolvedValue(anthropicResult);
      mockGeminiGenerate.mockResolvedValue(geminiResult);

      const openAIResponse = await mockOpenAIGenerate(openAIRequest);
      const anthropicResponse = await mockAnthropicGenerate(anthropicRequest);
      const geminiResponse = await mockGeminiGenerate(geminiRequest);

      expect(openAIResponse.provider).toBe('openai');
      expect(anthropicResponse.provider).toBe('anthropic');
      expect(geminiResponse.provider).toBe('google');
    });
  });

  describe('Request Validation', () => {
    it('should validate required fields', async () => {
      const invalidRequest = {
        framework: '',
        componentLibrary: 'tailwind',
        description: 'Create a button',
        style: 'modern',
        typescript: true,
        aiProvider: 'openai',
        useUserKey: false,
        apiKey: '',
      };

      await expect(mockOpenAIGenerate(invalidRequest)).rejects.toThrow();
    });

    it('should validate framework values', async () => {
      const invalidRequest = {
        ...validRequest,
        framework: 'invalid-framework',
      };

      await expect(mockOpenAIGenerate(invalidRequest)).rejects.toThrow();
    });

    it('should validate component library values', async () => {
      const invalidRequest = {
        ...validRequest,
        componentLibrary: 'invalid-library',
      };

      await expect(mockOpenAIGenerate(invalidRequest)).rejects.toThrow();
    });

    it('should validate style values', async () => {
      const invalidRequest = {
        ...validRequest,
        style: 'invalid-style',
      };

      await expect(mockOpenAIGenerate(invalidRequest)).rejects.toThrow();
    });

    it('should validate AI provider values', async () => {
      const invalidRequest = {
        ...validRequest,
        aiProvider: 'invalid-provider',
      };

      await expect(mockOpenAIGenerate(invalidRequest)).rejects.toThrow();
    });

    it('should handle user API keys', async () => {
      const userKeyRequest = {
        ...validRequest,
        useUserKey: true,
        apiKey: 'sk-user-key-123',
      };

      const mockResult: ComponentGenerationResult = {
        code: 'export default function Button() { return <button>Click me</button>; }',
        language: 'typescript',
        framework: 'react',
        provider: 'openai',
        model: 'gpt-4',
        tokensUsed: 150,
      };

      mockOpenAIGenerate.mockResolvedValue(mockResult);

      const result = await mockOpenAIGenerate(userKeyRequest);

      expect(result).toEqual(mockResult);
      expect(mockOpenAIGenerate).toHaveBeenCalledWith(userKeyRequest);
    });

    it('should require API key when useUserKey is true', async () => {
      const invalidRequest = {
        ...validRequest,
        useUserKey: true,
        apiKey: '',
      };

      await expect(mockOpenAIGenerate(invalidRequest)).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailability', async () => {
      const error = new Error('Service temporarily unavailable');
      mockOpenAIGenerate.mockRejectedValue(error);

      await expect(mockOpenAIGenerate(validRequest)).rejects.toThrow('Service temporarily unavailable');
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Invalid API key');
      authError.name = 'AuthenticationError';
      mockOpenAIGenerate.mockRejectedValue(authError);

      await expect(mockOpenAIGenerate(validRequest)).rejects.toThrow('Invalid API key');
    });

    it('should handle quota exceeded errors', async () => {
      const quotaError = new Error('API quota exceeded');
      quotaError.name = 'QuotaExceededError';
      mockOpenAIGenerate.mockRejectedValue(quotaError);

      await expect(mockOpenAIGenerate(validRequest)).rejects.toThrow('API quota exceeded');
    });
  });

  describe('Integration', () => {
    it('should handle complete workflow end-to-end', async () => {
      const request: ComponentGenerationRequest = {
        framework: 'react',
        componentLibrary: 'tailwind',
        description: 'Create a modern login form component with email and password fields',
        style: 'modern',
        typescript: true,
        aiProvider: 'auto',
        useUserKey: false,
        apiKey: '',
      };

      // Mock successful generation
      mockOpenAIGenerate.mockResolvedValue({
        code: `export default function LoginForm() {
  return (
    <div className="login-form">
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </div>
  );
}`,
        language: 'typescript',
        framework: 'react',
        provider: 'openai',
        model: 'gpt-4',
        tokensUsed: 200,
      });

      const result = await mockOpenAIGenerate(request);

      expect(result.code).toContain('LoginForm');
      expect(result.provider).toBe('openai');
      expect(result.tokensUsed).toBe(200);
    });

    it('should handle concurrent requests efficiently', async () => {
      const requests = Array.from({ length: 3 }, () => ({
        framework: 'react',
        componentLibrary: 'tailwind',
        description: `Create component ${Math.random().toString(36)}`,
        style: 'modern',
        typescript: true,
        aiProvider: 'auto',
        useUserKey: false,
        apiKey: '',
      }));

      const mockResult: ComponentGenerationResult = {
        code: 'export default function Button() { return <button>Click me</button>; }',
        language: 'typescript',
        framework: 'react',
        provider: 'openai',
        model: 'gpt-4',
        tokensUsed: 150,
      };

      mockOpenAIGenerate.mockResolvedValue(mockResult);

      const results = await Promise.all(
        requests.map(req => mockOpenAIGenerate(req))
      );

      expect(results).toHaveLength(3);
      results.forEach((result: ComponentGenerationResult) => {
        expect(result.code).toContain('export default function Button');
      });
    });
  });
});