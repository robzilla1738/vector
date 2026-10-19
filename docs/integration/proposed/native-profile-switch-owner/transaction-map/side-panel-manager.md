# Window extension side-panel lifetime during an in-place profile switch

This proposal adapts the supplied transaction to Chromium 155's real extension
side-panel owners. It does not change the Agent UI, synthesize a renderer, reopen
a panel automatically, or implement a full profile switch by itself.

## Supplied evidence

`04559f80.c` lines 183–274 obtains `SidePanelUI` from the actual BrowserWindowInterface
user-data host (through BrowserWindowFeatures+0x390), constructs the extension
entry key for supplied Agent ID `fjdhphbdlfjogobdofoaagnlnkoibdge`, compares that key
against showing entries, and invokes the close virtual function only on a match.
The bounded `original-agent-panel-close.txt` confirms the key comparison at
0x455b288 and the close call at 0x455b2b0–0x455b2c8 with integer arguments 1,0,1.
Those old arguments are not blindly cast into the changed 155 API. Current 155
entry deregistration already uses its real `Close(kSidePanelClosed, true)` path.

The later transaction invokes 0x4164b0c after identity changes. Its bounded dump
`original-profile-feature-refresh.txt` shows narrow feature recreation rather
than whole BrowserWindowFeatures initialization. Its first reconstructed object
uses constructor 0x2e9ae04, whose supplied literals name
`BrowserExtensionWindowController` and
`chrome/browser/extensions/browser_extension_window_controller.cc`. This does
not establish that the old helper owned a 155 ExtensionSidePanelManager. Retiring
155's old-profile entries is a platform adaptation required by its actual owner
and renderer lifetimes, not a claim that every old extension entry was closed by
that original Agent-only branch.

## Concrete caller contract

1. Before Browser/model identity changes, call the existing window manager's
   `PrepareForAuxProfileSwitch()`. The actual browser must still have its old
   regular profile and old window actions. This preserves the manager object,
   SidePanelRegistry, scoped user-data registration, and unrelated registry entries.
2. Prepare marks the manager unavailable to registry callbacks, stops observing
   its old ExtensionRegistry, and swaps its coordinator map into a local owner.
   It stops **all** old coordinators' SidePanelService observation and weak
   callbacks before deregistering any entry. Deregistration uses the real
   registry, synchronous close, cached-view destruction, and action-reference
   release. Coordinators are destroyed only after their entries are removed.
3. Commit actual target Browser and empty TabStripModel identity. Rebind the
   target's window action/service owners before registering target entries.
   Call the same manager's `RebindForAuxProfileSwitch(target_profile)` while the
   model is empty. The manager verifies target identity and the unchanged registry,
   then reads the target's real ExtensionRegistry and SidePanelService options.
   Creation callbacks remain lazy; nothing is shown or navigated by this hook.
4. If aborting before identity commit, the same rebind method may restore the
   original profile **only while the real model is empty**. A caller must not
   leave the window prepared and then resume ordinary operations.

Tab-scoped managers/coordinators are deliberately excluded: they remain with
actual TabInterface/Profile objects. Existing tab delegates release/reacquire
window action references during actual detach/insert. They are not rebound to a
foreign profile and must not be discarded with a window-scoped manager.

## Why the ordinary destructor is insufficient

ExtensionSidePanelManager's default destructor only destroys its coordinator map.
ExtensionSidePanelCoordinator explicitly documents that `DeregisterEntry()` is
not automatic in its destructor because removal can reenter UI observers.
SidePanelRegistry owns the entries and their callbacks independently. Keeping
those old entries while resetting the manager would leave old profile hosts or
invalid weak callbacks in a stable window registry.

Current `SidePanelRegistry::Deregister` closes the exact showing entry synchronously
with animation suppression, then erases it. `ExtensionViewViews::OnViewDestroying`
calls `ExtensionSidePanelCoordinator::OnViewDestroyed`, which resets host observation
before destroying ExtensionViewHost (the existing UAF-prevention order). Removing
an entry also invokes the existing delegate's `OnEntryDeregistered`, releasing its
old BrowserActions reference. The proposal uses these existing paths.

## Other owners remain caller work

This hook does not migrate SidePanelCoordinator's profile-bound toolbar pinning
observations; its PinnedToolbarActionsModel and ToolbarActionsModel observations
must be rebound separately while preserving existing observers. It also does not
recreate non-extension global entries. Root-owned native sidebar/provider code
must discard an old-profile WebContents rather than navigate that WebContents as
if its BrowserContext could change. No new Agent renderer provider is invented.

## Verification and limits

Four actual source inputs and all output SHA256 values are pinned in
`side-panel-manager-manifest.json`; source evidence is separately pinned. The
patch passes `git apply --check`, application to temporary copies, exact output
hash comparison, and unchanged shared-input comparison. No native compilation,
runtime extension host teardown, profile switch, owner profile, or OS grant was
used. Integration acceptance still needs a disposable showing Agent panel switch,
an inactive cached panel switch, a target with the extension disabled, real tab
panel detach/insert, and cancellation while all callbacks remain valid.
