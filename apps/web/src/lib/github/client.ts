import { App, Octokit } from 'octokit';
import type { GitHubAppConfig } from './types';

let appInstance: App | null = null;

function getAppConfig(): GitHubAppConfig {
  return {
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
    webhookSecret: process.env.GITHUB_APP_WEBHOOK_SECRET!,
    clientId: process.env.GITHUB_APP_CLIENT_ID!,
    clientSecret: process.env.GITHUB_APP_CLIENT_SECRET!,
  };
}

export function getGitHubApp(): App {
  if (!appInstance) {
    const config = getAppConfig();
    appInstance = new App({
      appId: config.appId,
      privateKey: config.privateKey,
      webhooks: { secret: config.webhookSecret },
      oauth: {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
      },
    });
  }
  return appInstance;
}

export async function getInstallationOctokit(installationId: number): Promise<Octokit> {
  const app = getGitHubApp();
  return app.getInstallationOctokit(installationId);
}

export function getAppInstallUrl(): string {
  const config = getAppConfig();
  return `https://github.com/apps/siza-dev/installations/new?client_id=${config.clientId}`;
}
