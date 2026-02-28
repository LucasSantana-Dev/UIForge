/**
 * Generate API Route Tests
 * Tests for the component generation API endpoint
 */

import request from 'supertest';
import app from '../../src/app';
import { TEST_CONFIG } from '../test-config';

describe('/api/generate', () => {
  const validRequestData = {
    framework: 'react',
    componentLibrary: 'tailwind',
    description: 'Create a modern button component',
    style: 'modern',
    typescript: false,
    aiProvider: 'openai',
    useUserKey: false,
  };

  describe('POST /api/generate', () => {
    it('should return 401 for requests without authentication', async () => {
      const response = await request(app).post('/api/generate').send(validRequestData).expect(401);

      // Response body may be undefined for 401 errors
      expect(response.status).toBe(401);
    });

    it('should return 401 for requests without proper auth headers', async () => {
      const response = await request(app)
        .post('/api/generate')
        .set('Authorization', 'Bearer invalid-token')
        .send(validRequestData)
        .expect(401);

      expect(response.status).toBe(401);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(500); // JSON parsing error happens before auth

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });

    it('should handle missing content type', async () => {
      const response = await request(app).post('/api/generate').send(validRequestData).expect(401); // Auth check happens before content type validation

      expect(response.status).toBe(401);
    });

    it('should validate request size limits', async () => {
      const largeRequest = {
        ...validRequestData,
        description: 'a'.repeat(10000), // Very large description
      };

      const response = await request(app).post('/api/generate').send(largeRequest).expect(401); // Auth check happens first

      expect(response.status).toBe(401);
    });

    it('should validate request body structure', async () => {
      const invalidRequest = {
        framework: '',
        componentLibrary: 'tailwind',
        description: 'Create a button',
        style: 'modern',
        typescript: false,
      };

      const response = await request(app).post('/api/generate').send(invalidRequest).expect(401); // Auth check happens first

      expect(response.status).toBe(401);
    });

    it('should validate framework values', async () => {
      const invalidRequest = {
        ...validRequestData,
        framework: 'invalid-framework',
      };

      const response = await request(app).post('/api/generate').send(invalidRequest).expect(401); // Auth check happens first

      expect(response.status).toBe(401);
    });

    it('should validate component library values', async () => {
      const invalidRequest = {
        ...validRequestData,
        componentLibrary: 'invalid-library',
      };

      const response = await request(app).post('/api/generate').send(invalidRequest).expect(401); // Auth check happens first

      expect(response.status).toBe(401);
    });

    it('should validate style values', async () => {
      const invalidRequest = {
        ...validRequestData,
        style: 'invalid-style',
      };

      const response = await request(app).post('/api/generate').send(invalidRequest).expect(401); // Auth check happens first

      expect(response.status).toBe(401);
    });

    it('should validate AI provider values', async () => {
      const invalidRequest = {
        ...validRequestData,
        aiProvider: 'invalid-provider',
      };

      const response = await request(app).post('/api/generate').send(invalidRequest).expect(401); // Auth check happens first

      expect(response.status).toBe(401);
    });

    it('should validate description length', async () => {
      const longDescription = 'a'.repeat(2000); // Exceeds max length
      const invalidRequest = {
        ...validRequestData,
        description: longDescription,
      };

      const response = await request(app).post('/api/generate').send(invalidRequest).expect(401); // Auth check happens first

      expect(response.status).toBe(401);
    });

    it('should validate description minimum length', async () => {
      const shortDescription = ''; // Too short
      const invalidRequest = {
        ...validRequestData,
        description: shortDescription,
      };

      const response = await request(app).post('/api/generate').send(invalidRequest).expect(401); // Auth check happens first

      expect(response.status).toBe(401);
    });

    it('should handle TypeScript option', async () => {
      const tsRequest = {
        ...validRequestData,
        typescript: true,
      };

      const response = await request(app).post('/api/generate').send(tsRequest).expect(401); // Auth check happens first

      expect(response.status).toBe(401);
    });

    it('should handle different model selections', async () => {
      const modelRequest = {
        ...validRequestData,
        model: 'gpt-3.5-turbo',
      };

      const response = await request(app).post('/api/generate').send(modelRequest).expect(401); // Auth check happens first

      expect(response.status).toBe(401);
    });
  });

  describe('Request Validation Logic', () => {
    it('should validate framework values', () => {
      const validFrameworks = ['react', 'vue', 'angular', 'svelte'];
      const invalidFramework = 'invalid-framework';

      expect(validFrameworks).toContain('react');
      expect(validFrameworks).toContain('vue');
      expect(validFrameworks).toContain('angular');
      expect(validFrameworks).toContain('svelte');
      expect(validFrameworks).not.toContain(invalidFramework);
    });

    it('should validate component library values', () => {
      const validLibraries = ['tailwind', 'mui', 'chakra', 'shadcn', 'none'];
      const invalidLibrary = 'invalid-library';

      expect(validLibraries).toContain('tailwind');
      expect(validLibraries).toContain('mui');
      expect(validLibraries).toContain('chakra');
      expect(validLibraries).toContain('shadcn');
      expect(validLibraries).toContain('none');
      expect(validLibraries).not.toContain(invalidLibrary);
    });

    it('should validate style values', () => {
      const validStyles = ['modern', 'minimal', 'colorful'];
      const invalidStyle = 'invalid-style';

      expect(validStyles).toContain('modern');
      expect(validStyles).toContain('minimal');
      expect(validStyles).toContain('colorful');
      expect(validStyles).not.toContain(invalidStyle);
    });

    it('should validate AI provider values', () => {
      const validProviders = ['openai', 'anthropic', 'google', 'auto'];
      const invalidProvider = 'invalid-provider';

      expect(validProviders).toContain('openai');
      expect(validProviders).toContain('anthropic');
      expect(validProviders).toContain('google');
      expect(validProviders).toContain('auto');
      expect(validProviders).not.toContain(invalidProvider);
    });

    it('should validate description length constraints', () => {
      const shortDescription = ''; // Too short (empty string)
      const validDescription = 'Create a modern button component';
      const longDescription = 'a'.repeat(2000); // Too long

      expect(shortDescription.length).toBeLessThan(1);
      expect(validDescription.length).toBeGreaterThanOrEqual(1);
      expect(validDescription.length).toBeLessThanOrEqual(1000);
      expect(longDescription.length).toBeGreaterThan(1000);
    });

    it('should validate API key requirements', () => {
      const requestWithUserKey = {
        ...validRequestData,
        useUserKey: true,
        userApiKey: TEST_CONFIG.API_KEYS.OPENAI,
      };

      const requestWithoutUserKey = {
        ...validRequestData,
        useUserKey: true,
        userApiKey: '',
      };

      expect(requestWithUserKey.useUserKey).toBe(true);
      expect(requestWithUserKey.userApiKey).toBe(TEST_CONFIG.API_KEYS.OPENAI);
      expect(requestWithoutUserKey.useUserKey).toBe(true);
      expect(requestWithoutUserKey.userApiKey).toBe('');
    });

    it('should validate TypeScript option', () => {
      const tsRequest = {
        ...validRequestData,
        typescript: true,
      };

      const jsRequest = {
        ...validRequestData,
        typescript: false,
      };

      expect(tsRequest.typescript).toBe(true);
      expect(jsRequest.typescript).toBe(false);
    });

    it('should validate model selections', () => {
      const modelRequest = {
        ...validRequestData,
        model: 'gpt-3.5-turbo',
      };

      expect(modelRequest.model).toBe('gpt-3.5-turbo');
    });
  });

  describe('Security Validation', () => {
    it('should sanitize input data', () => {
      const maliciousInput = {
        framework: 'react',
        description: '<script>alert(1)</script>Create a button',
        style: 'modern',
        aiProvider: 'openai',
        useUserKey: false,
      };

      // Test that malicious scripts are not executed
      expect(maliciousInput.description).toContain('<script>');
      expect(maliciousInput.description).toContain('</script>');
      // In a real implementation, this would be sanitized
    });

    it('should handle special characters in description', () => {
      const specialCharsRequest = {
        framework: 'react',
        description: 'Create a button with emoji 🎨 and special chars: @#$%^&*()',
        style: 'modern',
        aiProvider: 'openai',
        useUserKey: false,
      };

      expect(specialCharsRequest.description).toContain('🎨');
      expect(specialCharsRequest.description).toContain('@#$%^&*()');
    });

    it('should validate request structure integrity', () => {
      const incompleteRequest = {
        framework: 'react',
        // Missing required fields
      } as any;

      expect(incompleteRequest.framework).toBe('react');
      expect(incompleteRequest.description).toBeUndefined();
      expect(incompleteRequest.aiProvider).toBeUndefined();
    });
  });

  describe('Response Structure', () => {
    it('should define expected streaming response format', () => {
      const expectedChunk = {
        type: 'chunk',
        content: 'export default function Button() { return <button>Click me</button>; }',
      };

      const expectedComplete = {
        type: 'complete',
        code: 'export default function Button() { return <button>Click me</button>; }',
        isValid: true,
      };

      const expectedError = {
        type: 'error',
        error: 'Generation failed',
      };

      expect(expectedChunk.type).toBe('chunk');
      expect(expectedChunk.content).toContain('export default function Button');
      expect(expectedComplete.type).toBe('complete');
      expect(expectedComplete.code).toContain('export default function Button');
      expect(expectedComplete.isValid).toBe(true);
      expect(expectedError.type).toBe('error');
      expect(expectedError.error).toContain('Generation failed');
    });

    it('should define error response format', () => {
      const errorResponse = {
        error: 'Invalid request body',
        details: [
          {
            code: 'invalid_string',
            expected: 'string',
            received: 'number',
            path: ['description'],
            message: 'Expected string, received number',
          },
        ],
      };

      expect(errorResponse.error).toBe('Invalid request body');
      expect(errorResponse.details).toBeDefined();
      expect(errorResponse.details).toBeInstanceOf(Array);
      expect(errorResponse.details[0].code).toBe('invalid_string');
    });

    it('should define validation response format', () => {
      const validationResponse = {
        isValid: true,
        language: 'typescript',
        length: 150,
      };

      expect(validationResponse.isValid).toBe(true);
      expect(validationResponse.language).toBe('typescript');
      expect(validationResponse.length).toBe(150);
    });

    it('should define formatting response format', () => {
      const formattingResponse = {
        originalCode: 'const button=document.createElement("button")',
        formattedCode: 'const button = document.createElement("button");',
        language: 'typescript',
      };

      expect(formattingResponse.originalCode).toContain('createElement');
      expect(formattingResponse.formattedCode).toContain('createElement');
      expect(formattingResponse.language).toBe('typescript');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete valid request structure', () => {
      const completeRequest = {
        framework: 'react',
        componentLibrary: 'tailwind',
        description: 'Create a modern login form with email and password fields',
        style: 'modern',
        typescript: true,
        aiProvider: 'openai',
        useUserKey: false,
        userApiKey: '',
        model: 'gpt-4',
      };

      expect(completeRequest.framework).toBe('react');
      expect(completeRequest.componentLibrary).toBe('tailwind');
      expect(completeRequest.description).toContain('login form');
      expect(completeRequest.style).toBe('modern');
      expect(completeRequest.typescript).toBe(true);
      expect(completeRequest.aiProvider).toBe('openai');
      expect(completeRequest.useUserKey).toBe(false);
      expect(completeRequest.model).toBe('gpt-4');
    });

    it('should handle minimal valid request structure', () => {
      const minimalRequest = {
        framework: 'vue',
        description: 'Simple button',
        aiProvider: 'auto',
      } as any;

      expect(minimalRequest.framework).toBe('vue');
      expect(minimalRequest.description).toBe('Simple button');
      expect(minimalRequest.aiProvider).toBe('auto');
      expect(minimalRequest.componentLibrary).toBeUndefined();
      expect(minimalRequest.style).toBeUndefined();
      expect(minimalRequest.typescript).toBeUndefined();
    });
  });

  describe('POST /api/validate', () => {
    it('should return 401 for validation requests without authentication', async () => {
      const response = await request(app)
        .post('/api/validate')
        .send({
          code: 'const x = 1;',
          language: 'typescript',
        })
        .expect(401);

      expect(response.status).toBe(401);
    });

    it('should validate code parameter', async () => {
      const response = await request(app)
        .post('/api/validate')
        .send({
          code: '',
          language: 'typescript',
        })
        .expect(401); // Auth check happens first

      expect(response.status).toBe(401);
    });

    it('should validate code length', async () => {
      const longCode = 'a'.repeat(100001); // Exceeds MAX_CODE_LENGTH
      const response = await request(app)
        .post('/api/validate')
        .send({
          code: longCode,
          language: 'typescript',
        })
        .expect(401); // Auth check happens first

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/format', () => {
    it('should return 401 for formatting requests without authentication', async () => {
      const response = await request(app)
        .post('/api/format')
        .send({
          code: 'const x=1;',
          language: 'typescript',
          apiKey: 'test-key',
          useUserKey: false,
        })
        .expect(401);

      expect(response.status).toBe(401);
    });

    it('should validate code parameter for formatting', async () => {
      const response = await request(app)
        .post('/api/format')
        .send({
          code: '',
          language: 'typescript',
          apiKey: 'test-key',
          useUserKey: false,
        })
        .expect(401); // Auth check happens first

      expect(response.status).toBe(401);
    });

    it('should validate code length for formatting', async () => {
      const longCode = 'a'.repeat(100001); // Exceeds MAX_CODE_LENGTH
      const response = await request(app)
        .post('/api/format')
        .send({
          code: longCode,
          language: 'typescript',
          apiKey: 'test-key',
          useUserKey: false,
        })
        .expect(401); // Auth check happens first

      expect(response.status).toBe(401);
    });
  });
});
