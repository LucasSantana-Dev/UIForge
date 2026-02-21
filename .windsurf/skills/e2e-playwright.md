---
description: Run and write E2E tests with Playwright. Use when adding or changing E2E flows, or verifying web UI.
---

# E2E Testing: Playwright

## When to use

- Writing new E2E tests for user flows
- Debugging failing Playwright tests
- Verifying auth flows, generation, or template instantiation
- Adding test coverage for new pages or features

## Key directories

- `apps/web/e2e/` — Playwright test files
- `apps/web/e2e/fixtures.ts` — Shared test fixtures (auth state, test users)
- `apps/web/playwright.config.ts` — Playwright configuration

## Commands

```bash
npm run test:e2e        # Run all E2E tests (headless)
npm run test:e2e:ui     # Playwright UI mode (interactive)
npx playwright test --headed          # Run with browser visible
npx playwright test auth.spec.ts      # Run specific file
npx playwright test --debug           # Debug mode
npx playwright codegen localhost:3000 # Record new test
```

## Critical flows to test

1. **Auth**: sign up → email verify → sign in → sign out
2. **OAuth**: Google sign in, GitHub sign in
3. **Generation**: enter prompt → select framework → generate → view code in Monaco
4. **Templates**: browse → preview → instantiate → edit
5. **Projects**: create → rename → delete
6. **BYOK**: add API key → verify encryption → use for generation

## Test pattern

```ts
import { test, expect } from '@playwright/test';

test('user can generate a component', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('textbox', { name: /describe/i }).fill('A blue button');
  await page.getByRole('button', { name: /generate/i }).click();
  await expect(page.getByTestId('monaco-editor')).toBeVisible({ timeout: 15000 });
});
```

## Auth fixtures

Use pre-authenticated state from `fixtures.ts` to avoid re-logging in every test:

```ts
import { test } from './fixtures';

test('dashboard loads for authenticated user', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  await expect(authenticatedPage.getByText('My Projects')).toBeVisible();
});
```

## Browsers

Configured in `playwright.config.ts`: Chromium, Firefox, Safari (WebKit).

## CI integration

Playwright runs in GitHub Actions on every PR. Screenshots and traces saved as artifacts on failure.

## MCP tools for reference

- **Context7**: Playwright docs, locator API, assertions
