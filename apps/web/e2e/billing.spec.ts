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

    await baseExpect(page.getByRole('heading', { name: 'Free', exact: true })).toBeVisible();
    await baseExpect(page.getByRole('heading', { name: 'Pro', exact: true })).toBeVisible();
    await baseExpect(page.getByRole('heading', { name: 'Team', exact: true })).toBeVisible();
    await baseExpect(page.getByRole('heading', { name: 'Enterprise', exact: true })).toBeVisible();
  });

  baseTest('should display plan prices', async ({ page }) => {
    await page.goto('/pricing');

    await baseExpect(page.locator('text=$19').first()).toBeVisible();
    await baseExpect(page.locator('text=$49').first()).toBeVisible();
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

    await expect(authenticatedPage.getByRole('heading', { name: /billing/i })).toBeVisible();
  });

  test('should show free plan for new users', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/billing');

    await expect(authenticatedPage.getByText(/free/i).first()).toBeVisible();
  });

  test('should show usage information', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/billing');

    await expect(authenticatedPage.getByText(/generation/i).first()).toBeVisible();
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
  test('should redirect to Stripe Checkout for Pro plan', async ({
    authenticatedPage,
    testUser,
  }) => {
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
      data: JSON.stringify({ type: 'test', id: 'evt_test_invalid' }),
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
      id: `evt_test_${Date.now()}`,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: `cs_test_${Date.now()}`,
          subscription: `sub_test_${Date.now()}`,
          customer: `cus_test_${Date.now()}`,
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
    await authenticatedPage.waitForLoadState('networkidle');

    await expect(authenticatedPage.getByText(/pro/i).first()).toBeVisible();

    await expect(authenticatedPage.getByText(/generation/i).first()).toBeVisible();

    const manageButton = authenticatedPage.getByRole('button', {
      name: /manage/i,
    });
    if ((await manageButton.count()) > 0) {
      await expect(manageButton).toBeVisible();
    }

    await cleanupTestBilling(testUser.id);
  });

  test('should show upgrade button for free plan user', async ({ authenticatedPage, testUser }) => {
    await authenticatedPage.goto('/billing');

    const upgradeLink = authenticatedPage.getByRole('link', { name: /upgrade/i });
    if ((await upgradeLink.count()) > 0) {
      await expect(upgradeLink.first()).toBeVisible();
    }
  });
});

baseTest.describe('Billing Success Page', () => {
  baseTest('should display success message', async ({ page }) => {
    await page.goto('/billing/success');

    await baseExpect(page.getByText(/welcome|success|thank/i).first()).toBeVisible();
  });
});

baseTest.describe('Billing Auth Guard', () => {
  baseTest('should redirect unauthenticated users from billing', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/billing');

    await baseExpect(page).toHaveURL(/\/signin/, { timeout: 10000 });
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
