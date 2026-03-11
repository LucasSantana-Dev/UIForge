import { test, expect } from './fixtures';
import { createReactProject, fillGenerationForm } from './helpers/generation';

const liveProviderEnabled = process.env.E2E_LIVE_PROVIDER === 'true';
const liveGeminiKey = process.env.GEMINI_API_KEY;
const liveAnthropicKey = process.env.ANTHROPIC_API_KEY;

type LiveProvider = 'google' | 'anthropic';

type LiveProviderConfig = {
  provider: LiveProvider;
  apiKey: string;
  cardName: RegExp;
  providerButton: RegExp;
};

function getLiveProviderConfig(provider: LiveProvider, apiKey: string): LiveProviderConfig {
  if (provider === 'anthropic') {
    return {
      provider,
      apiKey,
      cardName: /anthropic/i,
      providerButton: /anthropic/i,
    };
  }

  return {
    provider,
    apiKey,
    cardName: /google (ai|gemini)/i,
    providerButton: /google (gemini|ai)/i,
  };
}

async function preflightGeminiKey(apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'smoke-preflight' }] }],
      }),
    }
  );

  if (response.ok) {
    return { usable: true, quotaLimited: false, message: '' };
  }

  let message = `${response.status} ${response.statusText}`;
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    if (body.error?.message) message = body.error.message;
  } catch (parseError) {
    void parseError;
  }

  const quotaLimited =
    response.status === 429 ||
    /(quota|rate\s*limit|resource_exhausted|too many requests)/i.test(message);

  return { usable: false, quotaLimited, message };
}

async function pickLiveProvider() {
  if (liveGeminiKey) {
    const preflight = await preflightGeminiKey(liveGeminiKey);
    if (preflight.usable) {
      return {
        config: getLiveProviderConfig('google', liveGeminiKey),
        skipReason: '',
      };
    }

    if (!preflight.quotaLimited) {
      throw new Error(`GEMINI_API_KEY preflight failed: ${preflight.message}`);
    }

    if (liveAnthropicKey) {
      return {
        config: getLiveProviderConfig('anthropic', liveAnthropicKey),
        skipReason: '',
      };
    }

    return {
      config: null,
      skipReason: `Gemini quota exhausted: ${preflight.message}`,
    };
  }

  if (liveAnthropicKey) {
    return {
      config: getLiveProviderConfig('anthropic', liveAnthropicKey),
      skipReason: '',
    };
  }

  return {
    config: null,
    skipReason: 'Missing GEMINI_API_KEY and ANTHROPIC_API_KEY.',
  };
}

function providerCard(page: import('@playwright/test').Page, config: LiveProviderConfig) {
  return page
    .locator('div')
    .filter({ hasText: config.cardName })
    .filter({ has: page.getByRole('button', { name: /^edit$/i }) })
    .first();
}

async function addProviderKey(page: import('@playwright/test').Page, config: LiveProviderConfig) {
  await page.getByRole('button', { name: /add api key/i }).click();
  const addDialog = page.getByRole('dialog');
  await addDialog.getByRole('button', { name: config.providerButton }).click();
  await addDialog.getByLabel(/api key/i).fill(config.apiKey);
  await addDialog
    .locator('form')
    .first()
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(addDialog).not.toBeVisible({ timeout: 10000 });
}

async function ensureByokConfigured(
  page: import('@playwright/test').Page,
  config: LiveProviderConfig
) {
  await page.goto('/settings');
  await page.getByRole('button', { name: /ai keys/i }).click();
  await expect(page.getByRole('heading', { name: /^api keys$/i })).toBeVisible();

  let keyCard = providerCard(page, config);
  if ((await keyCard.count()) === 0) {
    await addProviderKey(page, config);
    keyCard = providerCard(page, config);
  }
  await expect(keyCard).toBeVisible();

  const setDefaultButton = keyCard.getByRole('button', { name: /^set default$/i });
  if ((await setDefaultButton.count()) > 0) {
    await setDefaultButton.scrollIntoViewIfNeeded();
    await setDefaultButton.click();
  }

  await expect(keyCard.getByText(/^default$/i).first()).toBeVisible({ timeout: 10000 });
}

test.describe('Component Generation (live provider smoke)', () => {
  test.skip(!liveProviderEnabled, 'Set E2E_LIVE_PROVIDER=true to run live provider smoke tests');
  test.skip(
    !liveGeminiKey && !liveAnthropicKey,
    'Requires GEMINI_API_KEY or ANTHROPIC_API_KEY for BYOK provider smoke'
  );
  test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, 'Requires SUPABASE_SERVICE_ROLE_KEY');
  test.setTimeout(180000);

  let projectId: string;

  test.beforeEach(async ({ authenticatedPage: page }) => {
    projectId = await createReactProject(page, 'Generation Live Smoke Project');
  });

  test('generates code and renders live preview', async ({ authenticatedPage: page }) => {
    const liveProvider = await pickLiveProvider();
    if (!liveProvider.config) {
      test.skip(true, liveProvider.skipReason);
    }

    const providerConfig = liveProvider.config;
    if (!providerConfig) return;

    await ensureByokConfigured(page, providerConfig);

    await page.goto(`/generate?projectId=${projectId}&framework=react`);
    await fillGenerationForm(
      page,
      'LiveSmokeButton',
      'Create a modern button with hover states and loading state for live smoke validation.'
    );

    const byokToggle = page.getByRole('button', { name: /advanced: use your own key/i });
    if (!(await byokToggle.isVisible())) {
      await page.getByRole('button', { name: /ai provider/i }).click();
    }
    await byokToggle.click();
    await page.getByRole('button', { name: providerConfig.providerButton }).click();

    await page.locator('form button[type="submit"]').click();

    const generationComplete = page.getByText(/generation complete/i);
    const previewFrame = page.locator('iframe[title="Component Preview"]');
    const errorDetails = page.getByText('Error Details');

    await Promise.race([
      generationComplete.waitFor({ timeout: 120000 }),
      errorDetails.waitFor({ timeout: 120000 }),
    ]);

    if (await errorDetails.isVisible()) {
      throw new Error('Live generation returned an error. Check provider capacity and API keys.');
    }

    await page.getByRole('button', { name: /^preview$/i }).click();
    await expect(previewFrame).toBeVisible({ timeout: 30000 });

    const srcDoc = await previewFrame.getAttribute('srcdoc');
    expect(srcDoc).toBeTruthy();
    expect((srcDoc ?? '').length).toBeGreaterThan(500);

    const refreshButton = page.getByRole('button', { name: /refresh preview/i });
    await refreshButton.click();
    await expect(refreshButton).toBeDisabled();
    await expect(refreshButton).toBeEnabled({ timeout: 3000 });
  });
});
