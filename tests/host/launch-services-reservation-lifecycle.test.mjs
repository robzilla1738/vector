// Actual closed App launchUrl body with controlled transport/owner seams only.
// No helper compilation, application/OS launch or native timing evidence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const appSource = readFileSync(new URL('./lib/app.mjs', import.meta.url), 'utf8');
const body = appSource.slice(appSource.indexOf('  async function launchUrl('), appSource.indexOf('  let slot;'));
function fixture({ ownedChild = false } = {}) {
  const state = { reservations: 0, checks: 0, dispatches: 0, failReservation: false, retired: false, hold: false, release: null };
  const guard = { assertReserved() { ++state.checks; assert.equal(state.retired, false, 'Original reservation retired'); }, retire() { state.retired = true; } };
  const context = { api: {}, appearancePair: {}, appearanceArtifact: {}, appearanceLaunchReserved: false, appearanceLaunchAttempted: false,
    appearanceReservation: undefined, launchQuarantine: undefined, externalPid: undefined, externalGeneration: undefined, generation: 1,
    child: ownedChild ? { pid: 42, exitCode: null, signalCode: null } : undefined,
    slot: { token: 'controlled-original-token' }, bundle: '/controlled/Aux.app', userDataDir: '/controlled/fixture/profile', urlLauncher: '/controlled/launch-url', launchUncertain: false,
    ensureUrlLauncher() {}, validateExternalLaunch: url => url, validateAuxLaunch: url => url,
    quarantineLaunchServicesAppearanceSlot: async () => { ++state.reservations; if (state.failReservation) throw new Error('Original reservation publication failed'); return guard; },
    spawn(executable, args) {
      assert.equal(executable, '/controlled/launch-url'); assert.equal(args.length, 7); assert.equal(args[0], '/controlled/Aux.app'); assert.equal(args[2], '[]'); assert.ok(['0', '42'].includes(args[3])); ++state.dispatches;
      const helper = new EventEmitter(); helper.stdout = new EventEmitter(); helper.stderr = new EventEmitter(); helper.stdin = new EventEmitter(); helper.kill = () => {};
      helper.stdin.end = () => {
        const complete = () => { helper.stdout.emit('data', JSON.stringify({ pid: 42, generation: 123 })); helper.emit('close', 0); };
        if (state.hold) state.release = complete; else queueMicrotask(complete);
      }; return helper;
    }, env: {}, JSON, Error, Number, Promise, setTimeout, clearTimeout,
  };
  vm.createContext(context); vm.runInContext(body + '\napi.launchUrl = launchUrl;', context);
  return { state, context, async cold() { const receipt = await context.api.launchUrl('http://127.0.0.1:3311/', []); context.externalPid = receipt.pid; context.launchUncertain = false; }, warm: () => context.api.launchUrl('http://127.0.0.1:3311/next', [], 42) };
}
test('one genuine cold LS reservation is reused and revalidated for later original-generation warm opens', async () => {
  const f = fixture(); await f.cold(); await f.warm(); await f.warm();
  assert.equal(f.state.reservations, 1); assert.equal(f.state.dispatches, 3); assert.equal(f.state.checks, 4);
});
test('child-owned warm open does not reserve an LS process-debt channel', async () => {
  const f = fixture({ ownedChild: true }); await f.warm();
  assert.equal(f.state.reservations, 0); assert.equal(f.state.dispatches, 1); assert.equal(f.context.externalPid, undefined);
});
test('retired LS reservation refuses warm dispatch before transport', async () => {
  const f = fixture(); await f.cold(); f.state.retired = true;
  await assert.rejects(f.warm(), /reservation retired/); assert.equal(f.state.dispatches, 1);
});
test('original LS and child retirement during held warm transport refuse the returned receipt', async () => {
  for (const ownedChild of [false, true]) {
    const f = fixture({ ownedChild }); if (!ownedChild) await f.cold(); f.state.hold = true;
    const opening = f.warm(); await Promise.resolve();
    if (ownedChild) f.context.child.exitCode = 0; else f.state.retired = true;
    f.state.release(); await assert.rejects(opening, /retired/);
  }
});
