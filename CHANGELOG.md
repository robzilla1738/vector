# Changelog

Newest first. PR numbers refer to the GitHub repository; branch names are
the integration tracks that were merged.

## Settings: GPT Luna Fast + uncapped model turns

Planner model is selectable: `alibaba/qwen3.8-27b` (default) or
`openai/gpt-5.6-luna-fast` through AI Gateway. Max model turns per run
can be 8–128 or **No limit** (`maxModelCalls: 0`). A leftover
`VECTOR_GATEWAY_ONLY=cerebras` no longer blocks OpenAI models.

## VEC-001–025 engine roadmap (PR #9, `main`)

Independent Vector Engine work after A14–A23. Ticket reports:
`docs/engine/evidence/`. Roadmap text: `Vector_Engine_Roadmap.md`. This is
not a claim that every generated IDL trait exists (official
`html/dom/idlharness.https.html` PASS; official `html/dom` is 302 PASS / 29 FAIL
at WPT `7c20438…`; ve-vm is research).

- **M0.** `engineMode: always` returns `vector-engine` with `fallbackAllowed:
  false`. Production `ve-host` sandbox (forbidden file, exec, sockets,
  malformed/oversized IPC). Authoritative `NetworkBroker` (forged context,
  DNS rebinding, credential strip, engine allowlist applied on the broker).
  CI: rustc 1.88, clippy `-D warnings`, product `ve-shell`, v8/http, wpt +
  wpt-harness `--tree --tree-family html/dom`, browserbench, addon + `ve-host`.
  Capability ledger (`capabilities.json`); `describe()` `websocket:true`,
  `http3:false`, `serviceWorkers:true`.
- **M1.** Event loop task sources; async `fetchStart`/`fetchPoll`; RFC 6455
  WebSocket (ping/pong, fragments, TLS poll); frames; IndexedDB
  unique/compound/versionchange/`abort` snapshot restore; dedicated Worker
  `postMessage` on a second V8 isolate plus `importScripts`. SW persistent
  isolate, load-time `importScripts`, `clients.claim` → controller,
  `clients.matchAll`, waiting-worker `skipWaiting`. Live document named
  properties; ARIA string reflection; layout-aware `innerText` / node-replacing
  `outerText`. `rel=expect blocking=render` hides later ids from parser-inserted
  scripts and unblocking rAF (`element-render-blocking-004/005/009/010/013`).
  `document.cookie`, `historical.html`, and `blocking` as a `DOMTokenList` PASS.
  `rel=expect` also matches `<a name>` targets.
  `wpt-harness` with pinned testharness + idlharness, `--http --tree
  --tree-family html/dom` (302 PASS / 29 FAIL, `tree_complete`; official
  `idlharness.https.html` PASS). SW `Client.postMessage` and dedicated/shared
  worker clients. HTTP `Last-Modified` / `Content-Language` sidecars,
  USVString unpaired-surrogate replacement, HTML/SVG/XML `document.title`,
  namespaced attributes, `:lang()` / `:dir()` / `dir=auto`, and `rel=expect`
  head gating. Supported subset `testharness.txt` (112 files). Geometry
  `wpt-runner`; `--use-reftest-fonts` is capability, not the m1 scorer.
- **M2.** GPU glyph outlines, clips/opacity/`<img>`, `present_list` without
  readback. Product is `ve-shell` (`pnpm dev` / `pnpm package:local`).
  Electron is labeled hybrid (`pnpm dev:electron` / `pnpm package:electron`).
  `signedUpdates: false`.
- **M3.** Action receipts, coordinator crash recovery, guarded skills, agent
  policy, BiDi adapter. Held-out p95 vs Chromium is measured
  (`docs/engine/evidence/held-out-latest.json`): 5.32× on `act+observe`.
  Token stretch measured (`meetsStretch` true, `tokenRatio` 8.35, declared
  model usage).
- **M4.** `perf --gate m1`, process RSS, optional host RAPL. Official
  Speedometer 3.0 (32/32 executed), JetStream, MotionMark GPU
  (`tools/browserbench`). Class probes stay PARTIAL.
- **M5.** `ve-replay`; `ve-vm` Test262 subset (22 files including `var`).
  V8 stays production.

## Native view, V8 isolates, takeover (PR #8)

Visible tabs, engine thread survival, and human takeover matching the UI.

- **Visible auto-mode desktop tabs** open on Chromium
  (`engine-first:native-view`). Background/CLI still go engine-first.
  `empty-viewport` classification sends hidden-SSR documents to Chromium.
  Open `backend_unavailable` / `internal` is an auto-mode fallback.
- **EngineView** paints `pages.capture` on the stage for engine pages and
  maps click/wheel through `pages.execute`.
- **V8** (`ve-script::V8Vm`): isolates drop newest-first; eval exits newer
  isolates and re-enters them after; host jobs `catch_unwind` so a panic
  is `internal` instead of killing `ve-context-N`. Document scripts wait
  until after classify.
- **Takeover:** Playwright input during `acquireStage` / `pages.execute`
  is not a human takeover. A real click between programs pauses the run;
  *Return control* resumes it.

## Engine M2 / A14–A23 (PR #7)

V8 DOM bindings, engine-as-default, isolation. Details in
`docs/engine/architecture.md` §0.

- **A14.** WebIDL-generated DOM/Web API bindings (`engine/crates/ve-script/idl`,
  `ve-agent` prelude): `window`/`document`, Node/Element/HTMLElement, events,
  `querySelector*`, `innerHTML`, `getComputedStyle`/`getBoundingClientRect`,
  timers, `fetch`/XHR, `history`/`location`, storage, observers,
  `customElements`, `attachShadow`, `FormData`, `URL`, `console`.
  `scripting_enabled` in `ve-html`. 22 SPA fixtures settle with goldens
  (`cargo test -p ve-api --features v8 --test spa`); interaction-lab runs
  on the engine. rustfmt + clippy `-D warnings` in CI.
- **A15.** `Page::update` uses `restyle_incremental` / `relayout_incremental`.
  `CssCoverage` into `RoutingInfo` (requires-script only at 50% miss +
  geometry). `evaluate`, `dialog`, `waitFor expression`, `javascript:` URLs.
- **A16.** Same-origin/`srcdoc` iframes; cross-origin iframes load as a
  separate document (`contentDocument` is null). Downloads write to a
  caller directory. `dragTo` dispatches HTML5 drag events when scripting.
- **A17.** napi ABI 4: `observeBuf` / `executeBuf` / `screenshotPng`.
  Generation-checked `r<index>` refs; arena slot recycling.
- **A18.** Corpus FP 0 / FN 0 (`engine/conformance/corpus-results.json`).
  SPA hit rate 100% (`spa-results.json`). `engineMode` default `auto`.
  Chromium integration tests pin `VECTOR_ENGINE_MODE=off`.
- **A19.** `pages.capture` paints a software PNG with system fonts;
  `pages.activate` marks engine pages active (headless, no Chromium view).
- **A20.** README benchmark tables vs Chromium, agent-browser, Lightpanda
  and local task-success (`pnpm bench` / `pnpm bench:tasks`).
- **A21.** `ve-host` child process, parent `NetworkBroker`, macOS
  `sandbox_init` / Linux seccomp deny-socket.
- **A22.** CDP bound to `127.0.0.1`, `DevToolsActivePort` and
  `devtools-port` mode `0600`. Agent workers use `persist:vector-agent`.
  Gateway key in `gateway.key` mode `0600` and Electron `safeStorage`.
  Events older than 7 days are pruned (`idx_events_ts`).
- **A23.** `Alt-Svc: h3=` recorded (hyper still speaks HTTP/1.1 and HTTP/2).
  RFC 6455 WebSocket including `wss`. Service Worker `register`; scripts
  whose body starts with `respond:` intercept matching `fetch`.

## M1 — Vector Engine agent path (PRs #3–#6, merged into `m1/integrate`)

Four tracks landed together: engine core (`m1/core`), style/layout, runtime
integration (`m1/runtime`) and the desktop shell (`m1/ui`). What is real vs
deferred is listed in `docs/engine/architecture.md` §0.

**Engine core** (`engine/crates/ve-api`, `ve-agent`, `ve-a11y`, `ve-net`,
`ve-html`, `ve-dom`)

- `ve-api::VectorEngine`: real fetch → parse → cascade → layout → snapshot
  pipeline over `file:` / `data:` / `about:` / inline HTML, `http(s):`
  behind the `http` feature; contexts, cookies, `open`/`observe`/`execute`/
  `screenshot`/`close`, `*_json` twins, and the C ABI in `ve_api::ffi`
  with panics caught at the boundary.
- Observation in the exact `ObservationContent` shape (Compact/Full,
  budgets honored during collection, scope, `changesSince` + `delta`).
- In-engine steps without JavaScript: click activation (link navigation,
  GET/POST form submission, checkbox/radio, label forwarding), fill/type/
  press (chords, Enter submission), check/uncheck/select/scroll, `waitFor`,
  `extract`, `collectScroll`, `upload`; `settle()`; `<meta refresh>`;
  routing classification (`requiresScript` + reason); `VectorErrorCode`
  taxonomy end to end.
- Static fixture corpus `engine/fixtures/static/*.html` with golden Compact
  snapshots (`UPDATE_GOLDEN=1 cargo test -p ve-api --test golden`);
  `engine/tools/perf --gate m1` (observe, open-to-observe, click/fill step,
  10-step program, diff after edit).

**Style and layout** (`ve-style`, `ve-layout`, `engine/tools/wpt-runner`)

- Phase-1 CSS property set with `CssCoverage` counters (unknown/deferred
  declarations) for the router; invalidation maps; `restyle_incremental`
  from the mutation journal; `@media`/`@supports`/`@layer`, custom
  properties, `calc()`.
- Floats and `clear`, inline-block, automatic table layout
  (`colspan`/`rowspan`), overflow and `clip-path: inset()` clip rects,
  `::before`/`::after`, list markers, layout boundaries with
  `relayout_incremental`, deterministic `MetricShaper`.
- Geometry-compared WPT reftest runner (`wpt-runner`) with the growing
  manifest `engine/conformance/m1.txt` (770 tests); regressions exit 1.

**Runtime integration** (`engine/crates/ve-napi`, `packages/browser-driver`,
`apps/runtime`, `packages/contracts`, `packages/mcp`, `tests/`)

- `@vector/engine-native`: napi-rs 3 addon (`ve-napi`, ABI 3), async
  `Engine` class, one engine thread per browsing context, a JSON ferry over
  `ve-api`'s `*_json` facade (software `screenshot`, session history, POST
  forms, response metadata; permissive network policy by default), loader
  with explicit diagnostics (`VECTOR_ENGINE_NATIVE`, cargo target dirs).
- `vector-engine` backend (`packages/browser-driver/src/vector-engine.ts`);
  `Backend` widened to `"vector" | "chrome" | "vector-engine"`;
  `executeProgram` runs a whole program plus its observation in one native
  call.
- Router (`apps/runtime/src/services/router.ts`): persisted needs-chromium
  table (24 h TTL), engine-first open with Chromium reopen on
  `capability_unsupported`, mid-program migration and replay with
  `ProgramResult.fallback` (`repair: true` when ref-targeted steps remain).
- `settings.engineMode: "off" | "auto" | "always"` (default `off`;
  `VECTOR_ENGINE_MODE` override, `VECTOR_ENGINE=0` skips loading);
  `pages.open` results carry `routeReason`; `runtime.describe` → `engine`
  and `features.routeFallback`; engine session in `sessions.list`.
- `pnpm bench --backend chrome|vector-engine|both` (side-by-side table,
  reports in `tests/benchmarks/reports/`); `scripts/chromium.mjs` finds a
  headless Chromium (`VECTOR_BROWSER_PATH` or a Playwright
  `chromium_headless_shell`); engine integration test
  (`tests/integration/vector-engine.test.ts`, skipped without the addon);
  router, driver and routing unit tests; MCP `vector_page_open` accepts
  `backend: vector-engine`.
- Measured (records fixture, p50, 10 repeats, Chromium → engine): open
  72.8 → 2.1 ms, observe full 13.7 → 1.2 ms, observe compact 10.8 → 1.5 ms,
  click by ref 71.9 → 2.3 ms, fill by ref 23.7 → 0.8 ms, navigate+observe
  56.5 → 2.4 ms, act+observe 13.1 → 2.0 ms; full observation 9,499 vs
  13,148 bytes (the engine surfaces more).

**Desktop shell** (`apps/desktop/renderer`, `docs/ui/`)

- Redesigned renderer: sidebar with spaces, pinned tiles and a virtualized
  tab list; one command bar with intent detection (URL / search / agent
  prompt); inset stage card with load progress and an engine badge
  (Chromium / Your Chrome / Vector Engine, `routeReason` hover card);
  resizable agent rail with run and set panels; tokens-only styling
  (`tokens.css`), light/dark, reduced motion, narrow layouts.
- Settings control for `engineMode`; mock bridge (`pnpm -C apps/desktop
  dev:mock`) with scenarios and `docs/ui/screenshots/` (15 reference states,
  `apps/desktop/scripts/screenshots.mjs`); renderer unit tests.

Gate results and the outstanding list are in `docs/engine/architecture.md` §0 (Status).

## PR #2 — Vector Engine M0: agent-first browser engine foundation (Rust)

- `engine/` Cargo workspace with twelve crates: generational arena DOM with
  mutation journal and dirty flags (`ve-dom`), html5ever bridge with
  declarative shadow DOM (`ve-html`), own cascade with a macro-generated
  property table, custom properties, media queries and UA sheet
  (`ve-style`), block/inline/flex/grid (taffy) and positioned layout with
  stacking contexts and hit testing (`ve-layout`), ARIA/HTML-AAM roles,
  accname and Compact/Full snapshots with journal-driven diffs (`ve-a11y`).
- `JsVm` trait with a QuickJS backend (feature) and a virtual-time event
  loop (`ve-script`); network contexts with RFC 6265 cookies, an RFC 9111
  cache subset and hyper/rustls transport (feature) (`ve-net`); display
  list, compositor, software renderer and vello backend (feature)
  (`ve-gfx`); in-engine Program/Step execution (`ve-agent`); Rust facade,
  C ABI and napi placeholder (`ve-api`, `ve-napi`).
- `perf` and `wpt-runner` tool skeletons. Default build pure Rust; fmt,
  clippy `-D warnings` (pedantic) and 68 tests green. The GitHub Actions
  workflow mentioned in the PR was never committed.

## PR #1 — Audit + runtime speed/security pass; Vector Engine architecture

- `docs/audit/` (speed, architecture/security, UI) and
  `docs/engine/architecture.md` (agent-first engine design, M0–M5).
- Browser driver: unique-path ref resolution before role/text search,
  `collectScroll` end-of-scroller fix, quiescence readiness (`waitFor
  settled`, bounded post-navigation wait), connection tracking with drop
  detection and lazy reconnect, response-body capture limited to
  xhr/fetch data.
- API/MCP: compact observations (`format: "compact"`), act-and-observe
  (`pages.execute … returnObservation`), cached runtime descriptor,
  corrected tool docs.
- Runtime: model-authored plans cannot contain `evaluate`/`expression`;
  page text fenced in prompts; owner-only token file; bearer-only HTTP
  auth; 2 MB body cap; WS error ids; real set-run cancel/pause/concurrency;
  model-call timeouts and run deadlines; structured-output fallback;
  `programs.run` parameters; fault handlers; atomic `saveTabs`; strict
  migrations; async batched persistence.
- Desktop: sandboxed renderer, deny-by-default permissions, http(s)-only
  `openExternal`, navigation guard. `pnpm bench` end-to-end harness. Full
  suite with headless Chromium: 187 passed, 1 skipped.
