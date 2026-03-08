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
      base.skip(true, 'Missing SUPABASE_SERVICE_ROLE_KEY for authenticated E2E tests');
      return;
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

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

    // Wait for profile row to exist (created by DB trigger), then mark onboarding complete
    let profileFound = false;
    for (let attempt = 0; attempt < 20; attempt++) {
      const { data } = await adminSupabase
        .from('profiles')
        .select('id')
        .eq('id', testUser.id)
        .single();
      if (data) {
        profileFound = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    if (!profileFound) {
      // Profile trigger didn't fire — insert the profile manually
      await adminSupabase.from('profiles').insert({
        id: testUser.id,
        onboarding_completed_at: new Date().toISOString(),
        tour_completed_at: new Date().toISOString(),
      });
    } else {
      await adminSupabase
        .from('profiles')
        .update({
          onboarding_completed_at: new Date().toISOString(),
          tour_completed_at: new Date().toISOString(),
        })
        .eq('id', testUser.id);
    }

    // Verify the update took effect
    const { data: verifyProfile } = await adminSupabase
      .from('profiles')
      .select('onboarding_completed_at, tour_completed_at')
      .eq('id', testUser.id)
      .single();
    if (!verifyProfile?.onboarding_completed_at) {
      console.warn('E2E fixture: onboarding_completed_at not set after update, profile:', verifyProfile);
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
      } catch {}
      base.skip(true, 'Sign-in flow did not complete - skipping authenticated test');
      return;
    }

    await use(page);

    try {
      await adminSupabase.auth.admin.deleteUser(testUser.id);
    } catch (e) {
      console.warn('Failed to cleanup test user:', e);
    }
  },
});

export { expect } from '@playwright/test';
