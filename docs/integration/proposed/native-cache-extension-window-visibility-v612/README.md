# Exclude positively identified Aux profile caches from extension windows

Native612 creates an ordinary BrowserExtensionWindowController for a hidden Aux
workspace cache and registers it with WindowControllerList. Its existing visibility
predicate excludes platform-app/devtools cases only. WindowsGetAllFunction walks
that controller list, using CanOperateOnWindow and the predicate. TabsQueryFunction
also consults the predicate. A same-profile query can consequently treat an internal
cache as an ordinary window/tab destination; extension tab reuse or focus can act
on a hidden workspace instead of a real user window.

Two count-one edits in one source file include BrowserInitState and return false
only when the actual existing state reports is_aux_profile_switch_cache(). That
accessor directly reads the cache-specific creation parameter, which Aux's cache
creator explicitly sets. It does not infer cache status from visibility, omitted
session restoration, active state, profile type, empty tabs or window geometry.

All standard visibility behavior remains byte-for-byte after this early check.
Normal hidden/minimized windows, restored popups/apps, and non-cache omitted
windows retain their original behavior. Missing init state follows the original
predicate. Internal native cache ownership, persistence and profile switching are
unchanged. This is extension-window/query exclusion, not an assertion that every
explicit tab-ID API has been audited or newly hardened.

Source paths establishing exposure and effect:

- chrome/browser/ui/views/frame/aux_profile_switch_workspaces.cc sets the cache
  creation flag on the separate internal Browser.
- chrome/browser/ui/browser_init_state.h exposes that exact discriminator.
- BrowserWindowFeatures creates the extension window controller; its constructor
  registers the controller with WindowControllerList.
- chrome/browser/extensions/api/tabs/tabs_api.cc WindowsGetAllFunction calls
  windows_util::CanOperateOnWindow; TabsQueryFunction::MatchesWindow calls
  IsVisibleToTabsAPIForExtension after original profile ownership checks.
- chrome/browser/extensions/api/tabs/windows_util.cc uses that predicate before
  accepting a controller in the caller's browser context.

The affected file is not yet in the Aux composition manifest. Its exact current
bytes matched git HEAD of the native checkout; files.json pins that upstream
commit/input hash plus the native612 manifest. Both anchors matched once; generated native.patch passed git apply --check. No shared native changes,
build, UI/browser/profile operations or broad tests. Include this one object in
the next combined build, then compare extension window/tab enumeration before
and after a disposable profile switch. Keep the existing internal cache alive;
its absence from the extension result is the intended acceptance.
