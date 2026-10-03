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
    launchUncertain: unknown, appearanceOwnerFailure: undefined, appearanceChannelRetirement: undefined, generation: 1, child: undefined, appearanceArtifact: { validate() {} }, urlLauncher: '/controlled/launch-url', bundle: '/controlled/Aux.app',
    userDataDir: '/controlled/profile', running: () => false,
    disposeAppearance(keep) { assert.equal(keep, Boolean(context.fileAppearance)); events.push('sealed'); }, disposePerformance() {},
    fileAppearance: { async removeAfterOriginalRetirement() { events.push('channel'); if (cleanupFailure) throw primary; return Object.freeze({ removed: true }); } },
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
test('actual failed owner construction retains original authentication error and blocks guardian/slot cleanup', async () => {
  const f = fixture(), authentication = new Error('Original channel identity read failed');
  const method = source.slice(source.indexOf('    async configureLaunchServicesAppearance('), source.indexOf('    get launchServicesQuarantineOwner()'));
  Object.assign(f.context, {
    appearanceArtifact: { validate() {} }, appearancePair: {}, appearanceConfiguration: 0, appearanceOwnerFailure: undefined,
    generation: 1, activeProfile: 'Default', profileRoot: '/controlled/original-root', launch: { perf: false },
    createLaunchServicesAppearanceOwner: async () => { throw authentication; },
    running: () => true,
  });
  // Configuration retires any old observation. This fixture has no new owner
  // because the actual awaited creator refuses before assignment.
  f.context.disposeAppearance = () => { f.context.fileAppearance = undefined; };
  vm.runInContext('globalThis.configuration = ({' + method + '});', f.context);
  await assert.rejects(f.context.configuration.configureLaunchServicesAppearance({}, {}), error => error === authentication);
  assert.equal(f.context.fileAppearance, undefined); assert.equal(f.context.appearanceOwnerFailure, authentication);
  f.context.running = () => false;
  await assert.rejects(f.context.quit(), error => error.message.includes('cleanup unowned') && error.cause === authentication && error.errors[0] === authentication);
  assert.ok(f.context.launchQuarantine); assert.ok(f.context.slot); assert.equal(f.events.includes('guardian'), false); assert.equal(f.events.includes('slot'), false);
});
test('original paired LS process with no authenticated channel owner cannot infer absent-channel cleanup', async () => {
  const f = fixture(); f.context.fileAppearance = undefined;
  f.context.disposeAppearance = keep => { assert.equal(keep, false); };
  await assert.rejects(f.context.quit(), /cleanup unowned/);
  assert.ok(f.context.launchQuarantine); assert.ok(f.context.slot); assert.deepEqual(f.events, []);
});

test('actual successful original channel cleanup is idempotent across quit twice', async () => {
  const f = fixture(); await f.context.quit(); const receipt = f.context.appearanceChannelRetirement;
  await f.context.quit();
  assert.deepEqual(f.events, ['sealed', 'channel', 'guardian', 'slot', 'sealed']);
  assert.equal(f.context.appearanceChannelRetirement, receipt); assert.equal(receipt.pid, 42); assert.equal(receipt.externalGeneration, 123); assert.equal(receipt.generation, 1);
});
test('channel-success then guardian-failure retry retains exact successful receipt without repeated deletion', async () => {
  const f = fixture(), failure = new Error('Original guardian clearing failed'); let attempts = 0;
  f.context.launchQuarantine.clearAfterOriginalRetirement = async () => { f.events.push('guardian'); if (++attempts === 1) throw failure; };
  await assert.rejects(f.context.quit(), error => error === failure);
  const receipt = f.context.appearanceChannelRetirement; assert.ok(receipt); assert.ok(f.context.slot);
  await f.context.quit(); assert.equal(f.context.appearanceChannelRetirement, receipt);
  assert.deepEqual(f.events, ['sealed', 'channel', 'guardian', 'sealed', 'guardian', 'slot']);
});
test('retained removal receipt cannot authorize replacement PID, LS generation or App generation', async () => {
  for (const field of ['externalPid', 'externalGeneration', 'generation']) {
    const f = fixture(); await f.context.quit(); f.context[field]++;
    await assert.rejects(f.context.quit(), /cleanup unowned/);
    assert.equal(f.events.filter(value => value === 'channel').length, 1);
  }
});
