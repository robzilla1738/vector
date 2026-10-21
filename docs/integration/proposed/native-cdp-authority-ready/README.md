# Resume authenticated CDP startup after installation authority loads

Pinned against actual composition563 sources. Root reported a real Muse response followed by openTab ECONNREFUSED on127.0.0.1:45203. This source-only proposal fixes a concrete startup race; no paid request, profile/credential read, listener launch or shared native change was performed.

## Cause

ChromeBrowserMain starts BrowserPlatform before CreateDevToolsProtocolHandler, but Start merely starts the asynchronous daemon supervisor. BrowserPlatform::DidChangeDaemonState waits for actual kReady, then asynchronously loads the installation public key. RemoteDebuggingServer::GetInstance automatically creates the Aux listener owner without requiring remote-debugging command-line flags. Its first ReconcileAuxServer can therefore call CreateBrowserCdpFilter before public_key_ exists. It records kFailed and binds nothing. The successful key-load callback previously only assigned public_key_; no observer notified the listener. Subsequent reconciliation only starts from kOff. This explains a normal visible/account-backed app with no CDP socket even after daemon authentication succeeds.

## Change

BrowserPlatform exposes a UI-sequence authority-ready callback list and notifies only after a nonempty actual key is assigned. The listener subscribes before its first reconciliation. If startup failed while waiting, the readiness event resets its phase to off and runs the existing reconciliation. Already-ready startup still works through the initial direct check. RAII subscription and weak receiver protect destruction. No timers, fallback key, fake auth, or unfiltered listener are introduced.

Port45203, request filter, authorization protocol, websocket restrictions and stored user/managed preference gates are unchanged. The ordinary stock debugging path remains excluded by ENABLE_AUX_BROWSER. A policy/user-disabled listener stays disabled after the notification. A genuinely missing/invalid installation public key still fails closed; no successful readiness notification is emitted.

## Focused validation

`git apply --check` passes on the actual native preimages. Header/API signatures were checked against existing CallbackListSubscription/RepeatingClosureList use in BrowserPlatform. Root must compile the affected native objects and run the normal isolated app. Before any new paid AI call, verify45203 binds after actual daemon readiness, `/json/version` follows the expected original discovery behavior, an unauthenticated websocket cannot control the browser, and the original authenticated CLI/tool can perform a harmless disposable-tab command. Discovery HTTP availability alone is not authorization acceptance. Confirm explicit disabled preference still prevents binding if exercising that case in disposable state.

No CLI port change or --remote-debugging-port workaround is needed. This fixes source-level readiness ordering; actual current profile preference state and bind conflicts were not inspected by this lane.
