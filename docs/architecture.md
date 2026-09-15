# Architecture

Vector is a pnpm monorepo with one authoritative process — the **runtime** —
and several thin surfaces that talk to it.

```
            ┌─────────────────────────────────────────────┐
            │              Electron shell                  │
            │  BaseWindow ── WebContentsView (per page)    │
            │  React renderer (sidebar, command bar,       │
            │   stage card + engine badge, agent rail)     │
            └───────┬──────────────────────┬───────────────┘
            fork-RPC (native.*, api.invoke)│ CDP (Playwright)
                    │                      │
            ┌───────▼──────────────────────▼───────────────┐
            │            vector-runtime (node)             │
            │                                              │
            │  Router        engine vs Chromium per open,  │
            │                needs-chromium table, fallback│
            │  PageService   page lifecycle + observe      │
            │  Executor      typed programs on exact refs  │
            │  Coordinator   agent loop (plan → act → verify)
            │  SetRunner     bounded parallel set mapping  │
            │  Repo          node:sqlite persistence       │
            │  ApiServer     loopback HTTP + WS            │
            └───┬───────────┬──────────────┬───────────┬───┘
                │ N-API     │              │           │
        ┌───────▼────────┐  HTTP /rpc  WS /ws events  stdio
        │ Vector Engine  │     │            │           │
        │ (Rust, in-proc,│  vector CLI   renderer   MCP server
        │  thread/context)│
        └────────────────┘
```

Two page backends sit under the runtime: **Chromium** (the shell's
`WebContentsView`, headless Chromium in standalone mode, or the user's
attached Chrome) and the **Vector Engine** — Vector's own Rust engine
(`engine/`, design in [engine/architecture.md](engine/architecture.md))
loaded in-process as the `@vector/engine-native` addon. The engine does the
agent work natively (semantic observation from its own trees, `r<n>` refs
that are DOM arena indices, whole programs executed in one native call);
Chromium is the fallback for pages that need JavaScript.

## Who owns what

- **Runtime is authority.** Page identity, observations, programs, runs, sets,
  artifacts, events, persistence, recovery. Nothing else stores browser truth.
- **Electron main** owns the native surface: `WebContentsView` pages, the
  persistent browser partition, downloads, find, zoom, popups, shortcuts, and
  the forked runtime child. It exposes `native.*` methods to the runtime over
  fork-RPC and forwards `api.invoke` calls from the renderer.
- **Renderer** is a React shell synced from `workspace.get` + the WS event
  stream (see [ui/shell.md](ui/shell.md)). It positions the visible page
  view via `bridge.setStage` from the stage card's rect. The command bar
  (`intent.ts`, `chrome.ts` `toUrl` / `addressNavigate`) navigates or
  searches without starting a run and starts a run for a prompt.
  `nativePageId` hides the native view for scrim overlays (palette,
  settings, history, observe) and for missing/`about:blank` URLs so the
  start page is not covered by an opaque `WebContentsView`. Find and
  downloads stay in-flow and keep the page live. The agent rail is closed by
  default.
- **CLI / MCP** are stateless clients of the loopback API.

## Browser drivers

`packages/browser-driver` defines `BrowserDriver`/`DriverPage`. Four
implementations, three of them over Playwright-Core CDP:

| Driver | Backend | Use |
|---|---|---|
| `VectorElectronDriver` | `vector` | pages hosted in the desktop shell; identity via an injected `__vectorTid` marker so same-URL tabs stay distinct |
| `StandaloneDriver` | `vector` | runtime without the shell — headless Chromium (system Chrome, `VECTOR_BROWSER_PATH`, or a Playwright `chromium_headless_shell` found by `scripts/chromium.mjs`) for tests/CLI/bench |
| `AttachedChromeDriver` | `chrome` | the user's Chrome at `--remote-debugging-port`; real CDP target ids, borrowed tabs are never closed |
| `VectorEngineDriver` (`vector-engine.ts`) | `vector-engine` | the in-process Vector Engine via `@vector/engine-native`; `targetId = "ve-<context>-<page>"`; every `DriverPage` method is a one-step program and `executeProgram(steps, { returnObservation })` runs a whole program plus its observation in one native call |

## Engine backend and router

`apps/runtime/src/main.ts` loads the engine addon at startup when it is
present (`VECTOR_ENGINE=0` skips it) and registers a `vector-engine` session
either `connected` or `disconnected` with the loader's diagnostic. Whether
pages are *routed* to it is `settings.engineMode`: `off` (default — nothing
changes for existing users), `auto`, `always`; `VECTOR_ENGINE_MODE` is the
env override.

`Router` (`apps/runtime/src/services/router.ts`) decides per `pages.open`
and returns the decision as `PageTarget.routeReason`:

1. explicit `backend: "chrome" | "vector-engine"` → that backend, no fallback;
2. `off` → Chromium; `always` → engine, no fallback;
3. `auto` → Chromium if the engine is not connected, the URL scheme is not
   `http(s):`/`file:`/`data:`/`about:`, or the origin is in the
   **needs-chromium table** (SQLite kv, 24 h TTL); otherwise engine-first.

The engine parses and classifies the document on open (`requiresScript` +
reason, e.g. `empty-root-container: #root`, `body-onload`,
`form-onsubmit`, `template-heavy`, `unsupported-content: application/pdf`).
In `auto` a classified page is closed, the origin recorded, and the URL
reopened on Chromium with `routeReason: "fallback:<reason>"`. A mid-program
`capability_unsupported` (`evaluate`, `dialog`, downloads, `xpath:`
targets, …) migrates the live page to Chromium at its
current URL — same `pageId`, new target, `documentEpoch` bumped — takes a
fresh observation, and replays the remaining steps; `ProgramResult.fallback`
records it, with `repair: true` when ref-targeted steps could not be replayed
(engine refs do not exist on Chromium) so the coordinator re-observes and
replans. Decisions are counted in `traces.counters` (`router.decide`,
`router.fallback.open`, `router.fallback.midProgram`, `router.open.<backend>`)
and logged to stderr with `VECTOR_ROUTER_LOG=1`.

Engine pages are headless: `pages.activate` and `pages.capture` on them
fail with `capability_unsupported`, they never take the stage lease, and
the shell shows them with the *Vector Engine* badge only.

## Page identity

Every page has a `pageId` (runtime-issued), a `targetId` (driver-level), and a
`documentEpoch` that increments on navigation. Observation element refs
(`r1`, `r2`, …) are scoped to `(pageId, documentEpoch)` — stale refs fail
loudly instead of acting on the wrong document. On the engine backend the
epoch is the engine's document `generation` and a ref is the node's arena
index; on Chromium refs are registry entries resolved to locators.

## Execution model

Agents send **typed programs** — batched `navigate/click/fill/select/wait/
extract/keyboard/…` steps — not per-keystroke instructions. The executor runs
them transactionally-ish: each step verifies the epoch, resolves the ref to a
locator, acts, and records a `StepResult` with timing. Extraction steps return
structured fields.

`runs.start` drives the agent loop: observe → plan (AI Gateway, structured
output) → execute batch → verify → repeat, with human-takeover and pause/
resume/answer control. Models without native structured-output support fall
back to JSON-in-text (the response is extracted and schema-validated), and
reasoning models get extra output-token headroom for thinking tokens.

Recovery ladder: a failed chunk re-observes and replans; once per run the
**vision fallback** captures a screenshot and replans from pixels (the
`visionModel` setting or `VECTOR_VISION_MODEL` picks the model; defaults to
the planner model — use `models.probe` to check a model accepts images);
the final retry escalates to the optional recovery model
(`recoveryModel`/`VECTOR_RECOVERY_MODEL`).

`sets.map` applies a saved program or a goal across set members through a
bounded `WorkerPool` (global + per-origin limits). Successful member runs can
be *learned* into saved programs — refs are translated to portable selectors —
and replayed cheaply on later members.

## Persistence & recovery

`node:sqlite` under `VECTOR_DATA_DIR`. Pages, runs, steps, results, sets,
programs, artifacts, sessions, history, bookmarks, and a monotonic event log
(`events.since`/`/ws`). Multi-row writes go through `Repo.transaction`.

Runs are **crash-safe, not resumable**: every step, model call and status
change is in the ledger, so nothing is lost or replayed after a crash — but
the agent loop's in-memory state is not checkpointed. On startup, runs left
in active states are marked `interrupted` (`runtime.describe` reports
`checkpointResume: false`); persisted pages whose native surface is gone
come back `detached`. The only resume primitive is program-level:
`checkpoint` nodes plus `resumeFrom` (`programCheckpoints: true`).

An unhandled rejection in the runtime fails the active runs with the fault
as their error and keeps serving; an uncaught exception fails them, flushes,
and exits non-zero so the shell can respawn. A dropped driver socket marks
the session `degraded` (`session.changed`) and the next `pages.open`
reconnects lazily.

## The loopback API

`POST /rpc` `{method, params}` with `Authorization: Bearer <token>` — the
bearer header is the only accepted HTTP credential. The port and token are
written to `<dataDir>/runtime.json` (mode `0600`, data dir `0700`) at
startup. `GET /health` is unauthenticated. `GET /ws?token=…` streams events
(the query form is accepted only on the WebSocket upgrade, where browser
clients cannot set headers). Bodies over 2 MB are rejected with `413`. See
[api.md](api.md).

## Human takeover

`input-event` on an agent-controlled view flips `controller` to `human` and
bumps the page's `controllerEpoch`. The in-flight program fails at its next
step with `conflict` ("changed controller mid-run"); the run itself is *not*
paused — the coordinator treats the failed chunk like any other failure
(re-observe, repair ladder) and will keep failing with `conflict` until the
human hands the page back with `pages.resume` or the run is cancelled.
`runs.pause`/`runs.resume` control the agent loop independently of page
control.

## Model output is untrusted

The planner may only emit the declarative step vocabulary (`PlanStepSchema`):
no `evaluate`, no `expression` waits. Page-derived text in prompts
(observations, extracted values) is fenced with a per-prompt random delimiter
and the system prompt states that fenced content is data, never instructions.
`evaluate`/`{eval:}` remain available to trusted program sources (API, CLI,
MCP, saved programs) via the executor's `allowEval` flag, which defaults off.

## The stage lease

Chromium only delivers trusted input (pointer, keyboard) to a *visible,
laid-out* view — hidden background pages can't be clicked. When a program
with interactive steps (`click`, `fill`, `press`, `select`, …) runs on a
`vector` page inside the shell, the runtime takes a serialized **stage
lease** (`native.acquireStage`): the page's view is shown at stage bounds
for the program's duration, then released. Parallel set members take turns
on the stage instead of racing it; pure observation programs (navigate,
extract, waitFor, screenshot) don't need the lease and run fully in the
background. `vector-engine` pages never take the lease: the engine *is* the
input device, so every step event is trusted regardless of visibility and
parallel programs on different engine pages never serialize on input.
