// Synthetic direct-child transport controls; no app/native observation evidence.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createPrivateWindowStream } from './lib/private-window-stream.mjs';
import { privateWindowPrefix } from './lib/private-window-observation.mjs';
const commit = 'a'.repeat(40), hash = 'b'.repeat(64);
const native = { sourceCommit: commit, manifestHash: hash, buildId: `195+${hash}+${commit}` };
const candidate = { productIdentity: { commit, tree: 'c'.repeat(40), label: commit, dirty: false }, native,
  shellDigest: 'd'.repeat(64), harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64) };
const owner = { pid: 42, generation: 1 };
const make = () => createPrivateWindowStream({ ...owner, candidate });
function line(windowId = 7) { return privateWindowPrefix + JSON.stringify({ producer: 'aux-native-private-window-observation',
  version: 1, native: { buildId: native.buildId, sourceCommit: commit }, runtimeStatus: 'inactive-private',
  appearance: { producer: 'aux-native-appearance-snapshot', version: 1, pid: 42, windowId, windowKind: 'private',
    frame: { x: 0, y: 0, width: 900, height: 600 }, nativeTheme: 'dark', backing: null, material: null,
    observedAtUnixMs: Date.now(), shell: { theme: 'dark', layout: 'vertical', sidebarAppearance: 'solid',
      systemDark: true, reduceMotion: false, reduceTransparency: false } } }) + '\n'; }
test('incremental original-child receipt joins only a fresh exact window', async () => {
  const stream = make(), pending = stream.observe({ windowId: 7, notBefore: new Date().toISOString() });
  stream.write(Buffer.from('ordinary diagnostic\n' + line(8)), owner);
  const raw = line(), midpoint = Math.floor(raw.length / 2);
  stream.write(Buffer.from(raw.slice(0, midpoint)), owner); stream.write(Buffer.from(raw.slice(midpoint)), owner);
  assert.equal((await pending).raw.line, raw); stream.dispose();
});
test('foreign generation, malformed prefix and disposal retire pending admission', async () => {
  for (const stop of [s => s.write(Buffer.from(line()), { pid: 42, generation: 2 }),
    s => s.write(Buffer.from(privateWindowPrefix + '{}\n'), owner), s => s.dispose(),
    s => s.write(Buffer.alloc(16385, 'a'), owner)]) {
    const stream = make(), pending = stream.observe({ windowId: 7, notBefore: new Date().toISOString() });
    stop(stream); await assert.rejects(pending);
    await assert.rejects(stream.observe({ windowId: 7, notBefore: new Date().toISOString() }));
  }
});
test('overlapping observations refuse without consuming the first owner and timeout stays a failure', async () => {
  const stream = make(), pending = stream.observe({ windowId: 7, notBefore: new Date().toISOString() });
  await assert.rejects(stream.observe({ windowId: 7, notBefore: new Date().toISOString() }), /Overlapping/);
  stream.write(Buffer.from(line()), owner); await pending;
  await assert.rejects(stream.observe({ windowId: 7, notBefore: new Date().toISOString(), timeoutMs: 1 }), /No fresh/);
  stream.dispose();
});

test('zero-argument startup discovery obtains the native window without title or caller selectors', async () => {
  const stream = make(), pending = stream.discover(), raw = line(93);
  stream.write(Buffer.from(raw), owner);
  assert.equal((await pending).window.windowId, 93);
  stream.dispose();
});
