#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

const emailArg = process.argv[2];

if (!emailArg) {
  console.error('Usage: node --experimental-strip-types scripts/grant-admin-by-email.ts <email>');
  process.exit(1);
}

const envFilePath = path.resolve(process.cwd(), 'apps/web/.env.local');
const envMap = new Map<string, string>();

if (fs.existsSync(envFilePath)) {
  const content = fs.readFileSync(envFilePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [rawKey, ...rawValueParts] = trimmed.split('=');
    const key = rawKey.trim();
    const value = rawValueParts
      .join('=')
      .trim()
      .replace(/^['"]|['"]$/g, '');
    envMap.set(key, value);
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? envMap.get('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? envMap.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to env or apps/web/.env.local.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email: string) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data?.users ?? [];
    const match = users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;

    if (users.length < perPage) return null;
    page += 1;
  }
}

async function grantAdminByEmail(email: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
  if (error) throw error;

  console.log(`Admin access granted for ${email} (${user.id}).`);
}

grantAdminByEmail(emailArg).catch((error: unknown) => {
  console.error('Failed to grant admin access.');
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
});
