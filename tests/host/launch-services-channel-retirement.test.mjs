// Actual closed App quit body with controlled process/cleanup seams; no OS/app effects.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('./lib/app.mjs', import.meta.url), 'utf8');
const body = source.slice(source.indexOf('  async function quitOwned() {'), source.indexOf('  const api = {'));
function fixture({ cleanupFailure, unknown = false } = {}) {
  const events = [], primary = new Error('Original signed-channel cleanup refused');
  const context = { privatePair: null, startupAttachment: null, externalPid: 42, externalGeneration: 123,
    launchUncertain: unknown, child: undefined, appearanceArtifact: {}, urlLauncher: '/controlled/launch-url', bundle: '/controlled/Aux.app',
    userDataDir: '/controlled/profile', running: () => false,
    disposeAppearance(keep) { assert.equal(keep, true); events.push('sealed'); }, disposePerformance() {},
    fileAppearance: { async removeAfterOriginalRetirement() { events.push('channel'); if (cleanupFailure) throw primary; } },
    launchQuarantine: { async clearAfterOriginalRetirement() { events.push('guardian'); } },
    slot: { release() { events.push('slot'); } }, Error, Date,
  };
  vm.createContext(context); vm.runInContext(body + '\nglobalThis.quit = quitOwned;', context);
  return { context, events, primary };
}
test('actual App retains channel through original retirement and removes it before guardian/slot release', async () => {
  const f = fixture(); await f.context.quit(); assert.deepEqual(f.events, ['sealed', 'channel', 'guardian', 'slot']);
  assert.equal(f.context.fileAppearance, undefined); assert.equal(f.context.launchQuarantine, undefined); assert.equal(f.context.slot, undefined);
});
test('unknown original generation or signed channel cleanup refusal retains guardian/slot and primary failure', async () => {
  const f = fixture({ cleanupFailure: true }); await assert.rejects(f.context.quit(), error => error === f.primary);
  assert.deepEqual(f.events, ['sealed', 'channel']); assert.ok(f.context.fileAppearance); assert.ok(f.context.launchQuarantine); assert.ok(f.context.slot);
  const unknown = fixture({ unknown: true }); await assert.rejects(unknown.context.quit(), /receipt unavailable/);
  assert.deepEqual(unknown.events, ['sealed']); assert.ok(unknown.context.fileAppearance); assert.ok(unknown.context.slot);
});
