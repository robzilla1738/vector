# Vector Engine

A from-scratch, agent-first browser engine in Rust. The engine's primary
consumer is not a human looking at pixels but an agent that needs a faithful,
semantic, *ready* view of a page and a typed way to act on it. Everything is
built around that: stable node references, a mutation journal, readiness
signals instead of sleeps, and accessibility snapshots as a first-class output.

This directory is a Cargo workspace. The architecture document lives in
`docs/engine/architecture.md` at the repository root; its §0 records what is
implemented.

## Crates

| Crate | Role |
| --- | --- |
| `ve-core` | Shared vocabulary: `NodeId` (index + generation), `Revision`, geometry, the `VectorErrorCode` error taxonomy, tracing stages |
| `ve-net` | Per-context fetch: `NetworkPolicy`, RFC 6265 cookies, RFC 9111 cache, redirects, in-flight table; hyper + rustls behind `http` (per-host keep-alive pool + h2, gzip/br decode, revalidation); Alt-Svc h3 tracking; RFC 6455 WebSocket (`ws`/`wss`); parent `NetworkBroker` + JSON wire for `ve-host` |
| `ve-html` | html5ever tokenizer + tree builder feeding the arena DOM; streaming `DocumentParser`, charset-aware byte decoding, declarative shadow DOM; `scripting_enabled` for `<noscript>` |
| `ve-dom` | Arena `Document` with `NodeId` (index + generation); recycled slots bump generation so stale `r<index>` refs miss; mutation journal + dirty flags, shadow DOM, form state |
| `ve-style` | Own cascade: phase-1 property table, computed values, inheritance, media queries, custom properties, `calc()`, invalidation maps, `restyle_incremental`, `CssCoverage` counters for the router; `cssparser` + `selectors` for syntax and matching |
| `ve-layout` | Own block + inline formatting (floats, `clear`, inline-block), automatic table layout, flex/grid via `taffy`, positioned boxes, overflow / `clip-path: inset()` clip rects, `::before`/`::after`, list markers, stacking contexts, hit testing, layout boundaries + `relayout_incremental`; text via `parley` or the deterministic `MetricShaper` |
| `ve-a11y` | Accessibility tree, accessible names (accname 1.2 outline), the agent `ObservationContent` builder (§5 visibility, ranking, budgets, `Compact` / `Full`), `changesSince` / `delta` diffs |
| `ve-script` | VM-agnostic `JsVm` trait, HTML event loop, WebIDL parser + `build.rs` traits from `idl/*.webidl`; V8 behind `v8`, QuickJS-NG behind `quickjs` |
| `ve-gfx` | Display lists, compositor, `fontdb` system fonts + glyph rasterisation, software renderer; vello + wgpu behind `gpu`, image decoding behind `images` |
| `ve-agent` | `Page` (fetch → parse → subresources → cascade → layout, V8 DOM bindings, iframes, downloads, `settle()`, contract-shaped `Program`/`Step`), software screenshots |
| `ve-api` | `VectorEngine` facade (contexts, `open` / `observe` / `execute` / `screenshot` / `close` / cookies, `*_json` twins) and the C ABI in `ve_api::ffi` (below) |
| `ve-napi` | `@vector/engine-native`: napi-rs 3 addon behind `napi` (`ABI_VERSION` 4) — async `Engine` class, JSON plus UTF-8 JSON/PNG Buffers; optional `ve-host` child per context |
| `ve-host` | Isolated engine process: JSON control pipe, sandbox (macOS `sandbox_init` / Linux seccomp), fetches through the parent broker |
| `ve-replay` | Hermetic replay: missing archive is nondeterminism; speculative writes denied (VEC-024) |
| `ve-vm` | Research JS expression interpreter; Test262 subset; dedicated-worker `postMessage` eval (VEC-025). V8 stays production |
| `tools/wpt-runner` | WPT reftest runner comparing fragment *geometry* (not pixels) against `rel=match` references; per-milestone manifest |
| `tools/wpt-harness` | Testharness + pixel runner; inlines pinned `testharness.js`; VEC-006 |
| `tools/ve-shell` | CLI + optional `window` GUI (`winit`/`softbuffer`) over `NativeBrowser` |
| `tools/perf` | Agent-path harness over `fixtures/static/` (`--gate m1`: observe, open-to-observe, click/fill step, 10-step program, diff after edit; p50/p95 → JSON) |

Fixtures: `fixtures/static/*.html` (8 static pages: login, blog post, docs
guide, government form, FAQ, news index, product catalog, wiki article) each
with a `*.golden.json` Compact observation. Conformance: `conformance/m1.txt`
(geometry), `conformance/testharness.txt` (script/pixel),
`docs/engine/evidence/` (VEC-001–025).

## Building

Requires Rust 1.88 (`engine/rust-toolchain.toml`). The default build
is pure Rust and needs no C compiler, system libraries or GPU:

```sh
cd engine
cargo build
cargo test
cargo clippy --workspace --all-targets -- -D warnings
cargo fmt --all --check
```

Optional features (all off by default):

| Feature | Pulls in | Needs |
| --- | --- | --- |
| `http` (on `ve-api`, `ve-napi`) | hyper 1, rustls, tokio | a C compiler (`ring`) |
| `v8` (on `ve-api`, `ve-script`, `ve-agent`) | `v8` crate (prebuilt static lib) | C++ toolchain on first download |
| `quickjs` (on `ve-api`, `ve-script`) | rquickjs (QuickJS-NG) | a C compiler |
| `images` (on `ve-gfx`) | image (PNG, JPEG, GIF, WebP decoding) | — |
| `gpu` (on `ve-api`, `ve-gfx`; implies `images`) | vello, wgpu, peniko, kurbo | GPU/EGL/Vulkan dev libraries on Linux |
| `napi` (on `ve-napi`; implies `http`) | napi, napi-derive, napi-build | Node headers at build time |

```sh
cargo build -p ve-api --features quickjs,gpu,http
cargo test  -p ve-script --features quickjs
```

### Node addon

```sh
cargo build -p ve-napi --features napi --release      # → target/release/libve_napi.{so,dylib,dll}
# or, from the repo root:
pnpm --filter @vector/engine-native build             # napi-rs CLI → crates/ve-napi/vector-engine.<platform>-<arch>.node
node crates/ve-napi/scripts/build.mjs                 # cargo build + copy next to index.js
node crates/ve-napi/scripts/smoke.mjs                 # load, open a data: URL, observe, execute
```

`crates/ve-napi/index.js` resolves the binary from `VECTOR_ENGINE_NATIVE`,
then `vector-engine.<platform>-<arch>[-musl].node` beside it, then
`$CARGO_TARGET_DIR`/`engine/target` `release` and `debug`; a miss throws one
error listing every path tried. The runtime (`apps/runtime`) loads it at
startup and routes pages to it per `settings.engineMode`.

`.github/workflows/engine.yml` runs fmt, clippy `-D warnings`, tests, V8
SPA goldens, the perf gate and WPT. Run the same locally before merging:

```sh
cargo fmt --all --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
```

## Trying it

```rust
use ve_api::{ExecuteRequest, ObservationRequest, OpenRequest, Program, VectorEngine};

let mut engine = VectorEngine::default();
let opened = engine.open(OpenRequest::html(
    "<label for=q>Search</label><input id=q><button>Go</button>",
    Some("https://example.test/"),
))?;
assert!(!opened.routing.requires_script, "{}", opened.routing.route_reason);

let observation = engine.observe(opened.page, &ObservationRequest::default())?;
let field = &observation.observation.content.form_fields[0]; // { ref: "r5", type: "text", label: "Search", … }

let program = Program::from_json(&format!(r#"[
  {{"id": "s1", "op": "fill", "target": "{}", "value": "boots"}},
  {{"id": "s2", "op": "extract", "fields": [{{"name": "q", "selector": "#q", "attribute": "value"}}]}}
]"#, field.reference))?;
let executed = engine.execute(opened.page, &ExecuteRequest { program, return_observation: None })?;
assert_eq!(executed.result.extracted.unwrap()["q"], "boots");
```

`OpenRequest::url` opens `file:` (when the context's `NetworkPolicy` allows
it), `data:`, `about:` and — with `http` — `http(s):`. `EngineConfig`
carries `viewport`, `scale`, `userAgent`, `offline`, `maxPages`, `policy`.

Every operation has a `*_json` twin (`open_json`, `observe_json`,
`execute_json`, `screenshot_json`, `new_context_json`, `cookies_json`,
`set_cookies_json`) returning `{"ok":true,…}` or
`{"ok":false,"error":{"code","message","detail"?}}` with an exact
`VectorErrorCode`; panics are caught and reported as `internal`.

### C ABI (`ve_api::ffi`, `crates/ve-api/src/ffi.rs`)

All functions are `extern "C"` and exchange JSON strings; strings returned by
the engine are freed with `ve_string_free`. Null engine or string arguments
return an `invalid_params` error object instead of crashing.

| Function | Returns |
| --- | --- |
| `ve_engine_new()` / `ve_engine_new_with_config(json)` | engine handle (`null` for invalid config) |
| `ve_engine_free(engine)` | — |
| `ve_engine_open(engine, request_json)` | `{"ok":true,"page","context","url","title","status","documentEpoch","revision","routing":{"requiresScript","routeReason",…},"settled":{…},"openMs"}` |
| `ve_page_observe(engine, page, request_json)` | `{"ok":true,"page","content":ObservationContent,"revision","documentEpoch","changesSince"?,"delta"?,"settled"}`; `null`/`{}` = Compact, scope `full`, 120 elements, 6000 chars |
| `ve_page_execute(engine, page, request_json)` | `{"ok":true,"result":ProgramResult,"observation"?}`; request is `{program, returnObservation?}`, a `ProgramSchema` object, or a bare step array |
| `ve_page_screenshot(engine, page, options_json)` | `{"ok":true,"width","height","scale","fullPage","format":"png","bytes","pngBase64"}` (software renderer) |
| `ve_page_close(engine, page)` | `bool` — was open |
| `ve_context_new(engine, policy_json)` | context id, `0` on failure |
| `ve_context_free(engine, context)` | `bool` — existed (closes its pages) |
| `ve_engine_get_cookies(engine, context)` | `{"ok":true,"cookies":[BrowserCookie…]}` |
| `ve_engine_set_cookies(engine, context, cookies_json)` | `{"ok":true,"imported":N}` |
| `ve_string_free(s)` | — |
| `ve_version()` | static version string (do not free) |

### Tools

```sh
cargo run --release -p perf -- --gate m1                 # M1 p95 gates over fixtures/static (exit 1 on a miss)
cargo run --release -p perf -- --input page.html --iterations 50 --out perf.json
UPDATE_GOLDEN=1 cargo test -p ve-api --test golden       # accept new golden Compact snapshots

# WPT: a sparse checkout of web-platform-tests is enough
cargo run --release -p wpt-runner -- --wpt-dir ../wpt                       # the M1 subsets, manifest conformance/m1.txt
cargo run --release -p wpt-runner -- --wpt-dir ../wpt --subdir css/css-flexbox --filter align --progress
cargo run --release -p wpt-runner -- --wpt-dir ../wpt --update-manifest     # append new passes to the manifest

# Public-page corpus: router accuracy + observation budgets on real pages
node tools/corpus/fetch.mjs                     # refresh engine/fixtures/public from conformance/corpus.json
UPDATE_CORPUS=1 cargo test -p ve-api --test corpus -- --nocapture   # rewrite conformance/corpus-results.json
```

The WPT runner renders each reftest and its `<link rel="match">` references
through parse → cascade → layout with the `MetricShaper` at `800x600` and
compares the geometry signature (visible boxes with background/border, text
fragments with their text, in paint order) within `--tolerance` (1 px).
`testharness.js` tests are `NOTRUN`, mismatch-only and `-manual` tests
`SKIP`, panics `ERROR`, over `--timeout-secs` (20) `TIMEOUT`. Default
subsets: `css/CSS2/{normal-flow,box-display,positioning}`,
`css/css-flexbox`, `css/css-grid/alignment`, `css/selectors`,
`css/mediaqueries`, `accname`, `html-aam`. The manifest only grows; a
listed test that no longer passes is a regression and the run exits 1.

`perf --gate m1` gates (pooled p95 = worst per-fixture p95): `observe`
5 ms, `open_to_observe` 50 ms, `click_step` / `fill_step` 2 ms,
`program_10` 20 ms, `diff_after_edit` 0.5 ms. Use `--release`; `--no-fail`
reports without exiting non-zero.

## Status (milestone M1)

The agent path is real end to end for static pages: open → parse → cascade
→ layout → `ObservationContent`, typed steps with activation behaviour
(link navigation, GET/POST form submission), `settle()`, `changesSince`
diffs, routing classification, the C ABI and the Node addon. See
`docs/engine/architecture.md` §0 for the full list and the measured numbers.

Deliberate gaps, to be replaced in later milestones:

- **Script**: no DOM bindings are registered in the VM; interactions do not
  fire script listeners. `evaluate`, `waitFor expression`, `javascript:`
  URLs and script dialogs report `capability_unsupported`.
- **Layout**: `position: sticky` (treated as `relative`), parent/child
  margin collapsing, collapsed table borders, writing modes, fragmentation,
  `vertical-align` other than baseline. Fonts must be registered
  explicitly; without fonts the `MetricShaper` is used.
- **Style**: no `@import`, `@font-face`, `@keyframes`, nesting or range
  media queries (`@media`, `@supports`, `@layer` blocks are parsed).
- **Graphics**: screenshots come from the software renderer; no text in the
  vello backend; raster image decoding only behind `images`.
- **Network**: no connection pooling, streaming bodies or revalidation
  round-trips; HTTP transport is opt-in (`http`). Loopback is blocked by
  default and `file:` is opt-in per context policy.
- **Accessibility**: shadow trees are exposed flattened without slot
  assignment; no live regions.
- **Agent**: downloads, `dialog`, `evaluate` and `xpath:` targets report
  `capability_unsupported`; `dragTo` moves the pointer but synthesises no
  HTML5 drag events; control-flow `nodes` are the runtime's job.
- **Node addon**: exposes exactly the `ve-agent` surface above (including
  `back`/`forward`, `hover`, `dblclick`, `clickPoint`, `upload`, POST forms,
  `waitFor response`, software `screenshot`); `describe().capabilities`
  reports `evaluate`, `xpath`, `dialogs`, `downloads` as `false`. The
  runtime's router replays `capability_unsupported` programs on Chromium.
- **Tools**: the WPT runner covers reftests only (`testharness.js` needs
  script bindings). `RoutingInfo.cssCoverage` is `None` until the facade
  wires `ve-style`'s counters into the classification.
