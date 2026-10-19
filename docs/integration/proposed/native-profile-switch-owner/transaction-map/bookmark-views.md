# Actual bookmark and saved-group view profile rebind

`bookmark-views.patch` adapts four appliedv32 source files, with exact inputs/outputs in bookmark-views-manifest.json. It implements actual target-service/UI rebinding for the surviving BookmarkBarView and SavedTabGroupBar. It does not add a completed profile-switch trigger or claim runtime parity. No shared native writes/builds or target execution.

## Same parent views; real target contents

BookmarkBarView retains its existing Browser/BrowserView relationship, observer list, static Apps/Managed/Overflow/All Bookmarks controls, accessibility pane, animation state, geometry and parent/delegate identity. An existing SavedTabGroupBar is also retained, with only its old profile-owned group buttons/menus/service observation replaced. Dynamic bookmark buttons are repopulated from the actual target merged bookmark service in their real order; the original Layout and saved-group OnInitialized algorithms are reused.

The private BookmarkBarUIController cannot simply survive unchanged: its Desktop injector captures an old Profile in the prefs adapter and old BookmarkMergedSurfaceService in the model adapter, and its action adapter can own an old-node context menu. Its outstanding clipboard check holds a weak pointer to that controller. The new hook uses the EXISTING UIControllerFactory::CreateBookmarkBarController, which stores only the stable Browser pointer and constructs the real desktop adapters from its current authoritative profile. No new controller facade, polymorphic default success or fabricated model is introduced. This private controller has no externally exposed pointer and is replaced while the containing View/delegates/observers remain stable.

## Exact owner call sequence

Call `BookmarkBarView::PrepareForAuxProfileSwitch()` on each existing bookmark view BEFORE changing that Browser's profile/model identity. The method disables only this view transiently, invalidates its old clipboard/context/drop/show-folder callbacks, detaches raw menu/View observer pointers before cancelling old menus, destroys the private old-profile controller/adapters, removes the old merged-service observation and clears old node-backed buttons. It clears stale managed-folder title/visibility while target loading is pending. It never writes credentials, opens a bookmark or manipulates the OS clipboard.

SavedTabGroupBar::PrepareForAuxProfileSwitch removes its actual old TabGroupSyncService observation, invalidates old weak drag/button callbacks, destroys old Everything/context menu runners with their node buttons, clears drag state and disables the same child View. A feature-disabled target can leave that view prepared and hidden; the real destructor safely handles its now-absent service observation.

AFTER the Browser/model identify the real target profile and the owner's migration is coherent, call `BookmarkBarView::RebindForAuxProfileSwitch()`. It checks actual model/profile agreement, resolves real target merged and managed bookmark services, obtains the real controller from the existing factory and binds target pref observers/actions. An existing saved-group bar rebinds to actual target TabGroupSyncService. If the target enables saved groups and no bar existed originally, one is inserted exactly after the Managed control with its separator, preserving original static child order. A disabled target keeps any retained prepared child hidden. No Init call is repeated and no duplicate static controls are added.

The original service-loaded path supplies actual target labels/buttons and existing view layout. The target controller pushes its real Apps/saved-group/managed visibility prefs. The view's previous enabled state is restored. The same external BookmarkBarController->BrowserView delegate remains; its separate stable-controller pref rebind is still required in the complete owner transaction.

Prepare/Rebind are synchronous internal seams. The source Profile must remain retained by the real workspace owner while old menus finish cancellation; the parent cache keepalive map supplies this. Cancellation does not claim immediate service/menu delivery. Failure before identity commit can restore the still-current profile by rebinding this same prepared View; this patch invents no alternative profile-switch outcome.

## Stale input and lifecycle guards

Pending drag callbacks are weak-invalidated. Queued drag-exit/update/drop and accessible/menu action paths reject the prepared/empty state instead of dereferencing cleared node/drag data. New callbacks resolve target node IDs through the actual target model adapter. The ordinary non-migration behavior and original rendering/layout are preserved. Source title/node pointers are removed before target identity is exposed through this UI.

The saved-group parent View is not replaced, so outside View observers/element identity remain. Its normal real OnInitialized path builds target groups from the target sync service; no cached preview group screenshot or synthetic list is copied. Existing menus and child-owned menu runners are destroyed through their actual stock lifetime mechanisms. The unused bubble/widget-observation fields in current155 have no creation path in the inspected implementation; no guessed OS/window close operation was added for them.

## Root-owned GN delta

Add `"//chrome/browser/ui:ui_controller_factory"` to `chrome/browser/ui/views/bookmarks/BUILD.gn` target `source_set("impl")` deps. Its current factory implementation depends on desktop controller/adapters, whose bookmark dependency is the public headers target, so this does not add a dependency back to bookmark implementation.

The public bookmark and saved-group headers now include chrome/browser/buildflags.h. Ensure their public dependency paths expose `"//chrome/browser:buildflags"`; an explicit public_deps entry on each corresponding `bookmarks` / `saved_tab_groups` headers target is the minimal standalone declaration if the composing graph does not already export it. Root owns shared registration/GN, so this proposal does not modify those files.

## Source evidence and verification

Current View/service/controller/factory/menu sources and GN edges are SHA-pinned in source-evidence.json. In particular: UIControllerFactory has no cached Profile; Desktop injector captures profile-bound prefs/model; controller Bind installs actual pref callbacks; controller's weak factory cancels pending clipboard checks on destruction; BookmarkMenuController::OnMenuClosed self-deletes and its destructor removes the model observer; SavedTabGroupBar constructor/AddObserver uses real OnInitialized; its child menu runners own actual UI lifetimes.

This is a155 platform adaptation required by the recovered same-window profile identity migration. Identical original View rebind functions are not claimed. Original complete switch effects and view/metadata preservation are documented by parent owner recovery; target preview geometry is not used as bookmark state.

All four outputs independently replay from pinned inputs in a disposable temporary tree and match manifest SHA256. GN/C++ compilation, actual same-window UI observation and complete profile-switch behavior remain pending. No real profiles, history, bookmarks, clipboard, credentials, Keychain, OS grants or network were accessed.
