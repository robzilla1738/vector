# Finite routine and model producer successor

Inactive exact-source successor to the local-finish writer transform. Preserves the supplied implementation and UI. Export `applyAuxFiniteWriters(source)` from `transform.mjs`; reviewed hashes and seven single-count replacements are in `evidence.json`. No native ABI changes, signing, owner runtime, downloads or cloud execution were performed.

Implemented:

- Routine scheduler `session:updated` and `session:deleted` listeners now retain their real Emittery unsubscribe functions. Shutdown removes listeners, refuses already-captured callbacks and awaits admitted callback bodies. Native unknown still covers nested detached producers.
- The separate memory model downloader now registers its actual shared controller and retains its complete existing promise, including download/decompression pipeline cleanup, final temporary-file cleanup and the original runtime verification chain. Shutdown aborts actual fetch/pipeline signals and waits that promise. Rejection propagates through shutdown; abort alone is not drain. The original verification code is preserved but was never executed in this fixture.
- The startup orphan-tab retry clears its actual timer on stop, refuses late callbacks and retains a callback already in progress.
- Routine V2 migration retains native awaited custody across its original async body, including file copies, JSONL operations and final database transaction. Shutdown must await it; this is deliberately not destructive mid-migration cancellation.

Focused controlled-resource checks passed for unsubscribe during active work, model abort remaining pending until actual callback cleanup and stopped timer delivery. The complete transformed bundle parses and altered input is refused. Tests exercise synthetic boundaries, not native-authority activation or actual application behavior.

Remaining concrete work:

- Routine V2 migration keeps its original partially durable recovery semantics and source-row retention. This change does not add an atomic cross-filesystem/database journal or prove crash/restart recovery. That requires a dedicated disposable migration fixture and design of replay invariants across the supplied SessionStore/file operations.
- Model descriptor loaders and original runtime verification subprocesses can outlive cancellation until their own promises return. Custody remains pending; no hard timeout claims completion or terminates subprocess descendants.
- Other event-driven producer classes, external utility/extension callbacks, arbitrary provider detached work and subprocess extraction descendants remain unsupported by this finite subset. Existing native unknown retains refusal; these are not silently declared drained.
- Source contains original historical compatibility/verification strings. Root's complete branding/inventory composition remains responsible for final identity; this writer transform does not edit unrelated cryptographic or identity semantics.

Ordinary protected-entry refusal and all native authority checks remain. Root must compose this successor and integrate before any activation claim.
