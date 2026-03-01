import { Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function setupAuthenticatedUser(page: Page): Promise<{
  email: string;
  password: string;
  id: string;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for authenticated E2E tests');
  }

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
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

  await page.goto('/signin');
  await page.getByLabel(/email/i).fill(testEmail);
  await page.getByLabel(/password/i).fill(testPassword);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.includes('/signin'), {
    timeout: 10000,
  });

  return { email: testEmail, password: testPassword, id: createdUser.user.id };
}

export async function cleanupTestData(userId?: string): Promise<void> {
  if (!userId) return;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return;

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    await adminSupabase.from('components').delete().eq('user_id', userId);
    await adminSupabase.from('generations').delete().eq('user_id', userId);
    await adminSupabase.from('projects').delete().eq('user_id', userId);
    await adminSupabase.auth.admin.deleteUser(userId);
  } catch (e) {
    console.warn('Failed to cleanup test user:', e);
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
