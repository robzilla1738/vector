# Supplied extension commands are not a native CDP domain

The exact pinned daemon has 24 literal `Aside.<firstSegment>` prefixes. The Agent background implements 29 full command cases (the seven Apple Passwords cases share one prefix; pickDirectory is daemon-local). These names are extension protocol names. Adding a second native CDP domain would bypass the implementation we are preserving.

The static, reproducible audit is `node vendor/provided/audit-extension-commands.mjs`. Its JSON records binary/SEA/background hashes, source offsets/lines, every full switch case and bounded implementation anchors. It never imports or executes supplied code.

The routing chain is explicit:

1. The daemon's `cdp.send()` tests `Cn.startsWith('Aside.')` **before** websocket connection and native CDP serialization. Matching commands call `sendCommandToExtension` with their actual account/profile/mode route and cancellation signal.
2. The bridge sends `{id,method:'runCommand',command,route:{accountId,profileId,browserMode,windowId?}}` over `/extension-bridge/extension`. Cancellation sends `{id,method:'cancelCommand'}`.
3. Agent background schema-validates the envelope, resolves current native profile context and compares accountId/profileId/browserMode. Stale socket/context-generation replies are discarded. A per-command AbortController reaches the actual handler.
4. The supplied switch executes real extension APIs and replies `{id,result,error?}`. Disconnect aborts outstanding operations.

The owner explicitly preserves the supplied `Aside.*` command protocol, auth/token/health wire strings and compatible lowercase keys. The daemon prefix test, schema literals, calls, Agent case labels and expected-error literals must therefore all remain Aside. Aux private native API namespaces and component identities are separate adaptations. No compatibility stub or duplicate native domain is needed. Earlier prose recommending renaming the command protocol is superseded by this explicit wire exception.

## Actual execution dependencies

| Commands | Supplied implementation and remaining native boundary |
|---|---|
| listTabs, ownsTarget | `tabs.query/get`, `debugger.getTargets`; matches actual debugger target IDs and current incognito context. `ownsTarget` means resolvable in this profile/mode, **not** permanent agent-created ownership. Preserve supplied semantics. |
| createAgentTab, ensureTabInAiTabsGroup, clearAiTabsGroup | Real `tabs.create/group/remove`, `tabGroups.query/update`; native tab/window selection and supplied Agent group logic. Existing session ownership lives in supplied daemon records; no replacement ledger is introduced. |
| resolveBindingWindow, controlTab, openProfileUrl | Real `windows.get/getAll/getLastFocused`, `tabs.get/create/update/remove`; route/window/incognito checks and original active-tab policy. Nonprivate openProfileUrl may be handled by daemon native profile-window opening. |
| searchHistory | Actual `history.search` with requested time/result bounds and source metadata mapping. No invented search index or owner history fixture. |
| getThirdPartyCookies, setThirdPartyCookies | Actual `privacy.websites.thirdPartyCookiesAllowed.get/set`; truthful isAvailable/levelOfControl. |
| waitForDownload | Actual `downloads.search` polling, complete/interrupted states, filename/referrer matching, abort/timeout; returns actual download path. |
| showNotification, playNotificationSound | Original offscreen notification.html + Web Notification/audio path for basic notices; actual `notifications.create` for richer notices. Requires real OS/browser permission; no grants or notice sent in this audit. |
| grantNotificationPermission, revokeNotificationPermission | `chrome.auxNotification.requestPermission(tabId)` / `revokePermission(origin)` after namespace rewrite. Current Aux native schema already matches these call shapes. Actual browser permission behavior needs runtime verification. |
| callExtensionMV3Api | Original method whitelist, own-property namespace/function resolution and real API invocation. Missing methods throw; no native proxy or arbitrary invocation expansion. |
| create/fill/resolve/clearPasswordManagerGeneratedPasswordRefs, performPasswordManagerAutofill | Actual `runtime.sendMessage(AuxVaultId,{command,...})`; resolved live debugger target→tabId. Supplied Vault peer handles the operation and checks success. Preserve peer IDs and Vault frame/document/security checks. |
| applePasswords.* | Original native messaging/PAKE actor and public Apple Passwords host. Existing owner OS grants/credentials remain unauthorized. The seven full cases are not a custom native CDP subtree. |
| pickDirectory | Handled by daemon before extension dispatch; preserve actual picker, cancellation and unavailable results. |

The remaining essential native dependencies are actual profile context/auth signing (original identity carrier), profile window APIs, Aux notification permission API and standard Chromium extension APIs. The capture/launch entitlement proposals and experimental attachTab proposal are separate genuine missing surfaces. No new ChromeDevToolsSession adapter is needed for the 24 prefixes.

Current Chromium `ChromeDevToolsSessionBase::HandleCommand` dispatches actual native protocol domains through `dispatcher_.Dispatch(dispatchable)`; `ChromeDevToolsSession` installs standard handlers according to target/client trust. The extension commands are diverted before this boundary. Absence of an Aux handler here is expected for the supplied routing chain, not evidence of a missing implementation.

Static verification establishes routing and call shapes only. Loaded reused Agent↔daemon registration, exact native identity, actual profile switching/cancellation, browser/API behavior and visual parity remain unverified. No supplied program executed, network request, owner profile/data access, notification or OS grant occurred.
