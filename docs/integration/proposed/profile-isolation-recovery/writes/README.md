# Session, attachment and background-output writer custody (inactive)

This slice extends the existing real Owner-bound broker without changing UI, native ABI, credentials or the accepted app. It consumes only the prior final composed daemon source, whose SHA is pinned in `transform.mjs`, and performs 23 count-checked replacements. The ordinary cold-entry refusal remains untouched. `applyAuxRecoveryWrites(source)` returns the complete source, input/output hashes and replacement counts; root separately composes any new native-entry policy.

## Implemented

- Actual session `messages.jsonl` append and rewrite are finite native sync guards, including directory creation, byte-offset calculation, append or temporary rewrite/rename. UTF-8 byte offsets and message order remain unchanged.
- Actual session/control/task and temporary directory helpers are guarded synchronously, preserving the existing separation of private messages and task-owned files.
- Attachment preparation retains awaited native custody through original access/write/copy operations and collision retry. Existing stored-path, naming and exclusive-write semantics are preserved. Channel attachment restoration now retains custody around mkdir and exclusive data write, clearing in-memory attachment data only after completion.
- Existing REPL filesystem mutation methods retain native custody around writeFile, mkdir, unlink, rm, rename and copyFile. Both existing path confinement and asynchronous file-access hooks run first; current native admission is rechecked immediately before the actual filesystem operation. This does not treat a hook's completion as proof that unrelated work it started drained.
- Routine-memory initialization, memory-page atomic write and dream-state persistence have finite awaited guards. Generated-image artifacts, displayed REPL images, edit-file writes and direct tool file writes are guarded at their actual filesystem calls. Abort rejection retains the prior native unknown outcome; cancellation is never counted as completed cleanup.
- Background stdout/stderr file streams retain native custody through actual `close`, using the existing stream error/close mechanism. These are **producer-owned** output streams: shutdown waits for the original process producer's existing `proc.exited -> stream.end()` path and stream close. It does not end the output stream early or treat process `exit`, a timeout or UI cancellation as proof of file closure.
- Detached background notification delivery refuses admission after shutdown starts and marks native unknown before invoking its original asynchronous delivery. Its response cannot clear that uncertainty.

`source/broker-runtime.js` is a small successor of the prior runtime. It adds only a private producer-stream set and `outputStream(factory)`, sharing the existing actual `withBrokerAwaited` native reservation. Ordinary logger streams still end during shutdown; producer streams wait for their own closure. No new native compilation is necessary: the exact previously compiled WorkerHost/Dispatcher remains the implementation boundary. Native root/Owner generation and pending counts remain native, not JavaScript-supplied IDs.

## Verification

One focused fixture run exercises the actual changed source bodies against a disposable filesystem: Unicode JSONL offsets/rewrite, attachment data/copy/collision behavior, owner closure while a REPL path hook is pending, and concrete REPL mutations. A lifecycle fixture confirms shutdown leaves background output open until the original producer closes it. The complete transformed bundle passes syntax checking; altered input hashes refuse transformation. Native functions in these fixtures are explicitly synthetic, so these are not live native authority, authenticated browser or protected profile tests. The input source includes the previous compiled native graph; no daemon imports or provider requests are executed.

`evidence/source.json` records exact composition hashes, seams and outcomes. The temporary fixture directory is deleted afterward. No owner state, Keychain, signing, release or UI modification occurs.

## Still open

This is a substantial finite subset, not full writer closure. Still requiring work are runtime/model/skill download and extraction pipelines; watcher callbacks and scheduled/routine/provider producers beyond their covered filesystem calls; import/migration and project relocation paths; cloud recovery transaction lifetime; utility/extension writers; and subprocess descendant lifecycle. REPL hooks and higher-level session/notification producers may detach unrelated work and remain unproven. Background child execution retains its independent native custody even after output files close. No unknown markers are cleared.

The original outer shutdown timeout may still exit before pending producers close. It is not a clean-drain receipt. Native pending/unknown custody must continue to block profile replacement. This source is inactive until root integrates and verifies the complete protected graph; it does not establish app readiness or authorize a launch.
