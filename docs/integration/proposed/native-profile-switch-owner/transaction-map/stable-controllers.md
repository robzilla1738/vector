# Stable theme and bookmark profile-source hooks

`stable-controllers.patch` changes only four appliedv32 sources: browser_window_theme_observer.{h,cc} and bookmarks/bookmark_bar_controller.{h,cc}. Every input/output hash is pinned in stable-controllers-manifest.json. This is a155 integration adaptation of the recovered same-window transaction; the method names are new internal seams, not claims that identical methods existed in the supplied binary.

## Existing theme listeners survive

BrowserWindowThemeObserver constructor observes the actual profile ThemeService. BrowserView::Init subscribes once through RegisterThemeChangedCallback, retaining the callback-list subscription. Recreating the observer would lose that real view listener. `RebindForAuxProfileSwitch(browser)` checks exact scoped-userdata ownership and regular normal Browser type, resets the old service observation, observes the actual new profile's ThemeService, then emits the existing kBrowserTheme notification through OnThemeChanged. The callback list and BrowserView subscription are preserved.

Invoke after the Browser/model/other profile consumers are coherent, outside the no-callback identity commit closure. Notification legitimately calls the real BrowserView theme handler; it is not a fake theme result or suppressed no-op.

## Existing bookmark delegate and model survive

BookmarkBarController holds the same Browser/model and a BrowserView/WebUI delegate installed by BrowserWindowFeatures::InitPostBrowserViewConstruction. Its registrar watches profile-owned show-bar/show-groups prefs and conditional NTP visibility state. `RebindForAuxProfileSwitch()` checks regular normal Browser and exact model/profile agreement, resets the old pref registrar, registers target prefs and recomputes real bookmark state using the existing delegate. Tab-model observation, active WebContents observation, delegate, force-show flags and controller identity remain.

Constructor factoring preserves its current effect order. The constructor still performs the startup visibility migration and feature-gated testing-pref clears exactly once. Rebind intentionally does not re-run those startup resets on every workspace flip. The conditional visibility-state observer and its existing show-bar synchronization still bind to the target. Existing tab-selection callbacks continue to switch the WebContentsObserver to actual target contents.

## Concrete remaining displayed-bookmark gap

Controller rebinding is not sufficient to switch all bookmark UI. BookmarkBarView::Init caches profile-owned BookmarkMergedSurfaceService and ManagedBookmarkService; it adds itself as an observer of the former and constructs the profile-sensitive SavedTabGroupBar. Its destructor removes that service observation. Calling Init again would duplicate child views and is not a valid rebind. The existing BookmarkBarUIController is a polymorphic action controller, not a generic profile-reset service.

The eventual transaction must audit and rebind or safely reconstruct that real view/service subtree, menus/drop callbacks and saved-group child using current target services, while preserving the BrowserView/controller delegate. That work is explicitly not hidden behind these controller hooks. No call site is installed here, and this patch does not declare full profile-switch or displayed-bookmark parity.

## Evidence and verification

The patched current source plus BrowserView theme subscription, BrowserWindowFeatures delegate assignment, BookmarkBarView Init/destructor and its UI-controller interface are SHA-pinned in source-evidence.json. Both theme ScopedObservation::Reset and pref registrar Reset preserve their independent subscriber/delegate objects. No comparison relies on guessed raw offsets.

Four-source independent temporary replay matches every output SHA. No shared native writes/build, target execution, profile preference/owner state reads, OS grants or network operations. Native compilation, real callback/UI acceptance and complete transaction integration remain pending.
