# Shared-tab conflict resolution and local recovery views

This three-file overlay addresses feature plan §3.2 against the current integrated controller/header/Tree sources. Apply `native-window-recovery.patch` to the matching baseline, preserving any newer integrator changes. No GN, store schema, theme, sidebar sizing, default row style, renderer implementation, startup authority or signing changes are needed.

## Behavior

- **Close tab everywhere (archive)** commits the shared archive before any native close. Failed, stale, refused, or uncertain commits leave every view untouched. On success, only previously unprotected exact native handles/documents/URLs are candidates for removal. Each close rechecks native profile generation, still-archived membership, pending/blocked model state, and actual protection. Divergent/protected/newly changed views and late native close refusals remain intact.
- Those retained views appear as **Recovery — [actual page title]** rows in their original Space in that window only. The existing row component renders them with the current style and actual document URL. Activating a recovery row selects the existing local WebContents. It does not navigate, recreate, move, or focus another window's page.
- **Keep independent copy** appears beside the existing pending shared-URL action and on recovery rows. It creates a fresh logical UUID with the captured native document URL, commits it through the same CAS/owner-generation storage path, and only then rebinds the exact initiating live view. History, page, scroll and focus remain in that renderer. A changed/removed/rebound view is not rebound to the stale document; the committed copy remains available in the shared list and the UI reports that the original view was retained.
- **Close this view** is distinct from shared close. It respects actual beforeunload/actor/split/download protections. Closing a pending-update view no longer writes its older local URL back over the newer shared URL.
- Recovery is derived from the existing durable archived record and existing serialized `aux_organization_tab_id`. The current `browser_tabrestore.cc:109–111` restores that identity independently of archive state. Reconcile keeps it as a local recovery view; registration, navigation publication and activity publication do not resurrect archived membership. No new session marker or writable shadow store is introduced. Explicit Undo/Restore may intentionally restore the shared record.
- Native window closure remains separate: the existing `closing_all()` guard keeps the shared list intact. Mobile remains excluded.

## Verification and integration

The count-checked patch modifies three existing files and adds none. It passes whitespace-error checking and exact byte-for-byte patch replay. Actual current native APIs were inspected for session identity restoration, model commit, Profile keep-alive and native close handling. No app/provider request, owner data access, extra build, signing or runtime test occurred.

The root integrator must project the overlay after the running a14 build completes and compile the controller and Tree translation units. Focused disposable runtime acceptance remains: two-window divergent navigation → independent copy; shared close with protected or divergent second view → visible local recovery; failed CAS/owner switch leaves every view intact; restore an existing archived-ID session view → recovery row without shared resurrection. These checks are not claimed as passed.

The broader protected startup/drain foundation remains independently open; this change makes no whole-profile custody or release-readiness claim.
