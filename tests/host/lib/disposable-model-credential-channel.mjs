import assert from 'node:assert/strict';
import { readDisposableModelCredentialEndpoint } from './fixture.mjs';
import { awaitOriginalCredentialClose } from './disposable-model-credential-lifetime.mjs';
import { readNativeSlotForCredentialGrant } from './disposable-model-credential-slot.mjs';
import { randomBytes } from 'node:crypto';
import { fstatSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readPackagedRuntimePair } from './packaged-runtime-pair-artifact.mjs';
import { readNativeWindowCompilerExecutable } from './native-window-compiler-artifact.mjs';
const source = fileURLToPath(new URL('../native-window.swift', import.meta.url));
const digits = value => typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value);
const tokens = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const sameDirectory = (a, b) => ['dev', 'ino', 'uid', 'mode'].every(key => a[key] === b[key]);
export function decodeOriginalCredentialGuardianResponse(raw, original) {
  assert.ok(typeof raw === 'string' && Buffer.byteLength(raw) <= 4096 && !raw.includes('\n') && !raw.includes('\r'));
  const fields = raw.split('|');
  assert.ok(tokens(original.nonce) && fields[1] === original.nonce, 'Foreign original guardian nonce');
  const status = fields[0];
  if (status === 'READY') {
    assert.equal(fields.length, 6);
    assert.ok(/^[1-9][0-9]*$/.test(fields[5]) && BigInt(fields[5]) <= 18446744073709551615n);
    assert.ok(fields.slice(2).every(digits));
    assert.equal(fields[2], String(original.helperPid));
    assert.equal(fields[3], String(original.profileIdentity.dev));
    assert.equal(fields[4], String(original.profileIdentity.ino));
  } else if (status === 'INTENT-RETAINED') {
    assert.equal(fields.length, 3); assert.ok(tokens(fields[2]));
    assert.equal(fields[2], original.creationWitness);
  } else if (status === 'FINAL') {
    assert.equal(fields.length, 3); assert.equal(fields[2], 'absent');
  } else {
    assert.equal(fields.length, 2);
    assert.ok(['PROFILE-BOUND', 'ABSENT', 'SAVED-RETAINED', 'BROWSER-RETIRED', 'REMOVED'].includes(status));
  }
  return Object.freeze({ status, raw, ...(status === 'READY' ? { acquiredMach: fields[5] } : {}) });
}
/** Private App join only: original inherited FDs, original pair/helper and slot.
 * This factory never accepts a credential name/key, arbitrary file/path, PID,
 * helper executable or process rediscovery. Caller-visible receipts omit nonce.
 */
export async function startOriginalCredentialGuardian({ pair, directoryFds, credentialEndpoint, originalSlotToken, originalSlotLease, currentOriginal }) {
  const endpointOwner = readDisposableModelCredentialEndpoint(credentialEndpoint);
  const admitted = readPackagedRuntimePair(pair);
  assert.equal(typeof currentOriginal, 'function');
  assert.ok(Array.isArray(directoryFds) && directoryFds.length === 3 && directoryFds.every(Number.isInteger));
  assert.ok(typeof originalSlotToken === 'string' && originalSlotToken.length > 0);
  readNativeSlotForCredentialGrant(originalSlotLease);
  assert.ok(Number.isInteger(originalSlotLease.directoryFd) && Number.isInteger(originalSlotLease.ownerFd));
  const identities = directoryFds.map(fd => fstatSync(fd));
  assert.ok(identities.every(info => info.isDirectory() && info.uid === process.getuid() && (info.mode & 0o777) === 0o700));
  const executable = readNativeWindowCompilerExecutable(admitted.compilerArtifact, source);
  const nonce = randomBytes(32).toString('hex');
  const deadline = performance.now() + 150_000;
  let profileBound = false;
  let retired = false, pending, buffered = '', debt = false, browserRetired = false, completed = false;
  const records = [];
  const current = () => {
    if (retired) return false;
    try {
      admitted.validate(); originalSlotLease.validate();
      const endpointNow = readDisposableModelCredentialEndpoint(credentialEndpoint);
      assert.equal(endpointNow.reservation, endpointOwner.reservation); assert.equal(endpointNow.endpoint, endpointOwner.endpoint);
      if (!currentOriginal() || !directoryFds.every((fd, i) => sameDirectory(fstatSync(fd), identities[i]))) retired = true;
    } catch (error) { retired = true; throw error; }
    return !retired;
  };
  assert.ok(current());
  const child = spawn(executable, ['credential-guardian'], {
    stdio: ['ignore', 'ignore', 'pipe', 'pipe', ...directoryFds, originalSlotLease.directoryFd, originalSlotLease.ownerFd],
    env: { PATH: '/usr/bin:/bin:/usr/sbin:/sbin', LANG: 'en_US.UTF-8', AUX_NATIVE_SLOT_TOKEN: originalSlotToken },
  });
  const originalHelperPid = child.pid;
  const channel = child.stdio[3];
  assert.ok(channel && Number.isInteger(originalHelperPid) && originalHelperPid > 0);
  let closeResolve;
  const originalClose = new Promise(resolve => { closeResolve = resolve; });
  const refuse = error => {
    retired = true;
    if (pending && !pending.settled) { pending.settled = true; clearTimeout(pending.timer); pending.reject(error); }
  };
  child.once('error', refuse);
  child.once('close', (code, signal) => {
    refuse(new Error('Original credential guardian closed'));
    closeResolve(Object.freeze({ helperPid: originalHelperPid, code, signal, completed, cleanupDebt: debt || !!pending }));
  });
  channel.on('error', refuse);
  channel.on('data', bytes => {
    try {
      buffered += bytes.toString('utf8'); assert.ok(Buffer.byteLength(buffered) <= 8192);
      while (buffered.includes('\n')) {
        const end = buffered.indexOf('\n'), line = buffered.slice(0, end); buffered = buffered.slice(end + 1);
        assert.ok(pending, 'Unsolicited credential guardian record');
        const original = pending;
        const result = decodeOriginalCredentialGuardianResponse(line, { nonce, helperPid: originalHelperPid,
          profileIdentity: identities[2], creationWitness: original.creationWitness });
        assert.equal(result.status, original.status, 'Foreign guardian operation response');
        records.push(result);
        if (!original.settled) assert.ok(current() && performance.now() < deadline, 'Original guardian retired before ACK publication');
        clearTimeout(original.timer); pending = undefined;
        if (!original.settled) { original.settled = true; original.resolve(result); }
        // Timed-out replies remain recorded evidence; they do not clear debt or
        // publish a new grant to the rejected original invocation.
      }
    } catch (error) { refuse(error); }
  });
  function request(command, status, creationWitness, beforeWrite) {
    assert.ok(current() && !pending && performance.now() < deadline, 'Original guardian unavailable');
    assert.ok(Buffer.byteLength(command) <= 4096 && !command.includes('\n') && !command.includes('\r'));
    return new Promise((resolve, reject) => {
      const original = { status, creationWitness, resolve, reject, settled: false };
      pending = original;
      original.timer = setTimeout(() => {
        original.settled = true; retired = true;
        reject(new Error('Original credential guardian deadline expired; retained pending operation and debt'));
      }, Math.min(5000, deadline - performance.now()));
      beforeWrite?.();
      try { channel.write(command + '\n', error => { if (error) refuse(error); }); }
      catch (error) { refuse(error); }
    });
  }
  let ready;
  try { ready = await request(`HELLO|${nonce}|${endpointOwner.reservation}|${Buffer.from(endpointOwner.endpoint).toString('base64')}`, 'READY'); }
  catch (error) {
    // Preserve original child/channel/FD owner even if initialization ACK is
    // lost. No automatic kill/replacement or claimed cleanup on this path.
    Object.defineProperty(error, 'retainedCredentialOwner', { value: Object.freeze({ child, channel, originalClose, records, pair, originalSlotLease, directoryFds: Object.freeze(directoryFds.slice()), identities: Object.freeze(identities.slice()), currentOriginal }) });
    throw error;
  }
  return Object.freeze({
    helperPid: originalHelperPid, originalClose, acquiredMach: ready.acquiredMach,
    reservation: endpointOwner.reservation, endpoint: endpointOwner.endpoint,
    bindOriginalProfileAlias(alias) {
      assert.ok(!profileBound && ['tmp', 'private-tmp'].includes(alias));
      profileBound = true;
      return request(`PROFILE|${nonce}|${alias}`, 'PROFILE-BOUND');
    },
    get receipt() { return Object.freeze({ helperPid: originalHelperPid, cleanupDebt: debt, pending: !!pending, retired, browserRetired, completed, records: records.slice() }); },
    arm: () => { assert.ok(profileBound); return request(`ARM|${nonce}`, 'ABSENT'); },
    retainIntent(creationWitness) {
      assert.ok(tokens(creationWitness));
      return request(`INTENT|${nonce}|${creationWitness}`, 'INTENT-RETAINED', creationWitness, () => { debt = true; });
    },
    retainSaved(creationWitness, persistentReference) {
      assert.ok(debt && tokens(creationWitness) && typeof persistentReference === 'string' && persistentReference.length <= 1368);
      const bytes = Buffer.from(persistentReference, 'base64');
      assert.ok(bytes.length > 0 && bytes.length <= 1024 && bytes.toString('base64') === persistentReference);
      return request(`SAVED|${nonce}|${creationWitness}|${persistentReference}`, 'SAVED-RETAINED');
    },
    async retireOriginalBrowser() {
      const result = await request(`BROWSER-RETIRED|${nonce}`, 'BROWSER-RETIRED'); browserRetired = true; return result;
    },
    async cleanup() {
      assert.ok(browserRetired && debt);
      const result = await request(`CLEANUP|${nonce}`, 'REMOVED'); debt = false; return result;
    },
    async finish() {
      assert.ok(browserRetired && !debt);
      const result = await request(`FINISH|${nonce}`, 'FINAL'); completed = true;
      const closed = await awaitOriginalCredentialClose(originalClose, deadline);
      assert.ok(closed.code === 0 && closed.signal === null && closed.completed && !closed.cleanupDebt);
      return result;
    },
  });
}
