# Interactive OAuth writer lifetime successor

Inactive source proposal on the exact standard daemon a2 ordinary/dormant pair. This adds 13 count-checked anchors after the immutable 153-anchor chain; it does not modify that chain, current stages, package, shim or native inputs. No UI, wording, provider callbacks, credential formats or endpoints change.

`source/transform.mjs` exports `transformAuxInteractiveOAuth(text) -> {text, changes}`. `overlay.json` pins the module, anchors, helper and independent input/output hashes. Apply to each leaf separately, append the exact stage `interactive-oauth`, and rerun the original independent dormant-entry projector with unchanged loader equality. Root owns projection and native/package integration.

## Actual ownership changes

- The supplied `OAuthFlowManager.authorize`, `callback` and `focusWindow` enter the existing broker owner. The authentication-URL response still returns promptly; a separate registry retains each full `credentials.login` operation even if cancellation/expiry deletes its private flow-map entry.
- Each created flow registers its real controller and prompt before asynchronous provider work. Shutdown closes admission synchronously, aborts controllers, rejects pending prompts, invokes the existing Codex cancel path where applicable and awaits every retained operation. The current shutdown coordinator already awaits the extended `auxStopRefreshProducers` result before broker shutdown. No timeout or resolved authorization URL is used as drain evidence.
- Reviewed login implementations resolve the original nested `lazyOAuth` proxy/copy chain using a private map populated by that exact factory, then check the actual bundled provider object and exact original login function: Anthropic, Copilot, xAI and Kimi. Their whole credential-login promise runs under the existing private `auxCreateRefreshIo` scope; its original DNS/connector/socket/reader closure remains authoritative. The existing credential write is inside that promise. Kimi's two actual device-flow `fetch` calls now use `auxRefreshFetch`; Copilot/xAI already use it through their current request helpers.
- Anthropic's original `startCallbackServer$1` retains the actual Node HTTP server, asynchronous listen outcome, accepted sockets and response completion. A late listen after cancellation cannot escape. Server-close callback and socket-close events are independently awaited. Normal completion permits the original HTML response to finish; abort requests destruction but still waits for real close.
- Anthropic's original login now aborts its manual prompt with the outer signal, awaits prompt settlement and callback-server cleanup in `finally`, and awaits token exchange before cleanup. PKCE, state validation, manual-code behavior and original page HTML remain intact.

## Explicitly unresolved implementations

These remain available and their manager promises/controllers are retained, but `noteUntracked()` is deliberately set on entry because their physical resources have not been closed by this proposal:

| Actual path | Remaining implementation |
| --- | --- |
| Meta `loginMeta` / manager `openOAuthWindow` | Direct device-request/poll fetches plus CDP sign-in window physical close acknowledgement. |
| Claude-code inline OAuth login / `waitForCallbackCode` | Multiple IPv4/IPv6 HTTP listeners, error/abort close paths and token-exchange signal propagation. |
| Actual ChatGPT manager branch | Persistent callback broker plus separately packaged `aux-chatgpt.cjs` client fetch/lockf subprocess transport; it bypasses bundled Codex login. Existing cancel is invoked, not treated as a drain. |
| Replaced or unrecognized provider objects/functions | No inferred transport ownership; preserve native unknown. |

Failures in server/transport/credential cleanup still retain existing unknown behavior. An unresolved close callback retains the lifetime indefinitely; no forced exit or elapsed time creates cleanliness. Native descendant observer/broker pairing, cold refusal, profile authority and downstream runtime compatibility remain unchanged. This is not all-provider shutdown completion or runtime acceptance.

## Evidence

`check.mjs` uses inert EventEmitter server/socket stand-ins only, with manually delivered lifecycle callbacks. It checks cancellation during a delayed listen, independent server/socket close, response flush and abort, a flow deleted from its map while transport cleanup remains pending, admission refusal after stop, actual nested/copied lazy-factory identity and replacement refusal, and an unknown provider whose work/cancel promises must settle. No real listener, network request, credential or product is executed.

Both exact a2 leaves independently replay all 13 anchors and pass `node --check`. `evidence.json` records those source results. Early fixture-only harness corrections added a microtask turn before invoking its fake close callback and the injected stop callback binding; these did not indicate product execution. Live provider and browser shutdown behavior remains unverified.

A final actual-call-site review found the first proposal compared credential proxies directly to raw provider objects, conservatively leaving all those flows unknown. The successor adds one exact factory anchor and validates its real nested/copy semantics in the inert fixture; it does not trust the provider ID as proof.
