import assert from 'node:assert/strict';
import { readDisposableModelCredentialEndpoint } from './fixture.mjs';
import { constants, openSync, closeSync, fstatSync, lstatSync, mkdirSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { readPackagedRuntimePair } from './packaged-runtime-pair-artifact.mjs';
import { retainNativeSlotForCredentialGrant } from './disposable-model-credential-slot.mjs';
import { startOriginalCredentialGuardian } from './disposable-model-credential-channel.mjs';
import { bindOriginalCredentialBrowser } from './disposable-model-credential-browser-channel.mjs';
const same = (a, b) => ['dev', 'ino', 'uid', 'mode'].every(key => a[key] === b[key]);
/** App-only preparation on its internally generated root, never a public
 * caller path/grant. Pair/helper admission precedes spawn and any Security.
 */
export async function prepareOriginalCredentialLaunch({ pair, credentialEndpoint, profileRoot, userDataDir, originalSlot, originalRootIdentity, originalProfileIdentity, currentLaunch }) {
  const originalEndpoint = readDisposableModelCredentialEndpoint(credentialEndpoint);
  const admitted = readPackagedRuntimePair(pair);
  admitted.validate();
  assert.equal(userDataDir, join(profileRoot, 'profile'));
  assert.match(realpathSync(profileRoot), /^\/private\/tmp\/aux-native-journey-[A-Za-z0-9]+$/);
  const paths = [profileRoot, userDataDir, join(userDataDir, 'Default')], descriptors = [];
  let slotLease, guardian, browser, retired = false, released = false;
  const deadline = performance.now() + 150_000;
  const originalIdentities = [originalRootIdentity, originalProfileIdentity];
  const current = () => {
    if (retired || released) return false;
    if (performance.now() >= deadline) { retired = true; return false; }
    try {
      if (!browser && !currentLaunch()) throw new Error("Original credential launch retired");
      admitted.validate(); slotLease?.validate();
      const endpoint = readDisposableModelCredentialEndpoint(credentialEndpoint);
      assert.equal(endpoint.reservation, originalEndpoint.reservation); assert.equal(endpoint.endpoint, originalEndpoint.endpoint);
      assert.ok(descriptors.length === 3);
      for (let i = 0; i < 3; i++) {
        const named = lstatSync(paths[i]), held = fstatSync(descriptors[i]);
        assert.ok(named.isDirectory() && same(named, originalIdentities[i]) && same(held, originalIdentities[i]));
      }
      return true;
    } catch { retired = true; return false; }
  };
  const owner = Object.freeze({
    get stdio() { assert.ok(current()); return ['ignore', 'ignore', 'pipe', 'pipe', ...descriptors, slotLease.directoryFd, slotLease.ownerFd]; },
    bindOriginalChild(child) {
      assert.ok(current() && !browser);
      browser = bindOriginalCredentialBrowser({ child, guardian, currentOriginal: current, deadline });
      return browser;
    },
    get retainedDeadline() { return deadline; },
    get receipt() { return Object.freeze({ prepared: !!guardian, originalBrowser: browser?.originalPid ?? null, retained: !released, guardian: guardian?.receipt, browser: browser?.receipt }); },
    async retireAfterOriginalClose() {
      assert.ok(browser && current());
      const result = await browser.retireAfterOriginalClose();
      assert.ok(current() && result.guardian?.completed === true);
      // Release only these original descriptors after actual browser/helper
      // retirement and independently confirmed absence. No slot unlink here.
      slotLease.release();
      for (const fd of descriptors) closeSync(fd);
      released = true;
      return result;
    },
  });
  try {
    // Fresh App-generated Default only; existing unknown directories cannot be
    // adopted as this fixture. No recursive cleanup on setup failure.
    mkdirSync(paths[2], { mode: 0o700 });
    for (let i = 0; i < paths.length; i++) {
      const fd = openSync(paths[i], constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
      descriptors.push(fd);
      const info = fstatSync(fd), named = lstatSync(paths[i]);
      assert.ok(info.isDirectory() && same(info, named) && info.uid === process.getuid() && (info.mode & 0o777) === 0o700);
      if (i < 2) assert.ok(same(info, originalIdentities[i])); else originalIdentities.push(info);
    }
    slotLease = retainNativeSlotForCredentialGrant(originalSlot);
    guardian = await startOriginalCredentialGuardian({ pair, credentialEndpoint, directoryFds: descriptors,
      originalSlotToken: originalSlot.token, originalSlotLease: slotLease, currentOriginal: current });
    assert.ok(current());
    return owner;
  } catch (error) {
    // Even lost HELLO ACK keeps actual helper/channel ownership. Never close
    // unknown descriptors/delete generated roots based on a failed ACK.
    const failure = new AggregateError([error], 'Disposable credential preparation failed; original owners retained', { cause: error });
    Object.defineProperty(failure, 'retainedCredentialOwner', { value: Object.freeze({ owner, guardianOwner: error.retainedCredentialOwner,
      descriptors: descriptors.slice(), slotLease, originalPair: pair, paths: paths.slice() }) });
    throw failure;
  }
}
