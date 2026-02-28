/**
 * Test Configuration
 * Contains test values and mock data for security testing
 */

export const TEST_CONFIG = {
  API_KEYS: {
    OPENAI: 'sk-test-openai-key-1234567890abcdef',
    ANTHROPIC: 'sk-ant-test-anthropic-key-1234567890abcdef',
    GEMINI: 'test-gemini-key-1234567890abcdef',
  },
  PASSWORDS: {
    USER: 'TestPassword123!',
    ADMIN: 'AdminPassword456!',
    WEAK: 'password123',
  },
  USERS: {
    VALID: {
      email: 'test@example.com',
      name: 'Test User',
    },
    ADMIN: {
      email: 'admin@example.com',
      name: 'Admin User',
    },
  },
  ENCRYPTION: {
    TEST_DATA: 'This is test data for encryption',
    TEST_KEY: 'test-encryption-key-32-chars',
  },
} as const;

export const createMockApiKey = (provider: 'openai' | 'anthropic' | 'google'): string => {
  switch (provider) {
    case 'openai':
      return TEST_CONFIG.API_KEYS.OPENAI;
    case 'anthropic':
      return TEST_CONFIG.API_KEYS.ANTHROPIC;
    case 'google':
      return TEST_CONFIG.API_KEYS.GEMINI;
    default:
      return 'test-key';
  }
};

export const createMockUser = (type: 'valid' | 'admin' = 'valid') => {
  return type === 'admin' ? TEST_CONFIG.USERS.ADMIN : TEST_CONFIG.USERS.VALID;
};
