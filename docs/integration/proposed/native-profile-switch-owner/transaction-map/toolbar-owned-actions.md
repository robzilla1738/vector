# Toolbar-owned extension actions and real target profile bindings

`toolbar-owned-actions.patch` changes only current155 ToolbarView h/cc. It keeps
the actual outer ToolbarView, LocationBarView/Omnibox, BrowserWindowInterface,
permanent controls and their callbacks alive. It never calls ToolbarView::Init.

## Original source effects and exact limits

Supplied metadata at0x41f3cc8/3cd0 references the literal `ToolbarView`
(0xdaea5cd) and `chrome/browser/ui/views/toolbar/toolbar_view.cc` (0xdaea5d9).
Original BrowserView045b7db8 calls this owner's41f4b88, followed by15dcefc with
actual active target WebContents. The bounded raw proofs are included.

41f4b88 resets an observation/subscription at+858 and calls41f4770, which
clears alias+618, removes/destroys owned view+610, then clears its raw slot. It
then conditionally replaces actual child+5b8, destroys/recreates owner+718 via
30ff6c4, and owner+720 via456db84, and reorders child views by their actual indices.
15dcefc updates the location-bar alias+5b0, extension icons and pinned icons, then
reload/debugger state. These match current155's real ToolbarView::Update effects.
The exact spelling of old+720's C++ class remains unproved; its constructor is a
non-View subscription owner and **is not claimed to be PinnedToolbarActionsContainer**.
This proposal uses current155's actual constructors and ownership graph rather
than assigning old offsets new class names by guesswork.

## Caller order and actual API

1. Check `CanRebindOwnedActionsForAuxProfileSwitch()`. It accepts only initialized
   normal, regular-profile native toolbars with actual owned extension/pinned
   child subtrees and no running overflow menu. WebUI toolbar variants are
   truthfully excluded; no renderer is silently retained across a profile change.
2. Before identity changes, prepare the window extension side-panel manager.
   This deregisters actual old extension entries and releases their BrowserActions
   references while the old action/service owners still exist. Stop side-panel
   pinning observations through its separate prepare API.
3. Call `PrepareOwnedActionsForAuxProfileSwitch()`. It records the actual child
   indices, disconnects OverflowButton's raw ToolbarController alias before
   destroying that controller, retires ExtensionsToolbarCoordinator before its
   tracked child, clears raw extension/pinned aliases before destroying both real
   child views, and disables overflow until commit. Existing extension destructor
   paths synchronously close actual anchored widgets and remove model/user-data
   observations. No old extension model is carried across identity.
4. Commit actual Browser/empty TabStripModel identity; bind target BrowserActions
   and other required window services. Rebind the stable vertical controller.
5. Call `RebindOwnedActionsForAuxProfileSwitch(target_profile)` while the model
   remains empty. Construct actual ExtensionsToolbarDesktop and
   PinnedToolbarActionsContainer at their original accessible child indices.
   Construct the real ExtensionsToolbarCoordinator against the new child.
   This reinstalls the actual target's toolbar model/user-data and action owners.
6. Rebind side-panel pinning model observations, then the window extension
   side-panel manager against the target, after the target toolbar model/action
   owners exist. Real tab-scoped side panels move with their actual tabs.
   These operations must not happen while old toolbar action references remain.
7. After real target tab insertion and stable LocationBar/Omnibox rebind, call the
   existing ToolbarView::Update(actual_active_contents) at the original finish
   phase. This patch does not perform a premature update against an empty model.

The same rebind path can rebuild the old profile after an abort before identity
commit if the orchestrator has restored the required actual empty-model invariant.
No partial prepared state may escape the synchronous owner transaction.

## Profile preferences and why replacement is necessary

Current BooleanPrefMember::Init is one-shot: Destroy unsubscribes but does not
clear pref_name_, and another Init DCHECKs. The three private members become
owned unique_ptrs, with ordinary initialization/read behavior preserved. Prepare
destroys old forward/home/ChromeLabs subscriptions; Rebind constructs fresh members
against actual target PrefService with the same keys and callbacks. Home/forward
visibility uses the existing actions. ChromeLabs gets target policy visibility
without changing pin settings or writing badge metadata. Permanent control
callbacks and the outer toolbar stay alive; no placement reconstruction is used.
Callbacks/layout queries defensively handle the synchronous prepared interval.

Existing InitLayout rebuilds only FlexLayout and ToolbarController, not permanent
control children. Reusing it after both subtrees exist restores real target pinned
model/overflow dependencies and the same layout rules, without duplicate controls.

## Remaining owners and evidence limits

AppMenuIconController, ReloadButton, avatar/media/Glic and other retained controls
have their own profile service dependencies. This scoped method does not claim to
rebind them or make full profile switching ready. Parent owns actual LocationBar/
Omnibox and the full transaction. Original old/current class mappings are explicit
platform adaptation limits; no whole Features or Toolbar Init is substituted.

The manifest pins two actual source inputs and outputs. `git apply --check`,
temporary replay, exact output hashes and unchanged shared-input comparison pass.
No native build/shared writes, profile data, target execution or runtime acceptance
occurred. Integration still needs actual disposable target-extension/pin changes,
old-model notification suppression, extension panel action-reference teardown,
child order/overflow behavior and abort restoration.
