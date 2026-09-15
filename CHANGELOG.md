# Changelog

Newest first. PR numbers refer to the GitHub repository; branch names are
the integration tracks that were merged.

## Shell + planner defaults (main)

**Desktop** (`apps/desktop/renderer`, `docs/ui/shell.md`)

- Arc-style sidebar: spaces, five pin tiles, 📁 tab folders (indent, group
  hover, animated open/close), unfiled tabs under New Tab.
- Command bar lives in the sidebar when expanded; the top toolbar shows only
  when the sidebar is hidden. Start page has search/chat plus weather.
- Inter Variable + Lucide; charcoal surfaces (dark chrome `#1f1f1f`); no
  purple agent tint. Favicons try the page icon, then DuckDuckGo, then
  Google s2, then a letter.

**Runtime** (`apps/runtime`)

- Planner default `alibaba/qwen3.8-27b` via Vercel AI Gateway, provider pin
  Cerebras (`VECTOR_GATEWAY_ONLY`, default `cerebras`).
- Vision fallback runs only when `visionModel` / `VECTOR_VISION_MODEL` is set
  (Cerebras cannot take image parts).
- Agent loop still observe → compact refs → typed program; MCP/CLI share the
  same runtime.

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
