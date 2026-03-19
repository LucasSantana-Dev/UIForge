#!/usr/bin/env node
/**
 * check-route-coverage.ts
 *
 * Reports API route handlers that have no corresponding unit test.
 * Exit 1 if any untested routes found (for CI enforcement).
 *
 * Usage:
 *   npx tsx scripts/check-route-coverage.ts           # check + report
 *   npx tsx scripts/check-route-coverage.ts --ci      # exit 1 if any untested
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { resolve, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = resolve(__dirname, '..');
const API_SRC = resolve(ROOT, 'apps/web/src/app/api');
const TEST_DIR = resolve(ROOT, 'apps/web/src/__tests__');

const ciMode = process.argv.includes('--ci');

function walkRoutes(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) results.push(...walkRoutes(full));
    else if (entry === 'route.ts') results.push(full);
  }
  return results;
}

function walkTests(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) results.push(...walkTests(full));
    else if (entry.endsWith('.test.ts') || entry.endsWith('.test.tsx'))
      results.push(readFileSync(full, 'utf-8'));
  }
  return results;
}

const routes = walkRoutes(API_SRC);
const testContents = walkTests(TEST_DIR);

const untested: string[] = [];
for (const route of routes) {
  const routePath = relative(API_SRC, route).replace('/route.ts', '');
  const bare = routePath.replace(/\[/g, '').replace(/\]/g, '');
  const covered = testContents.some((c) => c.includes(routePath) || c.includes(bare));
  if (!covered) untested.push(routePath);
}

if (untested.length === 0) {
  console.log(`✓ All ${routes.length} API routes have tests`);
  process.exit(0);
}

console.log(`\n⚠  Untested API routes (${untested.length}/${routes.length}):`);
for (const u of untested) console.log(`  • ${u}`);
console.log(`\nScaffold: npx tsx scripts/scaffold-route-test.ts <route-path>`);

if (ciMode) process.exit(1);
