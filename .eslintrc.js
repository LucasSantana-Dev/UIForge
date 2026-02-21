// Enhanced ESLint configuration with forge-patterns integration
// Extends the existing @uiforge/eslint-config with additional forge-patterns rules
module.exports = {
  root: true,
  extends: ['@uiforge/eslint-config'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: ['./apps/*/tsconfig.json', './packages/*/tsconfig.json']
  },
  rules: {
    // Forge Patterns additions
    'prefer-template': 'warn',
    'no-duplicate-imports': 'error',
    'require-await': 'warn',

    // Enhanced TypeScript rules (less strict than forge-patterns defaults)
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn'
  },
  overrides: [
    {
      // Test files - relaxed rules
      files: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
        '@typescript-eslint/no-floating-promises': 'off'
      }
    },
    {
      // Configuration files - more relaxed
      files: ['*.config.js', '*.config.ts', '*.json'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off'
      }
    },
    {
      // Security scripts - very relaxed
      files: ['scripts/security/*.sh', 'scripts/forge-features'],
      rules: {
        'no-console': 'off'
      }
    }
  ],
  // Ignore build outputs and dependencies
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'out/',
    '.next/',
    'coverage/',
    '*.min.js'
  ]
};
