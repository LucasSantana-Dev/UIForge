import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

type JwtSigningJwk = {
  alg: string;
  kid?: string;
  kty: string;
  crv: string;
  x: string;
  y: string;
  d: string;
};

let cachedKey: string | null = null;
let cachedUrl = '';
const FIXED_PATH = '/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin';

function commandEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    PATH: FIXED_PATH,
  };
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function isLocalSupabaseUrl(supabaseUrl: string): boolean {
  try {
    const url = new URL(supabaseUrl);
    return url.hostname === '127.0.0.1' || url.hostname === 'localhost';
  } catch {
    return false;
  }
}

function resolveAuthContainerName(): string {
  const output = execFileSync('docker', ['ps', '--format', '{{.Names}}'], {
    encoding: 'utf8',
    env: commandEnv(),
  });
  const name = output
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('supabase_auth_'));

  if (!name) {
    throw new Error('Supabase auth container not found');
  }

  return name;
}

function readJwtSigningKey(containerName: string): JwtSigningJwk {
  const envOutput = execFileSync(
    'docker',
    ['inspect', '-f', '{{range .Config.Env}}{{println .}}{{end}}', containerName],
    {
      encoding: 'utf8',
      env: commandEnv(),
    }
  );
  const line = envOutput
    .split('\n')
    .map((value) => value.trim())
    .find((value) => value.startsWith('GOTRUE_JWT_KEYS='));
  if (!line) {
    throw new Error('GOTRUE_JWT_KEYS env not found in Supabase auth container');
  }

  const rawValue = line.replace(/^GOTRUE_JWT_KEYS=/, '');
  const parsed = JSON.parse(rawValue) as JwtSigningJwk[];
  const signingKey = parsed.find((item) => item.alg === 'ES256' && item.d);

  if (!signingKey) {
    throw new Error('Supabase auth signing key not found');
  }

  return signingKey;
}

function createLocalServiceRoleJwt(supabaseUrl: string): string {
  const containerName = resolveAuthContainerName();
  const signingKey = readJwtSigningKey(containerName);
  const privateKey = crypto.createPrivateKey({
    key: signingKey,
    format: 'jwk',
  });

  const now = Math.floor(Date.now() / 1000);
  const origin = new URL(supabaseUrl).origin;
  const header = {
    alg: 'ES256',
    typ: 'JWT',
    kid: signingKey.kid,
  };
  const payload = {
    iss: `${origin}/auth/v1`,
    role: 'service_role',
    aud: 'authenticated',
    sub: 'service_role',
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const input = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .sign('sha256', Buffer.from(input), {
      key: privateKey,
      dsaEncoding: 'ieee-p1363',
    })
    .toString('base64url');

  return `${input}.${signature}`;
}

function resolveAdminKey(supabaseUrl: string): string {
  const configuredKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (cachedKey && cachedUrl === supabaseUrl) {
    return cachedKey;
  }

  if (!isLocalSupabaseUrl(supabaseUrl)) {
    cachedUrl = supabaseUrl;
    cachedKey = configuredKey;
    return configuredKey;
  }

  try {
    const localKey = createLocalServiceRoleJwt(supabaseUrl);
    cachedUrl = supabaseUrl;
    cachedKey = localKey;
    return localKey;
  } catch {
    cachedUrl = supabaseUrl;
    cachedKey = configuredKey;
    return configuredKey;
  }
}

export function createAdminClient() {
  const supabaseUrl = requiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  return createClient(supabaseUrl, resolveAdminKey(supabaseUrl));
}
