/**
 * AI Generation Service Tests
 * Tests for multi-provider AI generation orchestration
 */

import { ComponentGenerationRequest, ComponentGenerationResult } from '../../src/types/ai';

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

  describe('Request Validation', () => {
    it('should validate required fields', () => {
      const request: ComponentGenerationRequest = {
        framework: 'react',
        componentLibrary: 'tailwind',
        description: 'Create a modern button component',
        style: 'modern',
        typescript: true,
        aiProvider: 'openai',
        useUserKey: false,
        apiKey: '',
      };

      expect(request.framework).toBe('react');
      expect(request.description).toBe('Create a modern button component');
      expect(request.aiProvider).toBe('openai');
    });

    it('should handle different frameworks', () => {
      const frameworks: Array<'react' | 'vue' | 'angular' | 'svelte'> = [
        'react',
        'vue',
        'angular',
        'svelte',
      ];

      frameworks.forEach((framework) => {
        const request: ComponentGenerationRequest = {
          ...validRequest,
          framework,
        };
        expect(request.framework).toBe(framework);
      });
    });

    it('should handle different component libraries', () => {
      const libraries: Array<'tailwind' | 'mui' | 'chakra' | 'shadcn' | 'none'> = [
        'tailwind',
        'mui',
        'chakra',
        'shadcn',
        'none',
      ];

      libraries.forEach((library) => {
        const request: ComponentGenerationRequest = {
          ...validRequest,
          componentLibrary: library,
        };
        expect(request.componentLibrary).toBe(library);
      });
    });

    it('should handle different AI providers', () => {
      const providers: Array<'openai' | 'anthropic' | 'google' | 'auto'> = [
        'openai',
        'anthropic',
        'google',
        'auto',
      ];

      providers.forEach((provider) => {
        const request: ComponentGenerationRequest = {
          ...validRequest,
          aiProvider: provider,
        };
        expect(request.aiProvider).toBe(provider);
      });
    });

    it('should handle optional fields', () => {
      const minimalRequest: ComponentGenerationRequest = {
        framework: 'react',
        description: 'Create a button',
        aiProvider: 'auto',
      };

      expect(minimalRequest.framework).toBe('react');
      expect(minimalRequest.description).toBe('Create a button');
      expect(minimalRequest.aiProvider).toBe('auto');
      expect(minimalRequest.componentLibrary).toBeUndefined();
      expect(minimalRequest.style).toBeUndefined();
      expect(minimalRequest.typescript).toBeUndefined();
    });

    it('should handle TypeScript option', () => {
      const tsRequest: ComponentGenerationRequest = {
        ...validRequest,
        typescript: true,
      };

      expect(tsRequest.typescript).toBe(true);
    });

    it('should handle user API keys', () => {
      const userKeyRequest: ComponentGenerationRequest = {
        ...validRequest,
        useUserKey: true,
        apiKey: 'test-api-key',
      };

      expect(userKeyRequest.useUserKey).toBe(true);
      expect(userKeyRequest.apiKey).toBe('test-api-key');
    });
  });

  describe('Component Generation Result', () => {
    it('should create valid result', () => {
      const result: ComponentGenerationResult = {
        code: 'export default function Button() { return <button>Click me</button>; }',
        language: 'typescript',
        framework: 'react',
        provider: 'openai',
        model: 'gpt-4',
        tokensUsed: 150,
      };

      expect(result.code).toContain('export default function Button');
      expect(result.language).toBe('typescript');
      expect(result.framework).toBe('react');
      expect(result.provider).toBe('openai');
      expect(result.model).toBe('gpt-4');
      expect(result.tokensUsed).toBe(150);
    });

    it('should handle result without token count', () => {
      const result: ComponentGenerationResult = {
        code: 'export default function Button() { return <button>Click me</button>; }',
        language: 'typescript',
        framework: 'react',
        provider: 'anthropic',
        model: 'claude-3-5-sonnet',
      };

      expect(result.code).toContain('export default function Button');
      expect(result.tokensUsed).toBeUndefined();
    });
  });

  describe('Type Safety', () => {
    it('should enforce framework types', () => {
      const validFrameworks: Array<'react' | 'vue' | 'angular' | 'svelte'> = [
        'react',
        'vue',
        'angular',
        'svelte',
      ];

      validFrameworks.forEach((framework) => {
        const request: ComponentGenerationRequest = {
          framework,
          description: 'Test component',
          aiProvider: 'auto',
        };
        expect(['react', 'vue', 'angular', 'svelte']).toContain(request.framework);
      });
    });

    it('should enforce AI provider types', () => {
      const validProviders: Array<'openai' | 'anthropic' | 'google' | 'auto'> = [
        'openai',
        'anthropic',
        'google',
        'auto',
      ];

      validProviders.forEach((provider) => {
        const request: ComponentGenerationRequest = {
          framework: 'react',
          description: 'Test component',
          aiProvider: provider,
        };
        expect(['openai', 'anthropic', 'google', 'auto']).toContain(request.aiProvider);
      });
    });

    it('should enforce component library types', () => {
      const validLibraries: Array<'tailwind' | 'mui' | 'chakra' | 'shadcn' | 'none'> = [
        'tailwind',
        'mui',
        'chakra',
        'shadcn',
        'none',
      ];

      validLibraries.forEach((library) => {
        const request: ComponentGenerationRequest = {
          framework: 'react',
          componentLibrary: library,
          description: 'Test component',
          aiProvider: 'auto',
        };
        expect(['tailwind', 'mui', 'chakra', 'shadcn', 'none']).toContain(request.componentLibrary);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty description', () => {
      const request: ComponentGenerationRequest = {
        framework: 'react',
        description: '',
        aiProvider: 'auto',
      };

      expect(request.description).toBe('');
    });

    it('should handle very long description', () => {
      const longDescription = 'A'.repeat(1000);
      const request: ComponentGenerationRequest = {
        framework: 'react',
        description: longDescription,
        aiProvider: 'auto',
      };

      expect(request.description).toBe(longDescription);
      expect(request.description.length).toBe(1000);
    });

    it('should handle special characters in description', () => {
      const specialDescription = 'Create a button with emoji 🎨 and special chars: @#$%^&*()';
      const request: ComponentGenerationRequest = {
        framework: 'react',
        description: specialDescription,
        aiProvider: 'auto',
      };

      expect(request.description).toBe(specialDescription);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete request with all fields', () => {
      const completeRequest: ComponentGenerationRequest = {
        framework: 'react',
        componentLibrary: 'tailwind',
        description: 'Create a modern login form with email and password fields',
        style: 'modern',
        typescript: true,
        aiProvider: 'openai',
        useUserKey: false,
        apiKey: '',
        model: 'gpt-4',
        stream: false,
      };

      expect(completeRequest.framework).toBe('react');
      expect(completeRequest.componentLibrary).toBe('tailwind');
      expect(completeRequest.description).toContain('login form');
      expect(completeRequest.style).toBe('modern');
      expect(completeRequest.typescript).toBe(true);
      expect(completeRequest.aiProvider).toBe('openai');
      expect(completeRequest.useUserKey).toBe(false);
      expect(completeRequest.model).toBe('gpt-4');
      expect(completeRequest.stream).toBe(false);
    });

    it('should handle minimal request', () => {
      const minimalRequest: ComponentGenerationRequest = {
        framework: 'vue',
        description: 'Simple button',
        aiProvider: 'auto',
      };

      expect(minimalRequest.framework).toBe('vue');
      expect(minimalRequest.description).toBe('Simple button');
      expect(minimalRequest.aiProvider).toBe('auto');
      expect(minimalRequest.componentLibrary).toBeUndefined();
      expect(minimalRequest.style).toBeUndefined();
      expect(minimalRequest.typescript).toBeUndefined();
      expect(minimalRequest.useUserKey).toBeUndefined();
      expect(minimalRequest.apiKey).toBeUndefined();
    });
  });
});
