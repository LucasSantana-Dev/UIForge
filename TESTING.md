# UIForge Testing Guide

## Overview

UIForge uses a comprehensive testing strategy with three layers:

1. **Unit Tests** - Jest + React Testing Library for component logic
2. **E2E Tests** - Playwright for full user flows
3. **Database Tests** - Supabase RLS policy verification

## Running Tests

### All Tests
```bash
npm run test              # Run all unit tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Run E2E tests with UI
npm run test:e2e:debug    # Debug E2E tests
```

### Specific Test Files
```bash
npm run test -- src/__tests__/lib/supabase.test.ts
npm run test:e2e -- e2e/auth.spec.ts
```

## Test Structure

### Unit Tests (`src/__tests__/`)

```
src/__tests__/
├── setup/
│   └── supabase-mock.ts       # Supabase client mocks
├── components/
│   └── auth/
│       ├── SignUpPage.test.tsx
│       └── SignInPage.test.tsx
└── lib/
    └── supabase.test.ts
```

**Example Unit Test:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import SignUpPage from '@/app/(auth)/signup/page';

describe('SignUpPage', () => {
  it('renders the sign up form', () => {
    render(<SignUpPage />);
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
  });
});
```

### E2E Tests (`e2e/`)

```
e2e/
├── fixtures.ts           # Shared test fixtures
└── auth.spec.ts          # Authentication flow tests
```

**Example E2E Test:**
```typescript
import { test, expect } from './fixtures';

test('should sign up new user', async ({ page }) => {
  await page.goto('/signup');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## Testing Best Practices

### 1. Mocking Supabase

For unit tests, always mock Supabase:

```typescript
import { mockSupabaseClient } from '../../setup/supabase-mock';

mockSupabaseClient.auth.signUp.mockResolvedValue({
  data: { user: { id: '123', email: 'test@example.com' } },
  error: null,
});
```

### 2. Test Fixtures

Use Playwright fixtures for authenticated tests:

```typescript
test('authenticated feature', async ({ authenticatedPage }) => {
  // authenticatedPage is already logged in
  await authenticatedPage.goto('/dashboard');
});
```

### 3. Environment Variables

Required for E2E tests:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For test user creation
```

### 4. Test Isolation

- Each E2E test creates a unique test user
- Cleanup happens automatically after tests
- Use `beforeEach` to reset state in unit tests

## Coverage Goals

Maintain minimum coverage thresholds:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## CI/CD Integration

Tests run automatically on:
- Every pull request
- Every push to `main`
- Manual workflow dispatch

See `.github/workflows/ci.yml` for configuration.

## Debugging Tests

### Unit Tests
```bash
# Run specific test file
npm run test -- SignUpPage.test.tsx

# Run tests matching pattern
npm run test -- --testNamePattern="sign up"

# Update snapshots
npm run test -- -u
```

### E2E Tests
```bash
# Run with UI
npm run test:e2e:ui

# Debug mode (step through)
npm run test:e2e:debug

# Run specific test
npm run test:e2e -- --grep="sign up"

# Generate trace
npm run test:e2e -- --trace on
```

## Common Issues

### Issue: "Cannot find module '@/lib/supabase/client'"
**Solution**: Check `jest.config.js` has correct path mappings

### Issue: "window is not defined"
**Solution**: Add mock in `jest.setup.js`:
```javascript
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});
```

### Issue: E2E tests timeout
**Solution**: Increase timeout in `playwright.config.ts`:
```typescript
use: {
  actionTimeout: 10000,
  navigationTimeout: 30000,
}
```

## Writing New Tests

### 1. Component Tests
```typescript
// src/__tests__/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### 2. E2E Tests
```typescript
// e2e/my-feature.spec.ts
import { test, expect } from './fixtures';

test.describe('My Feature', () => {
  test('completes user flow', async ({ page }) => {
    await page.goto('/my-feature');
    // Test steps...
  });
});
```

### 3. Database Tests
```typescript
// Test RLS policies
test('user can only see own data', async ({ authenticatedPage, testUser }) => {
  const supabase = createClient(/* ... */);
  const { data } = await supabase.from('my_table').select('*');
  expect(data.every(row => row.user_id === testUser.id)).toBe(true);
});
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/local-development/testing)
