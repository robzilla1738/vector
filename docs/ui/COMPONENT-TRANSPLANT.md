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

These changes do **not** complete the six-batch plan. In particular, collapsed editors are an interim step before dedicated Settings subviews, the full primitive/menu/dialog rollout is unfinished.

### Second implementation slice — input continuity and control

- Home Ask uses the same durable conversation composer. Following user review, its default is **Search/Ask, plus, Send**. The plus opens an anchored tool popover; document/image/capture/context/dictation/full-chat controls no longer expand the input into several rows. Selected attachments and meaningful selected browser context stay visible. Search remains the existing address/search field.
- One attachment tray covers documents, images and generated results, with shared inclusion, preview and remove controls. Image capture/review logic stays in its existing component; duplicate attached-image rows are removed.
- Primary browser context, additional tabs and previous-turn selection use viewport-clamped HTML dialogs. Browser context searches available tabs and does not change selection just by searching.
- Queued follow-ups sit immediately above the editor. Editing an acknowledged cancellation preserves already typed text. Question answers and follow-up drafts now remain separate when changing send mode.
- The latest run's Stop/pause/takeover/return controls remain above the composer. Existing concurrency behavior still permits Stop during a pending pause and ignores the superseded response.
- Home avoids mounting a second draft editor while the assistant rail is open. React lazy loading remains in place.

Focused verification added nine existing CommandBar checks and three composer integration checks (61 distinct checks across both slices, including the prior 25 style checks). The new context test initially used the fixture factory incorrectly; correcting the fixture call passed. Renderer typecheck passed. A mock queue journey at vertical/light/1280×720 verified queue placement, editing without draft loss, and restoration of the separate question answer. The mock bridge gained explicit queue fixtures and preserves chat identity on new runs; these fixtures are not runtime-delivery evidence.

The user subsequently withdrew the request to maintain a live native preview while implementation continues. The existing isolated development job was restarted during that investigation; this is not native qualification. React/CSS uses Vite HMR; native-main/preload/runtime changes require an app restart. No complete native visual journey was verified in this slice.

[Minimal home input](evidence/2026-09-24/home-minimal-dark-1440.png) · [Home tool popover](evidence/2026-09-24/home-tools-dark-1440.png) · [Queued follow-up and question](evidence/2026-09-24/composer-queue-light-1280.png). The attachment screenshot from earlier in the slice predates the user's minimal-input correction. The final popover was observed with all tools, and Escape restored focus to its trigger.

### Third implementation slice — saved output and inspection

- Saved results and document snapshots share `ViewerFrame`: a sticky identity/toolbar, bounded reading content, and one close action in the supporting slot. Saved results use a single export menu with file and CSV-to-Excel actions; editing, version creation, source-change protection and isolated HTML rendering retain their existing service boundaries.
- Generated results now have transcript cards with recorded filename, version, type, size and a bounded excerpt. CSV previews render a small table, Markdown uses the existing lazy renderer, and HTML shows an inert document placeholder rather than executing excerpts. Cards open the existing result viewer. Attachments retain their independent context-inclusion controls.
- CSV inspection has sticky numbered columns (no inferred header semantics), selected rows, arrow/Home/End navigation and a row-detail section. Preview limits remain 201 rows/40 columns; export retains the full source.
- Shared action menus now mount inside an enclosing HTML dialog when present, keeping exports reachable within the modal focus boundary.

Verification: five new result-viewer/card tests plus three existing result-draft tests passed; the nine CommandBar checks and supporting-pane/menu tests passed again. Renderer TypeScript passed. The tests cover exact export content, saved-version provenance, changed-source and wrong-chat protection, row keyboard/selection reset, and inert HTML cards. Current mock journeys opened a Markdown card in the vertical/light/1440×900 pane and a CSV card in a horizontal/dark/1280×720 overlay (sidebar widened to cross the 960px conversation breakpoint). Row selection exposed its recorded values; the export menu remained inside the dialog and Escape closed only the menu. These are renderer/fixture checks, not native save-dialog or actual runtime delivery qualification.

[Result card and reading pane](evidence/2026-09-24/result-viewer-light-1440.png) · [CSV row details in narrow overlay](evidence/2026-09-24/result-table-overlay-dark-1280.png).

## Remaining ordered batches

| Batch | Required implementation and exit evidence |
| --- | --- |
| 1. Shared components and immediate defects | Finish the shared dialog/popover/tooltip/keycap family and both-layout consumption. Verify full sidebar keyboard, overflow, group navigation, short heights, all form controls. Current code covers the immediate defects, not every primitive consumer. |
| 2. Every input presentation | Home Ask now lazily uses the composer with a minimal default and a plus tool popover. Attachments use one tray, browser context is searchable, and queues sit above the editor. Finish approval/model/scope coverage and verify every narrow state. Prove text **and attachments/context/run controls** across full, side and real Quick Ask windows. Current mock journeys prove text/document/inclusion full↔rail and home handoff; actual Quick Ask remains unproven. |
| 3. Conversation and output | Complete compact activity/source grouping, persistent takeover/approval controls, remaining viewer/card consumers, image controls, inspector and receipts. Verify real streamed runs, interrupt/resume, scroll stability, result edit/export, ambiguous accounts and failure/partial states. |
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

The existing Siso build was observed still running at nice 10, approximately 51,984 completed actions at 6h54m. The compiling source checkout and native patches were not changed. No additional Chromium compile was started. An empty Electron launcher opened during app identification was closed. The renderer preview is on port 5198; the existing isolated real Electron development app remains on port 5197. Candidate native glass and Store compatibility remain open in [M1 host comparison](../M1-HOST-COMPARISON.md).
