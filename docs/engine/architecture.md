# Vector Engine — Architecture

Status: authoritative design for `engine/`. Terminology matches
`packages/contracts` (Observation, Program/Step, Condition, VectorError) and
`packages/browser-driver` (DriverPage). Where this document and the Chromium
path disagree, the engine is the target and the Chromium path is the fallback.

## 1. Thesis and non-goals

Every shipping browser engine was built to turn HTML into pixels for a human.
Agents were bolted on afterwards: a DOM walk injected as a script, a
`MutationObserver` counter, "network idle" heuristics, one IPC round trip per
action, accessible names recomputed by a locator engine on every click.
`docs/audit/speed.md` traces the cost in this repo: one click plus the
observation an agent needs afterwards costs 6–10 CDP messages, a 20–80 ms
main-thread observe script, a role-first locator search, a stage lease that
serializes interactive work, and hundreds of milliseconds of load-time stalls.
None of that is incidental; it is the price of asking a pixel engine semantic
questions from the outside.

Vector Engine inverts the dependency. The engine's primary products are:

- a **semantic snapshot** (accessibility tree + forms + tables + text) produced
  from the engine's own trees, not from an injected script;
- **stable refs** that *are* DOM arena indices, so resolution is one array
  lookup, never a search;
- **batched action execution** inside the engine: a Program of typed steps
  runs on the engine thread with zero IPC per step;
- **readiness** derived from the event loop, network stack, and dirty bits
  instead of guessed from the outside;
- **isolation** as a cheap in-process object (a context), not a browser
  profile.

Rendering to pixels is a client of these trees, used for screenshots (vision
fallback) and the native shell. The engine is headless by default.

That is the structural claim: browser-use and Playwright-MCP on Chromium can
be optimized but cannot remove the cross-process, script-injected, re-derived
nature of every observation and action. We remove it by owning the trees.

**Non-goals.** Not a general-purpose consumer browser in M0–M4. No
extensions, plugins, or printing. No pixel-identical rendering with Chromium;
screenshots must be *legible to a vision model*, not reftest-conformant. No
legacy quirks beyond what the top-100 corpus needs. No WebRTC, WebGPU, or
WebAssembly-heavy apps before M5.

## 2. Crate map, dependency DAG, build-vs-take

Cargo workspace at `engine/`, crates under `engine/crates/`, harnesses under
`engine/tools/` (`wpt-runner`, `perf`). Heavy deps sit behind features
(`net`, `quickjs`, `gpu`) so the default build is pure Rust.

| Crate | Owns | Takes from ecosystem |
|---|---|---|
| `ve-core` | ids, arenas, `Revision`, dirty-bit types, spans/tracing, error types, JSON boundary types | `serde`, `tracing`, `thiserror` |
| `ve-net` | fetch pipeline, HTTP/1.1+2 (h3 in M5), own HTTP cache (RFC 9111), RFC 6265 cookie jar, per-context isolation, request policy hooks | `hyper`, `rustls`, `h2`, `tokio` |
| `ve-html` | tokenizer/tree-builder → `ve-dom` sink, streaming parse, `document.write` re-entry (M2) | `html5ever` |
| `ve-dom` | arena DOM, `NodeId`, mutation journal, shadow DOM, form/validity state, selector matching host | `selectors` (matching), `markup5ever` (atoms) |
| `ve-style` | cascade, property table, computed values, inheritance, media queries, custom properties, invalidation maps | `cssparser` (syntax only) |
| `ve-layout` | box tree, block/inline formatting, positioned layout, geometry/fragment tree, stacking contexts, hit testing | `parley` (inline text/shaping), `taffy` (flex/grid algorithms) |
| `ve-a11y` | accessibility tree, accname, Compact/Full snapshot, snapshot diff | — |
| `ve-script` | `JsVm` trait, QuickJS-NG backend, WebIDL bindings generator, event loop, timers, fetch/XHR, storage, history, observers | `rquickjs` |
| `ve-gfx` | display list, compositor, image decode, fonts, screenshots | `vello`, `wgpu`, `fontdb`, `swash`, `image` |
| `ve-agent` | Program/Step execution, ref resolution, settled(), extraction, `collectScroll`, contexts | — |
| `ve-api` | Rust facade + C ABI; JSON in/out | — |
| `ve-napi` | Node binding; `vector-engine` BrowserDriver backend | `napi` |

```mermaid
graph TD
  core[ve-core]
  net[ve-net] --> core
  html[ve-html] --> dom
  dom[ve-dom] --> core
  style[ve-style] --> dom
  layout[ve-layout] --> style
  a11y[ve-a11y] --> layout
  script[ve-script] --> dom
  script --> net
  script --> layout
  gfx[ve-gfx] --> layout
  agent[ve-agent] --> a11y
  agent --> script
  agent --> net
  agent --> html
  api[ve-api] --> agent
  api --> gfx
  napi[ve-napi] --> api
```

Edges point at dependencies. `ve-a11y` never depends on `ve-script` — the
snapshot is computable with scripting disabled (M1). `ve-gfx` is a leaf
client of `ve-layout`; only `ve-api` depends on it.

**Build-vs-take rule.** Take a crate when the problem is (a) specified by an
external standard we do not want to reinterpret and (b) has no bearing on the
agent-facing data model: HTML tokenization, CSS *syntax*, selector
*matching*, text shaping, flex/grid *arithmetic*, TLS, HTTP framing, GPU
rasterization, the JS VM. Build everything that defines what the agent sees or
how fast it sees it: the DOM arena and journal, the cascade and property
table, the box/geometry tree, the accessibility tree, readiness, the event
loop, the cache and cookie jar (isolation semantics), the compositor. A taken
crate must be wrappable behind a trait we own within one file; if we would
need to fork it to reach our data structures, we build instead.

**Manifest constraints worth knowing** (`engine/Cargo.toml`): `cssparser` is
held at 0.37 because `selectors` 0.40 requires `^0.37`; `wgpu` is held at 29
because `vello` 0.10 requires `^29`. `parley` and `fontdb` are built with
`default-features = false, features = ["std"]` — parley's default `system`
feature links libfontconfig on Linux, which would break the pure-Rust default
build and CI; fonts are registered from bytes instead. Heavy dependencies sit
behind features (`http`, `quickjs`, `gpu`, `images`, `napi`) so the default
`cargo build` needs no C toolchain.

## 3. DOM and ref model

### Arena layout

`ve-dom::Document` owns one `Vec<NodeSlot>`; every node — element, text,
comment, document fragment, shadow root, attribute-less pseudo containers —
lives in this arena. Tree links are indices, not pointers:

```rust
pub struct NodeId { index: u32, generation: u32 }   // 8 bytes, Copy

struct NodeSlot {
    generation: u32,
    kind: NodeKind,                 // Element(ElementData) | Text(TextData) | ShadowRoot(..) | ...
    parent: Option<u32>,
    first_child: Option<u32>, last_child: Option<u32>,
    prev_sibling: Option<u32>, next_sibling: Option<u32>,
    flags: NodeFlags,               // dirty bits (§4) + IN_DOCUMENT + IS_INTERACTIVE_CANDIDATE
    style: Option<ComputedStyleId>, // interned, shared between siblings with identical style
    layout: Option<BoxId>,         // into ve-layout's box arena
    a11y: Option<A11yNodeId>,      // into ve-a11y's tree
}
```

`ElementData` holds an interned `QualName`, an attribute `SmallVec<[Attr; 4]>`
with `class`/`id` pre-split into atoms, `shadow_root: Option<u32>`,
`form_state: Option<Box<FormState>>` (value, dirty-value flag, checkedness,
validity bitset, custom validation message, selected option indices),
and an `element_flags` word (focusable, disabled, inert, contenteditable).

### NodeId and generation

`index` is never recycled within a document. Removal marks the slot
`Tombstone` and pushes it to a free list that is only reused after the
document is torn down. `generation` is the document's generation counter —
incremented on every navigation that replaces the document (including
same-document `document.open()`). A `NodeId` is valid iff
`slots[index].generation == id.generation && kind != Tombstone`.

The agent ref is the string `r<index>`; it matches the runtime's existing
`^r\d+$` grammar (`ref-registry.ts`), so refs `r12` flow unchanged through
`Program.target`. The runtime already scopes refs to `(pageId, documentEpoch)`;
the engine's `documentEpoch` *is* `generation`. Resolution is:

```
resolve(r) -> slots[r.index] if generation matches and kind is Element
           -> Err(target_detached) if tombstone or generation mismatch
```

One bounds check and one compare. No search, no accessible-name computation,
no ambiguity by construction. `target_ambiguous` can only arise from
selector-based targets (`css:`, `text:`, `role=`), never from refs.

On navigation a new `Document` is allocated with `generation += 1` and the
old arena is dropped once the `Page` swaps roots; stale refs fail with
`target_detached` naming both epochs.

### Mutation journal

Every mutation appends a record to `Document.journal: Vec<JournalRecord>`:

```rust
enum JournalRecord {
    Inserted   { node: u32, parent: u32 },
    Removed    { node: u32, parent: u32 },      // subtree implied
    AttrSet    { node: u32, name: Atom },       // includes class/id/style/aria-*
    TextSet    { node: u32 },
    ShadowAttached { host: u32 },
    FormState  { node: u32, what: FormStateKind }, // Value | Checked | Selected | Validity | Focus
    Geometry   { node: u32 },                   // emitted by layout when a fragment's rect changes
    Scrolled   { node: Option<u32> },           // None = viewport
    Navigated,                                  // generation changed; journal truncated
}
```

`Revision(u64)` is monotonic per page. It advances at *task boundaries*
(end of parser chunk, end of a script task, end of an agent step, end of a
layout pass), not per record, so a burst of 5,000 mutations from one
`innerHTML` assignment is one revision. `Document.revision_index:
Vec<(Revision, usize)>` maps revision → first journal offset.

Compaction runs when the journal exceeds 64 K records or 32 revisions:
records for the same node collapse to one per kind; `Removed` erases all
earlier records for the subtree; the oldest revisions are dropped and
`journal_floor` records the oldest still-answerable revision. A snapshot
request with `sinceRevision < journal_floor` gets a full snapshot with
`deltaFrom` absent — never an error.

### Deriving the observation diff

Each `Element` slot carries dirty bits (`STYLE`, `LAYOUT`, `PAINT`, `A11Y`).
Journal records set `A11Y` on the node and its nearest accessibility-relevant
ancestor (the a11y tree is sparser than the DOM). `ve-a11y::snapshot(since)`
reads journal records in `[since, now)`, collects the affected `NodeId`s (a
`FixedBitSet` over the arena), re-derives only those a11y nodes, and emits the
diff (§5). Cost is O(changed nodes + affected ancestors), independent of
document size. When the journal is empty since `since` and scroll/viewport are
unchanged, the cached snapshot is returned without walking anything.

## 4. Style and layout pipeline

### Cascade stages

1. **Rule collection.** Stylesheets (UA, author, `style=""` presentational
   hints) are parsed with `cssparser` into our own `Rule { selector:
   selectors::SelectorList, declarations: DeclBlock, origin, layer, order }`.
   Rules are bucketed by rightmost compound (id, class, local-name, universal)
   for candidate lookup; `selectors` performs matching with our
   `ve-dom::ElementRef` implementing `selectors::Element`.
2. **Cascade sort.** Key = (origin+importance, cascade layer, specificity,
   source order). `!important` UA > `!important` author > author > UA.
3. **Specified → computed.** Own property table generated from
   `properties.toml` at build time: each property has an id, inherited flag,
   initial value, parser fn, computer fn. Custom properties are stored as
   token streams and substituted (`var()`) with cycle detection before
   computation. Inheritance uses the parent's `ComputedStyle`; identical
   computed structs are interned (`ComputedStyleId`) so text-heavy documents
   share styles across siblings.
4. **Media/container evaluation.** Media queries evaluated against the
   `Viewport { width, height, dpr, prefers_* }`; a viewport change marks all
   rules with media dependencies and invalidates via the map below.

### Invalidation and dirty bits

`NodeFlags` (per node, in the arena slot):

| Bit | Set by | Cleared by |
|---|---|---|
| `STYLE_SELF` | attribute/class/id/state change matching an invalidation map entry; parent `STYLE_DESCENDANTS` | style recalc |
| `STYLE_DESCENDANTS` | inherited property change; `:has()`/sibling-dependent rule hit | style recalc |
| `LAYOUT_SELF` | computed layout-affecting property change; text change; child insert/remove | layout |
| `LAYOUT_CHILDREN` | ancestor path marker up to the nearest layout boundary | layout |
| `PAINT` | paint-only property change (color, background, opacity, visibility) | paint / snapshot |
| `A11Y` | any journal record for this node; role/name/state-affecting style change (display, visibility) | snapshot |

Invalidation maps (built once per stylesheet set): `class → rules`,
`id → rules`, `attr-name → rules`, `state → rules` (`:hover`, `:focus`,
`:checked`, `:disabled`, `:invalid`). An attribute change consults the map;
if no rule depends on that feature, no style bit is set at all. Changes to
`style=""` set `STYLE_SELF` only.

### Incremental layout

The box tree (`ve-layout::BoxArena`) is separate from the DOM: anonymous
block/inline boxes exist, `display:none` nodes have no box, `display:contents`
has none of its own. Formatting contexts:

- Block and inline formatting are ours. Inline layout builds a line-box list
  by feeding runs to `parley` for shaping/bidi/line breaking and placing the
  resulting glyph runs; we own float placement (M2+), `text-overflow`,
  `white-space`, and inline-block integration.
- Flex and grid: we translate the box subtree into a `taffy` tree, run its
  algorithm, and copy results back. taffy never sees the DOM.
- Positioned layout (absolute/fixed/sticky) is ours, resolved after the
  containing block's in-flow pass.

`LAYOUT_SELF` on a node propagates `LAYOUT_CHILDREN` upward until a **layout
boundary**: a box whose size does not depend on its content (definite width
and height, `overflow != visible`, not a table part, not inline), or the root.
Relayout starts at the nearest dirty boundary. For the common agent case
(typing into a field, toggling a checkbox), relayout touches one field box.

Layout emits a **geometry tree**: `Fragment { node: NodeId, rect: Rect (in
containing-block coords), abs_rect: Rect (document coords), clip: Option<Rect>,
stacking: StackingContextId, scroll_container: Option<BoxId> }`. Stacking
contexts are built from `position/z-index/opacity/transform`. Hit testing
walks stacking contexts in reverse paint order and returns the topmost
fragment containing the point — this is also the occlusion check in §5.
Changed `abs_rect`s append `Geometry` journal records.

### Phase-1 (M1) CSS property set

Everything needed to decide visibility, geometry, and reading order on static
pages; nothing needed only for fidelity:

`display` (block, inline, inline-block, flex, inline-flex, grid, inline-grid,
none, contents, list-item, table*), `position`, `top/right/bottom/left`,
`z-index`, `float`/`clear` (parsed; layout in M2), `width/height/min-*/max-*`,
`margin-*`, `padding-*`, `border-*-width/style` (color parsed for paint),
`box-sizing`, `overflow-x/y`, `visibility`, `opacity`, `pointer-events`,
`flex-*`, `order`, `align-*`, `justify-*`, `gap`, `grid-template-*`,
`grid-*-start/end`, `grid-area`, `font-family/size/weight/style`,
`line-height`, `text-align`, `text-transform`, `text-overflow`, `white-space`,
`word-break`, `overflow-wrap`, `letter-spacing`, `direction`,
`unicode-bidi`, `vertical-align`, `list-style-type`, `content` (for
`::before/::after` text only), `clip-path: inset()` (visibility only),
`transform: translate/scale` (geometry only), `color`, `background-color`,
custom properties and `var()`, `inherit/initial/unset/revert`, `calc()`,
`min()/max()/clamp()`, `%`, `px/em/rem/vw/vh/ch`.

**Deferred**: floats layout (M2), tables layout beyond block-ish fallback
(M2), `::marker`, multi-column, `writing-mode` vertical, `aspect-ratio`,
transitions/animations (M3; computed as end state until then), gradients,
shadows, filters, `backdrop-filter`, `mix-blend-mode`, `@font-face` download
(M3; system fonts via `fontdb` until then), `@container`, `@scope`,
`:has()` (parsed and matched, but invalidates whole subtree), CSS Houdini.

## 5. Semantic snapshot

### Accessibility tree

`ve-a11y` derives `A11yNode { node: NodeId, role: Role, name: String,
description: Option<String>, states: StateFlags, value: Option<Value>, rect:
Rect, frame: FrameKey, children: Vec<A11yNodeId> }` from DOM + computed style
+ geometry. Roles follow HTML-AAM implicit mappings plus explicit `role=`
validated against the ARIA role table (unknown → implicit). Subtrees under
`display:none`, `visibility:hidden`, `hidden`, `aria-hidden=true`, or
`inert` are pruned; `display: contents` contributes children only.

### Accessible name (accname 1.2 outline)

1. `aria-labelledby` → concatenate referenced nodes' text alternatives (no
   recursion into further `labelledby`).
2. `aria-label` (trimmed, non-empty).
3. Native: `<label for>`/wrapping label; `alt` for `img`/`area`; `<legend>`
   for fieldset; `<caption>` for table; `<figcaption>`; `value` for
   `input[type=button|submit|reset]`; `<title>` child of `svg`; `<option>`
   text for `select` value display.
4. Name from content (roles that allow it: button, link, heading, cell,
   menuitem, option, tab, tooltip, treeitem…): recursive text of children,
   including `::before/::after` `content`, `alt` of embedded images, values of
   embedded controls, and *open* shadow trees; `aria-hidden` subtrees skipped.
5. `title`, then `placeholder` (as name only when nothing else).

Whitespace collapsed, capped at 256 chars (the ref carries `truncatedName`
in Full).

### Visibility and occlusion rules

An element is **shown** if it has a fragment with non-empty `abs_rect`
after clipping by every ancestor's `overflow` clip, and `visibility:visible`,
and `opacity > 0.01` on itself and ancestors. Zero-size elements are shown
only if focusable (skip-links, offscreen inputs). Elements outside the
viewport are shown with `offscreen: true` (Full) and sorted after in-viewport
ones. **Occluded** means hit-testing the fragment's center point returns a
fragment whose node is neither the element nor a descendant nor an ancestor
with `pointer-events: none` — such elements get `occluded: true` and, in
Compact, are demoted below the fold. Text with `color` equal to the effective
background and `font-size < 6px`, or clipped to ≤1px (the "screen-reader
only" pattern), is **hidden text**: excluded from Compact `text`, included in
Full with `hidden: true` (see §10).

### Schema alignment

The engine emits `ObservationContent` exactly as defined in
`contracts/observation.ts`: `url, title, viewport, scroll, frames, text,
headings, elements[ElementRef], formFields[FormField], tables[TableBlock],
links, dialogs, truncated, stats`. The engine computes `stats.approxTokens`
as `ceil(chars/4)`.

**Compact** (default; what `renderObservation` reads): `elements` carry
`ref, frame, tag, role, name, value, checked, selected, href, disabled,
type, placeholder`; `rect` and `selector` are omitted (the ref *is* the
locator). `text` is the reading-order text of the main landmark (or body) with
block boundaries as newlines, budgeted. `headings` are `h1–h6` and
`role=heading` names in order. Landmarks are folded into `text` as `[nav]`,
`[main]`, `[footer]` markers.

**Full**: everything in Compact plus `rect`, `selector` (css path computed on
demand from the arena — cheap because we know sibling indices), `offscreen`,
`occluded`, `hidden`, `description`, `states` (expanded, pressed, level,
required, invalid, busy), landmark tree, and the structured `delta` (below).
Full is for the inspector, learned-program portability (§11), and debugging;
the planner never receives it.

### Budgets and ordering

`ObservationRequest.maxElements` (default 120) and `maxTextChars` (default
6000) are honored during collection, not post-hoc. Ranking: in-viewport
interactive first, then form fields, then in-viewport links, then below-fold
interactive in document order. Tables: first 12 rows × 12 columns with
`totalRows`. Any tripped cap sets `truncated: true`; `stats.elementsTotal`
is always the full count. Scope `forms|links|tables|subtree` restricts
collection at the source (a subtree walk starts at the ref's `NodeId`).

### Diff format

`changesSince: string[]` (consumed verbatim by `renderObservation`) is
generated from the journal-driven diff:

```
+ r48 button "Delete"              (new element)
- r12                              (removed; last known: link "Edit")
~ r7 value="" → "Ada"             (field changed)
~ r31 checked=false → true
~ r5 name="Save" → "Saving…"
~ url /records → /records/17
~ text +3/-1 lines near "Status"
```

Full also emits `delta: { added: ElementRef[], removed: string[], changed:
{ref, field, from, to}[], textOps: [...] }`. `deltaFrom` names the previous
`observationId`; the runtime supplies it when it passes `sinceRevision`.

## 6. Agent action API

### Program and Step in the engine

`ve-agent::Step` mirrors `contracts/program.ts` `StepSchema` op-for-op:
`navigate, back, forward, reload, stop, click, dblclick, hover, fill, type,
press, check, uncheck, select, scroll, dragTo, clickPoint, waitFor,
screenshot, extract, upload, expectDownload, collectScroll, dialog, evaluate`.
`Condition` mirrors `ConditionSchema`. Serde derives use the same field
names, so the JSON the runtime already validates with zod is the engine's
wire format. Control-flow nodes (`if/forEach/until/…`) remain interpreted by
the runtime executor in M1–M2; the engine executes flat `steps`. (Moving the
interpreter in-engine is an M4 option, not a requirement.)

`Page::execute(program) -> ProgramResult` runs all steps on the page's engine
thread. Per step: check `documentEpoch`, resolve target, run the op, run
`settle()`, verify `expect`, record `StepOutcome { stepId, op, status,
startedAt, durationMs, detail, error, extracted }`. The only boundary
crossings are the program in and the result (optionally with a Compact
observation) out.

### In-engine semantics

- **Target resolution.** `r<n>` → arena lookup (§3). `css:` → selector match
  from the document root, piercing open shadow roots for `>>` segments.
  `text:` → a11y-name / text-content match over shown elements. `role=` →
  a11y tree filter. Selector targets matching >1 shown element →
  `target_ambiguous` listing the first 5 candidate refs so the planner can
  pick one without re-observing.
- **Actionability**, checked in order: attached (not tombstone) → shown (§5)
  → enabled (not `disabled`, not inside disabled fieldset, not `inert`) →
  stable (two consecutive layout passes with identical `abs_rect`) →
  unoccluded at the dispatch point. Failure after `timeoutMs` (default 5000)
  → `step_failed` with the failing predicate named.
- **click**: `scrollIntoView` if needed (journal `Scrolled`), dispatch point
  = fragment center clamped into the viewport; sequence `pointerover/mouseover
  → pointerdown/mousedown → focus → pointerup/mouseup → click` (`dblclick`,
  `contextmenu` for middle/right). Activation behavior runs (link navigation,
  form submission, checkbox toggle, label forwarding). `hover` stops after
  `mousemove`.
- **fill**: focus → select all → set value via the element's value setter
  (`maxlength`, `type=number` sanitization) → `beforeinput` + `input`
  (`inputType: insertReplacementText`) → `change` when focus next moves.
  Works on `input`, `textarea`, `contenteditable`.
- **type**: per-grapheme `keydown/keypress/beforeinput/input/keyup`;
  `delayMs` defaults to 0.
- **press**: parses `Control+Shift+A` chords; `keydown`, default action
  (Enter submits the focused field's form, Tab follows tabindex order, Space
  toggles), `keyup`.
- **select**: match by value, then label; multi-select sets each; `input` +
  `change`. **check/uncheck**: no-op if already in state, else click.
- **scroll**: nearest scroll container of the ref (or viewport) by `amount`
  (default one viewport) or to top/bottom; fires `scroll`.
- **dragTo**: `pointerdown` on source, 4 `pointermove`s, `pointerup` on
  target; HTML5 drag events synthesized in M2.
- **clickPoint**: hit-test at CSS pixels → click on the result.
- **waitFor**: re-evaluated at every readiness transition, not on a timer.
  `textVisible` is a shown-text index lookup; `selector` reads arena
  attached/visible/hidden/detached state; `refReady` = actionability passes;
  `navigationSettled` = new document parsed + `settle()`; `response` = a
  `ve-net` completion matching `urlIncludes`/`status`; `expression` needs
  `ve-script` → `capability_unsupported` in M1.
- **extract**: one pass resolving all fields against the arena; `attribute`
  reads the attribute, else `textContent` (deterministic, layout-free).
- **collectScroll**: loop { scroll container one viewport; `settle()`;
  collect `item` matches; dedupe by `key` attribute or item text } until
  `limit`, `maxScrolls`, or two consecutive iterations adding nothing with
  unchanged `scrollHeight`. `settleMs` is accepted and ignored.
- **screenshot**: §9. **upload**: sets the file list from caller-vetted
  paths; fires `input`/`change`. **dialog**: resolves the pending
  `alert/confirm/prompt/beforeunload`. **evaluate**: `ve-script` only, and
  only in contexts created with `allowEvaluate`.

### Trusted versus synthetic events

Every event the engine dispatches for a step is **trusted** (`isTrusted:
true`) because the engine *is* the input device; there is no distinction
between "real" and "synthetic" input as Chromium enforces for
`dispatchEvent`. Consequently there is no stage lease: a page need not be
visible, laid out on screen, or focused by the OS to receive a trusted click.
Page scripts calling `element.dispatchEvent` produce untrusted events, as per
spec. Parallel programs on different pages in the same process never
serialize on input.

### Settled — precise definition

`settle(budget)` returns `Settled { settled: bool, waitedMs, reasons:
Vec<Reason> }` and is invoked after every step and before every observe. A
page is settled when **all** of the following hold at one instant:

1. The event loop has no runnable task in any task source, and the microtask
   queue is empty.
2. No timer is due within **50 ms** (`setTimeout/setInterval` with a
   deadline beyond 50 ms is ignored; a 0–50 ms timer is waited for).
3. `ve-net` has no in-flight fetch attributed to the page whose request was
   issued less than **2 s** ago, excluding requests marked `background`
   (EventSource, WebSocket, streaming bodies older than 2 s, beacons). Older
   in-flight requests are reported in `reasons` but do not block.
4. No `requestAnimationFrame` callback is pending that was scheduled by a
   callback that mutated the DOM in the previous frame (i.e., two consecutive
   frames with zero journal growth).
5. No `STYLE_*`/`LAYOUT_*` dirty bits remain (a recalc+layout pass has run
   since the last mutation).
6. No navigation is pending and the parser has reached end-of-file (or is
   blocked only on a `background` stream).
7. No `MutationObserver` or `IntersectionObserver` delivery is pending.

Default budgets: **500 ms** after ordinary steps, **2 s** after `navigate`
and `navigationSettled`, configurable per step via `timeoutMs`. An unsettled
page is *not* an error: the step succeeds, the outcome's `detail` carries
`settled=false: timers(1) fetch(2)`, and the subsequent observation is taken
anyway. In M1 (no scripting) conditions 1, 2, 4, 7 are trivially true.

### Error taxonomy

Engine errors are `ve_core::Error { code, message, detail }` where `code` is
exactly a `VectorErrorCode`:

| Engine situation | code |
|---|---|
| Ref tombstoned or generation mismatch | `target_detached` |
| Selector target matches 0 elements, or ref never existed | `not_found` |
| Selector target matches >1 shown element | `target_ambiguous` |
| Actionability predicate failed within timeout | `step_failed` |
| `waitFor`/`expect` condition timed out | `condition_timeout` |
| Op or condition needs a subsystem this build/milestone lacks (`evaluate`, `expression`, WebGL, PDF…) | `capability_unsupported` |
| Program cancelled (`Page::cancel`, page closed) | `cancelled` |
| Malformed step JSON, unknown key chord, bad URL | `invalid_params` |
| Human took over the page / concurrent program on same page | `conflict` |
| Network failure, engine panic caught at the boundary | `backend_unavailable` / `internal` |

The runtime's fallback router (§11) treats `capability_unsupported` as
"retry this program on Chromium" and everything else as a normal failure.

## 7. Script layer

### Why embed, not write

A JavaScript engine is a decade of work and none of it makes agents faster;
what does is *what surrounds* the VM — bindings that read our arena directly,
an event loop whose queues are readiness inputs, fetch that shares `ve-net`.
QuickJS-NG (via `rquickjs`) is the default: complete ES2023, ~1 MB,
deterministic GC, interruptible, microsecond realm creation, no isolate
process. It is slower than V8 on compute-heavy apps; the top-100 corpus is
dominated by DOM work and network waits, where the binding layer sets the
pace.

### VM-agnostic trait

```rust
pub trait JsVm: Send {
    type Realm: JsRealm;
    fn new_realm(&mut self, global: GlobalTemplate) -> Self::Realm;
    fn collect_garbage(&mut self);
    fn set_interrupt(&mut self, f: Box<dyn FnMut() -> bool>);   // deadline / cancellation
    fn memory_limit(&mut self, bytes: usize);
}
pub trait JsRealm {
    fn eval(&mut self, src: &str, origin: &ScriptOrigin) -> Result<JsValue, JsException>;
    fn call(&mut self, f: &JsFunction, this: JsValue, args: &[JsValue]) -> Result<JsValue, JsException>;
    fn run_microtasks(&mut self) -> bool;                            // true if any ran
    fn wrap_host(&mut self, obj: HostObjectId, class: ClassId) -> JsValue;
    fn unwrap_host(&self, v: &JsValue) -> Option<HostObjectId>;
    fn class(&mut self, def: &ClassDef) -> ClassId;                  // from the bindings generator
}
```

`JsValue` is an opaque handle owned by the realm; host objects are
`HostObjectId = (kind: u8, id: u32)` — for DOM nodes the id is the arena
index, so `node.firstChild` is an arena read with no hash map. Wrapper
identity (same JS object for the same node) is a `Vec<Option<JsValue>>`
indexed by arena index and cleared with the document. Swapping the VM
(SpiderMonkey, V8 via `v8` crate, Boa) means implementing these two traits;
bindings and event loop are untouched.

### Bindings generation

`engine/crates/ve-script/idl/*.webidl` (copied from the specs, trimmed to
supported members) → `build.rs` → generated Rust implementing `ClassDef`s:
attribute getters/setters, operations with WebIDL argument conversion
(`long`, `DOMString`, `USVString`, nullable, unions, dictionaries,
sequences), `[Reflect]` attributes mapping straight to arena attribute
reads/writes, `[CEReactions]` hooks, `[Exposed]` filtering per realm kind.
Interface inheritance becomes prototype chains. Every generated method
forwards to a hand-written `impl` in `ve-dom`/`ve-script`; the generator
never contains logic.

### Event loop ↔ readiness

`ve-script::EventLoop` per page (per agent cluster in M5): task sources
(`DOM manipulation`, `user interaction`, `networking`, `timers`,
`history traversal`, `rendering`), each a `VecDeque<Task>`; a
`BinaryHeap<Timer>` keyed by deadline; microtask checkpoint after every
callback; a rendering opportunity at most every 16 ms that runs
`rAF → style → layout → observers → paint(if client)`. The loop is a
state-machine, not a thread: `Page::pump(deadline)` runs tasks until idle or
deadline. `settle()` (§6) reads the queues, heap, `ve-net` in-flight table,
and dirty bits directly — there is nothing to inject, and no page script can
lie to it.

### M2 scope

`window`, `document`, DOM Core + Events + `HTMLElement` subclasses for form
and media-less content; `querySelector*`; `innerHTML/outerHTML/
insertAdjacentHTML` (re-entering `ve-html`); `getComputedStyle` (read-only),
`getBoundingClientRect`, `offset*/client*/scroll*` (force style+layout on
demand); timers, `queueMicrotask`, `rAF`; `fetch` (Request/Response/Headers,
AbortController) and `XMLHttpRequest`; `localStorage/sessionStorage`
(per-context, SQLite-backed); `history`/`location` incl. `pushState`,
`popstate`, `hashchange`; `MutationObserver`, `IntersectionObserver`,
`ResizeObserver`; `CustomEvent`; `FormData`; `URL`; `TextEncoder/Decoder`;
`structuredClone`; `console`; `customElements` with lifecycle reactions;
`attachShadow` (open and closed); `alert/confirm/prompt` as engine dialogs;
minimal `navigator`; `matchMedia`; module scripts and dynamic `import()`.

## 8. Networking and isolation

### Contexts

`Context { id: ContextId, cookies: CookieJar, cache: HttpCache, storage:
StorageArea, permissions: PermissionSet, policy: NetworkPolicy, ua:
UserAgent, viewport_defaults, proxy }`. A context costs one struct and an
empty jar (creation < 1 ms; no process, no profile directory). A page belongs
to exactly one context. `sets.map` uses contexts for per-member isolation;
the runtime keeps one persistent "profile" context whose jar and storage are
persisted via `BrowserDriver.getAllCookies/setCookies` and a storage
snapshot API.

- **Cookies**: RFC 6265bis jar with `SameSite` enforcement on the request's
  site-for-cookies, `Secure`, `HttpOnly` (invisible to `document.cookie`),
  public-suffix-list domain checks, cookie-prefix rules, 4 KB/180-per-domain
  limits. `BrowserCookie` (driver type) maps 1:1.
- **Cache**: RFC 9111 freshness + validation (`ETag`/`Last-Modified`),
  `Vary`, per-context keying (no cross-context sharing), memory-first with a
  bounded disk tier the runtime may enable. Fixture and benchmark runs use
  `Cache-Control: no-store` semantics on request to stay deterministic.
- **Fetch pipeline**: URL parse → policy check (§10) → CORS/mixed-content →
  cache lookup → connection pool (`hyper` h1/h2, ALPN via `rustls`, one pool
  per context+origin) → response body streamed to the consumer (parser,
  image decoder, script fetch) with `onResponse` metadata emitted for the
  runtime's passive capture — metadata only by default; bodies on request for
  `xhr/fetch` JSON/text, capped at 256 KB, mirroring the audit's P1-2 fix.
- **Attribution**: every request records `page`, `initiator: Parser|Script|
  Navigation|Agent|Prefetch`, and `background: bool` — the inputs to
  `settle()` condition 3.

### Process and sandbox roadmap

M0–M4: one process, one engine thread pool; a page's event loop is pinned to
a thread, and style/layout parallelize across pages, not within. The N-API
layer marshals calls onto the owning thread.

M5: **context processes**. The `ve-api` C ABI is served either in-process or
over a shared-memory ring + control pipe by a `ve-host` binary per context:
macOS App Sandbox profile denying filesystem and network except the parent's
socket; Linux seccomp-bpf + namespaces. Network moves to a broker in the
parent (contexts cannot open sockets); the parent holds cookies and storage.
The JSON-at-the-boundary rule (§2) is what makes this transparent.

## 9. Rendering as a client

Rendering is not on the observe/act path. Pipeline: geometry tree (§4) →
**display list** (`ve-gfx::DisplayItem`: fills, borders, glyph runs, images,
clips, transforms, opacity groups; rebuilt only for stacking contexts with
`PAINT` bits) → **compositor** (a layer per stacking context with
`will-change`, `position: fixed`, or a scroll container; layers cached as
vello scenes, re-rasterized only when their display list changed) →
**vello** on `wgpu` (Metal on macOS, Vulkan/DX12 elsewhere; `vello_cpu` for
CI). Fonts from `fontdb`, plus `@font-face` from M3; `swash` supplies
outlines. Images decode off-thread and never block `settle()`.

`Page::screenshot({fullPage}) -> ScreenshotResult { png, width, height,
scale }` paints to an offscreen texture at the context's `dpr` and encodes
PNG. Layout is already clean after `settle()`, so a viewport screenshot is
paint + readback + encode — target < 30 ms at 1280×800@2x. `clickPoint`
coordinates are screenshot pixels divided by `scale`, matching the current
vision fallback contract. The native shell (M4) is another client: it
receives composited frames and forwards trusted OS input into the same
dispatch path programs use, which is how human takeover (`controller:
human`) is detected in-engine.

## 10. Security model

### Threat model

1. **Prompt injection via page content** steering the planner.
2. **Exfiltration by page scripts** of data the agent typed, or probing of
   the loopback runtime API.
3. **Cross-context leakage** via cookies, cache timing, storage.
4. **Malicious content attacking the engine** through parser/layout/decoder
   bugs.
5. **Runtime token exposure** into a page.

### Engine enforcement

- Same-origin policy for DOM access across frames; CORS on `fetch/XHR`;
  mixed-content blocking; `SameSite` cookies; CSP (`script-src`,
  `connect-src`, `frame-src`, `default-src` — M2), `X-Frame-Options`.
- **Network policy per context**: `NetworkPolicy { allow: Vec<Pattern>,
  deny: Vec<Pattern>, block_loopback: bool (default true), block_private:
  bool }`. By default page scripts cannot reach `127.0.0.1`, `::1`,
  `localhost`, or link-local addresses — including the runtime's port —
  regardless of what the page requests. Fixtures on `127.0.0.1:4810–4812`
  are allowlisted explicitly by the test harness. Denied requests fail as
  network errors visible in `reasons` and `onResponse`.
- **Hidden-text classification** (§5) is computed by the engine and cannot be
  spoofed by the page: Compact observations exclude text no human would see.
  Full observations tag it `hidden: true`. This shrinks the injection surface
  to what a human would also read; it does not eliminate it.
- **Provenance**: every string in an observation is page content; the engine
  never merges runtime or user text into it. `ObservationContent` gains no
  free-form fields the page could shape beyond the schema.
- **Capability gating**: `evaluate` and `expression` conditions are off unless
  the context sets `allowEvaluate`; uploads only from paths the caller passes
  (the engine never enumerates the filesystem); downloads go to a
  caller-provided directory.
- **Memory safety**: Rust with `unsafe` confined to the VM FFI and GPU
  bindings, `#![deny(unsafe_op_in_unsafe_fn)]`; fuzz targets for `ve-html`,
  `ve-style` parsers, image decoding, and the cookie parser run in CI.
- **Resource limits**: per-realm memory limit (default 256 MB), interrupt
  after 10 s of uninterrupted script, arena cap (default 4 M nodes → page
  marked `oversized`, further insertions dropped and journaled).

### Runtime enforcement

The runtime owns the bearer token, the model, and the decision to act. It
never passes the token into a context; the engine has no API to receive it.
`PLANNER_SYSTEM` already frames observation text as data; destructive-action
confirmation, credential handling (`needs_input`), and per-origin allow/deny
lists are runtime policy expressed through `NetworkPolicy` and `Context`
configuration. The engine provides mechanisms and refuses to guess policy.

## 11. Integration with the existing runtime

### The `vector-engine` backend

`packages/browser-driver/src/vector-engine.ts` implements `BrowserDriver`
and `DriverPage` over `ve-napi`:

- `Backend` in `contracts/ids.ts` and `PageIdentity.backend` widen to
  `"vector" | "chrome" | "vector-engine"`. Everything switching on backend
  gains a case; nothing else in contracts changes for M1.
- `connect()` loads the native module and creates an `Engine` with the
  runtime's data dir; `createTarget(url)` → `Context::new_page` (the default
  profile context) and returns `targetId = "ve-<contextId>-<pageId>"`;
  `attach(targetId, pageId)` wraps the page.
- `DriverPage` methods map 1:1 onto `Page` methods; `click/fill/…` build a
  one-step Program (the executor's `runOne` stays valid), and a new optional
  `executeProgram(steps): Promise<ProgramResult>` lets the executor hand the
  engine whole chunks — the zero-IPC path. `observe(req)` returns the
  engine's Compact `ObservationContent`; `expandRef` returns the Full
  subtree; `evaluate` throws `capability_unsupported` until M2.
- `setEvents` wires `onNavigated(url, generation)`, `onTitleChanged`,
  `onLoading`, `onDialog`, `onDownload`, `onResponse` (metadata; body only
  when capture-worthy), `onDestroyed`.
- `refEntry(pageId, ref)` is served from the engine's last snapshot; the
  runtime's `RefRegistry` still stores what it receives so `expandRef`
  fallbacks and learned-program translation keep working.

### Refs, observations, programs

Refs are engine `NodeId`s rendered `r<index>`; `documentEpoch` is the
engine's `generation`, stamped by the runtime and enforced by the engine.
Observations arrive already shaped as `ObservationContent`; the runtime adds
`observationId`, `pageId`, `documentEpoch`, `revision` (the engine
`Revision`), `observedAt`, `scope`, and passes `sinceRevision` through so
`changesSince`/`deltaFrom` are finally live (today `sinceRevision` is
accepted and ignored). `pages.execute` gains `returnObservation?:
ObservationRequest` and returns `{ result, observation? }` — act-and-observe
in one round trip on both backends. Learned programs translate refs to
portable `SelectorStrategy`s from Full snapshots on demand, so `sets.map`
replay works across backends.

### Routing and fallback

`PageService.open(url)` consults a **router**:

1. If the origin is in the `needs-chromium` table (TTL 24 h) → Chromium.
2. Otherwise the engine performs the navigation and classifies the document
   after parse (before any observe) as `requiresScript` if **any** holds:
   - body text after parse < 200 characters **and** the document contains
     ≥1 external `<script>` not of type `application/ld+json|json|importmap`;
   - a root container matching `#root, #app, #__next, #__nuxt, [ng-version],
     [data-reactroot]` has no element children;
   - `<noscript>` content mentions JavaScript being required (regex over
     `javascript|enable\s+js`) **and** body text < 1,000 characters;
   - `<meta http-equiv="refresh">` to a JS-only URL, or `<body onload>`
     driving content;
   - any `<form>` lacking both `action` and a submit control, or with
     `onsubmit` (submission needs script);
   - `<template>`/`<slot>`-heavy pages with no light-DOM content.
   Static classification also fails on `capability_unsupported` content:
   PDF, media-only documents, `<canvas>`-only bodies, and a CSS coverage miss
   (unknown or deferred property count > 5 % of declarations affecting
   `display/position/visibility`).
3. `requiresScript` in M1 → the engine reports `capability_unsupported` with
   `detail.reason`; the runtime reopens the URL on Chromium, records the
   origin in `needs-chromium`, and continues. From M2 the heuristic gates
   only `evaluate`-dependent and unsupported-API cases.
4. Mid-program `capability_unsupported` → the runtime replays the remaining
   steps on Chromium after a fresh observation; refs do not carry across
   backends, so ref-targeted steps trigger a `REPAIR` replan.

The router is deterministic and logs `routeReason` so benchmarks report the
engine hit rate.

## 12. Conformance and performance methodology

### Conformance

`engine/tools/wpt-runner` runs a pinned WPT checkout with per-milestone
manifests (`engine/conformance/m<N>.txt`); a test in a manifest must pass, a
test outside it may fail. Manifests only grow.

| Milestone | WPT subsets | Fixtures / corpus |
|---|---|---|
| M0 | `html/syntax/parsing` (tree construction), `dom/nodes` (non-script via harness bindings), `url/` | `records-app`, `forms-app`, `interaction-lab` (existing) parse and produce a stable Full snapshot |
| M1 | `css/CSS2/{normal-flow,box-display,positioning}` reftest subset (geometry compared, not pixels), `css/css-flexbox` core, `css/css-grid/alignment` subset, `css/selectors`, `accname/`, `html-aam/` role and name tests, `css/mediaqueries` | static corpus `engine/fixtures/static/` (frozen snapshots of ~40 public static pages: docs sites, Wikipedia, gov forms, blogs) with golden Compact snapshots |
| M2 | `html/webappapis` (timers, event loop), `dom/events`, `fetch/api` core, `xhr/`, `html/browsers/history`, `custom-elements/`, `shadow-dom/`, `IntersectionObserver/`, `resize-observer/` | `interaction-lab` (shadow counter, virtualized list, autocomplete) fully on engine; 20 SPA fixtures (React/Vue/Svelte builds checked in) |
| M3 | `css/css-backgrounds`, `css/css-text`, `css/css-fonts` (`@font-face`), `css/css-transitions` end-state | screenshot legibility corpus rated by a vision model against Chromium screenshots |
| M4 | shell input parity tests (trusted OS events → same outcomes as programs) | native shell e2e suite |
| M5 | `fetch/` (h3), `websockets/`, `html/canvas/2d` subset, `service-workers/` subset | top-100 checklist |

**Top-100 checklist** (`engine/conformance/top100.toml`): 100 high-traffic
sites × 3 scripted tasks (observe, interact, extract); per-site status
`engine | fallback | broken`, published by CI. M5 exit: ≥ 90 `engine`, 0
`broken`.

### Performance

`tracing` spans with fixed names — `net.fetch`, `html.parse`,
`style.recalc`, `layout`, `a11y.snapshot`, `a11y.diff`, `agent.resolve`,
`agent.step.<op>`, `agent.settle`, `gfx.paint`, `gfx.screenshot`,
`api.roundtrip` — are exported as JSON by `engine/tools/perf`, which runs the
fixtures N=200 on a warm engine, reports p50/p95, and fails CI when p95
exceeds the milestone gate by > 10 %. `pnpm bench` gains `--backend
vector-engine|chrome` and reports the same spans end-to-end through N-API
plus payload bytes and `approxTokens` per observe.

| Milestone | Acceptance (all p95 on fixtures unless noted) |
|---|---|
| M0 | parse 1 MB HTML < 25 ms; arena + journal API stable; WPT M0 manifest 100 %; fuzzers 24 h clean |
| M1 | `observe` (Compact, 120 elements) **< 5 ms**; open-to-observe (fixture over loopback, cold context) **< 50 ms**; `click/fill` step incl. settle < 2 ms; 10-step program < 20 ms; snapshot diff after one field edit < 0.5 ms; router false-positive rate (static page sent to Chromium) < 5 % on static corpus; WPT M1 manifest ≥ 95 %; Compact observe ≤ 4 k tokens on every static fixture |
| M2 | `interaction-lab` tasks pass on engine; script-driven SPA fixture open-to-settled < 300 ms; `settle()` decision cost < 50 µs; WPT M2 manifest ≥ 90 %; QuickJS realm creation < 200 µs; 20 SPA fixtures: engine hit rate ≥ 80 % |
| M3 | viewport screenshot 1280×800@2x < 30 ms; vision fallback success on screenshot corpus ≥ Chromium parity − 5 pts; WPT M3 manifest ≥ 85 % |
| M4 | native shell input → identical `StepOutcome`s to programs on the e2e suite; frame latency < 16 ms p95 for scroll on static corpus; no Electron on the engine path |
| M5 | context process spawn < 30 ms; 8 parallel contexts scale ≥ 6× single-context throughput on `sets.map`; h3 negotiated on ≥ 50 % of top-100; top-100 ≥ 90 `engine`, 0 `broken`; Electron removed from the build |

## 13. Risks, mitigations, and explicit exclusions

| Risk | Mitigation |
|---|---|
| CSS long tail makes "static" pages misrender enough to hide controls | phase-1 set chosen for geometry/visibility only; CSS coverage counter feeds the router so unknown-heavy pages fall back rather than mis-observe; golden Compact snapshots per corpus page catch regressions |
| Own cascade/layout diverge from spec in ways that break a11y correctness | geometry-compared WPT reftests, not pixels; accname/html-aam suites gate M1; Full snapshots include `abs_rect` so mismatches are debuggable |
| QuickJS too slow for heavy SPAs | VM behind a trait from day one; bindings never touch VM internals; measure on the SPA fixture set before M2 exit and decide on a second backend with data |
| Bindings surface grows without bound | WebIDL-driven generation; the supported-member list is the IDL directory, reviewed per milestone; unsupported members throw `NotSupportedError` and increment a per-origin counter surfaced in routing |
| Router false negatives (script-dependent page classified static) produce wrong observations rather than failures | thin-observation detector already exists in the coordinator; add engine-side `suspectHydration` flag when body text is short and script count is high; any `step_failed` on a page with that flag flips the origin to `needs-chromium` |
| Single-process M0–M4 means a page crash takes the runtime's engine down | panics caught at the `ve-api` boundary → `onDestroyed("crashed")` for the page only; arena/journal are per page; M5 moves to processes |
| Vello/wgpu instability on CI machines | `gfx` is a feature; CI uses the CPU rasterizer; the agent path never requires it |
| Parallel work on `engine/` scaffolding drifts from this document | crate names, feature flags, and the acceptance table here are normative; deviations require editing this file in the same PR |

**Not in M1**: any JavaScript execution; floats/tables layout; `@font-face`;
pixels of any kind; `evaluate`/`expression`; iframes beyond same-origin
static inclusion (cross-origin frames are listed in `frames` and otherwise
empty); downloads; dialogs; HTTP/3; persistent cache; process isolation;
Windows/Linux shells.

**Not in M2**: Canvas 2D, WebGL, WebAudio, WebRTC, WebSockets, Workers,
Service Workers, WebAssembly, Notifications, Clipboard, Payment, WebAuthn,
`<video>/<audio>` playback (elements exist, do not play), CSS
animations/transitions (end state only), drag-and-drop beyond synthesized
pointer sequences, IndexedDB (localStorage only), printing, extensions,
h3, sandboxed processes.
