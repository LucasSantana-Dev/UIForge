#!/usr/bin/env node
/**
 * Patches Next.js 16 build internals to fix two prerender bugs:
 *
 * 1. next/dist/build/utils.js — isPageStatic returns isStatic:true for /_global-error,
 *    which causes the export worker to attempt a prerender that fails with
 *    "Cannot read properties of null (reading 'useContext')".
 *    Fix: return isStatic:false so /_global-error is never added to staticPaths.
 *
 * 2. next/dist/build/index.js — the staticPaths.set branch for non-dynamic routes
 *    still adds /_global-error/page and /_not-found/page even when isStatic:false,
 *    because the branch only checks appConfig.revalidate !== 0.
 *    Fix: exclude those two synthetic routes from the staticPaths.set call.
 *
 * These are confirmed Next.js 16.1.x bugs. Remove this script once upstream fixes land.
 */

const fs = require('fs');
const path = require('path');

const nextRoot = path.dirname(require.resolve('next/package.json'));

function patch(filePath, patches) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  for (const { from, to, description } of patches) {
    if (content.includes(to)) {
      console.log(`  [skip] already patched: ${description}`);
      continue;
    }
    if (!content.includes(from)) {
      console.warn(`  [warn] pattern not found, skipping: ${description}`);
      continue;
    }
    content = content.replace(from, to);
    changed = true;
    console.log(`  [ok] applied: ${description}`);
  }
  if (changed) fs.writeFileSync(filePath, content);
}

console.log('Applying Next.js 16 prerender patches...');

patch(path.join(nextRoot, 'dist/build/utils.js'), [
  {
    description: 'utils.js: isPageStatic returns isStatic:false for /_global-error',
    from: '// Skip page data collection for synthetic _global-error routes\n    if (page === _constants1.UNDERSCORE_GLOBAL_ERROR_ROUTE) {\n        return {\n            isStatic: true,',
    to:   '// Skip page data collection for synthetic _global-error routes\n    if (page === _constants1.UNDERSCORE_GLOBAL_ERROR_ROUTE) {\n        return {\n            isStatic: false,',
  },
]);

patch(path.join(nextRoot, 'dist/build/index.js'), [
  {
    description: 'index.js: exclude /_global-error/page and /_not-found/page from staticPaths',
    from: 'if (!isDynamic) {',
    to:   "if (!isDynamic && originalAppPath !== '/_global-error/page' && originalAppPath !== '/_not-found/page') {",
  },
]);

console.log('Done.');
