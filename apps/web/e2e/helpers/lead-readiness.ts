import crypto from 'crypto';
import { createAdminClient } from './admin-client';

export type LeadTestCredentials = {
  email: string;
  password: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function adminClient() {
  requiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  return createAdminClient();
}

export function createLeadTestCredentials(): LeadTestCredentials {
  const id = crypto.randomUUID();
  return {
    email: `lead-smoke-${id}@example.com`,
    password: crypto.randomBytes(16).toString('hex'),
  };
}

function resolveServerProvider(): 'google' | 'openai' | 'anthropic' {
  const provider = process.env.DEFAULT_GENERATION_PROVIDER;
  if (provider === 'openai' || provider === 'anthropic' || provider === 'google') {
    return provider;
  }
  return 'google';
}

export function hasGenerationBackend(): boolean {
  if (process.env.SIZA_AGENT_LOCAL_FALLBACK === 'true') {
    return true;
  }

  if (process.env.MCP_GATEWAY_URL) {
    return true;
  }

  const provider = resolveServerProvider();
  if (provider === 'google') {
    return Boolean(process.env.GEMINI_API_KEY);
  }
  if (provider === 'openai') {
    return Boolean(process.env.OPENAI_API_KEY);
  }
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function resolveAppBaseUrl(): string {
  const explicit = process.env.PLAYWRIGHT_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }

  const port = process.env.PLAYWRIGHT_WEB_PORT ?? '3100';
  return `http://localhost:${port}`;
}

export function resolveLeadCallbackUrl(): string {
  return `${resolveAppBaseUrl()}/auth/callback`;
}

function resolveMailpitUrl(): string {
  const configured = process.env.MAILPIT_URL;
  if (configured) {
    return configured;
  }

  const supabaseUrl = requiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  const url = new URL(supabaseUrl);
  return `${url.protocol}//${url.hostname}:54324`;
}

async function fetchMailpitMessages() {
  const response = await fetch(`${resolveMailpitUrl()}/api/v1/messages`);
  if (!response.ok) {
    throw new Error(`Failed to fetch mailpit messages: ${response.status}`);
  }
  return (await response.json()) as {
    messages: Array<{
      ID: string;
      Subject: string;
      To: Array<{ Address: string }>;
    }>;
  };
}

async function fetchMailpitMessageText(messageId: string): Promise<string> {
  const response = await fetch(`${resolveMailpitUrl()}/api/v1/message/${messageId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch mailpit message ${messageId}: ${response.status}`);
  }

  const payload = (await response.json()) as {
    Text?: string;
    HTML?: string;
  };

  return payload.Text ?? payload.HTML ?? '';
}

function extractConfirmationLink(content: string): string | null {
  const normalized = content.replace(/&amp;/g, '&');
  const match = normalized.match(/https?:\/\/[^\s)"']+\/auth\/v1\/verify\?[^\s)"']+/i);
  if (!match?.[0]) {
    return null;
  }
  return match[0];
}

function rewriteConfirmationRedirect(link: string, callbackUrl: string): string {
  const url = new URL(link);
  url.searchParams.set('redirect_to', callbackUrl);
  return url.toString();
}

export async function waitForSignupConfirmationLink(
  email: string,
  timeoutMs = 30000,
  callbackUrl = resolveLeadCallbackUrl()
): Promise<string> {
  const lowerEmail = email.toLowerCase();
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const list = await fetchMailpitMessages();
    const match = list.messages.find(
      (message) =>
        /confirm/i.test(message.Subject) &&
        message.To.some((recipient) => recipient.Address.toLowerCase() === lowerEmail)
    );

    if (match) {
      const content = await fetchMailpitMessageText(match.ID);
      const link = extractConfirmationLink(content);
      if (link) {
        return rewriteConfirmationRedirect(link, callbackUrl);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Confirmation email not found for ${email}`);
}

export async function generateSignupActionLink(
  email: string,
  password: string,
  callbackUrl = resolveLeadCallbackUrl()
): Promise<string> {
  const { data, error } = await adminClient().auth.admin.generateLink({
    type: 'signup',
    email,
    password,
    options: {
      redirectTo: callbackUrl,
    },
  });

  if (error || !data?.properties?.action_link) {
    throw new Error(`Failed to generate signup confirmation link: ${error?.message || 'unknown'}`);
  }

  return rewriteConfirmationRedirect(data.properties.action_link, callbackUrl);
}

export async function cleanupLeadUserByEmail(email: string): Promise<void> {
  const client = adminClient();
  const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    throw new Error(`Failed to list users for cleanup: ${error.message}`);
  }

  const user = data.users.find((item) => item.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    return;
  }

  await client.from('components').delete().eq('user_id', user.id);
  await client.from('generations').delete().eq('user_id', user.id);
  await client.from('projects').delete().eq('user_id', user.id);
  await client.from('usage_tracking').delete().eq('user_id', user.id);
  await client.from('subscriptions').delete().eq('user_id', user.id);
  await client.auth.admin.deleteUser(user.id);
}
