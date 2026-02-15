import { test as base, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

type TestFixtures = {
  authenticatedPage: Page;
  testUser: { email: string; password: string; id: string };
};

export const test = base.extend<TestFixtures>({
  testUser: async ({}, use) => {
    const uniqueId = crypto.randomUUID();
    const testUser = {
      email: `test-${uniqueId}@example.com`,
      password: 'TestPassword123!',
      id: uniqueId,
    };
    await use(testUser);
  },

  authenticatedPage: async ({ page, testUser }, use: (page: Page) => Promise<void>) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Create test user with admin client
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await adminSupabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
    });

    // Navigate to sign in page and authenticate
    await page.goto('/signin');
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    await use(page);

    // Cleanup: delete test user
    try {
      await adminSupabase.auth.admin.deleteUser(testUser.id);
    } catch (e) {
      console.warn('Failed to cleanup test user:', e);
    }
  },
});

export { expect } from '@playwright/test';
