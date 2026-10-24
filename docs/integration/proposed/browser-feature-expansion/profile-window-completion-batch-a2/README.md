# Profile and window completion batch A2

This proposal preserves the accepted UI and actual per-window pages/history. It fixes delayed profile/account callbacks and makes profile identity reads truthful. It contains no row construction, color, geometry, animation, toolbar, or default preference changes.

Inputs are the actual frozen native bytes under `/private/tmp/aux-chromium-recovery-snapshot-20261023/src`, captured from the reviewed63 composition. `source-plan.json` records every native-relative path, input/output SHA-256, exact sequential anchor and count, and generated source path. `native.patch` is an exact unified patch. Only this proposal directory is written; root owns projection, registration and compilation.

## Implemented source changes

- Profile-switch completion resolves the original request generation and actual expected Profile again after window activation. Separately restored windows must still belong to the target; the originating request must remain current. Account/settings continuations cannot receive a live window that has since switched elsewhere.
- Profile-cache lookup/creation requires actual regular loaded profiles. Reentrant cache creation, tab attachment and keep-alive callbacks are followed by weak-lifetime/profile/workspace/closing revalidation. Unfinished caches are retained; no unrelated user window or live page is substituted.
- Both profile menus bind deferred commands to their original native Profile and account/cookie binding epoch. Old posted commands refuse after source rebinding or cookie restoration. The New Profile completion also checks the originating request generation and initializes the genuine target before dispatch. Superseded newly created profiles are retained rather than deleted.
- Account registry reads capture the real home, binding epoch and restore epoch. Stale replies are re-read through the existing queue path; retired watch notifications cannot retire a newer watch. Definite task-post failure clears `reading_` without claiming a read occurred. An actual identity-pref change retries account capture, and missing IDs refuse projection.
- Avatar requests use a generation in addition to URL and actual binding epoch. This rejects stale same-URL results and reentrant refreshes, including after cookie restore.
- `GetProfileId` is read-only. It returns the actual registered preference or empty; it neither writes nor fabricates UUIDs. All nonempty existing values are retained unchanged.
- `InitializeFreshProfileIdentity` is restricted to an actual original regular Profile, a registered writable pref, `INITIALIZATION_STATUS_CREATED_NEW_PREF_STORE`, no user value, and genuine `IsAuxLocalProfileAdmitted` admission. An explicit empty user value or ambiguous existing store refuses initialization. Only this creation helper generates a UUID and calls the actual PrefService writer.
- Initialization runs from `RequestProfileBootstrap` and the actual sidebar `CreateMultiProfileAsync` completion. Its `kCreatedPending` result means the native pref accepted the value in memory. It is **not durable success**, successful disk write, native I/O settlement or a browser-drain certificate. No success-less `CommitPendingWrite` callback or invented ticket is used.
- Organization storage rejects empty identity ownership; the factory refuses to create an empty-ID keyed service. A window bound before fresh setup waits for the actual `aux.profile_id` change, then attaches its real keyed owner. This narrow attachment preserves native tabs, ordinary-row eligibility, view mappings and restored Space selection; it does not call a full window rebind or reinterpret an existing nonempty identity.

## Actual lifecycle evidence and scope

`chrome/browser/ui/profiles/profile_customization_util.cc` calls `FinalizeNewProfileSetup`, which posts the actual weak Profile into `RequestProfileBootstrap` after the omitted-profile flow finishes. Already-visible profiles skip that section, so the sidebar's genuine `CreateMultiProfileAsync` completion also initializes before `DispatchSelectedProfile`.

The existing organization controller calls `OrganizationProfileServiceFactory::GetForProfile` once during window binding and otherwise resolves existing services. Because bootstrap is posted, it can follow initial window binding. The added actual pref observation wakes that specific initially missing identity case; there is no caller readiness boolean, timer or getter-side repair.

`Profile::IsNewProfile()` alone is insufficient: its implementation also treats Chrome first-run as new. The helper instead uses the actual native preference-store initialization status and absent user value. Existing preferences, legacy nonempty IDs, ambiguous empty IDs and owner data are not migrated, reset or inspected.

The existing native admission checks actual browser roots, admitted generation, wrong-process/sequence/closed state, and cookie-restore exclusion. If admission is unavailable when the bootstrap hook runs, initialization truthfully refuses. This proposal does not invent a polling retry or claim the startup admission order was observed in an app.

## Lean verification performed

`python3 check.py` performed one exact sequential-anchor replay across **12 files / 61 anchors**, verified input and generated hashes, applied the unified patch in a disposable tree, verified output hashes, checked reverse applicability and changed-line whitespace, then confirmed all native input hashes remained unchanged. `actual-source-check-a2.json` records the real result.

No native build, app/helper launch, profile switch, cookie operation, provider/cloud call, signing, packaging, OS grant or owner-state access was performed by this lane. The source replay is not a browser behavior test.

## Integration checks still required

Root should compose these overlays once the frozen build ends and compile the nine changed owners: `aux_profile_switch_request`, `aux_profile_switch_workspaces`, `account_profile_avatar`, `account_profile_updater`, `aux_sidebar_view`, `profile_identity`, `profile_gate`, `organization_profile_service`, and `aux_organization_window_controller`. No new native file or GN registration is introduced.

A bounded disposable-app check still needs to confirm:

1. Fresh profile creation obtains one stable actual identity; existing identities survive unchanged; ambiguous missing identity refuses without writing.
2. Delayed menu/create/account/avatar results do not cross a switch, cookie restore, superseding request, or window close. Current operations still complete normally.
3. Separately restored profile windows retain their own pages/history and source window; switching back returns the retained workspace.
4. A window opened before fresh bootstrap attaches organization controls after identity initialization without losing row eligibility or restored Space.
5. Actual bootstrap runs after genuine admission, or a genuine existing admission-ready lifecycle must retry initialization. The source refuses if admission is absent; that ordering has not been runtime accepted here.

Pref persistence durability/whole-browser drain remains the existing pref writer owner's responsibility and is not certified by this patch. The authenticated daemon-side account-binding POST remains a separate boundary: client-side result fences do not prove server-side ordering or physical settlement. No protocol changes are proposed here.
