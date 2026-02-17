/**
 * Test Configuration
 * Global test setup and configuration
 */

import '@testing-library/jest-dom';

// Test configuration
export const TEST_CONFIG = {
  timeout: 10000,
  API_KEYS: {
    OPENAI: 'sk-1234567890abcdef1234567890abcdef12345678',
    ANTHROPIC: 'sk-ant-api03-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    GOOGLE: 'AIzaSy-1234567890abcdef-1234567890abcdef',
  },
  PASSWORDS: {
    VALID: 'password123', // Test password - not a real secret
    INVALID: 'wrong', // Test password - not a real secret
  },
  USER: {
    EMAIL: 'test@example.com',
    PASSWORD: 'password123', // Test password - not a real secret
  },
  ENCRYPTION: {
    KEY: 'test-encryption-key-32-characters-long-123456', // Test key - not a real secret
    IV: 'test-iv-16-chars-1234', // Test IV - not a real secret
    TEST_KEY: 'test-key-for-encryption-testing-123456', // Test key - not a real secret
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
