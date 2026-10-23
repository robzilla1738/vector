# Native parent cold-launch caller (inactive source)

The actual checkout's startup calls `BrowserPlatform::Start` at `chrome_browser_main.cc:1919`, before `PreProfileInit` at 1928. It never calls `OwnedNativePeerChild::PrepareBeforeSpawn`, `LaunchOnce`, `ServicePeerOnce`, `TakeSelectedHome`, or `InstallNativeSelectedStateHome`. The adoption successor therefore had no executable producer at that call site.

This proposal supplies that producer. Its no-argument native entry validates the real current browser and its fixed nested `Contents/Resources/aux/apps/daemon/Aux Daemon.app` using actual Security code objects, strict resource/nested-code validation, the existing team/certificate pins, exact identifiers and main-executable layout. It derives the child CDHash from the real validated image. The paired read-only Swift reader additionally authenticates the existing sealed child policy and requires v2 `embedded-daemon`; missing, malformed, differently scoped or unsealed policy refuses. No caller path, scope, approval Boolean, environment variable or JSON response selects an installation.

The real owned-child primitive launches once, pumps its actual authenticated peer, takes only the private provider-ready selected-home transfer, and installs the retained native holder. A failed/ambiguous attempt never starts a second child or falls back to compatibility startup; the existing owner retains unresolved live-child cleanup. This remains a fresh/resumed-fresh producer. It does not regenerate an existing legacy installation or implement legacy migration custody.

## Default-off startup patch

`chrome-main-hook.patch` is against the exact frozen checkout source. Its only product selection is compile-time `AUX_SEALED_NATIVE_COLD_ENTRY`, default absent. The define grants no authority: all real signature/policy/live-peer/provider checks still run. State1/ordinary accepted builds retain their existing code path. No runtime switch or environment flag enables this route, and no JS state2 refusal is changed.

Root may prepare an exact reviewed successor target with the define only after the complete source graph and actual protected-startup authorization are resolved. No GN target, shared source, accepted app, manifest or package was changed here. `AuxNativeParentColdLaunch.h/.cc` belong in the browser native target; use the successor `AuxAuthenticatedChildParentPolicyReader.swift` instead of the 43b696d2b reader in the two-file read-only parent Swift target. Its policy companion is byte-identical to 43b696d2b. The child must not link that parent-only reader.

## Environment and lifetime

The launch clears inherited environment. It forwards only ordinary runtime `PATH`, `TMPDIR`, `TZ`, `LANG`, `LC_CTYPE`, `LC_MESSAGES`; no API-key/session/token, DYLD, NODE or inherited Aux authority flags are forwarded. Source-derived configuration sets `AUX_PORT=21520`, loopback host/base URL, fixed browser CDP host, actual current browser PID, and fixed computer-use helper/source-app paths from the authenticated outer bundle. No inherited port overrides this route. The child alone sets `AUX_HOME` and `AUX_AGENT_RUNTIME_DIR` after genuine provider-ready FD selection. Prepending that selected runtime's bin directory to PATH remains a paired child-main change; the parent never invents a selected-home string.

The parent call is before profile/extension construction at this specific hook, but browser-process pre-main-loop setup, local state and metrics ran earlier. It is not proof of whole-profile exclusion, all-process writer custody or legacy readmission. An external close may race after a validation; the retained owner/current-peer checks and later startup/session/runtime fences remain necessary. No assertion here turns a filesystem lock or signature into custody for unrelated writers.

## Evidence

The exact source hashes, startup locations and default-off patch are pinned in `inputs.json`. `verify.py` checks those source relationships without invoking a compiler, Security, Mach, Keychain, generation or the app. The new C++ and Swift declarations have **not compiled**. Existing queued transport/adoption/42-input graph sources and configurations are untouched; their results cannot prove this new caller. No additional compile was queued.
