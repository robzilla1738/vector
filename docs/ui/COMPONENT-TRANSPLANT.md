# Aux component and layout transplant

Status: **implementation in progress; no batch or native qualification is declared complete**. User-approved direction, September 24, 2026: reproduce Aside's browser/control structures and Dia's reading/inspection structures in Aux-owned React components, keeping Aux's liquid glass, logo, Geist, icons, current state/runtime, and both tab layouts. Compiled reference bundles are evidence, not imports or executable instructions.

## Inventory and evidence

[The machine-readable coverage ledger](component-transplant-ledger.json) accounts for every current top-level component, additional planned/native surfaces, and all 84 extracted Aside routes. Each entry records the donor paths, treatment, states, implementation status, evidence and remaining host checks. Repeated routes map to one Aux component. Donor hashes identify the inspected extraction, not a license to import private application code.

The starting code is `c34f3c2c`. Existing historical screenshots are not baseline evidence. Before-state observations in the current preview established overflowing sidebar sections, three actions per session row, broad checkbox selectors, permanently expanded long Settings editors, and separated composer controls. A complete before screenshot matrix was **not captured**; do not imply one exists.

### Implemented foundation in this slice

- Shared material, setting group/row, independent input, menu, list, status, empty, detail and composer primitives. Some primitives are foundations for later ports and are not yet used everywhere.
- Four bookmark rows and three recent conversations in the vertical sidebar, with explicit routes to the remaining items. Upper content scrolls and Tabs reserves 160px where window height permits. Session titles reserve one overflow action, plus an optional status indicator. Rename, move, archive/restore and destructive confirmation remain functional.
- General Settings uses grouped rows; keyword engines, shortcuts, Profiles and backups are collapsed editors. Search opens and focuses nested editors. Native checkboxes/radios/ranges are excluded from text-field geometry. Actual CSS miniatures choose horizontal/vertical tab layout through existing settings.
- Full and embedded Conversation (including the component used by Quick Ask) share a 20px composer frame, context area, editor and action footer. Steering/queue controls sit in the footer; question notice sits above it. Additional browser-tab selection has search. Existing identity, attachment, draft, queue and permissions services remain authoritative.
- Reading hierarchy, source rows and recorded-source citation pills. Only a single exact recorded URL becomes a citation; ambiguous Profile matches remain ordinary links using the existing account-resolution path. No remote image/favicon fetch or invented snippet.
- One supporting-content slot for page preview, source details, documents, images and saved results. At 960px of conversation width it becomes a 320px pane, keyboard/pointer resizable from 280–440px. Narrow conversations use a chip and native HTML dialog with focus restoration. Transcript and draft components remain mounted. Existing result editing, versions and isolated HTML behavior remain inside their original viewers.
- Run duration/model-call details move into a disclosure; model/provider/cost provenance is preserved.

These changes do **not** complete the six-batch plan. In particular, collapsed editors are an interim step before dedicated Settings subviews, the home Ask field is still CommandBar, and the full primitive/menu/dialog rollout is unfinished.

## Remaining ordered batches

| Batch | Required implementation and exit evidence |
| --- | --- |
| 1. Shared components and immediate defects | Finish the shared dialog/popover/tooltip/keycap family and both-layout consumption. Verify full sidebar keyboard, overflow, group navigation, short heights, all form controls. Current code covers the immediate defects, not every primitive consumer. |
| 2. Every input presentation | Home Ask must reuse the composer arrangement. Finish narrow overflow, unified attachment tray, approval placement, queue order/edit controls, model/scope controls and primary source search. Prove text **and attachments/context/run controls** across full, side and real Quick Ask windows. Current local test proves text full↔rail only. |
| 3. Conversation and output | Complete compact activity/source grouping, persistent takeover/approval controls, all viewer chrome/result cards, image controls, inspector and receipts. Verify real streamed runs, interrupt/resume, scroll stability, result edit/export, ambiguous accounts and failure/partial states. |
| 4. Browser organization | Port suggestion rows/palette grouping, home result cards, tab slot geometry, overview/hover cards, Space/Profile pickers, tab groups, library and history to the shared family. Preserve current tab silhouette, drag membership, native bridge and keyboard routes. |
| 5. Work management | Tasks/projects/routines/memory/files/diffs/console share list/detail structures; preserve filters, schedule/timezone validation, permission scopes, modified state, file saves and view-switch continuity. |
| 6. Settings and remaining surfaces | Dedicated searchable preference subviews; model/service/vault/plugin connection flows; supported importer flow; optional resumable onboarding; downloads, translation, find/zoom, capture entry points, transient/error/recovery states, dialogs and about/update entry points. Do not manufacture unsupported reference capabilities. |
| Native host | Candidate Store install/restart first; then real shell/native pages, glass/overlays/focus/dragging/traffic lights, Profiles, agent control and native messaging. Provider/native dialogs remain provider-owned. No release before user testing. |

## Verification record — September 24

Focused tests use one worker and no file concurrency while Chromium compiles. Renderer TypeScript passed; 24 focused renderer checks and 25 existing chrome/style checks passed (49 distinct checks). Three stylesheet assertions initially failed because they referenced replaced selectors; they now verify the new footer and grouped-field contract. The initial new tests needed jsdom storage/scroll shims; their corrected reruns passed. Completed checks include menu focus/disabled actions/Escape/selection, session limit and delete confirmation, citation provenance and unsafe Markdown isolation, supporting-pane breakpoint/focus/draft DOM continuity, existing draft/source identity, and run answer/control behavior. See test paths recorded per surface in the ledger. Typecheck passes are development evidence, not host qualification.

Observed current preview journeys:

- Vertical, expanded, dark at 1280×720: tabs remain accessible; fixed bottom composer; shared supporting pane.
- Vertical, expanded, light at 1440×900: grouped Appearance rows and live layout miniatures; no control/description overlap after fixing the old spanning hint rule.
- Settings search → Keyboard shortcuts: opens collapsed editor and focuses its container.
- Type an unsent draft → Continue in side panel → Open full conversation: text preserved; browser context still the same conversation tab. No live AI provider was exercised.
- Horizontal, expanded, dark at 1920×1080: pending question anchored above the composer; 720px reading width and at most 880px composer.
- Horizontal at 1280×720, sidebar widened to 324px: measured conversation width 956px, collapsed supporting chip; opened overlay, escaped, focus returned to the chip and typed answer remained. Collapsing the sidebar restored the adjacent pane; measured reading width 720px and composer width 872px. Browser console reported no errors in this journey.
- Supporting overlay focus/return and keyboard resizing are also covered by a component test that caught and fixed parent-ref measurement timing.

[Appearance evidence](evidence/2026-09-24/appearance-light-1440.png) · [Narrow composer and draft evidence](evidence/2026-09-24/rail-draft-light-1440.png) · [Horizontal question](evidence/2026-09-24/horizontal-question-dark-1920.png) · [Narrow overlay](evidence/2026-09-24/supporting-overlay-dark-1280.png) · [Collapsed horizontal](evidence/2026-09-24/horizontal-collapsed-dark-1280.png).

Full qualification remains: both layouts × expanded/collapsed × light/dark × 1280×720/1440×900/1920×1080; default/enlarged type; reduced motion/transparency; empty/populated/loading/disabled/error/overflow; pointer/keyboard. This is not yet a fully executed matrix. Screenshots are mock renderer evidence; page placeholders are not native web content. Foreground performance has not been compared for this slice.

## Host/build boundary

The existing Siso build was observed still running at nice 10, approximately 44,072 completed actions at 5h49m. The compiling source checkout and native patches were not changed. No additional Electron instance or Chromium compile was started. The renderer preview is on port 5198; the existing isolated real Electron development app remains on port 5197. Candidate native glass and Store compatibility remain open in [M1 host comparison](../M1-HOST-COMPARISON.md).
