# Native platform slice 0086

Build-facing sources: native/platform P1/P2/P4/P5 and daemon/core. Fresh build context read approved specs and upstream Chromium APIs; no reference applications, bundles, provenance ledgers or assets were inspected. Patch 0086 contains new Aux-authored helpers and narrowly reconstructed integration hunks only, preserving the existing checkout's unrelated work.

## Implemented behavior

The independent ENABLE_AUX_BROWSER flag gates startup/shutdown and component bootstrap; ENABLE_AUX_SHELL stays disabled. Before profiles can create normal browsing tabs, BrowserPlatform validates both bundled manifests, starts the bundled daemon, verifies health service/version/child PID, signs an installation challenge and caches the resulting authorization in memory. It loads the public key on a blocking worker before DevTools activation. Component registration checks freshly generated agent/vault IDs from manifest keys, confirms the newtab override resolves within its bundle, and occurs before ExtensionService::Init/LoadAll.

Bundle root is Contents/Resources/aux. Production selects apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon. Explicit development switch aux-development-runtime permits runtime/node plus apps/daemon/dist/index.js fallback. No executable is discovered through PATH. Extensions live in apps/extension/dist and apps/vault/dist. AUX_HOME and AUX_PORT reach the owned daemon. The expected daemon version is 0.2.0, independent of Chromium's version.

Startup health polls every 250 ms with a nominal 20-second deadline and bounded two-second network requests. Established health monitors every second; an observed child exit schedules restart after 500 ms. Cached authorization refreshes five minutes before expiry. Failure stays explicit. Shutdown requests authenticated /shutdown, waits three seconds, then permits termination only after fresh bundle-path, parent-process and creation-time checks; post-termination wait is bounded to two seconds. An unrelated listener/health PID is never adopted or signalled. Private key files must be regular, owned by the current user and inaccessible to other users; final-component symlinks are refused. PKCS8/SPKI PEM and P-256/SHA-256 DER signatures match daemon contracts.

A native DevTools request filter runs before all HTTP and WebSocket routing. It requires loopback peer and exact loopback Host (including configured port), independently allowlists origins, issues 30-second one-use challenges, verifies installation signatures, and issues in-memory browser-scoped 24-hour AuxSessionToken credentials. Discovery, target operations, frontend resources and upgrades require authorization. Challenge/session stores are bounded; errors omit sensitive values. There is no production JavaScript CDP proxy. The independent browser branch listens on port 45203 by default, preserving explicit stored disable and managed disallow. Command-line switches cannot select an unfiltered listener.

## Verification evidence

All native builds used scripts/native-build.py and /tmp/aux-build.lock. Intermediate build directory out/AuxAside is component-enabled and is not final packaging acceptance. The actual independent browser flag was enabled while retired shell was disabled for the call-site checks.

- Compiled installation_auth, daemon_supervisor, component_bootstrap, browser_platform and native CDP authority helpers.
- Compiled content DevTools handler/agent-host implementation, Chrome remote-debugging server, extension-system registration and ChromeBrowserMain startup/shutdown call sites.
- Built auth_probe and ran chromium/tests/aux-native-auth-smoke.mjs against it with a newly created temporary home. Verified Node-to-C++ signatures, C++-to-Node DER signatures, unsafe private-key permissions refusal, CDP one-use challenge replay rejection, HTTP and WebSocket token enforcement, and foreign Host/Origin rejection. All passed; temporary files were removed.
- Consolidated patch reverse-checks cleanly against a scratch copy of the current shared source state. No shared checkout reset/deletion occurred.

## Acceptance still outstanding

No browser was launched by this slice and no real owner profile was accessed. Packaged disposable-profile startup/newtab and shutdown/restart observations, full linking/non-component packaging, profile binding/deletion and password bootstrap gates, native API implementations, Browser.ensureProfile/Aux.waitForDownload, native viewport domain, extension reload/prerender lifecycle and both-theme screenshots remain required. The auth probe checks the authority/helper path; actual listening socket behavior awaits packaged browser verification. This slice does not establish full native or visual parity.
