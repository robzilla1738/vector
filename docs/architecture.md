# Architecture

Vector is a pnpm monorepo with one authoritative process — the **runtime** —
and several thin surfaces that talk to it.

```
            ┌─────────────────────────────────────────────┐
            │              Electron shell                  │
            │  BaseWindow ── WebContentsView (per page)    │
            │  React renderer (toolbar omnibox, tab rail,  │
            │   optional agent inspector, activity shelf)  │
            └───────┬──────────────────────┬───────────────┘
            fork-RPC (native.*, api.invoke)│ CDP (Playwright)
                    │                      │
            ┌───────▼──────────────────────▼───────────────┐
            │            vector-runtime (node)             │
            │                                              │
            │  PageService   page lifecycle + observe      │
            │  Executor      typed programs on exact refs  │
            │  Coordinator   agent loop (plan → act → verify)
            │  SetRunner     bounded parallel set mapping  │
            │  Repo          node:sqlite persistence       │
            │  ApiServer     loopback HTTP + WS            │
            └───────┬──────────────┬───────────┬───────────┘
                    │              │           │
              HTTP /rpc      WS /ws events   stdio
                    │              │           │
                 vector CLI    renderer      MCP server
```

## Who owns what

- **Runtime is authority.** Page identity, observations, programs, runs, sets,
  artifacts, events, persistence, recovery. Nothing else stores browser truth.
- **Electron main** owns the native surface: `WebContentsView` pages, the
  persistent browser partition, downloads, find, zoom, popups, shortcuts, and
  the forked runtime child. It exposes `native.*` methods to the runtime over
  fork-RPC and forwards `api.invoke` calls from the renderer.
- **Renderer** is a React shell synced from `workspace.get` + the WS event
  stream. It positions the visible page view via `ui.setStage`. Address
  entry (`chrome.ts` `toUrl` / `addressNavigate`) navigates or searches
  without starting a run. `nativePageId` hides the native view for scrim
  overlays (palette, settings, history, observe) and for missing/`about:blank`
  URLs so New Tab is not covered by an opaque `WebContentsView`. Find and
  downloads stay in-flow and keep the page live. The agent inspector is
  optional and closed by default.
- **CLI / MCP** are stateless clients of the loopback API.

## Browser drivers

`packages/browser-driver` defines `BrowserDriver`/`DriverPage` over
Playwright-Core CDP. Three implementations:

| Driver | Use |
|---|---|
| `VectorElectronDriver` | pages hosted in the desktop shell; identity via an injected `__vectorTid` marker so same-URL tabs stay distinct |
| `StandaloneDriver` | runtime without the shell — headless system Chrome for tests/CLI |
| `AttachedChromeDriver` | the user's Chrome at `--remote-debugging-port`; real CDP target ids, borrowed tabs are never closed |

## Page identity

Every page has a `pageId` (runtime-issued), a `targetId` (driver-level), and a
`documentEpoch` that increments on navigation. Observation element refs
(`r1`, `r2`, …) are scoped to `(pageId, documentEpoch)` — stale refs fail
loudly instead of acting on the wrong document.

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
(`events.since`/`/ws`). On startup, runs left in active states are marked
`interrupted`; persisted pages whose native surface is gone come back
`detached`.

## The loopback API

`POST /rpc` `{method, params}` with `Authorization: Bearer <token>`; the port
and token are written to `<dataDir>/runtime.json` at startup. `GET /health`
is unauthenticated. `GET /ws?token=…` streams events. See [api.md](api.md).

## Human takeover

`input-event` on an agent-controlled view flips `controller` to `human`; in-
flight execution fails with a conflict and the run pauses. `pages.resume`
returns control to the agent.

## The stage lease

Chromium only delivers trusted input (pointer, keyboard) to a *visible,
laid-out* view — hidden background pages can't be clicked. When a program
with interactive steps (`click`, `fill`, `press`, `select`, …) runs on a
vector page, the runtime takes a serialized **stage lease**
(`native.acquireStage`): the page's view is shown at stage bounds for the
program's duration, then released. Parallel set members take turns on the
stage instead of racing it; pure observation programs (navigate, extract,
waitFor, screenshot) don't need the lease and run fully in the background.
