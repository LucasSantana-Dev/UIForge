import { Page } from '@playwright/test';
import crypto from 'crypto';

/**
 * Sets up an authenticated user session for E2E tests
 * This is a mock implementation - in production, you'd use actual Supabase auth
 */
export async function setupAuthenticatedUser(page: Page): Promise<void> {
  // Navigate to signin page
  await page.goto('/signin');

  // For now, we'll use test credentials with a random password
  // In production, you'd want to use Supabase test helpers
  const testEmail = 'test@siza.dev';
  const testPassword = crypto.randomBytes(16).toString('hex');

  // Fill in credentials
  await page.getByLabel(/email/i).fill(testEmail);
  await page.getByLabel(/password/i).fill(testPassword);

  // Submit form
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard|\/projects/, { timeout: 10000 });
}

/**
 * Cleans up test data after tests
 * This should remove any projects, generations, etc. created during tests
 */
export async function cleanupTestData(): Promise<void> {
  // In production, this would call Supabase to clean up test data
  // For now, this is a placeholder
  // You might want to:
  // 1. Delete all projects created by test user
  // 2. Delete all generations
  // 3. Delete uploaded files from storage
}

/**
 * Creates a test user account
 */
export async function createTestUser(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/signup');

  await page.getByLabel(/email/i).fill(email);
  await page
    .getByLabel(/password/i)
    .first()
    .fill(password);

  // If there's a confirm password field
  const confirmPasswordField = page.getByLabel(/confirm.*password/i);
  if ((await confirmPasswordField.count()) > 0) {
    await confirmPasswordField.fill(password);
  }

  await page.getByRole('button', { name: /sign up|create account/i }).click();

  // Wait for redirect
  await page.waitForURL(/\/dashboard|\/projects/, { timeout: 10000 });
}

/**
 * Signs out the current user
 */
export async function signOut(page: Page): Promise<void> {
  // Click user menu
  const userMenuButton = page
    .locator('button[aria-label*="user"]')
    .or(page.locator('button').filter({ has: page.locator('img[alt*="avatar"]') }));

  if ((await userMenuButton.count()) > 0) {
    await userMenuButton.click();

    // Click sign out
    await page.getByRole('menuitem', { name: /sign out/i }).click();

    // Wait for redirect to signin
    await page.waitForURL('/signin', { timeout: 5000 });
  }
}
