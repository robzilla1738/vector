# Notification click after its window closes or changes profile

The original `ic` helper always passes a stored notification windowId to
chrome.tabs.query/create. Chromium611's TabsQueryFunction::MatchesWindow rejects
other profiles; TabsCreateFunction returns an error when its exact requested
window controller cannot be found, before its later fallback logic. A notification
created before the window closes or changes profile therefore loses its target.
The original onClicked handler already clears that notification and only logs the
failure; opening it in the other profile is not an appropriate repair.

One count-checked supplied function replacement adds an admission check only for
concrete nonnegative integer hints. chrome.windows.getAll is evaluated in the
original extension browser context; WindowsGetAllFunction uses
windows_util::CanOperateOnWindow, which checks that context against each controller
profile (plus separately permitted incognito). If the exact saved ID is absent,
create a new normal window with the original route through chrome.windows.create.
WindowsCreateFunction derives its calling/window profile from browser_context();
no account, profile path, active window or foreign profile is substituted.

Valid hints, no hint, route construction, original tab reuse, tab creation and
focus behavior are unchanged. The successor in ../provided-notification-close-race/ adds one bounded recovery
when a later operation fails and fresh caller-profile enumeration proves the
exact target disappeared. Surviving-target errors remain errors.

## Why a saved real-window ID cannot become a cache ID

Browser constructs `session_id_(SessionID::NewUnique())` and declares that field
const. BrowserExtensionWindowController stores that browser GetSessionID and uses
it for extension windowId. Aux cache creation constructs a separate Browser via
CreateBrowserWindow; profile switching moves tabs and recreates the real window's
extension controller but never moves/reassigns its const session ID. Thus a saved
real-window ID cannot turn into the separately created hidden cache's ID. After
profile transfer it refers to the original real window in the new profile and is
excluded by the old extension profile's CanOperateOnWindow check.

The proposal intentionally does not choose another enumerated same-profile
window. Existing BrowserExtensionWindowController::IsVisibleToTabsAPIForExtension
has no explicit Aux cache exclusion. A substitute-window fallback could therefore
select a hidden workspace. The new-window path avoids that unresolved broader
native visibility issue. Original no-hint behavior is deliberately untouched.

## Checks and integration

`patch.json` pins exact frozen1852 background.js input/output and one function
anchor. `check.mjs` executes the actual replacement with Chrome API boundary
fixtures: stale/foreign hint opens a new caller-profile window; valid hint follows
the original tab-create path; no hint retains original tab reuse; no remaining
window opens a new window; a substitute hidden/cache window is never selected.
Full transformed JavaScript syntax passed. No native/shared checkout edits,
app launch, notifications, browser calls or profile operations occurred.

Root should apply this disjoint function transform after its Lasso transform,
include the resulting background.js in the exact leaf review, and verify a real
late notification click using disposable profile/window state. No native rebuild
is needed for this supplied resource patch.
