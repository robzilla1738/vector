# Aux implementation handoff — 2026-09-21

This PR captures the complete current working tree for the ongoing Aux implementation.
It is a development checkpoint, **not completion of the five-phase roadmap**. Continue
from this branch; do not rebuild already-working flows or treat old delivery gates as
current instructions.

## Read first

1. [AUX-ROADMAP.md](AUX-ROADMAP.md): current scope, product decisions, five phases and
   end-to-end acceptance experiences.
2. This document: current priorities and unresolved work.
3. [AUX-PROGRESS.md](AUX-PROGRESS.md): detailed implementation evidence, newest first.
   Older entries may say a check is pending when a newer entry completed it.
4. [Artwork provenance](../apps/desktop/brand/README.md) and
   [rejected host experiment](../experiments/cef-shell/README.md).

The user prioritizes implementation throughput, complete experiences, minimal beautiful
UI, and focused validation. Keep crisp solid surfaces, restrained blue accents, separate
optional opacity/blur controls, consistent viewport insets and readable conversation
widths. Keep secondary controls out of the default view. No placeholder controls or
unsupported capability claims. No release/launch/marketing/signing program is requested.

## Current implementation

The active phase is **3: agents that finish real work**. Phases 1 and 2 have substantial
implementation but carry unresolved dependencies; phases 4 and 5 have existing foundations
that must be extended and assessed against the current roadmap, not assumed complete.

| Area | Work included in this checkpoint |
| --- | --- |
| Identity and appearance | Approved colored icon, transparent mark, macOS iconset/ICNS, neutral shared tokens, spacing and window/panel refinements, responsive Settings and Library. |
| Everyday browsing | Space/workspace identity, vertical/horizontal tabs, multi-select/movement, split layout, pins/folders/bookmarks/imports, history, downloads, recovery, site controls/permissions/zoom, find, reader, native navigation menus, file and page output, profiles/private flows. |
| Assistance | Shared side/full-page conversation composer, mini popup, explicit page/tab/image/document context, dictation helper, draft preservation, attachment-only draft recovery/search, sources, image previews and concise run controls. |
| Memory | Inspectable Space memory, source exclusions, opt-in browsing memory, retention and correction/deletion paths; private boundaries retained. |
| Real work | Task promotion with editable objective, background task starts, selected-tab retry when a single original tab is lost, missing-input continuation, specific invalid-destination recovery, safe context snapshots and redacted observations. |
| Files/results | PDF/DOCX/XLSX extraction, image/text/CSV/JSON/Markdown previews, immutable saved results with editable copies and persisted drafts, attachment reuse, CSV/full-snapshot export, real values-only XLSX export. |

Latest addition: saved CSV results and their edited copies can export real Excel files.
Preview and export share a CSV parser, but export retains rows/columns beyond preview
limits. Cell strings (including leading zeros and formula-like text) are not coerced or
executed. Native export uses a bounded worker and atomic destination replacement.

## Outstanding implementation, in order

### 1. Finish Phase 3 file and task experiences

- Complete creation/editing/export/revision experiences across the requested file types.
  Current result editing is text/Markdown/CSV/JSON; it is **not** a full binary document
  editor. XLSX export reconstructs saved values and coordinates only, without original
  formatting, images, formulas or external links. DOCX import is extracted text; PDF
  import excludes scanned text/layout. These limits are deliberately stated in the UI.
- Continue sourced research → comparison → reusable result → human edit → next turn.
  Sources in rendered answer tables are not automatically embedded into an exported
  workbook as source hyperlinks. Do not describe current Excel export as that complete
  sourced-research journey.
- Finish conversational task promotion without making the user manage redundant task
  setup. The inferred objective is foregrounded, but an inline Save as task form still
  exists. Keep one task/conversation/context identity.
- Complete representative dynamic-site, frame/popup, upload/download, form/rich-text,
  multi-site and prepared-communication workflows. Reuse coordinator repair/observation,
  ownership and uncertain-outcome protections. Do not retry uncertain writes blindly.
- Preserve explicit multi-tab context on retries. Replacement-tab retry is intentionally
  limited to single-tab chats; audit crashed/detached original-tab eligibility in RunPanel
  before broadening recovery. Never silently narrow multi-tab work.
- Finish the authenticated comparison and prepared form/file acceptance journeys from
  the roadmap. Current builds and unit tests do not establish these experiences.

### 2. Implement trusted authenticated agent work

- The optional locked agent vault and task/account/origin-scoped credential broker are
  **not implemented**. Existing `secret-store.ts` is not evidence of a finished vault.
- Implement explicit saving, trusted fill with opaque references, short task-scoped
  access, revoke/delete/access history, account-change and expired-grant recovery.
  Never pass secret values through models, logs, page observations or result artifacts.
- Reuse existing permission/journal/review paths and show concrete destination/account/
  content before sensitive actions. Keep ordinary browsing light.
- Password-manager/native messaging/passkey support is a host dependency described below.
  Do not fake compatibility or require personal credentials to implement independent work.

### 3. Resolve Phase 1 host compatibility without discarding Aux's shell

Electron's partial extension APIs do not establish required Chrome-compatible extension,
SSO, password-manager, Apple Passwords/1Password or platform passkey support. Extension
management and managed installation copies exist; full required compatibility does not.

The pinned CEF 152 Chrome-runtime experiment **failed product acceptance**: Cmd+T opens
a separate stock Chromium window instead of a controllable tab in Aux's content surface.
It is diagnostic code, not a production replacement. Do not repeat the same experiment,
switch web content to Alloy, or replace Aux with stock Chrome chrome to claim success.
A viable host path must retain the React shell, native tab lifecycle, trusted bridge,
profile separation, layout and existing runtime control. See its README for evidence.

Carry forward everyday-browser journeys that still lack native acceptance: Open File
and download-folder pickers, site-control focus restoration, cross-window transfer and
session recovery, extension/media/private combinations, and realistic populated layouts.
Use targeted checks when finishing those experiences, not a broad compatibility campaign
that stalls unrelated implementation.

### 4. Close Phase 2 continuity gaps

Native dictation code is present, but real microphone/TCC/device acceptance remains.
Multi-window context changes need a native journey; metadata events, reconnect/focus
refresh and stale-read guards are implemented. Exercise selected text/image/region →
question → same chat side/full view → restart, retaining context and newer draft edits.
Recheck quiet layout at 1024×768, 1280×800 and 1512×982 with empty, populated, loading,
error, collapsed and recovery states. Recent native workbook preview was inspected in
the 360px assistant; this is not evidence for every surface/state.

### 5. Complete Phase 4 development/cloud experiences

Start from existing local projects, task panels, services/commands, diagnostics, diff/
review, external-agent sessions and cloud environments. Inspect actual behavior before
changing their contracts. Complete the coherent Preview/Changes/Files + expandable
Console experience, issue/incident intake and unified Connections. Preserve dirty files,
external edits, identity, checkpoints, ownership and conflict-safe local return.

Required complete journeys remain: repository/blank project → services → preview edit →
diff/check → handoff; incident → reproduction/prepared fix; cloud continuation → desktop
closed → reconnect/results → safe local return. Real provider/account prerequisites must
be recorded precisely, while independent implementation continues.

### 6. Complete Phase 5 routines

Existing tasks/programs/pools/cloud infrastructure is not proof of a finished routine
product. Implement results → reusable parameterized routine, account/site/output/review
boundaries, schedules/monitors, versioned run history, pause/rerun and meaningful alerts.
Recheck access each run; preserve timezone/occurrence identity, no-overlap defaults,
missed-run semantics and uncertain-write reconciliation. Local dependencies stay local;
cloud-capable schedules must survive the desktop closing. Finish the roadmap's monitor,
report-comparison and expired-account recovery journeys.

## Code map

- `apps/desktop/renderer/src/components/Conversation.tsx`, `AgentRail.tsx`, `QuickAsk.tsx`,
  `store.ts`: shared interaction, navigation, drafts and context. Preserve focus guards.
- `ConversationTask.tsx`, `SaveConversationTask.tsx`, `RunPanel.tsx`: delegation, progress,
  control and recovery. Runtime owns execution, permission and revision decisions.
- `SavedResultPreview.tsx`, `result-drafts.ts`, `DocumentSnapshot.tsx`, `WorkbookPreview.tsx`,
  `StructuredResult.tsx`: immutable results, edited copies, context previews and export.
- `apps/desktop/main/save-workbook.ts`, `workbook-export*.ts`, `document-*.ts`,
  `workbook-extract.ts`: native file boundaries and bounded workers.
- `packages/contracts/src/csv.ts`: lossless row parser shared by CSV preview/Excel export.
- `apps/runtime/src/services/{runs,tasks,conversation-images,document-context,saved-results,
  browsing-memory,workspace-memory,spaces}.ts`: runtime authority and persistence flows.
- `apps/runtime/src/store/{repo,db}.ts`: additive migrations and stored identity.
- `apps/runtime/src/services/cloud-environments.ts`, `agent-connections.ts`, plus local
  project modules: reuse for Phase 4. Locate current APIs before introducing new concepts.
- `apps/desktop/main/{index,private-main,native-views,extensions,browser-profiles}.ts`:
  native shell and profile boundaries. Mirror applicable private behavior without sharing
  private data or persisting it accidentally.
- `apps/desktop/renderer/src/styles.css`: shared tokens/layout, bounded preview surfaces.

## Validation and continuation

Recent completed checks:

- Root TypeScript build and desktop main/preload/renderer typecheck + production build.
- Five focused workbook/CSV checks: binary workbook round-trip, Excel limit rejection,
  quoted/multiline fields, uncoerced values and rows/columns beyond rendered preview.
- Native isolated-profile workbook import → preview → XLSX save → read-back confirmed
  sparse coordinates, hidden-sheet values and literal formula-like text.
- Native restart → search attachment-only draft → same chat → side-panel preview.
- Rendered result edit/preview/attach/discard flow in the mock app; original retained.

The native XLSX acceptance above used a workbook snapshot; the latest saved-CSV-result
button reuses that native path and has binary round-trip coverage, but has not had its
own native picker walkthrough. Latest metadata disclosure polish compiled; avoid
mistaking an earlier screenshot for inspection of every subsequent CSS change.

### PR checkpoint test result — unresolved

`pnpm build` passed. `pnpm test:unit` completed: **699 passed, 6 failed** across
143 files (140 passed, 3 failed). Do not call the full suite green. These failures were
recorded at handoff rather than changing unrelated execution policy to satisfy tests:

- `tests/unit/mcp-stdio.test.ts`: all three session tests fail. Open response lacks the
  expected `p1`, full observation is absent, and omitted-backend parameters now include
  `ownedByRuntime: false`. Inspect fixture/API agreement and MCP response errors before
  deciding whether runtime or tests need correction.
- `tests/unit/operation-authority.test.ts`: redirect test is rejected before invocation
  because its site key is `127.0.0.1` while the request host includes a dynamic port.
  Preserve exact host/port authorization; correct the fixture if that remains intended.
- `tests/unit/router.test.ts`: two assertions disagree with current transient-document
  behavior (`data:` resolves to `vector`, and `about:blank` reason is
  `hybrid:transient-document:about:`). Confirm intended policy before updating assertions.

No pre-change baseline run was made for these failures, so their regression provenance
is not established. Start continuation with focused diagnosis of these three files;
there is no need to repeat every passing test while diagnosing them. `git diff --check`
passed. The latest desktop typecheck/build passed before this final documentation pass.

Commands:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm --filter @vector/desktop typecheck
pnpm --filter @vector/desktop build
pnpm test:unit
pnpm --filter @vector/desktop dev:mock --port 5189
```

Desktop typecheck force-emits unbundled main output: **run the desktop build afterward**
before launching Electron. Mock `?scenario=results` provides saved-result fixtures;
mock success is not native permission, account, file, voice or cloud success.

Use a fresh isolated profile for native work; `AUX_DATA_DIR`, `AUX_PROFILE_DIR`,
`AUX_ENGINE=0`, `AUX_LOAD_DOTENV=0` were used for recent local checks. Temporary fixtures
and the custom test app under `/tmp` are not repository prerequisites and may disappear.
The isolated native test app was quit after the latest walkthrough. Do not use personal
profiles or hunt for personal credentials. No repository commit or PR merge is required
for continuing development; this PR is the handoff checkpoint.
