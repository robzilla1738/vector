# Direct kernel credential lock

The ordinary runtime forbids the old `/usr/bin/lockf` child. The credential store now acquires Darwin's exclusive open lock directly on its existing owned inode, with `O_EXLOCK | O_NONBLOCK | O_NOFOLLOW | O_RDWR`. No worker, generic exec, helper, grant or new native architecture is needed.

The macOS SDK pins `O_EXLOCK` to `0x20`; Node omits that exported constant, so the code uses the SDK value only behind the existing macOS platform check. `native-inputs.json` pins the actual SDK header, embedded Node source and current ordinary boundary sources inspected. Node's real `Open` reads numeric Int32 flags, enforces its normal filesystem read/write permissions and passes those flags to libuv. Its real `uv__fs_open` passes them unchanged to the kernel while adding `O_CLOEXEC`. This is the existing synchronous filesystem boundary, not a child-process permission exception.

The lock descriptor stays open across the entire awaited credential operation. Nonblocking open refuses live contenders. A successful return or thrown callback reaches the actual synchronous close; a close error propagates and marks the existing lifetime unknown. There is no timer, child-exit inference, native CLEAN acknowledgement, descendant-unknown reset or claim that this one lock proves all writers drained.

The existing private directory, UID/mode/type/link-count checks, nofollow open, permanent marker schema/account binding, exact inode recheck and account operation serialization are preserved. New markers are still exclusive and synced; existing empty/unknown legacy markers are refused unchanged. No lock inode is removed, replaced or interpreted as stale. Process exit releases the kernel lock without marker deletion.

## Pairing

Active shim: `vendor/aside/shims/aux-chatgpt.cjs`, SHA-256 `772eebe9503b960fa26e185573d0c3bbd29b21ec12fe967ef78860b73a1be53d`.

The existing native-lifetime adapter needs only its original configuration/export edits; the two child-lock edits are obsolete. `source/transform.mjs` replays those two exact count-one retained edits. Reviewed paired output: `source/aux-chatgpt.cjs`, SHA-256 `70337b44d476ce987d16f62fde3da606e55038348364820773db970edceb32a3`. It replaces the prior paired leaf `b08d0acbdaf61e28806fd40a3a364a679fe6df8923392eb6b83ff2395df6887a` from A31. All actual client operations still use the retained lifetime transport and operation scope. The source change removes the subprocess dependency rather than granting it permission.

This successor assumes the A31 daemon/catalog integration is already paired. It adds no daemon-entry changes, native ABI, module import, permission, UI or asset delta. Root must source the actual fixed Resources/native/aux-chatgpt.cjs leaf from this reviewed output and pin this generator/anchors/pins in the cumulative package provenance. Historical A31 and login evidence remains unchanged.

## Focused evidence and limit

`provider-free.tap`: 19/19 passing tests, no provider requests, skips or failures. The actual macOS kernel tests use only private temporary state and the existing Node interpreter: real concurrent contender refusal, different-account independence, thrown-callback release, separate-process hold, SIGKILL recovery on the unchanged inode, and symlink/hard-link/legacy preservation. A VM fixture denies acquiring `node:child_process` entirely while exercising the real store and kernel lock. No new executable was compiled or signed. Existing PKCE/signature/account/refresh/catalog/cancellation tests continue passing.

`node check.mjs`: exact two-anchor pairing and syntax pass. Both base and paired shim have no child-process import or lockf spawn. Real embedded ordinary-runtime login, consent, refresh and revocation still require the packaged app/account check; this source/kernel result does not claim that end-to-end acceptance. No owner data, credentials, provider requests, product execution, signing or native tree changes occurred.
