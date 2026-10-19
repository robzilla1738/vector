# Temporary launcher state and owned process-group shutdown

This is a pinned incremental launcher proposal against current root scripts/aux.mjs, not the historical independent launcher still present at this lane's base. Parent should cherry-pick the new scripts/lib modules and apply fix.patch after checking manifest baseline/output hashes. No native checkout changes/builds or product/native commands occurred.

## Source-backed lifecycle

Current daemon_supervisor.cc LaunchBundled passes an ordinary child process handle to the browser. Shutdown sends authenticated /shutdown and StopVerified uses the actual child executable within its bundle root, parent PID and creation time before termination. BrowserPlatform::Shutdown waits for completion, but launcher receives only browser exit; it has no verified native stopping result. The supplied daemon also contains detached bash process creation. Thus a browser exit, health disappearance, or empty process group is insufficient evidence that every process using the temporary state has stopped. Never terminate a PID learned solely from health/port/name.

The proposal starts a private Node guardian in a new POSIX group. The guardian remains the live leader while its actual browser/daemon child runs or stops. On requested shutdown it first gives that owned child five seconds for its existing shutdown lifecycle. After child exit it signals only its own group, verifies only that selected group's numeric PID/PGID metadata and gives remaining group members2.5 seconds. Escalation is issued by the still-live group leader itself, immediately after its bounded report; the parent never sends a group signal after that leader exits. Forced cleanup is reported as unverified/failure, not success. Parent has an11-second watchdog for an unresponsive guardian and only signals its direct ChildProcess; it retains state. Spawn/transport/abnormal/forced/error outcomes resolve the parent lifecycle and produce a meaningful exit status. Pending launches are registered before awaiting acknowledgement; shutdown waits for their controllers, retains each outcome even if it has already settled, and immediately stops a controller that resolves after shutdown begins. New starts are refused after stopping. Readiness fetches are aborted and all awaited startup/readiness boundaries check stopping before proceeding. Guardian refuses launch messages after stop/cleanup begins. SIGINT/SIGTERM retain conventional130/143 status.

Guardian Node receives no DYLD/NODE_OPTIONS/NODE_PATH preload environment. The actual launched implementation receives its original intended environment and retains its real native interposer boundary. The guardian calls no auth, crypto, native addon or shutdown HTTP API. Group inspection selects only its anchored group, never a broad owner process/command/environment inventory.

Every temporary launch that actually starts now prints its exact retained temporary-root path on shutdown. Group cleanup is useful but cannot prove escaped descendants stopped; automatic temporary-home deletion is therefore withheld until an authoritative complete shutdown receipt exists. This is deliberately conservative. Persistent homes are never removed. Existing pre-launch missing-executable cleanup remains unchanged. Later manual cleanup is appropriate only after actual ownership/lifetime review; this change does not authorize touching owner Aside/Aux processes or state.

## Focused evidence

`node --test scripts/lib/owned-process.test.mjs` passes one bounded fixture with three disposable own-process cases: a real child exits while a normal group descendant acknowledges SIGTERM and exits; a stubborn group descendant forces the guardian's own bounded SIGKILL path and reports forced/unverified. A missing executable reports an explicit spawn failure without hanging. Settled stop is idempotent. Two additional race fixtures pass: the guardian receives stop followed by launch and never runs that command; a full disposable copy of the staged launcher holds an actual started controller before returning it, receives SIGTERM during that pending await, then releases the controller. The own fixture app is stopped, the retained path still exists, and launcher exit status is143. No supplied binary or real health/network request runs in these fixtures. The fixtures use a fresh aux-* temp directory, minimal environment and tiny authored Node scripts, with no native commands/profile/Keychain/OS grants/network. Launcher patch disposable replay, exact counts/hashes and syntax checks pass. Actual browser/native shutdown acceptance remains unexecuted.

## Profile-state fixture: exact deferred invocation

The actual target is `//chrome/browser/aux:profile_state_probe` (testonly). Current forthcoming source has `int main()` with no command-line arguments. It creates its own ScopedTempDir and fixtures; do not supply a real home/profile or reuse the old out/AuxAside/profile_state_probe binary. Current out/AuxFast has enable_aux_browser=true, enable_aux_shell=false, is_component_build=false, aux_test_hooks=false; root built its profile-state executable separately after the fullv24 build. It passed with exit0 in a fresh private HOME; see profile-state-actual-proof.json. The full browser build does not automatically build this target.

For reproduction, run only after the active native build releases /tmp/aux-build.lock, from the exact Chromium checkout. The actual recorded run used the following focused command:

```sh
python3 /Users/rcourson/Documents/Vibe/web/scripts/native-build.py \
  /Users/rcourson/Documents/Code/aux-chromium-proof/depot_tools/autoninja \
  -C out/AuxFast profile_state_probe -j 2
```

Verify source hashes in manifest.json still match (profile_state_probe.cc and BUILD.gn), record actual args.gn/command/output-binary SHA and only then invoke this original fixture entrypoint in a disposable HOME/TMPDIR/cwd, with no inherited DYLD or native-acceptance env:

```sh
python3 - <<'PYTHON'
from pathlib import Path
import hashlib, subprocess, tempfile
probe = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src/out/AuxFast/profile_state_probe')
print('profile_state_probe sha256:', hashlib.sha256(probe.read_bytes()).hexdigest())
with tempfile.TemporaryDirectory(prefix='aux-profile-state-proof-') as scratch:
    subprocess.run([str(probe)], cwd=scratch,
                   env={'HOME': scratch, 'TMPDIR': scratch, 'PATH': '/usr/bin:/bin'},
                   check=True, timeout=15)
PYTHON
```

Expected acceptance is actual exit0; CHECK failures abort/nonzero. The fixture covers missing/malformed registry metadata, exact profile hash/path/account mapping, anonymous-local vs genuine cloud/history classification, absent/stale/reordered index refusal, unrelated vs same-path/ID legacy mappings, read-only registry preservation and0600 vs0644 refusal. It deliberately remains locked/unconfigured until actual authenticated Vault verification; it does not call that service or synthesize unlocked state. ProfileIdForPath uses upstream SHA256, not native installation/DP keys. The actual recorded build and invocation passed; the receipt pins the executable and flags. This fixture does not prove packaged Vault/authentication acceptance. No build is queued by this documentation.
