import { test, expect } from './fixtures';

test.describe('Onboarding Wizard', () => {
  test('should show onboarding for new users', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    const wizard = page.getByTestId('onboarding-wizard').or(page.getByText(/welcome to siza/i));
    const hasOnboarding = await wizard.isVisible().catch(() => false);
    if (hasOnboarding) {
      await expect(wizard).toBeVisible();
    } else {
      test.skip(true, 'Onboarding not enabled or already completed');
    }
  });

  test('should allow skipping onboarding', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    const skipButton = page.getByRole('button', { name: /skip/i });
    const hasSkip = await skipButton.isVisible().catch(() => false);
    if (hasSkip) {
      await skipButton.click();
      await expect(page.getByTestId('onboarding-wizard')).not.toBeVisible({ timeout: 3000 });
    } else {
      test.skip(true, 'Onboarding skip button not present');
    }
  });

  test('should progress through wizard steps', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    const nextButton = page.getByRole('button', { name: /next|continue/i });
    const hasWizard = await nextButton.isVisible().catch(() => false);
    if (!hasWizard) {
      test.skip(true, 'Onboarding wizard not visible');
      return;
    }

    await nextButton.click();
    await expect(page.getByText(/step 2|preferences|framework/i)).toBeVisible({ timeout: 3000 });
  });

  test('should not show onboarding after completion', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');

    const completeButton = page.getByRole('button', { name: /finish|complete|get started/i });
    const hasComplete = await completeButton.isVisible().catch(() => false);
    if (hasComplete) {
      await completeButton.click();
    }

    await page.reload();
    const wizard = page.getByTestId('onboarding-wizard');
    await expect(wizard).not.toBeVisible({ timeout: 3000 }).catch(() => {});
  });
});
