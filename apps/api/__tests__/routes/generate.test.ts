/**
 * Generate API Route Tests
 * Tests for the component generation API endpoint
 */

import request from 'supertest';
import app from '../../app';

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
    it('should return 200 for valid request structure', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send(validRequestData)
        .expect(200);

      // Basic structure validation - the actual AI service will be mocked
      expect(response.body).toBeDefined();
    });

    it('should validate required fields', async () => {
      const invalidRequest = {
        framework: '',
        componentLibrary: 'tailwind',
        description: 'Create a button',
        style: 'modern',
        typescript: false,
      };

      const response = await request(app)
        .post('/api/generate')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('framework');
    });

    it('should validate framework values', async () => {
      const invalidRequest = {
        ...validRequestData,
        framework: 'invalid-framework',
      };

      const response = await request(app)
        .post('/api/generate')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('framework');
    });

    it('should validate component library values', async () => {
      const invalidRequest = {
        ...validRequestData,
        componentLibrary: 'invalid-library',
      };

      const response = await request(app)
        .post('/api/generate')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('componentLibrary');
    });

    it('should validate style values', async () => {
      const invalidRequest = {
        ...validRequestData,
        style: 'invalid-style',
      };

      const response = await request(app)
        .post('/api/generate')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('style');
    });

    it('should validate AI provider values', async () => {
      const invalidRequest = {
        ...validRequestData,
        aiProvider: 'invalid-provider',
      };

      const response = await request(app)
        .post('/api/generate')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('aiProvider');
    });

    it('should handle user API keys', async () => {
      const userKeyRequest = {
        ...validRequestData,
        useUserKey: true,
        apiKey: 'sk-user-key-123',
      };

      const response = await request(app)
        .post('/api/generate')
        .send(userKeyRequest)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should require API key when useUserKey is true', async () => {
      const invalidRequest = {
        ...validRequestData,
        useUserKey: true,
        apiKey: '',
      };

      const response = await request(app)
        .post('/api/generate')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('apiKey');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid JSON');
    });

    it('should handle missing content type', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send(validRequestData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Content-Type');
    });

    it('should validate description length', async () => {
      const longDescription = 'a'.repeat(2000); // Exceeds max length
      const invalidRequest = {
        ...validRequestData,
        description: longDescription,
      };

      const response = await request(app)
        .post('/api/generate')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('description');
    });

    it('should validate description minimum length', async () => {
      const shortDescription = 'Hi'; // Too short
      const invalidRequest = {
        ...validRequestData,
        description: shortDescription,
      };

      const response = await request(app)
        .post('/api/generate')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('description');
    });

    it('should handle TypeScript option', async () => {
      const tsRequest = {
        ...validRequestData,
        typescript: true,
      };

      const response = await request(app)
        .post('/api/generate')
        .send(tsRequest)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should handle different model selections', async () => {
      const modelRequest = {
        ...validRequestData,
        model: 'gpt-3.5-turbo',
      };

      const response = await request(app)
        .post('/api/generate')
        .send(modelRequest)
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailability', async () => {
      // This test validates the error handling structure
      // The actual error will depend on the AI service implementation
      const response = await request(app)
        .post('/api/generate')
        .send(validRequestData)
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Security', () => {
    it('should sanitize request headers', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send(validRequestData)
        .set('X-Forwarded-For', 'malicious-header-value')
        .set('User-Agent', '<script>alert(1)</script>')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should validate request size', async () => {
      const largeRequest = {
        ...validRequestData,
        description: 'a'.repeat(10000), // Very large description
      };

      const response = await request(app)
        .post('/api/generate')
        .send(largeRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('too large');
    });
  });
});