# Actual shared-tab owner lifecycle and source rollback

This four-file followup is pinned to the previously applied Begin/Rebind/End adaptations in SessionServiceTabGroupSyncObserver and MostRecentSharedTabUpdateStore. It supplies actual cold/source-abort semantics and target eligibility instructions; it does not claim to migrate the separate profile-wide sync delegate/listener.

## SessionServiceTabGroupSyncObserver

`CanBeginAuxProfileSwitch()` checks actual regular model/profile identity, tab-group support, real current TabGroupSyncService equality, unpaused state and no callback on stack. Begin captures the actual source and unregisters its real service observer while preserving model and physical SessionID. Rebind still requires the actual committed regular target, actual empty model and real target sync service; callbacks remain persistence-paused through real insertion. End validates genuine target registration, then resumes. Actual group metadata comes from the existing touched-profile session rebuild, not synthesized sync callbacks.

`AbortAuxProfileSwitch(generation, source)` requires exact generation/captured source, genuine restored model profile and every real WebContents BrowserContext. It restores the actual source service observation without requiring a fake empty model, writing session metadata, or emitting remote group events. All new callback-depth leaves use destruction-only WeakPtr scopes, not member AutoReset references that can outlive their owner. This class owns no separate asynchronous task queue or renderer; its real observer and synchronous session metadata calls are the relevant lifetime.

## MostRecentSharedTabUpdateStore

The old Begin discarded real source local IDs even if transfer failed. Begin now retains that exact source metadata while making it inaccessible during transfer. `CanBeginAuxProfileSwitch()` checks actual window/model/profile/service support and asks BrowserUserEducationInterface whether the specific shared-tab-changed promo is actually queued or active. It refuses that pending user-education operation, including continued promos, rather than aborting it or inventing a completed result. Current callback-stack depth is also cold-guarded with destruction-safe weak leaves.

`RebindAuxProfileSwitch(target)` requires actual committed empty target model and actual eligible service; it clears only source UI anchor IDs. `EndAuxProfileSwitch(generation)` resumes after target insertion. `AbortAuxProfileSwitch(generation,source)` validates actual restored source ownership and retains original IDs without manufacturing a promo. The existing guarded GetIPHAnchor resolves only actual current groups/tabs in this same Browser. The promo anchor filter in browser_user_education_service.cc dynamically calls From(browser) and HasUpdate; it does not retain this store's raw pointer in an async closure.

## Optional owner gain/loss

Apply the same actual BWF creation condition: normal regular profile, model SupportsTabGroups, non-null TabGroupSyncServiceFactory result. For existing source owners, cold-check and Begin before source detach. If committed target loses eligibility, destroy the prepared observer/store after identity commits while empty (observer's real source registration was already removed; store has no queued/active promo). Never resume a source observer against an ineligible target. There is no post-commit rollback.

If target gains eligibility, create the exact existing BWF owners against the actual committed target while its model is empty. Immediately run their Begin and Rebind sequence before insertion, then End with that actual returned generation after insertion. Existing constructors bind only real profile services/observer registration; they do not manufacture a saved group. Where target remains eligible, keep stable owners and use Rebind. Before identity commits, failed detach instead uses the explicit source Abort APIs. No BWF/provider files are changed by this proposal.

## Separate required sync-listener boundary (not solved here)

SavedTabGroupModelListener is owned by the profile's TabGroupSyncDelegateDesktop. Its constructor observes ProfileBrowserCollection; OnBrowserCreated calls actual TabStripModel::AddObserver(this). A transfer that intentionally emits no BrowserCreated/Closed notification does not migrate that registration. OnTabGroupAdded calls the captured source service's AddGroup; selection callbacks also call that source service. Simply rebinding the BWF metadata observer cannot correct this profile-wide owner.

The public CreateScopedLocalObserverPauser is not a complete solution: PauseLocalObservation/ResumeLocalObservation only iterate existing LocalTabGroupListeners and do not suppress the top-level group-created/selection observer. Calling fake BrowserClosed/Created, global saving disable, deleting group mappings, or issuing remote sync changes is not authorized by this port. A full provider must retain an explicit unsupported/cold guard until the genuine per-model registration and existing group listener ownership transfer is implemented. Do not claim complete group-sync parity from these two owner hooks.

Four-file isolated patch check/replay and exact baseline/output SHA checks passed; all shared sources remained unchanged. Source-only, uncompiled, no native build/runtime/owner profiles/data/network/OS authority. Full profile-switch functional acceptance remains pending.
