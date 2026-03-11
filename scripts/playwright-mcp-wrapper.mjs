#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const NPX_CANDIDATES = [
  '/usr/bin/npx',
  '/usr/local/bin/npx',
  '/opt/homebrew/bin/npx',
  '/bin/npx',
];

const resolveNpxPath = () => {
  for (const candidate of NPX_CANDIDATES) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error('Unable to locate npx in approved system paths.');
};

const child = spawn(resolveNpxPath(), ['-y', '@playwright/mcp', ...process.argv.slice(2)], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

let parentMode = 'unknown';
let parentBuffer = Buffer.alloc(0);
let childBuffer = '';
const queuedResponses = [];

const flushQueuedResponses = () => {
  if (parentMode === 'unknown') return;
  while (queuedResponses.length > 0) {
    writeToParent(queuedResponses.shift());
  }
};

const writeToParent = (jsonPayload) => {
  if (parentMode === 'content-length') {
    const length = Buffer.byteLength(jsonPayload, 'utf8');
    process.stdout.write(`Content-Length: ${length}\r\n\r\n${jsonPayload}`);
    return;
  }
  process.stdout.write(`${jsonPayload}\n`);
};

const enqueueOrWriteResponse = (jsonPayload) => {
  if (parentMode === 'unknown') {
    queuedResponses.push(jsonPayload);
    return;
  }
  writeToParent(jsonPayload);
};

const inferParentMode = () => {
  if (parentMode !== 'unknown') return;
  const probe = parentBuffer.toString('utf8', 0, Math.min(parentBuffer.length, 128));
  if (/^\s*Content-Length:/i.test(probe)) {
    parentMode = 'content-length';
    flushQueuedResponses();
    return;
  }
  if (/^\s*[{\[]/.test(probe)) {
    parentMode = 'newline';
    flushQueuedResponses();
  }
};

const readContentLengthMessage = () => {
  const headerEnd = parentBuffer.indexOf('\r\n\r\n');
  const fallbackEnd = headerEnd === -1 ? parentBuffer.indexOf('\n\n') : -1;
  const endIndex = headerEnd !== -1 ? headerEnd : fallbackEnd;
  const separatorLength = headerEnd !== -1 ? 4 : fallbackEnd !== -1 ? 2 : 0;
  if (endIndex === -1) return null;

  const headerText = parentBuffer.slice(0, endIndex).toString('utf8');
  const lengthMatch = headerText.match(/Content-Length:\s*(\d+)/i);
  if (!lengthMatch) {
    parentBuffer = Buffer.alloc(0);
    return null;
  }

  const contentLength = Number.parseInt(lengthMatch[1], 10);
  const bodyStart = endIndex + separatorLength;
  const bodyEnd = bodyStart + contentLength;
  if (parentBuffer.length < bodyEnd) return null;

  const body = parentBuffer.slice(bodyStart, bodyEnd).toString('utf8');
  parentBuffer = parentBuffer.slice(bodyEnd);
  return body;
};

const forwardParentMessages = () => {
  while (true) {
    inferParentMode();
    if (parentMode === 'unknown') return;

    if (parentMode === 'content-length') {
      const message = readContentLengthMessage();
      if (!message) return;
      child.stdin.write(`${message}\n`);
      continue;
    }

    const newlineIndex = parentBuffer.indexOf(0x0a);
    if (newlineIndex === -1) return;
    const line = parentBuffer.slice(0, newlineIndex).toString('utf8').trim();
    parentBuffer = parentBuffer.slice(newlineIndex + 1);
    if (!line) continue;
    child.stdin.write(`${line}\n`);
  }
};

process.stdin.on('data', (chunk) => {
  parentBuffer = Buffer.concat([parentBuffer, chunk]);
  forwardParentMessages();
});

child.stdout.on('data', (chunk) => {
  childBuffer += chunk.toString('utf8');
  while (true) {
    const newlineIndex = childBuffer.indexOf('\n');
    if (newlineIndex === -1) break;
    const line = childBuffer.slice(0, newlineIndex).trim();
    childBuffer = childBuffer.slice(newlineIndex + 1);
    if (!line) continue;
    enqueueOrWriteResponse(line);
  }
});

process.stdin.on('close', () => {
  child.kill();
});

child.on('error', () => {
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
