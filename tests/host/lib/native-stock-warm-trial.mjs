import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { lstatSync, mkdirSync, mkdtempSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { validateDisposableProfile } from './dev-acceptance.mjs';
import { launchStockStartupHelper, readStockStartupOwner } from './startup-stock-helper-launch.mjs';
import { createAxClient } from './ax.mjs';
import { retainNativeWindowCompiler } from './native-window-compiler-artifact.mjs';
import { decodeWarmWindowHelperIdentity } from './native-warm-helper-identity.mjs';
const quarantined = new Set();
export const stockWarmCleanupDebtCount = () => quarantined.size;
/** Actual trial construction; this module itself never runs a trial on import.
 * The fixed admitted candidate launches through its original startup helper.
 * Only the branded original compiler lease admits the separate HID helper. */
export function createStockWarmTrialFactory(configuration) {
  assert.deepEqual(Object.keys(configuration).sort(), ['manifestPath','manifestSha256','helper','compilerAudit','metadataWriter','browser','inputAdmission'].sort());
  const fixed = structuredClone(configuration);
  return async (_index, signal) => {
    assert.ok(signal instanceof AbortSignal); signal.throwIfAborted();
    assert.equal(quarantined.size, 0, 'Unretired original warm cleanup owner');
    const lease = retainNativeWindowCompiler(fixed.inputAdmission);
    const state = { lease, startup: undefined, ax: undefined, inputCleanup: undefined, browserCleanup: undefined, launchAttempted:false };
    quarantined.add(state);
    const releaseIfReaped = () => {
      if (state.inputCleanup?.reaped === true && state.inputCleanup.helperPid === state.ax?.helperPid &&
          state.browserCleanup?.cleanupDebt === false && state.browserCleanup.nativeSlotRetained === false) {
        lease.release(); quarantined.delete(state);
      }
    };
    const closeInput = async () => {
      if (state.ax) state.inputCleanup = await state.ax.close();
      releaseIfReaped(); return state.inputCleanup;
    };
    const stopBrowser = async primary => {
      state.browserCleanup = await state.startup.stop(primary);
      releaseIfReaped(); return state.browserCleanup;
    };
    try {
      const fixtureRoot = realpathSync(mkdtempSync('/tmp/aux-native-journey-'));
      mkdirSync(join(fixtureRoot, 'profile'), {mode:0o700});
      validateDisposableProfile(join(fixtureRoot, 'profile'));
      const fixturePin = path => { const value = lstatSync(path); assert.ok(value.isDirectory() && !value.isSymbolicLink()); assert.equal(value.uid, process.getuid()); assert.equal(value.mode & 0o777, 0o700); return [value.dev, value.ino]; };
      const rootPin = fixturePin(fixtureRoot), profilePin = fixturePin(join(fixtureRoot, 'profile'));
      const assertFixture = () => { assert.deepEqual(fixturePin(fixtureRoot),rootPin); assert.deepEqual(fixturePin(join(fixtureRoot,'profile')),profilePin); };
      signal.throwIfAborted(); lease.validate();
      state.launchAttempted = true;
      state.startup = await launchStockStartupHelper({manifestPath:fixed.manifestPath, manifestSha256:fixed.manifestSha256, helper:fixed.helper,
        compilerAudit:fixed.compilerAudit, metadataWriter:fixed.metadataWriter, browser:fixed.browser,
        fixtureRoot, trial:randomBytes(16).toString('hex'), signal});
      const cold = await state.startup.presentation(); signal.throwIfAborted(); lease.validate();
      const attachment = readStockStartupOwner(state.startup);
      attachment.assertLive(); assertFixture(); assert.equal(attachment.browserPid, cold.record.browserPid);
      state.ax = await createAxClient(cold.record.browserPid, {compilerArtifact:lease});
      signal.throwIfAborted(); lease.matchOriginalClient(state.ax); attachment.assertLive();
      const readInputHelperIdentity = async () => {
        lease.validate(); attachment.assertLive(); signal.throwIfAborted();
        assertFixture(); assert.equal(attachment.browserPid, cold.record.browserPid);
        const record = await state.ax.request('warmWindowIdentity');
        lease.matchOriginalClient(state.ax); attachment.assertLive(); assertFixture(); signal.throwIfAborted();
        assert.equal(record.targetProcessUuid, attachment.coldKernel.record.browserImageUuid);
        assert.equal(record.targetProcessStartMachTicks, attachment.coldKernel.record.browserStartMachTicks);
        return decodeWarmWindowHelperIdentity(record, {targetPid:cold.record.browserPid,
          helperPid:state.ax.helperPid, artifact:lease.artifact});
      };
      // Refuse a mismatched loaded image before any native Prepare or HID.
      await readInputHelperIdentity();
      return Object.freeze({fixtureRoot,
        startup:Object.freeze({...state.startup, stop:stopBrowser}),
        ax:Object.freeze({...state.ax, close:closeInput}),
        readInputHelperIdentity,
        async readIdentity() {
          lease.validate(); attachment.assertLive(); assertFixture(); signal.throwIfAborted();
          const value = await attachment.readIdentity();
          lease.validate(); attachment.assertLive(); assertFixture(); signal.throwIfAborted();
          await readInputHelperIdentity();
          return value;
        }});
    } catch (primary) {
      const cleanup = {input:undefined,browser:undefined,failures:[]};
      try { cleanup.input = await closeInput(); } catch (error) { cleanup.failures.push(error); }
      if (state.startup) {
        try { cleanup.browser = await stopBrowser(primary); } catch (error) { cleanup.failures.push(error); }
        if (!state.ax && cleanup.browser?.cleanupDebt === false && cleanup.browser.nativeSlotRetained === false) {
          lease.release(); quarantined.delete(state);
        }
      } else if (!state.launchAttempted || (primary.cleanup?.cleanupDebt === false && primary.nativeSlotRetained === false)) {
        lease.release(); quarantined.delete(state);
      }
      state.primary = primary; // Retain original failure privately without a public self-cycle.
      primary.warmFactoryCleanup = cleanup;
      if (quarantined.has(state)) primary.warmCleanupOwner = Object.freeze({closeInput,
        stopBrowser: state.startup ? stopBrowser : undefined});
      throw primary;
    }
  };
}
