import { extractOriginalGuestFixtureRecord } from './guest-original-record.mjs';
import { decodeNativeCommandReady, decodeNativeCommandPresentation, extractNativeCommandFixtureRecord } from './native-command-presentation.mjs';
import assert from 'node:assert/strict';
import { StringDecoder } from 'node:string_decoder';
import { constants, closeSync, fstatSync, lstatSync, openSync, readFileSync, realpathSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { basename, dirname } from 'node:path';
const guestOperations = new Set(['prepareGuestSplitDropPresentation', 'prepareGuestDividerFramePresentation', 'prepareGuestTabSwitchPresentation', 'completeGuestPresentation']);
const operations = new Set(['commandPresentationSnapshot', 'prepareCdpStopMeasurement', 'prepareCdpTakeoverMeasurement', 'completeCdpRetirementMeasurement', 'prepareLittleWindowPresentation', 'completeLittleWindowPresentation', 'prepareOrganizationAutoArchiveWork', 'prepareOrganizationLiveFolderWork', 'completeOrganizationWork', 'prepareGuestSplitDropPresentation', 'prepareGuestDividerFramePresentation', 'prepareGuestTabSwitchPresentation', 'completeGuestPresentation', 'sampleShellMemory', 'sampleProcessMemory', 'sampleStockProcessMemory', 'prepareStockWarmWindow', 'completeStockWarmWindow', 'prepareAuxWarmWindow', 'completeAuxWarmWindow', 'prepareSubagentMemoryWorkload']);
const prefix = 'AUX_NATIVE_FIXTURE_REPLY_V1 ';
const refusalPrefix = 'AUX_NATIVE_FIXTURE_REFUSAL_V1 ';
function ownedFixture(userDataDir) {
  assert.ok(!lstatSync(userDataDir).isSymbolicLink(), 'Profile cannot be a symlink');
  const profile = realpathSync(userDataDir), root = dirname(profile);
  assert.equal(basename(profile), 'profile');
  assert.match(root, /^\/private\/tmp\/aux-native-journey-[A-Za-z0-9_-]+$/);
  const checkDirectory = path => {
    const value = lstatSync(path); assert.ok(value.isDirectory() && !value.isSymbolicLink() && value.uid === process.getuid() && (value.mode & 0o777) === 0o700, 'Foreign or unprotected fixture directory');
    assert.equal(realpathSync(path), path); return value;
  };
  const rootPin = checkDirectory(root), profilePin = checkDirectory(profile);
  return { profile, root, rootPin, profilePin, checkDirectory };
}
const writerSource = fileURLToPath(new URL('./performance-mailbox-writer.py', import.meta.url));
function writerMetadata() {
  const source = realpathSync(writerSource), interpreter = realpathSync('/usr/bin/python3');
  const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex');
  assert.ok(lstatSync(source).isFile() && lstatSync(interpreter).isFile());
  return { source, sourceSha256: digest(source), interpreter, interpreterSha256: digest(interpreter) };
}
function writeOwned(value, pins) {
  assert.deepEqual(writerMetadata(), pins, 'Fixture writer bytes changed');
  execFileSync(pins.interpreter, ['-I', pins.source], { input: JSON.stringify(value), timeout: 5000, maxBuffer: 1024, stdio: ['pipe', 'pipe', 'pipe'] });
  assert.deepEqual(writerMetadata(), pins, 'Fixture writer changed during operation');
}
function fixedRequest(fixture, action) {
  return { profile: fixture.profile, rootDevice: fixture.rootPin.dev, rootInode: fixture.rootPin.ino,
    profileDevice: fixture.profilePin.dev, profileInode: fixture.profilePin.ino, action };
}
export function preparePerformanceMailbox(userDataDir) {
  const fixture = ownedFixture(userDataDir);
  writeOwned(fixedRequest(fixture, 'reset'), writerMetadata());
}
// Owned test mailbox only: fixed operations cannot carry window, URL or script authority.
export function createPerformanceMailbox({ userDataDir, pid, generation }) {
  assert.ok(Number.isInteger(pid) && pid > 0 && Number.isInteger(generation) && generation > 0, 'Missing direct child generation');
  const { profile, root, rootPin, profilePin, checkDirectory } = ownedFixture(userDataDir);
  const rootFd = openSync(root, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
  const writer = writerMetadata();
  try { const fdPin = fstatSync(rootFd); assert.equal(fdPin.dev, rootPin.dev); assert.equal(fdPin.ino, rootPin.ino); } catch (error) { closeSync(rootFd); throw error; }
  const verify = () => {
    const currentFd = fstatSync(rootFd); assert.equal(currentFd.dev, rootPin.dev); assert.equal(currentFd.ino, rootPin.ino);
    for (const [path, pin] of [[root, rootPin], [profile, profilePin]]) {
      const actual = checkDirectory(path); assert.equal(actual.dev, pin.dev); assert.equal(actual.ino, pin.ino, 'Fixture replaced');
    }
  };
  let sequence = 0, pending, failure, lastReceipt, disposed = false, bytes = 0, count = 0, partial = '', decoder = new StringDecoder('utf8');
  let commandReadyCount = 0, lastCommandSample = 0n;
  const fail = error => { failure ??= error; if (pending) { clearTimeout(pending.timer); pending.readyReject?.(failure); pending.reject(failure); pending = undefined; } };
  function publish(method) {
    verify();
    writeOwned({ ...fixedRequest({ profile, rootPin, profilePin }, 'publish'), sequence: String(sequence), operation: method }, writer);
    verify();
  }
  return {
    get writer() { return structuredClone(writer); },
    get lastReceipt() { return lastReceipt ? structuredClone(lastReceipt) : undefined; },
    invoke(method, timeoutMs = 15000) {
      if (failure || disposed) return Promise.reject(failure ?? new Error('Private mailbox disposed'));
      try { assert.ok(operations.has(method), 'Unknown fixed private operation'); assert.ok(!pending, 'Concurrent mailbox transaction'); assert.ok(Number.isInteger(timeoutMs) && timeoutMs > 0 && timeoutMs <= 30000); assert.ok(++sequence <= 4000, 'Private mailbox exhausted'); }
      catch (error) { return Promise.reject(error); }
      return new Promise((resolve, reject) => {
        pending = { resolve, reject, method, sequence: String(sequence), timer: setTimeout(() => fail(new Error('Private native fixture reply timeout')), timeoutMs) };
        try { publish(method); } catch (error) { fail(error); }
      });
    },
    waitForCommandPresentationReady() {
      if (failure || disposed) return Promise.reject(failure ?? new Error('Private mailbox disposed'));
      if (!pending || pending.method !== 'commandPresentationSnapshot') return Promise.reject(new Error('No original pending command presentation'));
      if (pending.commandReady) return Promise.resolve(structuredClone(pending.commandReady));
      pending.readyPromise ??= new Promise((resolve, reject) => { pending.readyResolve = resolve; pending.readyReject = reject; });
      return pending.readyPromise;
    },
    write(chunk, source) {
      if (failure || disposed) return;
      try {
        assert.equal(source?.pid, pid); assert.equal(source?.generation, generation); assert.ok(Buffer.isBuffer(chunk));
        bytes += chunk.length; assert.ok(bytes <= 2 * 1024 * 1024, 'Private stderr overflow'); partial += decoder.write(chunk);
        let end;
        while ((end = partial.indexOf('\n')) !== -1) {
          const text = partial.slice(0, end); partial = partial.slice(end + 1); assert.ok(Buffer.byteLength(text) <= 16384, 'Private reply line overflow');
          if (text.startsWith(refusalPrefix)) {
            const refusal = JSON.parse(text.slice(refusalPrefix.length));
            assert.deepEqual(Object.keys(refusal).sort(), ['producer', 'version', 'pid', 'status', 'reason'].sort());
            assert.equal(refusal.producer, 'aux-native-fixture-refusal'); assert.equal(refusal.version, 1); assert.equal(refusal.pid, pid);
            assert.equal(refusal.status, 'refused'); assert.equal(refusal.reason, 'invalid_private_mailbox');
            const error = new Error(`Original native mailbox refusal: ${refusal.reason}`); error.nativeRaw = text; throw error;
          }
          if (text.startsWith('AUX_NATIVE_COMMAND_PRESENTATION_READY_V1 ')) {
            assert.ok(pending?.method === 'commandPresentationSnapshot', 'Unrequested command readiness');
            assert.ok(!pending.commandReady, 'Repeated original command readiness');
            assert.ok(++commandReadyCount <= 4000, 'Command readiness exhausted');
            const record = decodeNativeCommandReady(text);
            assert.ok(BigInt(record.sampleSequence) > lastCommandSample, 'Stale original command sample');
            lastCommandSample = BigInt(record.sampleSequence); verify();
            pending.commandReady = { raw: text, pid, generation, sequence: pending.sequence, record };
            pending.readyResolve?.(structuredClone(pending.commandReady));
            continue;
          }
          if (!text.startsWith(prefix)) continue;
          assert.ok(++count <= 4000, 'Private reply count exhausted'); const raw = JSON.parse(text.slice(prefix.length));
          const recordRaw = raw.operation === 'commandPresentationSnapshot' ? extractNativeCommandFixtureRecord(text) : guestOperations.has(raw.operation) ? extractOriginalGuestFixtureRecord(text) : JSON.stringify(raw.record);
          assert.deepEqual(Object.keys(raw).sort(), ['producer', 'version', 'pid', 'windowId', 'sequence', 'operation', 'record'].sort());
          assert.equal(raw.producer, 'aux-native-fixture-reply'); assert.equal(raw.version, 1); assert.equal(raw.pid, pid);
          assert.ok(Number.isInteger(raw.windowId) && raw.windowId > 0 && operations.has(raw.operation));
          assert.ok(pending, 'Unrequested private reply'); assert.equal(raw.sequence, pending.sequence); assert.equal(raw.operation, pending.method);
          assert.ok(raw.record && typeof raw.record === 'object' && !Array.isArray(raw.record));
          if (raw.operation === 'completeAuxWarmWindow' && raw.record.status === 'measured') {
            assert.equal(raw.record.producer, 'aux-native-warm-window');
            assert.equal(raw.record.preparedWindowId, raw.windowId);
            assert.ok(Number.isInteger(raw.record.windowId) && raw.record.windowId > 0 && raw.record.windowId !== raw.windowId);
          } else if (raw.record.windowId !== undefined) assert.equal(raw.record.windowId, raw.windowId, 'Native wrapper scope mismatch');
          if (raw.operation === 'commandPresentationSnapshot') {
            if (raw.record.status === 'measured') {
              assert.ok(pending.commandReady, 'Measured command without original readiness');
              decodeNativeCommandPresentation(recordRaw, pending.commandReady.raw);
            } else {
              assert.equal(raw.record.status, 'refused'); assert.equal(raw.record.measured, false);
              pending.readyReject?.(new Error('Original native command preparation refused'));
            }
          }
          verify(); lastReceipt = { ...(pending.commandReady ? { commandReady: structuredClone(pending.commandReady) } : {}), raw: text, sequence: raw.sequence, operation: raw.operation, pid, generation, recordRaw }; const waiter = pending; pending = undefined; clearTimeout(waiter.timer); waiter.resolve(recordRaw);
        }
        assert.ok(Buffer.byteLength(partial) <= 16384, 'Private partial reply overflow');
      } catch (error) { fail(error); }
    },
    dispose(reason = new Error('Private fixture exited')) { if (disposed) return; disposed = true; fail(reason); partial = ''; closeSync(rootFd); },
  };
}
