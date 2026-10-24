# Standard browser profile isolation — owner-selected execution scope

On 2026-10-23 the owner selected **Standard browser profile isolation** in response to question `call_03edf5c81ed64ea2a03f476d8a082345`. This explicitly resolves the review in `../browser-feature-expansion/integration/profile-authority-decision.md`. Protection from unrelated apps running under the same macOS UID is outside the selected guarantee. All actual Aux browser/profile/service, daemon/Worker/helper, CLI, task, PTY/exec/descendant, file and background writers remain in scope. Unknown Aux work is never called drained. This choice grants no signing, installation, OS permissions, owner-data access or app lifecycle operation.

The accepted UI/app and in-flight a21 browser inputs stay intact. The feature candidate is still unsigned/inactive. Existing pre-release node IDs NATIVE, AUTH/OWNER/PEER, COLD/EMBED, LEGACY, PACKAGE and JOURNEY remain open; this is their selected implementation scope, not a competing startup path or a readiness claim. Historical mandatory same-UID evidence remains truthful evidence of the previous stronger contract.

## Parallel ownership and prerequisites

| Lane | Existing nodes and outcome | Owned proposals | Integration dependency |
|---|---|---|---|
| Browser drain | NATIVE / PEER: close actual process-shutdown admission, settle browser/service/descendant writers, authenticated finite receipt | browser-drain C++ source/peer-transport successors | Report/retained-peer schema coordinated with recovery; real physical completion required |
| Recovery | AUTH/OWNER / LEGACY / COLD: versioned paired root markers and actual clean admitted-root reopen | restart-recovery Swift admission and exact dispatcher suggestions | Authentic native settlement report; no caller boolean or lock/PID proof |
| Runtime publication | NATIVE / COLD: native retained seed lease and whole-directory EXCL publication | runtime-publication native sources and exact WorkerHost/dispatcher suggestions | Same native shared-use/exclusive-mutation rule as updater/task lifetimes |
| Root integrator | NATIVE / EMBED / PACKAGE: all runtime-use/updater/recovery mutators, common contracts, registration, source pair and assembly | runtime-coordination plus shared files; actual native tree/build/package exclusively | Actual settled child/OS/handle lifetimes; preserve uncertainty and all original validators |

Public interfaces are proposals until both producers and receivers are integrated. Each lane uses its isolated worktree and versioned baseline/source/patch artifacts; no worker edits actual Chromium or existing successful native operands. Root serializes projection/build through `scripts/native-build.py` and `/tmp/aux-build.lock`. Current a21 build and a4 package checkpoint finish before a successor changes their actual input bytes.

## Required invariants

- Standard profiles keep separate cookies, extensions, site/provider/task state and native authority. An Aux task is not an unrelated same-UID application merely because it executes arbitrary code.
- Admission closes before retirement; every physical writer/child/reader/OS operation settles or retains pending/unknown. Cancellation, queue emptiness, timeout, missing ACK and lock acquisition are not clean evidence.
- Browser normal exit, window close, profile switch and crash remain distinct. Clean markers require actual authenticated writer-set completion; an unexpected parent loss remains unknown.
- Normal reopen explicitly migrates safe old prepared records; old admitted/unknown roots are never silently reset, deleted or claimed clean. Preserve actual existing browser state under a verified clean record.
- All participating Aux runtime stage/use/update/recovery/cleanup paths use one native cross-process coordination rule. Immutable seed provenance and mutable/newer runtime provenance remain distinct.
- First seed publishes the verified whole directory with one fixed-target exclusive rename; no existing destination overwrite, per-child publication, ordinary-rename fallback or destructive post-commit rollback. Late failure records unknown rather than fabricated success.
- Default UI/CSS/assets/glass/corners stay preserved. New native contracts do not authorize product launch, signing, release, OS grants or owner state.

## Verification and completion

Workers provide exact count-checked source replay and only focused changed-boundary evidence. Root performs the paired changed-unit/full unsigned builds and exact resource preservation once per final coherent batch. Runtime acceptance remains a separate actual disposable-app journey under an explicit lifecycle scope. A passing fixture/build cannot attest clean recovery, profile isolation, physical writer drain or UI fidelity. No gate closes until its actual implementation and scoped acceptance evidence exist.
