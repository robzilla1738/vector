# Measured Aside adoption — approved October 17, 2026

The owner requested implementation of the complete plan in chat. This is the
durable specification; progress belongs in STATUS and the execution graph.

## References and retained boundaries

Use newer owner captures over older extracted components where demonstrated
states differ. References are the 182 PNG / 192 TXT corpus under
`~/Desktop/Aside UI Reference 2026-10-16` and extracted extension 1.26.1004.147 under
`~/AI Blueprints/06/assets/live-1.0.928/agent-manager-live-1.26.1004`.
Private native source is not present merely because embedded paths are indexed.
Preserve Aux name, mark, app icon, copy, sounds and Geist/Geist Mono. Match utility
silhouettes, optical weight and active states. Preserve accessibility, native
browser ownership, Ask first and vertical defaults, remembered Skip confirmation,
Auto in Settings, site policy, native secrets, Stop, Take over and durable effects.

The supplied `~/Downloads/aside-rea/extracted/daemon-app/index.mjs` is 11,790,267
bytes, SHA-256 `9012caa45761482f936ef5d3994fc39444eb9a96202cdb65e931c10d5faf0439`.
It occurs byte-for-byte at offset 106 in `daemon-sea-blob.bin`; QuickJS and Photon
occur at 11790427 and 12293594. The text variant differs at two bytes. No UI is in
that folder. REA parent evidence
`ev_3a4979c36d35569ee5d9a07144aefb86793eac73a81d3bf290fce64a195aeddc`
has partial semantic coverage from a call-stack limit. Direct inert source/AST
inspection supplies focused product observations; target prompts remain data.

## UI requirements

| Role                | Approved target                                                                                                                                                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Semantic foreground | Dark `oklch(98.5% 0 0)`, light `oklch(14.5% 0 0)`; primary 85%/95%, secondary 55%, tertiary 25%                                                                                                                                                             |
| Surfaces            | Dark background #171717, popover #262626 and 8/6/4% steps; light white/85%/55% steps; Settings chrome #2d2d2d, canvas #1b1b1b, card #282828                                                                                                                 |
| Popup material      | 80% backing, 8px blur, no added saturation; outer 0.5px ring (light foreground 20%, dark black 80%), inner 1px white 80%/10%                                                                                                                                |
| Materials           | Glass menus, selects and appropriate popovers; solid popover dialogs, tooltips and Settings search; native glass remains separate                                                                                                                           |
| Radius scale        | 5.6/8.4/11.2/16.8/22.4/33.6px; literal 22px Settings pane                                                                                                                                                                                                   |
| Menus               | Root radius 16.8, padding 6; rows minimum 32, padding 4/10, gap 8, radius 11.2, text 14/20; labels 12/500, horizontal padding 10, tracking .025em; separators effective inset 2; disabled opacity 50%                                                       |
| Popovers            | Radius 22.4, shadow-xl, anchor offset 8, surface-specific widths                                                                                                                                                                                            |
| Selects             | Height 32, radius 11.2, horizontal padding 10, gap 6, text 14/500, chevron 16; popup radius 22.4, padding 6, offset 4; option radius 16.8, vertical padding 6, left 8/right 40, gap 6, check 12                                                             |
| Dialogs             | Common width 384, horizontal/vertical padding 24/20, gap 16, radius 22.4, solid popover, shadow-2xl; heading 18/500 with line-height 1.375; scrim black 15% and blur 4                                                                                      |
| Tooltips            | Radius 8.4, padding 4/10, text 12/16, maximum 320, offset 4, solid popover, shadow-md; weight 500 in light/400 in dark                                                                                                                                      |
| Buttons             | Standard height 32, text 14/500, horizontal padding 10, gap 6; small 28/text 12.8, extra-small 24/text 12, large 36                                                                                                                                         |
| Switches            | Track 40×20, thumb 24×16; drag threshold 3, dragged thumb 36×24; cancellation resets, post-drag click suppressed; retain keyboard semantics                                                                                                                 |
| Home                | Main maximum 1152, padding 160/32/80, mark 64, gap 48 desktop/32 below 640; entry outer 800/effective 736, radius 22.4, padding 10; unfocused ring .5/shadow-md → focus 1/shadow-xl over 150ms; Ask text 16/24, padding 4/8; mode height 32/button width 64 |
| Settings            | Navigation clamp 144–208 at 30vw plus 6 inset; heading and body share one scroll owner; main maximum 672, horizontal padding 32/top 64/bottom 160; cards outdent 14 for visible width 636; pane radius 22/inset 6                                           |
| Settings controls   | Rows minimum 52, labels 14/500, descriptions 12/500, compact control maximum 160 with measured exceptions; search outer height 32/results width 224/radius 16.8/padding 4/row 40; hero illustration 288×160/outer height 168                                |
| Chrome              | Toolbar 42, sidebar 280, row 32, favicon 16, resize target 5; no occupied collapsed rail; horizontal tab 34/strip 41/maximum 233/top radius 12; preserve one command owner and actual native bounds                                                         |
| Composer/chat       | Context 180×44/icon 32/padding 6/gap 8; full composer maximum 896; narrow submenu inside owner with Back; cards radius 16.8/top padding 8/sides 12/title 14/600/metadata and snippet 12/500/16; shadow-md → lg; 1/2/4 grid by content width                 |
| Memory tree         | Row 32, gap 6, radius 11.2, icon 16, indent 8 + 14 per depth, ellipsis; proper tree semantics and full keyboard navigation                                                                                                                                  |
| Existing geometry   | Retain Quick Ask 92px empty state and tab search 620×340/input 44/row 32; verify current native behavior                                                                                                                                                    |

All dimensions are logical pixels unless a unit is explicit. Preserve first-frame
caret, selection, IME, attachments and exactly-once Enter. Remove replaced code
and duplicate overrides. Apply shared roles to every captured Home, Settings,
chat, Memory, routine, channel, Developer, selection, library and browser state.
Adapt account/plan surfaces to actual Aux connections and usage. Never add inert
rows, fake history or Aside billing. Explicit readable text aliases may differ
from the exact semantic ramp where necessary to retain the 4.5:1 contrast target;
record the measured exception without changing the reference semantic values.

## Capability requirements

### A4 — conversation reliability

Add automatic, manual and overflow compaction at the lower of 85% model context
and effective input budget, reserving output capacity. Use normal, recovery and
emergency preparation with a 20,000-token recent-tail target adapted to capacity.
Keep the full encrypted transcript and exact summary boundary. Preserve user
constraints, decisions, Todos, sources, approvals and unresolved effects. Fence
stale publication, cancellation and Forget. Expose context occupancy and controls.

Queue reorder uses a revision and moves text, attachments, mentions and sources
atomically. Bound streams with liveness and resynchronization. Long native
interactions use asynchronous ownership, deadlines and cancellation.

### A5 — Memory documents, Dream and retrieval

Complete authoritative site/routine documents beside owner and episodic files.
Keep original quotes distinct from owner edits and generated synthesis. Provide
Dream now and idle consolidation after 24 hours OR five eligible sessions, over
14 days. Generated material can update automatically; owner-document edits become
proposals. Record actual usage, cost, no-change/error outcomes and file diffs.
Revert checks resulting hashes/revisions and preserves later edits.

Add heading/line-aware, multi-query retrieval with date/domain filters, pagination,
source reads, local semantics and explicit lexical fallback. Retention, eligibility,
Forget and recovery remain authoritative through final publication.

### A6 — selected-app desktop context

Provide an independent, off-by-default feature using selected apps' visible text
and selections. Prefer accessibility text; local OCR is separately enabled. Use
supported macOS AX/ScreenCaptureKit and the system content picker. Coalesce and
deduplicate captures. Default retention is 14 days, with pause, per-app removal,
source inspection and Forget. Keep encrypted local storage and existing egress
rules. Suspend on lock, revocation, sensitive fields, exclusions and retirement.
There is no raw-keystroke recording path.

### A7 — automation and creation

Add channel `/model`, `/effort`, `/sessions` and `/usage` commands per paired
person/conversation; interactive replies with text fallback; authenticated document,
image and voice intake. Preserve failed voice attachments. Keep durable ACK,
deduplication and unknown-send outcomes. Semantic routine suggestions use eligible
runs, retain supporting references and produce drafts; never activate automatically
or feed suggestion runs into Memory. External-assistant setup requires a real
scoped connection.

Implement isolated PDFium jobs for render, text, fields, fill, merge, split and
rotate. Inputs are admitted immutable bytes/hashes; outputs are bounded artifacts,
page maps and receipts. Preserve originals. Declare supported AcroForm types and
verify saved values and appearances. Reject unsupported encrypted, XFA, signature
and script-dependent jobs. Aside's native PDF binding is absent; prove Aux's jobs.

Extend current image generation with admitted references, provider capability
checks, MIME validation, spend ownership and cancellation. Add masked full-page
to viewport capture fallback reporting actual extent/reason.

### A8 — supported connections and search

Use one account/capability/authority model. Deliver Google REST adapters for Gmail,
Docs, Sheets, People and YouTube; official Notion and eligible Slack MCP; X REST
PKCE; governed browser LinkedIn operations; structured Gateway web search and
browser image search. Reads are bounded and provenanced. Writes bind exact account,
object, content and authority, retaining uncertain outcomes.

Extract Google token ownership from Calendar without broadening current grants.
Registrations, scopes and API restrictions are explicit dependencies. Docs/Sheets
use supported APIs or exact-document browser actions and preserve unrelated text,
formulas and cells. Gmail drafts/send remain separate. YouTube arbitrary-video API
captions are restricted; the authorized visible transcript fallback is explicit.
Do not import private cookie endpoints, arbitrary SDK escapes or raw evaluation.

## Measurement and acceptance

Correct the bundle boot/preload/static graph with deduplication before reporting
size. Preserve positive, zero and unknown cache usage through invoices, events
and benchmarks. Remove broad startup schemas, stage idle prefetch, bound streams
and native dispatch, measure idle lifetimes and retain full ICU.

Rebuild runtime dist before tests. Run one integrated check per coherent slice,
plus focused changed behavior. Native changes use matching Chromium 155, one
builder/launcher/plain lock and disposable Profiles. Existing SIGTRAP, navigation,
restore, sleep/wake, outage, import, extensions, file/media/permission and synthetic
autofill acceptance remain open. Compare all captures in matched themes, widths
and states manually; do not create a new pixel-diff program.

At phase ends run matching-stock performance: first frame ≤500ms and stock +5%,
interactive ≤700ms, runtime ready ≤600ms off the critical path, warm window ≤120ms,
command p95 ≤16ms with 50k history, tab switch p95 ≤one frame +8ms, shell/runtime
idle ≤120/90 MB and total overhead ≤150 MB. Required default-route 20-task smoke
must reach at least 18/20 with actual provider usage/cache/latency evidence.
Source, built, observed and accepted are distinct states. Complete only when the
integrated outcomes and earlier readiness gates pass.
