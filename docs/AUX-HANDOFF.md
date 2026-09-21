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
| Real work | Task promotion with editable objective (`tasks.promote` binds the existing chat), background task starts, selected-tab retry when a single original tab is lost, crashed/detached originals treated as missing, missing-input continuation, specific invalid-destination recovery, safe context snapshots and redacted observations. |
| Files/results | PDF/DOCX/XLSX extraction, image/text/CSV/JSON/Markdown previews, immutable saved results with editable copies and persisted drafts, attachment reuse, CSV/full-snapshot export, values-only XLSX plus optional http(s) source hyperlinks when a cell stores them. |
| Agent vault | Optional locked vault (passphrase + OS-encrypted blobs). Opaque `cref_` grants scoped to origin and optional task. Fill via `fillCredential` never batches through engine IPC, never writes secrets into steps/observations/results. Revoke, history, expiry, origin/task mismatch fail closed. |
| Routines | Parameterized routines from saved tasks, weekday schedules and hourly monitors, versioned edits, pause, occurrence identity, no-overlap, uncertain-write block, missed consequential schedules vs coalesced monitors, review/skip, desktop-closed cloud-capable miss when `startWork` is absent. |
| Development workspace | Task workspace Preview / Changes / Files + expandable Console, unified Connections (Models / Services / Vault / Agents), incident snapshot from an authorized page or project preview. GitHub / Vercel / Sentry stay read-only. |
| Rename / migration | Schema 13 additive coordinator leases and criterion verifications. Explicit Vector→Aux copy: backup-first `VACUUM INTO`, skip secrets/cookies/password stores, strip kv credential keys, fail closed on dual roots or dest-db conflict. Runtime backup list/retention/restore UI. Retained session partitions `persist:vector-*`. |

Latest product addition: sourced conversation tables can export a values-only workbook
with an explicit Source column and http(s) hyperlinks. Excel still does **not** restore
formatting, images, formulas or arbitrary external links. Dictation is disabled with a
reason when the native capture path is unavailable. Site controls restore the opener
control on close.

`pnpm test:unit` after rebuilding runtime dist: **151 files, 746 tests passed**.

## Remaining work (true blockers and native acceptance)

Implementable P0/P1 product/code from the ordered handoff is in this tree. Do not
re-open vault/routines/migration as missing. What remains is founder-device, signed
identity, paid cloud, or native-hands-on — not silent completion.

### Host, identity, and accounts (blocked without a real path)

- Electron still does not establish Chrome Web Store, 1Password native messaging, Apple
  Passwords, or platform/synced passkeys. Do not claim those. A Chromium browser-layer
  host must keep the React shell, native tab lifecycle, trusted bridge and profile
  separation, and prove tab/sidebar controllability before any migration. CEF Alloy
  remains rejected.
- Founder-only device SSO/MFA, real microphone/TCC/conferencing, VoiceOver, and visual
  interaction acceptance still need the founder review path (`AUX_LOAD_DOTENV=0 pnpm dev`).
- Packaging, signing and notarization stay out of this checkpoint. Unsigned local
  builds cannot prove Touch ID / iCloud passkeys / 1Password browser identity.

### Native journeys still needing device proof

- Open File and download-folder pickers, cross-window transfer/session recovery, and
  extension×media×private combinations have code and focused tests; they have not had a
  full isolated-profile native walkthrough in this continuation.
- Layout CSS covers 1024 / 1280 / 1512 conversation widths. Empty / populated / loading /
  error / collapsed / recovery matrix is not a native screenshot pass.
- Multi-window context: metadata, reconnect and stale-read guards exist; selected
  text/image/region → same chat → restart with newer drafts needs native confirmation.
- Live provider-backed authenticated comparison on a real account is not claimed.
  Vault grants plus `fillCredential` are the independent implementation.

### Cloud / mutation posture (do not widen)

- Remote browser takeover, provider-side spend budgets, hosted deletion schedulers, and
  authorized GitHub/Vercel/Sentry push/PR/deploy/issue mutations remain unavailable.
  Cloud-capable routines miss cleanly when the desktop is closed and no start worker is
  configured; they do not invent a cloud run.

### Honesty limits that stay stated in the UI

- Result editing is text/Markdown/CSV/JSON, not a binary Office editor.
- DOCX import is extracted text. PDF excludes scanned text/layout.
- Spaces and task Workspaces keep distinct IDs; they are not merged by name.
- Resource write access is an Aux desktop control. CLI/MCP cannot set it.
- Local criterion checks and routine alerts are not business-outcome proof.
- Download retry after restart starts a new transfer. Partial byte-range resume
  is not implemented.

## Code map

- `apps/desktop/renderer/src/components/Conversation.tsx`, `AgentRail.tsx`, `QuickAsk.tsx`,
  `store.ts`: shared interaction, navigation, drafts and context. Preserve focus guards.
- `ConversationTask.tsx`, `SaveConversationTask.tsx`, `RunPanel.tsx`: delegation, progress,
  control and recovery. Runtime owns execution, permission and revision decisions.
- `SavedResultPreview.tsx`, `result-drafts.ts`, `DocumentSnapshot.tsx`, `WorkbookPreview.tsx`,
  `StructuredResult.tsx`: immutable results, edited copies, context previews and export.
- `apps/desktop/main/save-workbook.ts`, `workbook-export*.ts`, `document-*.ts`,
  `workbook-extract.ts`: native file boundaries and bounded workers.
- `packages/contracts/src/{csv,vault,routines,workbook-snapshot}.ts`: CSV parser, vault
  and routine contracts, optional source hyperlinks on values-only workbooks.
- `apps/runtime/src/services/{runs,tasks,vault,routines,legacy-migration,conversation-images,
  document-context,saved-results,browsing-memory,workspace-memory,spaces}.ts`: runtime
  authority, credential broker, routines, fail-closed Vector→Aux copy.
- `apps/runtime/src/store/{repo,db}.ts`: additive migrations (schema 13 coordinator
  leases and criterion verifications) and stored identity.
- `apps/runtime/src/services/cloud-environments.ts`, `agent-connections.ts`, plus local
  project modules: reuse for Phase 4. Locate current APIs before introducing new concepts.
- `apps/desktop/renderer/src/components/{VaultSettings,Routines,TaskWorkspace,
  SaveConversationTask,ConversationTask}.tsx`: vault, routines, Preview/Changes/Files/
  Console, conversational promotion, task-scoped vault grants.
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

Continuation 2026-09-21 (branch `cursor/aux-remaining-implementation-4932`):

- M0 unit debt is **cleared for the three named files**. Failures were fixture/schema/env
  lag against intended policy, not a rollback of exact host/port auth or transient-document
  routing. Focused: `mcp-stdio` (3), `operation-authority` (3), `router` (10) pass.
- Schema 13, vault/routines, journal unification, leases, criterion checks, agent
  replace, backup retention, identity fail-closed, task search, MCP catalog grouping,
  Preview/Console split, and remaining software-only Phase 2–5 items above are in this
  tree. Logical journal identities are stable across runs. Profile credential stores
  are refused, not copied.
- Full `pnpm test:unit` after rebuilding `@vector/contracts` and `@vector/runtime`:
  **151 files, 746 tests passed**. Node 22.14.0 vs engines `>=22.18.0` is a warning only.

The native XLSX acceptance above used a workbook snapshot; the latest saved-CSV-result
button reuses that native path and has binary round-trip coverage, but has not had its
own native picker walkthrough in this continuation. Avoid mistaking an earlier screenshot
for inspection of every subsequent CSS change.

Commands:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm --filter @vector/desktop typecheck
pnpm --filter @vector/desktop build
pnpm test:unit
AUX_LOAD_DOTENV=0 AUX_ENGINE=0 pnpm dev
```

Desktop typecheck force-emits unbundled main output: **run the desktop build afterward**
before launching Electron. Mock `?scenario=results` provides saved-result fixtures;
mock success is not native permission, account, file, voice or cloud success.

Use a fresh isolated profile for native work; `AUX_DATA_DIR`, `AUX_PROFILE_DIR`,
`AUX_ENGINE=0`, `AUX_LOAD_DOTENV=0`. Do not use personal profiles or hunt for personal
credentials. After a crash/restart, retry a single-tab turn only after choosing a live
tab; detached originals are missing. GitHub / Vercel / Sentry inspection stays GET-only.
CEF Alloy remains rejected. B1–B7 stay founder/device/paid-cloud blockers.