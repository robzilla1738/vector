# Troubleshooting

## The app launches but pages show `chrome-error://chromewebdata/`

The target URL failed to load — almost always a dead fixture or unreachable
host. Confirm `pnpm fixtures` is running and `curl http://127.0.0.1:4810/records`
returns HTML.

## `vector` CLI says "no runtime found" / connection refused

The CLI reads `<dataDir>/runtime.json`. If you ran the runtime with a custom
`VECTOR_DATA_DIR`, pass the same dir to the CLI. If `runtime.json` exists but
the port is dead, a stale descriptor survived a crash — delete it and restart.

## `pages.find` returns 0 matches on a page that clearly contains the text

Chromium's `findInPage` needs a *visible, laid-out* view. Pages opened in the
background or driven purely by the API stay hidden, so the runtime falls back
to a DOM text scan (match count only, no highlight). To get native find with
highlighting, activate the page first (`pages.activate`) while the window is
in focus mode.

## Pointer steps time out on a hidden page

Trusted input (click/press/fill/…) requires a visible, laid-out view. The
runtime handles this automatically via the stage lease — the page is shown
at stage bounds for the duration of the program. If a step still times out,
check that the target is a `vector` backend page (attached-Chrome tabs don't
need the lease; they run in the user's real browser window).

## `No native surface: the runtime is not attached to a Vector desktop shell`

`backend: "vector"` pages need either the desktop shell (Electron fork-RPC) or
the standalone driver. Standalone mode requires a system Chrome install. Use
`chrome.attach` for the user's real browser instead.

## Stale element refs / `stale_ref` errors

Refs are scoped to `documentEpoch`; any navigation invalidates them. Re-observe
after navigating. Optional steps skip rather than fail.

## Runs stuck in `running` after a crash

On startup the runtime marks orphaned active runs `interrupted` — check
`runs.list`. If a run is `paused` waiting for a takeover, `runs.resume` returns
control to the agent.

## Packaged app: runtime didn't start

Check `<dataDir>/runtime.json` and the app's stderr (launch from a terminal:
`release/mac-arm64/Vector.app/Contents/MacOS/Vector`). Missing runtime deps
(`Cannot find package …`) mean `runtime/node_modules` wasn't injected — rerun
`pnpm package:local`.

## Vitest: `Unexpected call to process.send()`

The runtime only speaks fork-RPC when `VECTOR_IPC=1`. Tests run it in-process
without that flag; if you spawn it manually, don't set the flag under a
process that owns `process.send` (vitest forks).

## AI Gateway errors on `runs.start`

`AI_GATEWAY_API_KEY` must be set (see `.env.example`). `models.probe` checks
key + connectivity + latency without running a goal.
