import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { acquireNativeSlot } from '../../../scripts/native-slot.mjs';
import { dirname, join } from 'node:path';
import { readStockBuildIdentity } from './stock-memory-app.mjs';
import { retainStartupHelperArtifact } from './startup-helper-artifact.mjs';
import { retainStartupBrowserArtifact } from './startup-browser-artifact.mjs';
import { ownStartupHelperChannel } from './startup-helper-channel.mjs';
import { createStockStartupNativeStream } from './startup-stock-native-stream.mjs';
import { preparePerformanceMailbox, createPerformanceMailbox } from './performance-mailbox.mjs';
import { createWarmStderrRelay } from './startup-warm-stderr.mjs';
import { decodeStockWarmReady, decodeStockWarmPresentation } from './native-stock-warm-protocol.mjs';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const stockOwners = new WeakMap();
export function readStockStartupOwner(startup) {
  const scope = stockOwners.get(startup);
  assert.ok(scope, 'Foreign original Stock startup owner'); scope.assertLive();
  return scope;
}
const writer = fileURLToPath(new URL('../startup-build-writer.py', import.meta.url));

/** One fixed cold Stock startup, with the original helper launch and kernel
 * receipt. This never represents a warm additional window or a comparison.
 * The returned owner retains its slot/artifact FDs if cleanup is unproved. */
export async function launchStockStartupHelper({ manifestPath, manifestSha256, fixtureRoot, trial, helper, compilerAudit, metadataWriter, browser, signal }) {
  assert.equal(process.platform, 'darwin'); assert.match(trial ?? '', /^[a-f0-9]{32}$/);
  assert.ok(metadataWriter && typeof metadataWriter.interpreter === 'string');
  assert.equal(realpathSync(metadataWriter.interpreter), metadataWriter.interpreter);
  assert.equal(metadataWriter.sourceSha256, hash(readFileSync(writer)));
  assert.equal(metadataWriter.interpreterSha256, hash(readFileSync(metadataWriter.interpreter)));
  assert.deepEqual(Object.keys(metadataWriter).sort(), ['interpreter', 'interpreterSha256', 'sourceSha256'].sort());
  const retained = retainStartupHelperArtifact(helper, compilerAudit);
  let slot, owner, child, browserLease, verifiedClosed, released = false;
  const stream = createStockStartupNativeStream();
  const warmStderr = createWarmStderrRelay('stock');
  const generation = randomBytes(6).readUIntBE(0, 6) + 1;
  let mailbox, ready, warmUsed = false, coldPresentation;
  let original, bundle;
  const release = () => {
    if (released) return;
    released = true; signal?.removeEventListener('abort', abort); retained.release(); browserLease?.release(); slot?.release();
  };
  const abort = () => {
    warmStderr.refuse(signal.reason instanceof Error ? signal.reason : new Error('Startup trial cancelled'));
    stream.refuse(signal.reason instanceof Error ? signal.reason : new Error('Startup trial cancelled'));
    // The helper owns bounded TERM/KILL/reap of its browser. Do not signal the
    // browser receipt PID or kill the parent out from under that ownership.
    if (owner) void owner.stop(signal.reason instanceof Error ? signal.reason : new Error('Startup trial cancelled'));
  };
  try {
    original = await readStockBuildIdentity(manifestPath, manifestSha256);
    assert.ok(original.executable.endsWith('/Contents/MacOS/Chromium'), 'Fixed original Stock bundle executable required');
    bundle = dirname(dirname(dirname(original.executable)));
    assert.ok(bundle.endsWith('.app'));
    assert.equal(join(bundle, 'Contents/MacOS/Chromium'), original.executable);
    assert.equal(realpathSync(bundle), bundle);
    if (signal?.aborted) throw signal.reason ?? new Error('Startup trial cancelled');
    slot = await acquireNativeSlot({ signal });
    retained.validate();
    browserLease = retainStartupBrowserArtifact(bundle, browser, 'stock');
    const build = { producer: 'aux-native-startup-build', version: 1, kind: 'stock', trial,
      helperBinarySha256: helper.sha256, helperSourceSha256: helper.sourceSha256, helperImageUuid: helper.imageUuid };
    const publicationRaw = execFileSync(metadataWriter.interpreter, [writer], {
      input: JSON.stringify({ fixtureRoot, build }), encoding: 'utf8', timeout: 5000, maxBuffer: 8192,
    });
    const publication = JSON.parse(publicationRaw);
    const buildBytes = JSON.stringify(Object.fromEntries(Object.keys(build).sort().map(key => [key, build[key]])));
    assert.deepEqual(publication, { producer: 'aux-startup-build-writer', version: 1, sha256: hash(buildBytes), bytes: Buffer.byteLength(buildBytes) });
    assert.equal(metadataWriter.sourceSha256, hash(readFileSync(writer)));
    assert.equal(metadataWriter.interpreterSha256, hash(readFileSync(metadataWriter.interpreter)));
    retained.validate();
    if (signal?.aborted) throw signal.reason ?? new Error('Startup trial cancelled');
    preparePerformanceMailbox(join(fixtureRoot, 'profile'));
    child = spawn(helper.path, [], { stdio: ['pipe', 'pipe', 'pipe'] });
    // spawn's native PID is available synchronously on success. Failed spawn
    // has no child authority and must still consume its error/close events.
    if (!Number.isSafeInteger(child.pid) || child.pid <= 0) {
      await new Promise((resolve, reject) => { child.once('error', reject); child.once('close', resolve); });
      throw new Error('Startup helper did not establish an original direct child');
    }
    owner = ownStartupHelperChannel(child, { kind: 'stock', trial, launcherPid: child.pid,
      helperBinarySha256: helper.sha256, helperSourceSha256: helper.sourceSha256, browser: browserLease.identity }, { onNativeStderr: bytes => { stream.push(bytes); warmStderr.push(bytes); } });
    child.stdin.on('error', error => { stream.refuse(error); void owner.stop(error); });
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
    else child.stdin.end(JSON.stringify({ kind: 'stock', bundle, fixtureRoot, trial,
      browserBinarySha256: browser.sha256, browserImageUuid: browser.imageUuid }));
    const closed = verifiedClosed = owner.closed.then(async result => {
      warmStderr.retire(new Error('Original startup helper channel closed'));
      try { retained.validate(); browserLease.validate(); await readStockBuildIdentity(manifestPath, manifestSha256); }
      catch (error) { stream.refuse(error); result = { ...result, primary: result.primary ?? error }; }
      stream.finish();
      if (result.primary) stream.refuse(result.primary);
      if (result.cleanup) stream.refuse(result.cleanup);
      if (!result.cleanupDebt) release();
      return result;
    });
    const originalLaunch = await owner.launched;
    mailbox = createPerformanceMailbox({ userDataDir: join(fixtureRoot, 'profile'), pid: originalLaunch.record.browserPid, generation });
    warmStderr.attach(originalLaunch, mailbox, generation);
    const startup = Object.freeze({
      originalHelperPid: owner.originalHelperPid,
      stockBuildIdentity: Object.freeze({ ...original.identity }),
      launched: owner.launched,
      async presentation() {
        try {
          const launch = await owner.launched;
          const cold = await owner.coldMeasured;
          retained.validate(); browserLease.validate();
          await readStockBuildIdentity(manifestPath, manifestSha256);
          const measured = await stream.measured(launch, { helperImageUuid: helper.imageUuid });
          retained.validate(); browserLease.validate();
          coldPresentation = Object.freeze({ ...measured, cold });
          return coldPresentation;
        } catch (error) {
          stream.refuse(error);
          const stopped = await owner.stop(error);
          const result = !stopped.cleanupDebt && verifiedClosed ? await verifiedClosed : stopped;
          if (!result.cleanupDebt) release();
          error.cleanup = result; error.nativeSlotRetained = !released;
          throw error;
        }
      },
      async prepareWarmWindow() {
        try {
          assert.ok(coldPresentation, 'Original validated cold presentation must precede warm preparation');
          assert.ok(!warmUsed, 'One added window per original cold lifetime'); warmUsed = true;
          warmStderr.assertLive(); assertLive(); await scope.readIdentity(); assertLive();
          await mailbox.invoke('prepareStockWarmWindow', 5000);
          assertLive(); warmStderr.assertLive(); await scope.readIdentity(); assertLive();
          const raw = mailbox.lastReceipt; assert.ok(raw && raw.operation === 'prepareStockWarmWindow');
          ready = decodeStockWarmReady(`${raw.raw}\n`, originalLaunch, coldPresentation, coldPresentation.cold.record, raw.sequence);
          return ready;
        } catch (error) { warmStderr.refuse(error); void owner.stop(error); throw error; }
      },
      async completeWarmWindow() {
        try {
          assert.ok(ready, 'Original native Ready acknowledgement required before Cmd+N');
          warmStderr.assertLive(); assertLive();
          await mailbox.invoke('completeStockWarmWindow', 5000);
          assertLive(); warmStderr.assertLive();
          const raw = mailbox.lastReceipt; assert.ok(raw && raw.operation === 'completeStockWarmWindow');
          const measured = decodeStockWarmPresentation(`${raw.raw}\n`, originalLaunch, ready,
            { expectedSequence: raw.sequence, launcherImageUuid: helper.imageUuid });
          retained.validate(); browserLease.validate();
          await scope.readIdentity(); assertLive(); warmStderr.assertLive();
          return Object.freeze({ ...measured, ready, cold: coldPresentation.cold });
        } catch (error) { warmStderr.refuse(error); void owner.stop(error); throw error; }
      },
      async stop(error) {
        if (error) stream.refuse(error);
        const stopped = await owner.stop(error);
          const result = !stopped.cleanupDebt && verifiedClosed ? await verifiedClosed : stopped;
        if (!result.cleanupDebt) release();
        // Even after a hardware receipt, success must wait for complete stream
        // and explicit cleanup; a later duplicate/cleanup failure stays failed.
        if (!result.cleanupDebt && !result.primary) stream.assertComplete();
        return { ...result, nativeSlotRetained: !released, nativeStderr: owner.nativeStderr };
      },
      closed,
    });
    const assertLive = () => {
      assert.equal(stockOwners.get(startup), scope, 'Replaced original Stock owner');
      assert.ok(owner.active && coldPresentation && !released, 'Retired or unmeasured original Stock owner');
      retained.validate(); browserLease.validate();
      assert.equal(originalLaunch.record.kind, 'stock');
      assert.equal(originalLaunch.record.launcherPid, owner.originalHelperPid);
      assert.equal(coldPresentation.record.browserPid, originalLaunch.record.browserPid);
      assert.ok(owner.active && !released, 'Original Stock child retired during validation');
    };
    const scope = Object.freeze({
      fixtureRoot, generation, assertLive,
      get browserPid() { assertLive(); return originalLaunch.record.browserPid; },
      get coldKernel() { assertLive(); return coldPresentation.cold; },
      async readIdentity() {
        assertLive();
        const current = await readStockBuildIdentity(manifestPath, manifestSha256);
        assertLive(); assert.deepEqual(current.identity, original.identity);
        return Object.freeze({ ...current.identity });
      },
    });
    stockOwners.set(startup, scope);
    return startup;
  } catch (error) {
    stream.refuse(error); warmStderr.refuse(error);
    if (owner) {
      const stopped = await owner.stop(error);
          const result = !stopped.cleanupDebt && verifiedClosed ? await verifiedClosed : stopped;
      if (!result.cleanupDebt) release();
      error.cleanup = result;
      error.nativeSlotRetained = !released;
    } else release();
    throw error;
  }
}
