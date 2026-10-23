# Supplied daemon task-path projection

Source-only successor to the pinned final-local v2 daemon. `applyAuxNativeTaskPaths(source)` replays 81 exact count-checked anchors and checks both complete input/output SHA-256 values. No accepted app, staged source, CSS, asset, Chromium checkout, credential, real profile or signing state is changed.

Input: `3bfa93416fc399e2c48ce0e7ed27fdea7bf283e9f7f821ca82f97ff5ac39f081`. Output: `dc4d57bf49beac888e4e75cc4429d537e806a76fd7b5b70fd521c36510049909`. The original unconditional state2 refusal remains first, with identical bytes. The helper has no eager binding or filesystem side effect ahead of that refusal. This is an inactive implementation slice, not a working protected startup.

## Actual supplied changes

| Supplied consumer | New location/behavior |
| --- | --- |
| `AUX_HOME_PATH`, `getAccountRoot` | Actual native control home; no environment root selector or arbitrary string-root passthrough. Private account IDs/locators are strictly normalized inside the current owner's home. |
| Settings, models, credentials, state DB, context ledger, sync DB, private session recovery/messages | Remain control data. The four private session constructor calls stay private. |
| Projects, account caches, memory markdown/index input, skills, AGENTS/SOUL seed files/settings, skill bootstrap/watchers, file-sync content | Current task home's account projection. Sync bookkeeping remains private. Memory-history JSONL and dream metadata are separately private, even when called with a task-account locator. |
| 32 actual session call sites | Separate `getSessionTaskDir`: attachments, artifacts/output, tmp, file routes/previews, channel/remote-control files, browser tool paths, truncation, file watchers, child/CLI tool contexts and permission roots. Private `messages.jsonl` directories keep their existing date-based layout. |
| Session creation and cloud restoration | Create private/task directories separately; default tool workspace/permission roots use task storage. Private restore journals and transcript rewrite/fsync stay private. |
| Routine memory | Task projection; persisted locations outside its exact routine subtree refuse rather than migrate or override the root. |
| Permissions and file tools | Task account/session/runtime roots, explicit complete control-home denial, and refusal of a private control workspace. Existing native mandatory filesystem envelope remains necessary and is not weakened. |
| Runtime/computer-use/model caches | Task home, separate from private control data. Native executable/helper provenance still requires its paired trusted producer; a relocated cache path is not permission to execute it. |
| Account removal | Existing account cleanup also targets the same account's task projection. Native owner refusal leaves cleanup incomplete rather than retargeting another owner. |

The current native API contract is `process._linkedBinding('aux_owned_native').captureStorageRoots()` with no arguments and a readonly/nonconfigurable method. Each use must query the actual current native owner. The frozen snapshot has exactly `format: 'aux.native.storage-roots.v1'`, `layoutVersion: 1`, positive decimal `ownerGeneration`/`transportGeneration`, and actual FD-derived `controlHome`/`taskHome` locators. The helper refuses malformed snapshots and any owner/generation/root change within the same daemon context. It accepts account IDs >=0 (including the actual local account 0), exact current-owner account locators and the supplied session-ID grammar. It accepts no arbitrary root setter, environment path, claimed native-admission flag or legacy directory.

**These are locator projections, not authority.** Shape validation, freezing, generation comparisons and numeric account IDs do not authenticate an account, prove symlink safety or authorize a filesystem operation. Account/session authorization remains in real supplied callers plus the paired native broker. FD-relative beneath-root access, native current-Owner reservation/lifetime/close handling, actual I/O admission and queued cancellation still need complete integration. A path can become stale after this helper returns; no JavaScript check substitutes for that native boundary. Externally chosen workspaces retain their separate permission requirements. No whole-account/control-root exception is added to native denial.

## Composition and checked evidence

The integrator owns active staging and shared native registration. Apply this transform to the exact v2 input **first**, then apply the broker transform against the explicit output pin above. Do not select it in an active stage until the paired native v5 storage-root producer and intended broker/permission consumers exist. Replacing the current first refusal or enabling cold startup is outside this slice.

`node --test docs/integration/proposed/profile-isolation-continuation/task-paths/transform.test.mjs` runs six focused fixtures against functions extracted from the actual transformed source, plus full-module syntax checking without execution. They check constructor separation, legacy/current-owner/generation refusal, actual attachment writer/file resolver behavior, private transcript separation, permission/file-tool projections and private memory metadata. Only disposable synthetic files are used. The native binding is an explicit fixture seam: **no native authentication, actual authority, real daemon startup or protected filesystem admission is proven**. Evidence is under `evidence/`.

The first attachment fixture used macOS's `/var` temporary alias while the actual file resolver returned canonical `/private/var`; canonicalizing the synthetic fixture corrected that expectation. Production code was not weakened. No provider, network, Keychain, signing, owner-state access, app launch or UI comparison occurred.

Remaining acceptance: sequential broker composition/syntax and exact source association, native producer/consumer compilation and full link, trusted helper relocation/provenance review, native filesystem/owner-lifetime integration, then separately authorized disposable app execution. Existing profiles/metadata are not migrated by these rules; legacy or private persisted tool paths refuse.
