import assert from 'node:assert/strict';
import { StringDecoder } from 'node:string_decoder';
import { constants, closeSync, fstatSync, lstatSync, openSync, readFileSync, realpathSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { basename, dirname } from 'node:path';
const operations = new Set(['prepareGuestSplitDropPresentation', 'prepareGuestDividerFramePresentation', 'prepareGuestTabSwitchPresentation', 'completeGuestPresentation', 'sampleShellMemory']);
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
  const fail = error => { failure ??= error; if (pending) { clearTimeout(pending.timer); pending.reject(failure); pending = undefined; } };
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
          if (!text.startsWith(prefix)) continue;
          assert.ok(++count <= 4000, 'Private reply count exhausted'); const raw = JSON.parse(text.slice(prefix.length));
          assert.deepEqual(Object.keys(raw).sort(), ['producer', 'version', 'pid', 'windowId', 'sequence', 'operation', 'record'].sort());
          assert.equal(raw.producer, 'aux-native-fixture-reply'); assert.equal(raw.version, 1); assert.equal(raw.pid, pid);
          assert.ok(Number.isInteger(raw.windowId) && raw.windowId > 0 && operations.has(raw.operation));
          assert.ok(pending, 'Unrequested private reply'); assert.equal(raw.sequence, pending.sequence); assert.equal(raw.operation, pending.method);
          assert.ok(raw.record && typeof raw.record === 'object' && !Array.isArray(raw.record));
          if (raw.record.windowId !== undefined) assert.equal(raw.record.windowId, raw.windowId, 'Native wrapper scope mismatch');
          verify(); lastReceipt = { raw: text, sequence: raw.sequence, operation: raw.operation, pid, generation, recordRaw: JSON.stringify(raw.record) }; const waiter = pending; pending = undefined; clearTimeout(waiter.timer); waiter.resolve(JSON.stringify(raw.record));
        }
        assert.ok(Buffer.byteLength(partial) <= 16384, 'Private partial reply overflow');
      } catch (error) { fail(error); }
    },
    dispose(reason = new Error('Private fixture exited')) { if (disposed) return; disposed = true; fail(reason); partial = ''; closeSync(rootFd); },
  };
}
