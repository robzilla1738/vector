# Supplied persistent-pin preference reconciliation

This incremental proposal layers the exact service/model outputs of `18588efb6`; it preserves that service's existing shadowed local name so root's compiler-only201 rename can follow separately. The sixth baseline is the actual current `TabStripModel` header. All six before/after hashes are in `manifest.json`. Root owns composition, GN and compilation. No shared native file was changed.

## Source behavior implemented

The original constructor observes actual `pinned_tabs` (`03222424..2434`). `SchedulePinnedTabsReconciliation` (`041d5e6c`) coalesces changes using byte `+c0`, sets it before posting a zero-delay weak task, and that task (`041d8318`) clears it before reading the latest preference. The task collects saved URL specs, enumerates real tracked models and considers only pinned tabs with a valid actual remembered URL. A removed remembered URL adds that native tab's index to the batch. It calls `SetTabsPinned(indices, false)` at `041d8520 → 041e5da0`. **It unpins; it does not close tabs.** Untagged live pins are left alone, even if their visible URL is absent from saved entries. An empty saved list still unpins all actual tagged pins.

The original batch callee checks and sets its reentrancy flag, reverses indices when unpinning, and preserves native split handling.155 retains the same private batch implementation. A guarded `friend class PinnedTabService` allows this one real caller; the service installs the actual UI-thread/reentrancy guard around the real batch. Repeated calls to public `SetTabPinned` would change batching and split/observer ordering, so they are not substituted. This header change invalidates its native consumers; no new public virtual interface is added.

A separate association helper `041d64d0` reads saved entries and returns immediately if none. It reserves one first-unclaimed matching saved entry for each already-tagged pinned tab, preserving duplicate order. Untagged real pinned tabs become candidates. Across all candidates it then makes three ordered passes:

1. Exact visible URL spec (`041d6bc0..6c3c`).
2. Exact real navigation-entry URL or virtual URL (`041d6c7c..6dcc`).
3. Valid host/domain match (`041d6e4c..6ed8`), using the actual GURL host wrapper `00f72a30` and `SameDomainOrHost` with private-registry filter1.155's matching API uses the same `INCLUDE_PRIVATE_REGISTRIES` value. This is saved-pin identity adoption, not a trust/agent-ownership decision.

Each saved entry is claimed at most once. All current exact matches happen before any history match, and all history matches before any domain match. The source installs the matched saved URL in the actual WebContents (`041d6f80 → 04557cb4`), caches it by actual tab identity, updates native session metadata, then sends `TabChangeType::kAll` notifications only after every identity is installed (`041d6ac4 → 015dae48`, whose actual observer dispatch is pinned). It does not navigate, open, close, reorder, or rewrite the saved preference as part of association.

The155 adapter runs association on real same-profile normal-browser observation, real insert/replacement, and the original all-change path for an untagged pinned tab. It reads actual navigation history and tab handles. The existing same-window transaction pause remains authoritative: pending pref tasks do nothing while paused; a genuine matching resume refreshes actual observations and schedules the latest preference again. No browser-created/closed events are synthesized.

`041d81d0` persists the exact original key **`pinned_tab_entry_url`** via the actual session service (`041d82f8 → 07ae5e84`). The adapter uses actual `SessionTabHelper` tab ID and actual owning BrowserWindowInterface session ID, checks the real profile and valid IDs, and uses the real `SessionServiceFactory::GetForProfile` contract (null on unsupported/shutdown profile). Pin, unpin, adoption and all-change metadata updates use that real helper. No fabricated session or browser IDs are introduced.

## Explicit remaining limit

Producer recovery corrected the earlier interpretation of `07adfd94`: it is **SessionRestore::IsRestoring(profile)**. Its actual producer is SessionRestoreImpl, and155 already exposes the same registry query and profile-specific completion callback. The follow-up `native-pinned-tab-entry-session-restore` supplies the original three automatic-adoption guards and direct completion binding. It does not construct a close-state proxy. The earlier asynchronous-close label was an interpretation error; historical assembly filenames are retained for stable evidence paths. This historical checkpoint alone lacked those restore guards.

Session restore's corresponding read of `pinned_tab_entry_url` is also outside this slice. The component's drag/drop/ghost, original hover-card controller, compact/temporary-width writer and optional custom active RGB remain separate gaps.

## Verification and integrator hooks

Run `python3 verify.py`: pins the original function bytes/call targets, private-filter/unpin/coalescing operands, actual155 native APIs and exact six-file replay. Focused C++ fixtures cover duplicate claims, all-current-before-history priority, all-history-before-domain priority, private suffix isolation and invalid URLs. They are authored but **not compiled or executed** here; no native build, owner state, dialog, launch, signing or runtime acceptance occurred.

The model's existing lower-level target now needs `//net` for the real registry-controlled-domain matcher. The tabs/service target needs `//chrome/browser/sessions` and `//components/sessions` (both already appear among the actual tabs target dependencies); root should retain whichever current boundary exports those headers. No new source file or registration is needed. Parent owns the actual compile and disposal-profile observation.
