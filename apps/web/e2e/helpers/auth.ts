import { Page } from '@playwright/test';
import crypto from 'crypto';
import { createAdminClient } from './admin-client';

export async function setupAuthenticatedUser(page: Page): Promise<{
  email: string;
  password: string;
  id: string;
}> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for authenticated E2E tests');
  }

  const adminSupabase = createAdminClient();
  const uniqueId = crypto.randomUUID();
  const testEmail = `test-${uniqueId}@example.com`;
  const testPassword = crypto.randomBytes(16).toString('hex');

  const { data: createdUser, error: createError } = await adminSupabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  });

  if (createError || !createdUser.user) {
    throw new Error(`Failed to create test user: ${createError?.message || 'unknown'}`);
  }

  let signInError: string | null = null;
  let signedIn = false;

  for (let attempt = 0; attempt < 2; attempt++) {
    await page.goto('/signin');
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/password/i).fill(testPassword);

    const navigationPromise = page.waitForURL(
      (url) => !url.pathname.includes('/signin') && !url.pathname.includes('/auth/callback'),
      { timeout: 20000 }
    );

    await page.getByRole('button', { name: /sign in/i }).click();

    try {
      await navigationPromise;
      signedIn = true;
      break;
    } catch {
      signInError = await page
        .locator('.text-destructive')
        .first()
        .textContent()
        .catch(() => null);
      if (!page.url().includes('/signin?')) {
        break;
      }
    }
  }

  if (!signedIn) {
    throw new Error(
      `Failed to sign in disposable user: ${signInError?.trim() || 'Unknown sign-in failure'}`
    );
  }

  const completedAt = new Date().toISOString();
  const fullProfile = {
    id: createdUser.user.id,
    onboarding_completed_at: completedAt,
    tour_completed_at: completedAt,
  };
  const fallbackProfile = {
    id: createdUser.user.id,
    onboarding_completed_at: completedAt,
  };

  const { error: profileError } = await adminSupabase.from('profiles').upsert(fullProfile);
  if (profileError && /tour_completed_at/i.test(profileError.message)) {
    const { error: fallbackError } = await adminSupabase.from('profiles').upsert(fallbackProfile);
    if (fallbackError) {
      throw new Error(`Failed to prepare profile for test user: ${fallbackError.message}`);
    }
  } else if (profileError) {
    throw new Error(`Failed to prepare profile for test user: ${profileError.message}`);
  }

  await page.goto('/projects', { waitUntil: 'domcontentloaded' });

  return { email: testEmail, password: testPassword, id: createdUser.user.id };
}

export async function cleanupTestData(userId?: string): Promise<void> {
  if (!userId) return;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const adminSupabase = createAdminClient();

  try {
    await adminSupabase.from('components').delete().eq('user_id', userId);
    await adminSupabase.from('generations').delete().eq('user_id', userId);
    await adminSupabase.from('projects').delete().eq('user_id', userId);
    await adminSupabase.auth.admin.deleteUser(userId);
  } catch (e) {
    console.warn('Failed to cleanup test user:', e);
  }
}

export async function setUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for role management');
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from('profiles').update({ role }).eq('id', userId);
  if (error) {
    throw new Error(`Failed to set role for ${userId}: ${error.message}`);
  }
}

export async function signOut(page: Page): Promise<void> {
  const userMenuButton = page
    .locator('button[aria-label*="user"]')
    .or(page.locator('button').filter({ has: page.locator('img[alt*="avatar"]') }));

  if ((await userMenuButton.count()) > 0) {
    await userMenuButton.click();
    await page.getByRole('menuitem', { name: /sign out/i }).click();
    await page.waitForURL('/signin', { timeout: 5000 });
  }
}
