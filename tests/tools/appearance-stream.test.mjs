// Synthetic transport fixtures only; never native qualification evidence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAppearanceStream } from '../host/lib/appearance-stream.mjs';
const candidate = {
  productIdentity: { commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40), dirty: false },
  native: { sourceCommit: 'a'.repeat(40), buildId: 'synthetic', manifestHash: 'c'.repeat(64) },
  shellDigest: 'd'.repeat(64), harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64),
};
const now = () => new Date().toISOString();
const raw = (changes = {}) => ({ producer: 'aux-native-appearance-snapshot', version: 1, pid: 42, windowId: 7,
  observedAtUnixMs: Date.now(), frame: { x: 10, y: 20, width: 100, height: 100 }, windowKind: 'normal',
  nativeTheme: 'dark', backing: 'solid', material: 'solid',
  shell: { theme: 'dark', layout: 'vertical', sidebarAppearance: 'solid', systemDark: true, reduceMotion: false, reduceTransparency: false }, ...changes });
const line = value => Buffer.from(`AUX_NATIVE_APPEARANCE_V1 ${JSON.stringify(value)}\n`);
const stream = extra => {
  const s = createAppearanceStream({ pid: 42, generation: 1, candidate, ...extra });
  const write = s.write;
  s.write = (chunk, source = { pid: 42, generation: 1 }) => write(chunk, source);
  return s;
};

test('split prefix/JSON and mixed stderr produce exact fresh native text', async () => {
  const s = stream(), promise = s.observe({ windowId: 7, notBefore: now() });
  s.write(Buffer.from('other stderr diagnostic\n'));
  const value = raw(), data = line(value);
  for (const byte of data) s.write(Buffer.from([byte]));
  assert.equal(await promise, JSON.stringify(value)); s.dispose();
});
test('historical and foreign-window records never satisfy fresh selection', async () => {
  const s = stream(); s.write(line(raw({ observedAtUnixMs: Date.now() - 1000 })));
  const promise = s.observe({ windowId: 7, notBefore: now(), timeoutMs: 15 });
  s.write(line(raw({ windowId: 8 }))); s.write(line(raw({ observedAtUnixMs: Date.now() - 500 })));
  await assert.rejects(promise, /No fresh/); s.dispose();
});
for (const [name, value, pattern] of [
  ['foreign PID', { pid: 99 }, /PID mismatch/],
  ['unrecognized producer', { producer: 'requested-theme' }, /producer/],
  ['version', { version: 2 }, /version/],
  ['extra caller cell', { cell: 'D' }, /fields/],
  ['invalid frame', { frame: { x: 0, y: 0, width: 0, height: 1 } }, /frame/],
  ['extra frame metadata', { frame: { x: 0, y: 0, width: 1, height: 1, label: 'D' } }, /frame fields/],
  ['future time', { observedAtUnixMs: Date.now() + 60000 }, /unbracketed/],
]) test(`${name} fails closed`, async () => {
  const s = stream(), promise = s.observe({ windowId: 7, notBefore: now() });
  s.write(line(raw(value))); await assert.rejects(promise, pattern);
  await assert.rejects(s.observe({ windowId: 7, notBefore: now() }), pattern); s.dispose();
});
test('malformed prefixed JSON and partial line overflow fail closed', async () => {
  for (const bytes of [Buffer.from('AUX_NATIVE_APPEARANCE_V1 {broken}\n'), Buffer.alloc(100, 65)]) {
    const s = stream({ maxLineBytes: 80 }), promise = s.observe({ windowId: 7, notBefore: now() });
    s.write(bytes); await assert.rejects(promise); s.dispose();
  }
});
test('total bytes and native record limits fail closed independently', async () => {
  const a = stream({ maxBytes: 10 }), first = a.observe({ windowId: 7, notBefore: now() });
  a.write(Buffer.alloc(11, 65)); await assert.rejects(first, /byte limit/); a.dispose();
  const b = stream({ maxRecords: 1 }); b.write(line(raw({ windowId: 8 })));
  const second = b.observe({ windowId: 7, notBefore: now() });
  b.write(line(raw())); await assert.rejects(second, /record limit/); b.dispose();
});
test('duplicates and concurrent same-window requests refuse ambiguity', async () => {
  const s = stream(), promise = s.observe({ windowId: 7, notBefore: now() });
  await assert.rejects(s.observe({ windowId: 7, notBefore: now() }), /Ambiguous/);
  const value = raw(); s.write(line(value)); await promise;
  const second = s.observe({ windowId: 7, notBefore: now() });
  s.write(line(value)); await assert.rejects(second, /Duplicate/); s.dispose();
});
test('restart rejects old waiters, resets partial bytes and fences old child input', async () => {
  const s = stream(), promise = s.observe({ windowId: 7, notBefore: now() });
  s.write(Buffer.from('AUX_NATIVE_APPE'));
  s.reset({ pid: 43, generation: 2, candidate }); await assert.rejects(promise, /restarted/);
  const next = s.observe({ windowId: 7, notBefore: now() });
  s.write(line(raw({ pid: 43 })), { pid: 43, generation: 2 }); await next;
  const fenced = s.observe({ windowId: 7, notBefore: now() });
  s.write(line(raw()), { pid: 42, generation: 1 }); await assert.rejects(fenced, /child PID/); s.dispose();
});
test('dispose rejects waiters and cannot be revived', async () => {
  const s = stream(), promise = s.observe({ windowId: 7, notBefore: now() });
  s.dispose(); await assert.rejects(promise, /exited/);
  await assert.rejects(s.observe({ windowId: 7, notBefore: now() }), /exited/);
  assert.throws(() => s.reset({ pid: 43, generation: 2, candidate }), /Disposed/);
});
test('only Buffer transport input and positive explicit window are accepted', async () => {
  const s = stream(); await assert.rejects(s.observe({ windowId: 0, notBefore: now() }), /selection/);
  const promise = s.observe({ windowId: 7, notBefore: now() });
  s.write('caller log'); await assert.rejects(promise, /stderr bytes/); s.dispose();
});
