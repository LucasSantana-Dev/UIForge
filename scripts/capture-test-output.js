#!/usr/bin/env node
/**
 * Captures Jest test output to a file for inspection
 */
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const webDir = path.join(__dirname, '..', 'apps', 'web');
const outFile = path.join(__dirname, '..', 'test-output.txt');

const pattern = process.argv[2] || '';
const args = [path.join(webDir, 'node_modules', '.bin', 'jest')];
if (pattern) args.push('--testPathPattern=' + pattern);
args.push('--no-coverage', '--forceExit', '--ci', '--colors=false');

const r = cp.spawnSync('node', args, {
  cwd: webDir,
  env: { ...process.env, FORCE_COLOR: '0', CI: '1', NODE_ENV: 'test' },
  maxBuffer: 50 * 1024 * 1024,
  encoding: 'utf8',
  timeout: 180000,
});

const out = [
  '=== STDOUT ===',
  r.stdout || '(empty)',
  '=== STDERR ===',
  r.stderr || '(empty)',
  '=== STATUS: ' + r.status + ' ===',
].join('\n');

fs.writeFileSync(outFile, out, 'utf8');
process.exitCode = r.status;
