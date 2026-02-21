#!/usr/bin/env node
/**
 * Test runner script that captures Jest output to a file
 */
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const pattern = process.argv[2] || '';
const args = ['node_modules/.bin/jest', '--no-coverage', '--forceExit', '--ci'];
if (pattern) args.push('--testPathPattern=' + pattern);

const r = cp.spawnSync('node', args, {
  cwd: path.join(__dirname, '..', 'apps', 'web'),
  env: { ...process.env, FORCE_COLOR: '0', CI: '1', NODE_ENV: 'test' },
  maxBuffer: 50 * 1024 * 1024,
  encoding: 'utf8',
  timeout: 120000,
});

const out = (r.stdout || '') + '\n' + (r.stderr || '');
const outFile = path.join(__dirname, '..', 'jest-output.txt');
fs.writeFileSync(outFile, out);
console.log('Written to:', outFile);
console.log('Exit code:', r.status);
console.log('Signal:', r.signal);
console.log(out.slice(0, 10000));

// Handle null status (timeout/signal) properly
if (r.status === null) {
  // Process was terminated by signal or timeout
  const exitCode = r.signal ? 1 : 1;
  process.exit(exitCode);
} else {
  process.exit(r.status);
}
