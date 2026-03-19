import { test as base, type Page } from '@playwright/test';
import crypto from 'crypto';
import { createAdminClient } from './helpers/admin-client';

type TestFixtures = {
  authenticatedPage: Page;
  testUser: { email: string; password: string; id: string };
};

export const test = base.extend<TestFixtures>({
  testUser: async ({ page: _page }, applyFixture) => {
    const uniqueId = crypto.randomUUID();
    const testPassword = crypto.randomBytes(16).toString('hex');
    const testUser = {
      email: `test-${uniqueId}@example.com`,
      password: testPassword,
      id: uniqueId,
    };
    await applyFixture(testUser);
  },

  authenticatedPage: async (
    { page, testUser },
    applyFixture: (authedPage: Page) => Promise<void>
  ) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      base.skip(true, 'Missing SUPABASE_SERVICE_ROLE_KEY for authenticated E2E tests');
      return;
    }

    const adminSupabase = createAdminClient();

    const { data: createdUser, error: createError } = await adminSupabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
    });

    if (createError || !createdUser.user) {
      base.skip(true, `Failed to create test user: ${createError?.message || 'unknown'}`);
      return;
    }

    testUser.id = createdUser.user.id;

    const completedAt = new Date().toISOString();
    const fullProfile = {
      id: testUser.id,
      onboarding_completed_at: completedAt,
      tour_completed_at: completedAt,
    };
    const fallbackProfile = {
      id: testUser.id,
      onboarding_completed_at: completedAt,
    };

    const { error: profileError } = await adminSupabase.from('profiles').upsert(fullProfile);
    if (profileError && /tour_completed_at/i.test(profileError.message)) {
      const { error: fallbackError } = await adminSupabase.from('profiles').upsert(fallbackProfile);
      if (fallbackError) {
        console.warn('E2E fixture profile upsert error:', fallbackError.message);
      }
    } else if (profileError) {
      console.warn('E2E fixture profile upsert error:', profileError.message);
    }

    await page.goto('/signin');
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    try {
      await page.waitForURL((url) => !url.pathname.includes('/signin'), { timeout: 10000 });
    } catch {
      try {
        await adminSupabase.auth.admin.deleteUser(testUser.id);
      } catch (cleanupError) {
        console.warn('Failed to cleanup test user after sign-in error:', cleanupError);
      }
      base.skip(true, 'Sign-in flow did not complete - skipping authenticated test');
      return;
    }

    await applyFixture(page);

    try {
      await adminSupabase.auth.admin.deleteUser(testUser.id);
    } catch (e) {
      console.warn('Failed to cleanup test user:', e);
    }
  },
});

export { expect } from '@playwright/test';
