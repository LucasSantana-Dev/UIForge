import { type Page } from '@playwright/test';

export async function createReactProject(page: Page, projectName: string): Promise<string> {
  await page.goto('/projects/new');
  await page.getByLabel(/project name/i).fill(projectName);
  await page.getByLabel(/framework/i).selectOption('react');
  await page.getByRole('button', { name: /create project/i }).click();

  await page.waitForURL(/\/projects\/[a-f0-9-]+/);
  const match = page.url().match(/\/projects\/([a-f0-9-]+)/);
  if (!match) {
    throw new Error(`Could not parse project id from URL: ${page.url()}`);
  }

  return match[1];
}

export async function fillGenerationForm(
  page: Page,
  componentName: string,
  prompt: string
): Promise<void> {
  await page.getByLabel(/component name/i).fill(componentName);
  await page
    .getByLabel(/describe your component/i)
    .first()
    .fill(prompt);
}
