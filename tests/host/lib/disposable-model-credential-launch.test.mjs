import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
const body = fs.readFileSync(new URL('./disposable-model-credential-launch.mjs', import.meta.url), 'utf8')
  .replace(/^import[^\n]+\n/gm, '').replace(/^export /gm, '');
function fixture() {
  const root = fs.mkdtempSync('/tmp/aux-native-journey-'), profile = path.join(root, 'profile'); fs.mkdirSync(profile, { mode: 0o700 });
  const pair = {}, slot = { token: 'original' }, endpoint = {}, events = []; let valid = true, fail, release, leaseReleased = false;
  const closed = new Promise(resolve => { release = resolve; });
  const guardian = { acquiredMach: '123', receipt: { cleanupDebt: true } };
  const make = new Function('assert', 'constants', 'openSync', 'closeSync', 'fstatSync', 'lstatSync', 'mkdirSync', 'realpathSync', 'join', 'readPackagedRuntimePair', 'retainNativeSlotForCredentialGrant', 'startOriginalCredentialGuardian', 'bindOriginalCredentialBrowser', 'readDisposableModelCredentialEndpoint', 'process', 'performance', body + '\nreturn prepareOriginalCredentialLaunch;')
    (assert, fs.constants, fs.openSync, fs.closeSync, fs.fstatSync, fs.lstatSync, fs.mkdirSync, fs.realpathSync, path.join,
      candidate => { assert.equal(candidate, pair); assert.ok(valid); return { validate() { assert.ok(valid); } }; },
      original => { assert.equal(original, slot); events.push('slot-held'); return { directoryFd: 77, ownerFd: 78, validate() { assert.ok(valid); }, release() { leaseReleased = true; events.push('slot-fds-released'); } }; },
      async options => { events.push('guardian-start'); assert.equal(options.credentialEndpoint, endpoint); assert.equal(options.directoryFds.length, 3); if (fail) throw fail; return guardian; },
      options => { events.push('original-browser'); assert.equal(options.guardian, guardian); return { originalPid: 99, receipt: {}, async retireAfterOriginalClose() { await closed; events.push('guardian-final'); return { browser: { originalPid: 99 }, guardian: { completed: true } }; } }; },
      candidate => { assert.equal(candidate, endpoint); assert.ok(valid); return { reservation: 'c'.repeat(64), endpoint: 'http://127.0.0.1:3210/v1' }; }, process, performance);
  return { root, profile, events, get released() { return leaseReleased; }, retire() { valid = false; }, restore() { valid = true; }, release, fail(error) { fail = error; },
    prepare: () => make({ pair, credentialEndpoint: endpoint, profileRoot: root, userDataDir: profile, originalSlot: slot, originalRootIdentity: fs.lstatSync(root), originalProfileIdentity: fs.lstatSync(profile), currentLaunch: () => true }),
    cleanup() { fs.rmSync(root, { recursive: true, force: true }); } };
}
test('actual generated directory descriptors and original endpoint guardian precede browser; original close/final precede release', async () => {
  const f = fixture(); try {
    const owner = await f.prepare(); const stdio = owner.stdio; assert.equal(stdio.length, 9); assert.deepEqual(f.events, ['slot-held', 'guardian-start']);
    owner.bindOriginalChild({ pid: 99 }); assert.throws(() => owner.bindOriginalChild({ pid: 99 }));
    const pending = owner.retireAfterOriginalClose(); await Promise.resolve(); assert.equal(f.released, false);
    f.release(); await pending; assert.deepEqual(f.events.slice(-2), ['guardian-final', 'slot-fds-released']);
    for (const fd of stdio.slice(4, 7)) assert.throws(() => fs.fstatSync(fd), { code: 'EBADF' });
    assert.equal(owner.receipt.retained, false);
  } finally { f.cleanup(); }
});
test('directory child-count changes preserve original identity while same-path replacement refuses permanently', async () => {
  const f = fixture(); try {
    const owner = await f.prepare(); fs.mkdirSync(path.join(f.root, 'additional-original-owned-directory')); assert.equal(owner.stdio.length, 9);
    fs.renameSync(path.join(f.profile, 'Default'), path.join(f.profile, 'original-Default')); fs.mkdirSync(path.join(f.profile, 'Default'), { mode: 0o700 });
    assert.throws(() => owner.bindOriginalChild({ pid: 99 })); assert.equal(owner.receipt.retained, true); assert.equal(f.released, false);
  } finally { f.cleanup(); }
});
test('existing unknown Default never acquired or removed, explicit original ownership retained', async () => {
  const f = fixture(); try {
    fs.mkdirSync(path.join(f.profile, 'Default')); fs.writeFileSync(path.join(f.profile, 'Default', 'unknown'), 'retained');
    await assert.rejects(f.prepare(), error => { assert.ok(error.retainedCredentialOwner); assert.equal(error.cause.code, 'EEXIST'); return true; });
    assert.equal(fs.readFileSync(path.join(f.profile, 'Default', 'unknown'), 'utf8'), 'retained'); assert.deepEqual(f.events, []);
  } finally { f.cleanup(); }
});
test('lost guardian preparation ACK preserves actual original helper owner and all descriptors', async () => {
  const f = fixture(); try {
    const original = Object.assign(new Error('original HELLO ACK lost'), { retainedCredentialOwner: { pending: true } }); f.fail(original);
    await assert.rejects(f.prepare(), error => { assert.equal(error.cause, original); assert.equal(error.retainedCredentialOwner.guardianOwner, original.retainedCredentialOwner); for (const fd of error.retainedCredentialOwner.descriptors) assert.ok(fs.fstatSync(fd).isDirectory()); return true; });
    assert.equal(f.released, false);
  } finally { f.cleanup(); }
});
test('endpoint/pair retirement cannot revive from ABA before original browser creation', async () => {
  const f = fixture(); try {
    const owner = await f.prepare(); f.retire(); assert.throws(() => owner.bindOriginalChild({ pid: 99 })); f.restore();
    assert.throws(() => owner.bindOriginalChild({ pid: 99 })); assert.equal(f.released, false); assert.equal(f.events.includes('original-browser'), false);
  } finally { f.cleanup(); }
});
