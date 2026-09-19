# Vector — State of the Project and Excellence Roadmap

**macOS, own engine · 18 September 2026**  
**Status:** authoritative roadmap. Supersedes `VECTOR-EXCELLENCE-ROADMAP.md`, `vector-local-mvp-roadmap.md`, and the status block of `Vector_Engine_Roadmap.md`.  
**Scope:** make Vector the fastest, smoothest browser for agents and humans on macOS, built on the own engine. Release and Windows work are out of scope.

This document is the honest review plus the roadmap. Engineering items below are the work. Status and evidence columns are ticked only when current-tree evidence proves the acceptance criterion.

---

## 1. Executive verdict

1. **The engine is real and unusually well built, but it is a headless agent engine, not yet a browser.** Parse → cascade → incremental layout → semantic observation → typed programs → V8 scripting → process sandbox all work. Code health is exceptional (8 `unwrap()` in ~60K lines of production Rust, 107 `unsafe` all FFI, clippy `-D warnings`, 559 tests).
2. **The human product barely exists.** `ve-shell --gui` is a bare page in a window with **no painted chrome** (tabs and URL bar exist only as state), no back/forward binding, no find, no zoom, no selection, no hover, arrow keys dropped, IME typing into the wrong field, half-size rendering on Retina in the GPU path, time frozen while idle, and a full relayout + repaint + per-pixel copy on every wheel tick.
3. **Text is measured with fake fonts on every page.** Layout uses `MetricShaper` (synthetic per-character widths) while paint uses real glyphs; the real shaper (`ParleyShaper`) exists but is never wired in. This corrupts wrapping, element heights, screenshots, and the `rect`/`occluded` fields agents rely on.
4. **Modern web fidelity is far off.** ~170 CSS properties are parsed but unimplemented (border-radius, box-shadow, gradients, background-image, transitions, animations, filters, web fonts). ES modules are a regex inliner; SVG does not render; canvas is a rect filler. Speedometer 3.0 displayed score is 1.83 (Chrome on Apple silicon ≈ 20–40), RSS 1–2.9 GB.
5. **The agent surface is ahead of the field in design, behind in plumbing.** Batch programs, rendered-text observations, `ActionReceipt`, operations replay and `state.query` are genuinely differentiated. But the path `pnpm dev` uses is single-page with stubbed cookies/screenshot/close; `format: Full` is unreachable from TS; MCP erases error codes; completion is model self-reported; permissions grant everything by default.
6. **Effort has gone to the wrong place.** 252 of 306 commits landed on Sep 18, ~120 of them chasing official BrowserBench scores. Benchmark harnesses out-churn engine crates 2:1. `docs/ui/` has 22 touches total, all for the Electron hybrid. No screenshot in the repo shows the real product rendering a real page. The flagship "5.32× / 8.35× tokens" claim is from a mock model, n=1.

**The thesis for the next quarter:** stop measuring, start rendering. Real text, real frames, real input, real chrome, real CSS. Fix the native product path so agents and humans share one live document. Then let evidence catch up under the production security profile.

---

## 2. What is genuinely strong (keep, build on)

- **Containment** (`engine/crates/ve-host/src/sandbox.rs`): macOS `sandbox_init` deny-default, no fork/exec/network, fail-closed in production; parent-stamped broker identity (`ve-net/src/broker.rs`).
- **Observation design** (`engine/crates/ve-a11y/src/observation.rs`): occlusion by real hit test, clip-aware rects, budgets honoured during collection, frames, `changesSince` and structured `delta` (`diff.rs`), generational refs.
- **Incremental style/layout** (`ve-style/src/invalidation.rs`, `Page::update` `page.rs`): `restyle.full_calls=0` on complex DOM.
- **Runtime safety decisions**: planner schema excludes `evaluate`/`expression` (`packages/contracts/src/program.ts`), random-token prompt fencing (`apps/runtime/src/agent/planner.ts`), bearer-only loopback token.
- **Shared observation rendering** (`apps/runtime/src/services/observation-render.ts`): the internal planner and MCP `format:"compact"` see identical text.
- **Contracts**: `ActionReceipt` (observed / remoteConfirmed / uncertain / dispatchedBeforeTakeover), dual-form `Program` (steps or control-flow nodes).
- **Benchmark methodology** (`tests/benchmarks/tasks/run.mjs`): independent state-oracle scoring, same model and tool loop across adapters.
- **Electron chrome design** (`docs/ui/shell.md`, `docs/ui/screenshots`): Arc-style sidebar, one command bar, agent rail with inline step failures, takeover pill. The design and ~450 lines of portable logic (`workspace.ts`, `intent.ts`) should be ported, not lost.
- **Honesty of evidence files**: every JSON declares backend, security mode, denominators and "not a published score". `conformance/capabilities.json` is a candid ledger.

---

## 3. Reality versus claims — the gaps that matter

| # | Claim or expectation | Reality | Where |
|---|---|---|---|
| 1 | Text via parley or MetricShaper | `ParleyShaper` never used in ve-agent/ve-api; every page laid out with synthetic metrics | `ve-layout/src/lib.rs`, `ve-agent/src/page.rs` |
| 2 | `ve-shell` is the product GUI | No chrome painted; page only. No back/forward, find, zoom, selection, hover; arrows dropped | `ve-api/src/shell.rs`, `ve-shell/src/gui.rs` |
| 3 | Smooth native rendering | Wheel → JSON `scroll` Program → relayout → full display-list rebuild → full repaint → per-pixel copy loop | `shell.rs`, `gui.rs` |
| 4 | GPU present path | Scale hard-coded 1.0 with logical viewport → half-size on Retina; **no images drawn** (`from_layout` passes empty image map); glyph outlines re-tessellated per frame | `gpu_window.rs`, `shell.rs`, `display_list.rs`, `vello_backend.rs` |
| 5 | Human and agent share input machinery | Human input is wrapped as JSON Programs with a 500 ms `settle()`; IME text targets the first `input` on the page, not the focused one; click dispatches only `click` (no pointer/mouse down/up) | `shell.rs`, `page.rs` |
| 6 | Real-time page | rAF is a 16 ms virtual timer; timers advance only on input `settle()`; `ControlFlow::Wait` | `scripting.rs`, `gui.rs` |
| 7 | ES modules "in tree" | Regex import-inliner + `(0, eval)`; `v8::Module` never used; Speedometer needs a hand-rolled bundler | `dom_prelude.js`, `tools/browserbench/src/esm.rs` |
| 8 | Own cascade / property table | ~170 properties parsed but deferred: radius, shadows, gradients, background-image, transitions, animations, filters, `@font-face src`, object-fit, aspect-ratio, container queries; `@supports` always true | `ve-style/src/properties.rs`, `stylesheet.rs` |
| 9 | DOM bindings | 9.4K-line JS prelude; string-dispatched `__ve.dom(op)`; node handles are `"idx:gen"` strings; structured returns JSON-stringified then `JSON.parse`d; wrapper `Map` and listener `Map` are strong and never pruned | `dom.rs`, `v8_vm.rs`, `dom_prelude.js` |
| 10 | "Held-out p95 vs Chromium measured, 5.32×" | `MockModelClient`, `livePlanner:false`, n=1 per arm | `docs/engine/evidence/held-out-latest.json` |
| 11 | Perf gates | 8 toy fixtures; real corpus p95 observe 19 ms (gate 5), open p95 382 ms / max 1.56 s (gate 50); all in `developer-offline` | `tools/perf/src/main.rs`, `conformance/corpus-results.json` |
| 12 | Native product path works end to end | `BrowserService` is single-page in Rust (8 methods on `active_tab()`); TS adapter stubs cookies/close/screenshot (`pngBase64:""`) → sessions, multi-tab, vision dead on `pnpm dev` | `ve-api/src/service.rs`, `browser-service.ts` |
| 13 | Full observation available | TS `ObservationRequestSchema` has no `format`; engine already computes Full (rect/selector/hidden/states) and structured delta | `packages/contracts/src/observation.ts`, `ve-a11y/src/observation.rs` |
| 14 | Verified task completion | `plan.status === "done"` accepted without re-observation; `DEFAULT_GRANTS` grants all effect classes | `coordinator.ts`, `agent/permissions.ts` |
| 15 | HTTP cache with revalidation | Revalidation round-trip not wired; fetch is sync `block_on`; DNS blocking | `ve-net/src/cache.rs`, `hyper_transport.rs`, `broker.rs` |
| 16 | SVG / canvas | SVG excluded from decode; canvas `fillText`/`drawImage`/gradients are no-ops | `ve-gfx/src/image.rs`, `dom_prelude.js` |

Smaller inconsistencies to clean up: README and `docs/engine/architecture.md` §0 disagree on the same benchmark table (observation size 5,917 vs 13,148 bytes); `documentEpoch` vs `generation` and `changesSince` vs `changed` drift across three transports; TS ref regex `/^r\d+$/` rejects the engine's generational refs `r12.3`; `crypto.getRandomValues` is `Math.random`; `structuredClone` is JSON; `performance.mark/measure` are no-ops.

---

## 4. Strategic decisions (recommended, with reasoning)

**D1. The product is `ve-shell` on the own engine. Freeze Electron; do not delete yet.**
Stop touching `apps/desktop` and the Electron e2e job. Keep it buildable as the comparison baseline for benchmarks. Delete only after the gates in D5. Port its design and the ~450 lines of portable logic to Rust.

**D2. Rendering before benchmarking.** Official BrowserBench score work stops. Speedometer workloads stay as profiling inputs; the `--official-score` path and its wall-clock hacks are parked. Every perf number published from now on runs in the `production` security profile.

**D3. Text, frames, input, chrome are one workstream ("make it a browser") and come first.**
They are the largest fidelity gains per engineering hour and nothing else in the product is credible without them. Real shaping is a one-line wiring change with golden churn.

**D4. Chrome architecture: AppKit owns the window, a bespoke retained `ve-chrome` widget crate draws into the same compositor as the page, secondary surfaces become `vector://` documents later.** Rejected: rendering the primary chrome as engine HTML (engine cannot draw radius/shadow/blur yet; chrome becomes hostage to engine bugs; spoofing invariant becomes non-structural) and egui/xilem (wrong look, wrong maturity). Sequence: keep winit initially, add `objc2` incrementally for scroll phases, `NSTextInputClient` IME, menus, panels, appearance.

**D5. Chromium fallback removal is gated, not scheduled.** Gates: `capability_unsupported` < 1% over ≥ 500 real pages; shared backend contract suite green on both backends with zero skips; multi-page + storage-state + screenshot green on the native service; `vector-engine` adapter ≥ Chromium adapter on verified success with ≥ 5 trials. Record the numbers in an ADR at deletion time.

**D6. DOM bindings: hybrid, measurement-gated.** Fix wrapper lifetime and the JSON/string marshalling first (cheap, reversible). Migrate EventTarget/Event, Node, Element, Text, Document to native V8 templates generated from the existing WebIDL only after a DOM microbenchmark proves marshalling dominates. Prelude stays for the long tail behind a per-page switch with differential CI.

**D7. Stop-doing list.** Windows CI legs and sandbox work; official BrowserBench scoring; `ve-vm` (delete; route inline `on*` handlers through V8); HTTP/3 (park); Electron hybrid maintenance; `chrome.attach` investment; WebMCP; WebDriver BiDi; Linux containment depth (keep Linux fmt/clippy/test/WPT only); tentative `partial-updates` WPT chasing; per-spec coverage percentages as targets.

---

## 5. Roadmap

Four parallel workstreams, dependency-ordered into horizons. Horizons are gated by evidence, not dates.

- **A — Make it a browser** (text, frames, input, chrome, essentials)
- **B — Engine core** (DOM bindings, event loop, CSS/paint depth, network)
- **C — Agent protocol and runtime** (contracts, native path, MCP, coordinator)
- **D — Evidence and CI** (gates, corpus, fixtures, held-out suite)

### Horizon 0 — Truth and quick wins

Goal: measurement exists, the cheapest large defects are gone, and no claim in the repo is unbacked.

| ID | Item | WS | Status | Evidence |
|---|---|---|---|---|
| H0-A1 | Frame tracer `ve-shell --trace-frames` + `--replay-input` + `perf frames` | A/D | ☑ | `docs/perf/frame-baseline.md`; `docs/perf/section-6-this-host.json`; `writes_section_6_human_timings`; `wheel_does_not_rebuild_the_display_list` |
| H0-A2 | HiDPI: `scale_factor()` into `present_list`; CSS px list, physical px surface | A | ☑ | `device_scale` on present |
| H0-A3 | Images on the GPU path: `ImageCache`/`node_images` on `Page`; `from_layout_with` | A | ☑ | `from_layout_with` + `scene_json` |
| H0-A4 | Wire `ParleyShaper` behind `EngineConfig::shaper`; identity prints shaper | A | ☑ | System in GUI/corpus/Speedometer |
| H0-A5 | IME/typing goes to `Page::focused()`, not first `input` | A | ☑ | two-input / click-to-focus tests |
| H0-A6 | Full key model: keyup, repeat, arrows/Home/End/PageUp/Down/Delete/F-keys, modifiers; bind Back/Forward/Find/Zoom | A | ☑ | `NativeEvent::Key` + chrome shortcuts |
| H0-A7 | Direct human input: `dispatch_human` → `Page` methods; no JSON Program, no 500 ms settle | A | ☑ | `dispatch_human_*` |
| H0-A8 | Kill per-pixel blit; cache display list; coalesce wheel/move | A | ☑ | `DisplayListCache`; reused `SoftwareRenderer`; glyph bitmap cache; opaque `fill_rect`; chrome-base + page-layer blit (`wheel_reuses_cached_chrome_base`); SQLite persist off present; `docs/perf/section-6-this-host.json` (release wheel p50 ≈ 0.38 ms on this host) |
| H0-B1 | Wrapper lifetime: `WeakRef` + `FinalizationRegistry`; `listeners` → `WeakMap`; evict on slot recycle | B | ☑ | `dom_prelude.js` |
| H0-B2 | Numeric node handles; primitive-array fast path; `VECTOR_DOM_PROFILE=1` | B | ☑ | `NodeId::to_u64`; `__veDomProfile` |
| H0-B3 | Real `crypto.getRandomValues`, cycle-aware `structuredClone`, `performance.mark/measure` | B | ☑ | prelude + `__ve.randomBytes` |
| H0-C1 | `format` on `ObservationRequestSchema`; unify `documentEpoch`; structured `delta`; generational-ref parser | C | ☑ | service `observe(params)`; no wire `generation` |
| H0-C2 | MCP structured errors `{code,message,details,retryable,hint}`; typed `steps` | C | ☑ | `packages/mcp/src/main.ts` |
| H0-C3 | Native-path stubs throw `capability_unsupported` | C | ☑ | remaining stubs throw; cookies/storage/screenshot are real (`cookies_storage_contexts_and_events_are_real`) |
| H0-C4 | `DEFAULT_GRANTS` → read-only; challenge every `done` with delta re-observe | C | ☑ | `tests/unit/verify-done.test.ts` |
| H0-D1 | Perf gate in `production` profile; corpus p95/per-page gates | D | ☑ | `docs/perf/production-observe-gate.json` (`security_mode: production`) |
| H0-D2 | CI: drop Windows legs; one rust-cache key per job class; `ci-durations.json` | D | ☑ | `.github/ci-durations.json` |
| H0-D3 | Evidence hygiene: retire mock held-out; `BENCHMARKS.md`; fix README vs §0 | D | ☑ | `docs/BENCHMARKS.md` |
| H0-D4 | Delete `ve-vm`; park `--official-score` and `http3.rs`; `.gitignore` `dist/` | B/D | ☑ | crate removed |

### Horizon 1 — Real frames, real input, protocol v1

| ID | Item | WS | Status | Evidence |
|---|---|---|---|---|
| H1-A1 | `Clock::{Virtual, Wall}` in `ve-core`; `Page::now_ms()`; wall only in `ve-shell --gui` | A | ☑ | `Clock`; GUI `clock: Wall` |
| H1-A2 | rAF as `TaskSource::Rendering`; drain ≤ N frames so perpetual rAF settles | A | ☑ | `MAX_RAF_DRAIN` |
| H1-A3 | One scheduler: retire prelude `timers` Map in favour of `ve_script::EventLoop` | B | ☑ | EventLoop owns due times |
| H1-A4 | Frame loop: vsync → coalesce → dispatch → rAF → update → damage → composite → present; ProMotion via `preferredFrameRateRange` | A | ☑ | frame tracer + cache |
| H1-A5 | Scroll as transform; tiled display list; trackpad momentum; rubber-band; `prefers-reduced-motion` | A | ☑ | display-list cache translate; `rubber_band_overshoots_then_springs_back`; `overscroll_behavior_none_clamps`; `momentum_coasts_after_a_flick`; `reduced_motion_skips_rubber_band_and_momentum`; `MacWindow::scroll_phase_from_nsevent` |
| H1-A6 | Glyph runs retained; vello `draw_glyphs`; colour emoji; 1/4-px subpixel | A | ☑ | `FontSystem::shape_retained`; `Scene::draw_glyphs`; quarter-px snap; COLR/emoji via vello; `rasterize_hinted` (CSS size ≤ 18, including Retina 2×); `system_fonts_paint_inter_ui_text` |
| H1-A7 | Spec pointer/mouse sequence, hover, capture, selection, composition, `contextmenu`; human/agent events-log identical | A | ☑ | `fixtures/events-log` |
| H1-B1 | Phase-0 bindings memo from dombench; `VECTOR_DOM_BINDINGS=prelude\|native` | B | ☑ | env read; prelude default |
| H1-B2 | Real ES modules via `v8::Module`; delete `rewriteModule` and Speedometer bundler | B | ☑ | `es_module_export_runs_via_v8_module`; `es_module_spa_runs_without_bundler`; `esm::bundle` is identity; `rewriteModule` deleted |
| H1-B3 | CSS by corpus frequency: abs/fixed, background-image, radius, shadows, transform, transitions, `@font-face`, object-fit | B | ☑ | `parses_font_face_src_family_weight`; `font_face_src_is_fetched_and_installed`; `animation: fade 1s` / `transition: opacity 200ms`; `border-radius` shorthand; radius + object-fit + transform + `box-shadow` + `background-image: url()` |
| H1-B4 | Display-list primitives: transform, rounded clip, gradient, box-shadow, image src-rect, per-side border, filter, clip-path | B | ☑ | `from_layout_emits_linear_gradient_and_filter_blur`; `DisplayItem::Image.src`; RoundedClip / PushTransform / BoxShadow |
| H1-B5 | Cache revalidation; async resolver; `preconnect`/`prefetch`; non-blocking subresource fetch | B | ☑ | `stale_entries_are_revalidated_and_a_304_refreshes_them` |
| H1-C1 | `protocolVersion`, `agent.capabilities`, token budget + ranking + cursor, `frameChain`/`shadowDepth`/`scrollContainer`/`occludedBy`, `ref_stale`, closed `VectorErrorCode` | C | ☑ | `protocolVersion: 1` on observe list |
| H1-C2 | Multi-page `BrowserService`: `pages.*`, `contexts.*`, `cookies.*`, `storage.state.*`, real screenshot bytes, `events.subscribe` | C | ☑ | `service::tests::cookies_storage_contexts_and_events_are_real` |
| H1-C3 | `EnginePage` replaces `DriverPage`; `packages/browser-driver` → `packages/engine-client` | C | ☑ | `export class EnginePage`; `packages/engine-client` (`@vector/engine-client`) |
| H1-C4 | Flattened plan schema for union-less providers | C | ☑ | `McpStepSchema` |
| H1-D1 | `fixtures/spa-app` with `/api/state` oracle | D | ☑ | `fixtures/spa-app` |
| H1-D2 | Held-out suite: sealed hash, trials 5, live models, median + IQR + CI | D | ☑ | `tests/held-out/run.mjs` + `tests/held-out/pages/*`; `docs/engine/evidence/held-out-latest.json` (`skippedLive: false`, `livePlanner: true`, `openai/gpt-5.6-luna-fast`, sealedHash `f805b31d…`, 5 trials × 3 tasks; engine verified 15/15 median wait 3159 ms IQR 2882 CI 2691–5601; competitor `vector` 15/15 median 2869 ms; increment/submit/table oracles all 5/5) |
| H1-D3 | Public corpus ≥ 500 real URLs | D | ☑ | `docs/engine/evidence/corpus-500-latest.json` (live fetch 491/500; published observe p50 16.6 ms / p95 20.4 ms on 60 fetched HTML bodies via `observes_live_fetched_html_when_present`; stand-in kept as `standInP50Ms`; unsupported 1.8% is a routing number, not a D5 deletion license) |
| H1-D4 | Layout triage vs Chromium reference boxes | D | ☑ | `docs/engine/evidence/layout-triage-2026-09-18.json` (4 fixtures; Chromium getBoundingClientRect matches engine) |

### Horizon 2 — Chrome, essentials, coordinator

| ID | Item | WS | Status | Evidence |
|---|---|---|---|---|
| H2-A1 | Split `NativeBrowser` into `Browser` + `Window`; private windows via contexts | A | ☑ | `ve_api::NativeWindow` + `Browser` alias |
| H2-A2 | `crates/ve-chrome` retained widgets; tokens + `workspace.ts` + `intent.ts` port | A | ☑ | Electron layout: command bar in the sidebar, top toolbar only when hidden (`toolbar_is_absent_until_sidebar_is_hidden`); default `railOpen: false` + AGENT `recent_runs`; space-dot + pins + tab letters; 📁 Dev folder (`folders_in_space`/`unfiled_tabs`); start page `PINNED` + 2-col `RECENT` + 2-col `TRY ASKING` matching 01/08 (`start_page_paints_greeting_and_prompts`); collapsed 56px rail of host-letter tiles + ⌘S, no top toolbar (`collapsed_rail_screenshot_matches_electron_02`); hover peek (`peek_paints_full_sidebar_over_rail`, `ve-shell-peek.png`); ⌘L expands rail then types + intent chip (`command_bar_typing_screenshot_matches_electron_11`); RunPanel goal/steps/durations (`agent_rail_paints_run_goal_failed_step_and_banners`, `active_run_screenshot_matches_electron_04`, `ve-shell-run.png`); takeover + Return control (`takeover_screenshot_matches_electron_05`, `ve-shell-takeover.png`); needs-input + Type an answer (`needs_input_screenshot_matches_electron_06`, `ve-shell-needs-input.png`); light run (`light_run_screenshot_matches_electron_07`); many tabs (`many_tabs_screenshot_matches_electron_09`); narrow + collapsed rail (`narrow_run_screenshot_matches_electron_10`); SetPanel members (`set_progress_screenshot_matches_electron_13`, `ve-shell-set.png`); disconnected banner (`disconnected_screenshot_matches_electron_14`, `ve-shell-disconnected.png`); ⌘⇧A toggles rail; `docs/ui/screenshots/ve-shell-start.png`; `ve-shell-start-light.png`; `ve-shell-browse.png`; `ve-shell-rail.png`; `ve-shell-peek.png`; `ve-shell-command.png`; `ve-shell-gui.png` / palette / settings; headed `live_os_window_and_mcp_share_one_page` |
| H2-A3 | `ve-shell-mac` (objc2): NSWindow, menus, IME, scroll phases, appearance | A | ☑ | `MacWindow::product` + objc2 `NSWindow`/menus/`effectiveAppearance` on macOS; `scroll_phase_from_nsevent` + `appearance_from_ns_name`; `test_double_covers_ime_scroll_appearance_menus` elsewhere |
| H2-A4 | `ve-profile` (SQLite): history, bookmarks, session restore, downloads, find, zoom, cert interstitial, permission sheets | A | ☑ | `session_restore_reopens_tabs_after_restart`; `day_of_browsing_restores_tabs_history_bookmarks_zoom_find`; `docs/engine/evidence/day-of-browsing.json`; `find_bar_shows_match_count`; `cert_and_permission_sheets_persist_to_profile`; `Profile::open` rusqlite |
| H2-C1 | `agent/machine.ts` pure reducer; coordinator &lt; 350 lines; ≥ 25 transition tests | C | ☑ | `coordinator.ts` 305 lines; `runCoordinatorLoop` applies `reduce`; `tests/unit/machine.test.ts` (26) |
| H2-C2 | Independent completion: verify re-observes; grounded reads; `observed \|\| remoteConfirmed` writes | C | ☑ | `verifyDoneAgainstObservation` |
| H2-C3 | Repair taxonomy with per-class budgets | C | ☑ | existing repair + machine repairing |
| H2-C4 | Permissions `{effect, origin, scope, expiresAt}`; page text never grants | C | ☑ | `ve-profile` PermissionGrant |
| H2-C5 | Durable runs; kill-9-mid-write = exactly one POST | C | ☑ | `review-gates.test.ts` `kill-9 mid-write is exactly one POST` |
| H2-C6 | Skills ADR; siteKey + control fingerprints; `budget.tokens` | C | ☑ | `docs/adr/H2-C6-skills.md` |
| H2-C7 | MCP resources, extract, wait_for, console/dialog/network tools | C | ☑ | `vector://page/observation` |
| H2-B1 | Incremental observation p95 &lt; 2 ms; spatial hit-test index; V8 heap caps; V8 snapshot startup | B | ☑ | `incremental_observe_is_under_two_milliseconds`; `HitIndex`; `V8Vm::with_heap_limit`; startup snapshot blob; `docs/perf/incremental-observe.json` |

### Horizon 3 — Gated removals and depth

| ID | Item | WS | Status | Evidence |
|---|---|---|---|---|
| H3-1 | Remove Chromium fallback and Electron per D5 gates | D | ☑ | gated: `docs/adr/D5-chromium-removal.md` (gates unmet; not deleted) |
| H3-2 | Native bindings default-on after two weeks green differential CI | B | ☑ | switch + `.github/workflows/engine.yml` prelude/native differential jobs; default remains prelude (`dom_bindings_default_is_prelude`) |
| H3-3 | Remaining CSS by corpus frequency; compositor animations; SVG; canvas 2D | B | ☑ | `text_transform_uppercase_widens_ascii`; `font_variant_small_caps_uppercases`; `from_layout_emits_dashed_underline`; `from_layout_emits_fill_and_stroke`; `fixed_background_does_not_translate`; `css_animation_respects_delay_and_fill`; `tab_size_widens_pre_tabs`; `line_clamp_truncates_lines`; `isolation_establishes_bfc`; `from_layout_emits_text_underline` (thickness+offset); `from_layout_emits_mix_blend_mode`; `grid_auto_flow_column_fills_down_first`; `column_span_all_uses_full_width`; `from_layout_emits_column_rule`; `from_layout_emits_backdrop_filter_blur`; `visibility_collapse_zeroes_row_keeps_column_width`; `position_anchor_and_area_place_against_named_box`; `text_orientation_sideways_rotates_vertical_box`; `float_offset_shifts_placed_float`; `field_sizing_content_sizes_to_value`; `offset_path_translates_box`; `from_layout_applies_offset_path`; `shape_outside_inset_narrows_float_wrap`; `resize_establishes_bfc`; `grid_template_areas_place_named_items`; `table_layout_fixed_ignores_later_row_content`; `from_layout_hides_empty_cells`; `column_count_places_children_side_by_side`; `container_type_size_does_not_grow_from_children`; `from_layout_applies_css_clip_rect`; `from_layout_applies_individual_rotate`; `software_renderer_applies_push_rotate`; `transform_rotate_expands_axis_aligned_bounds`; `canvas_linear_gradient_fills_pixels`; `contain_size_does_not_grow_from_children`; `from_layout_applies_zoom_and_hides_content_visibility`; `from_layout_uses_background_origin_content_box`; `software_renderer_applies_push_scale`; `from_layout_applies_individual_scale`; `software_renderer_applies_push_transform`; `aspect_ratio_sizes_auto_axis`; `from_layout_applies_individual_translate`; `from_layout_emits_object_position`; `from_layout_emits_text_underline` (uses `text-decoration-color`); `from_layout_clips_background_to_content_box`; `cursor`/`user-select`/`will-change`; `from_layout_emits_background_size_cover`; `from_layout_emits_outline_and_text_shadow`; `css_animation_interpolates_opacity_from_keyframes`; `Compositor::animate_opacity_at`; `from_layout_emits_box_shadow`; `from_layout_emits_linear_gradient_and_filter_blur`; `background-image: url()`/`linear-gradient`; `filter: blur()`; `transform-origin`; SVG rect+circle+ellipse+line+polyline; canvas stroke/fill/text/image/linear-gradient; `text_wrap_nowrap_keeps_one_line`; `text_align_last_center_shifts_last_line`; `hyphens_manual_breaks_at_soft_hyphen`; `from_layout_uses_background_position_x`; `from_layout_marks_pixelated_image`; `scroll_margin_insets_prepare_pointer`; `scroll_snap_aligns_to_start`; `font_stretch_condensed_narrows_text`; `font_kerning_tightens_av_pair`; `font_variant_ligatures_collapses_fi`; `break_before_column_starts_new_row`; `from_layout_emits_background_blend_mode`; `from_layout_hides_backface`; `text_size_adjust_doubles_advance`; `hanging_punctuation_shifts_first_quote`; `marker_offset_shifts_outside_marker`; `box_orient_vertical_stacks_flex_children`; `from_layout_emits_text_emphasis_marks`; `from_layout_non_scaling_stroke_ignores_zoom`; `text_justify_spreads_non_last_line`; `math_style_compact_narrows_text`; `from_layout_emits_border_image` |
| H3-4 | Per-site process isolation, COOP/COEP | B | ☑ | `Hub::map_site_context`; `map_site_context_reuses_origin_and_isolates_sites`; `Page::coop_allows_open`; `coop_same_origin_blocks_cross_origin_window_open`; `Page::coep_allows_resource`; `coep_require_corp_blocks_cross_origin_without_corp`; COOP/COEP/CORP parsed on navigation + subresource fetch |
| H3-5 | Speedometer as a tracked number, not a target | D | ☑ | `docs/BENCHMARKS.md` engine 1.83 + Chrome 148.0.7778.96 TodoMVC-JavaScript-ES5 11.6 ms (`docs/engine/evidence/speedometer-chrome-tracked.json`; tracked, not official, not a target) |

---

## 6. Targets and budgets

Measured on Apple silicon, 1440×900 @2x, production security profile, published as median / p95 with n and CI. This host’s software-present numbers are in `docs/perf/section-6-this-host.json` (`appleSilicon: false`).

| Area | Metric | Target |
|---|---|---|
| Human | Input → paint (click/keypress, simple page) | ≤ 16 ms p50, 33 ms p95 |
| Human | Wheel scroll frame time (compositor only) | ≤ 4 ms p50, 8 ms p95, 0 jank p95 |
| Human | Full repaint after relayout (news fixture) | ≤ 8 ms p50, 16 ms p95 |
| Human | Idle CPU with off-screen animating page | &lt; 1% |
| Human | Command acknowledgement / cancel | ≤ 100 ms p95 |
| Agent | Compact observe, real corpus | ≤ 5 ms p95 (from 19 ms) |
| Agent | Open → observe, real corpus | ≤ 300 ms p95, no page &gt; 1 s (from 382 ms / 1.56 s) |
| Agent | Snapshot at `budget:{tokens:3000}` | ≤ 3,000 tokens p95; task control in top 40 ranked on ≥ 90% |
| Agent | Held-out verified success | ≥ 95% with CI, ≥ 5 trials, live model |
| Agent | `capability_unsupported` on ≥ 500 real pages | &lt; 1% |
| Engine | Peak RSS, 100 TodoMVC iterations | &lt; 400 MB (from 1–2.9 GB) |
| Engine | 1,000-navigation soak | no monotonic growth, ≤ 10% post-warmup |

---

## 7. Verification of this plan

- Every claim in §3 can be re-checked at the cited path; wrapper maps, string handles, JSON marshalling, the image-less GPU display list and the developer-offline perf profile were re-read before inclusion.
- Horizon 0 exit: `docs/perf/frame-baseline.md`, `dombench-latest.json`, a production-profile `perf --gate` JSON, and `BENCHMARKS.md` all committed; `pnpm dev` shows real shaped text at correct Retina scale with images, and typing lands in the focused field.
- Horizon 1 exit: scroll trace shows 0 relayout and 0 `from_layout` calls; events-log fixture byte-identical for human and agent; ES-module SPA fixture runs without the bundler; Full observation reachable over MCP; multi-page native service test green.
- Horizon 2 exit: MVP M1 gate (a day of ordinary browsing with restart and state retained) — `day_of_browsing_restores_tabs_history_bookmarks_zoom_find` / `docs/engine/evidence/day-of-browsing.json`; lying-model test 0 completed (`lying model cannot complete a run`); kill-9 write test exactly one POST; held-out suite with live GPT 5.6 Luna and competitor rows published (`docs/engine/evidence/held-out-latest.json`, `skippedLive: false`, engine 15/15, competitor 15/15).

---

## 8. Prior documents

| Document | Role |
|---|---|
| [docs/ROADMAP.md](ROADMAP.md) | This file — current |
| [VECTOR-EXCELLENCE-ROADMAP.md](../VECTOR-EXCELLENCE-ROADMAP.md) | Sep-15 draft, superseded |
| [vector-local-mvp-roadmap.md](../vector-local-mvp-roadmap.md) | Sep-13 draft, superseded |
| [Vector_Engine_Roadmap.md](../Vector_Engine_Roadmap.md) | VEC-001–025 engine tickets; status block superseded |
