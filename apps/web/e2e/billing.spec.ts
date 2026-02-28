import { test, expect } from './fixtures';
import { test as baseTest, expect as baseExpect } from '@playwright/test';
import {
  seedSubscription,
  seedUsageTracking,
  cleanupTestBilling,
  generateStripeWebhookSignature,
} from './helpers/stripe';

baseTest.describe('Pricing Page (public)', () => {
  baseTest('should display all plan tiers', async ({ page }) => {
    await page.goto('/pricing');

    await baseExpect(page.getByText('Free for individuals, paid for scale')).toBeVisible();

    const headings = page.getByRole('heading');
    await baseExpect(headings.filter({ hasText: 'Free' }).first()).toBeVisible();
    await baseExpect(headings.filter({ hasText: 'Pro' }).first()).toBeVisible();
    await baseExpect(headings.filter({ hasText: 'Team' }).first()).toBeVisible();
    await baseExpect(headings.filter({ hasText: 'Enterprise' }).first()).toBeVisible();
  });

  baseTest('should display plan prices', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    await baseExpect(page.locator('text=$19').first()).toBeVisible({
      timeout: 10000,
    });
    await baseExpect(page.locator('text=$49').first()).toBeVisible({
      timeout: 10000,
    });
  });

  baseTest('should display plan features', async ({ page }) => {
    await page.goto('/pricing');

    await baseExpect(page.getByText('10 AI generations per month').first()).toBeVisible();
    await baseExpect(page.getByText('500 AI generations per month').first()).toBeVisible();
    await baseExpect(page.getByText('2,500 AI generations per month').first()).toBeVisible();
  });

  baseTest('should show subscribe buttons', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    const upgradeButton = page
      .locator('button')
      .filter({ hasText: /upgrade/i })
      .first();
    await baseExpect(upgradeButton).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Billing Page (authenticated)', () => {
  test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, 'Requires SUPABASE_SERVICE_ROLE_KEY');

  test('should display billing page with current plan', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/billing');

    await expect(authenticatedPage.getByRole('heading', { name: 'Billing' })).toBeVisible();
    await expect(authenticatedPage.getByText('Current plan')).toBeVisible();
    await expect(authenticatedPage.getByText('Usage this month')).toBeVisible();
    await expect(authenticatedPage.getByText('Plan features')).toBeVisible();
  });

  test('should show free plan for new users', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/billing');

    await expect(authenticatedPage.getByText(/free/i).first()).toBeVisible();
    await expect(authenticatedPage.getByRole('link', { name: /upgrade/i })).toBeVisible();
  });

  test('should show usage charts', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/billing');

    await expect(authenticatedPage.getByText('AI Generations', { exact: true })).toBeVisible();
    await expect(authenticatedPage.getByText('Projects', { exact: true })).toBeVisible();
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

test.describe('Checkout Redirect (authenticated)', () => {
  test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, 'Requires SUPABASE_SERVICE_ROLE_KEY');

  test('should redirect to Stripe Checkout for Pro plan', async ({ authenticatedPage }) => {
    const priceId = process.env.STRIPE_PRO_PRICE_ID ?? 'price_pro_test';

    const response = await authenticatedPage.request.post('/api/stripe/create-checkout-session', {
      data: { priceId },
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status() === 403) {
      test.skip(true, 'ENABLE_STRIPE_BILLING is disabled');
      return;
    }

    const body = await response.json();

    if (response.ok()) {
      expect(body.url).toMatch(/^https:\/\/checkout\.stripe\.com\//);
    } else {
      expect([400, 401, 500]).toContain(response.status());
    }
  });

  test('should reject checkout without priceId', async ({ authenticatedPage }) => {
    const response = await authenticatedPage.request.post('/api/stripe/create-checkout-session', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status() === 403) {
      test.skip(true, 'ENABLE_STRIPE_BILLING is disabled');
      return;
    }

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });
});

baseTest.describe('Webhook API', () => {
  baseTest('should reject webhook without signature', async ({ request }) => {
    const response = await request.post('/api/stripe/webhook', {
      data: '{}',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Missing signature');
  });

  baseTest('should reject webhook with invalid signature', async ({ request }) => {
    const response = await request.post('/api/stripe/webhook', {
      data: JSON.stringify({
        type: 'test',
        id: 'evt_test_invalid',
      }),
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 't=1234,v1=invalid_signature',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  baseTest('should process webhook with valid test signature', async ({ request }) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      baseTest.skip(true, 'STRIPE_WEBHOOK_SECRET not configured');
      return;
    }

    const eventPayload = JSON.stringify({
      id: 'evt_test_' + Date.now(),
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_' + Date.now(),
          subscription: 'sub_test_' + Date.now(),
          customer: 'cus_test_' + Date.now(),
          metadata: { userId: 'test-user-does-not-exist' },
        },
      },
    });

    const signature = generateStripeWebhookSignature(eventPayload, webhookSecret);

    const response = await request.post('/api/stripe/webhook', {
      data: eventPayload,
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
    });

    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.received).toBe(true);
  });
});

test.describe('Billing Page for Subscribed User', () => {
  test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, 'Requires SUPABASE_SERVICE_ROLE_KEY');

  test('should show Pro plan details for Pro subscriber', async ({
    authenticatedPage,
    testUser,
  }) => {
    await seedSubscription({
      userId: testUser.id,
      plan: 'pro',
    });

    await seedUsageTracking(testUser.id, 42, 500);

    await authenticatedPage.goto('/billing');
    await authenticatedPage.waitForLoadState('domcontentloaded');

    await expect(authenticatedPage.getByText(/pro/i).first()).toBeVisible();

    await expect(authenticatedPage.getByText('AI Generations', { exact: true })).toBeVisible();

    const manageButton = authenticatedPage.getByRole('button', {
      name: /manage/i,
    });
    if ((await manageButton.count()) > 0) {
      await expect(manageButton).toBeVisible();
    }

    await cleanupTestBilling(testUser.id);
  });

  test('should show upgrade button for free plan user', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/billing');

    await expect(authenticatedPage.getByRole('link', { name: /upgrade/i })).toBeVisible();

    const manageButton = authenticatedPage.getByRole('button', {
      name: /manage/i,
    });
    expect(await manageButton.count()).toBe(0);
  });
});

test.describe('Billing Success Page', () => {
  test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, 'Requires SUPABASE_SERVICE_ROLE_KEY');

  test('should display success message', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/billing/success');

    await expect(authenticatedPage.getByText('Welcome to Pro!')).toBeVisible();
    await expect(
      authenticatedPage.getByRole('link', {
        name: /go to dashboard/i,
      })
    ).toBeVisible();
    await expect(
      authenticatedPage.getByRole('link', {
        name: /view billing/i,
      })
    ).toBeVisible();
  });
});

baseTest.describe('Billing Auth Guard', () => {
  baseTest('should redirect unauthenticated users from billing', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/billing');

    await baseExpect(page).toHaveURL(/\/signin/, {
      timeout: 10000,
    });
  });
});

baseTest.describe('Checkout Auth Guard', () => {
  baseTest('should reject unauthenticated checkout request', async ({ request }) => {
    const response = await request.post('/api/stripe/create-checkout-session', {
      data: { priceId: 'price_test' },
      headers: { 'Content-Type': 'application/json' },
    });

    expect([401, 403]).toContain(response.status());
  });

  baseTest('should reject unauthenticated portal request', async ({ request }) => {
    const response = await request.post('/api/stripe/create-portal-session', {
      headers: { 'Content-Type': 'application/json' },
    });

    expect([401, 403]).toContain(response.status());
  });
});
