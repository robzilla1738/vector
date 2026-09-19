# Architecture

The product GUI is the coherent desktop shell in `apps/desktop`. Chromium is
the compatibility backend and the Vector Engine is a qualified accelerator.
The Node **runtime** coordinates the UI, MCP, CLI, and loopback API.

Vector is a pnpm monorepo with one authoritative process — the **runtime** —
and several thin surfaces that talk to it.

```
            ┌─────────────────────────────────────────────┐
            │  Product: desktop hybrid shell               │
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
loaded through `@vector/engine-native` (process-isolated in production). The engine does the
agent work natively (semantic observation from its own trees, `r<n>` refs
that are DOM arena indices, whole programs executed in one native call);
Chromium provides the general compatibility floor.

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
| `VectorEngineDriver` (`vector-engine.ts`) | `vector-engine` | Finding 1: client of `BrowserService`. Attaches to `VECTOR_BROWSER_SERVICE`, else starts NAPI `BrowserServiceHandle` or spawns `ve-shell --service`. Injected `load` keeps a local Engine for unit tests. `targetId = "ve-<context>-<page>"` |

## Engine backend and router

`apps/runtime/src/main.ts` loads the engine addon at startup when it is
present (`VECTOR_ENGINE=0` skips it) and registers a `vector-engine` session
either `connected` or `disconnected` with the loader's diagnostic. Whether
pages are *routed* to it is `settings.engineMode`: `off` (Chromium only),
`auto` (Chromium by default; qualified engine cohorts), `always`. `pnpm dev`
and the desktop shell default to `auto`. A stored setting wins.
`VECTOR_ENGINE_PROFILE=production` forces `securityProfile: production`,
`isolation: requireProcess` (`ve-host`). `VECTOR_NATIVE_ONLY=1` is the only
setting that disables Chromium fallback.

`Router` (`apps/runtime/src/services/router.ts`) decides per `pages.open`
and returns the decision as `PageTarget.routeReason`:

1. explicit `backend: "vector" | "chrome" | "vector-engine"` → that backend, no fallback;
2. `off` → Chromium; `always` → engine, no fallback;
3. `auto` → the engine only for `about:`/`data:` or origins in
   `settings.engineCohorts`; every other page uses Chromium. The
   **needs-chromium table** (SQLite kv, 24 h TTL) quarantines cohort failures.

The engine parses and classifies the document on open (`requiresScript` +
reason, e.g. `empty-root-container: #root`, `body-onload`,
`form-onsubmit`, `template-heavy`, `unsupported-content: application/pdf`).
In `auto` a classified page is closed, the origin recorded, and the URL
reopened on Chromium with `routeReason: "fallback:<reason>"`. Classification
includes an empty first screen (`empty-viewport: …`: plenty of document
text, almost nothing painted in the viewport). A mid-program
`capability_unsupported`, `backend_unavailable`, or `internal`
(`xpath:` targets, canvas/WebGL, PDF, an engine panic, …)
migrates the live page to Chromium at its
current URL — same `pageId`, new target, `documentEpoch` bumped — takes a
fresh observation, and replays only read-only remaining steps.
`ProgramResult.fallback` records it. Any completed or pending write, or a
ref-targeted step, returns `repair: true` so the coordinator re-observes and
replans without risking a duplicate side effect.

In the desktop shell, ordinary Auto-mode tabs open on Chromium with
`routeReason: "hybrid:chromium-default"`. Qualified engine pages use
`routeReason: "hybrid:qualified-cohort:<cohort>"`. The shell paints engine pages with
`EngineView` (`pages.capture` software PNG, clicks/wheel via `pages.execute`).

Decisions are counted in `traces.counters` (`router.decide`,
`router.fallback.open`, `router.fallback.midProgram`, `router.open.<backend>`)
and logged to stderr with `VECTOR_ROUTER_LOG=1`.

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
resume/answer control. The planner defaults to `alibaba/qwen3.8-27b`;
Settings can switch to `openai/gpt-5.6-luna-fast`. `VECTOR_GATEWAY_ONLY`
may pin a provider, but an OpenAI model still routes to OpenAI. Models without native structured-output support fall
back to JSON-in-text (the response is extracted and schema-validated), and
reasoning models get extra output-token headroom for thinking tokens.

Recovery ladder: a failed chunk re-observes and replans; once per run the
**vision fallback** captures a screenshot and replans from pixels when
`visionModel` / `VECTOR_VISION_MODEL` is set (use `models.probe` to check a
model accepts images). Unset, vision is skipped. The final retry escalates
to the optional recovery model (`recoveryModel`/`VECTOR_RECOVERY_MODEL`).

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

A real click or key in an agent-controlled native view flips `controller` to
`human`, bumps `controllerEpoch`, and pauses every live run that targets
that page. The in-flight program fails at its next step with `conflict`.
`pages.resume` (the *Return control* chip) releases the page and resumes
those runs. `runs.pause`/`runs.resume` still control the agent loop on their
own.

Playwright/CDP input is not a takeover. While `native.acquireStage` is held
or `pages.execute` is in-flight on that page, `input-event` `mouseDown`/
`keyDown` is ignored — including on the focused tab the human is watching.
The page stays `controller: "agent"` for the whole run (`ctx.runId`); it
returns to `none` when the run finishes.

## Model output is untrusted

The planner may only emit the declarative step vocabulary (`PlanStepSchema`):
no `evaluate`, no `expression` waits. Page-derived text in prompts
(observations, extracted values) is fenced with a per-prompt random delimiter
and the system prompt states that fenced content is data, never instructions.
`evaluate`/`{eval:}` remain available to trusted program sources (API, CLI,
MCP, saved programs) via the executor's `allowEval` flag, which defaults off.

## Offscreen working pages (formerly the stage lease)

Chromium only delivers trusted input (pointer, keyboard) to a *visible,
laid-out* view — a `setVisible(false)` background page stops producing
frames, so it can't be clicked and Playwright's stability checks stall on
it. When a program with interactive steps (`click`, `fill`, `press`,
`select`, …) runs on a `vector` page inside the shell, the runtime marks the
page *working* (`native.acquireStage`, released after the program). A
working page that is not the focused tab is rendered at stage size just
outside the window: laid out, producing frames, receiving input, invisible
to the human. Any number of pages can be working at once and the focused
tab never flips — there is no global lease and parallel set members really
run in parallel (plan A8). Runtime input into a working page — focused or
offscreen — is not a takeover; a human click after the program still is.
Pure observation programs (navigate, extract, waitFor, screenshot) don't
need the view laid out. `vector-engine` pages never take part: the engine
*is* the input device, so every step event is trusted regardless of visibility.
