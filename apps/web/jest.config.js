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
    '!src/lib/api/generation.ts',
    '!src/lib/stripe/client.ts',
    '!src/lib/stripe/server.ts',
    '!src/**/*.d.ts',
    '!src/**/*.stories.*',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 40,
      statements: 40,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
