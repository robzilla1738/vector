import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { acquireNativeSlot } from '../../../scripts/native-slot.mjs';
import { validateJourneyBundle } from './app.mjs';
import { retainStartupHelperArtifact } from './startup-helper-artifact.mjs';
import { ownStartupHelperChannel } from './startup-helper-channel.mjs';
import { createStartupNativeStream } from './startup-native-stream.mjs';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const writer = fileURLToPath(new URL('../startup-build-writer.py', import.meta.url));

/** One fixed Aux startup. The original native launch stamp is produced by the
 * compiled helper, never this Node caller. Stock has no implemented endpoint.
 * The returned owner retains its slot/artifact FDs if cleanup is unproved. */
export async function launchAuxStartupHelper({ bundle, fixtureRoot, trial, helper, compilerAudit, metadataWriter, signal }) {
  assert.equal(process.platform, 'darwin'); assert.match(trial ?? '', /^[a-f0-9]{32}$/);
  assert.ok(metadataWriter && typeof metadataWriter.interpreter === 'string');
  assert.equal(realpathSync(metadataWriter.interpreter), metadataWriter.interpreter);
  assert.equal(metadataWriter.sourceSha256, hash(readFileSync(writer)));
  assert.equal(metadataWriter.interpreterSha256, hash(readFileSync(metadataWriter.interpreter)));
  assert.deepEqual(Object.keys(metadataWriter).sort(), ['interpreter', 'interpreterSha256', 'sourceSha256'].sort());
  const retained = retainStartupHelperArtifact(helper, compilerAudit);
  let slot, owner, child, released = false;
  const stream = createStartupNativeStream();
  const release = () => {
    if (released) return;
    released = true; signal?.removeEventListener('abort', abort); retained.release(); slot?.release();
  };
  const abort = () => {
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
    child = spawn(helper.path, [], { stdio: ['pipe', 'pipe', 'pipe'] });
    // spawn's native PID is available synchronously on success. Failed spawn
    // has no child authority and must still consume its error/close events.
    if (!Number.isSafeInteger(child.pid) || child.pid <= 0) {
      await new Promise((resolve, reject) => { child.once('error', reject); child.once('close', resolve); });
      throw new Error('Startup helper did not establish an original direct child');
    }
    owner = ownStartupHelperChannel(child, { kind: 'aux', trial, launcherPid: child.pid,
      helperBinarySha256: helper.sha256, helperSourceSha256: helper.sourceSha256 }, { onNativeStderr: bytes => stream.push(bytes) });
    child.stdin.on('error', error => { stream.refuse(error); void owner.stop(error); });
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
    else child.stdin.end(JSON.stringify({ kind: 'aux', bundle, fixtureRoot, trial }));
    const closed = owner.closed.then(result => {
      stream.finish();
      if (result.primary) stream.refuse(result.primary);
      if (result.cleanup) stream.refuse(result.cleanup);
      if (!result.cleanupDebt) release();
      return result;
    });
    return Object.freeze({
      originalHelperPid: owner.originalHelperPid,
      launched: owner.launched,
      async presentation() {
        try {
          const launch = await owner.launched;
          retained.validate();
          const measured = await stream.measured(launch, { helperImageUuid: helper.imageUuid });
          retained.validate();
          return measured;
        } catch (error) {
          stream.refuse(error);
          const result = await owner.stop(error);
          if (!result.cleanupDebt) release();
          error.cleanup = result; error.nativeSlotRetained = !released;
          throw error;
        }
      },
      async stop(error) {
        if (error) stream.refuse(error);
        const result = await owner.stop(error);
        if (!result.cleanupDebt) release();
        // Even after a hardware receipt, success must wait for complete stream
        // and explicit cleanup; a later duplicate/cleanup failure stays failed.
        if (!result.cleanupDebt && !result.primary) stream.assertComplete();
        return { ...result, nativeSlotRetained: !released, nativeStderr: owner.nativeStderr };
      },
      closed,
    });
  } catch (error) {
    stream.refuse(error);
    if (owner) {
      const result = await owner.stop(error);
      if (!result.cleanupDebt) release();
      error.cleanup = result;
      error.nativeSlotRetained = !released;
    } else release();
    throw error;
  }
}
