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
the standalone driver. Standalone mode needs a Chromium: `VECTOR_BROWSER_PATH`
if set, else the Playwright channels `chrome`, `chrome-headless-shell`,
`chromium` in that order (`pnpm exec playwright install
chromium-headless-shell` provides one; the bench and integration tests find
it via `scripts/chromium.mjs`). Use `chrome.attach` for the user's real
browser, or `backend: "vector-engine"` for pages the engine can serve.

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

Typing or clicking in an agent-driven page takes it over: the page's
`controller` becomes `human` and every in-flight or later program on it
fails with `conflict` until you hand it back (`pages.resume`, or the chip in
the toolbar). The run is *not* paused by a takeover — cancel it, or resume the
page and let the planner retry.

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
(`~/Library/Application Support/Vector/.env`) or export the variable.

## `pages.open` fails with `backend_unavailable` after the browser crashed

A dropped driver connection marks the session `degraded` (`sessions.list`,
`session.changed`); the next `pages.open` reconnects lazily. If it still
fails, the backend is really gone — relaunch the shell or re-attach Chrome.

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

`AI_GATEWAY_API_KEY` must be set (see `.env.example`). The planner is
`alibaba/qwen3.8-27b` on Cerebras unless you override `VECTOR_PLANNER_MODEL`
/ `VECTOR_GATEWAY_ONLY`. `models.probe` checks key + connectivity + latency
without running a goal. Image/vision calls are skipped when Gateway is
pinned to Cerebras.

## `runtime.describe` says `engine.available: false` / session `vector-engine` is `disconnected`

The `@vector/engine-native` addon (`engine/crates/ve-napi`) is not built by
`pnpm build`. The loader (`engine/crates/ve-napi/index.js`) looks for
`VECTOR_ENGINE_NATIVE`, then `vector-engine.<platform>-<arch>.node` next to
`index.js`, then `engine/target/{release,debug}/libve_napi.{so,dylib,dll}`
(`$CARGO_TARGET_DIR` first). Its error lists every path it tried. Build it:

```bash
cd engine && cargo build -p ve-napi --features napi --release
# or: pnpm --filter @vector/engine-native build      (napi-rs CLI → vector-engine.<platform>-<arch>.node)
# or: node engine/crates/ve-napi/scripts/build.mjs   (cargo, then copies the cdylib next to index.js)
node engine/crates/ve-napi/scripts/smoke.mjs         # load, open a data: URL, observe, run a program
```

Needs a stable Rust toolchain (`rust-version = 1.85`) and a C compiler (the
`napi` feature turns on `http`, which builds `ring`). The addon is a
`cdylib`, so a binary built for another platform/arch will not load. If the
addon lives elsewhere, `VECTOR_ENGINE_NATIVE=/path/to/vector-engine.node`.
`VECTOR_ENGINE=0` disables loading entirely. `pnpm test` skips the engine
integration test with the loader's diagnostic when the addon is missing, and
`pnpm bench --backend vector-engine` reports `skipped — vector-engine
unavailable`.

## Pages open on Chromium although the engine is available

Routing is off by default. Check `runtime.describe` → `engine.mode`; set
`settings.set { engineMode: "auto" }` (or `VECTOR_ENGINE_MODE=auto`; the
stored setting wins over the env). Then read `routeReason` on the
`pages.open` result:

- `engine-mode-off` — the setting is still `off`.
- `engine-unavailable` — the addon did not load (section above).
- `unsupported-scheme:<scheme>` — the engine opens `http(s):`, `file:`,
  `data:`, `about:` only.
- `needs-chromium-table:<reason>` — this origin fell back within the last
  24 h and is pinned to Chromium until the entry expires
  (`runtime.describe` → `engine.needsChromiumOrigins` counts them; there is
  no RPC to clear the table — wait for the TTL or use a fresh
  `VECTOR_DATA_DIR`).
- `fallback:<reason>` — the engine opened the page, classified it as
  script-dependent (`empty-shell`, `empty-root-container: #root`,
  `body-onload`, `form-onsubmit`, `template-heavy`,
  `unsupported-content: …`) or failed mid-program
  (`mid-program:<op>:…`), and the page was reopened on Chromium. Expected
  for SPAs in M1 (no JavaScript).

`VECTOR_ROUTER_LOG=1` prints every decision to the runtime's stderr;
`traces.counters` has `router.decide`, `router.fallback.open`,
`router.fallback.midProgram` and `router.open.<backend>`.

## Forcing a backend

`pages.open { backend: "vector-engine" }` (CLI/MCP: `backend
vector-engine`) forces the engine with no fallback — a script-dependent page
stays there and the reason is appended to `routeReason` as
`(classified:<reason>)`. `settings.set { engineMode: "always" }` does the
same for every open (what `pnpm bench --backend vector-engine` uses).
`engineMode: "off"` or `backend: "vector"` with `off` forces Chromium.

## A program on an engine page came back with `fallback` / `REPAIR:`

A step hit `capability_unsupported` on the engine (in M1: `evaluate`,
`dialog`, `expectDownload`, `xpath:` targets, `javascript:` URLs, `waitFor
expression | downloadCompleted`). With `engineMode:
auto` the runtime moved the page to Chromium (same `pageId`, new
`documentEpoch`, `routeReason: fallback:mid-program:<op>:…`) and replayed the
remaining steps — `ProgramResult.fallback.replayedFrom` is the first index
run on Chromium. `repair: true` with an error starting `REPAIR:` means some
remaining steps named engine refs (`r<n>`), which do not exist on Chromium:
re-observe and issue fresh refs. `fallback unavailable` in `error` means no
Chromium backend was connected to fall back to.

## `pages.capture` / `pages.activate` fail with `capability_unsupported` on an engine page

Engine pages are headless in M1: no native view to focus, and
`PageService.capture` refuses `vector-engine` pages (the addon's own
`screenshot` renders a software PNG, but the runtime does not use it yet).
Open the page on Chromium (`backend: "vector"`) when
you need a screenshot or a visible tab (the agent loop's vision fallback
also goes through `pages.capture`, so it cannot capture an engine page).
