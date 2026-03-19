import { test, expect, type Page } from '@playwright/test';
import {
  cleanupLeadUserByEmail,
  createLeadTestCredentials,
  generateSignupActionLink,
  hasGenerationBackend,
  resolveLeadCallbackUrl,
  waitForSignupConfirmationLink,
} from './helpers/lead-readiness';

async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/signin');
  const emailField = page.getByLabel(/email/i);
  if (await emailField.count()) {
    await emailField.fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
  }
  await page.waitForURL((url) => !url.pathname.includes('/signin'), { timeout: 10000 });
}

async function confirmSignupByActionLink(page: Page, actionLink: string): Promise<void> {
  const response = await page.request.get(actionLink, {
    failOnStatusCode: false,
    maxRedirects: 0,
  });

  const status = response.status();
  if (status < 300 || status > 399) {
    throw new Error(`Unexpected confirmation status: ${status}`);
  }

  const location = response.headers().location;
  if (!location) {
    throw new Error('Missing redirect location after confirmation request');
  }

  await page.goto(location);
  await page.waitForURL((url) => !url.pathname.includes('/auth/callback'), { timeout: 15000 });
}

async function selectReactFramework(page: Page): Promise<void> {
  const frameworkSelect = page.locator('#framework');
  if (await frameworkSelect.count()) {
    await frameworkSelect.selectOption('react');
    return;
  }

  const frameworkCombobox = page.getByRole('combobox').first();
  if (!(await frameworkCombobox.count())) {
    return;
  }

  await frameworkCombobox.click();
  const reactOption = page.getByRole('option', { name: /react/i }).first();
  if (await reactOption.count()) {
    await reactOption.click();
  }
}

async function clickGetStartedIfVisible(page: Page): Promise<boolean> {
  const getStarted = page.getByRole('button', { name: /get started/i });
  if (!(await getStarted.count())) {
    return false;
  }

  await getStarted.first().click();
  await page.waitForTimeout(200);
  return true;
}

async function createOnboardingProjectIfVisible(page: Page): Promise<boolean> {
  const projectName = page.locator('#name');
  const createProject = page.getByRole('button', { name: /create project/i });
  if (!(await projectName.count()) || !(await createProject.count())) {
    return false;
  }

  await projectName.fill('Lead Smoke Project');
  await selectReactFramework(page);
  await createProject.first().click();
  await page.waitForTimeout(400);
  return true;
}

async function skipOnboardingIfStillVisible(page: Page): Promise<void> {
  if (!page.url().includes('/onboarding')) {
    return;
  }

  const skipButton = page.getByRole('button', { name: /skip/i });
  if (await skipButton.count()) {
    await skipButton.first().click();
  }
  await page
    .waitForURL((url) => !url.pathname.includes('/onboarding'), { timeout: 5000 })
    .catch(() => {});
}

async function completeOnboarding(page: Page): Promise<void> {
  if (!page.url().includes('/onboarding')) {
    return;
  }

  for (let step = 0; step < 5 && page.url().includes('/onboarding'); step++) {
    if (await clickGetStartedIfVisible(page)) {
      continue;
    }

    if (await createOnboardingProjectIfVisible(page)) {
      continue;
    }

    break;
  }

  await skipOnboardingIfStillVisible(page);
}

async function dismissTourIfVisible(page: Page): Promise<void> {
  const dismissTourButton = page.getByRole('button', { name: /dismiss tour/i }).first();
  if (!(await dismissTourButton.isVisible().catch(() => false))) {
    return;
  }

  await dismissTourButton.click();
  await expect(dismissTourButton)
    .toBeHidden({ timeout: 5000 })
    .catch(() => {});
}

async function createProjectFromPage(page: Page, projectName: string): Promise<void> {
  await page.waitForLoadState('domcontentloaded');

  const nameInput = page
    .locator('#name')
    .or(page.getByLabel(/project name/i))
    .first();
  await expect(nameInput).toBeVisible({ timeout: 10000 });
  await nameInput.fill(projectName);

  await selectReactFramework(page);

  await page
    .getByRole('button', { name: /create project/i })
    .first()
    .click();
  await page.waitForURL(/\/projects\/[a-f0-9-]+$/, { timeout: 15000 }).catch(() => {});
}

function projectIdFromUrl(url: string): string {
  const match = url.match(/\/projects\/([a-f0-9-]+)/);
  if (!match?.[1]) {
    throw new Error(`Could not extract project id from URL: ${url}`);
  }
  return match[1];
}

test.describe('Lead Readiness', () => {
  test.setTimeout(180000);
  test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL, 'Requires NEXT_PUBLIC_SUPABASE_URL');
  test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, 'Requires SUPABASE_SERVICE_ROLE_KEY');

  let email = '';

  test.afterEach(async () => {
    if (email) {
      await cleanupLeadUserByEmail(email);
    }
  });

  test('paid lead can complete signup-to-product smoke flow', async ({ page }) => {
    if (!hasGenerationBackend()) {
      throw new Error(
        'Generation backend unavailable. Configure MCP_GATEWAY_URL or one server AI API key.'
      );
    }

    const credentials = createLeadTestCredentials();
    email = credentials.email;

    await page.goto('/signup');
    await page.getByLabel(/email/i).fill(credentials.email);
    await page.getByLabel(/password/i).fill(credentials.password);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByRole('heading', { name: /check your email/i })).toBeVisible();

    const callbackUrl = resolveLeadCallbackUrl();
    const actionLink = await waitForSignupConfirmationLink(
      credentials.email,
      20000,
      callbackUrl
    ).catch(() => generateSignupActionLink(credentials.email, credentials.password, callbackUrl));
    await confirmSignupByActionLink(page, actionLink);

    await signIn(page, credentials.email, credentials.password);

    await completeOnboarding(page);

    let projectIdMatch = page.url().match(/\/projects\/([a-f0-9-]+)/);
    if (!projectIdMatch?.[1]) {
      await page.goto('/projects/new');
      await page
        .waitForURL(
          (url) => {
            return url.pathname.includes('/projects/new') || url.pathname.includes('/onboarding');
          },
          { timeout: 10000 }
        )
        .catch(() => {});
      if (page.url().includes('/projects/new')) {
        await page
          .waitForURL((url) => url.pathname.includes('/onboarding'), { timeout: 2000 })
          .catch(() => {});
      }
      if (page.url().includes('/onboarding')) {
        const completeOnboardingResponse = await page.request.post('/api/onboarding/complete');
        expect(completeOnboardingResponse.ok()).toBe(true);
        await page.goto('/projects/new');
      }
      await createProjectFromPage(page, 'Lead Smoke Project');
      projectIdMatch = page.url().match(/\/projects\/([a-f0-9-]+)/);
    }

    const projectId = projectIdMatch?.[1] ?? projectIdFromUrl(page.url());
    await page.goto(`/generate?projectId=${projectId}&framework=react`);
    await page.getByLabel('Component Name').fill('LeadSmokeCard');
    await page
      .getByLabel(/describe your component/i)
      .fill('Create a simple card component with title, description, and call-to-action button.');
    await page.getByRole('button', { name: /^generate$/i }).click();
    const generatingButton = page.getByRole('button', { name: /generating/i });
    await expect(generatingButton).toBeVisible();
    await expect(generatingButton).toBeHidden({ timeout: 30000 });

    const providerIssue = page.getByText(/ai provider issue/i).first();
    if (await providerIssue.isVisible().catch(() => false)) {
      throw new Error(
        'Generation backend unavailable: AI provider issue detected (check server AI key or MCP gateway).'
      );
    }

    await expect(page.getByText(/generation complete/i)).toBeVisible({ timeout: 10000 });
    await dismissTourIfVisible(page);
    await page.getByRole('button', { name: /^code$/i }).click();
    await expect(page.getByRole('button', { name: /copy code/i })).toBeVisible();

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();

    await page.goto('/billing');
    await expect(page.getByRole('heading', { name: /billing/i })).toBeVisible();

    const checkoutResponse = await page.request.post('/api/stripe/create-checkout-session', {
      data: {
        priceId: process.env.STRIPE_PRO_PRICE_ID ?? 'price_pro_test',
      },
      headers: { 'Content-Type': 'application/json' },
    });
    if (checkoutResponse.status() === 403) {
      const body = await checkoutResponse.json();
      expect(body.error).toBe('Billing is not enabled');
      return;
    }

    expect(checkoutResponse.status()).toBe(200);
    const body = await checkoutResponse.json();
    expect(typeof body.url).toBe('string');
    expect(body.url.length).toBeGreaterThan(0);
  });
});
