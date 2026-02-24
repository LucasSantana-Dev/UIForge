# Siza Test Suite

## Directory Structure

```
src/__tests__/
├── README.md                    # This file
├── setup/
│   └── supabase-mock.ts        # Supabase client mocking utilities
├── components/
│   └── auth/
│       ├── SignUpPage.test.tsx # Sign up page component tests
│       └── SignInPage.test.tsx # Sign in page component tests
└── lib/
    └── supabase.test.ts        # Supabase client integration tests
```

## Testing Patterns

### 1. Mocking Supabase Client

All component tests use the centralized Supabase mock from `setup/supabase-mock.ts`:

```typescript
import { mockSupabaseClient, resetSupabaseMocks } from '../../setup/supabase-mock';

describe('MyComponent', () => {
  beforeEach(() => {
    resetSupabaseMocks(); // Clear all mock calls
  });

  it('handles auth action', async () => {
    // Configure mock response
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    });

    // Test component...
  });
});
```

### 2. Testing Async Form Submissions

Use `waitFor` from React Testing Library for async operations:

```typescript
it('submits form successfully', async () => {
  render(<MyForm />);
  
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'test@example.com' }
  });
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));

  // Wait for async operation
  await waitFor(() => {
    expect(mockSupabaseClient.auth.signUp).toHaveBeenCalled();
  });

  // Assert on result
  await waitFor(() => {
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

### 3. Testing Error States

Mock error responses to test error handling:

```typescript
it('displays error message', async () => {
  mockSupabaseClient.auth.signUp.mockResolvedValue({
    data: { user: null },
    error: { message: 'Email already exists' },
  });

  render(<SignUpForm />);
  // Fill form and submit...

  await waitFor(() => {
    expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
  });
});
```

### 4. Testing Loading States

Use mock implementations with delays:

```typescript
it('shows loading indicator', async () => {
  mockSupabaseClient.auth.signUp.mockImplementation(
    () => new Promise(resolve => setTimeout(resolve, 100))
  );

  render(<SignUpForm />);
  // Fill form and submit...

  // Check loading state
  expect(screen.getByRole('button')).toBeDisabled();
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
```

### 5. Mocking Next.js Router

Router is globally mocked in `jest.setup.js`. Override for specific tests:

```typescript
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe('MyComponent', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockRefresh.mockClear();
  });

  it('redirects after success', async () => {
    // ... perform action
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
```

## Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- SignUpPage.test.tsx

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run tests matching pattern
npm run test -- --testNamePattern="sign up"
```

## Common Patterns

### Finding Elements

```typescript
// By role (preferred)
screen.getByRole('button', { name: /submit/i })
screen.getByRole('heading', { name: /title/i })

// By label
screen.getByLabelText(/email/i)

// By text
screen.getByText(/welcome/i)

// Query variants
screen.queryByText(/optional/i)  // Returns null if not found
screen.findByText(/async/i)      // Returns promise, waits for element
```

### User Interactions

```typescript
// Change input
fireEvent.change(input, { target: { value: 'new value' } })

// Click button
fireEvent.click(button)

// Submit form
fireEvent.submit(form)
```

### Assertions

```typescript
// Element presence
expect(element).toBeInTheDocument()
expect(element).not.toBeInTheDocument()

// Element state
expect(button).toBeDisabled()
expect(button).toBeEnabled()

// Text content
expect(element).toHaveTextContent('text')

// Attributes
expect(link).toHaveAttribute('href', '/path')

// Mock calls
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledWith(arg1, arg2)
expect(mockFn).toHaveBeenCalledTimes(2)
```

## Best Practices

1. **Reset mocks between tests** - Use `beforeEach` to clear mock state
2. **Use semantic queries** - Prefer `getByRole` over `getByTestId`
3. **Test user behavior** - Focus on what users see and do, not implementation
4. **Avoid implementation details** - Don't test internal state or methods
5. **Use waitFor for async** - Always wait for async operations to complete
6. **Keep tests isolated** - Each test should be independent
7. **Mock external dependencies** - Mock Supabase, APIs, and browser APIs
8. **Test error cases** - Don't just test the happy path

## Troubleshooting

### "Cannot find module '@/lib/supabase/client'"
Check `jest.config.js` has correct `moduleNameMapper`:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

### "window is not defined"
Add mock in `jest.setup.js` (already configured)

### Tests timeout
Increase timeout or check for missing `await`:
```typescript
it('test', async () => {
  // Always await async operations
  await waitFor(() => {
    expect(something).toBeTruthy();
  });
}, 10000); // Optional: increase timeout to 10s
```

### Mock not working
Ensure mock is imported before component:
```typescript
import { mockSupabaseClient } from '../../setup/supabase-mock'; // First
import MyComponent from '@/components/MyComponent';              // Then
```
