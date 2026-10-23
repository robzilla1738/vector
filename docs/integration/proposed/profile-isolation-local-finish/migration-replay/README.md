# Routine migration replay: bounded recovery fix

The exact supplied migration was executed with real disposable SQLite and files. A concrete partial-write window was reproduced: interruption after appending an imported assistant report but before `finalizeLatestTurn` leaves a turn unfinished. On replay, the existing `routineSource` deduplication skips that report and its finalization. The migration can then commit its routine and delete the source row with the turn still open.

The one-seam successor normalizes the last imported turn before compaction, using the existing idempotent `SessionStore.finalizeLatestTurn` and last user/assistant timestamp. This function already checks whether the latest turn is unfinished; normal completed migrations gain no lifecycle event. No journal, new product behavior, UI or native ABI was added.

## Frozen integration

`applyAuxMigrationReplay(source)` from `transform.mjs` requires exact input `3a29d60f367cb450c948778e5157bafa37e0c5b8b36acee662aaf5de072a53a8` and produces `9bdcbf055fbc9e7b58023e8dbacb635bbf17020cb90ed0933d4c8f2b928ab190`. The replacement is counted exactly once. Full output `node --check` passed. Protected-entry refusal remains unchanged; this is inactive source composition, not app activation.

## Evidence

`check.mjs` extracts and executes both the actual migration function and actual supplied finalization function. It uses Node's real SQLite, real JSONL, attachment copies and original migration filesystem operations. ORM plumbing and remaining SessionStore insert/read/start functions are narrow adapters, explicitly recorded in `evidence.json`.

Three bounded scenarios pass: normal migration; interruption immediately after durable report append; interruption before the final database transaction. Each confirms one report, one compaction, attachment preservation, no unfinished imported turn, source deletion only after transaction and no changes on another replay. With `AUX_REPLAY_BASELINE=1`, the same fixture on unpatched source fails with one unfinished turn. The patched run passes all three. Functions and source hashes are recorded.

The test uses injected exceptions at persistent boundaries, not an OS kill. It does not prove torn-write recovery, every SessionStore lifecycle operation, simultaneous user activity, arbitrary filesystem failure or a complete cross-filesystem/database transaction. Those limitations remain explicit. Source-row retention, report deduplication, attachment replay and final-transaction replay are now exercised rather than merely assumed.

No owner state, credentials, network, signing or application runtime was touched. Temporary databases/files are deleted in `finally`.
