import { test, expect } from './fixtures';
import { test as baseTest, expect as baseExpect } from '@playwright/test';

baseTest.describe('Pricing Page (public)', () => {
  baseTest('should display all plan tiers', async ({ page }) => {
    await page.goto('/pricing');

    await baseExpect(page.getByText('Free for individuals, paid for scale')).toBeVisible();

    await baseExpect(page.getByText('Free')).toBeVisible();
    await baseExpect(page.getByText('Pro')).toBeVisible();
    await baseExpect(page.getByText('Team')).toBeVisible();
    await baseExpect(page.getByText('Enterprise')).toBeVisible();
  });

  baseTest('should display plan prices', async ({ page }) => {
    await page.goto('/pricing');

    await baseExpect(page.getByText('$0')).toBeVisible();
    await baseExpect(page.getByText('$19')).toBeVisible();
    await baseExpect(page.getByText('$49')).toBeVisible();
  });

  baseTest('should display plan features', async ({ page }) => {
    await page.goto('/pricing');

    await baseExpect(page.getByText('10 AI generations per month')).toBeVisible();
    await baseExpect(page.getByText('500 AI generations per month')).toBeVisible();
    await baseExpect(page.getByText('2,500 AI generations per month')).toBeVisible();
  });

  baseTest('should navigate to signin for unauthenticated subscribe', async ({ page }) => {
    await page.goto('/pricing');

    const proButton = page
      .locator('button')
      .filter({ hasText: /subscribe|get started|upgrade/i })
      .first();

    if ((await proButton.count()) > 0) {
      await proButton.click();
      await baseExpect(page).toHaveURL(/\/signin/, { timeout: 5000 });
    }
  });
});

test.describe('Billing Page (authenticated)', () => {
  test('should display billing page with current plan', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/billing');

    await expect(authenticatedPage.getByRole('heading', { name: 'Billing' })).toBeVisible();
    await expect(authenticatedPage.getByText('Current plan')).toBeVisible();
    await expect(authenticatedPage.getByText('Usage this month')).toBeVisible();
    await expect(authenticatedPage.getByText('Plan features')).toBeVisible();
  });

  test('should show free plan for new users', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/billing');

    await expect(authenticatedPage.getByText(/free/i)).toBeVisible();
    await expect(authenticatedPage.getByRole('link', { name: /upgrade/i })).toBeVisible();
  });

  test('should show usage charts', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/billing');

    await expect(authenticatedPage.getByText('AI Generations')).toBeVisible();
    await expect(authenticatedPage.getByText('Projects')).toBeVisible();
  });

  test('should link to pricing page from upgrade button', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/billing');

    const upgradeLink = authenticatedPage.getByRole('link', {
      name: /upgrade/i,
    });
    if ((await upgradeLink.count()) > 0) {
      await upgradeLink.click();
      await expect(authenticatedPage).toHaveURL(/\/pricing/);
    }
  });
});

baseTest.describe('Billing Success Page', () => {
  baseTest('should display success message', async ({ page }) => {
    await page.goto('/billing/success');

    await baseExpect(page.getByText('Welcome to Pro!')).toBeVisible();
    await baseExpect(page.getByRole('link', { name: /go to dashboard/i })).toBeVisible();
    await baseExpect(page.getByRole('link', { name: /view billing/i })).toBeVisible();
  });
});

baseTest.describe('Billing Auth Guard', () => {
  baseTest('should redirect unauthenticated users from billing', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/billing');

    await baseExpect(page).toHaveURL(/\/signin/, { timeout: 10000 });
  });
});
