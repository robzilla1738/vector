#!/usr/bin/env node
// Read-only pinned contract/syntax check. Never imports the supplied runtime.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { exposeHelpers } from './supplied-cli.mjs';
import { compactionBackground } from './fixtures.mjs';

const [cliPath, daemonPath] = process.argv.slice(2);
assert(cliPath && daemonPath, 'Usage: node scripts/e2e/check.mjs PINNED_CLI_SOURCE PINNED_DAEMON_SOURCE');
const contracts = JSON.parse(await readFile(new URL('./contracts.json', import.meta.url), 'utf8'));
const cli = exposeHelpers(await readFile(cliPath, 'utf8'));
const daemon = await readFile(daemonPath, 'utf8');
assert.equal(createHash('sha256').update(daemon).digest('hex'), contracts.daemonSha256);
for (const anchor of contracts.anchors) {
  assert.equal(daemon.split(anchor.find).length - 1, anchor.count, anchor.find);
  assert.equal(Buffer.from(daemon).indexOf(Buffer.from(anchor.find)), anchor.offset, anchor.find);
}
const runner = await readFile(new URL('../e2e.mjs', import.meta.url), 'utf8');
assert.equal((runner.match(/\{ title: '/g) ?? []).length, 20);
assert(!runner.includes('apps/cli/dist/client.js'));
assert(!runner.includes("readFile(join(root, '.env')"));
const block = compactionBackground('disposable-fixture', 0);
assert(block.length > 100000 && block.length < 200000);
assert.equal(block, compactionBackground('disposable-fixture', 0));
assert.notEqual(block, compactionBackground('disposable-fixture', 1));
const directory = await mkdtemp(join(tmpdir(), 'aux-e2e-contract-'));
try {
  const module = join(directory, 'supplied-cli-helpers.mjs');
  await writeFile(module, cli, { mode: 0o600 });
  await promisify(execFile)(process.execPath, ['--check', module]);
} finally { await rm(directory, { recursive: true }); }
console.log('PASS: pinned CLI extraction syntax, actual daemon contracts,20 cases and bounded synthetic context. No runtime module, socket, model or credential access.');
