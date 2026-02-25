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
    const testPassword = crypto.randomBytes(16).toString('hex');
    const testUser = {
      email: `test-${uniqueId}@example.com`,
      password: testPassword,
      id: uniqueId,
    };
    await use(testUser);
  },

  authenticatedPage: async ({ page, testUser }, use: (page: Page) => Promise<void>) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for authenticated E2E tests');
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: createdUser, error: createError } = await adminSupabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
    });

    if (createError || !createdUser.user) {
      throw new Error(`Failed to create test user: ${createError?.message || 'unknown error'}`);
    }

    testUser.id = createdUser.user.id;

    await page.goto('/signin');
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL((url) => !url.pathname.includes('/signin'), { timeout: 15000 });

    await use(page);

    try {
      await adminSupabase.auth.admin.deleteUser(testUser.id);
    } catch (e) {
      console.warn('Failed to cleanup test user:', e);
    }
  },
});

export { expect } from '@playwright/test';
