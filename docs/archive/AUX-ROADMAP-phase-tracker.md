# Aux — a beautiful browser that carries work forward

Active implementation roadmap, 2026-09-20. This supersedes previous delivery
boundaries. The previous roadmap is preserved in
[planning/aux-roadmap-2026-09-20-previous.md](planning/aux-roadmap-2026-09-20-previous.md).

> **Authority (2026-09-22):** the product and engineering direction is
> [AUX-ROADMAP-2026-09-22.md](AUX-ROADMAP-2026-09-22.md) — its work packages
> (BR/CH/AI/WS/ME/SK/TR/PL), trust rules, release sequence, and acceptance
> criteria are the release authority. This document remains the implementation
> phase tracker; where the two differ, the 2026-09-22 handoff wins.

## Direction and decisions

Build one continuous experience: browse → ask → act → continue → repeat.
Implement complete UI/runtime/persistence experiences, one phase at a time. Prioritize
implementation throughput, visual quality, simplicity, responsive browsing and agent
success. Run focused checks at phase boundaries, not repeated qualification campaigns.
A missing real account is a recorded dependency, not a reason to stop independent work.

- Space is the visible organization for tabs, folders, conversations, tasks, results
  and memory. Preserve underlying Workspace IDs and migrate with explicit identity
  mappings; never merge by matching names. Profiles isolate accounts; Spaces do not.
- Mini popup, side panel and full-page conversation share context, drafts and history.
  Small questions grow into durable tasks without a separate task-definition form.
- Library contains saved material; history remains clearly identified browsing history.
- Connections unifies services, models, external agents and MCP setup. Extensions
  retain their browser-specific lifecycle. Plugins bundle existing capabilities.
- Automatic browsing memory is opt-in. Explicit preferences and saved work remain useful
  without enabling automatic memory; private browsing never feeds persistent memory.
- Build a small optional agent vault, not a full password manager. Use opaque references,
  trusted autofill and task/account/origin grants; never expose secret values to models.
- Keep Electron unless a concrete mandatory compatibility limitation requires replacing
  the browser host. Start with the existing CEF Chrome-runtime candidate, preserving
  the React shell and runtime. Never substitute the custom engine for web compatibility.
- Follow [Aside parity direction](AUX-DESIGN-DIRECTION.md): native translucent
  sidebar by default, solid/reduced-transparency alternatives, independent tint
  and content opacity. Keep viewport insets,
  row spacing and panel proportions consistent at realistic window sizes.
- Keep neutral macOS materials, system typography, restrained Lucide icons, clear focus,
  reduced-motion/transparency support, and the established minimal sidebar structure.
- Preserve evidence, uncertainty, ownership, recovery, backups and conflict protections.
  Show concise results and controls with deeper details available on demand.

Visual implementation standard: align related content to shared columns and insets;
use the existing spacing scale rather than per-screen approximations. Size layouts for
the space actually available after sidebars and panels, not just the outer window.
Keep message/composer alignment, readable line lengths, menu anchoring, icon baselines,
text truncation, scroll boundaries and bottom padding deliberate. Long titles and
populated lists must remain composed. Optional previews yield space before primary
content does. Default surfaces are solid and quiet; expose blur and opacity as separate
appearance settings with an immediate preview and an easy reset. Avoid translucent
layers that muddy text or make neighboring surfaces difficult to distinguish.

## Phase 1 — A browser people want to live in

Outcome: attractive, responsive everyday browsing with coherent organization.

- Unify browser Spaces and task Workspaces; retain IDs, drafts, history, tabs and pins.
- Complete vertical/horizontal tabs, multi-select, drag reorder, cross-window/Space
  movement, pins with overflow, tab search, audio, split views and layout restoration.
- Finish navigation/suggestions, bookmarks/folders/import preview, history, downloads,
  uploads, clipboard, find/zoom, reader, print/PDF, private and multiple windows.
- Complete required SSO/popup/passkey/password-manager/extension/media paths; isolate
  concrete host limits instead of adding placeholder controls.
- Refine shared menus/dialogs/rows/loading/errors, Settings and empty/recovery states.
  Protect active browsing from background agent work and safe suspension regressions.
- Reuse native views, runtime pages, browser organization, extensions, downloads,
  recovery and current design tokens. Wait on decorative dashboards and custom engines.

Acceptance journeys: organize/import many tabs and bookmarks, move between windows,
restart without losing organization, browse collapsed/horizontal layouts, recover failed
navigation/downloads, use native file/media/site controls. Inspect 1024×768, 1280×800,
1512×982 with populated, empty, loading, error, collapsed and recovery states.

Phase 1 carry-forward dependency: mandatory Chrome extension/native messaging and
password-manager/passkey compatibility remains unresolved by the current host. Preserve
that requirement while continuing independent implementation in the following phases;
do not represent partial extension support as full compatibility.

## Phase 2 — Effortless assistance and useful memory

Outcome: immediate page help and easy continuation of prior work.

- Shared Search/Ask composer, panel/full-page continuity, optional global mini popup,
  selected-text/image actions, region capture, push-to-talk with editable transcript.
- Explicit context chips for pages/tabs/files/results/memory; no silent other-app capture.
- Excellent answer typography, tables/code/sources/previews, useful home continuation
  list, local search across work/history/bookmarks/results with clear type filters.
- Inspectable memory items with source/scope, corrections, deletion, site exclusions,
  retention and opt-in automatic browsing memory. Delete derived retrieval entries too.
- Reuse conversations, runs, drafts, sources, artifacts, providers and workspace memory.
  Preserve chat IDs. Wait on always-listening voice and cross-profile memory.

Acceptance: selection → answer → add tab → expand/collapse same conversation; region +
voice question with editable transcript; return to work, inspect/correct/exclude memory.
Keep controls stable during streaming and drafts intact through provider failures.

## Phase 3 — Agents that finish real work (active)

Outcome: useful authenticated multi-site/file work with understandable control.

- Conversation-to-task delegation with inferred editable objective; concise progress,
  task tabs, results and pause/takeover/resume/stop; no focus stealing.
- Dynamic sites, frames/popups/forms/rich text/files; semantic interaction plus visual
  fallback; bounded retry/re-observation and precise missing-information questions.
- Faster bounded observations, safe batching, cached context and limited parallel reads.
- Labeled account/profile selection, password-manager integration and trusted credential
  broker; optional locked vault with explicit saving, scoped fill, revoke/delete/access log.
- Sensitive-action review of concrete account/destination/content; preserve uncertainty.
- PDF/image/text/CSV/DOCX/XLSX extraction, preview, creation/editing/export and revisions;
  sourced research reports, comparisons, communications and prepared form workflows.
- Reuse coordinator/repair, programs/sets, authority/journal/takeover, secret store and
  artifacts. Wait on vault sync, payment storage, desktop control and agent swarms.

Acceptance: authenticated comparison → sourced spreadsheet; missing input → continuation;
prepare form/file → human edit → resume → review; expired grant/account change recovers
without exposing a secret or duplicating an action.

## Phase 4 — Development and cloud work that feel like Aux

Outcome: repository/app/incident work and cloud continuation in the same task.

- Task workspace with Preview/Changes/Files and expandable Console; repository/blank
  project → environment/setup/services → preview; select visible region to request edit.
- Preserve dirty checkouts, drafts, external edits, branches and recoverable conflicts.
- GitHub/Vercel/Sentry intake; Codex/Claude lifecycle; unified Connections and thin plugins.
- Continue in cloud with source/task/ownership identity, durable worker/results/preview,
  reconnect/checkpoint/return/cleanup; exact remote-browser takeover and separate auth.
- Local-only dependencies wait clearly while independent cloud work proceeds.
- Reuse local projects, commands/services, diagnostics, review, external-agent sessions,
  Vercel Sandbox, leases/checkpoints, SDK/API/CLI/MCP. Wait on IDE/provider proliferation.

Acceptance: issue → preview edit → diff/check → handoff; incident → reproduction/prepared
fix; cloud continuation → desktop closed → reconnect/artifacts → conflict-safe local return.

## Phase 5 — Successful work becomes repeatable

Outcome: useful tasks become routines with low supervision.

- Make routine from results with parameters, sites/accounts/output/review boundaries;
  manual runs, schedules and monitors in the owning Space, versioned task/run history.
- Local sessions/files run locally; cloud-capable work uses durable remote scheduling.
- Timezone/occurrence identity, no overlap by default, coalesced missed read-only checks;
  missed consequential work requires review. Every run rechecks access.
- Meaningful-change/completion/failure/input notifications; transient-read retry,
  uncertain-write reconciliation, precise recovery for expired auth or changed pages.
- Reuse tasks/programs/operations/pools/journal/memory/cloud/events. Wait on visual
  workflow builders, arbitrary trigger scripting and public routine marketplaces.

Acceptance: task → parameterized rerun/report comparison; monitor → desktop closed → one
meaningful notification → changed evidence; reconnect expired account without duplication.

## Implementation discipline

Extend shared contracts for Space identity, conversation context, scoped memory,
credential references, connection lifecycle and versioned routine occurrences. Keep one
runtime authority path across all clients and recoverable additive migrations.

After each phase, run relevant builds/type checks and affected tests; inspect actual
rendered app journeys and fix visible defects. Add regression coverage for consequential
migration/isolation/redaction/takeover/uncertain-write/scheduling logic. Avoid broad soak
periods and repeated benchmarks. Maintain concise progress here and in AUX-PROGRESS.md.

No release, packaging, signing, marketing, pricing or founder testing programs are part
of this implementation roadmap. Never discover credentials in personal stores/files.
