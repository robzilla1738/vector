# Store extensions in the Aux Chromium shell

Patch 0025 connects the authenticated `chrome://aux/` shell to Chromium's
Profile-scoped extension services. The renderer never installs a CRX or reads an
extension directory itself. Install uses Chromium's Web Store metadata,
download, validation, and permission prompt. Update uses the Chromium extension
updater with a foreground, immediate check. Reload, enable/disable, and removal
use `ExtensionRegistrar`; the registry supplies the returned state.

## Shell calls

| Method | Arguments | Result |
| --- | --- | --- |
| `extensions` | `[]` | Installed non-app, non-component extension rows. |
| `installStoreExtension` | `[storeId]` | Installed row after the native prompt and install callback. |
| `checkStoreExtensionUpdate` | `[storeId]` | Current row when the targeted update check finishes. |
| `setExtensionEnabled` | `[storeId, enabled]` | Verified current row. |
| `reloadExtension` | `[storeId]` | Current row after Chromium accepts the reload. |
| `removeExtension` | `[storeId]` | `true` after uninstall is triggered. |
| `showExtensionAction` | `[storeId]` | `true` after dispatch to the browser's toolbar action model. |

Mutations require a regular Profile owned by the calling browser window. IDs
must be 32 lowercase letters from `a` through `p`; existing mutations further
require a Store-owned extension in that Profile. The `chrome://aux/` frame
binding validates the sender before dispatch. The shell exposes this feature
only when patch 0025 is present. The action menu uses the existing liquid glass
toolbar controls and asks Chromium to open the extension-owned popup. The
browser's `chrome.action.openPopup()` path uses the same active-window popup
model and refuses a second active popup.

On macOS, native messaging manifest lookup first checks Aux's normal user and
system directories, then Chrome's user and system
`NativeMessagingHosts` directories. Chromium still parses the manifest and
checks its declared extension origins and executable. This permits a host
installed for Chrome to be found without copying or rewriting its manifest.

## Qualification

The source-level Store ID test is in the Chromium browser test target. The
renderer tests check official Store URL parsing and authenticated method
routing. The existing synthetic extension API matrix covers `tabs`, downloads,
context menus, cookies, declarativeNetRequest, DevTools, and native messaging.
The final ad-hoc-signed candidate must run the interactive Store lifecycle and
1Password checks in [extension-compatibility-probes.md](extension-compatibility-probes.md)
and [native-messaging-readiness.md](native-messaging-readiness.md). Those checks
need the compiled candidate and an installed 1Password test setup; source and
fixture tests alone cannot claim that result.
