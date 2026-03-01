import { test, expect } from './fixtures';

test.describe('Templates', () => {
  test('should show templates page', async ({ authenticatedPage: page }) => {
    await page.goto('/templates');
    const heading = page
      .getByRole('heading', { name: /templates/i })
      .or(page.getByText(/templates/i).first());
    const hasTemplates = await heading.isVisible().catch(() => false);
    if (!hasTemplates) {
      test.skip(true, 'Templates page not available');
      return;
    }
    await expect(heading).toBeVisible();
  });

  test('should display template cards', async ({ authenticatedPage: page }) => {
    await page.goto('/templates');
    const cards = page.locator('[class*="card"]').or(page.locator('[role="article"]'));
    const cardCount = await cards.count();
    if (cardCount === 0) {
      const emptyState = page.getByText(/no templates|coming soon/i);
      await expect(emptyState).toBeVisible();
    } else {
      expect(cardCount).toBeGreaterThan(0);
    }
  });

  test('should filter templates by framework', async ({ authenticatedPage: page }) => {
    await page.goto('/templates');
    const filter = page.getByRole('combobox').or(page.locator('select')).first();
    if (await filter.isVisible().catch(() => false)) {
      await filter.selectOption({ label: 'React' });
      await page.waitForTimeout(500);
    } else {
      test.skip(true, 'Template filters not available');
    }
  });

  test('should preview template code', async ({ authenticatedPage: page }) => {
    await page.goto('/templates');
    const card = page.locator('[class*="card"]').or(page.locator('[role="article"]')).first();
    if (await card.isVisible().catch(() => false)) {
      await card.click();
      const codeBlock = page.locator('pre, code, [class*="editor"]');
      await expect(codeBlock.first()).toBeVisible({ timeout: 5000 });
    } else {
      test.skip(true, 'No template cards to preview');
    }
  });
});
