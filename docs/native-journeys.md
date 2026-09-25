# Native Aux.app journeys

`tests/host/native-app-journeys.mjs` runs the browser core and Aside layout journeys against an **official Aux.app**. It starts a fresh Profile in a short `/tmp` path, serves two loopback pages, and uses that Profile's owner-only runtime token. It never enables a public DevTools port or attaches to an existing Profile.

```sh
node tests/host/native-app-journeys.mjs --list
node tests/host/native-app-journeys.mjs --app /absolute/path/to/Aux.app
node tests/host/native-profile-journeys.mjs --app /absolute/path/to/Aux.app
```

The full run needs macOS Accessibility permission for the terminal running it and Screen Recording permission for `screencapture`. It verifies the launched app's bundle ID and packaged runtime helper, distinct page IDs, readable page content, native click delivery, human takeover, tab closure, and the absence of `DevToolsActivePort`. It sends Control-Tab in both tab layouts and checks the active page ID, sends Command-L and checks that a labeled address field receives accessibility focus, and dismisses the floating Aside with Escape. It captures the real Aux window in vertical expanded, collapsed, edge peek, and horizontal states. Accessibility button checks and pixel change assertions catch broken sidebar toggles and edge reveal; review the four captures for actual liquid-glass quality, clipping, text contrast, and page compositing. The manifest records the source SHA and each assertion. Captures and the manifest stay in ignored `release/test-artifacts/`.

For a machine without capture permissions, `--rpc-only` runs just the browser and runtime assertions. That mode does **not** qualify the Aside layout. `--output /absolute/new/directory` chooses a new evidence directory; existing evidence is never overwritten. The runner removes its disposable Profile on success or failure and never writes its bearer token to the report.

The Profile journey launches two disposable regular Profiles against the same local site, verifies separate HttpOnly cookies and denied cross-Profile page access, then restarts one Profile with `--restore-last-session` and checks that its active page ID and account survive. The native app journey also requires Find to count and advance visible matches and reset zoom. Both journeys are required release checks once the final Aux.app exists.

These suites are synthetic native gates. The owner test in [TAKEOVER.md](TAKEOVER.md) still covers signed accounts, extensions, passkeys, release update and visual review on the final build. The older `candidate-shell.mjs` and `native-capture-matrix.mjs` use a public candidate debugging port and apply only to the historical development proof.

The [Electron to native inventory](NATIVE_TEST_PORT_INVENTORY.md) lists every smoke file and e2e case with its current native coverage. Regenerate it after changing those suites with `node tests/host/native-port-inventory.mjs --write`; `--check` catches an out-of-date inventory in CI. Partial entries still require a native assertion port before the corresponding Electron test can be retired.
