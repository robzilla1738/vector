# Daemon descendant observer: reverse birth coverage

Source-only successor to the exact actual a4 `AuxTaskDescendantObserver.cc`; the original source, public header, native module, compilation manifest and frozen outputs remain unchanged. One count-checked insertion at the final synchronized quiescent fence. Root owns integration, serialized compilation/linking and all runtime acceptance.

## Defect and correction

`RecordRootLocked` temporarily accepts a birth while a native launch reservation is awaiting publication. That is necessary because ES can report the birth before the native spawn call returns. The existing final fence checks each successful cohort against exactly one birth, but the reverse check was missing. An unrelated child could be born and exit during another reservation's pending interval, leaving an extra retained birth that no successful cohort owned. The old forward-only fence could clear that evidence.

After the existing forward checks, the new code checks **every retained root birth**, including already-exited roots, against the complete successful cohort list. Exactly one nonfailed, publication-complete cohort must have the same native PID and contain that birth's native event time within its reservation/publication interval. Zero owners or multiple owners makes the observer irreversibly unknown before any callback, root clearing, cohort clearing or shutdown-fenced flag. Existing forward uniqueness simultaneously rejects multiple births matching one cohort. Together these checks enforce a bijection at the real physical stream fence.

No timing window is treated as sufficient proof by itself. The unchanged native stream still requires actual event sequencing, audit identities, no live descendants, completed publications, original matched reaps, the native self-pulse and `es_sync_client` completion. This patch neither fabricates those inputs nor changes observer initialization/entitlement requirements.

## Evidence

`check.py` passed exact baseline/output replay and eight inert boundary cases: pending reservation with unrelated exited birth refuses; the valid matched early-exit case passes the model only after publication/reap; live child refuses; failed-before-child with no births passes; failed-before-child with an extra birth refuses; duplicate cohort ownership refuses; reused PID with distinct births refuses; unresolved publication refuses. These are matching-model checks, not execution of Endpoint Security or native process observation.

`overlay.json` pins the actual a4 source/header and existing `native-build-a2.json`. `source.patch` and `replacements.json` describe the same single insertion. `compile-review.json` supplies exactly one successor compilation row for `observer`: only the source operand, object output and dependency output differ from the selected row. No flags, includes, public ABI or other native objects change. Root must create its fresh output directory, use `scripts/native-build.py`, validate the resulting dependency closure, and link the new object into the matching successor; worker ran no compiler or linked executable.
