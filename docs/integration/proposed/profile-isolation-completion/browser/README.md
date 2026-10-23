# Coherent unsigned browser rebuild

The isolated APFS snapshot continues from the prior recovery batch. It includes
the owner-modified Chromium source and cloned AuxFast outputs, not a clean Git
checkout that would discard accepted UI. Root's initial preparation applies the
verified browser source overlay and regenerates the actual GN dependency graph.

`watch-build.py` waits for that preparation receipt and queues `unsigned-build.py`
through the shared native-build lock. The latter adds `-Wl,-no_adhoc_codesign`
only to the cloned macOS linker configuration, regenerates GN, inventories real
Ninja commands, refuses signing/notarization actions or link commands missing
the unsigned flag, and runs actual `ninja -j4 chrome`. Changed virtual interfaces
are rebuilt by Ninja's dependency graph; no checked-object shortcut is used.

Current process status and logs reside at:
`/private/tmp/aux-chromium-recovery-snapshot-20261023/completion-watch.json`,
`completion-watch.log`, and (once started) `unsigned-build/build.log` plus
`unsigned-build/receipt.json`. A watcher or successful preparation is not a
successful full build. The cold protected feature stays off, and a completed
browser binary still needs exact daemon/resources/package association and real
runtime acceptance. The accepted app is not replaced or launched.

The bounded late shutdown source audit is recorded in `evidence/late-drain-audit.json`.
It found no genuine whole-writer drain capability: thread joins are followed by
late persistent writes, some service objects are intentionally retained, and
macOS child termination schedules later reaping. No clean-admitted-state resume
marker or fabricated drain capability was added. The existing six native
shutdown observations remain truthful diagnostics and new-admission closure.
