/**
 * Test Configuration
 * Global test setup and configuration
 */

import '@testing-library/jest-dom';

// Test configuration
export const TEST_CONFIG = {
  timeout: 10000,
  API_KEYS: {
    OPENAI: process.env.TEST_OPENAI_API_KEY || 'sk-test-key-for-testing-only',
    ANTHROPIC: process.env.TEST_ANTHROPIC_API_KEY || 'sk-ant-test-key-for-testing-only',
    GOOGLE: process.env.TEST_GOOGLE_API_KEY || 'AIza-test-key-for-testing-only',
  },
  PASSWORDS: {
    VALID: process.env.TEST_VALID_PASSWORD || 'test-password-123',
    INVALID: process.env.TEST_INVALID_PASSWORD || 'wrong',
  },
  USER: {
    EMAIL: process.env.TEST_USER_EMAIL || 'test@example.com',
    PASSWORD: process.env.TEST_USER_PASSWORD || 'test-password-123',
  },
  ENCRYPTION: {
    KEY: process.env.TEST_ENCRYPTION_KEY || 'a'.repeat(32),
    IV: process.env.TEST_ENCRYPTION_IV || 'b'.repeat(16),
    TEST_KEY: process.env.TEST_ENCRYPTION_TEST_KEY || 'c'.repeat(42),
  },
};

// Mock environment variables
Object.defineProperty(process, 'env', {
  value: {
    ...process.env,
    NODE_ENV: 'test',
    NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  },
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup test timeout
jest.setTimeout(TEST_CONFIG.timeout);
