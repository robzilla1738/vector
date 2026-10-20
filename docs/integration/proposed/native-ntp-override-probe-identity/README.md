# NTP startup and override-probe audit

Single identity correction against actual261; no startup, readiness or navigation behavior change. The existing supplied-Agent exemption in `GetNtpOverriddenParams` still compares the original ID. Replace that literal with the actual staged Aux Agent ID, matching native component registration and supplied new-tab resource identity. No GN change.

## What the warning establishes

The parent's owned disposable257 log contains the regular-profile `NewTabUIConfig` warning at23:08:13.604876, followed by actual supplied new-tab JS execution at23:08:14.239237. This does not establish a failed committed navigation.

A concrete existing source path explains how the warning can occur after successful extension rewriting:

1. `MaybeShowExtensionControlledNewTabPage` first requires a visible extension-scheme entry and verifies that actual `RewriteURLIfNecessary(chrome://newtab)` equals that entry's URL.
2. It calls `GetNtpOverriddenParams`. The intentional own-Agent exemption compares stale `fjdhphbdlfjogobdofoaagnlnkoibdge`, so it misses actual Aux Agent `gokkffaiccpmoeodpmeamcjajcagjmkm`.
3. `GetPossibleRewrites` probes every handler with its own fresh copy of raw `chrome://newtab`. Unlike actual navigation rewrite, it does not stop after the extension handler succeeds.
4. The later WebUI handler calls `WebUIConfigMap::GetConfig`, which invokes `NewTabUIConfig::IsWebUIEnabled`. That emits the regular-profile warning and returns false. This is a capability probe, not itself a navigation commit.

The patch restores the intended own-Agent exemption, avoiding both that probe and the unrelated extension-control warning/dialog path for the bundled Agent. Other extensions retain their genuine override-warning behavior. Without a runtime stack we cannot uniquely attribute the observed warning to this path; no diagnostic suppression or startup delay is proposed.

## First-tab readiness and prerender order

Current source registers supplied Agent/Vault through `ChromeExtensionSystem` before default components. Extension activation synchronously fires `OnExtensionLoaded`, which registers the actual manifest override, before `AddReady`/`TriggerOnReady`. Initial regular startup `Launch` waits both real ready-extension entries before determining launch URLs. Original source-derived readiness keeps its10second/250ms health-or-timeout condition and never invents successful authentication.

Actual URL handler order places the extension override ahead of search/WebUI. Normal rewriting stops at the first successful handler. The actual NTP prerender service resolves an enabled Agent's override and requires exact host/manifest agreement before starting a prerender at that extension URL. Original042b14c0 and the pinned preloader recovery preserve that guard order; neither path intentionally starts an ordinary raw-newtab navigation.

No concrete first-tab readiness race is established by this audit. The obsolete identity is a demonstrated defect; authentication and session initialization failures are independent runtime boundaries. Additional delays, synthetic ready flags, changed private-mode guards or an independent replacement NTP would be unsupported.

## Verification

`python3 verify.py` checks source pins/anchors and independently replays the one-literal patch, confirming the result differs only by that identity. No native builds/writes, target execution, browser/daemon calls, network or owner-state access. Parent compilation and real disposable observation remain pending.
