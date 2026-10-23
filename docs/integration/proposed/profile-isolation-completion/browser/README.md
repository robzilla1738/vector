# Coherent unsigned browser rebuild

The isolated APFS snapshot continues from the prior recovery batch. It includes
the owner-modified Chromium source and cloned AuxFast outputs, not a clean Git
checkout that would discard accepted UI. Root's initial preparation applies the
verified browser source overlay and regenerates the actual GN dependency graph.

`watch-build.py` waits for that preparation receipt and queues `unsigned-build.py`
through the shared native-build lock. The latter adds `-Wl,-no_adhoc_codesign`
only to the cloned macOS linker configuration, regenerates GN, inventories real
Ninja commands, refuses signing/notarization actions or link commands missing
the unsigned flag, and runs actual bundled `siso ninja -offline -local_jobs=4 chrome`. Changed virtual interfaces
are rebuilt by Ninja's dependency graph; no checked-object shortcut is used.

Current process status and logs reside at:
`/private/tmp/aux-chromium-recovery-snapshot-20261023/completion-watch.json`,
`completion-watch.log`, and (once started) `unsigned-siso-build/build.log` plus
`unsigned-siso-build/receipt.json`. A watcher or successful preparation is not a
successful full build. The cold protected feature stays off, and a completed
browser binary still needs exact daemon/resources/package association and real
runtime acceptance. The accepted app is not replaced or launched.

The bounded late shutdown source audit is recorded in `evidence/late-drain-audit.json`.
It found no genuine whole-writer drain capability: thread joins are followed by
late persistent writes, some service objects are intentionally retained, and
macOS child termination schedules later reaping. No clean-admitted-state resume
marker or fabricated drain capability was added. The existing six native
shutdown observations remain truthful diagnostics and new-admission closure.

The initial direct-Ninja dry-run was stopped before compilation after identifying
that AuxFast uses Siso dependency state. Direct Ninja discarded a compatibility
log and scheduled 57,863 actions. The corrected executor uses the existing
cloned Siso dependency state, explicit offline mode and an isolated cache.
Historical refused attempt stays in `unsigned-build/`; final attempt is
`unsigned-siso-build/`. This change preserves dependency-driven ABI rebuilds.

The relocated Siso dry-run computed 57,861 actions but then stalled retrying
unsupported `file://` blob materialization while flushing its transplanted
state. Its owned dry-run process was stopped after process sampling and repeated
30-second diagnostics; no compiler was interrupted. The refused receipt is
preserved. Because Siso offered no incremental rebuild advantage, the final
pipeline uses the complete direct Ninja graph, four jobs, with the same reviewed
unsigned configuration. Final receipt/log/inventories are now under
`unsigned-direct-build/`; the two earlier attempt directories remain historical.
No owner/shared cache was used, and no prebuilt-object substitution was made.
