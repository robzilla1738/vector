# Vector Engine

A from-scratch, agent-first browser engine in Rust. The engine's primary
consumer is not a human looking at pixels but an agent that needs a faithful,
semantic, *ready* view of a page and a typed way to act on it. Everything is
built around that: stable node references, a mutation journal, readiness
signals instead of sleeps, and accessibility snapshots as a first-class output.

This directory is a Cargo workspace. The architecture document lives in
`docs/engine/architecture.md` at the repository root.

## Crates

| Crate | Role |
| --- | --- |
| `ve-core` | Shared vocabulary: `NodeId` (index + generation), `Revision`, geometry, errors, tracing stages |
| `ve-net` | Per-context fetch: cookie jar, HTTP cache, redirects, `data:`/`about:`; hyper + rustls transport behind `http` |
| `ve-html` | html5ever tokenizer + tree builder feeding the arena DOM |
| `ve-dom` | Arena `Document` with stable ids, mutation journal + dirty flags, shadow DOM, form state |
| `ve-style` | Own cascade: property table, computed values, inheritance, media queries, custom properties; `cssparser` + `selectors` for syntax and matching |
| `ve-layout` | Own block + inline formatting (text via `parley`), flex/grid via `taffy`, positioned boxes, stacking contexts, hit testing |
| `ve-a11y` | Accessibility tree, accessible names, `SemanticSnapshot` (`Compact` / `Full`), journal-driven diffs |
| `ve-script` | VM-agnostic `JsVm` trait, HTML event loop (tasks, microtasks, virtual-time timers), WebIDL stub generator; QuickJS-NG behind `quickjs` |
| `ve-gfx` | Display lists, compositor, font database + glyph rasterisation, software renderer; vello + wgpu behind `gpu`, image decoding behind `images` |
| `ve-agent` | Typed `Program` of steps (`click`, `fill`, `select`, `press`, `scroll`, `navigate`, `waitFor`, `extract`, `collectScroll`), `Readiness`, in-engine `DomPage` |
| `ve-api` | `VectorEngine` facade (`open` / `observe` / `execute`) and the C ABI (`ve_engine_new/free/open/observe/execute`, JSON in and out) |
| `ve-napi` | Node.js bindings via napi-rs behind `napi` |
| `tools/wpt-runner` | Web Platform Tests harness skeleton (loads tests, reports JSON) |
| `tools/perf` | Per-stage timing harness (parse / style / layout / snapshot / paint → JSON) |

## Building

Requires stable Rust (edition 2024; `rust-version = 1.85`). The default build
is pure Rust and needs no C compiler, system libraries or GPU:

```sh
cd engine
cargo build
cargo test
cargo clippy --workspace --all-targets -- -D warnings
cargo fmt --all --check
```

Optional features (all off by default):

| Feature (on `ve-api`) | Pulls in | Needs |
| --- | --- | --- |
| `http` | hyper 1, rustls, tokio | a C compiler (`ring`) |
| `quickjs` | rquickjs (QuickJS-NG) | a C compiler |
| `gpu` | vello, wgpu, image | GPU/EGL/Vulkan dev libraries on Linux |
| `napi` (on `ve-napi`) | napi, napi-derive | Node headers at load time |

```sh
cargo build -p ve-api --features quickjs,gpu,http
cargo test  -p ve-script --features quickjs
```

CI (`.github/workflows/engine.yml`) runs fmt, clippy (`-D warnings`), build
and test on Ubuntu and macOS, plus a best-effort Ubuntu job for the optional
features.

## Trying it

```rust
use ve_api::{ObserveOptions, OpenSource, Program, VectorEngine};

let mut engine = VectorEngine::default();
let page = engine.open(OpenSource::Html { html: "<label for=q>Search</label><input id=q>".into(), url: None })?;
let observation = engine.observe(page, &ObserveOptions::default())?;
println!("{}", observation.snapshot.to_text());
// - document [ref=n1.0]
//   - textbox "Search" [ref=n5.0]

let program = Program::from_json(r#"[
  {"action": "fill", "target": {"by": "label", "label": "Search"}, "value": "boots"},
  {"action": "extract", "name": "q", "what": {"type": "value"}, "target": {"by": "ref", "ref": "n5.0"}}
]"#)?;
let report = engine.execute(page, &program)?;
assert_eq!(report.extracted["q"], "boots");
```

```sh
cargo run -p perf -- --iterations 10            # per-stage timings as JSON
cargo run -p wpt-runner -- --wpt-dir ../wpt --filter html/dom --limit 50
```

## Status (milestone M0)

Every crate is a real library with tests, but the engine is a foundation, not
a browser yet. Deliberate stubs, to be replaced in later milestones:

- **Script**: no DOM bindings are registered in the VM; interactions do not
  fire script listeners. The WebIDL generator produces trait stubs only.
- **Layout**: no floats, tables (rendered as blocks), `position: sticky`
  (treated as `relative`), parent/child margin collapsing, writing modes or
  fragmentation. Fonts must be registered explicitly; without fonts a
  deterministic average-advance shaper is used.
- **Style**: no `@import`, `@font-face`, `@keyframes`, nesting, or range media
  queries; a focused property table (~55 longhands + common shorthands).
- **Graphics**: no overflow clipping or opacity groups in the layout→display
  list conversion; no text in the vello backend; no replaced elements.
- **Network**: no connection pooling, streaming bodies, revalidation
  round-trips or charset sniffing; HTTP transport is opt-in.
- **Accessibility**: shadow trees are exposed flattened without slot
  assignment; no live regions.
- **Agent**: form submission does not navigate; `press` covers a small key set.
- **Tools**: the WPT runner only parses/lays out tests (`testharness.js` needs
  script bindings); the perf tool measures stages, not end-to-end navigation.
