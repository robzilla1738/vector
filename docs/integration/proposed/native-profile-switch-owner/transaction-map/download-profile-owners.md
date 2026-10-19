# Download toolbar private profile-source owners

Current155 has no DownloadToolbarButtonView class, despite obsolete comments
remaining in controller headers. The actual owner is DownloadToolbarUIController;
it finds the actual pinned ToolbarButton through the existing toolbar provider.
This two-source proposal preserves that outer controller, window user-data,
physical toolbar/button ownership and permanent command callbacks. It does not
destroy a button, rebuild a whole toolbar, cancel a download, or fabricate empty
successful download results.

## Actual constructor/callback graph

- DownloadToolbarUIController caches the actual BrowserView and downloads ActionItem,
  creates private DownloadBubbleUIController and DownloadDisplayController, and
  observes its source ProfileBrowserCollection.
- DownloadBubbleUIController caches source Profile, DownloadBubbleUpdateService,
  OfflineItemModelManager, optional delayed warning survey launcher and activity
  watcher. Its weak navigation/model handles are used by actual bubble views.
- DownloadDisplayController sets the bubble controller's back-pointer, queries
  the genuine update service for initial display state, owns icon timers and a
  fullscreen subscription, and registers/unregisters the global power observer.
  These private objects have paired lifetimes and can retire together only cold.
- BrowserActions' downloads action resolves `DownloadToolbarUIController::From(bwi)`
  on each invocation, then calls InvokeUI. It does not permanently capture the
  controller's weak factory or either private controller pointer.
- Actual DownloadBubbleUpdateService routes each profile event through that
  profile's current browser collection, resolves From(browser)->bubble_controller()
  dynamically, and null-checks the result. It does not own these private objects.

## Concrete cold/migration contract

1. `CanRebindForAuxProfileSwitch()` verifies normal regular actual owner identity,
   both initialized private owners, no callback/command currently on the stack,
   no active or pending anchor/bubble/contents/closer/immersive lock, no pending
   download-start animation, no download button menu, and no still-valid tracked
   bubble or animation Widgets. It does not block downloads merely because they
   are running in the source profile; their real profile services keep running.
2. Before old target action/pinned-toolbar owners are retired, call
   `PrepareForAuxProfileSwitch()`. It marks the owner cold, invalidates only
   transient weak UI callbacks, stops the closed-view auto-close timer, detaches
   the old profile browser-collection observation, destroys display controller
   then bubble controller, and clears the old ActionItem pointer. Private
   destructors retire their timers/fullscreen/power/watchers/survey weak tasks.
   It does not invoke a download model command, cancel an item, close a dialog,
   or report a cancellation/success. Active UI was refused by the cold check.
3. Commit actual target Browser/empty model and rebind target BrowserActions,
   pinned toolbar and fullscreen owner. Call
   `RebindForAuxProfileSwitch(actual_target_profile)` on the same outer controller.
   It verifies exact current target/user-data scope and empty model, resolves the
   genuine current downloads ActionItem, constructs real target bubble/display
   owners, restores actual target fullscreen and ProfileBrowserCollection sources,
   then draws genuine target state. The existing display constructor queries the
   actual target update/offline service; no fake successful empty model is supplied.
   Initial cached render fields are reset to the ordinary constructor defaults
   before that real service query, preventing old profile counts from lingering
   when the target service reports no items. A final existing UpdateIcon draws
   the queried target state even for an empty target service/pinned button.
4. Continue the owner's actual target tab insertion/finish. Abort can use this
   same target rebind path with the genuinely restored source identity/services.
   Prepared state must remain inside the synchronous native owner transaction.

## Reentrancy and actual widget lifetime

The actual mutation/callback entry points use a scoped depth counter, including
commands, display callbacks, bubble assembly/close and animation creation. This
prevents replacing private owners while an old controller is using them on its
stack during a nested UI callback. Target constructor display calls are permitted
only inside the guarded rebinding phase; Can remains false until they finish.

Actual bubble Widgets are weakly tracked immediately after real creation. They
remain tracked after OnBubbleClosing clears delegate/content aliases. Actual
self-owned download-start animation popup Widgets are also weakly tracked through
the existing animation's actual GetWidget. Rebinding waits for actual widget
retirement rather than inferring absence from a cleared pointer or timer.
No animation is replaced with a screenshot or fake completion. The controller
still uses the existing self-cleaning animation and bubble behavior unchanged.

Completed-view-only caches (security content selection, click timestamp, mode,
render counts) retire with the old private UI state. Generic localized tooltip
strings remain shared safely. Actual download items and their services are never
cleared or transferred to the target profile by this hook.

## Evidence and limits

This is a current155 owner adaptation. No identically named old supplied download
controller/profile helper is inferred from offsets. Supplemental source evidence
pins actual controller constructors/destructors, dynamic action/update dispatch,
real animation/widget ownership and feature creation/fullscreen initialization.
Patch checking, temporary application, exact two-file output hashes and unchanged
shared inputs pass. No native build/shared writes, capture, network, owner download
history, real profile data, target execution or runtime acceptance occurred.

Disposable acceptance still needs source downloads continuing in source scope,
target-only rows/counts/actions, real model/observer lifetime, pending-anchor and
live/closing bubble refusal, active animation/menu/command refusal, callback
cancellation isolation, target fullscreen behavior and abort restoration. This
controller does not claim ownership of other profile-bound toolbar controls.
