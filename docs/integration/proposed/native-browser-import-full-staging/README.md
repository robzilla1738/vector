# Original current-profile import: stage source data before destination effects

Source-only four-file owner correction. It is deliberately the public **mode1 current-profile** flow, not the separate original WebUI mode0 new-profile recursive-copy flow. No native/shared-source edits, build, source-profile read, Keychain/credential operation or OS operation was performed. Not compiled/runtime accepted.

## Original owner and observed deviation

Actual public `startImport` creates the Chromium job, captures its destination Profile, chooses the selected source descriptor, then calls ChromiumProfileMigrator::Start42530c0 with explicit mode1 (427ba9c). Start obtains the real optional source credential on a worker. Continuation42534e8 chooses current-profile reader4253e58 for mode1. That reader assembles a single result containing source bookmarks, history, extension information, passwords and cookies. Its failures remain in the result; absent source databases are skipped. **Only a successful whole result enters UI destination methods4258108/4258618** at42557d0/42557e4.

Current independent ImportService instead loops read→destination-write per category. It can write bookmarks/history/preferences and later fail when source key access or another category read fails. That violates the original source-before-effects boundary.

## Concrete port

`ReadChromiumMigrationSnapshot` stages all selected Chromium source categories on one native worker and returns either the complete snapshot list or a real error. It obtains one actual source-derived key shared by the selected encrypted stores, only when an existing source encrypted DB requires it. Real key failure is fatal; the full-owner prerequisite restored in c99280be7 remains enforced. No absent/zero key enters a cipher. If a previously absent encrypted file appears during snapshot, the worker reports a changed-source error rather than dereferencing absent authority.

Source Bookmarks/History/password/cookie DB absence yields the original empty category result; malformed/unreadable present inputs still fail through the existing bounded real readers. The actual current SQLite read-only snapshot mechanism is retained; this proposal does not claim to replace it with the original temporary-file copy implementation.

ImportService retains the captured real Profile and per-job source/category scope. It admits UI application only after the whole snapshot succeeds, checks weak owner/current cancellation again, and consumes the staged dictionary once. Existing destination policy/model/service checks remain active. Cancel/failure/success clear remaining staged payloads; stale replies are dropped by actual weak owner and cancelled-job guards. No snapshot data or secrets are projected through RPC/progress/model text.

The unsourced independent preferences-copy category is excluded from supplied extension imports; the actual internal `native-import-webui` categories alias keeps its existing explicit preference behavior. The original mode1 source does not have that generic allowlisted-preferences write phase.

## Limits / next coherent dependency

This ports the source-batch/destination-admission boundary using the existing real category readers. It does not claim original Arc sidebar-to-bookmark augmentation, extension installation, every source metadata field, original bookmark folder insertion semantics, history summary semantics or the exact original destination password/cookie completion barrier are complete. Those require the corresponding original owner continuations; no fabricated callbacks or success placeholders are added. Mode0 recursive copy stays separate with prefs_reuse. L4 discovery changes stay separate.

## Pins and integration

Reader baseline: c99280be7 exact output (be8 reader, before L4 discovery rebase). Other three files: actual423 at proposal creation. Root must preserve L4's discovery/API changes when rebasing exact owner hunks. No new files/GN/dependencies. Existing `:migrator` and `:aux_browser_import` objects need focused compilation.

Bounded raw original ranges and provided04253e58.c are hashed in `source-evidence.json`. `verify.py --native-root <chromium/src>` seeds the explicit reader parent plus the three actual pinned files into a temporary tree and verifies patch replay only. No import is executed.
