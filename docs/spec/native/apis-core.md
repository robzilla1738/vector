# Native account, preferences, notification and popup APIs

Status: ready for listed signatures and behavior; open JSON response shapes and exact defaults marked draft below. Sources N1–N4 in `../provenance.md`. Signatures are observed in declarative API descriptions; semantics are supported by the native feature map and caller intent. No runtime behavior is claimed.

## A0. Shared API boundary

Expose `chrome.auxAccount`, `chrome.auxBrowserPreferences`, `chrome.auxBrowserImport`, `chrome.auxNotification`, `chrome.auxMiniPopup`, `chrome.auxOmnibox`, `chrome.auxAdblock`. Private permissions use `dev.aux.ext.private.*`, with grants limited to new Aux extension IDs. Calls return promises while retaining Chromium callback compatibility. A method with no result resolves without a value. Validation errors and native failures reject through the standard extension error channel; rewritten Aux messages must not leak credentials or source product identifiers.

Methods operate in the calling extension's BrowserContext/profile. Incognito, closed windows and deleted profiles cannot silently fall back to the owner's default profile. JSON objects below are data, never executable JavaScript. Permission names and API schema declarations are new Aux-owned artifacts.

## A1. Account: four methods

| Method | Inputs | Result and effect |
| --- | --- | --- |
| `openProfileRoute` | options with string `profilePath`, `profileId`, `sourceUrl`, `url` | boolean indicating whether the requested route opened in the selected profile; validate profile binding and navigation target |
| `getProfileContext` | none | current local account/profile context object; resolve from the browser's actual profile |
| `getProfiles` | none | array of `{profileIndex: integer, name: string, isCurrent: boolean, isLocked: boolean}` |
| `signDaemonAuthChallenge` | challenge string | signature result object from installation authority; never expose the private key |

`getProfileContext` and signing result properties are not constrained by the source IDL. Coordinate them with the daemon auth contract before marking wire compatibility ready. Opening a locked profile must use its unlock/setup flow. Invalid paths, malformed challenges and absent installation credentials fail explicitly. No account events are declared.

## A2. Browser preferences: 33 methods

Getter/setter pairs persist through Chromium preferences and update already-open relevant windows. Setters resolve after the value is accepted, not after a new app launch. Use profile preferences for browsing choices and local state only for app-wide choices. Exact preference persistence keys are Aux-owned.

| Getter | Setter and input | Result/behavior |
| --- | --- | --- |
| `getWindowBackgroundVibrancyEnabled` → boolean | `setWindowBackgroundVibrancyEnabled(isEnabled: boolean)` | native window material enabled state |
| `getBrowserColorScheme` → string | `setBrowserColorScheme(colorScheme: string)` | light/dark/system appearance selection |
| `getTabStyle` → string | `setTabStyle(tabStyle: string)` | native tab presentation mode |
| `getVerticalTabInsertionPosition` → `top` or `bottom` | `setVerticalTabInsertionPosition(position)` | insertion edge for newly opened vertical tabs |
| `getHorizontalTabShrinkEnabled` → boolean | `setHorizontalTabShrinkEnabled(isEnabled)` | shrink-to-fit behavior of horizontal tabs |
| `getTabSwitcherSortByRecentlyUsed` → boolean | `setTabSwitcherSortByRecentlyUsed(sortByRecentlyUsed)` | MRU order when true, strip order otherwise |
| `getDefaultZoom` → number | `setDefaultZoom(zoom: number)` | default website zoom through native HostZoomMap |
| `getKeepTasksRunningState` → object | `setKeepTasksRunningEnabled(enabled)` | background task keep-alive preference and effective state |
| `getAutoPipEnabled` → boolean | `setAutoPipEnabled(isEnabled)` | automatic picture-in-picture preference |
| `getVerticalTabsBookmarksSectionEnabled` → boolean | `setVerticalTabsBookmarksSectionEnabled(isEnabled)` | show/hide native bookmark section |

The remaining 13 methods:

| Method | Inputs | Result/effect |
| --- | --- | --- |
| `getDefaultBrowserState` | none | object describing system default browser status |
| `setAsDefaultBrowser` | none | object describing request outcome; invoke the OS default-browser flow |
| `getDockState` | none | object describing Dock presence |
| `addToDock` | none | object describing Dock action outcome |
| `getBrowserVersion` | none | version string from running browser build |
| `getSyncStatus` | none | object declaring local mode; cloud synchronization unavailable |
| `checkForUpdates` | none | local installed version status; do not contact a reference update service |
| `getLanguageSettings` | none | object describing language preferences and spelling state |
| `getSupportedLanguages` | none | object containing supported native language choices |
| `setPreferredLanguages` | `languageCodes: string[]` | persist validated language order |
| `setSpellCheckEnabled` | `enabled: boolean` | update spelling preference |
| `getSearchEngines` | none | object of engines/current default from native template URL service |
| `setDefaultSearchEngine` | `engineId: string` | select an existing engine; invalid IDs fail |

Draft details: tab-style enum, numeric zoom representation/range, object property schemas and factory defaults are not guaranteed by the declarative signatures. Aux can define typed contracts for these as its own design decision, but must record the decision and validate actual settings UI calls. No events are declared; UI refreshes after mutations or uses its own state query.

## A3. Notification: two methods

`requestPermission(tabId: integer)` triggers the browser's native notification permission request for the tab's current origin and resolves a boolean granted result. Reject absent tabs; use the current committed origin rather than caller-supplied text. Honor upstream restrictions on opaque/internal origins, user activation, existing blocks and policy. `revokePermission(origin: string)` removes/revokes the setting for a validated origin and resolves a boolean outcome. Permission grants are origin/profile-specific. No events are declared.

## A4. Mini popup: ten methods

| Method | Inputs | Result/effect |
| --- | --- | --- |
| `hide` | none | close/hide the popup and related options window safely |
| `getEnabled` | none | boolean popup preference |
| `setEnabled` | enabled boolean | update preference and shortcut registration |
| `getShortcut` | none | current shortcut string |
| `setShortcut` | shortcut string | validate accelerator, unregister old binding, register new binding or reject conflict |
| `setState` | one of `compact`, `compact-with-attachments`, `expanded` | change native popup presentation |
| `setSize` | integer width and height | resize popup content/native host |
| `setOptionWindowSize` | integer width and height | resize options window rather than main host |
| `pickDirectory` | none | selected filesystem path string; cancellation representation is draft |
| `switchProfile` | integer profileIndex | rebind popup to selected profile, respecting local password gate |

Native popup owns an extension WebContents, supports a global shortcut, opens a system directory picker and coordinates focus/closing with its options window. Enforce positive bounded dimensions and screen-work-area placement. The calling component cannot target an arbitrary owner's profile by path. No popup events are declared. OS shortcut denial must leave the stored preference and effective registration state understandable to the UI; exact error shape is Aux-defined.
