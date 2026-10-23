# Native messaging child custody

Paired with the content-child proposal, this adds an actual native messaging launch-to-reaper association on macOS. The launcher reserves a retained record immediately before its existing `LaunchProcess`; the returned ProcessState carries the token through asynchronous launch completion. Cancelled launches and connection failures pass that same token into the existing termination task. Successful launches transfer it directly through LaunchContext, NativeProcessLauncherImpl, and NativeMessageProcessHost; host destruction passes it into the existing blocking-pool termination task. No PID-map lookup, new waiter, new signal, or extension behavior is added.

The paired base native evidence API from `../children` reports whether the existing native waiter really reaped the exact PID. A mismatched birth, unknown wait, dropped completion callback, or skipped shutdown task stays unresolved. ThreadPool shutdown behavior is unchanged, so this does not promise termination work will run before process exit. Third-party host grandchildren remain untracked.

The MAC-only internal launcher virtual accessor has a default empty implementation for custom launchers and mocks; empty custody does not become evidence. Internal layout/vtable changes require full normal dependency rebuilding. This does not change user-facing native messaging contracts or authorize launching any owner extension.

## Integration and checks

Apply the complete prior children proposal plus this `native.patch` only to a matching isolated source graph. `sources.json` pins predecessors and successors. Add `aux_native_messaging_lifetime.h` to the existing messaging GN source inventory through the integrator. Never edit an active build snapshot.

`check.py` compiles the actual ledger and actual termination wrapper against synthetic native process/evidence stand-ins. It checks moved owner, cancellation, unknown evidence, identity mismatch and dropped-task retention without launching an extension host. `compile.py` compiles all eight changed base/content/messaging translation units using actual target Ninja flags and paired overlay headers, writing only disposable objects and logs; run through the native build lock. Full linking/app observation remain separate.

## Remaining roots

Crashpad cannot be counted as another direct owned child: `crashpad_client_mac.cc` calls `SpawnSubprocess`, then explicitly handshakes with the grandchild. `util/posix/spawn_subprocess.cc` double-forks and reaps the intermediary, relieving that intermediary of responsibility for the grandchild. Counting this intermediary's real exit would falsely certify handler exit. This proposal does not change Crashpad launch/handshake semantics or claim its drain. Relaunch processes, arbitrary descendants, external application launches and file writers still have no complete custody boundary. All-writer coverage stays false and admitted-root reopen stays refused.
