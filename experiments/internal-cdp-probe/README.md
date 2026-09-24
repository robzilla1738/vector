# Internal CDP transport proof (Electron 43.6.0)

This is an isolated host experiment. It does not change Aux's production automation transport and must not be packaged as a substitute for the current driver.

Run from the repository root after installing workspace dependencies:

```sh
apps/desktop/node_modules/.bin/electron experiments/internal-cdp-probe/main.cjs
apps/desktop/node_modules/.bin/electron experiments/internal-cdp-probe/playwright-bridge.cjs
```

Both scripts use temporary Electron user data and exit with an assertion result. The second prints `AUX_PLAYWRIGHT_BRIDGE_PROBE` and exits 0 only when all of its checks pass.

## Findings

- Without `--remote-debugging-port`, a page's `webContents.debugger` handles page commands and browser-level `Browser.getVersion` and `Target.getTargets`. It also enumerates and can attach to a target in another Electron session. An internal debugger alone is **not** a profile boundary.
- A local broker backed by that debugger can speak enough browser-level CDP for the installed Playwright to connect, initialize two allowed tabs in one context, and read a nested frame. A synthetic browser session is needed because `Target.attachToBrowserTarget` is not allowed directly from the page debugger.
- In the probe, an unguessable WebSocket path rejects an invalid capability. The broker filters `Target.getTargets`, denies attachment to the other profile, and returns only the regular session's cookie. The raw Chromium debugging port is disabled.

The probe deliberately forwards other CDP commands broadly. It does **not** prove a secure production transport, out-of-process frame coverage, downloads, takeovers, tab creation/destruction, runtime reconnect, or a signed build. It does not authenticate the real Aux runtime process: the test creates and uses its capability in one process. It does not establish extension or password-manager compatibility.

## Production qualification required before removing the raw port

1. Own the broker in Electron main and give each runtime generation a fresh capability over the existing fork IPC, not in environment variables or on disk. Reject unrelated local processes and expired generations.
2. Derive allowed target and browser-context IDs from Aux's native tab registry and current Profile. Synthesize target lifecycle events only for those views; revoke sessions on tab removal, profile switch, and takeover. Reject browser-wide or cross-profile CDP commands by default. The probe's generic forwarding must not be copied into production.
3. Map browser-session cookie operations to the permitted Electron `session`. Keep downloads under Aux's native profile-session path and prove frame, popup, target creation, activation, crash/reconnect, and agent takeover behavior.
4. Run the same agent workflow through the new broker with the raw Chromium port disabled. Attempt attachment from an unrelated process and from another Profile/private window. Only then remove `remote-debugging-port`, `DevToolsActivePort` polling, and the old port file from distributed builds.

Reference APIs: [Electron debugger](https://www.electronjs.org/docs/latest/api/debugger), [Playwright CDP connection](https://playwright.dev/docs/api/class-browsertype#browser-type-connect-over-cdp).
