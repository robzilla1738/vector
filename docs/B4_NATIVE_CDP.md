# Native CDP broker

Aux's Chromium runtime connects to the browser through the authenticated
`aux-host-v1` Profile socket. The runtime exposes a separate, single-client
WebSocket on a `0600` Unix socket in the same `0700` Profile directory so its
Playwright driver can use CDP. The WebSocket path contains an independent
256-bit capability. No TCP debugging listener or `DevToolsActivePort` is used.

The runtime implements `Browser.getVersion` and `Browser.setDownloadBehavior`
locally. Its `Target` facade supports target discovery, information, automatic
and explicit attachment, browser sessions, detachment, and activation. Target
IDs come from `native.listPages`, which enumerates normal tabs of the owning
Profile. `Target.createTarget` is deliberately unavailable: `native.tabCommand`
is the acknowledged tab creation path. Browser download settings remain owned
by Chromium's Profile download controller.

Page CDP commands cross the authenticated host socket as
`native.cdpDispatch({pageId, message})`. Chromium resolves `pageId` through the
Profile's tab catalog, checks the current WebContents and DevTools target,
requires an ordinary web URL, and attaches an untrusted DevTools client.
Only page domains are allowed. Browser, Storage, broad Target, and cookie
commands are denied. `Target.setAutoAttach` is restricted to flat iframe
targets; child sessions are admitted only when their DevTools target belongs
to the same WebContents and Profile. Replies and events return as
`native.cdpMessage` notes. Connection generations prevent an old runtime's
CDP response from reaching a new one.

The Aux build defaults `RemoteDebuggingAllowed` to false in local state. The
release build flag separately disables remote debugging server startup.

Focused validation: `cdp_broker_unittests` checks native method filtering;
`tests/unit/native-cdp-broker.test.ts` checks Playwright's Unix WebSocket
connection, Profile catalog filtering, foreign target denial, page dispatch,
and iframe child routing. The Chromium target requires a native build before
its test can execute.
