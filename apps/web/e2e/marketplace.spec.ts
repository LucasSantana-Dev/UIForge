import crypto from 'crypto';
import { test, expect } from './fixtures';
import { createAdminClient } from './helpers/admin-client';

test.describe('Marketplace smoke', () => {
  test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, 'Requires SUPABASE_SERVICE_ROLE_KEY');

  test('templates funnel: browse -> filter -> preview -> use -> generate landing', async ({
    authenticatedPage: page,
    testUser,
  }) => {
    const admin = createAdminClient();
    const suffix = crypto.randomUUID().slice(0, 8);
    const templateName = `Lead Template ${suffix}`;

    const { data: project, error: projectError } = await admin
      .from('projects')
      .insert({
        user_id: testUser.id,
        name: `lead-marketplace-${suffix}`,
        framework: 'react',
        component_library: 'none',
      })
      .select('id')
      .single();

    expect(projectError).toBeNull();
    expect(project?.id).toBeTruthy();

    const { data: template, error: templateError } = await admin
      .from('templates')
      .insert({
        name: templateName,
        description: 'Template created for lead-readiness marketplace smoke.',
        category: 'dashboard',
        framework: 'react',
        is_official: false,
        created_by: testUser.id,
        code: {
          files: [
            {
              path: 'src/App.tsx',
              content: 'export default function App(){return <div>Lead Template</div>;}',
            },
          ],
        },
      })
      .select('id, name')
      .single();

    expect(templateError).toBeNull();
    expect(template?.id).toBeTruthy();

    try {
      await page.goto('/templates');

      await page.getByRole('button', { name: /^my templates$/i }).click();
      await page.getByPlaceholder(/search templates by name or description/i).fill(templateName);
      await expect(page.getByRole('heading', { name: templateName })).toBeVisible();

      await page
        .getByRole('button', { name: /preview/i })
        .first()
        .click({ force: true });
      await expect(page.getByRole('dialog')).toBeVisible();

      await page.getByRole('button', { name: /use this template/i }).click();
      await expect(page).toHaveURL(/\/generate\?/);
      await expect(page).toHaveURL(new RegExp(`template=${template?.id}`));
      await expect(page).toHaveURL(new RegExp(`projectId=${project?.id}`));
    } finally {
      if (template?.id) {
        await admin.from('templates').delete().eq('id', template.id);
      }
    }
  });

  test('plugins marketplace smoke: list + install/uninstall roundtrip', async ({
    authenticatedPage: page,
  }) => {
    const admin = createAdminClient();
    const suffix = crypto.randomUUID().slice(0, 8);
    const pluginSlug = `lead-plugin-${suffix}`;
    const pluginName = `Lead Plugin ${suffix}`;

    const { data: plugin, error: pluginError } = await admin
      .from('plugins')
      .insert({
        slug: pluginSlug,
        name: pluginName,
        description: 'Plugin for marketplace smoke test',
        category: 'governance',
        status: 'official',
        icon: 'Shield',
        author: 'Lead Smoke',
        widget_slots: ['catalog.entity.overview'],
        config_schema: {},
        default_config: {},
        permissions: [],
      })
      .select('id, slug')
      .single();

    expect(pluginError).toBeNull();
    expect(plugin?.slug).toBe(pluginSlug);

    try {
      await page.goto('/plugins');
      await page.getByPlaceholder(/search plugins/i).fill(pluginName);
      await expect(page.getByText(pluginName)).toBeVisible();

      const card = page.locator('div').filter({ hasText: pluginName }).first();
      await card.getByRole('button', { name: /install/i }).click();
      await expect(card.locator('button[title="Uninstall"]')).toBeVisible({ timeout: 10000 });

      await card.locator('button[title="Uninstall"]').click();
      await expect(card.getByRole('button', { name: /install/i })).toBeVisible({ timeout: 10000 });
    } finally {
      if (plugin?.id) {
        await admin.from('plugin_installations').delete().eq('plugin_id', plugin.id);
        await admin.from('plugins').delete().eq('id', plugin.id);
      }
    }
  });

  test('gallery marketplace smoke: load + framework filter + pagination', async ({
    authenticatedPage: page,
    testUser,
  }) => {
    const admin = createAdminClient();
    const suffix = crypto.randomUUID().slice(0, 8);

    const baseRows = Array.from({ length: 12 }, (_, index) => ({
      user_id: testUser.id,
      prompt: `Gallery smoke prompt ${suffix} react ${index}`,
      framework: 'react',
      component_name: `GallerySmokeReact${index}-${suffix}`,
      generated_code: 'export default function Demo(){return <div>gallery</div>}',
      component_library: 'shadcn',
      status: 'completed',
      is_featured: true,
      quality_score: 0.8 + index / 100,
      ai_provider: 'google',
    }));

    const vueRow = {
      user_id: testUser.id,
      prompt: `Gallery smoke prompt ${suffix} vue`,
      framework: 'vue',
      component_name: `GallerySmokeVue-${suffix}`,
      generated_code: 'export default { template: "<div>gallery</div>" }',
      component_library: 'none',
      status: 'completed',
      is_featured: true,
      quality_score: 0.99,
      ai_provider: 'google',
    };

    const { error: generationsError } = await admin
      .from('generations')
      .insert([...baseRows, vueRow]);

    expect(generationsError).toBeNull();

    await page.goto('/gallery');
    await expect(page.getByRole('heading', { name: /generation gallery/i })).toBeVisible();
    await expect(page.getByText(/13 generations/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/page 1 of/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /^next$/i }).click();
    await expect(page.getByText(/page 2 of/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /^vue$/i }).click();
    await expect(page.getByText(`GallerySmokeVue-${suffix}`)).toBeVisible();
  });
});
