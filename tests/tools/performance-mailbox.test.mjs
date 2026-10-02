// Synthetic owned-fixture transport only; never genuine native measurements.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, lstatSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createPerformanceMailbox, preparePerformanceMailbox } from '../host/lib/performance-mailbox.mjs';
async function fixture(body) {
  const root = mkdtempSync('/private/tmp/aux-native-journey-mailbox-test-'); const profile = join(root, 'profile'); mkdirSync(profile, { mode: 0o700 });
  try { await body({ root, mailbox: createPerformanceMailbox({ userDataDir: profile, pid: 42, generation: 1 }) }); } finally { rmSync(root, { recursive: true, force: true }); }
}
const method = 'prepareGuestTabSwitchPresentation';
const reply = changes => Buffer.from(`AUX_NATIVE_FIXTURE_REPLY_V1 ${JSON.stringify({ producer: 'aux-native-fixture-reply', version: 1, pid: 42, windowId: 7, sequence: '1', operation: method, record: { windowId: 7, status: 'ready' }, ...changes })}\n`);
const source = { pid: 42, generation: 1 };
test('fixed operation file is private and fragmented genuine receipt resolves exact record', () => fixture(async ({ root, mailbox }) => {
  const pending = mailbox.invoke(method);
  assert.deepEqual(JSON.parse(readFileSync(join(root, 'performance-request.json'))), { sequence: '1', operation: method });
  assert.equal(lstatSync(join(root, 'performance-request.json')).mode & 0o777, 0o600);
  for (const byte of reply()) mailbox.write(Buffer.from([byte]), source);
  assert.deepEqual(JSON.parse(await pending), { windowId: 7, status: 'ready' }); mailbox.dispose();
}));
test('fixed memory operation crosses the real dirfd writer without a caller process selector', () => fixture(async ({ root, mailbox }) => {
  const pending = mailbox.invoke('sampleShellMemory');
  assert.deepEqual(JSON.parse(readFileSync(join(root, 'performance-request.json'))), { sequence: '1', operation: 'sampleShellMemory' });
  mailbox.write(reply({ operation: 'sampleShellMemory', record: { windowId: 7, status: 'sampled', producer: 'aux-native-shell-memory' } }), source);
  assert.equal(JSON.parse(await pending).status, 'sampled'); mailbox.dispose();
}));
for (const changes of [{ pid: 99 }, { sequence: '2' }, { operation: 'completeGuestPresentation' }, { record: { windowId: 8 } }, { callerTheme: 'dark' }]) test(`foreign receipt fails closed ${JSON.stringify(changes)}`, () => fixture(async ({ mailbox }) => {
  const pending = mailbox.invoke(method); mailbox.write(reply(changes), source); await assert.rejects(pending); mailbox.dispose();
}));
test('foreign stderr generation and concurrent transaction refuse', () => fixture(async ({ mailbox }) => {
  const pending = mailbox.invoke(method); await assert.rejects(mailbox.invoke('completeGuestPresentation'), /Concurrent/);
  mailbox.write(reply(), { ...source, generation: 2 }); await assert.rejects(pending); mailbox.dispose();
}));
test('unknown operation carries no arbitrary selectors and writes no mailbox', () => fixture(async ({ root, mailbox }) => {
  await assert.rejects(mailbox.invoke('pages.open'), /Unknown/);
  assert.throws(() => readFileSync(join(root, 'performance-request.json'))); mailbox.dispose();
}));
test('symlink and unsafe existing request file refuse without modifying target', () => fixture(async ({ root, mailbox }) => {
  const target = join(root, 'safe-test-target'); writeFileSync(target, 'untouched', { mode: 0o600 });
  symlinkSync(target, join(root, 'performance-request.json'));
  await assert.rejects(mailbox.invoke(method), /metadata write refused/); assert.equal(readFileSync(target, 'utf8'), 'untouched'); mailbox.dispose();
}));
test('dispose rejects waiting call and forbids revival', () => fixture(async ({ mailbox }) => {
  const pending = mailbox.invoke(method); mailbox.dispose(); await assert.rejects(pending, /exited/); await assert.rejects(mailbox.invoke(method), /exited/);
}));

test('scope-less direct-child refusal preserves original diagnostic and poisons transport', () => fixture(async ({ mailbox }) => {
  const pending = mailbox.invoke(method);
  const raw = `AUX_NATIVE_FIXTURE_REFUSAL_V1 ${JSON.stringify({ producer: 'aux-native-fixture-refusal', version: 1, pid: 42, status: 'refused', reason: 'invalid_private_mailbox' })}`;
  mailbox.write(Buffer.from(raw + '\n'), source);
  await assert.rejects(pending, error => { assert.equal(error.nativeRaw, raw); return true; });
  await assert.rejects(mailbox.invoke(method), /Original native mailbox refusal/); mailbox.dispose();
}));

test('owned relaunch removes only the old private control file before native observer starts', () => fixture(async ({ root, mailbox }) => {
  const pending = mailbox.invoke(method); mailbox.dispose(); await assert.rejects(pending);
  preparePerformanceMailbox(join(root, 'profile'));
  assert.throws(() => readFileSync(join(root, 'performance-request.json')), /ENOENT/);
  preparePerformanceMailbox(join(root, 'profile'));
}));
test('relaunch refuses an unsafe prior control file without touching its target', () => fixture(async ({ root, mailbox }) => {
  const target = join(root, 'target'); writeFileSync(target, 'untouched', { mode: 0o600 });
  symlinkSync(target, join(root, 'performance-request.json'));
  assert.throws(() => preparePerformanceMailbox(join(root, 'profile')), /metadata write refused/);
  assert.equal(readFileSync(target, 'utf8'), 'untouched'); mailbox.dispose();
}));
