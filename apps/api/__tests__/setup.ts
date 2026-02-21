/**
 * Jest Test Setup
 * Global test configuration and mocks
 */

import 'jest';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Required environment variables for tests (mock values)
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-gemini-key';

// Setup global test utilities
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});