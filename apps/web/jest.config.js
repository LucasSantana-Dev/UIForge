const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/src/__tests__/setup/server-polyfills.ts',
  ],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/setup/',
    '<rootDir>/e2e/',
    '<rootDir>/src/__tests__/integration/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../../packages/shared/src/$1',
  },
  collectCoverageFrom: [
    'src/lib/api/*.{ts,tsx}',
    'src/lib/api/validation/*.{ts,tsx}',
    'src/lib/features/*.{ts,tsx}',
    'src/lib/stripe/*.{ts,tsx}',
    'src/lib/supabase/client.ts',
    'src/lib/services/gemini.ts',
    'src/lib/quality/*.{ts,tsx}',
    'src/lib/usage/*.{ts,tsx}',
    'src/lib/email/*.{ts,tsx}',
    'src/lib/auth/tokens.ts',
    '!src/lib/api/generation.ts',
    '!src/lib/stripe/client.ts',
    '!src/lib/stripe/server.ts',
    '!src/**/*.d.ts',
    '!src/**/*.stories.*',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 65,
      lines: 75,
      statements: 75,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
