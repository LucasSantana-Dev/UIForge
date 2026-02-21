#!/usr/bin/env node
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const webDir = path.join(__dirname, 'apps/web');
const outFile = path.join(__dirname, 'jest-results.txt');
const pattern = process.argv[2] || '';

const jestBin = path.join(webDir, 'node_modules', '.bin', 'jest');
const rootJestBin = path.join(__dirname, 'node_modules', '.bin', 'jest');
const bin = fs.existsSync(jestBin) ? jestBin : rootJestBin;

const args = [bin, '--no-coverage', '--forceExit', '--ci', '--colors=false'];
if (pattern) args.push('--testPathPattern=' + pattern);

fs.writeFileSync(outFile, 'Running...\n');

const r = cp.spawnSync(process.execPath, args, {
  cwd: webDir,
  env: { ...process.env, FORCE_COLOR: '0', CI: '1', NODE_ENV: 'test' },
  maxBuffer: 20 * 1024 * 1024,
  encoding: 'utf8',
  timeout: 120000,
});

const out = 'STDOUT:\n' + (r.stdout || '') + '\nSTDERR:\n' + (r.stderr || '') + '\nEXIT:' + r.status + (r.signal ? ' SIGNAL:' + r.signal : '');
fs.writeFileSync(outFile, out);

// Handle null status (timeout/signal) properly
if (r.status === null) {
  // Process was terminated by signal or timeout
  const exitCode = r.signal ? 1 : 1;
  process.exit(exitCode);
} else {
  process.exit(r.status);
}
