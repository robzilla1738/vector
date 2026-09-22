# Troubleshooting

## The app launches but pages show `chrome-error://chromewebdata/`

The target URL failed to load — almost always a dead fixture or unreachable
host. Confirm `pnpm fixtures` is running and `curl http://127.0.0.1:4810/records`
returns HTML.

## `aux` CLI says "no runtime found" / connection refused

The CLI reads `<dataDir>/runtime.json`. If you ran the runtime with a custom
`AUX_DATA_DIR`, pass the same dir to the CLI. If `runtime.json` exists but
the port is dead, a stale descriptor survived a crash — delete it and restart.

## `pages.find` returns 0 matches on a page that clearly contains the text

Chromium's `findInPage` needs a *visible, laid-out* view. Pages opened in the
background or driven purely by the API stay hidden, so the runtime falls back
to a DOM text scan (match count only, no highlight). To get native find with
highlighting, activate the page first (`pages.activate`) while the window is
in focus mode.

## Pointer steps time out on a hidden page

Trusted input (click/press/fill/…) requires a visible, laid-out view. The
runtime marks the page working (`native.acquireStage`) for the duration of
an interactive program — offscreen at stage size if it is not the focused
tab. If a step still times out, check that the target is a `aux` backend
page (attached-Chrome tabs don't need that; they run in the user's real
browser window).

## `No native surface: the runtime is not attached to a Aux desktop shell`

`backend: "aux"` pages need either the desktop shell (Electron fork-RPC) or
the standalone driver. Standalone mode needs a Chromium: `AUX_BROWSER_PATH`
if set, else the Playwright channels `chrome`, `chrome-headless-shell`,
`chromium` in that order (`pnpm exec playwright install
chromium-headless-shell` provides one; the bench and integration tests find
it via `scripts/chromium.mjs`). Use `chrome.attach` for the user's real
browser.

## Stale element refs / `target_detached` errors

Refs are scoped to `documentEpoch`; any navigation invalidates them and the
step fails with `target_detached` (there is no `stale_ref` code). Re-observe
after navigating. Optional steps record `failed` but let the program continue.

## Runs stuck in `running` after a crash

On startup the runtime marks orphaned active runs `interrupted` — check
`runs.list`. Runs are crash-safe (nothing is lost or replayed) but not
resumable: start a new run; `runtime.describe` reports
`checkpointResume: false`. While the runtime is alive, an unhandled fault
fails the active runs with the fault as their `error` instead of leaving
them spinning.

## A run keeps failing with `conflict` after I clicked in the page

A real click or key in an agent-driven page (between programs) takes it
over: `controller` becomes `human`, live runs on that page pause, and
programs fail with `conflict` until you hand it back (`pages.resume`, or
*Return control* in the toolbar). Agent clicks while a program is running
are ignored. If you did not touch the page and still see the chip, quit and
relaunch so main/runtime pick up the current build.

## `sets.map` ignores `runs.pause` / `runs.cancel`

It does not: pause stops new members from starting (in-flight members finish
first); cancel aborts in-flight member agents and marks unfinished members
`skipped`. If a run shows `cancelled` with some members `completed`, those
finished before the cancel landed.

## Set run reports `0` model calls

Member agents record their calls under the set run's id (`runs.get` →
`modelCalls`). A `0` means the map replayed a saved/learned program for every
member and never needed the model.

## `.env` is ignored

The runtime loads `<dataDir>/.env` and then `<cwd>/.env` at startup, without
overriding variables already set in the environment. If you run the desktop
app from Finder, `cwd` is not the repo — put the file in the data dir
(`~/Library/Application Support/Aux/.env`) or export the variable.

## `pages.open` fails with `backend_unavailable` after the browser crashed

A dropped driver connection marks the session `degraded` (`sessions.list`,
`session.changed`); the next `pages.open` reconnects lazily. If it still
fails, the backend is really gone — relaunch the shell or re-attach Chrome.

## Packaged app: runtime didn't start

Check `<dataDir>/runtime.json` and the app's stderr (launch from a terminal:
`release/mac-arm64/Aux.app/Contents/MacOS/Aux`). Missing runtime deps
(`Cannot find package …`) mean `runtime/node_modules` wasn't injected — rerun
`pnpm package:local`.

## Vitest: `Unexpected call to process.send()`

The runtime only speaks fork-RPC when `AUX_IPC=1`. Tests run it in-process
without that flag; if you spawn it manually, don't set the flag under a
process that owns `process.send` (vitest forks).

## AI Gateway errors on `runs.start`

`AI_GATEWAY_API_KEY` must be set (see `.env.example`). The planner defaults
to `alibaba/qwen3.8-27b` on Cerebras; Settings can switch to
`openai/gpt-5.6-luna-fast`. `models.probe` checks key + connectivity + latency
without running a goal. Image/vision calls are skipped on the Cerebras Qwen
planner, not on Luna Fast.

## Choosing a backend

`pages.open` without a `backend` lands on the embedded Chromium session
(`routeReason: "chromium-default"`). `backend: "aux"` selects it
explicitly. `backend: "chrome"` requires `targetId` of a tab in a Chrome
instance attached with `chrome.attach { port }`.
