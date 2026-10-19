# Aside contract

Aux runs Aside's own artifacts. This file records what Aux changes and what it deliberately leaves alone.

## Pipeline

`scripts/vendor-aside.mjs` reads the installed Aside (`~/Library/Application Support/Aside`, `~/.aside`) and stages into `out/aside-staged/`:

| Output | Source | Changes |
| --- | --- | --- |
| `Aux Daemon.app` | Aside daemon (Node SEA) | blob patched (`patches/daemon.mjs`), shims injected, bundle id `dev.aux.browser`, Aux icon |
| `cli/Aux CLI.app` | Aside CLI (Node SEA) | blob patched (`patches/cli.mjs`), runs on the daemon's Node host, executable `aux-cli` |
| `extensions/*` | agent-manager, password-manager | private `chrome.aside*` APIs shimmed, Aux artwork |
| `agent-runtime` | Aside agent runtime | seeded per home |

## Patches

Anchored string patches with expected match counts. Changes are limited to: ports (21520/21521 daemon, 21522 bridge, 45203 CDP gate), install dirs (`~/.aux`), local API origin, native-binding path, plan gate (local accounts), prose (product word, CLI command, skill name `aux-browser`), password importer helper name.

## Kept as Aside defines them

`AsideDaemonSessionToken`, `aside.daemon.auth.` protocol prefix, `Aside Daemon Auth v1\0` signing prefix, health `service:"aside-daemon"`, `Aside.*` CDP methods, extension ids.

## Shims (`vendor/aside/shims`)

- `aux-native.cjs`: native helper binding (install, secure, cdp-sign).
- `aux-local-api.js`: local stand-in for Aside's cloud API.
- `aux-bridge.js`: signing bridge (port 21522).
- `aux-private-shim.js`: `chrome.asideAccount/Notification/BrowserImport/BrowserPreferences/MiniPopup` in JS.
- `aux-cdp-gate.mjs`: authenticated CDP endpoint on 45203, proxying Chromium's private 45204 and answering `Browser.ensureChromiumProfile` locally.

## Launch notes

- Chromium needs `--remote-debugging-port=45204 --remote-allow-origins=* --use-mock-keychain` (unsigned builds).
- Account slots mint automatically (`u1`). Model credentials live in `$ASIDE_HOME/u/<account>/credentials.json`.
- Run staged CLI apps from `/tmp` or a signed location if launch hangs at `_dyld_start`.

## Not yet native

Vertical-tab sidebar, mini popup, importer WebUI, adblock, Computer Use helper, Aux cloud.
