---
trigger: project_specific
description: Siza WebApp specific adaptations to shared rules
globs: ["*.ts", "*.tsx", "*.js", "*.jsx", "next.config.js", "tailwind.config.js"]
---

# Siza WebApp Project-Specific Rules

**When to apply:** Siza WebApp development - Next.js/React/Supabase implementation

**Base Rules:** See [Shared Rules](../../../forge-patterns/docs/shared-rules/)

---

## 🎯 Overview

This document contains Siza WebApp-specific adaptations to the shared Forge Space rules. These adaptations address the unique requirements of Next.js/React development, Supabase integration, and AI-powered UI generation.

## ⚛️ Next.js/React Specific Adaptations

### Development Environment
- **Node.js Version**: 20+ (specified in package.json)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS + shadcn/ui components

### Code Style Tools
- **Linting**: ESLint with Next.js and React configurations
- **Formatting**: Prettier with consistent formatting rules
- **Type Checking**: TypeScript strict mode
- **Security**: npm audit for dependency vulnerabilities

### Testing Framework
- **Unit Tests**: Jest with React Testing Library
- **Integration Tests**: Jest with Next.js testing utilities
- **E2E Tests**: Playwright for browser automation
- **Component Testing**: React Testing Library for component behavior

## 🗄️ Supabase Integration Specific

### Database Operations
- **Client**: Supabase JavaScript client
- **Authentication**: Supabase Auth with JWT tokens
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage for file uploads

### Testing Supabase Features
```typescript
// Example: Mocking Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: mockData, error: null }))
        }))
      }))
    })),
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn()
    }
  }
}))
```

### RLS Policy Testing
- Test Row Level Security policies in integration tests
- Mock user authentication contexts
- Validate data access permissions
- Test edge cases for policy violations

## 🤖 AI Integration Specific

### Provider Testing
- **OpenAI**: Mock API responses for consistent testing
- **Anthropic**: Test Claude integration patterns
- **Ollama**: Test local AI model integration
- **Fallback Logic**: Test provider switching and error handling

### Component Generation Testing
```typescript
// Example: Testing AI component generation
describe('AI Component Generation', () => {
  it('should generate valid React component', async () => {
    const mockAIResponse = {
      choices: [{
        message: {
          content: 'export default function Button() { return <button>Click</button>; }'
        }
      }]
    };
    
    const result = await generateComponent('A button component');
    expect(result).toContain('export default function');
    expect(result).toContain('<button>');
  });
});
```

## 📋 Quality Gates (Next.js Adaptation)

### Pre-commit Quality Checks
```bash
# Linting
npm run lint              # Must pass with 0 errors, 0 warnings

# Type checking
npm run type-check        # Must pass with 0 errors

# Formatting
npm run format:check      # Must be properly formatted

# Security audit
npm audit                 # No high/critical vulnerabilities
```

### Test Requirements
```bash
# Run unit tests with coverage
npm test                  # Jest with coverage reporting

# Run E2E tests
npm run test:e2e          # Playwright browser automation

# Coverage thresholds
# Statements: ≥80%
# Branches: ≥80%
# Functions: ≥80%
# Lines: ≥80%
```

### Build Requirements
```bash
# Build for production
npm run build             # Must complete without errors

# Export validation
npm run export            # Static export validation (if applicable)
```

## 🛡️ Security Adaptations

### Web Application Security
- **Input Validation**: Validate all user inputs and API parameters
- **XSS Protection**: React's built-in XSS protection + CSP headers
- **CSRF Protection**: Next.js CSRF protection for forms
- **Authentication**: Secure JWT token handling

### Supabase Security
- **RLS Policies**: Row Level Security for data access
- **API Keys**: Secure storage of Supabase keys
- **Authentication**: Secure password handling and session management
- **Storage**: File upload validation and virus scanning

### AI Provider Security
- **API Key Management**: Secure storage of AI provider keys
- **Request Validation**: Validate AI request parameters
- **Response Sanitization**: Sanitize AI-generated content
- **Rate Limiting**: Prevent AI provider abuse

## 🧪 Testing Adaptations

### Jest Configuration
```js
// jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThreshold: {
    global: { lines: 80, branches: 80, functions: 80, statements: 80 },
  },
};

export default createJestConfig(config);
```

### Test Structure
```
src/
├── __tests__/               # Unit tests
│   ├── unit/               # Pure unit tests
│   │   ├── components/      # Component unit tests
│   │   ├── lib/             # Library function tests
│   │   └── utils/           # Utility function tests
│   ├── integration/        # Integration tests
│   │   ├── api/             # API route tests
│   │   ├── database/        # Database operation tests
│   │   └── auth/            # Authentication tests
│   └── e2e/                 # End-to-end tests
│       ├── auth-flow.test.ts
│       ├── component-generation.test.ts
│       └── project-management.test.ts
└── jest.setup.ts           # Jest configuration
```

### Component Testing Patterns
```typescript
// Example: React component testing
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 🚀 Development Workflow Adaptations

### Local Development
```bash
# Setup environment
npm install
cp .env.example .env.local

# Start development server
npm run dev

# Start Supabase locally
npx supabase start

# Run tests in watch mode
npm run test:watch
```

### Code Quality Workflow
```bash
# Before committing
npm run lint              # Fix linting issues
npm run format            # Format code
npm run test              # Run tests
npm run type-check        # Type checking
```

### Database Development
```bash
# Reset database
npx supabase db reset

# Generate types
npx supabase gen types typescript --local > src/types/database.ts

# Run migrations
npx supabase db push
```

## 📦 Dependencies Management

### Package Management
- **package.json**: Production dependencies
- **package-lock.json**: Locked dependency versions
- **next.config.js**: Next.js configuration
- **tailwind.config.js**: Tailwind CSS configuration

### Dependency Updates
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update package-name

# Security audit
npm audit fix
```

## 🔍 Siza WebApp Specific Patterns

### Component Generation Pattern
```typescript
// Standard component generation with AI
export async function generateComponent(
  description: string,
  framework: 'react' | 'vue' | 'angular',
  style: 'minimal' | 'modern' | 'classic'
): Promise<string> {
  const prompt = createPrompt(description, framework, style);
  const response = await callAIProvider(prompt);
  return validateAndFormatComponent(response, framework);
}
```

### Database Query Pattern
```typescript
// Standard Supabase query pattern
export async function getProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
```

### Authentication Pattern
```typescript
// Standard authentication pattern
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}
```

## 🎯 Project-Specific Success Criteria

### Code Quality
- ✅ **ESLint**: 0 errors, 0 warnings
- ✅ **TypeScript**: 0 type errors
- ✅ **Prettier**: Properly formatted
- ✅ **npm audit**: No high/critical vulnerabilities

### Test Coverage
- ✅ **Jest**: ≥80% coverage for unit tests
- ✅ **Playwright**: 100% coverage for critical user flows
- ✅ **Component Tests**: All UI components tested
- ✅ **API Tests**: All API routes tested

### Performance
- ✅ **Build Time**: <2 minutes for production build
- ✅ **Bundle Size**: Optimized for production
- ✅ **Page Load**: <3 seconds for initial load
- ✅ **Interaction**: <100ms for UI interactions

## 🔗 References

### Shared Rules
- **[Agent Rules](../../../forge-patterns/docs/shared-rules/agent-rules.md)** - Core conduct
- **[Testing Standards](../../../forge-patterns/docs/shared-rules/quality-standards/testing.md)** - Base testing principles
- **[Quality Standards](../../../forge-patterns/docs/shared-rules/quality-standards/README.md)** - Quality requirements

### Next.js Documentation
- **[Next.js Docs](https://nextjs.org/docs)** - Framework documentation
- **[React Docs](https://react.dev/)** - React library documentation
- **[Tailwind CSS Docs](https://tailwindcss.com/docs)** - Styling framework

### Supabase Documentation
- **[Supabase Docs](https://supabase.com/docs)** - Database and auth platform
- **[Supabase Auth](https://supabase.com/docs/guides/auth)** - Authentication guide
- **[Supabase Realtime](https://supabase.com/docs/guides/realtime)** - Real-time subscriptions

---

*These project-specific rules adapt the shared Forge Space standards for Siza WebApp's Next.js/React/Supabase implementation while maintaining consistency with the ecosystem-wide standards.*