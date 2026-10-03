import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { readPackagedRuntimePair, readPackagedRuntimePairBytes } from './packaged-runtime-pair-artifact.mjs';
import { readNativeWindowCompilerExecutable } from './native-window-compiler-artifact.mjs';
import { createAppearanceFileReader } from './appearance-file-reader.mjs';
import { normalizeNativeAppearance } from './appearance-provenance.mjs';

const freeze = value => { if (value && typeof value === 'object' && !Object.isFrozen(value)) { for (const child of Object.values(value)) freeze(child); Object.freeze(value); } return value; };

// Called only by the original App's LS branch. Byte admission stays separate
// from the actual active native/runtime handshake; neither substitutes for it.
export async function createLaunchServicesAppearanceOwner({ original, pair, helper, candidate }) {
  const artifact = readPackagedRuntimePairBytes(pair), admitted = readPackagedRuntimePair(pair);
  const pid = original.pid, generation = original.generation, helperPid = helper.helperPid;
  assert.ok(Number.isInteger(pid) && pid > 0 && Number.isFinite(generation) && generation > 0);
  assert.equal(candidate.shellDigest, artifact.shellDigest);
  assert.deepEqual(candidate.productIdentity, artifact.productIdentity);
  for (const key of ['buildId', 'sourceCommit', 'manifestHash']) assert.equal(candidate.native[key], artifact.native[key]);
  readNativeWindowCompilerExecutable(admitted.compilerArtifact, helper.helperSource);
  assert.equal(helper.helperExecutable, admitted.compilerArtifact.executablePath);
  let retired = false, failure, busy = false, reader, kernel, receipt, lastIdentity;
  const proofs = new Map();
  function current() {
    assert.ok(!retired, 'Original LaunchServices appearance owner retired'); if (failure) throw failure;
    original.assertLive(); artifact.validate(); admitted.compilerArtifact.validate();
    assert.equal(original.pid, pid); assert.equal(original.generation, generation);
    assert.equal(helper.helperPid, helperPid);
    readNativeWindowCompilerExecutable(admitted.compilerArtifact, helper.helperSource);
  }
  async function identity() {
    current(); const actual = await original.readIdentity(); current();
    assert.deepEqual(actual.runtime, artifact.productIdentity, 'Original active runtime changed');
    for (const key of ['buildId', 'sourceCommit', 'manifestHash']) assert.equal(actual.native[key], artifact.native[key]);
    if (receipt) assert.deepEqual(actual.native.nativeAppearanceFileChannel, receipt, 'Original native channel key/identity changed');
    lastIdentity = structuredClone(actual);
    return actual;
  }
  async function kernelIdentity() {
    current(); const actual = await helper.request('warmWindowIdentity'); current();
    assert.deepEqual(Object.keys(actual).sort(), ['producer', 'version', 'targetPid', 'helperPid', 'targetProcessUuid', 'targetProcessStartMachTicks', 'helperProcessUuid', 'helperProcessStartMachTicks'].sort());
    assert.equal(actual.producer, 'aux-native-warm-window-identity'); assert.equal(actual.version, 1);
    assert.equal(actual.targetPid, pid); assert.equal(actual.helperPid, helperPid);
    assert.equal(actual.targetProcessUuid, artifact.image.imageUuid);
    assert.equal(actual.helperProcessUuid, artifact.helper.manifest.output.uuid);
    for (const key of ['targetProcessStartMachTicks', 'helperProcessStartMachTicks']) assert.match(actual[key], /^[1-9][0-9]{0,19}$/);
    if (kernel) assert.deepEqual(actual, kernel, 'Original native/helper kernel generation changed');
    return actual;
  }
  async function revalidate() { await identity(); await kernelIdentity(); current(); }
  try {
    const actual = await identity();
    receipt = structuredClone(actual.native.nativeAppearanceFileChannel);
    assert.ok(receipt, 'Original native capability did not admit a file channel');
    assert.equal(receipt.pid, pid); assert.equal(receipt.buildId, artifact.native.buildId); assert.equal(receipt.sourceCommit, artifact.native.sourceCommit);
    kernel = structuredClone(await kernelIdentity());
    assert.equal(receipt.processUuid, kernel.targetProcessUuid); assert.equal(receipt.processStartMachTicks, kernel.targetProcessStartMachTicks);
    await revalidate();
    reader = createAppearanceFileReader({ root: original.root, capabilityReceipt: receipt, validateOriginal: current, revalidateOriginal: revalidate });
    await reader.read(); // Authenticate original header; no old sample is selectable.
    await revalidate();
  } catch (error) { reader?.retire(); throw error; }
  return Object.freeze({
    async observe(selection) { return select(selection, false); },
    async discoverUtility(selection) { return select(selection, true); },
    proof(raw) { current(); assert.ok(proofs.has(raw), 'No original signed appearance receipt'); return proofs.get(raw); },
    stopObserving() { retired = true; reader.seal(); proofs.clear(); },
    async removeAfterOriginalRetirement() {
      assert.ok(retired, 'Original observation must stop before cleanup');
      const confirm = async () => {
        artifact.validate(); admitted.compilerArtifact.validate();
        assert.equal(original.pid, pid); assert.equal(original.generation, generation);
        assert.equal(await original.confirmRetirement(), true);
        artifact.validate(); admitted.compilerArtifact.validate(); return true;
      };
      return await reader.removeAfterOriginalRetirement(confirm);
    },
    retire() { retired = true; reader.retire(); proofs.clear(); },
  });
  async function select({ windowId, browserWindowId, windowKind, notBefore, timeoutMs = 5000 }, utility) {
      current(); assert.ok(!busy, 'Concurrent original LaunchServices appearance observation');
      if (utility) {
        assert.ok(typeof browserWindowId === 'string' && /^[1-9][0-9]*$/.test(browserWindowId) && BigInt(browserWindowId) <= 2147483647n);
        assert.ok(['normal', 'little'].includes(windowKind));
      } else assert.ok(Number.isInteger(windowId) && windowId > 0);
      assert.ok(typeof notBefore === 'string' && Number.isFinite(Date.parse(notBefore)));
      assert.ok(Number.isInteger(timeoutMs) && timeoutMs > 0 && timeoutMs <= 10000);
      busy = true; const deadline = performance.now() + timeoutMs;
      try {
        await revalidate(); await reader.read(); // Drain preceding samples before reservation.
        while (performance.now() < deadline) {
          const records = await reader.read(); current(); assert.ok(performance.now() <= deadline, 'Original appearance deadline exceeded');
          let selected;
          for (const record of records) {
            const raw = JSON.parse(record.raw);
            normalizeNativeAppearance(record.raw, { candidate, targetPid: pid, windowId: raw.windowId,
              startedAt: new Date(0).toISOString(), completedAt: new Date().toISOString() });
            assert.ok(['normal', 'little'].includes(raw.windowKind), 'Foreign file appearance window kind');
            proofs.set(record.raw, freeze({ producer: 'aux-native-launchservices-appearance-proof', version: 1,
              header: Object.freeze({ ...receipt }), originalHeaderBase64: reader.header(), ...record,
              packagedRuntimeArtifact: artifact.artifact, activeIdentity: structuredClone(lastIdentity),
              kernel: Object.freeze({ ...kernel }), process: Object.freeze({ pid, launchServicesGeneration: generation }) }));
            if ((utility ? raw.utilityOwnership?.browserWindowId === browserWindowId && raw.utilityOwnership?.windowKind === windowKind : raw.windowId === windowId) && raw.observedAtUnixMs >= Date.parse(notBefore)) {
              assert.ok(!selected, 'Ambiguous original appearance sample'); selected = record.raw;
            }
          }
          if (selected) { await revalidate(); assert.ok(performance.now() <= deadline, 'Original appearance deadline exceeded'); return selected; }
          await delay(25); current();
        }
        throw new Error('No fresh signed original LaunchServices appearance record');
      } catch (error) { failure ??= error; throw failure; }
      finally { busy = false; }
  }
}
