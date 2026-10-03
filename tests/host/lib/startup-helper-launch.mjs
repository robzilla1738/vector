import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { acquireNativeSlot } from '../../../scripts/native-slot.mjs';
import { validateJourneyBundle } from './app.mjs';
import { retainStartupHelperArtifact } from './startup-helper-artifact.mjs';
import { retainStartupBrowserArtifact } from './startup-browser-artifact.mjs';
import { ownStartupHelperChannel } from './startup-helper-channel.mjs';
import { createStartupNativeStream } from './startup-native-stream.mjs';
import { preparePerformanceMailbox, createPerformanceMailbox } from './performance-mailbox.mjs';
import { createWarmStderrRelay } from './startup-warm-stderr.mjs';
import { decodeAuxWarmReady, decodeAuxWarmPresentation } from './native-aux-warm-protocol.mjs';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const startupAttachments = new WeakMap();
export function readAuxStartupAttachment(owner) {
  const observed = startupAttachments.get(owner);
  assert.ok(observed, 'Foreign original Aux startup owner'); observed.assertLive();
  return observed;
}
const writer = fileURLToPath(new URL('../startup-build-writer.py', import.meta.url));

/** One fixed cold Aux startup. The original native launch stamp is produced by the
 * compiled helper, never this Node caller. Stock has no implemented endpoint.
 * The returned owner retains its slot/artifact FDs if cleanup is unproved. */
export async function launchAuxStartupHelper({ bundle, fixtureRoot, trial, helper, compilerAudit, metadataWriter, browser, signal }) {
  assert.equal(process.platform, 'darwin'); assert.match(trial ?? '', /^[a-f0-9]{32}$/);
  assert.ok(metadataWriter && typeof metadataWriter.interpreter === 'string');
  assert.equal(realpathSync(metadataWriter.interpreter), metadataWriter.interpreter);
  assert.equal(metadataWriter.sourceSha256, hash(readFileSync(writer)));
  assert.equal(metadataWriter.interpreterSha256, hash(readFileSync(metadataWriter.interpreter)));
  assert.deepEqual(Object.keys(metadataWriter).sort(), ['interpreter', 'interpreterSha256', 'sourceSha256'].sort());
  const retained = retainStartupHelperArtifact(helper, compilerAudit);
  let slot, owner, child, browserLease, verifiedClosed, released = false;
  let originalLaunch, coldPresentation, mailbox, ready, warmUsed = false;
  const generation = randomBytes(6).readUIntBE(0, 6) + 1;
  const warmStderr = createWarmStderrRelay('aux');
  const stream = createStartupNativeStream();
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
    bundle = validateJourneyBundle(bundle);
    if (signal?.aborted) throw signal.reason ?? new Error('Startup trial cancelled');
    slot = await acquireNativeSlot({ signal });
    retained.validate();
    browserLease = retainStartupBrowserArtifact(bundle, browser);
    const build = { producer: 'aux-native-startup-build', version: 1, kind: 'aux', trial,
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
    owner = ownStartupHelperChannel(child, { kind: 'aux', trial, launcherPid: child.pid,
      helperBinarySha256: helper.sha256, helperSourceSha256: helper.sourceSha256, browser: browserLease.identity }, { onNativeStderr: bytes => { stream.push(bytes); warmStderr.push(bytes); } });
    child.stdin.on('error', error => { stream.refuse(error); void owner.stop(error); });
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
    else child.stdin.end(JSON.stringify({ kind: 'aux', bundle, fixtureRoot, trial,
      browserBinarySha256: browser.sha256, browserImageUuid: browser.imageUuid }));
    const closed = verifiedClosed = owner.closed.then(result => {
      warmStderr.retire(new Error('Original startup helper channel closed'));
      try { retained.validate(); browserLease.validate(); }
      catch (error) { stream.refuse(error); result = { ...result, primary: result.primary ?? error }; }
      stream.finish();
      if (result.primary) stream.refuse(result.primary);
      if (result.cleanup) stream.refuse(result.cleanup);
      if (!result.cleanupDebt) release();
      return result;
    });
    const startup = Object.freeze({
      originalHelperPid: owner.originalHelperPid,
      launched: owner.launched,
      async presentation() {
        try {
          const launch = originalLaunch = await owner.launched;
          if (!mailbox) {
            mailbox = createPerformanceMailbox({ userDataDir: join(fixtureRoot, 'profile'), pid: launch.record.browserPid, generation });
            warmStderr.attach(launch, mailbox, generation);
          }
          const cold = await owner.coldMeasured;
          retained.validate(); browserLease.validate();
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
          assert.ok(coldPresentation && originalLaunch && mailbox, 'Original cold receipt is required');
          assert.ok(!warmUsed, 'One additional window per original admitted lifetime'); warmUsed = true;
          warmStderr.assertLive(); retained.validate(); browserLease.validate();
          await mailbox.invoke('prepareAuxWarmWindow', 5000);
          const raw = mailbox.lastReceipt; assert.equal(raw?.operation, 'prepareAuxWarmWindow');
          ready = decodeAuxWarmReady(`${raw.raw}\n`, originalLaunch, coldPresentation, coldPresentation.cold.record, raw.sequence);
          warmStderr.assertLive(); retained.validate(); browserLease.validate();
          return ready;
        } catch (error) { warmStderr.refuse(error); void owner.stop(error); throw error; }
      },
      async completeWarmWindow() {
        try {
          assert.ok(ready, 'Original native Ready must precede physical Cmd+N'); warmStderr.assertLive();
          await mailbox.invoke('completeAuxWarmWindow', 5000);
          const raw = mailbox.lastReceipt; assert.equal(raw?.operation, 'completeAuxWarmWindow');
          const measured = decodeAuxWarmPresentation(`${raw.raw}\n`, originalLaunch, ready, raw.sequence, helper.imageUuid);
          warmStderr.assertLive(); retained.validate(); browserLease.validate();
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
    const assertOriginalAttachment = () => {
        assert.equal(startupAttachments.get(startup), attachment, 'Replaced original startup attachment');
        assert.ok(owner.active && coldPresentation && originalLaunch && !released,
          'Retired or not-yet-measured original startup owner');
        retained.validate(); browserLease.validate();
        assert.equal(originalLaunch.record.kind, 'aux');
        assert.equal(originalLaunch.record.launcherPid, owner.originalHelperPid);
        assert.equal(coldPresentation.record.browserPid, originalLaunch.record.browserPid);
        assert.ok(owner.active && !released, 'Original child changed during attachment validation');
    };
    const attachment = Object.freeze({ bundle, fixtureRoot, userDataDir: join(fixtureRoot, 'profile'),
      generation,
      get browserPid() { assertOriginalAttachment(); return originalLaunch.record.browserPid; },
      assertLive: assertOriginalAttachment,
      closed,
      stop() { return startup.stop(); },
    });
    startupAttachments.set(startup, attachment);
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
