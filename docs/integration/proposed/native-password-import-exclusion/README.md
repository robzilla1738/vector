# Password import owner-scope completion

Current source audit against composition586 found a concrete remaining scope violation, not merely missing acceptance. The actual staged supplied Settings component `general-3dgRbrRk.js` has two configurations: Tm full import (omits dataKinds) and bm bookmark import (Em=["bookmarks"]). The prior copy-only adaptation changed Tm prose to "Bring your bookmarks" but did not constrain native behavior. Native omitted-kind selection still admitted source passwords. The native standalone importer had additional current/new profile routes. This proposal implements the owner's explicit exclusion while retaining history, cookies/site sessions, bookmarks, extension handling and other nonpassword data.

## Native changes, source pinned

- `import_service.cc`: remove passwords from public supportedDataKinds, exclude from Chromium current WebUI job, explicitly reject any requested password category before native data access. Public omitted defaults use corrected discovery; original explicit-bookmark-only contract remains. Adjust internal Safari full category cardinality to three.
- `migrator.cc`: exclude passwords from source default categories; reject password snapshot requests before any file/Keychain lookup. Retain cookies, preferences, history and bookmarks readers and their existing admission. This does not remove installation/provider credentials or ordinary site sessions.
- `firefox_import.cc`: mask PASSWORDS from the actual imported-item bitfield for current and new target owners. Existing unrequested-password completion logic already handles absence; cookie preparation remains unchanged.
- `chromium_source_capture.cc`, `chromium_clone_worker.cc`: only cookie files require source crypto; do not capture a source key just because a password database exists; do not read/decrypt password rows. The existing empty password receipt correctly settles the already-supported absent-category destination branch. Cookie key authorization stays intact.
- `chromium_profile_clone.cc`: Login Data base/journal already excluded from ordinary file cloning; also exclude WAL/SHM companions to prevent copying user-password database fragments into a new profile.
- `safari_import.cc`: no password-store or SavedPasswordsPresenter initialization. Wait only for selected nonpassword category callbacks. Both public and standalone native Safari imports use this owner.
- `safari_data_importer.h/.cc`: additive `include_passwords=true` constructor argument preserves existing upstream callers. Aux supplies false/null presenter. This skips PasswordImporter construction and the ZIP password entry extraction entirely. Original history/bookmark/payment task flow remains; the unused fourth internal barrier is settled without claiming a password category imported. No password events are emitted for the excluded owner.

This is an explicit owner-scope adaptation, not original Aside behavior/provenance. Recovered importer behavior is preserved for retained categories. No signed helper/runtime changes, UI CSS/layout redesign, native build or actual imports were performed here.

## Supplied UI copy

The existing `scripts/lib/provided-settings-import-copy.mjs` exact two-occurrence transformation now says "Bring your bookmarks, history, and other supported browser data" instead of falsely saying bookmarks-only. bm remains explicitly bookmarks-only. The generic sentence avoids promising cookies for Safari; the native per-source descriptor still controls the dialog. No new category selector is added. Stage/repackage the consumer along with native changes. The previous staged v581 copy is not updated automatically.

## Verification and remaining acceptance

`python3 verify.py`: nine exact source/input hashes, complete patch replay in a temporary tree and targeted exclusion invariants. Root owns compilation and packaged verification. This source result is not runtime proof of import completion.

One bounded disposable import acceptance is appropriate after packaging:
1. Create owner-only0700 temporary `AUX_IMPORT_FIXTURE_HOME`; create only synthetic `Library/Application Support/Google/Chrome/Local State`, Default/Preferences, nested Bookmarks JSON and minimal History SQLite with two `.test` URLs and known titles/timestamps. No Login Data, cookies, owner paths or real URLs.
2. Set the fixture environment for the disposable Aux browser process **before** source discovery; verify this nonofficial-build fixture branch is active before invoking getImportSources. It requires absolute nonsymlink temp directory, current uid,0700 and canonical containment. Do not invoke normal discovery without the override: normal discovery enumerates real owner browser paths.
3. In supplied General import UI choose synthetic Chrome and import full. Fixture category inventory excludes encrypted credentials, so this covers actual bookmark/history destination writes and extension-empty path without source Keychain access. Confirm folder hierarchy + title/URL via actual bookmarks UI and both history rows after history service settles. The source queues HistoryService operations, so a progress result alone is not durable proof.
4. Quit/reopen once with ordinary retained disposable state; verify the imported bookmark/history rows persist. Reuse that restart to verify one normal tab, one pin and current sidebar mode/session restoration. Do not run an exhaustive all-browser matrix or repeat20 paid AI tests.
5. Verify a synthetic explicit-password request returns the new error and creates no job. For Safari/Firefox, focused compilation/source boundaries are partial evidence only; at least one real synthetic family fixture is needed before claiming each family runtime accepted.

If current native build is official or launcher strips fixture environment, stop before discovery; don't fall back to real owner profiles. No need to run the import just to prove the fixture is absent.

## Session restoration audit

No new proven session-restore code gap was found in this bounded pass. Current source has the original recovered saved-pin `SessionRestore::IsRestoring` gates and profile-filtered completion binding, plus explicit cached-workspace SessionService ownership. Relevant retained evidence: `native-pinned-tab-entry-session-restore/README.md`, `native-profile-switch-owner/transaction-map/session-cache-policy.md`, `native-bookmark-tab-representation/`. Startup/reopen observation is necessary, not another substitute session implementation. Cross-profile session acceptance remains dependent on the active profile transition repair.

### Focused lifecycle review

Safari full-import utility keeps its four-task barrier: history, bookmarks and payment cards perform the original real work; the absent password-importer branch immediately settles its internal task without emitting OnPasswordsImported. Aux readiness/completion now joins indexes0,1,3 only. Bookmarks-only keeps the original one-task barrier. No discarded category is reported imported. The only remaining unguarded PasswordImporter dereference is inside private PreparePasswords, reached exclusively by the guarded password-Unzip continuation; disabled Aux never schedules it. ContinueImport is already protected by `password_importer_ && IsState(...)`. Removed Safari password stores, presenter, selection vector and their includes; required interface password callbacks are no-ops and never emit progress. Original upstream default still schedules all four categories and receives normal password callbacks.

Chromium new-target `RestoreSecrets` obtains ProfilePasswordStoreFactory only inside `if (!passwords.empty())`. The new worker always returns its original empty password list, so there is no store lookup or AddLogins on this route. Cookies retain actual optional source-key authorization and real destination cookie service callbacks. No secure installation/provider credential boundary is modified.
