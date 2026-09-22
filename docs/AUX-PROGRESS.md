# Aux implementation progress

## 2026-09-22 — Roadmap phases 0–2 execution batch

- Dependencies: the roadmap review, the renderer method gate contract, the
  loopback bearer boundary and the existing routine/workspace schemas.
  Acceptance: `main` is green, lint is enforced in CI, the benchmark harness
  validates offline, and daily-driver parity items that need no host decision
  or founder Mac are shipped behind the same method-gate boundary.
- PR 17 — green-main repair. Four renderer methods were missing from the
  `RENDERER_METHODS` gate (features were dead in the packaged shell), and
  conversation run panels rendered no Pause/Stop/Work-history controls because
  `.conversation .run-status`/`.run-section` were hidden in CSS plus dead
  context/artifact branches were removed from `Conversation.tsx`. 815/815 unit
  tests pass; verified end-to-end in `dev:mock` (badge states, pause/resume,
  takeover, retry, lazy artifact fetch).
- PR 18 — oxlint in CI. `pnpm lint` runs in `runtime.yml` before typecheck;
  all error-level findings fixed; ~400 warn-level findings (jsx-a11y
  prefer-tag-over-role, exhaustive-deps, set-state-in-effect, refs) remain
  deferred behind a `--max-warnings=400` ratchet.
- PR 19 — daily-driver parity. Tracker/ad blocking on the shared browsing
  profile (curated suffix-matched host list, `mainFrame` exempt, per-setting
  toggle in Site Permissions), HTTPS certificate-error "proceed anyway" scoped
  to the shell UI and held in memory only, and Chrome/Chromium/Edge bookmark
  import (macOS + Linux profile discovery, folder-path preservation, dedupe).
- PR 20 — portable routines. `routines.export` emits `aux-routine@1`
  envelopes; `routines.import` accepts the envelope, a bare share array or a
  file path, resolves the Space by name or explicit `workspaceId`, and dedupes
  on title+objective for idempotent re-imports. Routines panel has
  Export…/Import…. Export sits in the external-client read tier.
- Benchmark harness: `tests/benchmarks/tasks/run.mjs --validate` checks the
  manifest, scorer and fixtures offline (no `AI_GATEWAY_API_KEY`) and runs in
  `runtime.yml`; real benchmark runs still need a paid model budget.
- Host decision resolved without a build: the CEF layout probe passes
  `-fsyntax-only` on Linux with the pinned SDK, and the documented macOS probe
  rejection is platform-independent — the host stays Electron. CEF experiment
  notes recorded under `experiments/cef-shell/`.
- Remaining parity items documented as Electron-capped or deferred:
  password/history import, Safari bookmarks, cosmetic ad filtering,
  Safe-Browsing API, translate and autofill (see PR 19).

## Continuation — 2026-09-21 (agent path and loaded-page shell)

This is the current shell and agent-navigation behavior. Earlier sections
below are the passes that led here.

Chromium navigation returns at DOMContentLoaded. An explicit settled wait
remains. A conversation preview and an agent stage lease are separate holds.
On a loaded page the toolbar is out of the layout until the pointer reaches
the top. A conversation shows its web tab beside the messages. Dropping a
web tab on Bookmarks saves it, and a tab menu leaves the page painted. The
window glass matches the window corner radius and stays unclipped. Numbers
for the chrome-only records run are in `docs/BENCHMARKS.md`. Details:
`docs/ui/shell.md`, `docs/api.md`, `CHANGELOG.md`.

## Continuation — 2026-09-21 (Aside parity, simpler chat, Aux branding)

Earlier ZCode entries below are historical.
Geist/Geist Mono and Central Icons replace Inter/Lucide. The sidebar closes fully
and edge-reveals; pins, sections, menus, schedules and chat/history surfaces use
the reference geometry and tokens. Native macOS Liquid Glass has older-system
vibrancy fallback, tint/content-opacity settings and reduced-transparency support.

The URL bar and both icon groups hide together and reveal on hover/focus. The
later pass above takes that row out of the layout on a loaded page. Chat no longer opens task promotion automatically, clears reply
drafts on promotion, or stacks successful completion labels above an answer.
Work history starts collapsed; safety controls remain. AI SDK stays at 7.0.93.
The new arch SVG and full-canvas silver macOS icon are integrated.

Unsigned isolated native previews were built and opened. This does not establish
signing/notarization or B1–B7 completion. Native pointer-only hover, matching-screen
comparisons and the wallpaper matrix remain unverified. See [parity audit](ASIDE-PARITY.md)
and [design QA](../design-qa.md). Current validation is recorded there.
Pre-push verification: `pnpm test:unit` passed 161 files / 782 tests;
`pnpm typecheck` passed. Native end-to-end acceptance is not implied.

## Continuation — 2026-09-21 (ZCode design pass)

Transferable ZCode UX on `cursor/aux-remaining-implementation-4932`. Not a clone. B1–B7 unchanged.

- **Palette:** Zai Dark/Light surface roles mapped onto Aux tokens (`#161616` canvas, `#202020` panel, `#2b2b2b` card/menu/input, `#001d3d` / `#ebf4ff` accent surface). Sparse `#4099ff` / `#0b7fff` links. Confirmation `--wait` is not `--ok`. Diff and find tokens are dedicated.
- **Type:** `--ui-font-size` 13px with Appearance → Interface text 12/13/14. Never `html` font-size.
- **Tool cards:** Step timeline is summary-first, expandable, nests `fillCredential`, redacts secrets, HTTP(S) chips open in Aux tabs, absolute paths use `openPath`, one-shot live entrance. Live runs expand the list in conversation and the agent rail.
- **Sidebar:** `⌘S` toggles expanded ↔ slim Aux-mark rail outside the aside. Palette can still hide completely. 7px edge hit remains for hidden.

See `docs/AUX-DESIGN-INSPO-ZCODE.md`.

## Continuation — 2026-09-21 (CI typecheck and restart retry)

CI on `cursor/aux-remaining-implementation-4932` failed two jobs. Policy was not weakened.

- **Desktop typecheck:** `conversationEntryChange` now returns `{kind:"draft"|"context"}` instead of a widened `string`. Incident prepared-fix `openPath` only runs when a path exists.
- **Integration recovery:** after restart, a crashed run’s original tab is detached and treated as missing. `runs.retry` without a replacement tab refuses with “Reopen or choose a browser tab”. Retry with a newly opened tab preserves chat identity and retry lineage. This matches the existing unit contract in `set-run-lifecycle.test.ts`.
- **Engine fallback:** a mid-program `xpath:` miss after a completed write does not migrate or replay remaining writes. The origin is recorded for the next Chromium open. This matches `engine-routing` unit coverage; the integration assertion was the stale complete-and-migrate expectation from PR 13.

B1–B7 remain unproven.

## Continuation — 2026-09-21 (unit suite green, catalog/search/journal fence)

On `cursor/aux-remaining-implementation-4932` after rebuilding `@vector/contracts`, `@vector/runtime`, `@vector/mcp`, and `@vector/cli` dist. Founder/device blockers B1–B7 are unchanged.

- **Unit suite:** `pnpm test:unit` — **151 files, 746 tests passed**. Node is 22.14.0 in this environment (package engines want >=22.18.0); that warning did not fail tests. Policy was not weakened.
- **Journal:** Logical action IDs are hashed without run id, so the same task write cannot be re-issued from a later run. Saved-operation browser-program replay imports `compileAndAuthorize`.
- **Tasks:** `tasks.list` query matches title, objective, criteria and resource labels, not locators. CLI/MCP and desktop share that matcher.
- **MCP catalog:** Connections groups scoped tools and filters by name/group. `@vector` package scope and `vector_*` MCP names stay fail-closed compatibility surfaces.
- **Backup:** Runtime backup interrupt before the manifest is treated as incomplete and skipped. Chromium Cookies, Login Data, Web Data and similar stores are classified `refuse` and never copied.
- **Phase 2/4:** Preview and Console are separate task-workspace surfaces. Conversation storage events apply another window’s draft/context without replacing unrelated chats. 1024 CSS covers empty, error, loading and collapsed states without founder screenshot acceptance. Open File dialogs are titled in the main and private shells.

Native TCC, VoiceOver, founder SSO, signed password managers, Chrome Web Store, paid cloud mutation, packaging and whole-profile cookie migration remain unproven.

## Continuation — 2026-09-21 (schema 13, journal, catalog, backup)

Software-only remainder from the remaining-work plan on
`cursor/aux-remaining-implementation-4932`. Founder/device blockers B1–B7 are
unchanged. Do not treat SSO, VoiceOver, signed 1Password/passkeys, packaging,
Chrome Web Store, or paid-cloud mutation as done.

- **Journal / Phase 3:** Schema 13 adds `coordinator_leases` and
  `criterion_verifications`. Task-level logical action IDs stay stable across
  runs. `pages.execute` without `journaled` records consequential writes.
  Operation invoke unifies into the same ledger. Coordinator leases fence
  in-process with TTL takeover. `tasks.verifyCriterion` is an honest local
  check and never inserts reviews. `tasks.replaceAgent` cancels then starts
  the same task identity. Spaces list by `workspaceId` and never merge by name.
  Resource `access` is reference/read/write; CLI/MCP cannot set write; scoped
  connections still cannot change resources.
- **CLI/MCP:** `task verify|replace|journal`, `task list --query`, read-only
  `vault`/`routines`/`backup`, `cloud reconnect`. MCP scoped catalog includes
  verify/replace and fails closed when `AUX_MCP_TOOL_PREFIX=aux` lacks a token.
- **Phase 2:** Selection→ask→restart draft tests; dictation stays disabled with
  a reason and does not spawn capture when unavailable; page capture shows why
  it is disabled; CSS breakpoints 1024/1280/1512 are unit-checked, not founder
  screenshot-accepted.
- **Phase 4/5:** MCP catalog filter UX; incident companion markdown is local
  only; `cloud.reconnectStatus` does not resume or delete remotes; shutdown
  stamps `desktopClosedAt`. Monitor coalesced reason re-emits one toast.
  Expired vault grants renew the same grantId. Routine compare is local run
  records, not business-outcome proof.
- **Backup / identity:** Settings lists complete backups, retention 3|5|10|20,
  restore-this-backup. Incomplete folders are skipped. Disk-full backup fails
  closed. `persist:vector-default` / `persist:vector-engine-paint` stay. Identity
  adapters refuse silent credential moves.
- **Browser tests:** Open File and download-folder pickers remain wired.
  Extension×media×private: managed extensions do not load into a private
  session. Print/PDF share one in-progress lock. Download retry after restart
  is a new transfer (`canResumePartialDownload() === false`).

Validation: rebuild `@vector/contracts` and `@vector/runtime` dist, then
`pnpm test:unit`. Native TCC, VoiceOver, founder SSO, signed password managers,
Chrome Web Store, and paid cloud mutation remain unproven.

## Continuation — 2026-09-21

Implementable P0/P1 product/code from `AUX-HANDOFF.md` and the remaining-work plan is in
this tree on `cursor/aux-remaining-implementation-4932`. Keep the checkpoint draft until
human review. Do not treat founder SSO, VoiceOver, signed 1Password/passkeys, packaging,
or paid-cloud mutation as done.

- **M0 unit debt:** the three named files are green. Failures were fixture/schema/env
  lag against intended policy. Exact host/port session auth and auto-mode
  `hybrid:transient-document:${scheme}` for `about:`/`data:` were preserved. Focused:
  mcp-stdio 3, operation-authority 3, router 10 pass.
- **Vault:** optional locked store (scrypt passphrase + OS `v{hex}` secrets). Opaque
  `cref_` grants, revoke/history/expiry, origin and task mismatch fail closed. Planner
  sees refs and account labels only. `fillCredential` resolves immediately before fill,
  skips the engine batch, and is stripped from step inputs. Task cards can grant the
  current page origin. Run failures that mention the vault offer Open vault. Settings
  Connections includes a Vault tab. `secret-store.ts` is still not the vault.
- **Files/tasks:** conversational promotion still uses one `tasks.promote` identity.
  Sourced tables export values plus http(s) source hyperlinks only. Excel honesty copy
  remains. Multi-tab retry still refuses to narrow; crashed/detached originals are
  missing. Representative navigate/dialog/upload/fill/type/select/fillCredential/
  download/click unit path passes without embedding secrets.
- **Routines:** fromResult parameterization, weekday 09:00 and hourly monitor, versioned
  edits, pause, occurrence identity, no-overlap, uncertain-write block, missed
  consequential schedules vs coalesced monitors, review/skip, toast on needs_review /
  missed / uncertain. Cloud-capable without `startWork` records missed. `routines.due`
  ticks every 60s in the runtime.
- **Phase 4:** Task workspace Preview / Changes / Files + expandable Console. Unified
  Connections Models/Services/Vault/Agents. Incident snapshot stays local/read-only.
  GitHub/Vercel/Sentry are not given push/PR/deploy.
- **Phase 1/2 targeted:** site-controls restore the remembered opener; dictation is a
  disabled control with reason when capture is unavailable; conversation widths at
  1024 / 1280 / 1512. Open File and download-folder pickers already exist; this pass
  did not add a native picker walkthrough.
- **Migration:** schema 12. Explicit Vector→Aux copy: backup-first VACUUM, skip
  secrets/cookies/password stores, strip kv credential keys, dest-db and dual-root
  fail closed. Settings shows Copy Vector data into Aux when a legacy root exists.
- **Validation:** `pnpm build`, desktop typecheck, desktop production build, and 101
  focused unit tests across 14 files pass. Runtime tests must run against rebuilt dist.
  Full `pnpm test:unit` was not re-run as a campaign. Native TCC, VoiceOver, founder
  SSO, and signed-identity password managers remain unproven.

## Active development cycle — 2026-09-20

The new five-phase roadmap is active. Work proceeds phase by phase with implementation
throughput and rendered product quality first; focused checks occur at phase boundaries.
Earlier delivery/qualification notes below are historical, not a stop-work instruction.

Current implementation focus: **3 — Agents that finish real work**.
Phase 2 implementation now includes unified composers, context, draft recovery, search
and memory; native voice permission/device acceptance and multi-window context journeys
remain outstanding and are not claimed complete.
Phase 1 remains incomplete on mandatory host compatibility: Chrome extension/native
messaging/password-manager/passkey support needs a viable host implementation. The
previously rejected CEF candidate is not a solution. Continue independent product
implementation rather than repeating that investigation or minor validation cycles.

- PR checkpoint validation: root build passed; the broader unit suite completed with
  699 passing and 6 failing tests in MCP stdio, operation authority and router fixtures.
  Full failure details and next diagnosis steps are in AUX-HANDOFF.md. No pre-change
  baseline was run, so these are unresolved failures, not asserted pre-existing issues.

- Saved CSV results, including edited copies, can now export real Excel workbooks.
  Preview and export reuse one CSV parser; export keeps all rows/columns beyond the
  rendered preview and preserves leading zeros, multiline fields and formula-like
  values as literal text. Five focused CSV/workbook tests and desktop build/types pass.
- This working tree is being captured as a PR checkpoint. See AUX-HANDOFF.md for the
  prioritized implementation backlog, host limitation, code map and validation limits.

- Native workbook import → preview → Export Excel → file save completed in an
  isolated Aux profile with synthetic data. Read-back confirmed sparse B7/AB105
  positions, hidden-sheet content, and literal formula-like strings. Attachment-only
  draft search also recovered the same workbook after restart.
- Document previews now have a bounded scrolling area and a sticky close/header,
  keeping the reply field visible in the narrow assistant. Workbook export shows
  one primary action; CSV, raw snapshots, and source display are grouped under
  More options. Extraction/date details sit behind About this snapshot so actual
  content receives the limited preview space. Renderer typecheck and desktop build
  pass; the bounded preview was inspected in the native 360px assistant.

- Workbook snapshots also export real `.xlsx` files through a shell-authorized native
  save dialog. A bounded worker uses the existing Excel library to preserve all sheet
  names, hidden states and sparse cell coordinates as literal strings. Excel row/cell
  limits fail clearly instead of truncating data. Writes use a temporary sibling and
  atomic rename so failed generation/writes do not replace an existing file. Original
  formatting, formulas, links and images are intentionally not reconstructed from the
  values-only snapshot. Binary round-trip/limit regressions pass; the native save-dialog
  journey was subsequently completed as recorded above.

- Workbook snapshots support Copy CSV, Export sheet and Save full snapshot. Sheet
  exports include every saved populated row and column beyond the preview limit, with
  original coordinate labels, and reuse formula-as-text CSV encoding. Excessively broad
  sparse sheets offer the lossless full snapshot rather than allocating an unbounded
  table. These exports are saved values, not reconstructed XLSX formatting/formulas.
  Desktop build/types and one focused sparse-coordinate/export regression pass.

- Saved text, Markdown, CSV and JSON outputs now support Edit copy, formatted Preview,
  export of the edited version, and Attach edited copy for the next conversation turn.
  Original artifacts remain immutable. Per-window drafts survive closing the preview and
  restart, preserve the source for change detection, and are removed on conversation
  deletion. Size/source checks, duplicate-action guards, local-storage failure guidance
  and live/archived context restrictions apply. At 1280×720 the rendered mock flow
  edited, previewed and attached a copy, then discarded edits to reveal the intact
  original; native export remains on the existing save-dialog path.

- Added an explicit Retry in selected tab recovery path for terminal single-tab chats
  whose original browser tab is gone. It preserves the original goal, context snapshot,
  chat identity and retry lineage, and uses the ordinary run-start safety checks. Saved
  task retries stay revision-controlled; multi-tab retries cannot silently narrow their
  scope to one replacement tab. Runtime/desktop build/types and three focused retry
  lifecycle checks pass.

- Agent navigation failures now distinguish an invalid destination from missing
  permission. Invalid-address failures offer Revise request (or Edit task), preserve
  an existing draft and never suggest granting broader access. Actual effect denials
  retain Review permissions. The classifier recognizes only Aux's exact boundary error;
  one focused regression test and runtime/desktop builds/types pass.

- Task promotion now foregrounds the inferred, editable objective, with task name,
  completion criteria and Space in optional Task details. Defaults remain reviewable and
  saving grants no access or starts no execution. Duplicate saves are suppressed.
- Saved tasks can choose New browser tab directly in the conversation. The tab opens
  in the task's Space in the background; delayed starts preserve newer page/Space/view
  navigation. Existing task details remain visible during refresh, and unrelated task
  events no longer reload the card. Duplicate starts are suppressed.

- Unified Work search now includes unsent text and attachment-only drafts. Results
  identify drafts, open the same conversation, and merge a saved chat match with its draft
  rather than listing it twice. Chats and search share one draft-entry representation;
  private browsing continues to exclude saved-work search. Desktop build/types pass.

- Full chat now offers Continue in side panel before the first message as well as
  after a run. The keyboard/sidebar assistant toggle performs that same transition,
  reusing the exact conversation/draft ID and existing browser tab. Existing chats select
  their latest turn; unsent attachment drafts remain drafts. This removes the parallel
  blank conversation previously shown when toggling the panel from a full-page draft.

- Attachment-only conversations now appear in Chats’ unsent drafts and the existing
  Recent expansion, even before a first message. A runtime metadata index discovers
  saved document/page/image snapshots without loading their contents, excludes removed
  snapshots and conversations that already have turns, and merges them with text drafts
  without duplicate rows. Attachment-only rows reopen the same conversation; discarding
  text leaves the saved attachments discoverable. Loading failures offer Retry.
  Runtime/desktop builds and types pass; three focused history/index tests pass.

- Saved-context mutations now emit metadata-only conversation context events after
  persistence: document/page attachments, image inclusion/removal, previous-turn
  inclusion, generated results and Space assignment. Other open views refresh that
  conversation; returning to a window, reconnecting and run completion also refresh
  context. Local mutations defer refreshes so older reads cannot replace their result;
  loaded attachment panels remain mounted during refresh to preserve capture previews.
  Disconnected views allow drafting but disable context changes. Runtime and desktop
  builds/typechecks pass; multi-window native acceptance remains to be exercised.

- Unified request presentation in the store for home, address bar and conversation
  entry points. New task tabs open in the originating Space in the background. A delayed
  start reveals its conversation/panel only if the originating page, Space and shell view
  are unchanged; otherwise the work remains available in Chats. Successful starts no
  longer erase newer prompts, and failures preserve the submitted prompt without
  replacing independently edited draft text. Desktop typecheck/build pass; eight focused
  start/draft tests pass, including delayed completion after opening Settings.

- Replaced the side panel’s separate composer with the shared Conversation experience.
  New side-panel chats now use the existing attachment/page snapshot, voice, context,
  memory, options and error-recovery flows. Recent work is behind one header button;
  Set views no longer carry an unrelated chat composer.
- Added an explicit side-panel draft identity so attaching context before the first
  message stays in the panel and expands into the same full conversation. Deleted
  conversations also clear that draft view. Shared send handling suppresses duplicate
  submissions, blocks sending while disconnected, retains newer draft text, and respects
  IME composition. The composer stays editable while reconnecting.
- Checked the rendered panel at 1280×720: quiet empty state, compact aligned composer,
  Recent/return preserves text, and expansion retains the same draft. Desktop types
  and production build pass. Native attachment/voice end-to-end coverage remains
  separate from this rendered mock check.

- Keyboard and command-palette Open File share one flow. File selection opens a new
  tab in the originating Space rather than replacing an existing document; activation
  occurs only while the originating browsing context is unchanged. Picker cancellation
  does nothing, duplicate pickers are suppressed, and keyboard picker errors are surfaced.
- Palette Print now uses the same page eligibility/error path as keyboard Print.
  Desktop typecheck/build and two focused file-picker cancellation/failure/newer-navigation
  checks pass. Native file-picker acceptance remains pending.

- Zoom responses are scoped to the latest request and original document, preventing
  delayed reads from overwriting newer values or applying after navigation. Saved website
  sizes serialize resets, invalidate older reads, coalesce events during reset, and
  restore keyboard focus when a reset removes its row. Page zoom offers Refresh zoom
  after errors and ignores obsolete error responses; repeated mutations are guarded.
- Focused out-of-order/navigation zoom coverage passes. Native zoom/reset interaction
  remains in the phase acceptance pass.

- Saved site permissions now separate action failures from refresh failures. A confirmed
  reset removes only the affected decision and remains reported as successful even when
  the follow-up read fails. Older reads cannot restore superseded decisions; repeated
  reset/clear submissions are guarded immediately. Focus/visibility refresh picks up
  changes made elsewhere, and native-dialog completion restores appropriate focus.
- Desktop typecheck/build and a focused confirmed-reset/failed-refresh check pass,
  including duplicate-click suppression and no misleading empty-state claim.

- Shared Settings fields now expose named groups and associated help text. Search
  destinations retain programmatic focus but announce the setting's name and context;
  replaced unattached label elements while retaining the existing appearance styling.
- Rendered search → Tab layout placed focus on the named Tab layout group with its
  guidance attached, and the Appearance layout remained aligned. Preview tab closed.
  Desktop typecheck/build pass.

- Find exposes a direct Retry action after search failure, retaining the query and
  returning focus to its input. Retry respects a missing/loading native page. Closing
  Find invalidates its outstanding error response before stopping highlights.
- Find and Reader no longer handle Escape while an input method is composing text,
  preserving composition instead of closing the active reading/search surface.
  Native IME interaction remains part of keyboard acceptance.

- Profile creation keeps the returned profile immediately and closes its creation form
  before opening the new window. A launch failure clearly says the profile was created
  and offers recovery through its existing Open button. Removed a redundant list read
  that could leave the creation form active after success and encourage duplicate profiles.
- Profile mutations invalidate earlier list reads, preventing a delayed focus refresh
  from replacing updated profile state. Desktop typecheck/build and a focused
  create→launch failure→Open recovery check pass, with one creation request throughout.

- Connection project discovery now associates Vercel/Sentry results with the exact
  team/organization and checked connection that produced them. Switching scope hides
  earlier project choices immediately. Out-of-order results/errors and responses after
  unmount are ignored; default project loads read the current scope after connection
  refresh rather than a captured render's settings. No credentials or permissions changed.
- Desktop typecheck/build pass. Authenticated project-picker interaction remains a
  dependency for the Connections acceptance journey.

- Settings saves now use the existing settings-change event instead of refreshing the
  whole browser workspace. Connection checks refresh only settings, with stale-read
  protection. This removes unrelated tab/layout/download reads from preference changes.
- Model discovery runs when Connections → Models is visible and rejects obsolete
  provider/endpoint responses. General-only local diagnostics/status reads run only in
  General. Desktop typecheck/build pass; full rendered Settings flow remains in the
  phase acceptance pass.

- Native isolated-profile acceptance: Back history opened at the navigation button,
  selecting the prior entry reached New Tab, and Forward history restored the original
  Example Domain page and split layout. Site controls rendered with current security,
  zoom and cookie details. Cancel in the native clear-data sheet returned without a
  success notice or data deletion. The isolated app was quit afterward.
- Fixed two details exposed by that pass: blank history entries now read New tab;
  site-control actions restore their initiating button after native dialogs when focus
  returns to the document body, without overriding newer focus or page navigation.
  The latter focus restoration still needs a native follow-up on the rebuilt app.

- Back/Forward now expose native per-tab history menus through right-click or Down
  while the button is focused, in both regular and private windows. Entries are ordered
  nearest first and jump directly to the selected history index. Private history stays
  in its native page process; regular IPC enforces the existing owning-window check.
- Menu selection rechecks the history stack and current index before navigation so
  an intervening navigation cannot redirect a stale selection to another entry.
  Desktop typecheck/build and two focused ordering/stale-stack checks pass. Native
  menu placement and interaction remain for the rendered phase acceptance pass.

- Sidebar and toolbar share the same Back/Forward/Reload/Stop implementation, including
  blank-page handling and navigation availability. Shift-click Reload now uses the
  existing native reload-without-cache path in both layouts; the tooltip explains it.
  Keyboard hard reload now reports rejected native actions through the existing error UI.

- Site controls distinguish unavailable site details from failed reset/clear actions.
  Read failures offer Refresh details; action errors leave the relevant controls
  available without implying that a refresh repeats the action. Reset/Clear controls
  show progress, duplicate actions are guarded immediately, and cancelled native data
  clearing does not trigger a needless refresh or success notice.

- Download save-location details load only when expanded, with localized loading,
  failure and retry feedback. Download additions no longer trigger folder reloads.
  Folder selection invalidates older reads so stale results cannot replace the new
  location; private browsing does not request the persistent folder setting.
- File errors remain beside their downloads, while folder errors stay in Save location.
  Existing folder details remain usable during refresh. Native folder-picker interaction
  remains for the phase acceptance pass.

- Bookmark editing now presents labeled Name/Address/Folder fields in a contained
  inline editor with aligned Cancel/Save actions. Fields and Cancel lock during save,
  and the address disables spelling/capitalization assistance. Successful updates use
  the runtime bookmark event instead of fallible redundant post-save list reads.
- Rendered the editor at 1280×720 and completed a mock rename through Save, observing
  the updated row and success message. Desktop typecheck/build pass; preview closed.

- Library history and bookmark rows now use a quieter shared two-line layout: title
  and visit time share a baseline, addresses truncate cleanly, and secondary actions
  use compact icons with accessible names and tooltips. Full title/address text remains
  available on hover. Removed repeated row borders and reduced excess vertical padding.
- Inspected the rendered mock Library at 1280×720 and 1024×768, including history and
  bookmarks. Columns stay aligned and more entries fit without wrapping the actions.
  Temporary preview tab and viewport override were cleaned up.

- Toolbar, sidebar, command-palette and keyboard bookmarking now share one store action.
  It suppresses duplicate requests for the same address and leaves the runtime event
  in charge of the bookmark list, preserving folders and changes from other windows.
  Removed two manual appends that could duplicate an already-announced bookmark, plus
  an unnecessary whole-workspace refresh from the sidebar. Errors preserve saved state
  and release the pending action for retry. Private windows do not persist bookmarks.
- Two focused checks pass for event-before-response ordering, duplicate suppression,
  preserving folder metadata, and failure/retry behavior.

- Session recovery supports Retry all with sequential progress and Stop after the
  current tab. Individual failures remain beside their saved tab and do not prevent
  later tabs from reopening. Leaving the recovery surface stops the remaining queue;
  failed and unattempted entries keep their existing durable runtime records.
- Recovery refresh clears resolved list errors, while operation failures stay local
  to the affected row. The compact home entry remains quiet after recovery completes.
  Desktop typecheck/build and two focused partial-failure/stop checks pass. Native
  multi-window recovery presentation remains part of the phase acceptance pass.

- Saved-task navigation now discards superseded requests and stops activation when the
  user changes tabs, conversations, Spaces, panels, or overlays during loading. Archived
  Spaces can be restored without activating them until the requested task is ready.
- Desktop typecheck/build and two focused navigation checks pass: a delayed task does
  not displace Settings, and out-of-order requests open only the newest selected task.

- Conversation history refreshes now retain the loaded range instead of replacing an
  80+ conversation list with the first 40 rows. Refresh reads respect the API's page
  limit, stale responses are discarded, duplicate load requests are guarded, and retry
  preserves the failed refresh mode. Existing rows remain available during refresh.
- Refresh captures the visible conversation anchor and restores its offset when the
  user has not scrolled elsewhere. History rows support Arrow/Home/End navigation;
  search supports Down to enter the list and Enter to open the first result.
- Desktop typecheck/build and a focused 40→80→refresh component check pass, confirming
  that all 80 loaded conversations remain. Native scroll-anchor behavior and keyboard
  presentation remain for the rendered phase pass.

- Source-history refresh failures now have an inline Retry action and retain previously
  loaded sources. Changing conversations clears the previous conversation's source state;
  a failed load is no longer silently presented as an answer without references.
- Run loading now fetches metadata and steps without eagerly reading page-observation
  artifacts. Page details read their snapshot only when opened, with loading, readable
  failure feedback, and retry of the exact selected artifact. Stale requests are ignored
  after changing/unmounting the run. Sources and runtime evidence remain intact.
- Desktop typecheck/build and focused run-control checks pass, including no artifact read
  while Work history is collapsed or merely expanded, followed by Page read and retry.
  Full-app source failure presentation remains for phase validation.

- Turn images now live in a collapsed Images gallery. Opening it loads image bytes
  on demand, three previews at a time, with Show more for the remaining saved images.
  Long conversations no longer eagerly fetch every turn's screenshots or insert large
  image blocks into the answer flow before the user requests them.
- Each image has independent loading/error/retry behavior; one unavailable artifact
  does not hide successful previews. Metadata refresh failures are recoverable, and
  images above the existing 8 MB preview limit are explicitly counted rather than
  silently omitted. Labels say saved image rather than assuming every image is a screenshot.
- Desktop typecheck/build and a focused rendering check pass, verifying no image-byte
  reads before expansion and preservation of a usable image beside a failed read.
  Full-app gallery sizing remains for the rendered phase pass.

- Live-run Pause/Resume/Take control/Return control now share immediate duplicate-action
  guards and persistent inline error feedback. Stop remains available during another
  pending control request and supersedes that request's UI feedback; late responses do
  not clear Stop's busy/error state. Runtime state remains authoritative.
- Takeover completion opens its browser tab only while the user remains in the same
  browsing/conversation/panel state. Unmounting invalidates pending UI callbacks.
  Returning control now surfaces failure directly instead of swallowing it into a toast.
- Desktop typecheck/build and a focused rendered-component check pass, covering duplicate
  Pause dispatch, Stop availability while Pause waits, and preservation of Stop failure
  when the earlier Pause fails later. Native agent-control walkthrough remains pending.

- Retrying a conversation turn now has a shared per-run pending guard and visible busy
  controls. Repeated clicks while the request is pending do not submit another retry.
  Completion follows the new turn only if the user stayed in the same browsing/chat/
  panel/overlay state; otherwise the run remains available without replacing newer navigation.
  Existing runtime retry and uncertain-action guards remain authoritative.
- Answer copying now reports clipboard failures and cleans up its feedback timer.
  Desktop typecheck/build and two focused retry checks pass, covering single dispatch,
  navigation preservation, and normal conversation continuation.

- Rendered inspection exposed two answer inputs for one agent question. Conversations
  now show the question in the thread and use only the bottom composer for its answer;
  standalone run panels retain their own input. Both share per-run saved drafts and
  duplicate-send protection. Ordinary conversation drafts remain separate and preserved.
- Answer submission no longer depends on loading unrelated context or the availability
  of a previously selected tab. Failures stay inline with the kept reply. Dictation
  inserts into the active question draft and respects the pending send state.
- Page inspection in conversations is now revealed with Work history instead of adding
  another persistent technical row. Observation-only turns still expose Work history.
- At 1280×800 the rendered synthetic needs-input flow showed one composer, preserved
  its typed reply from side panel to full page, and continued the run after Send. No
  provider or external communication was used. Temporary tab/viewport cleaned up.

- Completed restart recovery for unsent agent-question replies in regular browsing.
  Drafts use independent per-run storage entries, restore only validated bounded data,
  and carry conversation identity so deletion also clears drafts for unloaded turns.
  Private windows explicitly bypass draft storage. This supersedes the session-only
  limitation recorded in the previous entry.
- Storage events synchronize replies between regular Aux windows. Successful submission
  removes its stored draft only if question/text still match; a newer cross-window edit
  remains intact. Storage failures retain the in-memory answer and surface a warning.
- Desktop typecheck/build and five focused persistence/submission checks pass. These
  establish restore, private storage bypass, invalid-entry handling and newer-draft
  preservation; a native restart/cross-window walkthrough remains pending.

- Replies to agent questions no longer disappear before submission succeeds. A shared
  per-run pending guard prevents duplicate sends across mounted views; failures retain
  both prompt and reply, and success clears only the exact submitted draft/prompt so
  a newer question is preserved. Session-memory drafts survive switching views and are
  removed with deleted conversations; they are not persisted across application restarts.
- The question reply is now multiline with Enter/Shift+Enter behavior, composition
  handling, sending state and inline failure feedback. Incoming questions do not steal
  keyboard focus. Read-only conversations cannot send replies through this control.
- Desktop typecheck/build and three focused submission checks pass: failure retention,
  duplicate-send protection/newer-question preservation, and success cleanup. Native
  provider interaction and a full rendered question/reply journey remain pending.

- Long answers now support local heading links, including Unicode and repeated heading
  names. Targets are scoped to each answer without global IDs, so one conversation turn
  cannot steal another turn's section navigation. Following a link scrolls and focuses
  the target with a visible keyboard outline; smaller heading levels share answer styling.
- Desktop typecheck/build and four focused heading/Markdown checks pass, including actual
  React rendering, same-answer target focus, literal code copying, and existing untrusted
  HTML/image restrictions. Updated the copy-code check to target its named action after
  the earlier Wrap control was added. Full-app long-answer inspection remains pending.

- Tab Overview's existing Move menu now includes a new window and other regular Aux
  windows, reusing the group-transfer path that preserves Space/folder placement and
  reports partial outcomes. Private windows do not offer regular-window transfers.
- Selected tabs with native audio state expose one contextual Mute/Unmute action.
  Agent/external-controlled tabs are excluded, control is rechecked before each change,
  and a failure reports how many changes completed. Mixed selections mute unmuted tabs;
  fully muted selections unmute. No controls appear in the ordinary unselected overview.
- Desktop typecheck/build and whitespace checks pass. Native batch audio and Overview
  window-transfer walkthroughs remain for phase validation; no mock compatibility claim.

- Library keyboard continuation now dismisses the current bookmark/folder editor or
  import preview before closing the dialog. Explicit cancel returns to search, folder
  navigation/view changes discard the old location's folder editor, and completed actions
  recover focus when their trigger disappears. Input composition does not close Library.
- Recently Closed supports the shared arrow/Home/End row navigation, and Enter from its
  search field reopens the first available matching tab. Existing single/group recovery
  paths remain authoritative. Desktop typecheck/build passed before the final composition
  guard; a full rendered keyboard walkthrough remains for phase-level validation.

- Library selection can now move saved bookmarks directly into a new named folder in
  the current collection. The name field appears only for that destination; ordinary
  browsing gains no extra controls. Completion refreshes folders and returns focus to search.
- Folder creation and movement share the same regular-store transaction. Private
  browsing validates the whole selection and destination before mutating its isolated
  collection. Stale selections, existing names and deleted parent folders fail without
  moving bookmarks or leaving an empty destination behind. Concurrent title edits survive.
- Root/desktop builds and desktop typecheck pass. Focused regular/private move tests
  cover creation, conflicts and rollback. The rendered mock moved two selected bookmarks
  into Research tools, showed its two-item folder, and restored search focus. Fixed an
  earlier extraction test's NodeList iteration typing so the root build remains clean.

- Page recovery no longer suppresses a failed reload just because the original navigation
  error is still present. Reload and Back now share an immediate in-flight guard, show
  action-specific progress, and keep failures on the recovery surface instead of a
  transient toast. Edit address remains available while recovery runs.
- Added distinct recovery guidance for refused connections (including local development
  servers), interrupted connections, and blocked page loads. Existing certificate
  protection remains unchanged; no bypass control was added. Desktop typecheck/build
  and whitespace checks pass. These changes have not yet had a native recovery walkthrough.

- Downloads now associates transfer/open/reveal/retry failures with the affected file
  instead of showing an ambiguous shelf-wide error. Folder and list failures remain
  at shelf level. Rows have accessible file labels and readable wrapping for errors.
- Download actions stack beneath filenames in narrow panes; folder controls and shelf
  headings wrap without squeezing the file column. After an action removes its focused
  control, focus returns to download search; retained controls regain focus when needed.
- Desktop typecheck/build pass. The populated mock at 1024×768 with a wide sidebar
  demonstrated the row-local retry error and removal-to-search focus recovery. This
  checks presentation using synthetic downloads, not a live transfer or filesystem open.

- Refined home and empty-chat centering: balanced home padding replaces the bottom-heavy
  offset, and the empty conversation centers within its available thread area instead
  of using a fixed top offset. Loading and history errors no longer compete with the
  empty greeting. Existing drafts and composer placement are preserved.
- Settings now responds to its actual pane width. A wide browser sidebar no longer
  squeezes a desktop-sized settings layout into the remaining space: categories become
  a compact horizontal strip, content padding contracts, and appearance fields stack.
  Solid, quiet surfaces remain the default; no extra controls were introduced.
- Read-only inspection of Aside informed spacing and hierarchy, without treating its
  visible controls as evidence of implemented capabilities. Rendered Aux home/chat at
  1280×720 and Appearance at 1024×768 with a wide sidebar were checked. Desktop
  typecheck/build and whitespace checks pass; temporary preview and viewport cleaned up.


- Structured Chromium extraction now uses one browser-side reader for first/all matches
  and whole-page text, replacing duplicated walkers. Recognized password/autocomplete/
  OTP values are masked before attributes or text leave the page, including open shadow
  roots and whole-page echoes before truncation. Original DOM fields stay unchanged.
- Missing single matches remain null; missing attributes in all-match results remain
  empty strings. Ordinary text, metadata attributes and nested shadow text stay readable.
  First-match extraction also removes the separate count/read round trip.
- This closes the structured extraction gap alongside observation collection; arbitrary
  evaluation, network responses and screenshots remain distinct access paths, so this
  is not a claim that task-scoped credential isolation or an agent vault is complete.


- Completed the observation redaction follow-through for known protected field values:
  headings, page title, accessibility names, ordinary editable echoes, table captions/
  cells and shadow summaries redact before truncation. A cached ordered value list
  avoids repeatedly sorting credentials for each observed element.
- Added a long synthetic credential case echoed into labels/headings/tables/shadow
  text. Both source-collection checks pass; root and desktop builds pass. Protection
  remains limited to values recognized in the observed form scope, not arbitrary
  secret discovery, screenshots or page-script execution. Vault work remains separate.


- Found and fixed an authenticated-work boundary gap in Chromium observation collection:
  password values previously entered raw snapshots before downstream model rendering
  masked some outputs. Collection now emits a fixed redaction marker for filled password,
  current/new-password autocomplete and one-time-code fields; empty fields stay empty.
- Input types normalize case, protected custom validation messages are omitted, and
  known protected values are removed from collected main/shadow text and element labels.
  Browser DOM values themselves are unchanged. This is prospective observation protection,
  not a claim to scrub historical artifacts, arbitrary page scripting or screenshots.
- A focused DOM regression covers mixed-case password types, revealed-password
  autocomplete, OTP, open shadow roots, validation messages, empty fields and ordinary
  editable text. It passes without real credentials. The optional task-scoped vault and
  trusted autofill broker remain unfinished; no vault control was introduced.


- Advanced independent Phase 2 context work: attach multiple open tabs from one
  searchable selection. The picker respects the five-snapshot limit, retains selection
  while searching, and removes successful items from retry selection after partial
  failure. Each saved snapshot still checks page/document identity in the runtime.
- One conversation ID and attachment lock cover the batch. Switching conversations
  stops starting further reads; completed snapshots stay in their owning conversation.
  Explicit selection never sends the draft or starts a model request. Failures remain
  visible even when creating a chat remounts the picker; keyboard focus returns locally.
- Rendered selection of two tabs produced two named snapshots in the same conversation
  while preserving its draft. Desktop typecheck/build passed. Native host compatibility
  remains the outstanding Phase 1 dependency; the full roadmap is not complete.


- Overview's existing Move menu now offers New tab folder. Name it inline, see the
  destination Space, and group selected open tabs without closing them. Creation uses
  the shared tab-move operation, committing folder and placement in one layout write;
  stale Spaces and empty selections fail before creating an orphan folder.
- Clarified the separate Save bookmarks action so saved bookmark folders and open-tab
  folders are distinguishable. Completed actions restore search focus when the removed
  form/selection would otherwise leave keyboard focus on the document body.
- Rendered two-tab grouping created the expanded sidebar folder with both tabs intact.
  Desktop typecheck/build passed; this batch uses existing move/Space validation.


- Tab Overview can select duplicate tabs within the current search/Space view. It
  groups exact addresses separately per Space, keeps the active or most recently used
  copy, and excludes agent-controlled/worker tabs. It only selects: users can then use
  existing move, save or guarded group-close actions, with grouped reopening preserved.
  The control appears only when redundant tabs exist; no permanent menu was added.
  Desktop typecheck/build and the focused selection check pass, including preservation
  of query/fragment differences and separate Spaces. Rendered interaction is left for
  the phase-level Overview check.


- Split-view creation now shares an availability rule across tab actions, command
  search and the store. External Chrome, engine, worker, detached, failed and ordinary
  blank tabs cannot create a nonfunctional pair. Existing pairs remain saved through
  temporary page failures; renderer visibility is recomputed from current page state.
- Native layout also checks the companion's live registry identity, window ownership,
  browser type and content before reserving space. Missing/foreign/destroyed companions
  leave the primary page full width rather than a blank second pane.
- Development previews now render both synthetic documents using the same divider
  geometry. Inspected the populated pair at 1280×720; these remain explicit mock pages,
  not a claim of live website compatibility. Desktop typecheck/build passed.
  The organization check exposed a missing default split ratio in newly created layouts;
  added it so saved and restored layouts share the same canonical shape.


- Split views now have a quiet draggable gutter, arrow-key resizing, Shift for larger
  steps, Home/End limits and Enter/double-click reset. The chosen proportion is saved
  with browser layout, with bounded pane widths and matching shell/native geometry.
  Regular and private native windows share the same geometry; drag updates stay in
  memory until release rather than writing storage on every move.
- Native two-page check confirmed pointer dragging, keyboard adjustment, reset and
  leaving/returning to the primary tab at its chosen proportion. Rendered pages retained
  their content and the gutter stayed aligned. Unsupported/failed/blank companions no
  longer reserve invisible native space. Private geometry uses the shared code but this
  batch did not separately exercise a private-window drag.
- Root build, desktop typecheck/build and two focused geometry checks passed. The
  isolated test app was closed; the user's browser profile was not used.


- Finished native dictation session cleanup: final/error events terminate the helper,
  ignore later output and release ownership. A disconnected renderer also ends capture.
  Six focused simulated-helper checks cover pending cancellation, cross-window/session
  isolation, hidden-window cleanup, timeout, terminal output and disconnected recipients.
  Desktop typecheck/build pass; no microphone was activated.
- Dictation now handles Escape within its own surface. Cancelling capture preserves
  partial words for review; Escape from review collapses to a quiet Review dictation
  control without deleting text. Explicit Discard remains the action that clears it.
  Rendered synthetic capture → Escape → review → Escape → reopen retained the exact
  transcript and keyboard focus; desktop typecheck/build and diff check pass.

- Added hold-Space-to-talk when Dictate is focused, alongside click-to-start/stop.
  Key release ends recording into review; release during startup cancels capture.
  Losing window focus releases a held recording, and repeated keydown does not restart.
  An already-ended stop request now recovers into review instead of hanging.
- Uninserted dictated text is a separate window-local draft keyed to the conversation.
  Changing surfaces stops capture and restores editable review on return. Insertion,
  explicit discard and conversation deletion clear it; it is not written as memory or
  a sent message. Sending while recording stops capture without erasing its transcript.
- Synthetic rendered check confirmed Space release → review, leave/return → same
  transcript, and Discard → clean trigger with focus restored. Desktop typecheck/build
  and diff check pass. Native microphone/permission/TCC validation remains outstanding;
  the synthetic check does not establish speech-recognition accuracy or live capture.

- Advanced independent Phase 2 work while the browser-host compatibility limitation
  remains: added a native macOS on-device dictation helper, trusted-shell session broker
  and conversation transcript review. Explicit start/stop/cancel, editable preview and
  Insert into message preserve the existing draft and never send automatically.
- Recognition checks on-device support before capture and requires it on the request;
  there is no cloud transcription fallback. Audio stays in memory. Session IDs and
  WebContents ownership isolate controls/events; pending start is cancellable, recording
  ends after 60 seconds, and hiding/closing/reloading/crashing the owner stops capture.
  Native usage descriptions and a Swift development build are included.
- The helper compiles and read-only status reports en_US support on this Mac. Rendered
  synthetic record → stop → edit → insert retained the draft and keyboard focus at
  1280×720; fixed the initial focus loss and kept the trigger in the composer toolbar.
  Desktop typecheck/build and diff check pass. No real microphone was activated.
- Voice remains incomplete pending native permission/capture validation, hold-to-talk,
  and surface-transition continuity. See apps/desktop/native/README.md. Neither phase
  is marked complete; normal browser-host compatibility work remains outstanding.

- Bookmarks and browsing history support Command/Ctrl-click and middle-click to open
  separate background tabs in the current Space. The Library remains open with concise
  feedback; normal clicks retain existing-tab reuse and foreground navigation. Selection
  mode remains a selection action, and saved URLs reject embedded credentials.
- Rendered middle-click retained the current page and Library. Fixed focus restoration
  to wait until controls re-enable, then confirmed focus returns to the opened row.
  Desktop typecheck/build and diff check passed; temporary preview closed.

- Tab duplication now creates a separate page beside its source, preserving the source
  Space and surviving folder before activating it. It does not silently reuse an
  existing matching address or claim to clone navigation history/form state.
- Close other tabs now uses the shared guarded group-close operation, so unload
  cancellation, agent control, concurrent closes and grouped reopening behave like
  multi-selection. Added Close tabs to the right for horizontal tabs; targets resolve
  from current ordering at action time and a missing anchor performs no close.
- Desktop typecheck/build, existing grouped-close/recovery checks and diff check pass.
  These menu changes remain for the phase-level rendered integration check.

- Completed reviewed-copy installation to match managed extension updates: the native
  dialog describes the copied snapshot that will load, rather than the mutable source
  folder. Review is required by the manager API; cancellation removes staging without
  loading code. Duplicate installs are reserved across windows while review is pending.
- Installation failure unloads any partially loaded copy before removing its files.
  Two focused regressions cover source changes during review, concurrent duplicate
  requests, cancellation and partial-load cleanup. All nine extension lifecycle checks
  pass; desktop typecheck/build and diff check pass. Native dialog integration remains
  part of the phase-level check, not inferred from the manager tests.

- Added reviewed updates for managed unpacked extensions: choose a replacement folder,
  review the copied snapshot and additional declared access, then replace the same
  managed path/identity. Disabled extensions stay disabled; enabled extensions restart.
  Content-script matches and optional declarations now appear in access descriptions.
- Updates serialize against other lifecycle changes, retain the previous code until
  successful loading, and restore it on load failure. Startup restores an interrupted
  pre-commit replacement before loading extensions. This preserves code and enabled
  state; it does not reverse changes an extension makes to its own storage while running.
- Seven extension lifecycle checks pass, including reviewed-snapshot stability, cancel,
  disabled restart, failed-load rollback and interrupted-update recovery. Desktop
  typecheck/build pass. Rendered populated settings and disabled-update feedback at
  1280×720 using explicit synthetic fixtures; native chooser/dialog flow remains for
  the phase-level integration check. Preview closed.
- Revisited pinned CEF source: the one-Chrome-BrowserView constraint remains; no host
  replacement was made and no claim of complete Chrome/password-manager support added.

- Pinned-site order now persists through the shared layout store. Drag visible pins
  or overflow entries onto another pin to reposition them, with a restrained drop
  outline. Context-menu Move to front / earlier / later actions provide keyboard
  access and let overflow sites become visible without enlarging the pin row.
- Movement uses stable URL and Space identities, preserves other Spaces, and ignores
  missing targets. Rendered keyboard movement from last to first retained page
  selection and focus at 1280×720. Typecheck/build and diff check passed; preview closed.
  Pointer drag and overflow movement still need their phase-level rendered check.

- Pinned sites now open a compact context menu instead of immediately unpinning on
  right-click. Visible pins and overflow entries support new/background tabs, URL
  copying and explicit Space-scoped unpinning. Command/Ctrl-click and middle-click
  open background tabs; ordinary clicks reuse an existing tab in the current Space.
- Added Shift-F10/context-menu keyboard access, bounded menu positioning, Escape
  dismissal and focus restoration. Pins retain button semantics for accessibility.
  Rendered the menu at 1280×720, opened a background tab with the original selected,
  and exercised keyboard open/dismiss. Typecheck/build passed; preview closed.

- Native regular windows now use the selected page title plus Aux/profile identity,
  updating on title changes, selection/layout, transfers and profile rename. Tab-move
  destinations share the same page naming and show “New Tab” instead of about:blank;
  destroyed views are handled safely. Quick Ask retains its separate identity.
- Window title updates avoid redundant native writes and reuse the current profile
  name without reading its file during window resizing. Desktop typecheck/build and
  diff check passed; this naming change has not had a separate native UI exercise.

- Added Website sizes to Appearance and Settings search: inspect saved origin/percentage,
  search the list, reset individual sites, and see loading/empty/error/retry states.
  Reset persists before applying to open native views. Cookies and permissions remain
  separate; regular-profile data is not exposed to private-window settings.
- Native zoom changes/reset notify open settings and page-zoom controls across regular
  windows. Existing per-origin bounded persistence and private-session isolation remain.
- Rendered a 110% saved site → Settings search → full-width Website sizes row → reset
  → default-size empty state at 1280×720. Fixed the initial narrow control-column layout
  based on the rendered result. Two persistence/reset checks, desktop typecheck/build
  and diff check passed; preview closed. Native cross-window update remains unexercised.


- Unified trusted-shell web-link opening across answer Markdown, conversation sources
  and Reader. Command/Ctrl-click and middle-click create a background tab in the current
  Space without closing the conversation/Reader. Ordinary clicks retain foreground
  behavior. Links still reject non-web schemes and embedded credentials.
- Sources are semantic links with modifier support. A live tab is reused only when its
  current address equals the cited URL; a reused page ID that navigated elsewhere no
  longer takes the user to unrelated content. Invalid source URLs are omitted from
  both the list and count.
- Rendered Command-click from Reader created an unselected article tab while retaining
  Reader and the original active tab. Shared helper covers answer/source modifier paths;
  their individual UI paths were not separately exercised in this batch. Closed preview.


- Added a compact Reader Contents outline derived from the sanitized heading tree.
  Available for articles with multiple sections, with nested-heading indentation,
  keyboard navigation, Escape/outside dismissal, and focus moved to the chosen heading.
  Outline placement follows the toolbar height without shifting the article.
- Article extraction now preserves bounded source anchor identifiers as inert data.
  Same-article links scroll/focus their retained section inside Reader; external or
  unavailable targets retain the existing open-tab behavior. No page HTML is injected.
- Rendered outline at 1280×720; selecting the final section closed it and moved reading
  focus/scroll. Following the article's return link focused the first section without
  leaving Reader or opening another tab. Desktop typecheck/build and diff check passed;
  temporary preview closed.


- Removed native-window focus feedback: the window focus event now reports the selected
  tab to the runtime without sending another native focus command. Runtime rejects
  notifications for unknown/agent-owned tabs or mismatched window owners, then records
  active identity and emits the selection update.
- Extended session-recovery coverage to assert focus reporting does not issue native
  focus calls and cannot change another window's selection. Root/desktop builds and
  desktop typecheck passed.
- Native isolated-profile recheck restored the two fixture tabs, selected/moved the
  group into one new window, and showed the original foreground tab selected in that
  destination. Switching native windows stayed responsive; the earlier feedback issue
  did not reproduce. Quit the isolated app after the check.


- Native isolated-profile check passed keyboard range selection → close two tabs →
  Command+Shift+T recovery, restoring both addresses in order and the former foreground
  tab. Group move created exactly one destination window containing both selected tabs.
- That native transfer exposed a real focus failure: the source renderer attempted to
  activate an already-transferred tab and correctly hit the cross-window ownership
  guard. Fixed focus selection inside the transfer contract/native operation instead.
  Background group members now preserve destination focus, while moved events carry the
  destination active tab. Window isolation remains enforced; no cross-window bypass.
- Root/desktop builds, desktop typecheck, three transfer checks and diff check passed.
  The follow-up native target became unresponsive during window-menu interaction after
  restart, so corrected foreground behavior is not yet claimed rendered-verified. Quit
  the isolated app; original user profile remains untouched.


- Added durable grouped closed-tab recovery. Group closes save original order and
  foreground identity; Command+Shift+T reopens the newest retained group. Recently
  Closed offers Reopen group alongside individual reopening. Existing 20-tab/30-day
  retention and private-session storage boundaries remain in effect.
- Reopening a group loads tabs in the background, restores Space/folder placement and
  original positions, then focuses the former foreground tab. Duplicate URLs reopen
  separately instead of reusing another live tab. Failed opens retain recovery entries.
- Tab Overview now uses the shared guarded group-close operation with its existing
  Stop/progress controls, so all group-close entry points record the same recovery data.
- Focused checks cover cancellation, overlapping close calls, grouped order/foreground
  recovery, duplicate-address independence, and stored-metadata bounds. Native rendered
  group recovery remains in the phase validation queue.


- Finished keyboard integration for tab multi-selection: Command/Ctrl+A selects the
  available tab list, Delete/Backspace closes the selected group, Escape clears it,
  and Command+W uses the shared selection while in browsing mode. Text inputs keep
  native selection/editing behavior; both orientations share the handlers.
- Group close now has one guarded store action reused by keyboard and context menu,
  rejects overlapping requests, checks ownership before each close, and stops on
  beforeunload cancellation. Async completion does not clear a newer selection;
  keyboard focus returns to a remaining tab only if it otherwise fell to the body.
- Two focused checks passed for cancellation and overlapping close requests. Desktop
  typecheck/build and diff check passed. Native keyboard/focus behavior remains part
  of the phase-level rendered check.


- Expanded the shared native audio/video context menu with play/pause, media mute,
  looping, controls visibility, and picture-in-picture entry/exit. Capability-dependent
  actions follow Chromium's media flags; regular and private pages share the behavior.
- Actions target the originating frame, match the media source without interpolating
  executable input, traverse open shadow roots, and refuse ambiguous or missing media.
  Changed frames and rejected playback show a concise native error instead of failing
  silently. Media streams no longer need a download URL to expose playback actions.
- Two focused script checks passed for target isolation/open shadow roots and duplicate
  source refusal/quoted input. Desktop typecheck/build and diff check passed. Native
  playback/PiP remains a phase-level rendered validation item.


- Enabled selected-tab groups in native window destinations. New window is created by
  the first transfer and its returned ID is reused for subsequent tabs; existing-window
  destinations use the same flow. Snapshot Space/folder placement before source events
  remove tabs, preserve the prior foreground tab, and keep private-window boundaries.
- Validate all selected tabs before starting, retain runtime per-tab ownership checks,
  and stop on the first failed/uncertain result. Report confirmed count and advise
  checking both windows rather than claiming unconfirmed tabs stayed put or retrying.
- Three focused renderer-store checks passed: destination reuse and placement retention,
  uncertain-result stop/no retries, and agent-control preflight. Native group-transfer
  UI exercise remains outstanding; existing native single-tab transfer is reused.


- Added shared transient multi-selection to vertical and horizontal tabs: Command/Ctrl
  toggles, Shift ranges, keyboard modifier activation and Escape clear. Selection is
  scoped to the current Space, excludes agent-owned/detached tabs, and has restrained
  outlined styling distinct from the foreground tab.
- Existing tab menu now offers grouped move/close actions. Folder moves reuse one
  persisted layout update, open the destination, and support removing a group from its
  folder. Close walks the selected pages and stops on cancellation; no extra toolbar.
- Group dragging reorders the selected tabs together or moves them into folders while
  preserving selection order. Individual window movement remains available; moving an
  entire selection across native windows is still outstanding.
- Rendered Shift range, Command toggle, Escape, three-tab folder move in both layouts,
  and selection styling at 1280×720. Restored the mock folder/layout and closed the tab.
  Desktop typecheck/build and diff check passed. Drag and cancelled-close paths were
  implemented but not separately driven through native UI in this batch.


- Completed direct image-reference previews from composer chips, sharing the saved
  preview with the context panel. Images can be reviewed without reopening all context
  controls; chips now provide removal using existing conversation ownership and locks.
- Preview reads have loading, retry and close states, cancel stale responses on chat
  changes, and disappear when the image is removed. Document/image previews are mutually
  exclusive when selected from composer chips. No model request is made to inspect one.
- Rendered paste → review → attach → close context → chip preview → close at 1280×720.
  Typed draft remained intact, the saved image and inclusion state displayed correctly,
  and the preview stayed within the composer column. Restored clipboard and closed the
  temporary tab. Desktop typecheck/build passed; removal was not driven in this UI check.



- Added PNG/JPEG/WebP paste and file drop to full-page/embedded conversation textareas.
  Images enter the existing preview/crop flow and are saved only on Attach image. Text
  paste remains native. Input enforces one file, 16 MB, 64 million pixels and four saved
  images; conversion strips metadata and uses existing bounded PNG normalization.
- Reuses conversation image ownership, busy state, archive/run locks and attachment
  storage. Async reads cannot attach into a different conversation. Unsupported file
  drops explain using Attach for documents; text drafts are retained through review.
- Rendered a synthetic clipboard image → review → saved 16×16 reference. A second paste
  preserved existing draft text and was cancelled without sending. Restored the empty
  preview clipboard, cleared the test draft and closed the preview. Desktop typecheck,
  build and diff check passed. Drag/drop shares the input path but was not separately
  driven through native UI in this batch.



- Consolidated AI setup into one Connections Settings category with Models, Services
  and Agents tabs. Removed separate top-level Models/External agents entries. Existing
  model/agent deep links map to the correct view; search results identify and open the
  relevant Connections tab without losing field focus or setup state.
- Preserved all existing provider credentials, service integrations and scoped external
  agent controls. Agent rail’s Set up agent button now targets model setup directly.
  Keyboard tab navigation and category scroll reset remain integrated with Settings.
- Rendered Connections at 1280×720, opened GitHub through search (Services selected),
  and opened Agents with existing Codex/Claude/MCP setup intact. Desktop typecheck/build
  and diff check passed; temporary preview closed. This consolidates existing setup,
  not a claim of new extension or provider capability.



- Continued independent Space organization while the documented CEF host limitation
  remains unresolved. Chats now offers All Spaces/current Space filtering with scoped
  search, archive browsing and pagination. Unbound older chats and unsent drafts remain
  available in All Spaces; existing conversation IDs and history are unchanged.
- Runtime filtering uses the current explicit conversation-to-workspace assignment
  before limiting results, avoiding cross-Space leakage or missed pages from renderer
  filtering. Space reassignment emits a conversation change event to refresh open lists.
- Focused regression covers complete multi-turn groups, old prompt search, tied cursors,
  reassignment, archive state and unbound history. Rendered the current-Space empty state
  and return to All Spaces. Root/desktop builds, desktop typecheck and diff check passed;
  temporary preview closed. Phase 1 host compatibility is still not complete.



- Library search now finds bookmark folders, including empty folders, and shows their
  full paths. Opening a result clears the global search, enters that folder, resets
  the result scroll and restores search focus. Empty-state wording distinguishes
  bookmark/folder results correctly.
- Keyboard navigation now includes folder rows and primary saved-page rows: Down from
  search enters results; arrows/Home/End move through the list without row-action noise.
  Enter opens the first matching folder; IME composition does not trigger navigation.
- Rendered check: empty Reading folder is searchable and opens with Enter; Down selects
  the first folder and End reaches the final saved page. Desktop typecheck/build and
  diff check passed; temporary preview closed.



- Added Library bookmark selection and bulk Move. Selection can span searches/folders;
  Select this view adds the visible results. Destination controls appear only during
  selection, with unrelated main-toolbar actions hidden and keyboard focus contained
  among visible controls. Normal rows return after a successful move.
- Added the shared API contract and desktop-only runtime handler, atomic repository
  operation, private-memory operation and preview behavior. Entire selections validate
  before mutation: removed/moved bookmarks or missing destinations stop all changes.
  Concurrent title edits are preserved; duplicate inputs do not double-count moves.
- Focused regular/private checks passed. Rendered at 1280×720: created Reading, selected
  ChatGPT and Kagi, moved both, received “2 bookmarks moved” and the destination count
  updated to 2. Root build, desktop typecheck/build and diff check passed. Preview closed.



- Restructured Settings into a persistent title/close header and a separately scrolling
  content column. Category and query changes reset their reading position; search
  destinations still reveal and focus the exact field after opening advanced groups.
  The content viewport supports keyboard scrolling and reserves scrollbar space.
- Rendered at 1280×720: Browser health search reveals the lower settings with General
  and Close still visible; switching to Models opens at scrollTop 0. Desktop typecheck,
  build and diff check passed. Temporary preview closed.



- Added profile-scoped site zoom persistence and navigation restoration for regular
  browser pages. Private windows share only a memory-resident preference set for their
  session. Reset removes the override; saved origins exclude page paths and queries.
  Writes replace the preference file atomically, validate restored entries and bound
  stored sites. Failed writes report that the live size changed but could not be saved.
- Site controls explain the preference lifetime. Focused storage checks cover restart,
  reset, origin isolation, private-session isolation and malformed entries. Desktop
  typecheck/build and diff check passed. A full native quit/relaunch journey remains
  part of Phase 1 validation; no personal browser profile was opened or changed.



- Unified page zoom controls and keyboard shortcuts around shared browser percentages
  (25–500%). Directional changes are resolved against the live native page zoom, so
  repeated shortcuts and buttons remain consistent; explicit/relative API levels and
  reset remain supported. Regular and private windows use the same implementation.
- Preview zoom now maintains real per-page state. Rendered check: two Zoom in actions
  reach 125%, Cmd-minus reaches 110%, Cmd-zero resets to 100%. Focused native-helper
  checks cover custom starting levels, boundaries, reset, invalid values and closed
  tabs. Root/desktop builds, desktop typecheck and diff check passed; preview closed.



- Added complete time-range browsing-history cleanup: last hour, 24 hours, seven days
  or all time, with a fixed confirmation cutoff that preserves newer visits. The same
  range contract works in runtime storage, private windows and the preview. Clear
  feedback reports the removed count; cookies, bookmarks, files and memory remain.
- History bulk deletion now follows individual deletion’s desktop-only authority;
  external callers cannot erase browser history. Strict range validation rejects
  reversed, negative and invalid bounds. Focused tests cover interval boundaries,
  newer visits, bookmarks, repeat deletion, contracts and authority (14 checks passed).
- Inspected the time-range panel at 1280×720 without clearing user history. Root build,
  desktop typecheck/build and diff check passed; temporary preview closed.



- Replaced noisy cross-category Settings filtering with concise searchable destinations.
  Search matches category, labels and descriptions, supports multiple words and trims
  whitespace. Results open complete settings groups, focus the matching field and
  expand diagnostics when needed. No-match feedback and keyboard result navigation
  are included; normal category contents remain intact.
- Rendered at 1280×720: opacity finds Sidebar appearance without unrelated controls;
  Browser health opens diagnostics and focuses its field; an unmatched query shows
  the empty state. Temporary previews closed. Desktop typecheck/build and diff check
  passed. Search indexes product descriptions rather than private setting values.


- Integrated Find into Reader instead of replacing Reader with the original page.
  Cmd+F and next/previous shortcuts target article text, including title and inline
  formatting. Search uses the same shared text-surface finder as conversations.
- Reader keeps its article mounted, with an in-flow search bar above the reading
  viewport. Closing search restores article focus and keeps the found reading
  position; Back to page remains the explicit exit from Reader. Search state resets
  when leaving the view and handles article loading/content changes.
- Added a populated Reader fixture. Rendered at 1280×720: calm → 1 of 4, Shift+Enter
  → 4 of 4, Escape → Reader remains open with reader-scroll focused and scroll offset
  preserved near the last passage. Temporary preview closed. Desktop typecheck,
  build and diff check passed.


- Fixed Find in full-page conversations searching the browser tab behind them.
  Conversation mode now searches loaded message text with native CSS highlights,
  next/previous wrapping and match counts. Phrases can span inline formatting;
  controls and hidden content are excluded. Page mode retains native page search.
- Streaming/loaded-message changes refresh counts and ranges without automatic scroll
  jumps. Closing Find clears highlights and returns keyboard focus to the conversation
  reading area without moving the viewport. The placeholder/help clearly scopes search
  to loaded messages rather than claiming to search unloaded history.
- Rendered at 1280×720: searching comparison highlights two message occurrences;
  Enter advances to 2 of 2; Escape closes Find and focuses conversation-scroll.
  Temporary preview closed. Final desktop typecheck/build and diff check passed.


- Unified browser-menu keyboard behavior: arrow/Home/End navigation plus bounded
  typeahead for Spaces, tab/folder menus, More and pin overflow. Editable search fields
  retain normal typing. Details menus open from Up/Down and restore their trigger on
  Escape/Tab; More now exposes menu/menuitem semantics throughout.
- Space/tab/folder menus keep stable dismissal listeners while parent state changes,
  preventing background updates from resetting keyboard focus. Folder actions now use
  native buttons for Enter/Space activation, and folder popups clamp to their measured
  viewport bounds instead of guessed dimensions.
- Rendered keyboard journey: Arrow Down opens More with Chats focused; typing d
  focuses Downloads; Escape closes it and restores More. Temporary preview tab closed.
  Desktop typecheck/build and diff check passed; typeahead state also resets on
  arrow navigation and dismissal so rapid reopen does not reuse an old search.


- Finished download cleanup and restart recovery: the native host now reconciles
  previous-process transfers absent from its authoritative live set into durable
  interrupted records. Current-process and live/resumable transfers are preserved.
- Completed, cancelled and interrupted history entries can be dismissed individually
  or cleared within the current search/filter. Runtime removes only inactive records
  and their source metadata; native regular/private handlers protect live transfers.
  Files remain on disk. Cancelled status is neutral rather than an error color.
- Added populated mock downloads and reviewed the rendered shelf at 1280×720:
  Needs attention → Clear list removes only failed/cancelled rows; All retains the
  completed file and active progress row. Tightened sidebar More-menu accessible
  labels and Escape returning focus to its trigger.
- Final root/desktop builds, desktop typecheck, diff check and five focused download
  persistence/recovery/UI checks passed. Native restart reconciliation and
  private cleanup were not separately driven through the OS in this slice.


- Added PDF text import to conversation attachments and task evidence through the same
  native picker and bounded extraction worker. Snapshots include page numbers and
  explicit markers for pages without embedded text; the preview explains OCR/layout
  limitations. Password-protected, unreadable, textless and oversized PDFs have
  actionable recovery messages. The original file is unchanged.
- Bundled matching PDF.js standard fonts and character maps for local resource reads.
  The parser receives document bytes only; it does not render pages, evaluate document
  scripts, follow links or fetch remote resources. PDF reading shares existing 16 MB
  source / 512 KB text / 15-second worker limits, with a 500-page ceiling.
- Desktop build/typecheck, focused attachment-contract checks and diff check passed.
  The built worker extracted a two-page fixture, retained the empty-page marker,
  rejected textless and corrupt fixtures, and loaded bundled font data without a
  network lookup. Native picker/rendered PDF preview and encrypted/CJK documents
  were not separately exercised in this slice; the shared Word/Excel UI was inspected
  in the preceding work.


- Replaced raw workbook JSON in agent context with compact sheet/cell references.
  Each sheet receives a fair share of the shared document budget, so a long first
  sheet does not hide later decisions. Hidden-sheet and saved-formula semantics remain
  explicit, and partial references are labeled in the model context.
- Attachment reads now return the exact prepared context text and its full reference
  length alongside the unchanged saved snapshot. Show included text displays that
  actual reference rather than guessing a prefix of workbook JSON; ordinary text
  snapshots retain their prior behavior and older clients remain compatible.
- Root build, desktop typecheck and 23 focused lifecycle checks passed. The new
  integration check covers sparse cell coordinates, a large first sheet, a later
  hidden sheet, unchanged source, bounded context and preview/run-context equality.


- Completed Excel (.xlsx) import through the shared native document picker, isolated
  extraction worker, conversation attachments and task evidence. Word imports now
  use the same supported task-evidence contract instead of failing at that boundary.
- Workbook snapshots retain sheet names/hidden state, row and column coordinates,
  rich text, dates, errors and saved formula results. Formulas are never evaluated;
  missing results are labeled. Charts/images/formatting are explicitly excluded.
  Existing source size, text size, worker memory and time bounds apply.
- Added a shared lazy document preview: compact sheet switching, cell-coordinate
  table, empty-sheet state, bounded visible rows/columns and full stored source.
  It preserves the exact included-context preview and leaves the composer visible.
  Attachment excerpts use sheet names instead of exposing internal JSON.
- Final root/desktop builds, desktop typecheck and diff checks passed. Two focused
  input-contract checks passed. Built worker
  checks covered sparse coordinates, cached/missing formulas, hidden sheets and Word
  regression. Native picker → import → table → empty sheet rendered successfully in
  the isolated development profile. No model request or external upload was made.


- Added native Word (.docx) conversation attachments through the existing document
  picker and stored-text snapshot flow. A separate bounded worker extracts plain text;
  16 MB source / 512 KB extracted-text limits and a 15-second timeout provide clear
  recovery messages for oversized, empty, corrupt, or slow documents. No source path
  is passed to the parser and extracted HTML is never rendered.
- Updated conversation input contracts to accept Word snapshot names and added a
  preview note that images, formatting and page layout are excluded. The original
  document remains unchanged; existing context inclusion and removal controls apply.
- Root/desktop builds and desktop typecheck passed. Two focused document-boundary
  checks passed; the built worker handled ordinary, empty, oversized-text and corrupt
  DOCX fixtures. Native isolated-profile picker → import → preview was exercised with
  actual extracted text and a rendered layout review. No model submission was made.



- Added durable conversation.changed/deleted events after rename, archive, restore
  and deletion. Open windows now update titles/archive state, and Recent/History refresh
  without requiring a restart. Metadata requests cannot overwrite a newer received event.
- Archived conversations show a compact Restore to reply notice, preserve draft text,
  and disable reply, attachment mutation and retry controls. Restoring keeps the same
  chat identity. Deleted conversations clear matching cached turns/steps/observations,
  drafts/context and recovery pointers; an active deleted view becomes a fresh chat.
- Updated mock lifecycle events and added an archived conversation fixture route.
  Rendered archived → restore: reply/attachment controls become available on the same
  conversation. Root/desktop builds, typecheck and 22 lifecycle checks passed; new
  assertions cover the exact persisted rename/archive/restore/delete event sequence.
  The real two-native-window event flow remains unexercised in this slice.


- Fixed multi-window draft persistence exposed by Quick Ask: writes no longer replace
  a whole cached draft/context map. Each conversation now owns its storage entry, so
  editing another chat in a second window cannot erase a newer draft from the first.
- Existing v1 maps remain readable; per-entry values override them, and empty entries
  prevent deleted legacy text/context from reappearing. Malformed legacy JSON does not
  hide healthy newer entries. Storage events synchronize only the changed conversation
  and ignore stale events whose value no longer matches saved storage. Private windows
  remain excluded from persistent cross-window synchronization.
- Five focused draft/context checks cover independent writers, legacy restoration,
  deletion, malformed legacy data and event classification. Desktop typecheck/build and
  diff checks passed. This is a storage/lifecycle fix with no new visible controls;
  simultaneous edits to the same conversation still follow the latest saved edit.


- Implemented Quick Ask as a compact native window using the existing conversation,
  draft, attachment, context and runtime paths. File → Quick Ask / Cmd-Shift-Space
  opens it while Aux is active. General settings offers an optional system-wide
  shortcut, persisted per profile, with collision/error feedback and unregister on quit.
  It does not capture other apps. Global registration succeeds in the isolated fixture;
  invocation from another app via automated synthetic input did not succeed and remains
  unverified. Native menu/local shortcut invocation did succeed.
- Expand promotes that same window into a full browser, retaining conversation identity,
  draft and owned task tabs. Closing the compact window hides it while another regular
  window exists; reopening reuses it. Escape dismisses it. Opening settings or other
  full browser surfaces expands it. No separate chat store or conversation copying.
- Native isolated-profile exercise: opened at 580×640, typed a draft, hid/reopened and
  retained exact text, expanded and retained it in the full conversation. Reviewed the
  centered empty layout, automatic input focus and quieter title bar. Corrected a General
  settings checkbox width inherited from generic field styles. No live model submission
  was made in this fixture, so network answers and task-tab continuity still need that
  focused exercise. Desktop build/typecheck passed. Original user profile untouched.


- Unified text-result eligibility and filename handling across conversation context,
  search and previews. JSON reports are now searchable and previewable alongside CSV,
  Markdown and plain text. Internal observations are excluded by both filename and
  parsed content; filtered JSON candidates no longer consume the search result limit.
- Added formatted JSON and a readable CSV table/source switch. CSV parsing preserves
  quoted commas, escaped quotes, embedded newlines, empty cells and BOM handling;
  malformed files fall back to their original text. Large tables show bounded previews
  with their full row/column counts. Copy/export still use the original stored content.
- Rendered CSV search → preview → source at 1280×720. Table columns align, the reply
  field remains visible, and the source view preserves quoted data. Root build,
  desktop typecheck/build and 26 focused result/conversation/CSV checks passed. This
  extends the prior saved-results slice; binary document previews and full body search
  remain future work rather than implied capabilities.


- Added saved text results to universal search and its Work filter. Filename,
  conversation title and turn objective find complete Markdown/plain-text/CSV outputs
  up to 256 KiB. Results carry conversation provenance; archived conversations and
  internal observations stay out, and deletion removes results through the existing
  artifact/run lifecycle. Search does not scan result bodies or binary documents yet.
- Selecting a result opens its conversation and the actual saved content with Markdown
  rendering, tables, copy and export. Existing conversation Results entries can open
  the same preview. Missing/unreadable results have a retryable error; external agent
  clients cannot use the new cross-conversation search/read endpoints.
- Rendered search → result → preview at 1280×720. Corrected the preview height after
  finding it pushed the composer out of view; content now scrolls independently and
  leaves the reply field and actions visible. Added a results mock scenario for this
  complete path. Root/desktop builds and desktop typecheck passed; the focused result
  service check covers filename/provenance search, internal/binary rejection, archive,
  deletion and saved-content retrieval. Native export reuses the existing save dialog;
  a fresh native export was not exercised in this slice. Voice/global mini popup remain
  open Phase 2 work; no placeholder controls were added.


- Fixed a real memory integration gap: conversation memory still read only the old
  freeform field. Settings and conversations now share the validated storage reader,
  preserving individual notes and source exclusions. New replies include active notes
  while excluding paused, expired and excluded-source items; retries retain old context.
- Chat's Memory section now offers a collapsed preview of the exact prepared notes
  and browsing-reference text, using the same runtime output used for context assembly.
  Memory changes refresh open chat context, and browsing references contribute to its
  context indicator. Opening Memory on a new chat resolves the current Space without
  closing the panel when the draft receives its permanent conversation ID.
- Completed mock conversation/Space assignment and initialized its default Space
  consistently with the sidebar. Rendered the Memory panel and empty prepared-context
  state at 1280×720; bounded scrolling keeps the composer visible. Root build, desktop
  build/typecheck and 37 task/conversation checks passed, including the new integration
  assertions for note filtering and exact inspected context in a run.


- Completed the opt-in browsing-memory experience: Memory settings now provides the
  per-Space switch, 7/30/90-day retention, searchable remembered titles/addresses,
  reopen, individual forgetting and inline-confirmed forget-all. Saved notes and
  browsing references share the clearly named Space memory pause control and site
  exclusions. The mock bridge supports the same settings lifecycle.
- Foreground recording waits five seconds, requires an active native browsing tab,
  and stops during overlays/conversations/private browsing. Main independently checks
  actual window focus and stage visibility. Successful recording stops its retry
  interval; policy/exclusion changes refresh the recorder. Runtime expiry now sweeps
  inactive Spaces every minute in addition to startup and reads.
- Native isolated-profile exercise passed: enabled memory, browsed Example Domain,
  reopened settings and inspected its saved title/address, searched to a clean empty
  state, then paused and confirmed the record remains available. Reviewed the native
  rendered settings and scroll layout. The original profile was not changed. Forgetting,
  expiry, stale/hidden/agent rejection and context isolation remain covered by the
  focused service tests; live model use was not exercised.
- Root build, desktop build/typecheck and the three browsing-memory service checks
  passed for the implementation. Phase 1 host compatibility limits remain open;
  independent Phase 2 memory/context work continues without claiming phase completion.


- Added the backend for opt-in per-Space browsing memory. It stores at most 200 page
  titles/addresses, strips query strings/fragments, coalesces revisits, and supports
  7/30/90-day retention plus individual/all-record forgetting. It reads no page bodies,
  forms or credentials. Existing per-profile runtime/storage isolation is reused.
- Recording requires enabled policy, unpaused Space memory, a visible human-owned
  native page at the expected document epoch, and an unexcluded HTTP(S) source. Main
  additionally checks the focused window, actual visible stage and absence of overlays.
  Agent, hidden, loading, stale and excluded pages are rejected. External clients cannot
  manage or record this memory. Retention physically prunes on startup and reads.
- New conversation context may include six recent allowed metadata references, explicitly
  labeled as unread page contents/untrusted reference. Pausing/exclusions apply again at
  retrieval; historical run snapshots remain unchanged. Policy/forget events are ready
  for the renderer to refresh across windows.
- Root build, desktop typecheck and 25 focused browsing/lifecycle checks passed. No user
  control is exposed yet: opt-in/review UI, foreground recording hook, periodic expiry
  sweep and native end-to-end exercise are the next implementation work. Default is off.


- Native selected text can now become a sourced Space memory draft via Remember
  selection. The action opens the owning Space's Memory settings for explicit review
  and save; existing memory drafts are never overwritten. Non-web sources do not expose
  local paths. Switching Spaces during loading preserves the draft without stealing
  focus back to the original Space.
- Selection drafts preserve the supplied text, show truncation/character-limit details,
  and require shortening to 2,000 characters before saving. The per-Space draft reader
  accepts the larger temporary review payload. A new/edit draft focuses its note field.
- Root/desktop builds and desktop typecheck passed. Native isolated Example Domain
  selection → actual context menu → sourced draft → explicit Save note completed,
  with a saved per-note row and source visible afterward. No automatic model call or
  silent memory save occurred. The isolated app was closed afterward.


- Added per-Space memory site exclusions with explicit add/allow controls. Stored
  addresses normalize to exact HTTP(S) origins; credentials are rejected and duplicates
  coalesce. Sourced notes remain inspectable/searchable but are omitted from new model
  context and included-context counts. Subdomains/ports, unsourced notes and overview
  text remain separate; the UI explains this scope and does not imply browsing blocks.
- Exclusions preserve existing notes and survive legacy edits. Revision checks protect
  concurrent changes. Reloading externally changed overview content no longer silently
  advances an older draft's revision. Background Settings refresh retains the current
  editor, expansion and focus; shared input styles cover the new controls.
- Root/desktop builds, desktop typecheck and 17 focused memory/task checks passed.
  Rendered Settings flow added and displayed an exclusion at 1280×720. Automatic
  browsing memory and automatic retention deletion remain subsequent work.


- Space memory now supports up to 40 individually inspectable user-authored notes,
  each with an optional source, expiry, timestamps and inclusion control. Add/edit,
  pause, delete and search reuse revision-checked Space persistence. Existing freeform
  notes remain intact and are exposed as an optional Space overview, initially collapsed
  when empty. Item edits preserve overview drafts and use persistent per-Space drafts.
- New context filters paused/expired items and shares the existing memory budget across
  overview and individual notes. Saved run snapshots remain unchanged. Legacy overview
  writes preserve items; deletion removes the current record and computed search entry.
  Revision conflicts retain the draft and show the current note before replacement.
- Source addresses require HTTP(S) without credentials; runtime validates item identity,
  count and content. Memory remains desktop-managed and explicitly user-authored;
  automatic browsing capture, site exclusions and automatic retention deletion remain
  unfinished and are not implied by the new expiry control.
- Root/desktop builds and desktop typecheck passed; 37 focused memory/task/lifecycle
  checks passed. Rendered Settings flow created a sourced note and displayed it with
  per-note controls. Existing freeform UI was then compacted; no full phase completion.


- Added explicit open-tab text attachments through a searchable picker inside the
  existing Attach panel. Users can retain multiple pages alongside documents, with
  source URL, capture time, partial-text status, snapshot preview and inclusion/removal.
  Snapshot reads reject changed document epochs; unreadable pages suggest image capture.
  This desktop-only API observes the selected tab and saves immutable text, leaving the
  live action tab independent. Existing document/retry persistence is reused.
- The shared 6,000-character document budget now distributes capacity fairly among
  included sources, returning unused short-source capacity to longer ones. Multiple
  large tabs no longer leave later snapshots with zero context. Preview and mock use
  the same allocator. Opening text previews closes context controls to avoid stacking
  two large panels above the composer.
- Root/desktop builds and desktop typecheck passed; 23 focused lifecycle/context tests
  passed, including page provenance after navigation, stale selection rejection and
  fair allocation. Rendered picker → stored snapshot → source/text preview checked at
  1280×720 with mock page content. Native page extraction and network answer quality
  are still to be exercised; this does not complete the broader phase.


- Local image attachments now share the page-capture review, region selection,
  inclusion/exclusion and immutable snapshot path. A shell-only native picker accepts
  PNG/JPEG/WebP up to 16 MB, reads bounded regular files, re-encodes pixels without
  source metadata, and resizes to fit snapshot limits. Only a filename and PNG pixels
  reach the renderer/runtime; private browsing rejects the picker API.
- Image controls live together under Attach with a visible four-image limit. Reviewed
  images are not attached or sent automatically; users can cancel or crop first.
  Header action spacing is explicitly constrained to avoid inherited stacked buttons.
- Desktop typecheck/build passed. In the isolated native build, the repository Aux icon
  passed through the actual macOS picker, rendered for review and saved as a 1024×1024
  PNG alongside the previously persisted page capture. Closed the isolated app afterward.
  JPEG/WebP decoding uses Electron's native decoder; only PNG was exercised manually.


- Native capture follow-through (2026-09-21): reproduced a 30-second Playwright
  screenshot timeout when the selected page was hidden behind chat. Viewport capture
  for native Vector tabs now uses Electron capturePage with stayHidden/stayAwake and
  explicit dimensions. Other backends and full-page captures retain their driver path.
- Capture rejects stale requested document epochs, navigation during capture, detached
  pages and empty images before returning or storing them. Added a focused regression
  for stale/navigation/empty results. Image callbacks now carry their owning chat ID;
  the parent rejects stale chat updates and counts overlapping image operations so an
  older completion cannot unlock a newer operation.
- The isolated native app captured hidden Example Domain, reviewed it, saved a
  2048×1696 PNG (118 KB) into a new conversation and reopened the saved preview.
  No tab switch or message send occurred. Closed the isolated app afterward; the
  user's original app was not restarted. A real network model turn remains untested.
- Root build, desktop build/typecheck and 35 focused capture/routing/handler checks
  passed after updating the handler fixture for the existing recovery-tab API.


- Added the conversation page-image interface: a single Attach entry opens documents
  and page images together. Capture freezes the selected web viewport, lets the user
  select a rectangular region with pointer or keyboard, and reviews before saving.
  PNG crops are resized within backend limits; navigation during capture is rejected.
  Capture never sends a message automatically. Existing saved-image APIs supply
  preview, inclusion/exclusion, removal, source labels and compact attachment chips.
- Bounded the context panel to keep the composer visible; image review scrolls into
  view inside that panel. Mock capture uses a clearly labeled synthetic page, not a
  claim of real native capture or model success.
- Desktop build and typecheck passed. Rendered 1280×720 review covered capture,
  keyboard region selection, saving a 640×400 crop into a new conversation, compact
  chips and saved preview. Native hidden-tab capture and a network model turn remain
  to be exercised; no broader phase completion is claimed.


- Added durable conversation image snapshots backed by immutable artifact files, with
  PNG size/dimension limits, source metadata, explicit include/exclude/remove and SHA-256
  integrity checks. Up to four selected snapshots/8 MB are supported. Removed images
  used by earlier runs remain available to exact retries; unused captures are freed,
  and permanent conversation deletion removes retained image records/files as well.
- Runs now save exact image artifact IDs and descriptive source context; normal planner,
  repair and final calls receive those pixels. Skill reuse is bypassed for image inputs.
  Vision fallback preserves reference images and clearly distinguishes the final live
  screenshot from earlier historical references. Transport supports four references plus
  one live screenshot. Missing/changed files fail instead of silently changing context.
- Image management APIs are desktop-only. Generic external artifact list/read paths
  exclude conversation image files, while explicit run inclusion supplies them internally
  to the model. The generic file list is not an alternate path to excluded captures.
- Root build and 41 focused lifecycle/model checks passed (21 lifecycle checks rerun
  after artifact visibility changes). The new lifecycle test records actual planner
  image inputs, removal/retry identity, cross-chat read rejection, tamper detection and
  deletion cleanup. This backend integration is complete enough for the capture UI;
  user-visible page/region capture, preview and end-to-end native acceptance remain open.

- Began the image/region assistance implementation at the model transport boundary.
  Normal structured and streaming model calls now accept explicit PNG/JPEG/WebP data
  references, and preserve every image through schema/JSON repair fallbacks. The
  existing screenshot text-call path shares this transport and remains supported.
  Remote URLs, unsupported formats, oversized batches and known text-only Cerebras
  routes fail explicitly instead of losing the image or silently fetching another site.
- Root build and 20 focused model checks passed. New tests exercise actual SDK request
  construction with a local mock model through both JSON and streaming repair paths.
  No real provider call was made. This is backend groundwork: saved image snapshots,
  per-run immutable references, capture/region UI and user-facing acceptance remain
  to implement before image assistance can be called complete. No image control was
  added to imply those pending capabilities already work.

- Moved Settings, Tasks, Library, Reader, Inspector, tab overview and result tables into
  on-demand modules. Shared loading/error boundaries offer Cancel/Retry without
  reloading the browser or discarding surrounding drafts. Modal loading states have
  keyboard containment and restore focus to the initiating control after closing.
  Initial application module loading also exposes a retryable failure screen.
- Production build main App chunk decreased from 620.96 KB to 407.67 KB (uncompressed;
  179.17 KB to 123.90 KB gzip). Shared chunks also changed, so these are module-size
  measurements, not a startup-time benchmark. The prior oversized-chunk warning is gone.
- Root/desktop builds and desktop typecheck passed. A focused rejected-module → retry
  regression preserves the surrounding input and mounts the recovered view. Rendered
  preview confirmed Settings/Tasks loading and completion, then focus returned to the
  original Tasks control when closing. Native startup timing remains unmeasured.

- Home Recent now loads durable conversation summaries on demand, honoring saved titles,
  archive state and updated order. It marks drafts without repeating those chats in the
  draft list, supports retry/focus refresh, and retains the quiet three-row layout.
  Conversation headers fetch their saved title as well. Mock history supports summary
  listing, rename/archive/delete and title lookups for complete navigation previews.
- History mutations are guarded against duplicate actions/stale page responses, keep
  action errors separate from load failures, and retry the failed pagination operation.
  Menus receive focus, support arrow navigation/Escape/outside dismissal, and state
  filters expose pressed state. Narrow history layouts use smaller insets.
- Fixed a real 500-turn deletion limit: archive/rename/delete guards now inspect every
  conversation turn, including old active/task-owned/uncertain work. Transactional
  deletion uses conversation-scoped subqueries across owned records, avoiding large
  parameter lists, and escapes checkpoint-key patterns. Regression with 505 turns
  confirms an old active turn blocks removal and all turns are removed after completion.
- Root build, desktop typecheck/build and 20 run-lifecycle checks passed. Inspected
  history → rename → home Recent at 1280×720 using synthetic preview data. Native
  deletion was not exercised against user data.

- Simplified conversation context into four compact sections: Documents, History,
  Memory and Results. Each has a focused empty/populated view, retaining the existing
  saved context authority and memory drafts. Removed stacked-section spacing/dividers,
  corrected ordinary-chat copy, guarded history/result/Space saves across chat changes,
  and prevented sending while those changes are pending.
- Answer code blocks now show the language and optional wrapping; tables copy as
  Markdown or save CSV through the native file workflow. CSV quotes cells and treats
  formula-like values as text. Copy feedback resets; stable Markdown component bindings
  preserve code/table controls while new answer text streams.
- Desktop typecheck and root/desktop builds passed; two focused table-export checks
  cover quoting, formula-like values, pipes and multiline cells. Reviewed populated
  tables, code wrapping and Documents/Memory sections in the rendered 1280×720 preview.
  Native CSV save and real streaming were not exercised in this mock inspection.

- Added direct document attachment beside the chat composer, compact removable filename
  chips, and a full stored-snapshot preview. The preview exposes the exact included
  prefix under the existing shared 6,000-character budget, excluded state, timestamp,
  and the fact that original file edits are not synced. Snapshot reads are desktop-only
  and scoped to the requested conversation; previews and model context share one budget
  calculation. No original source path is stored or displayed.
- Attachment operations are guarded against duplicate actions and chat-switch races;
  sending waits until attachment changes finish. Context changes clear old-chat UI.
  Mock preview supports real in-memory add/read/toggle/remove for this layout journey.
- Root/desktop builds and desktop typecheck passed, as did 19 run-lifecycle checks with
  snapshot identity, inclusion-budget and exclusion assertions. Inspected attach →
  full preview → included-text toggle at 1280×720 in the rendered mock. Native file
  picking and real model execution were not re-tested in this batch.

- Unified the existing command palette across tabs, bookmarks, history, conversations,
  saved tasks and Space notes. Four compact type filters replace separate search flows;
  requests are debounced, stale results ignored, partial failures recoverable, and
  keyboard selection stays stable as results arrive. Private browsing excludes work.
- Saved conversation search now includes answer text. Task search matches titles and
  objectives before applying the result limit. Result navigation reuses existing views;
  memory opens the exact Space, and unavailable task Spaces report a useful error.
- Reviewed the populated palette and Saved pages filter in the rendered 1280×720 mock
  preview. Root/desktop builds, desktop typecheck and 13 task checks passed, including
  answer-only search and finding a task beyond the initial result limit. Preview does
  not establish native agent execution. Existing bundle-size warning remains.

Independent Phase 2 work is now progressing alongside the unresolved Phase 1 browser-host
compatibility work; this does not mark Phase 1 complete.

- Added reversible Space-memory inclusion controls. Saved notes remain inspectable and
  searchable when paused, but newly assembled model context excludes them. Existing
  notes default to enabled; editing paused notes preserves that choice. Toggles retain
  unsaved drafts and revision checks prevent overwriting concurrent changes.
- Memory Settings searches saved note contents and Space names, shows result excerpts
  and paused state, and preserves selected-Space identity across asynchronous saves.
  Own/other-window updates refresh the selected notes. Context counts exclude paused
  memory, and the UI explains that active runs/earlier snapshots are unchanged.
- Root build, desktop typecheck and 31 relevant task/run lifecycle checks passed. Added
  regressions for pause/search/edit/conflict and actual inclusion/exclusion in new run
  context. Rendered fixture confirmed save → pause → content search; corrected result
  row specificity so excerpts have room. Automatic browsing memory is still unimplemented.


- Refined the extension lifecycle without implying full Chrome compatibility. Loading,
  empty, failed and populated states are distinct; failed enabled extensions offer Retry,
  action failures refresh the installed row, and returning from another window refreshes
  the list. Declared access and compatibility/update details are available on demand.
- Enable/disable metadata now writes atomically. Concurrent mutations of one extension
  are rejected; metadata failures attempt to restore the previous running state, and
  failed loads remain visible without falsely persisting a successful enable operation.
- Desktop typecheck and three extension-manager checks passed, including interrupted
  enable → unchanged saved state → successful retry. This batch does not establish
  Chrome Web Store, native messaging, password-manager or full host compatibility.
  Rendered populated/failed extension states remain for the native phase review.


- Closed a session-recovery data-loss path: failed startup tabs remain in every later
  tab snapshot instead of disappearing on the next navigation/open. Retrying keeps the
  original page ID and increments document authority; successful and newly opened tabs
  remain intact. Interrupted native reconnects retain unresolved saved entries too.
- Added trusted recovery list/retry methods and a quiet start-page notice linking to
  Library. Recovery shows saved addresses, per-tab Retry and optional failure details;
  private windows never use this persistent recovery path. Renderer layout reconciliation
  preserves waiting tab order and Space ownership, scoped to each native window.
- Root build and desktop typecheck passed. Fifteen focused session/layout checks passed,
  including failure → new browsing → same-identity retry and pending-placement retention.
  Rendered fixture confirmed start-page notice → Library → restored tab, and the populated
  recovery layout was inspected at 1280×720. Full native restart acceptance remains pending.


- Completed an Overview organization batch: one grouped Space/folder move control,
  one persisted layout update for a selected set, stable range-selection anchor, and
  Save as folder with an inline name form. Collections use an atomic runtime operation
  that rejects folder collisions and retains existing bookmark placement. Private
  windows use the same contract with memory-only storage. All-duplicate selections
  explain where to organize existing bookmarks instead of creating an empty folder.
- Bulk closing now reports progress, stops after the current tab on request or unmount,
  keeps remaining selection on a site cancellation, and disables competing actions.
  Native selects and selected-card outlines use shared visual styling.
- Root build and desktop typecheck passed; four bookmark persistence regressions passed.
  Rendered preview confirmed selection → save six tabs as a folder and reviewed the
  populated Overview layout. Native before-unload integration was not rerun this batch.


- Added complete bookmark address/title/folder editing through shared contracts,
  transactional storage, private-window memory and Library. Updating preserves creation
  time; duplicate destinations and stale edits fail without replacing either bookmark.
  New addresses reject non-web schemes and embedded credentials. Editing uses the
  shared input styling and wraps into a readable form at constrained widths.
- Library now retains existing results during refresh, distinguishes initial-list and
  pagination retry, prevents duplicate actions/page requests, and offers direct history
  date filters. Opening a saved page only dismisses Library while it is still active.
- Root build and desktop typecheck passed. Eight focused bookmark/permission checks
  passed, including a new address-edit conflict regression. Inspected the editor in
  the rendered preview; corrected raw native input borders to shared field styles.


- Unified normal/private site permission handling. Both use readable capability names,
  separate microphone/camera decisions, supported permission filtering and opaque-origin
  rejection. Pending prompts cancel on document replacement, destruction, window close
  or timeout; changed access decisions and transferred ownership invalidate late answers.
  Private resets now replace the in-memory decision snapshot. No new screen-capture
  grant path was added; the documented native host limitation remains unresolved.
- Simplified Space switcher with current browser-profile identity, collapsed archived
  Spaces, native button activation for Enter/Space, selected-Space radio semantics and
  separate edit/archive buttons. Menus keep consistent row spacing and viewport inset.
- Focused checks: desktop typecheck and three permission lifecycle/isolation regressions
  passed. Inspected the populated Space menu in the rendered preview at 1280×720.
  These changes do not complete Phase 1 or establish all native permission integrations.


- Completed the managed-profile lifecycle with recoverable Archive/Restore, protecting
  original/current profiles and retaining all browsing data and existing windows.
  Archived identities cannot be launched until restored. Settings refreshes on window
  focus and provides recovery from list failures; current-profile native titles refresh.
- Profile launch now waits for a shell startup acknowledgement or clean single-instance
  handoff, reports startup failures/timeouts, and coalesces overlapping launch requests.
  A shell acknowledgement does not claim that models or every browser feature are ready.
- Focused validation: desktop typecheck/build passed and three profile isolation/lifecycle
  checks passed. In a separate temporary native Aux installation, created Fixture Work,
  observed the independent profile process/window, archived/restored it from the parent,
  and confirmed Current profile in the child Settings. Reviewed the populated settings
  layout at the native window size. Both test instances were closed; the user's original
  running browser was untouched. Full Phase 1 and engine compatibility remain ongoing.


- Implemented managed browser profiles with explicit IDs and separate Chromium/runtime
  directories. Existing data remains in place as the original profile; matching names
  never merge identities. General settings now lists profiles with Create and open,
  Open and Rename, inline errors and current-profile identification. Native windows
  carry the profile name. Spaces explicitly share sign-ins inside their owning profile.
- Profile launches use a restricted environment: provider secrets, runtime descriptors,
  API tokens and CDP endpoints are not inherited; dotenv loading is disabled. Existing
  app single-instance behavior is scoped by the selected Chromium directory. Catalogue
  records use private file modes and atomic rename, and managed paths are validated.
  Root build/desktop typecheck and two focused identity/environment-isolation checks
  pass. Native profile creation/relaunch, simultaneous-window behavior and complete
  profile lifecycle management still need implementation/integration follow-through;
  this is not a claim that Phase 1 or account/password-manager support is complete.


- Horizontal tabs keep New Tab fixed outside the scrolling strip; existing toolbar
  overview remains the single all-tabs entry. Removed duplicate sidebar address and
  navigation controls in horizontal mode. Rendered the populated 45-tab preview at
  1280×720 and corrected the duplication found there. The temporary preview was closed.
- Both tab layouts support Shift-F10/Context Menu keyboard access. Horizontal tab
  deletion restores tab-strip keyboard focus, inactive Spaces retain a focusable tab,
  and crash/loading indicators match vertical tabs. Menu Tab dismisses cleanly; shared
  arrow navigation skips disabled controls and respects composition/handled events.
  Desktop typecheck passed during the batch; native drag/keyboard integration remains
  in the phase acceptance journey.


- Added a shared external-app handoff for mailto, tel, webcal and webcals links in
  regular/private pages, including new-window requests. A native sheet shows the exact
  destination and defaults to Cancel; only confirmation opens the system app. Hidden
  task pages cannot surface this prompt. Pending prompts are bounded per page, malformed
  or credential-bearing targets are rejected, and failed launches explain recovery.
  Incoming OS web links now reveal/restore the chosen regular window and use explicit
  desktop-user navigation. Desktop typecheck passes; actual external-app launch was
  not exercised, avoiding unsolicited mail/call/calendar application changes.


- Added download-list cleanup end to end: individual completed-record removal and
  Clear finished, with explicit copy that files remain on disk. The shared contract
  bounds submitted IDs; runtime removal is transactional, completion-only and removes
  source metadata with each record. Active/interrupted transfers remain untouched.
  Private browsing applies the same rule in memory and checks its live transfer map.
  Removal events update other windows; in-flight shelf snapshots cannot resurrect
  records removed during the fetch. The API rejects external clients.
  Root build and desktop typecheck pass; no broad test campaign was run.


- Implemented shared native HTML fullscreen handling. A visible human page fills its
  owning window, hides companion views and removes its viewport radius; exit restores
  normal bounds and the user's previous window-fullscreen mode. Navigation, crash,
  destruction, overlay entry and browser shortcuts clear the fullscreen session.
  Background/agent pages cannot take over the window with fullscreen requests.
  Private browsing now permits Chromium's fullscreen request while retaining the same
  active-page ownership check.
- Verified the isolated native private fixture enters edge-to-edge fullscreen, exits
  with Escape and restores browser layout; Cmd-L exits fullscreen and selects the
  address field. Shared code is wired into regular browsing too; actual video sites
  and regular multiwindow/fullscreen-mode transitions remain phase acceptance work.
  Desktop typecheck/build pass. The fixture window and server were closed afterward.


- Extended blank-document handling through regular native popup identity, runtime
  registration, persistence and live-view reattachment. Newly reopened empty tabs do
  not inherit this flag, since their previous script-written document is gone.
  Cmd-L selects the sidebar address field for a site-created blank document; reload
  works for it and for local-file tabs. Print/PDF allow these documents using trusted
  native view metadata while keeping ordinary empty new tabs unavailable. Updated
  tab tooltips to retain popup identity. Root build and desktop typecheck pass; the
  regular runtime popup path still needs the focused rendered acceptance journey.


- A native private-window integration pass found and fixed blank popup content being
  covered by Aux's new-tab surface. Page metadata now explicitly distinguishes a
  site-created blank document; the private host and shared stage/address rendering
  preserve it. Verified the visible script-written popup, retained opener, script
  close and restoration of the original tab. This establishes the local popup journey,
  not universal third-party SSO compatibility.
- In the isolated native fixture, verified Cmd-L from a website, the editing context
  menu, synthetic HTTP sign-in with username focus and completion, Downloads rendering,
  failed-navigation recovery and Back. Back exposed stale address suggestions; the
  address field now closes an unchanged inspected address when navigation replaces it,
  while retaining independently edited drafts. Root and desktop builds pass before
  that final address-field adjustment. No personal credentials or profile were used.


- Refined the downloads shelf into direct All/In progress/Finished/Needs attention
  filters, with save-location settings behind one disclosure. Explicit loading,
  refresh/retry and refresh-error states preserve existing results and avoid presenting
  fetch failures as an empty library. Paused transfers stop animating. Actions have a
  synchronous duplicate-submission guard. Source page activation closes the downloads
  shelf only if it is still the current overlay. Desktop typecheck passes; rendered
  state inspection remains part of the phase acceptance pass.


- Separated private selected-tab identity from the native visible stage. Overlays,
  overview and recovery surfaces no longer clear native selection. Private stage
  layout now honors the requested split companion, hides failed/crashed/blank pages,
  and preserves crash state across resizing, selection and overlay changes. Only
  navigation restart clears the crash state. Passive layout updates no longer focus
  the website over a shell control.
- Unified crashed-page and navigation recovery UI with guarded retry, edit address,
  optional Back and inline retry errors. Crashed blank tabs no longer render the home
  surface simultaneously; mock/engine/borrowed Chrome content cannot compete with a
  recovery surface. Private native-stage integration still awaits the phase acceptance
  pass; this batch is implementation plus static checking.


- Shared native page shortcut classification now powers regular and private tabs.
  Private website focus forwards address/search, tab switching, zoom, find and other
  browser commands to the same renderer dispatcher. macOS Control editing bindings
  and Option-arrow word navigation stay with the page; composing input is untouched.
  Shell handlers respect controls that already consumed a key. Shift-Plus reaches
  zoom before the general shifted-command guard. Private developer tools and source
  view now use their existing native/page paths instead of silently doing nothing.
- Private menus expose Find Next/Previous, Paste and Match Style, zoom/reset, address,
  Back/Forward, Downloads and Developer Tools. Menus stay grouped and do not introduce
  additional browser-chrome controls. Native keyboard integration remains in the
  Phase 1 rendered acceptance pass.


- Regular and private pages now share the native page context menu. Private pages gain
  link/image actions, spelling suggestions, clipboard editing, navigation and inspect.
  Editing explicitly targets the originating page rather than whichever view gains
  focus while the menu is open; Paste and Match Style is available. Audio/video offer
  address copying and native downloads when Chromium reports saving is supported.
  Tab mute appears only for audible/muted pages, and navigation is confined to the
  background-page menu. Unsupported URL schemes cannot invoke new-tab actions.
  Desktop typecheck passes; rendered native-menu inspection remains part of Phase 1's
  integration pass.


- Completed an authentication/private-browsing batch. HTTP-auth requests are scoped to
  the owning window, follow tab transfers, and reject responses from other windows.
  Private browsing now uses the same human-only challenge flow; credentials remain
  outside runtime events and storage. Same-document navigation keeps the challenge,
  while replacement navigation and tab destruction cancel it and remove listeners.
- Foreground private popups now adopt Chromium's child contents, preserving opener,
  POST data and initial blank-page redirects. Background tabs retain Electron's
  deferred-open fallback; this is not a claim of universal SSO compatibility.
  Private close explicitly destroys the renderer after unload approval, and script-
  closed pages remove their tab state. Overlays no longer focus a hidden private page.
  Authentication waits for shell focus and blocks duplicate submissions.
- Three focused authentication regressions and desktop typecheck pass. Real-account
  SSO and native popup behavior still need an integration check; these changes do not
  establish full Chrome-extension or password-manager compatibility. The existing
  CEF candidate remains unresolved: its Chrome-style window permits one Chrome-style
  browser view, and native-parent embedding selects Alloy, which does not satisfy
  Aux's existing multi-tab layout requirement.

- Completed a connected browser/control batch: permission denials now persist a typed
  recovery state with a plain-language explanation, Review permissions and explicit
  Retry/Open task controls. Existing authority checks stay unchanged; changing access
  never automatically runs a task. Failed attempts no longer display stale progress as
  their answer. The coordinator regression confirms blocked actions are not dispatched
  and do not consume recovery-model calls.
- Regular/private printing and PDF export share one native implementation. Printing
  awaits Chromium's success/cancellation/error callback; closed/crashed/loading/blank
  tabs and overlapping requests fail clearly. PDF export checks document identity while
  capturing, sanitizes filenames, explains private-file persistence, and writes a
  restricted temporary file before replacing the destination. Private File menu now
  includes Print. Chat/overview shortcuts cannot print a hidden background tab.
- Consolidated tab movement into one searchable destination view with folder/Space/
  window groups, keyboard search-to-list navigation, Escape/back navigation and a
  matching empty state. Common context actions remain on a short first screen. Active
  tabs scroll into view; explicit tab activation reveals its collapsed folder. The
  horizontal new-tab control is excluded from the native drag region. Removed the
  incorrect Library shortcut label (Cmd-Y opens History).
  Rendered the compact menu, filtered destination view and keyboard folder move at
  1280×800 in the isolated development preview. Five repair/permission checks and
  three native-output checks pass; root build and desktop typecheck pass. Native print
  dialog/printer hardware and real-app PDF rendering still need a focused integration
  check; the unit checks establish outcome/identity/file-write behavior only.

- Simplified General settings: direct search-engine choices, an optional custom URL
  editor with explicit Save and inline validation, concise Chrome sign-in import and
  backup descriptions, and one collapsed Diagnostics & storage group. Matching
  settings searches expand that group. Invalid templates cannot be persisted through
  the settings API (HTTP/S, search placeholder, no embedded credentials); failed saves
  retain the draft. Health-clear/data-directory errors now reach the existing error
  handler. Verified the rendered layout at 1200×800 and rejected a missing-placeholder
  URL without changing the selected engine. Eight focused settings checks, root build,
  desktop typecheck and desktop build pass.


- Applied the user's September 20 screenshot feedback: the home surface now centers
  the Aux mark and a bounded search/Ask field in the viewport. Recent conversations
  and drafts are optional under Recent; Chats & drafts and Tasks remain direct links.
  This supersedes the earlier always-visible home dashboard described below.
  Chat shares a 740px reading/composer column, removes the blank browser preview,
  exposes a real-page preview on demand, and consolidates browser/model/permission
  controls under Options. Saving as a task remains available there. Result metadata
  and provider diagnostics are disclosures; empty work history is omitted. Context,
  errors, active run controls, and sources remain accessible. IME composition no
  longer accidentally submits a message.
- Removed the repeated inset window frame and settings-content border; softened site
  popup grouping. Fixed a sidebar menu spacing bug where icon wrapper spans expanded
  like labels. Read-only inspection of installed Aside informed continuous surfaces,
  restrained headers and readable widths; no feature-functionality claims were inferred.
  Rendered the updated home, populated chat, expanded Options, menu and settings in
  the isolated mock preview at 1440×960. Mock context/history endpoints are incomplete;
  their visible errors are fixture limitations, so this was layout inspection only.
- Fixed absolute URL permission evaluation from opaque origins such as about:blank:
  a valid destination no longer fails because the current origin is the string null.
  Destination-scoped permission checks are preserved; this does not grant navigation
  when settings disallow it. All 23 review-gate checks pass, including the new opaque
  origin and scope regression. Root build passes after declaring the existing jsdom
  suspension test's DOM type dependency. No live model request was made in this check.
- Tab overview now orders filtered results consistently, prunes hidden selections,
  supports grid arrows/Home/End/Space/Enter and search-to-grid focus, and guards bulk
  operations while busy. Private bookmark actions reuse the implemented session store.
  Desktop compilation passes; the rendered overview keyboard check remains pending.

- Refined the populated start page around the available stage width: smaller top and
  inter-section gaps, compact draft rows, direct discard with undo, bounded recent-work
  cards, and links to both all chats and tasks. Draft previews avoid repeating the title.
  Recent work displays shared plain-language statuses reused by the run panel and rail.
  Container-aware padding and card columns adapt when the agent panel is open. Rendered
  checks showed drafts/recent work within the window with and without the panel; discard
  and undo restored a synthetic draft. Desktop build and typecheck pass.

- Address navigation from a conversation now reveals the browser before loading, so
  failed destinations reach the existing recovery screen. Completion cannot refocus
  a tab after the user has selected another. Known native errors use the recovery UI
  instead of a duplicate raw toast; unexpected service failures remain visible.
  Edit address uses the failed destination, and loading/failed/crashed pages no longer
  display the address-bar secure indicator. Retry feedback stays with the error page.
  Two focused failure/focus checks and renderer typecheck pass.

- Added page zoom controls to Site controls, with percentage, standard size steps and
  Reset. Keyboard changes share renderer state; regular/private native zoom use the
  same absolute/relative semantics and 25–500% bounds. Private absolute zoom now works.
  Typecheck and build pass; rendered zoom inspection is pending.
- Approved generated Aux artwork is now integrated: deterministic fringe removal,
  transparent 1024px colored master with balanced macOS padding, ten standard/Retina
  iconset entries, compiled ICNS, and matching pure-white PNG/SVG extracted from the
  same icon. Start-page and conversation marks share a theme-aware silhouette; favicon,
  About and development Dock use the colored asset. Removed the old logo SVGs and
  replaced Quick Look icon generation with an alpha-preserving native size pipeline.
  Light/dark and small-size asset previews were inspected, transparency/size contents
  checked, and the new mark was inspected in the rendered Aux start page. Asset sources
  and reproducible commands live in `apps/desktop/brand/README.md`.

- Idle suspension now checks an isolated document for changed form controls,
  file selections, editable content, and playing media (including silent media and
  controls inside open shadow roots). It also protects capture, active downloads,
  and sites granted microphone/camera access. The final freeze decision rechecks
  foreground/split/agent ownership after the asynchronous inspection. Unknown,
  embedded, changing, or unresponsive documents stay awake and are reconsidered later;
  no field values leave the page. This remains conservative freezing, not tab eviction.
  Focused document/change checks and desktop typecheck pass. Long-idle native behavior
  remains part of the focused Phase 1 integration check.

- Private Library now supports session-only hierarchical bookmarks, folder creation,
  rename/move, empty-folder removal, duplicate-preserving HTML import, and explicit
  HTML export through the native save dialog. Private collections use the shared
  contract validation and emit the same bookmark updates as regular windows, without
  accessing their runtime/database. Library and export copy explain what disappears
  on close and what remains on disk. Added private bookmark menu commands. Bookmark
  All Tabs now uses a single import operation, excludes agent pages, deduplicates URLs,
  preserves existing organization, and relies on authoritative updates rather than a
  stale renderer snapshot. Two focused collection checks and desktop typecheck pass;
  this private-specific flow has not yet received a rendered inspection.

- Bookmark collections now reopen into a chosen existing Space, including nested
  folders, through a compact Library action. Opens are sequential background tabs;
  existing tabs in that Space are reused, progress is visible, and stopped/failed
  items can be retried. Closing the collection stops further opens after the current
  page. The destination survives a Space switch while opening, without changing the
  selected tab or closing Library. A focused race/reuse check, desktop typecheck and
  build pass. Rendered HTML import and opening a two-page nested collection preserved
  the current tab and Library; the destination control received a spacing refinement.

- In progress: runtime-owned Space identities connecting browser organization and tasks,
  recoverable legacy mapping, shared names, archived-space restoration, and pin overflow.
- Implemented in this cycle: hierarchical bookmark folders/import/export, bulk tab
  overview actions, shared tab menus, horizontal reorder, and live cross-window tab
  transfer. Focused phase-level checks are still pending.
- Navigation refinement: explicit address-bar Search/Ask choice, Space-scoped saved
  split companions, hidden-page preview protection, and live bookmark-folder refresh.
- Appearance refinement: solid default, persisted custom opacity/blur, removal of forced
  frosted shell styling, opaque menus, and more resilient Settings spacing/navigation.
- Focused checks: bookmark parser/import/intent checks passed; migration and layout
  checks passed after updating prior-version expectations (38 checks across five files).
  Rendered live tab transfer caught and fixed native stacking and startup snapshot races;
  moving a Research tab into a new window now visibly preserves its page and Space.
  Root/desktop builds and renderer typechecking pass; this is not full phase completion.
- Latest implementation: download search/status filters, active-first ordering, accessible
  progress, responsive action rows and source reopening; persisted last-selected tab per
  Space. Renderer typechecking passes; rendered download states are pending.
- Host implementation: added a reproducible macOS CEF development launcher, isolated
  contexts, sandboxed helpers and build script. It compiles and renders Chrome/Alloy
  views after context lifecycle fixes. Its new-tab command opens stock Chromium UI
  outside Aux, so this candidate is not accepted for product integration. Current
  Aux remains on Electron; host integration and full extension compatibility are open.
- Conversation memory now uses the same visible Spaces as browsing and tasks, including
  a clear archived-Space label for retained context. The separate Workspace picker has
  been removed; broader assistance/memory work is not yet complete.
- Conversation continuity: new chats inherit their starting Space; explicit No Space
  selections and existing conversation identities are preserved. Context loading/failure
  states now block sending until recovered and offer Retry. Focused runtime coverage
  has been added for defaulting/exclusion; phase-level execution remains pending.
- Shared conversation UI: the rail now renders the same conversation/history/context
  and reply component as the full view. A populated synthetic conversation confirmed
  draft preservation on expansion. Fixed inherited Markdown whitespace and removed
  the redundant answer label for plain responses; compact styles added.
- Space notes: shared editor in Settings and conversation context, window-scoped
  persistent drafts, explicit clear/save, conflict comparison and revision-guarded
  replacement. Private browsing excludes saved notes. Rendered Settings inspection
  refined field styling, heading spacing and selected-Space visibility. Synthetic
  notes survived switching Settings pages, saving and restarting the development app.
- Rail history now groups replies into one recent conversation, searches known turns,
  and links to full saved history. Removed obsolete duplicate reply handling from the
  rail composer; full and compact conversation replies use the same implementation.
  Rendered two-turn history appears once, and its full-history link opens Chats.
  Desktop build, renderer typecheck and diff whitespace checks pass for this batch.
- Browsing history: stable pagination replaces the 500-visit ceiling; local-day filters,
  day headings, literal title/address search and removal of individual visits. Delete
  requests target the exact visit, leaving later visits and bookmarks intact. Private
  windows retain the same controls over their temporary history only. Added an index
  for chronological reads and a shared clear-history confirmation for Settings, Library
  and the keyboard shortcut, replacing immediate shortcut deletion.
  Rendered synthetic history reached all 115 matching visits over two pages; the clear
  shortcut displayed its confirmation without deleting. Runtime/contracts builds,
  desktop typecheck/build and 33 focused history/Space/run-lifecycle checks passed.
- Tab recovery: Library now includes searchable Recently closed entries with original
  Space/folder context and per-tab reopening. Restore revives an archived Space,
  preserves a newer user selection during delayed opens, and does not reselect a tab
  closed before its open response arrives. Failed opens retain the recovery entry.
  Nine focused recovery checks pass; the rebuilt app closed Example Domain and restored
  it through Library into Research. Renderer typecheck and desktop build passed.
- Keyboard navigation: command palette supports @ tab search across Space/folder/title/
  address, shows placement and current-tab status, and provides a /tabs command. Fixed
  slash-prefix command matching, bookmark search beyond the first 30 saved pages and
  explicit Ask prefix handling. Palette selection stays bounded as results change,
  composition input does not submit early, and Tab focus remains inside the dialog.
  Build/typecheck passed. Rendered /tabs selected the tab switcher, then showed the
  current Example Domain tab with its Research Space label.
- Conversation reading: one shared scroll controller follows growing content only
  while at the bottom, retains reading position across panel/full view, anchors older
  message loading, and exposes Jump to latest. Resize observation handles late images
  and composer expansion without per-token store subscriptions. Rendered panel checks
  confirmed scrolling back exposes the button and jumping returns to the latest answer.
  Desktop build and renderer typecheck passed; live provider streaming remains part of
  the later complete assistance check.
- Browser context: compact and full composers share a picker with explicit current,
  linked, selected and new-tab choices. Fixed new-tab selection falling back to the
  linked page, carried selection into prepared conversation IDs, and blocked silently
  replacing a missing explicit tab. Prepared drafts survive model setup under the same
  conversation ID, retaining attachments/context and unrelated new-chat drafts.
  Renderer typecheck and eight focused context/conversation checks passed; this picker
  refinement awaits the next rendered assistance pass.
- Page quick actions: native non-editable text selections offer Ask/Explain/Summarize;
  unselected pages offer summarization. Each creates its own editable draft with a
  bounded quoted selection, source URL and explicit source tab. No model call happens
  until Send; existing drafts are retained. Private/worker/engine surfaces do not expose
  these native actions. Rendered selection → Explain produced the expected draft and
  source picker without sending. Multiline composers now grow to a bounded height.
- Native stage correction: durable tab selection and the page visibly occupying the
  stage are now separate. The renderer's null-stage request actually covers native
  pages while conversations/overview own the surface. A rendered quick-action journey
  caught the old page covering the draft and confirmed the corrected visible result.
  Desktop typecheck/build passed before the final CSS autosizing refinement.
- Draft continuation: the start page and conversation library now expose saved unsent
  drafts, including prepared quick-action conversations with no run yet. Existing
  conversation rows show their draft without a duplicate listing. Explicit draft opening
  preserves its ID/context, and text discard offers Undo while keeping saved messages
  and attachments. The start page shows up to three drafts with access to the full list.
  This closes the discoverability gap behind the single pending-conversation shortcut.
- Conversation-to-task promotion: inline editable objective/outcome/Space saving keeps
  the original chat ID, selected context, attachments and sources. An unsent reply seeds
  the objective. Future runs use task authority; prior runs remain historical and are not
  relabeled as task execution. Promotion is idempotent, rejects stale/active/unresolved
  work, and exposes the saved-task binding before its first run. Task rename/archive
  follow the retained conversation identity. The native rendered flow saved the synthetic
  two-turn conversation and opened its revision-one task in Research without a model call.
  Fourteen focused promotion/task/history checks and runtime/contracts/desktop builds
  passed. This adds saved-task continuation, not automatic task execution or routines.
- Saved-task continuity: a compact objective/context card now starts a saved task directly
  from its conversation through the existing revision and authority checks. Unsaved task
  edits block starting; archived tasks, loading failures and missing tabs have explicit
  recovery paths. Task details link back to promoted conversations before their first
  task run. The rendered panel/full-view check confirmed context selection and an enabled
  Run task control without invoking a model. Removed duplicate title/objective text.
- Conversation spacing: composer and message columns now share the same reading width
  and insets, accounting for the optional page preview. Container-based breakpoints hide
  the preview when the actual conversation viewport is narrow. The narrow panel retains
  its compact spacing and the task action row wraps instead of overflowing.
- Download completion: private windows now implement pause/resume/cancel and safe HTTP(S)
  retry inside their isolated session, sharing the regular transfer controller. Removed
  the private shelf's ineffective folder-change control; it explains per-file save dialogs
  and retained files. Snapshot reconciliation preserves newer live events, and Source page
  returns to the originating tab instead of requesting the download URL again. Rendered
  local regular-browser checks exercised empty, progressing, paused, resumed, cancelled,
  retried and completed rows. Two snapshot-race checks, desktop typecheck/build and diff
  checks passed. Private native handlers are built; their rendered journey remains open
  because the inspection tool bound to the regular process instead of the private window.
- Address-bar continuity: bookmark/folder matches join tab and deduplicated history
  suggestions. Conversation matches reopen the existing chat/task instead of replaying
  its goal as a new unscoped run. Stale history responses are ignored; composition input
  does not submit, selection stays bounded and failed actions retain their input. Private
  explicit Ask text stays a web search. Suggestion placement uses available viewport
  height, and navigating from a conversation returns to the browser tab.
- Failed-page polish: clear retry/edit-address/back actions, bounded wrapping and
  expandable connection details replace the always-visible raw error. Rendered checks
  confirmed the failed local page, address editing, matching-conversation suggestions
  and reopening its original two turns/task without a model call. Desktop build/typecheck
  passed; the final navigate-and-activate refinement passed typechecking.
- Find-in-page: regular/private processes share request-scoped native searching, timeout
  count fallback and cleanup on supersession, navigation, destruction and explicit stop.
  Corrected private match-stepping and clear/keep selection mapping. The strip handles
  composition, searching/error feedback, clear-search and narrow input sizing. A trusted
  shell-focus bridge fixes Cmd-F/Cmd-L leaving keyboard input in native pages, and
  Shift-Cmd-G now reaches the previous-match handler. Rendered Example Domain checks
  focused Find from the native page, highlighted 1 of 2, stepped to 2 of 2, stepped back
  and cleared highlights while retaining input focus. Four focused find checks and
  desktop typecheck/build passed. Private rendered validation remains a later check.
- Site controls: page/URL/document/loading changes invalidate details immediately;
  request versions prevent stale results and notices from replacing the current site.
  Native cookie reads reject changed or destroyed pages, including private windows.
  Failed/crashed pages show Connection not established instead of inferring a secure
  connection from an HTTPS address; initial loading no longer announces an insecure
  connection. Private permission lifetime is explicit. Opaque dialog/groups, keyboard
  focus wrapping and Escape focus restoration were checked in the rendered app, along
  with loaded HTTPS and a refused local HTTPS connection. Desktop typecheck/build passed.
- Reader continuity: shared isolated-world extraction now serves regular and private
  pages, with navigation/ownership guards and no article persistence. Reader restores
  in-memory position per document, offers serif/sans text, survives unavailable local
  storage and exposes Retry. Private preferences remain in the current view. Added the
  palette/private-menu entry and corrected the native Tab Overview shortcut. A synthetic
  long article reopened at its prior section in the rendered app. That check caught the
  toolbar scrolling away; explicit grid rows now keep controls visible above the article.
  Desktop typecheck/build passed. Private completed downloads also gained Open/Reveal
  handlers limited to paths recorded by that private window; rendered checking is pending.
- Remaining: complete browser organization/navigation/import/recovery polish, host-dependent
  compatibility work, and phase-level rendered/build checks. Later phases remain pending.

Never search personal credential stores/files for missing credentials. Preserve existing
profiles and saved work; use synthetic data for implementation checks.

## Previous development cycle (historical)

## Private-build delivery status and review limitations

- **Phase 1:** the Electron development build is usable and its daily browser,
  recovery and unpacked-extension paths are implemented. Full-Chromium extension
  compatibility, 1Password/Apple Passwords, real platform passkeys, screen sharing,
  microphone/conferencing and representative live SSO remain unqualified. Modern
  display capture now reaches the native macOS picker on supported releases, but an
  intentional real-screen selection remains a founder hands-on check. Native identity
  work conflicts with the current no-bundle instruction.
- **Phase 2:** persistent conversations, task authority, takeover, evidence, direct
  providers and scoped Codex/Claude MCP connections are implemented. A live model or
  authenticated external-agent journey still needs the user to authorize/configure
  one available connection. The installed local Ollama has only an embedding model.
- **Phase 3:** local issue/app/incident workflows, isolated checkouts, multiple
  toolchains, services/previews, recovery and integrity-checked commit/handoff work.
  Live selected-account GitHub/Vercel/Sentry qualification and any remote write need
  explicitly supplied/authorized service access.
- **Phase 4:** bounded Sandbox lifecycle, desktop-off worker launch, source/lease/
  result continuity, artifacts, preview, reconnect, child tasks and local API/SDK/
  CLI/MCP parity are implemented. Live Vercel qualification, a hosted deletion
  coordinator, provider-side currency controls and real remote-browser takeover need
  cloud credentials/infrastructure authorization; these cannot be truthfully closed
  by another local synthetic check.

The implementation cycle is complete within the private development boundary. These
account, signed-identity and provider-environment items are retained as review
limitations; they are not represented as successful live qualifications. Historical
entries below preserve the state at the time each batch was completed, so older
phrases such as “remains active” are chronology rather than the current roadmap state.

## Phase 1 native display-capture path — integrated, 2026-09-20

Modern `getDisplayMedia` requests now use macOS's native system source picker when
the running OS provides it. Aux does not enumerate windows or screens, choose a
source for the site, or persist a blanket screen-sharing grant; every request keeps
the operating-system selection boundary. Requests without a user gesture, requests
from unowned content, older-system fallback, and legacy `chromeMediaSource` capture
all fail closed. This removes the prior blanket block on supported macOS releases
without weakening the legacy-path protection. Actual capture and conferencing still
need founder-environment qualification because validation must not select or record
the user's real screen without an intentional hands-on action.

## Phase 4 desktop-off worker launch — integrated, 2026-09-20

Cloud handoff can now transfer the exact task/source lease and start the reviewed
executable as one detached provider command. The desktop shows the executable,
arguments, session limit and local-write lock before dispatch. Once accepted, the
provider command identity and intent are persisted immediately, so the worker can
continue for the environment's bounded session after the Aux window closes and its
logs and result can reconcile on reopen. The existing lease-only handoff remains for
interactive terminal work.

The combined API is deliberately desktop-only. Scoped external clients cannot grant
themselves cloud authority or start unattended billable work through it. A failure
after the lease is written leaves cloud authority in place and the command outcome
visible as failed or uncertain; Aux does not silently retry a process that may have
started. Source/revision fencing, result validation, explicit checkpoint/return and
retention preservation remain unchanged.

The affected runtime, contract and desktop surfaces build together, and a synthetic
provider journey verifies that the lease in `.aux/task.json` is the lease persisted
by Aux and that one detached provider command receives the bounded timeout. No live
provider, account or credential was used. Live Vercel qualification and hosted
deletion retry remain externally gated.

Every source upload and authority handoff now also refreshes
`.aux/write-result.mjs`. A worker sends it a small JSON object on stdin; the helper
fills the task identity, revision, source tree, current lease and timestamp from the
durable brief, validates criterion IDs, local-request shape and regular in-workspace
artifact paths, then atomically replaces `.aux/result.json`. A direct isolated run
confirmed the emitted manifest carries the handed-off lease and declared artifact.
This removes stale-identifier hand editing from the normal reconnect path without
turning worker claims into accepted evidence.

Remote workspace browsing, result review, download and preservation now reject every
symbolic-link component in a requested path, including a symlinked parent directory.
This closes the case where a lexically in-workspace artifact could resolve outside
the uploaded workspace after a worker changed the filesystem. The sandbox-local
writer performs the corresponding real-path check before it declares an artifact.

## Phase 4 typed local SDK and client transport parity — integrated, 2026-09-20

The versioned method and result schemas now drive a private `@aux-browser/sdk` client.
It discovers the running loopback runtime, authenticates with the existing bearer
boundary, validates request parameters before dispatch, validates every returned
result and exposes cursor-based event streaming. Transport failures are surfaced as
typed errors and the client never retries an RPC, because a lost response can hide a
completed mutation.

`auxctl` and the MCP server now use this same SDK instead of maintaining separate
HTTP/descriptor implementations. The MCP adapter still drops a stale descriptor
after transport failure and discovers the restarted runtime on the next explicit
call; it does not replay the failed action. Scoped MCP bearer requirements remain in
front of SDK dispatch. Both adapters build against the shared package, the no-replay
restart journey passes, and live workspace/task reads succeeded against the running
development app.

## Phase 2 external-agent client negotiation — integrated, 2026-09-20

External-agent settings now detect the installed Codex and Claude Code executables
and show their reported versions beside the scoped MCP setup. Detection searches the
launch PATH and runs only the executable's bounded `--version` command with a minimal
environment; it does not open either client's configuration, account, credential
store or task history. Private browsing cannot invoke the probe.

The current development host reports Codex CLI `0.155.0-alpha.9.2` and Claude Code
`2.1.277`. This establishes which client versions the generated configuration targets
and removes ambiguity between “not installed” and “not connected.” It does not claim
an authenticated agent run: the one-time scoped configuration still has to be merged
into the chosen client, which keeps its own model/account authentication.

## Phase 4 revision-pinned cloud task handoff — integrated, 2026-09-20

The explicit cloud upload now transfers both the selected checkout and a bounded
`.aux/task.json` brief containing only the saved task ID, revision, title, objective
and acceptance criteria. This gives a detached coding-agent process a durable task
contract after Aux closes instead of leaving it with source code but no definition
of done. The adjacent source manifest advances to v2 and keeps the exact local tree
identity, project identity, file count and upload time.

The upload control and disclosure now name the task-brief transfer. Browser cookies,
model credentials, workspace memory, page observations, unrelated task resources and
host environment variables remain excluded. Cloud exports retain the source/task
manifests for review while excluding the transient preview-proxy implementation.
The brief also declares a bounded `aux-cloud-result-v1` contract. On reconnect, Aux
can load `.aux/result.json`, reject malformed results, stale task revisions, different
source trees, duplicate/foreign criteria and unsafe artifact paths, then show the
worker summary, criterion claims and artifact locations as untrusted evidence for
human review. It never auto-accepts a criterion. The same validated read is available
to the task-scoped MCP client, and the scoped catalog now actually advertises the
implemented cloud inspection/command lifecycle tools.

The desktop reviewer can import each validated worker criterion claim into the
authoritative task evidence ledger. Every imported record preserves the environment,
uploaded source tree and result timestamp, includes the bounded result summary and
declared artifact paths, and remains an external-client claim. Import is idempotent
for the same environment/result/criterion and refreshes the task receipt; it never
creates a human review or accepts a criterion. Active runs, archived tasks, foreign
criteria and changed revisions reject the import.

Declared result artifacts are now actionable instead of display-only paths. Aux
revalidates the exact result timestamp and declared path at download time, accepts
only a regular sandbox file, caps individual artifacts at 25 MB, stages the bytes
inside protected Aux storage, reports a SHA-256, and removes staging after the native
Save flow. Undeclared paths, changed manifests, symbolic links and oversized files
fail closed; larger output can still use the bounded workspace export.

Preserving a result now closes the disposable-compute gap. Aux first validates the
manifest against the exact task revision and uploaded tree, stages every declared
regular file under a 25 MB per-file and 50 MB aggregate limit, and atomically stores
the result manifest and bytes in its local artifact store. Criterion evidence carries
each durable artifact ID, label, byte count and SHA-256. The task receipt can save
those exact stored bytes later even after the sandbox is stopped or deleted, and the
normal Aux backup includes them. A repeated import reuses the existing evidence and
does not create another artifact set. None of this grants acceptance automatically.

Contracts, runtime, MCP and desktop compile together without provider access; focused
authority/catalog checks pass. Live detached-agent execution still requires the user
to authenticate deliberately inside the remote terminal and qualify the configured
Vercel account.

Current provider research confirms that Vercel Sandbox supplies compute, coding-agent
CLIs, files, commands and previews, while a remotely viewable/takeover browser is a
separate managed-browser service connected over CDP. Aux does not silently install or
select such a provider. Remote browser takeover therefore remains credential- and
provider-dependent rather than being misrepresented as a Sandbox capability.

## Phase 1 new-tab search routing — repaired, 2026-09-20

Auto routing no longer creates ordinary `about:blank` or `data:` new-tab surfaces
on the specialized Aux Engine. Those documents are usually temporary browser tabs;
pinning one to the engine made its later Search navigation inherit the engine's
restricted network policy and could reject DuckDuckGo instead of browsing. Auto mode
now starts transient documents on embedded Chromium, while explicit Engine requests
and qualified real origins retain the existing engine path. The running app exposed
the failure without revealing page content, and the focused routing regression plus
the runtime build pass.

## Phase 4 current universal cloud image — integrated, 2026-09-20

New cloud environments now default to Vercel Sandbox's current Universal image
through the installed v3 SDK instead of a deprecated language-runtime selector.
The environment remains task/revision/project bound and retains the same session,
lifetime-resource, cleanup, source-transfer, preview and explicit-resume boundaries.
Existing Node 24, Node 22 and Python 3.13 records remain readable and resumable;
those choices stay available in the UI with an explicit Legacy label.

The Universal option provides the supported multi-toolchain base for Node, Python,
Bun, containers and installed coding-agent CLIs. Aux does not copy local browser
sessions, model keys or agent credentials into it. Any remote-agent sign-in must be
performed deliberately in the task-scoped cloud terminal. Contracts, runtime and
desktop compile together; no provider resource or credential was used for this
credential-independent integration.

## Phase 4 bounded child-task coordination — integrated, 2026-09-20

Saved tasks can now carry durable parent identity. A task-scoped external connection
may create a resource-free child beneath its root or an existing descendant, then
list, inspect, revise and run only that bounded descendant tree. It cannot create a
new root, cross workspaces, attach browser pages or repositories, or access a sibling
outside the original scope. Workspace-scoped connections can create roots or children
inside their workspace under the same resource-attachment rule.

Aux limits decomposition to four levels and 20 direct children per task. Children do
not inherit browser, repository, environment or file authority; they own independent
revisions, resources, runs and evidence. The Tasks page marks child records, shows
their parent relationship and can create a child directly from a saved task with a
separate recoverable draft. Contracts, runtime authorization, MCP catalog and desktop
UI compile together, and the focused authority check proves descendant visibility and
rejects root and cross-workspace escape.

## Phase 4 reviewed external-agent cloud work — integrated, 2026-09-20

A task- or workspace-scoped MCP client can now inspect its task's remote workspace,
read bounded UTF-8 files, reconcile command status and propose an exact cloud command
or bounded service. The desktop brings the review to the foreground and shows the
task revision, environment identity, runtime, region, exact arguments, time limit and
billable-compute warning. Nothing dispatches unless the user approves that native
dialog, and task/resource authority is checked again afterward against the current
environment record.

This does not let an external agent create, delete, resume or stop environments, open
terminals or previews, export files, inspect account-wide inventory or clean orphans.
Those resource and account boundaries remain explicit desktop actions. If Aux is not
open on the local Mac, a proposed command reports that local approval is required
rather than waiting ambiguously or bypassing review. Command intent persistence and
uncertain-outcome handling still apply after approval.

A scoped agent can stop its own recorded running command or service, which completes
the approved process lifecycle without granting control of the environment itself.

All inspection paths now request provider state with resume disabled. Reading files,
refreshing logs, stopping work, deleting resources and cleanup cannot wake a stopped
sandbox as a side effect. Commands, services, source transfer, terminals, exports and
protected previews require the durable record and provider to both report `running`;
the user must use the explicit Resume action first. The desktop disables these active
controls while stopped, preserving the lifecycle and billing boundary in the UI too.

The versioned runtime/native bridge, desktop approval surface and Aux MCP catalog
compile together. Focused MCP transport and API result checks pass. Live provider
dispatch remains credential-dependent; no provider account or secret was accessed.

## Phase 4 cloud command reconnect reconciliation — integrated, 2026-09-20

Opening cloud command history now reconciles every persisted in-flight service with
the provider's command identity without resuming the sandbox or dispatching another
process. Completed and failed commands recover their exit status, bounded output,
duration and finish time after an Aux restart. Commands still running remain running.

If the provider cannot answer for one command, Aux preserves the last known state and
shows the refresh error beside that command. It does not invent an exit result, clear
the record or retry the work. A later refresh can settle the same durable identity.
Foreground commands and detached services now also persist an intent before provider
dispatch. If Aux loses the provider response before it can save the remote command
identity, the record becomes **uncertain** after the request fails or after restart.
The UI directs the user to inspect the remote workspace before choosing whether to
run it again; Aux never retries that potentially executed command automatically.
Contracts, runtime and desktop production builds pass together, as does the focused
API contract suite. Live reconnect qualification still requires the explicitly
configured Vercel Sandbox account; no credentials or provider resources were used.

## 2026-09-20 — Active completion boundary revised to Phases 1–4

At the founder’s direction, Phase 5 is no longer a delivery phase or completion gate.
The active objective is to complete and verify the daily browser, trusted connected
agent work, local development and cloud-continuity phases, then provide a usable
private development build and a concise capability/limitations handoff. Aux stops
there for hands-on review. The seven-day pilot, founder acceptance program, broad
refinement campaign, packaging/signing/release work and speculative post-testing
features cannot delay that handoff. Necessary safety, recovery, compatibility, data
integrity and bounded performance validation remain embedded in Phases 1–4.


## Phase 3 exact-source validation handoff — integrated, 2026-09-20

Successful bounded checks now record the exact Git tree present after the process
finishes. A delivery handoff qualifies that check only when it belongs to the open
task and saved task revision and its tree still matches the checkout being reviewed.
Edits made after a check, results from another task revision, legacy results without
a fingerprint and checks whose fingerprint could not be captured remain visible as
evidence but cannot authorize readiness or a local commit.

The persisted command record, command UI, review summary and hashed delivery manifest
all expose the checkout fingerprint. Fingerprinting uses Aux's existing temporary Git
index with repository hooks, global configuration, credentials, filters and network
disabled; it does not modify the working index. A restart retains the proof, while an
interruption during finalization remains interrupted and is never promoted to success.

The focused real-process and isolated-repository checks pass, including persistence,
exact-tree readiness, local commit integrity and stale-handoff rejection. The desktop
production build also passes. This closes the stale-check authorization gap; broader
issue/app/incident journeys and connected service qualification remain Phase 3 work.


## Phase 2 authenticated browser-session operations — integrated, 2026-09-20

Aux’s zero-model operation router can now select a session-required HTTP implementation
when an authorized live page is on the operation’s site. The request executes inside
that exact page origin, so the browser applies its existing sign-in state without Aux
exporting cookies, tokens or storage credentials. This repairs a stale eligibility rule
that previously marked the implemented in-page route permanently unavailable across
the runtime API, CLI and MCP surfaces.

Session-required operations fail closed when the exact origin is unavailable, including
when a caller explicitly names the implementation; they never fall back to a plain
runtime request. Saving an operation now rejects cross-site endpoints, URL credentials,
Cookie/Authorization/Proxy-Authorization headers and header line injection before any
secret-bearing executable can be persisted. Both in-page and credentialless response
bodies are capped at 1 MB and report truncation. Existing effect and egress grants,
pre-dispatch intent records, idempotency keys and no-retry rules for uncertain writes
remain in force.

The runtime and desktop production builds pass, and the focused operation suite covers
same-site in-page routing plus pre-persistence cross-site and secret-header rejection.
Qualification against a real signed-in service remains account-dependent; no browser
cookies, credentials or personal sites were accessed.


## Phase 2 connected-operation uncertainty — integrated, 2026-09-20

The zero-model operation path now participates in the same task-level recovery
boundary as browser-planned writes. If Aux loses confirmation after a connected
write, destructive action or egress operation, the task becomes uncertain, its next
run is blocked and the exact invocation appears in the task receipt. Read operations
and failures proven to occur before dispatch do not create this block.

The receipt identifies the operation, effect class, run, time and last safe error.
The user can settle it only from the desktop UI using fresh evidence from the current
task revision and a written reason. Reconciliation updates the invocation atomically,
writes a dedicated immutable audit row and emits a task event; it never repeats the
external operation. External clients cannot perform this human decision. Markdown
receipt exports preserve unresolved connected operations for offline review.

The database advances to schema 10 with the normal private pre-upgrade snapshot and
a backward-safe reconciliation table. Focused migration, task receipt, renderer and
runtime tests pass, as do the contracts/runtime/desktop production builds. This closes
the previously separate operation-invocation recovery route without adding another
journal or requiring a live account.


## Phase 4 bounded cloud lifecycle and scheduled cleanup — integrated, 2026-09-20

Every newly created Vercel Sandbox now has a required six-hour, 24-hour or three-day
auto-delete deadline in Aux’s durable environment record and in a provider resource
tag. The default is 24 hours and the enforced maximum is 72. The runtime reconciles
due resources on startup and once per minute wherever that runtime is hosted, deletes
the sandbox together with orphan snapshots, persists in-progress state before the
provider call and retries failures after a bounded backoff. Manual deletion clears
the schedule. The task UI shows the exact cleanup time, active deletion and retry
errors rather than leaving retained compute ambiguous.

The existing account-wide cap, per-task retained-resource cap, 45-minute session cap,
90-minute lifetime CPU ceiling and 1 GB lifetime egress ceiling now guard every path
that can start more work: commands, detached services, source upload, terminal and
protected preview. Refresh automatically stops a running sandbox that has crossed a
lifetime resource limit. Export, inspection, stop and delete remain available for
recovery. Aux explicitly reports that Vercel currency-budget enforcement is unavailable;
resource ceilings are never presented as a dollar cap.

Runtime and desktop production builds pass. A synthetic provider lifecycle probe
reconciled an overdue persisted environment, requested deletion with orphan snapshots,
and retained the final deleted record. Real-provider qualification, a deployed
desktop-independent coordinator and provider-side currency controls remain Phase 4
dependencies; no credentials were discovered or used.


## Phase 4 exact-source cloud transfer and interrupted-sync recovery — integrated, 2026-09-20

Cloud source upload now binds one transfer to the current saved task revision and an
exact Git tree from the attached local checkout. Aux fingerprints before collecting
files and again after collection; if an editor or process changes the checkout in
between, no provider write begins. The environment records the accepted tree, task
revision, transferred paths and omitted-file count, and the remote workspace receives
a small Aux source manifest after the upload finishes.

Aux persists `uploading` before mutating the sandbox. A crash or provider failure
therefore leaves a visible interrupted/failed state instead of a false successful
snapshot. Commands, services and protected previews remain blocked until the user
uploads a stable checkout again. Inspection, terminal recovery, export and deletion
remain available. A later successful upload removes files previously managed by Aux
that were deleted locally while preserving remote generated files and files Aux never
owned. Binary, unreadable, over-limit and beyond-cap files remain explicitly skipped;
the local tree identifies the source selection but does not claim those omissions were
copied.

The existing hook/filter/credential-free temporary Git index supplies the fingerprint.
Contracts, runtime/native bridge, desktop main/renderer and the production build pass
together. Live transfer still requires an explicitly supplied Vercel Sandbox account;
no credentials or real remote resources were accessed.


## Phase 3 coordinated local service stacks — integrated, 2026-09-20

Detected local services can now be reviewed and started as one task-scoped stack.
The project panel presents the available manifest-derived service commands in stable
startup order, limits the selection to Aux’s existing four-service budget, and uses
one native confirmation showing every exact command and the checkout directory.
Detection remains inert; repository code runs only after that confirmation and a
second task-revision/project-authority check.

Each stack member retains an independent persisted command record and output stream.
The records carry stack identity, label and order across UI reloads and Aux restart.
Stopping the stack terminates every active member. If a member fails unexpectedly,
Aux stops its siblings; partial synchronous startup rolls back already-started members.
Interrupted or failed stacks never restart silently. A restart action appears only
when every member still belongs to the open saved task revision and requires the same
native review again. Individual service controls and manual commands remain available.

Contracts, desktop main/preload/renderer and the production build compile together.
A focused real-process probe started two Node services, forced the second to exit 7,
and observed the first become canceled while the failing member retained its exit
status. Live multi-service repositories and readiness-aware dependency sequencing
remain Phase 3 qualification work; this implementation guarantees reviewed startup
order and coordinated failure, not inferred application readiness.


## Safe idle-tab suspension — integrated, 2026-09-20

Ordinary Chromium tabs that remain hidden for ten minutes now enter Chromium's frozen
lifecycle state and wake as soon as they are selected, split, recovered, captured or
used for staged agent interaction. Aux does not freeze audible or loading pages,
popups, engine views, visible/split tabs, offscreen pages under active automation, or
runtime-owned background workers. Runtime ownership now crosses the versioned native
bridge explicitly instead of being guessed from layout state.

Suspension preserves the live renderer and DOM rather than discarding the tab or
reloading its URL, so form state and navigation history remain in memory. Lifecycle
commands are serialized per tab to prevent a late freeze racing a user selection;
unsupported or detached debugger sessions fail open and leave the page active. The
private health history records only the maximum suspended-page count and aggregate
suspension-failure total alongside its existing resource measurements, so the founder
can see when the optimization was unavailable without exposing sites or content.

Electron 43.6.0 accepted a real frozen→active lifecycle round trip in a temporary
native WebContentsView. Contracts, runtime, desktop main/preload/renderer and the
production desktop build compile together. The seven-day pilot must still measure
whether this policy improves resources without disrupting the founder's real sites.

## Canonical Aux developer entry points — integrated, 2026-09-20

The public command is now documented and rendered as `auxctl`, including help,
examples, usage failures and error prefixes. The package continues to install the
legacy `vector` command as a compatibility alias, so existing scripts keep working.
The root workspace identity and description now say Aux. Internal `@vector/*` package
imports and backend identifiers remain compatibility contracts until their versioned
migration exists; they are no longer presented as a second product.

Desktop-generated scoped MCP connections already advertise `aux_*` tools. Their
read-only resources now follow the same mode (`aux://…` for canonical scoped
connections and `vector://…` for the legacy direct development catalog), and public
MCP copy calls the product Aux. CLI/MCP documentation now leads with Aux and explains
the retained aliases. This is an A1/A2/A4 migration increment, not a profile/database
rename or permission to break third-party clients.

## Private browser-health history — integrated, seven-day observation in progress, 2026-09-20

Aux now records one local health sample per minute while the regular browser is open.
The bounded eight-day record contains only time, anonymous per-launch identity, app
uptime, aggregate Electron-process CPU and working-set memory, main-process timer lag,
regular-window and tab counts, and renderer crash/unresponsive totals. It never contains
URLs, titles, site origins, browsing content, task
text, account identity or credentials. The file is private to the Aux data directory,
keeps at most 12,000 samples and is flushed at startup, periodically and during a
normal quit.

Settings → General shows recording span, observed open time, session count, typical
startup time, p95 CPU, memory and responsiveness, renderer failures, and maximum tabs. It describes the result as app-open
observation instead of claiming continuous uptime, indicates when a real seven-day
span has been reached, and provides one local Clear action. Private windows cannot
read or erase the record. The support report includes the same aggregate summary but
never its raw samples.

Desktop main, preload, renderer and mock bridge typechecking passes. This supplies the
instrumentation and private review surface for B6/L2; the actual seven-day founder
browsing period and performance interpretation remain live acceptance work rather than
an automated claim.

## Founder support diagnostics — integrated, 2026-09-20

Settings → General now exports one readable JSON support report through the native
Save dialog. It records Aux/Electron/Chromium/Node identity, runtime contract and
engine mode, browser window/page/extension counts, task/run status totals, nonsecret
appearance/model modes, credential source presence and the current compatibility
limits for extensions, passkeys, password managers, screen sharing and packaging.
The report includes a SHA-256 payload digest so a retained diagnostic can be checked
for accidental modification.

The report is assembled from an explicit allowlist. It excludes secret values and
secret references, endpoints, URLs, page titles, history, bookmarks, prompts,
responses, task text, account names and emails, local paths, artifacts and document
content. It aggregates task state across every workspace without serializing any
workspace or task identity. Private windows cannot call the export surface. An
unavailable runtime produces an honest disconnected report instead of blocking the
browser or inventing capability state.

Desktop main, preload, renderer and mock bridges compile together and the production
renderer build succeeds. The report is ready for the personal browsing pilot and
future fault/compatibility qualification; it does not replace those live gates. No
credential store, personal page data, app bundle, publish or external service was used.

## Portable runtime-data backup and guarded restore — integrated, 2026-09-20

Settings → General can now create a consistent SQLite snapshot through `VACUUM INTO`,
which includes committed WAL content instead of copying only the live main database.
Aux places it in a portable recovery folder with every available complete artifact
body referenced by the snapshot plus a versioned digest manifest. The bundle carries
workspaces, tasks, conversations, evidence, captured screenshots and generated task
artifacts, browsing records and runtime preferences. It caps artifact data at 1 GB and
10,000 records, reports source artifacts that were already unavailable, and warns that
URLs, task content and artifacts make the folder private. Cookies, browser sign-ins,
extensions, downloads, project checkouts, cloud resources and encrypted credentials
remain outside the bundle.

Restore is staged rather than overwriting a live runtime. Aux validates SQLite
integrity, supported schema range, required core tables, file size and the absence of
triggers, views or virtual-table schema; removes the disabled legacy plaintext Gateway
setting; verifies every artifact path, size and SHA-256; rejects traversal, symlinks
and collisions with different current data; rewrites artifact paths for the destination
Aux data directory; writes a SHA-256-bound pending record; and lets the user cancel.
Artifact rows whose bodies were missing when the bundle was created are restored as
unavailable instead of retaining a stale absolute path.
On the next launch, before the runtime opens, the native process verifies the digest
and every artifact again, copies only nonconflicting immutable bodies, creates a
consistent private recovery snapshot of the current database, swaps the staged database
atomically, removes stale WAL/SHM files and records the restore time. A damaged or
incomplete staged restore is quarantined while the current data continues to open.

A focused cross-directory recovery simulation created a schema-v9 WAL database with
one available and one missing artifact, copied the bundle to another location, staged
and applied it to a different Aux data directory, recovered the database and available
artifact contents, marked the missing body unavailable, rewrote its paths, removed the
legacy plaintext credential, consumed the pending marker and retained the pre-restore
database. Contracts, runtime and desktop compile together. Full browser-profile,
project and cloud migration plus personal credential validation remain A3/L2 work and
require their own authorization and closed-application process.

## Phase 3 read-only GitHub delivery connection — implemented, live qualification pending, 2026-09-20

Settings now has one concise Connections page for an explicitly supplied fine-grained
GitHub token. Aux saves it through the existing OS-encrypted secret bridge, never
returns it to the renderer or writes it to preferences/database, and supports an
explicit account probe and disconnect. The health record retains only account identity,
reported classic scopes and check time. Aux does not inspect GitHub CLI, browser cookies,
Keychain entries or other credential stores to discover a token.

An attached managed checkout can now be matched to a recognized `github.com` HTTPS or
SSH origin without invoking a credential helper or network-capable Git protocol. A
read-only API check reports the connected account, repository visibility, permissions,
default branch, whether the reviewed baseline and current local head exist remotely,
and the head's combined commit status. The result is revalidated against the checkout,
saved with the project, visible in Tasks, available to its scoped MCP connection and
included in the durable review handoff. The repository opens as an ordinary Aux tab.

This implementation compiles across contracts, runtime, native shell, renderer and MCP.
Live account/repository qualification requires a token deliberately entered by the user;
none was requested or discovered during implementation. Push, branch publication, PR
creation and every other GitHub write remain disabled under the current no-publish
instruction. Vercel/Sentry incident connections and authorized remote delivery remain
open Phase 3 work.

## Phase 3 durable incident snapshot — integrated, 2026-09-20

The linked project-preview diagnostics can now become a durable incident report with
one action. Aux binds the exact saved task revision and attached checkout to the live
page, working-tree state, bounded diff, last 100 console messages, last 100 network
responses and 10 recent project commands. Scoped agents receive the same tool only for
a task-authorized page or their explicitly approved project preview. The runtime and
native shell both recheck task/project authority before writing the report outside the
checkout.

The report strips URL user information and fragments and replaces query values with
redacted markers before persistence. It records time, provenance and explicit limits;
it does not claim root cause, current remote health or successful remediation. The
renderer exposes the saved location beside live diagnostics, and scoped Codex/Claude
connections can prepare the same evidence for review. Compiler validation covers the
new contract, runtime, native and renderer path. Direct Sentry/Vercel context remains
open and will require explicitly supplied service connections.

## Phase 3 Python projects and complete scoped file lifecycle — integrated, 2026-09-20

Aux now recognizes Django, FastAPI and Flask applications from bounded root manifests
and regular entry files without importing project code. It offers manager-aware setup,
pytest/Ruff/mypy checks when declared, and framework-specific local service commands.
The existing task-bound approval, service lifecycle and loopback preview path carried a
detected Django project from `.venv` preparation through its system check to a rendered
Aux preview. Rust and Go projects have guided checks and runnable services when detected. Ruby, JVM, PHP and container support is recorded in the later multi-toolchain update below.

Scoped Codex and Claude Code connections now have a complete ordinary text-file
lifecycle: create, conflict-safe write, rename and delete. Rename and deletion require
the expected SHA-256 and a native review bound to the exact saved task revision and
attached checkout. Aux rechecks the file and task after approval, serializes mutations,
refuses replacement, and keeps a recovery copy outside the working tree. These actions
still cannot touch an unrelated repository, commit, push or publish.

The inspected environment UI is in `release/test-artifacts/aux-project-environment.png`.
The native project journey passed with the detected Python check, local service, preview,
restart, recovery and handoff intact. Compiler validation covers the added MCP/runtime/
native contracts. Broader real repositories and connected GitHub/Vercel/Sentry delivery
remain Phase 3 gates; no personal repository, credential store, bundle or remote write
was used.

## Phase 3 task-scoped external editor continuity — integrated, 2026-09-20

An attached managed-checkout file can now move from Aux to its macOS default editor
and back without relying on the user to remember a manual refresh. Opening it carries
the exact saved-task identity and revision through the native boundary; a stale task
or checkout that is not attached to that task cannot open. Aux checks the disk file
when its window regains focus and also provides a deliberate **Check disk changes**
action.

A clean editor adopts an external change immediately. When both the Aux draft and
disk version changed, Aux preserves the draft, shows the current external contents,
blocks an ordinary save, and requires an explicit choice. The user can adopt the
external version or replace it with the Aux draft; replacement uses the external
version's exact hash and retains that version in recovery history. The same conflict
state is reconstructed when a saved draft meets a changed file after restart.

The native isolated-project journey now verifies stale-revision rejection before
the operating-system open call, exact checkout path handoff, clean return, two-sided
conflict review, recoverable resolution, rename, delivery patch and restart. The
rendered conflict state was inspected at
`release/test-artifacts/aux-external-editor-conflict.png`. This closes the human
external-editor continuity gap; agent planning, broader toolchains and connected
GitHub/Vercel/Sentry work remain open in Phase 3. No personal repository, credential
store, bundle, publish or remote write was used.

## Phase 3 scoped-agent local preview loop — integrated, 2026-09-20

A Codex or Claude Code connection scoped to a saved task can now carry its attached
managed checkout through the browser-preview part of the development loop. After an
approved local service starts and reports ready, the agent can request an exact
localhost URL. Aux shows a native dialog with task, revision, project and URL, sends
a cookie-free loopback check only after approval, and opens a tab only for a successful
response. The requesting connection receives temporary access to that page while
unrelated tabs remain hidden; the grant disappears when Aux restarts and revocation
still stops the live MCP process immediately.

The native scoped-agent journey now uses the managed checkout to serve a real page,
opens it through this boundary, reads the rendered heading through Aux's browser
observation, then stops the service and carries the command and file changes into the
integrity-checked review and local commit. The captured native page at
`release/test-artifacts/aux-scoped-agent-preview-page.png` was inspected to verify
the heading actually rendered. This closes the missing preview segment in
the scoped external-agent development loop. A user-configured real Codex/Claude model,
broader toolchains and connected GitHub/Vercel/Sentry delivery remain Phase 3 gates;
the synthetic MCP client does not qualify those. No personal repository, credential
store, bundle, publish or remote write was used.

## Phase 2 durable provider provenance — integrated, 2026-09-20

Every recorded model call now carries Aux-controlled provider and sanitized destination
provenance alongside the exact model ID. The destination is reduced to its URL origin;
paths, query strings, credentials and provider response bodies never enter this record.
Full-page conversations expose the provider/model quietly beneath a turn and expand to
show destination, token counts and whether cost reporting is complete. The same summary
is rebuilt from persisted model-call records after restart instead of degrading to an
opaque call count.

Saved-task receipts and their Markdown exports now carry the distinct providers,
models and destinations used through the selected revision, together with existing
call and cost totals. This preserves historical execution identity even if the active
model setting later changes. The isolated native connected-agent journey configured a
local compatible endpoint, streamed a real planner request, took and returned control,
cancelled the request, restarted Aux, completed a provider-backed follow-up in the same
conversation and verified the exact provenance remained visible.
The rendered state was inspected at
`release/test-artifacts/aux-agent-provider-provenance.png`. The synthetic key remained
absent from the isolated data directory. Live third-party account qualification still
requires a connection explicitly configured by the user.

## Phase 2 saved-task conversation continuity — integrated, 2026-09-20

Every saved task now owns one durable conversation across all of its revisions and
runs. Starting a later revision reuses that conversation, includes the deliberately
selected prior turns, documents and generated artifacts, and snapshots the task
workspace memory exactly once. The full-page conversation shows the saved task title,
all revision turns, its fixed task workspace and the same inspectable context panel.
Tasks can open that exact conversation directly.

Task authority remains in Tasks: a task conversation cannot be independently renamed,
archived, deleted, retried as an unscoped chat or moved to another workspace. Renaming,
archiving and restoring the task update its conversation. Chat history identifies saved
tasks and exposes only **Open saved task** for them. A version 9 database transition
merges legacy per-run task chats, preserves task/run records and carries forward saved
context choices under the stable task conversation ID; the normal pre-upgrade private
backup and transactional rollback protections apply.

The isolated native journey reopened a task after restart, rendered two revisions in
one full-page thread, inspected its governed context, navigated precisely between
Tasks, the run panel and Chats, and confirmed task archive state follows into
conversation history without creating an unscoped replacement run. The rendered state
was inspected at `release/test-artifacts/aux-task-conversation.png`. No provider,
credential store, app bundle or external release was used. Live qualification with a
user-configured provider remains part of the Phase 2 exit gate.

## Phase 1 current-site trust and privacy controls — integrated, 2026-09-20

The site icon in Aux's compact vertical address field and horizontal toolbar now
opens one current-site control center. It reports the exact live origin, distinguishes
encrypted HTTPS, local HTTP and unencrypted remote HTTP, counts cookies visible to
that page, and shows its saved permission decisions. A user can reset one decision
or all access for the origin, or clear cookies and stored website data through the
existing cancel-first native confirmation. The data-clearing boundary rechecks the
tab and origin after confirmation so approval cannot be reused after navigation.

The same surface works in a private window against only that process's nonpersistent
session and in-memory permission map. Private clearing now uses the same confirmation
and changed-tab check as regular browsing; it does not touch the regular profile.
Closing the panel restores keyboard focus to the visible address-field site control.

The native journey used an isolated local site and profile to inspect cookie and
permission state, reset one permission, approve scoped data clearing and verify the
updated state. The existing full private-browser journey now clears and reseeds its
private cookie/storage through this UI, then proves restart isolation and coordinated
exit behavior. The rendered control center was inspected at
`release/test-artifacts/aux-site-controls.png`. It is deliberately a concise trust
surface, not a certificate viewer or a claim that the wider password-manager,
passkey, extension and media compatibility gate is resolved.

## Phase 2 durable conversation sources — integrated, 2026-09-20

Every web page Aux actually observes during an agent turn now appears as compact,
expandable source provenance beneath that turn. A source records the URL, title,
observation timestamp, exact saved artifact identity, document epoch and revision.
Repeated observations of one URL in a turn collapse to the latest revision. Local
file URLs and internal pages are excluded, while captured page bodies and artifact
paths never enter the source API or interface.

Selecting a source returns to the original browser tab when it remains live. If the
tab was closed, the same deliberate action reopens its URL in a new tab. Conversation
Markdown exports include the same source identities and timestamps beside the turn
that used them. Observation artifacts are now detected by their validated content,
so they cannot accidentally appear as reusable generated text merely because their
filename differs from the normal internal naming convention.

The isolated native journey persisted two web sources across a full Aux restart,
deduplicated an older observation, excluded a local-file observation, opened the
live tab, restored the closed tab and inspected the exported report. It also caught
and corrected a broken-preview image state: unavailable previews now fall back to
the source URL without leaving a broken image in the shell. The rendered state was
inspected in `release/test-artifacts/aux-conversation-sources.png`. No provider,
personal data, credential store, bundle or external release was used. These records
prove what Aux observed; they remain explicitly distinct from independent outcome
verification.

## Phase 2 connected-agent control path — integrated with synthetic provider, 2026-09-20

Aux can now use a deliberately configured OpenAI-compatible provider alongside its
existing Gateway, OpenAI, Anthropic and Google choices. The dedicated Settings row
shows the exact destination, requires HTTPS for remote hosts and allows plain HTTP
only on localhost/loopback. It rejects embedded credentials, query parameters and
fragments. The model key uses the existing desktop encrypted secret store and is
never returned to the renderer, database or preferences file. Changing any part of
the connection invalidates its prior health result, and no provider fallback occurs.

The full-page conversation now exposes an explicit Take control action for a live
task. Taking control pauses its run and opens the actual task tab. Returning one
page cannot accidentally resume a multi-page run while another scoped page remains
under human control. Return and Stop are duplicate-safe while in progress, and the
run stays visibly paused until every held page is handed back.

The isolated native journey configures and probes a local OpenAI-compatible fixture,
starts a real streamed planner call, takes and returns browser control, cancels the
run, restarts Aux and verifies the endpoint, masked encrypted key and successful
health result persist. It also scans the isolated Aux data directory to confirm the
synthetic key is absent in plaintext. Rendered states were inspected in
`release/test-artifacts/aux-openai-compatible-settings.png` and
`release/test-artifacts/aux-agent-human-control.png`. No personal credential store,
external provider, app bundle or release was used. Phase 2 still requires a real
user-configured provider or supported existing-agent task before its live gate can
be called complete.

## Phase 2 portable conversation reports — integrated, 2026-09-20

Every saved full-page conversation now has one quiet header action that exports the
complete thread as Markdown through Aux's existing native save dialog. Export loads
all turns from runtime pagination rather than relying on the currently rendered
page. It records prompts, visible structured results, safe failure recovery text,
turn status, timestamps, workspace-memory revision, selected context provenance and
human-facing local/generated artifact metadata.

The report explicitly omits hidden prompt context, local document and workspace-note
contents, generated artifact bodies and filesystem paths. Untrusted visible text is
escaped as inert Markdown/HTML text. The report states that it is a transcript and
provenance record, not independent verification of consequential outcomes. Canceling
the native save leaves the conversation unchanged.

The isolated native artifact journey now exports a real Markdown file after a full
Aux restart and verifies its artifact provenance while confirming a seeded hidden
prompt and temporary path are absent. The understated header action is visible in
`release/test-artifacts/aux-conversation-artifact-context.png`. No provider request,
credential store, personal data, app bundle or external release was used.

## Phase 2 revisioned workspace memory — integrated, 2026-09-20

The conversation Context panel can now bind a chat to one saved workspace and edit
a bounded shared memory note. The panel shows the workspace, exact memory revision
and update time; saving rejects a stale revision instead of overwriting a newer
edit. The selected workspace and its memory survive a complete Aux restart. The
composer shows the selected workspace name without adding another permanent control.

At run start, Aux snapshots the workspace note into bounded context and records its
workspace ID and revision. The same memory enters saved-task runs automatically from
the task's workspace. Retry retains the original snapshot and revision even after
the shared note changes. The note is user-authored reference context and never
grants page, project, credential or action authority. Scoped external clients cannot
read or rewrite it through the API; management remains in the Aux desktop.

The isolated native journey creates a workspace, selects it in a conversation,
saves memory, fully restarts Aux, verifies the restored scope and note, and confirms
both a follow-up conversation turn and saved-task run carry revision 1. The rendered
state was inspected in `release/test-artifacts/aux-conversation-workspace-memory.png`.
No provider request, credential store, personal data, app bundle or external release
was used. Cross-device synchronization and cloud workspace memory remain Phase 4
work rather than implicit behavior of this local profile.

## Phase 2 generated-artifact context continuity — integrated, 2026-09-20

Text, Markdown, CSV and JSON artifacts produced by earlier turns now appear in the
conversation's existing Context panel. They are excluded by default and can be
selected deliberately for a follow-up. The row identifies the artifact, originating
turn, size and bounded excerpt. Internal observation snapshots, nontext content,
oversized files, missing files and artifacts from another conversation remain out
of this surface.

Selection lives in the runtime profile and survives a full Aux restart. Context
assembly reads only supported bounded content, labels it as untrusted reference
text and stamps the exact artifact IDs on the new run. Retry preserves that exact
prompt snapshot even if the current selection changes later. The conversation API
does not expose the artifact's filesystem path, and deleting a conversation clears
its artifact selection with its artifact records and safely contained files.

The isolated native journey selects a synthetic Markdown output, restarts Aux,
verifies the selected row, starts the next turn with exact provenance and confirms
the path stays absent. The rendered state was inspected in
`release/test-artifacts/aux-conversation-artifact-context.png`. No provider request,
credential store, personal data, app bundle or external release was used. Binary
and image artifacts remain visible through their existing turn previews rather than
being flattened into model text context.

## Phase 2 local-document conversation context — integrated, 2026-09-20

The full-page conversation can now attach up to five local text, Markdown, CSV or
JSON documents through the existing native file picker. Aux shows the filename,
size and a bounded excerpt; each snapshot can be included, excluded or removed
before the next turn. A document may be attached before the first message. That
unsent conversation identity, its draft and its document list survive a complete
Aux restart, so the selection cannot become an invisible orphan.

Only the selected text snapshot enters Aux's runtime profile. The native source
path is never returned to the renderer or written into run history. The runtime
assembles bounded untrusted document sections and stamps the exact attachment IDs
onto each new turn; retry retains the original snapshot even if the source file or
current selection changes later. Conversation deletion removes the attachment
record with the rest of the chat-owned data.

The isolated native journey selects a synthetic document, changes the source file,
fully restarts Aux, verifies the original snapshot, starts the next turn and removes
the document from the rendered context panel. The expanded state was inspected in
`release/test-artifacts/aux-conversation-document-context.png`. No provider request,
credential store, personal file, app bundle or external release was used. Workspace
memory remains independent Phase 2 work.

## Phase 2 durable conversation lifecycle — integrated, 2026-09-20

Chats now have a first-class durable lifecycle instead of being only a view over
run rows. The searchable full-page history separates active and archived chats and
supports inline rename, archive, restore and an explicit permanent-delete
confirmation. Titles, archive state, timestamps and turn counts live in the runtime
SQLite profile and survive a full Aux restart. Archived chats leave Home and the
normal run feed while their complete turn history remains available for restore.
Continuing an archived chat is rejected until it is restored.

Deletion is conversation scoped and transactional. Aux removes the chat's turns,
steps, results, model-call records, events, spans, response metadata, datasets,
operation/action history, checkpoints, context preference and artifact rows, then
removes artifact files only when their resolved paths remain inside Aux's artifact
directory. It leaves browser tabs, page state, browsing history and other chats
untouched. Active work, saved-task conversations and unresolved actions or
operations cannot be deleted, preserving their recovery paths.

The isolated native journey renames a two-turn chat, archives it, fully restarts
Aux, restores it, confirms permanent deletion and verifies the linked browser tab
survives. The archived state was inspected in
`release/test-artifacts/aux-conversation-lifecycle-archived.png`. Database upgrade
8 backfills metadata for legacy chats and preserves the standard private recovery
snapshot. No provider request, credential store, personal browsing data, app bundle
or external release was used. Live provider streaming and a real agent session
remain the next account-dependent Phase 2 boundary; workspace memory and richer
cross-workspace context remain independent follow-on work.

## Phase 2 inspectable conversation context — integrated, 2026-09-20

The full-page conversation composer now shows one quiet Context control that opens
the exact recent turns Aux may use for the next reply. Individual turns can be
excluded and restored. **Use previous turns** clears or restores inherited memory
without deleting visible conversation history. Browser-tab context remains a
separate selector, so choosing a page never silently re-enables conversation memory.
These choices live in the runtime SQLite profile and survive a complete Aux restart.

Context assembly moved out of the renderer and into the runtime. Each new run stores
the exact source run IDs beside its bounded prompt context. Failed turns contribute
their safe status summary instead of raw error text. A retry preserves the original
context snapshot instead of adding later history. The isolated native journey
excludes one turn, clears and restores all inherited context, restarts Aux, verifies
the exclusion, and starts the next run with only the selected provenance. The
rendered state was inspected in
`release/test-artifacts/aux-conversation-context.png`. No provider request,
credential store, personal browsing data or app bundle was used. Workspace memory,
local-document context and task-level inspection remain broader Phase 2 work.

## Phase 2 resilient provider sessions — integrated, 2026-09-20

Conversation turns now persist a small, provider-neutral failure record for model
authentication, quota, rate-limit, network, timeout, provider, capability and
malformed-output failures. Provider response bodies are replaced at the runtime
boundary with stable user-facing summaries before model-call or run history is
written. Auth, quota, capability and configuration failures route directly to the
existing Models settings page. Transient failures offer one deliberate retry that
uses the existing guarded same-thread retry path. The coordinator no longer
amplifies auth, capacity, network or provider failures through internal plan repair;
bounded automatic repair remains reserved for malformed structured output.

Cancellation and run deadlines continue to abort the in-flight model signal. A
versioned database migration adds the failure record without discarding existing
runs and retains the pre-migration recovery snapshot policy. The native isolated-
profile journey renders the retryable state in
`release/test-artifacts/aux-conversation-provider-recovery.png`, verifies no raw
provider body appears, and routes an authentication failure to the actual Models
page in `release/test-artifacts/aux-conversation-provider-settings.png`. It uses a
synthetic page and seeded safe metadata, with no provider request, credential store
or app bundle. Live provider streaming and real account qualification remain the
account-dependent Phase 2 gates.

Broader validation exposed a stale local native-engine addon that predates the
authenticated browser-service token API. In developer mode Aux now closes that
listener and uses its existing in-process engine instead of attaching without a
bearer or disabling the engine. Production continues to require its isolated host
and fails closed. The native engine and live MCP journey pass with this compatibility
path; the optional Chromium fallback subcase remains skipped when no standalone
Chromium binary is installed.

## Phase 2 model-connection health continuity — integrated, 2026-09-20

An explicit provider connection test now leaves a small, nonsecret health record:
provider, exact model ID, success/failure, test time, latency and vision capability
when known. Settings restores that result after closing or restarting Aux, placing it
on its own readable line beneath the selected model. Changing the provider, key or
model immediately removes the stale result. Provider error text remains transient
and is never written into the health record, avoiding persistence of a response that
might echo request details.

The native isolated-profile journey restores a saved failed result, renders the full
model ID and timestamp in `release/test-artifacts/aux-model-health.png`, changes the
model, and verifies the prior result disappears from both UI and runtime settings.
Provider client checks still verify fixed provider destinations and single-attempt
authentication failure. No provider request, key, OS credential store or app bundle
was used for the native journey. A real connection test remains an account-dependent
Phase 2 acceptance gate.

## Phase 2 interrupted conversation-turn recovery — integrated, 2026-09-20

A failed, cancelled or runtime-interrupted conversational turn can now be retried
from the full-page conversation without losing its thread or browser scope. Retry
creates a new auditable run linked to the original turn rather than mutating history.
Only the latest turn offers the action. The runtime rejects an older retry after a
newer turn exists, rejects concurrent work, and retains the existing unresolved-
action guard so an uncertain consequential effect cannot be repeated. Runs tied to
a saved task continue through that task's exact revision instead of bypassing its
scope from the conversation.

The real desktop journey opens a synthetic browser context, fully exits Aux, seeds
the same state a mid-turn process loss leaves behind, relaunches, opens the saved
conversation, and retries it once. The second turn retains the conversation ID,
original prompt and restored page ID. Rendered states were inspected in
`release/test-artifacts/aux-conversation-interrupted.png` and
`release/test-artifacts/aux-conversation-retried.png`; the earlier turn no longer
shows a stale retry control. Runtime restart integration and service/store checks
cover retry lineage and duplicate rejection. No model key or credential store was
used. This closes deliberate recovery after an interrupted turn; live provider
streaming, provider cancellation/reconnect behavior and real account qualification
remain Phase 2 gates.

## Phase 3 reviewed project-session resume — integrated, 2026-09-20

An interrupted task-bound local service can now be resumed deliberately after Aux
restarts. Aux continues to mark every formerly running process interrupted and never
executes repository code automatically. For a service attached to the currently
open task and exact saved revision, the command record offers **Review and restart
service**. Restart goes through the existing native command sheet, rechecks the task
revision and project attachment after approval, creates a new auditable command
record, and keeps the interrupted record intact. Services from another or earlier
task revision show recovery guidance instead of a launch control.

The complete native managed-project journey now starts a service after a reviewed
local commit, fully exits Aux, verifies the prior record becomes interrupted,
reviews and restarts the exact service, reopens a healthy browser preview, stops the
new process, and continues through file recovery and stale-revision rejection. The
resumed and prior records were inspected together at
`release/test-artifacts/aux-project-resume.png`. This closes manual local-service
resume for the supported project workflow while preserving the no-silent-execution
rule. Multi-process dependency ordering and automatic health/restart policies remain
open and will not be inferred from this manual recovery path.

## Phase 3 package-aware workspace readiness — integrated, 2026-09-20

Managed JavaScript/TypeScript checkouts now recognize common root workspace layouts
from bounded `package.json` workspaces and `pnpm-workspace.yaml` package patterns.
The project surface identifies the workspace alongside its package manager,
lockfile, dependency state and root commands. It now also discovers up to 50 regular
package manifests declared by those patterns, shows their names, paths and scripts
behind one quiet expandable row, and prepares bounded package-level commands for
npm, pnpm, Yarn and Bun. Aux compares the checkout with its saved Git baseline,
maps changed paths to packages, and follows internal package dependencies so a
changed library also marks its dependent applications. Each affected package shows
the reason it was selected. One action loads a bounded combined check command for
the affected set without running it; the user can inspect the exact command before
the existing native approval. Root manifest, workspace, lockfile and TypeScript
configuration changes conservatively affect the whole workspace. Real paths must
remain inside the managed checkout, so parent patterns and workspace symlinks cannot
expose outside manifests. Inspection
does not execute repository code. Every root or package command still requires the
existing native review before execution.

The complete native project journey now uses a workspace fixture, changes a file
after the saved baseline, displays the affected package and reason, loads and runs
the reviewed affected check, prepares Python and JavaScript environments, operates
multiple services, follows the linked preview, edits and recovers files, restarts
Aux, and preserves the original checkout. The rendered workspace state was inspected
in `release/test-artifacts/aux-project-workspace.png`.
This qualifies declared workspace discovery, internal dependency propagation and
reviewed affected checks for the supported npm/pnpm project path. Very large or
cyclic workspace qualification, non-JavaScript build graphs, and richer impact
rules remain open.

## Phase 2 scope-aware external-agent catalog — integrated, 2026-09-20

New Codex and Claude Code connections now advertise only tools usable within their
saved authority. Task connections omit page/workspace creation, unscoped run starts,
global events, Chrome attachment, sets and other general-runtime operations. A
workspace connection additionally exposes task creation inside that workspace.
Both retain the authorized page, run, evidence and managed-development tools. The
runtime still rechecks the bearer, scope, task revision, page/resource attachment
and project identity on every dispatch; catalog filtering is usability and least
surprise, not the security boundary.

The real desktop → restart → MCP stdio journey verifies both task and workspace
catalogs, performs the existing authorized browser, evidence, file, command, review
and local-commit workflow, rejects unrelated resources and stale revision, then
proves UI revocation stops the already-running client. Legacy broad `vector_*`
configuration behavior is unchanged, while obsolete Aux configurations without a
scoped bearer still fail closed. The scoped catalog UX gap is closed. Actual
Codex/Claude account qualification, long-running reconnect/cancel behavior and a
live provider-backed task remain dependent on a user-configured connection.

## Phase 1 durable closed-tab recovery — integrated, 2026-09-20

Recently closed tabs now survive a full Aux restart in the regular profile. Reopen
Closed Tab restores the latest entry into its prior space, surviving folder and
global sidebar position, then selects the newly created browser document. If the
space or folder was removed, the existing safe fallback remains: use the current
space and do not recreate deleted organization. Recovery retains at most 20 valid
entries for 30 days, discards malformed or stale saved data, and never records blank
new tabs.

Private browsing explicitly skips this recovery store. The real desktop journey
closes and restores a foldered tab, closes another tab, fully exits and relaunches
Aux, then restores the second tab with its original organization while the tabs
that stayed open retain their stable IDs and receive fresh document epochs. The
private process journey closes a synthetic tab and proves no recently-closed key is
written. The restored populated sidebar was inspected at
`release/test-artifacts/aux-tab-recovery-after-restart.png`; the original
spaces/folders hierarchy and neutral shell remain intact. Desktop type/build and the
applicable repository regression suite pass. Reopening restores the URL and
organization, not unsaved form state or the prior navigation stack.

## Phase 2 conversation composer continuity — integrated, 2026-09-20

New conversations now have the same durable draft behavior as saved-chat replies.
Home’s explicit Ask mode, the full-page composer and alongside-page agent panel share
one new-chat draft. Ask mode, the text and selected browser-context identifier survive
renderer and app restart. Saved chats retain independent drafts and context choices.
Starting a run clears only the submitted draft after success; setup errors and start
failures retain it. Opening New chat resets the side panel to its neutral composer
instead of showing an unrelated prior run.

Only the opaque page identifier is persisted, never page text, URL or a preview. If
that page closes or cannot be restored, the composer falls back to New browser tab
without deleting the prompt. The real redesigned desktop journey switches between
saved conversations, full-page and panel composers, reloads the renderer, restores
the new prompt and context, then closes the context and verifies the safe fallback.
The resulting states were inspected at
`release/test-artifacts/aux-new-chat-continuity.png` and
`release/test-artifacts/aux-home-ask-continuity.png`; the home and composer remain
restrained, readable and aligned with the accepted shell. This closes the
credential-independent draft/context continuity gap. Live provider streaming and
reconnect qualification still require a user-configured connection.

## Phase 3 reviewed local commit checkpoint — integrated, 2026-09-20

Aux can now turn a ready delivery handoff into one local commit in its isolated
checkout. The UI and task-scoped agent route bind the request to the task revision,
attached project, SHA-256 patch identity and exact staged Git tree. The human enters
the commit message, author name and email explicitly; Aux does not inspect global Git
identity, password managers, signing keys or credential stores.

Before and after the native confirmation sheet, Aux regenerates and compares the
reviewed snapshot, rejects task/attachment drift, and requires commands and services
to be stopped. The commit uses a private temporary index, disables repository hooks,
signing, credential helpers and network protocols, atomically advances only the saved
managed branch, and retains a protected copy of the previous index. No push, publish,
remote authentication or pull-request creation occurs. A matching tree cannot be
committed twice as an empty checkpoint.

The desktop journey committed tracked, empty, binary and new files after its real
checks and preview, proved the source checkout stayed on its original commit, then
restarted and continued editing/recovery. The scoped MCP journey created the same
kind of approved checkpoint and remained fenced to its authorized task. Unit coverage
also proves explicit author identity, hook/signing bypass, index recovery and rejection
when files change after review. The reviewed form and completion state were inspected
in `release/test-artifacts/aux-prepared-change-review.png` and
`release/test-artifacts/aux-local-commit.png`. Local commit identity is no longer a
Phase 3 gap. GitHub account/scopes/checks and any authorized remote PR write remain
open. No credential store, personal repository, app bundle, push, publish or remote
write was used.

## Phase 3 integrity-checked delivery handoff — integrated, 2026-09-20

Aux now regenerates a task-bound delivery handoff from a fresh checkout inspection.
It creates a reviewer summary, deterministic pull-request draft, binary-capable Git
patch and JSON manifest beside protected project metadata. The patch includes tracked
changes since the saved baseline and regular untracked files, is bounded to 2 MB and
is omitted with an explicit reason if it cannot be complete. The manifest records
the project, branch, baseline, task revision, readiness decision and SHA-256/byte
length for every artifact.

Readiness is conservative: fresh changes, a complete patch and a successful latest
bounded check are required; active processes, environment inspection errors or a
failed recorded preview become visible attention items. The task page opens the
summary and PR draft, exports the exact patch through a native save dialog and
reveals the handoff files. Copy states plainly that no commit, push or pull request
was created. Preparing through the UI revalidates the attached task revision; the
scoped-agent route applies its existing task/revision/project authority check.

The native journey includes tracked text, new text, empty and binary files, exports
the patch, clones a clean checkout and successfully applies that patch with content
and bytes intact. It also verifies restart persistence and the existing stale-task
approval boundary. The rendered handoff was inspected at
`release/test-artifacts/aux-prepared-change-review.png`; readiness, artifact actions,
hashes and evidence remain readable. Focused schema/artifact checks, desktop build,
the scoped-MCP journey and the full local-project journey pass. A portable local
review package and PR draft are no longer a Phase 3 gap. Local commit identity,
GitHub account/scopes/checks and any authorized remote PR write remain open. No
credential store, app bundle, commit, push, publish or remote write was used.

## Phase 3 project environment readiness — integrated, 2026-09-20

Managed checkouts now expose a shared environment inspection to the human workflow
and task-scoped external agents. Aux reads only fixed root markers, bounds
`package.json` to a regular 256 KB file and does not execute repository code while
inspecting. It detects npm/pnpm/yarn/bun lockfiles and scripts, Python requirements,
pyproject/Pipfile/Poetry/uv markers, project-local `.venv` state and the availability
and version of the required local tools.

Commands & preview presents the result as one compact readiness surface. Setup,
check and dev-script choices load an exact, shell-quoted command and select service
mode only for long-running scripts. Nothing starts until the existing native dialog
shows the command, checkout, task and revision. The same separate HOME, no inherited
model credentials, concurrency limits, saved output and stale-revision recheck apply.
Readiness refreshes after a command finishes, and prepared change reviews include a
dated environment summary.

The isolated desktop journey prepares a real `.venv`, runs a real npm check, verifies
both saved task-bound records, continues through multiple services, preview
diagnostics, live editing, restart and recovery, and proves the original checkout is
unchanged. The real scoped-MCP journey reads the same npm/script/tool facts before
performing its approved changes. The rendered environment was inspected at
`release/test-artifacts/aux-project-environment.png`; hierarchy, statuses and command
choices remain legible without turning the task page into an IDE dashboard. Focused
inspection and schema checks, desktop build and both native journeys pass. Baseline
JavaScript/TypeScript and Python readiness is no longer a Phase 3 gap. Monorepos,
additional framework/toolchain qualification, process health/restart policy, real
provider planning and authorized GitHub/Vercel/Sentry delivery remain open. No
credentials, personal repository, app bundle, publish or remote write was used.

## Phase 3 linked preview diagnostics — integrated, 2026-09-20

The managed-project workflow now links a checked localhost preview to the actual
Aux tab it opens. Rechecking the same URL reloads and activates that tab instead of
creating duplicates, so switching a service or rebuilding cannot leave the user on
an old document. The project panel retains the tab relationship through ordinary UI
navigation and renderer restart, then resolves the recovered tab by its stable ID.

Commands & preview now shows a bounded, two-column view of the linked page's recent
console messages and HTTP responses, including level, method, status, URL, timestamp
or duration. It refreshes after a completed navigation and on demand. If the tab is
closed or navigates away from the checked URL, Aux stops presenting its evidence as
the project preview and gives the exact recovery action. The local readiness probe
remains separate and cookie-free; diagnostics describe the linked browser page and
do not claim that a process owns the port.

The native desktop journey launches a real Vite service, opens its browser tab,
captures a deliberate console warning and the module response, checks the navigated
and closed-tab states, reopens the preview, edits through Aux and observes live
reload. The rendered result was inspected at
`release/test-artifacts/aux-preview-diagnostics.png`; its hierarchy, truncation and
compact scrolling remain readable inside the task page. Typed response contracts,
capture checks, desktop build and the complete local-project journey pass. This
closes the integrated console/network diagnosis gap. Monorepo and additional
framework qualification, process-health policy, real provider planning and
authorized GitHub/Vercel/Sentry delivery remain open. No credentials, personal
browser content, bundle, publish or remote write was used.

## Phase 3 coordinated local services — integrated, 2026-09-20

A managed checkout can now keep up to four independently recorded local services
running while one bounded build/check command executes alongside them. Duplicate
service launches, a fifth service and overlapping one-shot checks are rejected with
clear recovery text. Every process retains its own task/revision binding, exact
command, output, state and stop control. Stopping one service leaves the others
running; quitting or restarting Aux marks every unfinished record interrupted and
does not restart anything silently.

The Files workflow still permits live-reload edits while services run. Ordinary
commands block conflicting saves only for their bounded lifetime, and the existing
separate HOME, no supplied model credentials, native command review, process-group
cleanup and saved-output limits remain in force. Scoped external agents receive the
same limits and can list or stop only commands in a checkout attached to their
authorized current task revision.

The native desktop journey runs a Vite frontend and a separate Node service together,
executes a check while both remain live, edits the frontend through Aux, verifies the
browser preview updates, stops each service independently and confirms all records
after restart. The real scoped-MCP journey also starts two approved services, runs a
check beside them, stops one without affecting the other and includes the evidence
in its review handoff. The rendered service view was inspected at
`release/test-artifacts/aux-local-service.png`; distinct logs and controls remain
readable in the neutral shell. Multi-service coordination is no longer a Phase 3
gap. Additional environment breadth, process health/restart policy, real provider planning
and connected delivery remain open. No
credentials, bundle, publish or remote write was used.

## Phase 3 task-scoped agent development — integrated, 2026-09-20

A scoped Codex or Claude Code MCP connection can now carry its authorized saved
task into an attached managed checkout. The client can list only repository
resources on that task, inspect the baseline diff, enumerate bounded Git-visible
files, read one UTF-8 file with its SHA-256, propose a conflict-safe replacement or
exclusive new file, inspect saved commands, request an exact command/service, stop
it, and prepare the durable local review handoff. Every call rechecks connection
scope, task identity, task revision and repository attachment before desktop
dispatch.

File creation and replacement pause at a native Aux dialog showing the saved task,
revision, checkout path, byte size and a bounded content preview. Command execution
shows the exact command, working directory and unsandboxed/network disclosure.
After approval Aux revalidates the task revision and attachment, coordinates with
active project commands, and uses the existing no-overwrite, expected-hash, atomic
save and recovery paths. The client never receives arbitrary filesystem authority,
model credentials, commit/push access or a remote-write shortcut.

The real isolated desktop → scoped bearer → MCP stdio → runtime → desktop journey
now covers attached-project filtering, bounded read, approved replacement/create,
task-bound command output, a command-backed review summary, unrelated-project
rejection, stale-revision rejection, original-checkout preservation and immediate
revocation of the same running MCP process. Contract and handler checks exercise the
same dispatch boundary. This materially advances Phase 3, but a real configured
Codex/Claude session, agent planning over these tools, dependency/framework breadth,
multi-service work and GitHub/Vercel/Sentry delivery
remain open. No personal repository, credential store, bundle, publish, commit,
push or remote service was used.

## Phase 3 local change lifecycle and review handoff — integrated, 2026-09-20

Aux now carries a managed checkout from editing through a durable local review
handoff. A selected UTF-8 file can open in its macOS default app without exposing a
general filesystem picker. The task-scoped return path above detects outside changes
and its existing hash/inode checks reject stale writes. Files can be moved
within the checkout without replacing existing or ignored paths. Deletion requires a
native confirmation. Both rename and delete verify the exact disk version and retain
a recovery snapshot outside the working tree; the original source checkout remains
unchanged.

Checkout status can prepare a timestamped Markdown handoff from a fresh baseline
diff, untracked file names, the ten most recent task-bound command records and the
last local preview check. The summary is stored beside Aux's protected project
metadata, survives restart, and never appears as a Git change. Its copy explicitly
states that it does not commit, push or create a pull request. The rendered handoff
was inspected at `release/test-artifacts/aux-prepared-change-review.png` and the
action geometry was tightened after inspection.

The native isolated journey exercises task-scoped default-app handoff and conflict
resolution, rename, confirmed delete,
recovery retention, summary generation, command/diff inclusion and restart while
proving the dirty original checkout is untouched. Focused file/project checks cover
conflicts, no-overwrite behavior, link rejection and durable output. This completes
the human-controlled change lifecycle portion of Phase 3. Agent-scoped development
tools, dependency setup breadth, multi-service projects,
real provider qualification and authorized GitHub/Vercel/Sentry connections remain
open. No credential store, personal repository, bundle, publish or remote write was
used.

## Phase 1 managed unpacked extensions — integrated, 2026-09-20

Settings now provides an honest unpacked-extension manager for the regular Aux
profile. A user explicitly chooses a folder and sees its name, version and declared
manifest access before installation. Aux validates a bounded regular-file tree,
rejects symbolic links, copies it into private managed storage, loads it without
file-URL access, and supports durable disable, re-enable and removal. Launch-configured
developer extensions remain visible but are not presented as Aux-managed copies.

The native isolated journey verifies a real MV3 content script in an Aux browser
tab, full restart while enabled, immediate disable, restart while disabled, re-enable,
absence from a separate private-browsing process, removal and absence after another
restart. The rendered Settings row was inspected for hierarchy, state, permissions
and action alignment. Focused manager checks cover atomic copying/state and symlink
rejection. Existing data is preserved; removal deletes the managed copy but the UI
correctly notes that Chromium profile storage may remain until site data is cleared.

This improves the first hands-on build without claiming Chrome parity. Chrome Web
Store installation, automatic updates, native messaging, 1Password desktop identity
and broad third-party compatibility remain open architecture/real-account gates.
No credential store, personal extension, personal profile, app bundle, publishing
or external service was used.

## Phase 2 scoped external-agent authority — integrated, 2026-09-20

Aux can now create a revocable Codex or Claude Code MCP connection for one saved
task or workspace. Settings generates the client configuration, shows the raw token
once, records only its SHA-256 digest, displays persisted last-use/revocation state,
and revokes an already-running client immediately. Version 6 adds the durable
connection records through the protected database migration path. Older Aux-branded
configs that omit a scoped token fail closed instead of inheriting the broad runtime
descriptor.

The runtime enforces scope on every request. Task/workspace/page/run lists are
filtered; task calls must belong to the selected scope; page calls require a page
attached to the task or one of its current-revision runs. A connection cannot open
a new page or workspace, access unrelated work, manage connections, use the global
event stream, accept evidence, reconcile actions, or expand its authority. External
evidence retains `external_client` provenance and stays in Needs review.

The native isolated journey creates two disjoint workspaces, tasks and real browser
tabs through the desktop, creates a task connection, restarts Aux, launches the
generated real MCP stdio command, and proves only the authorized records and page
are visible. The allowed page is observed, unrelated and authority-expanding calls
are rejected, evidence is recorded with reviewable provenance, and UI revocation
cuts off the same live MCP process. Rendered Settings screenshots were inspected;
the connection hierarchy and active/revoked states are legible and aligned.

This is an independently deliverable Phase 2 security/integration batch while
Phase 1 waits on founder account compatibility, hands-on review and bundle-dependent
OS integration. It does not complete Phase 2: a real user-configured Codex/Claude
session still must qualify setup health, streaming, cancellation, reconnect and
follow-up continuity. The shared MCP catalog can also present general tools that a
scope will correctly deny; catalog filtering is a remaining UX refinement. No
credentials, personal profile, app bundle, publishing or external service were used.

## Phase 1 multiple regular windows — integrated, 2026-09-20

Acceptance for this coordinated batch is two regular Aux windows with independent
selected tabs and space/folder layouts, one shared signed-in Chromium profile and
runtime, correct page/dialog/event routing, coordinated unsaved-work protection,
and restart recovery without duplicate or lost tabs. A duplicate shell over the
single global stage is explicitly insufficient.

Regular-window ownership is now end to end. Page targets, native snapshots, popup
descendants and restart-tab records carry a window ID. Database schema 5 adds
`tabs.window_id` with `main` as the compatibility default; protected upgrades keep
existing tabs. Each window owns its native stage, selected and split tabs, shell
events, shortcuts, dialogs, page controls and close decision. Cross-window page
commands are rejected. Global downloads and runtime status remain deliberately
shared. The signed-in Chromium profile and runtime are shared without merging each
window's tabs or sidebar layout.

`tests/smoke/multi-window-desktop.mjs` drives two real Aux windows in an isolated
profile. It verifies disjoint tab lists and selection, distinct persisted space
layouts, shared cookies and site storage, sender/owner enforcement, cancellation of
a dirty secondary-window close, and full-process restart. Both windows return with
the same window and tab IDs, selected tab and layout, without duplicates. Existing
authentication navigation, single-window tab recovery, regular close/Quit unload
coordination and external-link journeys pass after the refactor. Type checking,
database migration and renderer tab-layout checks pass. The one full-suite browser-
service timeout passed immediately in isolation with a 2.2-second run and is treated
as resource contention, not ignored product evidence.

This completes the multiple-regular-window experience inside Phase 1; it does not
complete Phase 1 or the roadmap. Browser-platform compatibility, remaining
daily-use qualification and founder review stay open. No app bundle, credential
access, personal profile inspection, publishing or release was involved.

## Phase 1 authentication-navigation continuity — 2026-09-19

Human background tabs now use a separate native adoption path instead of Electron's
synchronous background-window hook, which could deadlock a real middle-click. They
retain the request referrer, appear in Aux's original space/folder tab model, remain
unselected, and no longer get mistaken for hidden runtime worker pages. Foreground
tabs and sign-in windows keep Chromium's opener, blank-window and form-navigation
behavior. Closing a launched foreground tab returns to its opener rather than an
unrelated newer background tab.

An isolated two-origin journey now covers middle-click selection, same- and
cross-origin referrers, opener continuity, an IdP redirect that sets and reads a
SameSite cookie, state round-trip to the relying-party callback, shared callback
cookies, opener messaging and popup cleanup. Existing blank-window/form-POST/nested
popup, restart recovery and external-link journeys also pass. This establishes the
browser plumbing needed by sign-in flows; it does not qualify a real identity
provider, passkey device, 1Password or Apple Passwords. No account, credential store,
personal profile, app bundle or external service was used.

## Phase 1 accessible shell integration — 2026-09-19

The accepted neutral Aux shell now has one consistent keyboard and accessibility
path across home, spaces, folders, both tab layouts, conversations and settings.
The Search/Ask field exposes a real combobox relationship and announces its current
mode; recent cards have concise names instead of reading their entire preview;
conversation titles, timestamps, reply controls and captured images have useful
document semantics. Settings categories support arrow/Home/End traversal, theme and
engine choices behave as native radio groups, and every settings input now has a
programmatic name. Focus remains a fine neutral line without reintroducing blue.

Reduced Motion now suppresses continuous spinners, sweeps, transitions and folder
animation through the shared design-token layer. Increased Contrast strengthens
secondary text and dividers, and Reduced Transparency retains the existing solid
sidebar fallback. Theme, typography, shell geometry, focus and link values now live
in the canonical token sheet rather than later component overrides, so the rendered
appearance and its design contract no longer disagree.

The integrated native journey covers Search/Ask switching; spaces, menus and modal
focus restoration; collapsed folders; complete sidebar collapse/reveal; vertical
and horizontal tab navigation; settings-category and radio movement; and a simulated
Reduced Motion preference. The full home/conversation/settings journey and broader
source checks also pass. Inspected `aux-keyboard-settings-focus.png` after rendering:
the selected appearance row, radio state, select focus, sidebar alignment and rounded
main surface remain coherent. These checks establish the implemented semantics and
keyboard flow, but do not claim a completed manual VoiceOver audit on real websites.
No app bundle, personal profile inspection, credential access or external release
was involved. Phase 1 remains active because browser compatibility and remaining
daily-use gaps are still open.

## Phase 1 private-browsing integration — 2026-09-19

New Private Window now launches from Aux's File menu as a separate process using the
real shell, original spaces/folders/tab model and fully collapsible sidebar. It has
nonpersistent shell/page sessions and in-memory tabs, history, permissions, bookmarks
and download state. It does not start the agent runtime, expose a production CDP
endpoint, load extensions or write regular browsing databases. Agent/project/settings
controls are hidden; the home explains that explicitly saved downloads remain files.

The native journey verifies the regular-menu launch path, complete collapse/restore,
tab switching, a retained live draft, native nonpersistent session identity, and
fresh cookies/localStorage/tabs/history after restart. A real `beforeunload` form
confirms Stay preserves every private tab and draft and Leave closes cleanly. A direct
non-Playwright process proves no remote-debugging switch or DevToolsActivePort and
scratch-profile removal. Regular popup/sign-in and whole-window unsaved-work journeys
still pass. Inspected `aux-private-home.png` and `aux-private.png`; the latter cannot
include native WebContentsView pixels in a shell-only screenshot, so the page content
is asserted through its native renderer.

Whole-app Quit now coordinates the regular process and every private child through a
two-phase prepare/validate/commit protocol. Each process performs Chromium's real
`beforeunload` traversal without destroying a page, then freezes the approved document
set until the other windows agree. If a later window chooses Stay or changes during
the preflight, earlier approvals are aborted, hidden windows return, and every draft
and private scratch profile remains intact. Unanimous Leave closes all processes and
removes every private scratch profile. The integrated journey covers two dirty private
windows with a later veto, a second successful Quit, and the ordinary regular-window
exit path. General support for multiple regular Aux windows remains separate work. No
app bundle, real account, credentials, publishing or release was involved.

The updated source app was then launched with `AUX_LOAD_DOTENV=0 pnpm dev` for the
next hands-on review. The rebuilt renderer, desktop process and runtime reached their
ready states and remain running on the normal development ports. This was not a
fixture/profile migration test: existing page URLs and contents were deliberately
not enumerated, and no credential store was searched. No bundle was created.

After coordinated Quit was integrated, the source app was rebuilt and restarted so
the running hands-on build includes that behavior. The renderer is listening on 5197
and the runtime reported ready. This restart did not enumerate the existing profile's
page URLs or contents.

## Phase 1 runtime and wake recovery — 2026-09-19

The desktop shell now supervises its execution runtime independently from the native
browser views. An unexpected runtime exit immediately pauses agent-backed features,
shows a compact neutral reconnecting status, and starts a replacement with bounded
backoff. The replacement enumerates and reattaches to the live native targets instead
of recreating them. Page IDs and selection remain stable, while document/controller
epochs advance so stale automation references cannot cross the runtime boundary.

`tests/smoke/runtime-recovery-desktop.mjs` force-kills the isolated runtime beneath a
real Electron shell while a native page contains an unsaved form. It verifies the
visible disconnect state, automatic reconnection, unchanged tab identity and active
selection, no duplicate surfaces, continued API use, and retention of the same live
renderer and draft. It then emits a synthetic macOS resume event and verifies the
wake health check leaves the workspace unchanged. The inspected recovery surface is
`release/test-artifacts/aux-runtime-reconnecting.png`; it is a small floating neutral
pill rather than a full-width colored bar. Related page-crash, private-window,
whole-window unload, runtime persistence and routing journeys still pass. No real
profile, credential store, bundle or external service was used.

## Phase 1 interrupted-browsing integration — 2026-09-19

Offline navigation now explains the interruption and offers the existing retry/back
controls. DNS and certificate errors have specific guidance; timeout guidance is
implemented but not separately qualified. Certificate errors still have no bypass.
The native error remains visible for diagnosis.

Verified the integrated offline-to-online journey with Chromium per-tab network
emulation: the actual failed navigation reports ERR_INTERNET_DISCONNECTED, tab IDs
remain stable, an independent live draft survives switching tabs, and Try again
loads the destination into the same selected tab after network restoration. A real
failed lookup then reports ERR_NAME_NOT_RESOLVED, and a local self-signed HTTPS
fixture reports ERR_CERT_AUTHORITY_INVALID without loading the document. The
initial Electron session-emulation attempt did not block fixture traffic; it was
replaced with CDP network emulation, not counted as passing evidence. All traffic
uses a synthetic hostname mapped to a local fixture in an isolated profile.
Inspected `release/test-artifacts/aux-offline.png` at 1260×900 logical size; neutral
recovery surface and original sidebar remain coherent. Desktop build, renderer
TypeScript and the existing crash/page-recovery journey passed. This is work within
Phase 1, not a phase exit.

## Phase 1 local-document browsing integration — 2026-09-19

Corrected Open File so native paths containing `#`, `?`, spaces, percent signs or
Unicode become one exact file URL instead of being split into URL query/fragment
syntax. The menu shortcut and command palette now share the same conversion. This
preserves the current tab when one is selected and opens a new tab from the empty
home state.

An isolated native journey verifies that canceling the file picker changes nothing,
a synthetic special-character HTML filename replaces the selected tab and renders,
and the same local-document tab identity and URL restore after a clean restart.
Unsaved form contents are intentionally not claimed as restart-persistent. The
desktop build, renderer TypeScript check and focused path-conversion checks pass.
Inspected `release/test-artifacts/aux-open-file.png`; the shell shows the local
document selected within the original sidebar. Electron shell-only screenshots do
not contain native WebContentsView pixels, so document rendering was separately
asserted in its actual native page. No personal file was selected or read.

This closes part of Phase 1's local-file journey. File-type breadth, OS default-
browser registration and deep links remain separate acceptance items; no bundle was
created and the delivery phase remains active.

## Phase 1 external-link continuity — 2026-09-19

Aux now queues web URLs received during startup until both the shell and runtime are
ready, rather than dropping them. A later invocation hands its HTTP(S) URL to the
existing Aux process, focuses that window and opens a selected tab. The macOS
`open-url` event follows the same route. Page-originated new-tab requests also use
this bounded queue, removing an earlier startup race. Non-web external schemes are
rejected instead of being passed to a local OS handler.

The native journey launches Aux with a local URL, then starts a real second Electron
process against the same isolated profile and verifies that it exits after handing
off another URL. A simulated macOS application event verifies the platform callback.
All three links become separate selected Aux tabs and an unsaved draft in the first
tab remains intact. A `file:` open-URL request creates no tab. This is source-level
deep-link handling; Aux has not been registered as the system default browser and
that OS integration remains unqualified until app-bundle work is authorized.

## Phase 1 daily-reading integration — 2026-09-19

Delivered Reader View in the existing shell while the CEF test-bundle question is
pending. View → Reader View / Command-Option-R opens a clean article surface;
Back to page returns to the original live document. Added Mozilla Readability 0.6.0
for article extraction from a clone in an isolated world. The bridge returns an
allowlisted inert tree, never website HTML, scripts, event handlers, styles or form
controls. HTTP(S) links open through the existing new-tab flow. Article text is
transient; only reading font size persists in shell localStorage. No model request
or agent observation is generated. This first reading experience displays formatted
text and links, not embedded images or media.

Native validation confirms extraction, removal of navigation clutter/unsafe links,
retained original draft and scroll, useful error on non-article pages, text-size
retention and links opening into actual tabs. Desktop build and renderer TypeScript
check passed. Inspected `release/test-artifacts/aux-reader.png` at a 1260×900 logical
window: neutral surface, readable column, aligned compact controls, no extra colored
wash. Original sidebar geometry and state remain intact.

Authoritative review-process check: exec session 59313 returned terminal exit 0 and
no process was listening on dev port 5197. No assumption of liveness and no automatic
restart were made. Therefore renderer changes did not hot-reload that earlier user
review session. Launch the updated source app with `AUX_LOAD_DOTENV=0 pnpm dev` when
ready. No app bundle was created. Phase 1 and the full goal remain incomplete.

## Phase 1 browser-layer source candidate — 2026-09-19

Moved from isolated Electron fixes to the browser-layer dependency shared by the
remaining compatibility requirements. Current CEF explicitly permits a Chrome-style
Views window to contain one Chrome BrowserView plus Alloy views for trusted UI.
Prepared `experiments/cef-shell/layout-probe.cc` for that arrangement; compiled it
successfully against checksum-verified CEF 152.0.7 ARM64 SDK headers. The README pins
the SDK and lists the actual runtime/design acceptance gate. Only headers were
extracted; no .app, installation, signing, user-profile migration or release occurred.

This is source/API evidence only. It does not qualify a runtime replacement, Chrome
tab control, real extensions or the design. The single-Chrome-view limitation still
needs running evidence; do not repeat the earlier rejection of parent-view/Alloy
embedding as if it also rejected this supported mixed-Views arrangement.

A pending async question asks whether the user's earlier bundle deferral can permit
an isolated development-test .app. That approval is needed to run this macOS candidate,
not to publish or sign anything. Continue from the prepared source and pinned headers
if approved; keep the working Electron first-review path intact. Do not claim global
blockage: the overall goal remains active and no phase is complete.

## Phase 1 independent-window command integration — 2026-09-19

Implemented a focused user-facing correction while tracing reusable window ownership:
independent sign-in windows now own Close, Reload/hard reload, Back/Forward, zoom,
and Print commands. Menu dispatch previously always targeted the main shell. Native
popup keyboard dispatch and menu dispatch now share `popup-commands.ts`; Close Window
uses the focused window. Main-window tab behavior remains on the existing renderer
route. No additional settings or alternate shell UI were introduced.

Native integrated evidence: a synthetic popup reload leaves opener state unchanged;
Back/Forward traverse the popup history; zoom/reset target its contents; a native
Command-W input with Stay preserves a dirty popup and its opener; Close Window with
Leave destroys only the popup. Existing cookie/opener/POST/nested/fast-close sign-in
journeys pass, as does whole-main-window cancellation/approval. Desktop build passes.
Playwright page-level Meta-bracket input did not reliably exercise the native menu;
Back/Forward were verified through actual Electron menu dispatch and Close through
`webContents.sendInputEvent`, rather than claiming the former proved OS accelerators.

This does not implement arbitrary additional Aux shell windows or private browsing.
Those still require window/process ownership work and privacy isolation described in
the compatibility record. Unsupported popup-focused shell commands (for example the
main-shell Find overlay) remain a gap; do not claim full popup command parity. The
running founder process was not restarted and needs a later launch to use this fix.

## Phase 1 private-window dependency qualification — 2026-09-19

Traced current window ownership and persistence before implementing private browsing.
The main process has one shell/window and global stage/selection; runtime PageService
always writes page metadata and recovery, and observations are persisted separately.
An isolated native probe confirms an in-memory session separates synthetic cookies
but its page remains exposed by the shared CDP `/json/list` endpoint.

Evidence: `private-boundary-desktop.mjs` passes; generated
`aux-private-boundary.json` records version, cookie separation and debugging exposure.
The hidden synthetic candidate window was destroyed and its temporary profile removed.
No regular user window or credential store was touched. No private browsing feature
has been shipped or claimed; this prevents an inadequate cookie-only implementation.

The compatibility record specified a separate, non-agent debugging process for
private windows and coordinated cross-process exit. The later Phase 1 implementation
now satisfies that boundary with the actual Aux shell and a coordinated Quit protocol.
General multiple-regular-window delivery and final browser-layer selection remain open.

## Phase 1 screen-sharing compatibility evidence — 2026-09-19

Returned to the broader browser gaps after exit protection. Actual native requests
showed that Electron 43.6.0 exposes identical `media` / empty `mediaTypes` permission
metadata for modern screen sharing and legacy desktop capture. Version-pinned native
source confirms the legacy path does not use the display-source chooser. Enabling
empty media types would therefore undermine mandatory source selection. No such
change was made; the production denial now includes a maintenance comment explaining
this constraint. The actual macOS chooser has not been enabled or qualified.

Permanent isolated qualification: `screen-sharing-boundary-desktop.mjs` and generated
`aux-screen-sharing-boundary.json`. Both requests are denied; the fixture never grants
capture, enumerates screens, changes OS settings or reads clipboard/credentials.
This test proves the permission API limitation, not successful screen sharing.
The temporary investigation script was removed. Browser compatibility documentation
now includes this additional requirement for the final native/browser-layer choice.

Next: move to the remaining coherent private/multiple-window browser experience or
the browser-layer candidate investigation; avoid re-probing this known limitation
without a new runtime/version or changed native API. Existing review app untouched.

## Phase 1 exit protection follow-through — 2026-09-19

Revalidated the native exit adapter and completed two remaining checks that matter
to real document editing. A cross-origin iframe editor now has native qualification:
Stay retains its text and all peer tabs, and unanimous Leave exits. A real navigation
of a clean peer tab during a dirty-page approval invalidates the exit agreement and
keeps the other documents alive. The implementation now checks invalidation before
starting each native traversal as well as before committing exit.

Bounded isolated-world injection and cleanup to 15 seconds so a stalled renderer
cannot leave the exit coordinator permanently busy. An isolated test deliberately
holds that acknowledgement, waits past the timeout, then releases it. Exit remains
canceled, the document survives, and a later ordinary exit attempt still works.
This is deterministic stalled-acknowledgement coverage, not proof of every crashed
or hung renderer state. No user window was reloaded or closed.

Evidence: desktop source build; native `window-unsaved-work-desktop.mjs --frame
--quit --timeout` and `window-unsaved-work-desktop.mjs --navigate` pass. The earlier
ordinary tab and recovery checks remain applicable; they were not repeated without
a related failure. No renderer UI or appearance changes were made.

Next Phase 1 work should return to the larger remaining daily-browser gaps (screen
sharing/media, private and multiple windows, and browser-platform compatibility),
not promote additional unload controls to milestones. Real account/password-manager
and signed-provider acceptance remain unqualified, with no app bundle authorized.

## Phase 1 coordinated exit protection — 2026-09-19

Implemented native whole-window/quit preflight in `main/window-unload.ts` and the
main lifecycle. Chromium executes real beforeunload handlers; a harmless temporary
listener in an isolated world ensures clean documents traverse the same path.
Electron's internal `-before-unload-fired` event is vetoed after each decision so
no document is destroyed until every tab approves. Cancel retains earlier approved
and clean documents. New/removed tabs or navigation invalidate the exit agreement.
Recovery freezes only after acceptance, before native window teardown.

**Version dependency:** this relies on the inspected Electron 43.6.0 implementation,
not a public dry-run API. The exact-version guard refuses unqualified exit traversal
on upgrades. Requalify or replace the adapter before changing Electron; never remove
the guard merely to make Quit work. A timed-out traversal retains its one-shot veto
so a late native acknowledgement cannot unexpectedly destroy the document.

Desktop source build passed. Isolated native window-close and Quit journeys passed:
Stay preserves unsaved text, all tabs and selection; approving the first dirty page
and canceling the second preserves both documents and intervening clean tabs;
unanimous Leave exits. Individual tab-close/link/reload protection and full restart
recovery of IDs, spaces, folders, order and selection also passed. The clean-page
fixture includes a page without any website beforeunload handler. These establish
the ordinary native-tab path. The later follow-through entry adds cross-origin
frames and navigation invalidation; other hung/crashed-renderer states and
engine-backed tabs remain unqualified.

The user's running review process was not restarted and therefore does not acquire
this main-process fix until the next launch. No app bundle or external release was
created. Phase 1 remains active; compatibility/media, broader window behavior and
live founder review remain open. The previous failure record below is historical.

## Phase 1 whole-window data-loss qualification — 2026-09-19

The prior reply clarified existing compatibility priorities but made no implementation
progress. This cycle established new native evidence for the next session-safety fix.

`tests/smoke/window-unsaved-work-desktop.mjs` exercises a real dirty textarea with
sticky user activation and a second clean tab. It uses an isolated HOME/profile,
mock Keychain, no dotenv, and synthetic Stay responses. Both the default window-close
run and `--quit` run **fail**: the Electron application exits instead of preserving
the document. This is now a reproduced defect, not merely missing qualification.
The running founder review application was not operated on or restarted.

Keep this failing qualification gate. The production BaseWindow close hook currently
only notifies `app.closing`; it does not obtain child-page unload decisions. A fix
must preserve every live document, tab order and selection when any page cancels,
and freeze the recovery snapshot only after exit is accepted. Closing child tabs
sequentially is not sufficient: a later veto must not leave earlier tabs destroyed.
Do not replace the real native unload behavior with an unqualified synthetic event
and claim equivalent coverage. Whole-window close and app Quit must both pass before
this gap is closed. Individual-tab unload verification remains separate and passing.

The first-review guide now explicitly warns that both window close and Quit bypass
unsaved-work protection. No product fix has been claimed or made in this cycle.

## Current state

2026-09-19: The user provisionally accepted the corrected design (“for now it's fine”)
and asked to continue the wider goal. Use `pnpm dev`; packaging remains deferred.
The original sidebar organization, full collapse, neutral native vibrancy, supplied
Aux artwork, browser recovery, saved tasks and evidence/review workflows are verified
in isolated development-app checks. Full M0–M11 founder acceptance is not complete.

**Active delivery phase: Phase 1 — A browser the founder can use every day.**
No complete delivery phase has been qualified or accepted. Stop promoting individual
controls or fixes to milestones; older entries below are a historical work log.

Recent verified components include original sidebar organization and full collapse,
neutral native vibrancy, saved tasks/conversations/evidence, selected browser recovery,
bookmarks, find/PDF, download destination/retry, and tab audio controls. Local project
fixtures also cover isolated worktrees, commands/services, previews, file creation/
editing/recovery, untracked review and restart continuity. These are reusable inputs
for later phases, not evidence that an entire browser or agent workflow is complete.

Phase 1 remaining work is an integrated daily-browsing qualification and closure of
its essential gaps: coherent navigation/window/session behavior; complete file/site/
privacy interactions; keyboard/focus/accessibility; account/password-manager/
extension/media compatibility and the resulting shell decision; failure/recovery
and actual founder review. Establish current support from code and real journeys;
keep missing and unqualified behavior visible. Keyboard traversal and focus recovery are implemented for the principal tab/space
flows; full accessibility qualification remains a work item within this phase.

No live model/provider or real external-agent session has been qualified. Phase 2's
live gate needs a user-configured connection; independent Phase 1 work remains
available. No credential-store discovery, app bundle or external release is authorized.

The working tree initially contained three user-owned untracked historical
roadmap/screenshot entries; leave those untouched.

Inspected foundations: Electron/Chromium browser, Rust specialized engine,
TypeScript runtime, SQLite, program/run/operation contracts, per-page takeover,
MCP/CLI, local packager. These are not proof of the broader founder-build gates.

Pre-implementation focused baseline: 57 tests in verify-done, review-gates,
engine-routing, desktop-runtime-env, and prompt-injection passed during planning.

Phase 1 compatibility evidence now lives in `AUX-BROWSER-COMPATIBILITY.md`.
The isolated Electron 43.6.0 probe passes virtual WebAuthn registration/assertion,
cryptographic signature/challenge/origin/RP verification and wrong-RP rejection.
Synthetic extension inspection confirms a partial API surface; native-messaging
functions are exposed but no host was invoked. Native Touch ID is unconfigured and
requires a signing entitlement; this is not synced Apple passkey support. Real SSO,
1Password/Apple Passwords and full Chrome extensions remain open. Probe command:
`node tests/smoke/browser-compatibility-desktop.mjs` (clean exit, isolated temporary
profile, virtual authenticator only). No production configuration was changed.
Next architecture work is a maintained full-Chromium candidate qualification,
not an extension marketplace or password vault workaround. First review can proceed
with the documented limits; full Phase 1 acceptance still requires resolving them.

## Delivery phase state

Founder clarification: broad SSO/passkeys are core; no site allowlist is required.
Prioritize 1Password compatibility and investigate Apple Passwords. Prefer Chrome
extensions; an Aux marketplace is conditional, and an owned password vault remains
exploratory after first review. Current Electron extension support is partial, so
the browser-shell compatibility decision remains open rather than declared solved.

Integrated Phase 1 baseline: isolated native development-app journeys passed for
conversation/draft/side-panel continuity, tab/session restart recovery, page crash/
navigation recovery, permission reset persistence, bookmark import/export and PDF
output/cancellation. Evidence: `release/test-artifacts/aux-phase1-readiness.json`
and corresponding `phase1-*.log` files. This does not qualify real SSO, passkeys,
password managers, arbitrary extensions or the whole delivery phase. Next: resolve
the essential browsing/window and authentication integration gaps as a coordinated
Phase 1 batch, with the compatibility decision preceding ecosystem expansion.

| Phase | State | Phase-level exit still required |
|---|---|---|
| 1 — Daily browser | Active; verified components, incomplete integrated qualification | Dependable personal browsing build, early compatibility decision, saved-data/failure checks and first founder review |
| 2 — Trusted connected agent work | Partial foundations; not phase-qualified | Real connected tasks with continuity, authority, takeover, evidence, supported reports and prepared actions |
| 3 — Complete local development | Human and scoped-agent local change workflow works; not phase-qualified | Full issue/app/incident journeys, environment breadth, diagnosis and authorized connected delivery |
| 4 — Cloud continuity and ecosystem | Incomplete | Desktop-off execution, durable artifacts, reconnect/takeover/cleanup and qualified client/provider parity |

The authoritative scope, dependencies and exit gates are in `AUX-ROADMAP.md`.
Security, recovery, compatibility, performance and data-integrity checks required
for a safe usable build belong to Phases 1–4. A seven-day pilot, founder acceptance
campaign, feedback-driven polish and packaging are post-handoff work.

## Implementation findings to resolve

- Older roadmap/script comments contradict the newer Chromium-first architecture.
- Runtime grants classify browser operations; they are not complete task authority.
- Completion verification uses page-text matching; independent outcomes pending.
- Agent/set write intents now use the runtime SQLite journal, fail closed on
  corrupt legacy imports, and block uncertain effects across replans. Task-level
  identities, independent reconciliation/UI, and other dispatch routes remain open.
- MCP transport replay corrected in the first checkpoint; durable logical action
  reconciliation is still required across all execution routes.
- Gateway persistence now requires OS encryption and awaited native storage;
  synthetic tests pass. Live OS/bundle identity qualification and broader broker
  architecture remain pending; see AUX-CREDENTIALS.md.
- Tag-triggered release publishing removed. Manual workflow produces private CI
  artifacts with read-only repository permission; distribution remains gated.
- Packager dependency reference corrected to engine-client; first private macOS
  arm64 build passed. Packaged runtime smoke and full desktop acceptance are
  distinct gates; latest evidence appears below.
- Runtime data directory and Electron userData/profile location are independent;
  renaming app/package before pinning profile identity risks losing visible logins.

## Verification policy

Record commands, outcomes, scope, and failures for each patch below. Implemented
and verified are separate. Missing credentials, provider capability evidence,
founder visual review, and live workflow evaluations remain explicit open work.

## Change log

### Phase 1 running review handoff — 2026-09-19

- Fixed development startup to regenerate desktop/preload/MCP JavaScript from
  source after the workspace compile. Incremental tsc and prior in-place bundled
  output can otherwise leave stale code or an unusable sandbox preload. This is
  source compilation, not creation of an application bundle.
- `tests/smoke/dev-launcher.mjs` now starts with a deliberately stale compiled
  preload. The real `pnpm dev` path replaces it, loads the Aux artwork and shell,
  browses a synthetic site, stops its child processes, and rejects an occupied
  renderer port without launching against another server. The journey passed.
- Launched `AUX_LOAD_DOTENV=0 pnpm dev` for the founder and left it running.
  Exec session at handoff: `59313`; renderer localhost:5197. Verify this live handle
  before polling/restarting; its existence in this document is not liveness proof.
  Avoid hot-reloading product changes during the founder's review without notice.
- Inspected the actual Aux window through native accessibility and a screenshot.
  Existing sidebar organization and a signed-in GitHub page restored. This proves
  that existing session rendering works here; it is not a new SSO/passkey test or
  organization SSO approval. No credential-store search or account change occurred.
- Asked which model connection to use for the first live agent workflow, with
  credentials entered by the founder in Settings → Models, not in chat. A reply
  and a working configured connection remain required before that live gate.
  Continue independent Phase 1 work; do not mark any delivery phase complete.

### Phase 1 unsaved-document navigation integration — 2026-09-19

- Tab closing now waits for native WebContents destruction before removing its
  view/runtime identity. Staying returns `{ok:false}` and preserves the live page;
  cancellation no longer detaches the driver or changes the tab snapshot first.
  Already-destroyed native targets are handled without duplicate removal events.
- Native `will-prevent-unload` owns a Stay/Leave dialog, displaying the actual
  origin and defaulting to Stay. Missing/failed confirmation fails closed.
  The automation connection dismisses its own beforeunload dialog so the native
  decision remains authoritative; a preconfigured agent dialog accept cannot
  silently override the human's unsaved-work decision on an Aux tab.
- Native fixture verifies an actual dirty textarea and beforeunload listener:
  canceled tab close, link navigation and reload preserve text; Leave reloads or
  closes; a clean page closes without a prompt. Dialog answers are supplied by
  the test, while the document and browser lifecycle are real. Evidence:
  `tests/smoke/unsaved-work-desktop.mjs`.
- Workspace/desktop build, focused page/recovery checks, native login-window
  lifecycle and complete tab/session restart recovery passed. Original spaces,
  folders, IDs, ordering and selection remain intact. No app bundle was made.
- **Scope still open:** whole-window close/app quit is not covered by this gate.
  BaseWindow shutdown still freezes the session snapshot and has no coordinated
  all-document approval path. Do not claim unsaved form recovery across quit or
  crash; users must save before quitting. Multiwindow/private browsing and the
  broader Phase 1 gaps remain. Next work should address coordinated window/session
  exit rather than expanding this into more individual-control milestones.
- API evidence: Electron's `will-prevent-unload` event uses preventDefault to allow
  leaving, and `webContents.close({waitForBeforeUnload:true})` respects a veto:
  https://www.electronjs.org/docs/latest/api/web-contents#event-will-prevent-unload

### Phase 1 media/privacy integration — 2026-09-19

- Camera and microphone now have separate per-origin decisions in the actual
  permission request/check handlers and Settings. A camera grant cannot grant
  microphone capture, nor can a microphone grant grant camera capture. Combined
  requests respect either device's denial. Old combined media decisions require
  fresh approval and are removed when a new device decision is saved.
- Permission prompts identify the requested capability in human-readable language,
  default to denial, and abort on document navigation/destruction. A stale dialog
  cannot overwrite an intervening saved/reset decision; persistence failure denies
  access without corrupting previous decisions.
- `media-permissions-desktop.mjs` passed in the native app with fake devices:
  camera capture, microphone denial, combined-request denial, independent settings
  reset, origin isolation, navigation cancellation, failed atomic persistence and
  full restart. A local WebRTC loopback received decoded fake-camera frames,
  generated Web Audio packets and a data-channel message. Generated audio does
  **not** qualify microphone capture. No physical device or clipboard contents
  were accessed. Inspected `release/test-artifacts/aux-media-permissions.png`.
- Renderer typecheck/desktop build passed. Permission settings/reset persistence
  and file upload/site-data recovery journeys also passed after integration.
- **Unresolved qualification failure:** synthetic microphone `getUserMedia` hangs
  after approval on Electron 43.6.0 / Chromium 150.0.7871.250. Reproduced with the
  Aux policy replaced by unconditional approval in a disposable diagnostic,
  without changing production policy. Fake camera succeeds. Separate Chrome for
  Testing 153.0.8010.12 also times out with fake devices/fake UI and a temp profile.
  Fake audio WAV input and disabled audio processing did not resolve it. Do not
  infer an Aux-only regression, real-device failure, or working microphone from
  this evidence. No OS permission changes or real capture were attempted.
- `microphone-capture-desktop.mjs` deliberately remains a failing qualification
  gate until actual synthetic capture returns an audio track. Evidence:
  `aux-microphone-capture.json`, `aux-microphone-chromium-baseline.json` under
  `release/test-artifacts`. The latter reference used existing Playwright Chromium,
  `--use-fake-device-for-media-stream`, `--use-fake-ui-for-media-stream`, isolated
  HOME/profile, mock Keychain and a localhost fixture; it is not Aux qualification.
- Phase 1 remains active. Next: resolve microphone fixture/runtime qualification
  or explicitly qualify hardware during founder review; screen sharing, real
  conferencing, clipboard, private/multiple windows and broader daily-use gates
  remain open. Do not restart the permission investigation from scratch or claim
  the partial WebRTC loopback proves conferencing readiness.

### Phase 1 protected-site authentication integration — 2026-09-19

- Added trusted-shell HTTP authentication prompts with requesting origin, bounded
  realm text, rejected-credential retry and cancel. Credentials pass directly to
  Chromium and are not written to Aux settings, task history or runtime storage.
- Pending requests survive a shell reload; typed credentials do not. Navigation,
  page destruction, shutdown and a two-minute timeout end pending requests.
  IPC responses require the trusted main shell and a live request ID.
- Verified the real development app against a synthetic Basic-auth local server:
  successful sign-in, wrong-password retry, reload recovery, cancel, rejection of
  late responses, and navigation cancellation. Scanned isolated runtime data for
  the synthetic password and Authorization value; neither was present. This is
  not a claim about Chromium's in-memory authentication cache.
- Renderer typecheck and desktop build passed. Re-ran native sign-in popup/tab
  continuity and page crash/navigation recovery successfully. Inspected the actual
  neutral prompt screenshot and tightened excessive field spacing.
- Evidence: `tests/smoke/http-auth-desktop.mjs`,
  `release/test-artifacts/aux-http-auth.png`. Digest, enterprise proxy/SSO,
  native passkeys and password managers remain unqualified. Phase 1 stays active;
  next integrated daily-use work is clipboard/media/privacy and window behavior,
  with real account compatibility and founder review still required.

### Phase 1 file/site recovery integration — 2026-09-19

- Settings → Site permissions now offers website-data clearing for open native
  HTTP(S) tabs. The trusted main process resolves the target from its registry,
  confirms the exact origin with Cancel as default, revalidates the origin after
  confirmation and clears the selected storage types. Related-subdomain cookie
  scope is explicitly disclosed. History/bookmarks/permission decisions and cached
  files remain; live pages may recreate data. This is not an all-data privacy wipe.
- Native integration verifies multiple file selection through the file-chooser
  event, exact multipart upload names/bytes at a local server and retry after a 503
  while preserving the selection. No upload product code change was needed.
- Data-recovery journey seeds synthetic cookies/localStorage/IndexedDB in localhost
  and a separate IP origin. Cancel preserves data, confirmed clearing removes the
  target data, unrelated-origin data remains, changed-origin confirmation rejects,
  and cleared/preserved state remains correct after full restart. Native confirmation
  is mocked in the fixture; no personal site data or credentials are involved.
- Workspace build, renderer typecheck and desktop build passed; the integrated
  files/site-data smoke and prior permissions smoke exit cleanly. Inspected actual
  settings capture `aux-site-data.png`. An initial test used an older bundle after
  typecheck caught a missing mock bridge member; fixed and reran successfully.
- Phase 1 remains active. Native file-picker cancellation, clipboard/media and
  broader site/auth compatibility still need qualification; private/multiwindow
  browsing and the shell migration gate remain open. Do not treat this batch as
  a separate delivery milestone or complete daily-browser readiness.

### Phase 1 keyboard browsing integration — 2026-09-19

- Both tab layouts now support manual arrow/Home/End focus traversal with wrap;
  activation remains Enter/Space. Vertical traversal excludes collapsed/inert
  folder content. Horizontal tabs expose a selected-tab keyboard entry point.
  Context/space menus share arrow/Home/End navigation without intercepting nested
  action buttons or modified shortcuts.
- Space editing traps Tab/Shift-Tab, dismisses with Escape from any control and
  restores shell focus. Its modal hides native page views and restores the existing
  overlay state on close. Sidebar collapse/reveal preserves a usable focus target.
- Render inspection exposed an old thick/double field focus ring; replaced the
  affected field styles with one fine neutral outline. Inspected actual horizontal
  shell and modal captures after correction (`aux-keyboard-horizontal.png` and
  `aux-keyboard-space-dialog.png`). Shell screenshots exclude native webpage pixels;
  the modal's native-view visibility is asserted independently.
- Renderer typecheck and desktop build passed. Native keyboard journey verifies
  manual tab activation, collapsed-folder exclusion, menu traversal, modal wrap/
  Escape, native-page hiding, collapse/reveal and horizontal tab stop. Saved-tab
  restart recovery and focused workspace/recovery checks passed. No bundle created.
- Phase 1 remains incomplete: these journeys do not qualify all dialogs, VoiceOver,
  every keyboard shortcut, private/multiwindow browsing or account compatibility.
  Next work remains essential file/site interactions and remaining daily-use gaps;
  retain the recorded browser-layer migration boundary.

### Phase 1 shell decision evidence — 2026-09-19

- Added and ran a disposable full-Chromium extension baseline. Actual tab lifecycle,
  local storage, script injection, cookie lifecycle and context-menu lifecycle pass
  in the existing Chrome for Testing 153.0.8010.12 binary. Broader browser/account
  compatibility is not inferred; this result is not Aux or CEF qualification.
- CEF source inspection rules out treating macOS parent-view embedding as a direct
  path to Chrome-style compatibility: that path forces Alloy. Chrome-style Views
  remain a native prototype candidate with a one-Chrome-view-per-window constraint.
- Recorded candidate comparison and execution decision in AUX-BROWSER-COMPATIBILITY:
  preserve first-review Electron, prefer a Chromium browser-layer shell for final
  compatibility, avoid a general extension shim/marketplace detour. Native prototype,
  signed identity and migration remain unqualified and subject to no-bundle scope.
- Next independent Phase 1 batch should address remaining daily-use gaps (file/site
  interactions and keyboard/window behavior), retaining this architecture boundary.
  No personal profile, native messaging host or credential store was accessed.


### Phase 1 authentication integration — tab/window continuity (2026-09-19)

- Featureless `window.open` and form-target pages now use Electron's native
  creation hook to become actual Aux WebContentsView tabs, retaining Chromium's
  opener relationship, blank-window navigation and submitted POST body. Explicit
  sized popups remain separate windows. Foreground adopted tabs activate after
  runtime attachment; background disposition is retained without autoactivation.
- Added a pending-attachment removal guard: closing during driver attachment
  disposes the attached driver instead of resurrecting a removed page. Initial
  runtime URL comes from the attached document, correcting navigation that finished
  before attachment. New page IDs use UUIDs to avoid collisions with restored IDs.
  Native removal of the active page selects a remaining recently active page.
- Final workspace/desktop builds passed. Sequential native login, tab-recovery
  and page-recovery checks exited successfully. Login fixture now verifies shared
  synthetic cookies, opener communication, preopened blank navigation, POST method
  and payload, explicit noopener isolation, nested popups, fast-close behavior,
  focus/close and main-window resize. A deterministic delayed-driver unit case
  verifies the close-during-attachment race; existing page-inspection checks pass.
- Verification first found a stale about:blank URL (fixed); a later fixture returned
  an unserializable WindowProxy to the test bridge (fixture corrected). Neither was
  accepted as a pass. Final checks use isolated mock-keychain profiles only.
- These close concrete authentication plumbing gaps, not the SSO/passkey gate.
  Next Phase 1 work: qualify browser identity/WebAuthn and extension feasibility,
  background-link/referrer behavior, cross-origin SSO policies, and remaining
  essential browser gaps. Native passkeys, 1Password/Apple Passwords, actual provider
  sign-in and full extension compatibility remain unqualified. No bundle required.

### Phase 1 integration — sign-in popup lifecycle (2026-09-19)

- Replaced global early popup adoption and fake tab-view casting with explicit
  `did-create-window` registration and a typed independent-window entry. Popups
  receive normal navigation/destruction events while retaining their own geometry;
  main-stage layout no longer hides or reparents them. Aux page activation focuses
  their window, and page close closes it. Runtime preserves the native-assigned ID.
- Destruction removes registry entries without reading disposed Electron objects.
  Initial verification exposed a shutdown hang from accessing a destroyed object's
  ID; fixed before final verification. Those initial runs were terminated and do
  not count as clean passes.
- Verified `pnpm build`, desktop build, and sequential clean-exit native journeys:
  `sign-in-popup-desktop.mjs`, `page-recovery-desktop.mjs`, and
  `tab-recovery-desktop.mjs`. The new isolated fixture checks shared synthetic
  session cookies, opener postMessage, window geometry across main-window resizing,
  Aux activation, script close, reopening and Aux page close. Existing crash,
  failed-navigation and saved organization/restart journeys remain working.
- Scope is explicit window-feature popups, not live identity-provider qualification.
  Featureless `window.open`, immediate-close/attach races, nested authentication,
  native passkeys, provider-specific SSO policies and password-manager integration
  still need qualification or implementation. Keep Phase 1 active; these are
  integration fixes within it, not a completed delivery phase. No app bundle,
  external publication, account access or credential-store lookup occurred.

- Added schema version 3: runtime workspaces/tasks, immutable revision snapshots,
  and indexed task/run linkage. Shared contracts require explicit criteria and
  unique resource/criterion IDs. Stale edits fail with revision conflicts.
- Added workspaces/tasks APIs and task-aware run starts using saved objective/
  criteria. Run metadata binds the task revision before execution; active runs
  block editing/competing task starts, and prior unresolved task effects block
  another attempt across revisions. Older run results retain provenance and are
  labeled as earlier-revision results. Successful runs do not verify tasks.
- Added a Tasks drawer with workspace/task creation, criteria, revision editing,
  current-tab run launch, history, archive/restore, and modal keyboard focus wrap.
  Existing tab spaces are not yet migrated into runtime workspaces.
- Added an actual Electron task-UI smoke with temporary profile/data, no inherited
  provider keys, dotenv disabled, and mock keychain. Initial assertion read the
  editor before asynchronous loading finished; corrected the smoke to wait for
  revision state. Create/edit/reopen/archive/restore then passed. Screenshot
  visually inspected at release/test-artifacts/tasks.png (synthetic data only).
- Added AUX_LOAD_DOTENV=0 for explicit isolated launches; existing default dotenv
  behavior remains. No personal profile or OS credential store was read.

- Added schema version 2 with transactional action intents, append-only transition
  history, and validated legacy-import records. Version 1 upgrades have a separate
  transition and retain a pre-upgrade snapshot. WAL now uses synchronous FULL.
- Agent/set execution uses the runtime SQLite journal. Pending/uncertain outcomes
  block additional writes on the run/page despite new refs/epochs/observations.
  Explicit logical action IDs survive page changes; planner task-level allocation
  is still required. Fingerprints include all parameters and avoid raw values.
- Fixed duplicate suppression being reported as successful execution. The
  coordinator persists unresolved intent IDs and refuses completed status while
  effects remain unresolved. Streaming retains actual dispatch results. A failed
  response does not authorize an automatic write retry.
- Added actual SIGKILL-after-POST regression (not a simulated object reopen),
  transaction rollback, two-connection persistence, legacy corruption/import,
  identity, reconciliation history, and completion-refusal tests. Corrected an
  older test title that overstated process-kill coverage.
- Full-suite failures exposed old expectations that screenshots/model completion
  could clear failed writes. Updated those to require uncertainty, retained read
  repair-escalation coverage, and added a one-dispatch write-repair regression.

- Replaced native plaintext fallback with versioned encrypted secret envelopes,
  private atomic file replacement, backend availability checks, and explicit
  errors. Linux basic_text is refused. Added name validation and secret removal.
- Settings now awaits/serializes credential saves, restores only from the native
  encrypted store or supplied environment, masks keys, and exposes source/errors.
  Legacy plaintext is not consumed automatically. Explicit successful replacement
  retires active legacy copies; historical snapshots are not silently modified.
  Standalone key saving fails instead of writing plaintext. Preference edits do
  not rewrite legacy JSON secrets. Secret handling tests never use OS stores.
- Updated Settings UI to retain entered keys on failed save, show storage/source
  information, and avoid reporting removal when it failed. Actual UI acceptance
  and OS decryption remain unverified.

- Pinned Electron userData/sessionData before readiness with explicit absolute
  AUX_PROFILE_DIR selection, preserved legacy profile discovery, separate fresh
  runtime/profile roots, and ambiguity rejection. Added desktop single-instance
  locking and focus on second launch. Three new synthetic profile tests pass;
  existing personal profiles were not opened, copied, or decrypted.
- Corrected initial profile-discovery assumption using the generated app.asar
  package manifest and Electron 43.6.0 initialization source: packaged Electron
  also uses @vector/desktop when productName is absent from package.json. A Vector
  directory holding only runtime files must not count as a Chromium profile.
  Source: https://raw.githubusercontent.com/electron/electron/v43.6.0/lib/browser/init.ts
- Private macOS arm64 package built with signing explicitly skipped. Bundle still
  uses Vector.app pending credential identity qualification; no release occurred.
- Isolated packaged smoke environment from inherited provider/config values and
  dotenv lookup; uses temporary HOME/data, synthetic auth, a fresh Playwright
  browser with its mock-keychain defaults, and waits for runtime shutdown before
  restart. Removed fixed-delay restart and added request timeouts/process cleanup.
- Packaged smoke exposed separate request host allowlist and missing live grants
  wiring. Added live capability checks for direct/session HTTP requests and wired
  saved browser operations to current settings grants; defaults are read-only.
  HTTP methods require read/write/destructive as appropriate plus scoped egress.
  Session use requires exact origin. An uncertain browser error no longer falls
  through to a second HTTP dispatch. Redirects fail closed until per-hop policy
  exists; this is an explicit compatibility limitation, not completed networking.
- Three request-authority regressions pass: grants/revocation prevent dispatch,
  lost browser response does not replay a mutation, and real HTTP redirects do
  not dispatch a second request. Full task-scoped grants, response reconciliation,
  and semantic authorization of the generated evaluate step remain open.

- Added runtime SQLite schema version 1, private pre-upgrade WAL-aware snapshots,
  transactional schema adoption, rollback on failure, and newer-schema refusal.
  Recovery guidance and limits are in AUX-DATA-MIGRATIONS.md. No real user database
  or credential store was opened by this work.
- Corrected private desktop staging to vendor engine-client, derive platform
  output paths, and fail if runtime dependency injection cannot run. Disabled
  signing-identity auto-discovery. Removed packaged smoke's false-success fallback
  when only a native engine binary exists. Package execution remains unverified.
- Migration regression tests initially exercised stale compiled runtime output
  and failed; rebuilt the workspace, then all 23 focused tests passed. Runtime
  tests resolve its compiled package, so build before testing runtime changes.
- Second checkpoint validation: `pnpm build`, `pnpm typecheck`, and all 416 unit
  tests across 56 files passed. Both changed packaging scripts passed Node syntax
  checks; `git diff --check` passed. These checks do not establish packaged app,
  actual browser-profile migration, cloud execution, or founder acceptance.

- Established the authoritative full-scope roadmap and this evidence ledger.
- Saved the original intent brief as historical planning input and redirected
  active roadmap links to AUX-ROADMAP.md.
- Added source-aware AUX_* configuration normalization with VECTOR_* compatibility.
  Process environment wins over dotenv regardless of spelling; nonempty canonical
  values win within a source. Desktop-owned IPC/CDP coordinates win over inherited
  values. Direct engine harness/Rust environment migration is still pending.
- Unified runtime/desktop/CLI/MCP data and descriptor discovery. New runtime
  installs use Aux Browser/aux-state.sqlite; existing legacy roots/databases remain
  in place. Ambiguous roots require AUX_DATA_DIR; ambiguous databases fail closed.
  No existing user profile, database, or credentials were moved.
- Added auxctl/aux-runtime/aux-mcp executable aliases; legacy aliases retained.
- Updated desktop window/menu/title, engine labels, connection errors, and relevant
  settings copy to Aux. Bundle, icon, package, protocol, fixture, and full UI rename
  remain open; see AUX-COMPATIBILITY.md.
- Removed implicit MCP replay after transport failure. A real HTTP fault test
  commits a mutation then drops its response, proves one dispatch, and verifies
  discovery of a restarted runtime on the next explicit call.
- Corrected stale test harnesses to supply explicit run/dialog grants. Added a
  negative test proving read-only clients cannot accept dialogs. Production
  authority defaults were not broadened.
- Removed a mock-model unit test's writes into committed live benchmark evidence.
  Restored the live evidence artifact changed by the initial full test run and
  verified it remains unchanged after the corrected full suite.

## Verification — first checkpoint

- `pnpm build`: pass.
- `pnpm typecheck`: pass after final source changes.
- `pnpm --filter @vector/desktop typecheck`: pass.
- `pnpm --filter @vector/desktop build`: pass (Electron bundles + Vite renderer).
- Focused configuration/MCP/recovery suite: 21 tests across 6 files pass, including
  standalone canonical-config restart and existing browser crash recovery.
- Full `pnpm test:unit`: 412 tests across 55 files pass. Initial run exposed five
  stale fixture failures; explicit grants and a denial regression resolved them.
- `node --check scripts/dev.mjs` and `git diff --check`: pass.
- No cloud providers, live paid model evaluations, full Rust suite, desktop GUI
  acceptance, packaged application, or actual user-data migration were qualified
  by this checkpoint. No external release or publish action occurred.

## Next delivery milestones

1. **First hands-on review:** use the rebuilt app via `pnpm preview`; browser and
   task receipt workflow validated in the actual package. Founder visual and
   interaction review pending. Bundle still Vector.app for identity continuity.
2. **Daily browser and agent setup:** prioritize navigation/tab ergonomics,
   discoverability, setup/error handling, and a qualified live task with an
   explicitly supplied connection. Do not search for credentials. Address real
   compatibility blockers in the highest-value browsing journeys.
3. **Complete local work:** useful developer/operator workflows and agent
   integrations, task/resource ergonomics, richer artifacts and recovery.
4. **Cloud and full founder acceptance:** complete the remaining roadmap in
   end-to-end workflow milestones. Preserve all original requirements and gates;
   the early review build is not full completion or permission to publish.

## Verification — third checkpoint

- `pnpm build`: pass; 29 focused profile/operation tests pass.
- `pnpm package:local`: pass, macOS arm64, signing explicitly skipped.
- `pnpm smoke:packaged`: pass against rebuilt packaged runtime. Verified API
  authentication, real fixture observation, persisted operation across restart,
  denial without egress grant, and direct request after scoped authorization.
  This does not exercise the packaged desktop shell or real signed-in sessions.
- `pnpm test:unit`: 422 tests across 57 files pass.
- `pnpm --filter @vector/desktop typecheck`: pass.
- Initial smoke failures exposed absent host allowlist configuration and missing
  live capability wiring. Fixed the wiring, kept explicit host restrictions, and
  added negative regression evidence rather than weakening default authority.
- Credentials remain synthetic for tests; no Keychain search, personal-profile
  launch, signing, package publishing, or external release occurred.

## Verification — fourth checkpoint

- `pnpm build`: pass.
- `pnpm test:unit`: 428 tests across 58 files pass, including six synthetic
  credential-storage regressions and async settings-handler coverage.
- `pnpm --filter @vector/desktop typecheck` and desktop `build`: pass.
- `git diff --check`: pass; committed live-model evidence unchanged.
- No actual OS credential provider or personal profile was accessed. The private
  packaged artifact from checkpoint three predates these credential changes;
  rebuild and requalify it before founder testing. Full goal remains active.

## Verification — fifth checkpoint

- `pnpm build`: pass; desktop typecheck passes.
- Journal/migration/review focused suite: 32 tests pass; coordinator/streaming/
  verification focused suite: 39 pass after completion guard integration.
- Initial full suite had four failures from prior unsafe retry/completion
  expectations. Revised those assertions, kept read-repair coverage, and added
  a single-dispatch uncertain-write test. Focused vision/repair suite: 12 pass.
- Final `pnpm test:unit`: 436 tests across 59 files pass. The final strengthened
  repair test additionally passes on its own. `git diff --check` passes.
- Actual synthetic process SIGKILL after one fixture POST leaves a durable
  pending intent and prevents a second dispatch after changed epoch/revision.
- See AUX-ACTION-JOURNAL.md for scope: no claim of universal exactly-once,
  independently verified business success, complete task recovery, or all-route
  enforcement. Packaged artifact still needs a rebuild before founder testing.

## Verification — sixth checkpoint

- `pnpm build`: pass. Focused task/API/migration suite: 18 tests pass.
- `pnpm test:unit`: 443 tests across 60 files pass, including the added version
  2→3 migration preserving uncertain action intents.
- Desktop typecheck and renderer/main/preload build: pass.
- Real Electron task drawer smoke: create workspace/task, edit, reopen, archive,
  restore pass using synthetic data; screenshot visually inspected. Test launch
  explicitly disables dotenv and uses a mock keychain. No model calls occur.
- `git diff --check`: pass; live-model benchmark evidence remains unchanged.
- No founder acceptance, complete browser compatibility, model-backed task UI
  execution, task verification/receipts, or cloud continuation is implied.

## Private desktop review milestone — browsing, tasks, evidence and receipts

Working user experience:
- Browse a real Chromium page, bookmark it, create a workspace/task, revise its
  objective and criteria, attach the current tab, and capture page evidence.
- Record notes with their source, select evidence, accept/reject criteria with a
  reason, reopen a saved receipt, and archive/restore the task.
- Inspect uncertain actions and record a human reconciliation using current task
  evidence. This makes no new external dispatch. Active task runs block decisions.
- Use `pnpm preview` for separate persistent profile/data directories, no inherited
  provider secrets or dotenv, and the Chromium-only review configuration.

Runtime and trust integration:
- Schema v4 adds append-only evidence/review records. Migration preserves saved
  tasks/revisions and action journal. Task/run/page changes invalidate applicable
  evidence, and later evidence requires a new review. Browser captures are dated
  text snapshots, not continuous monitoring or independent outcome verification.
- HTTP/WS callers cannot label themselves as the human reviewer. Shell-only IPC
  context is assigned after main-frame/document/sender checks. Human acceptance
  and external claims are distinct. Model cost remains explicit when incomplete.
- Tasks drawer now supports explicit current-tab attachment and evidence capture,
  selected-evidence review, receipt state, known model cost, and reconciliation.

Validation:
- Workspace build, desktop typecheck, relevant runtime/authority/migration checks,
  and full existing unit regression suite pass.
- Private macOS arm64 package rebuilt with all changes in this milestone. Packaged
  runtime authentication, fixture observation, persistence across restart, and
  scoped-operation authorization smoke passes.
- Actual packaged Electron journey passes: local fixture navigation/bookmark,
  task create/revise, attach/capture, both criterion reviews, saved receipt reopen,
  archive/restore and keyboard focus wrap. Native fixture and task screenshots
  saved in release/test-artifacts. A smoke locator initially assumed the hidden
  toolbar bookmark button; corrected to the real sidebar layout's Cmd+D action.
- No model calls, personal profile access, real OS vault test, credentials search,
  signing, publishing, release, or full compatibility claim. The preview launcher
  was syntax checked; packaged UI qualification uses temporary data/mock keychain.

Material gaps: live model-backed task qualification and agent setup; full browser
compatibility; unified tab/task workspaces; task drafts/search and richer editing;
independent outcome verification; all-route action identity; local/cloud developer
workflows; complete Aux rename. These remain explicit roadmap work rather than
being treated as blockers to the first visual/interaction review.

## Agent setup and recovery experience — implementation

- Agent and task entry points explain missing setup. Sending a prompt without a
  configured model opens Settings and preserves the draft in the agent composer,
  without creating an empty tab or failed run. Runtime-start errors retain the
  draft too, including prompts entered through the address bar.
- Settings puts Agent connection first, requires explicit Save key, permits exact
  custom Gateway model IDs, and distinguishes configured credentials from tested
  connectivity. Draft edits invalidate displayed probe success; test controls
  require saved values and disclose synthetic provider requests/possible charges.
- Settings now reports the effective run permissions. Previously it displayed
  default Read alone while user-started runs actually received Read + Write.
  Defaults are unchanged; the UI accurately displays them and permits read-only
  selection. A modelConfigured flag reports availability without accessing a
  credential store or triggering a model request.
- Credential-free packaged smoke extended through missing-setup recovery,
  preservation of a typed prompt, custom model save, no blur-triggered key save,
  and changing the actual effective run permissions. It does not qualify live
  provider authentication, key storage in the real OS vault, or model execution.
- Targeted runtime/settings/credential regressions and desktop typecheck pass.
  Regression checking caught readiness mistakenly throwing on unavailable/legacy
  credentials; readiness now uses already-loaded metadata and Settings remains
  usable for recovery. Final packaged workflow validation recorded below.
- Final private application rebuilt from the corrected sources. Packaged desktop
  smoke passes the complete browsing/task-review/setup flow, including no extra
  runs or pages on missing setup. Actual provider requests were not made. The
  optional agent-setup screenshot capture was added to the smoke afterward; no
  current screenshot is claimed for that screen. `pnpm preview` opens this build.

## Daily browsing milestone — saved pages and return navigation

- Replaced the history-only overlay with a searchable Library containing Bookmarks
  and History. Save the current page, rename bookmarks, remove with undo, save a
  recent visit, and reopen a saved page. Existing live human tabs are reused,
  including switching to the tab's space; crashed/detached/agent-owned pages are
  not reused. History queries cover up to 500 latest matching visits and show
  that limit explicitly. Loading failures stay visible instead of appearing empty.
- Added Library and Settings entry points to expanded/collapsed sidebar and the
  hidden-sidebar toolbar. The command palette includes Library; Cmd+Y opens its
  History view. Existing bookmarks, history, and events remain authoritative;
  no schema or credential changes were needed.
- Library uses a keyboard-trapped dialog, native action buttons, searchable
  results, arrow navigation between tabs, and keyboard entry into search results.
  It ignores stale asynchronous search responses. Full VoiceOver and large-library
  performance qualification remain open.
- Extended the real packaged journey to rename/search/remove/undo a bookmark,
  search history, reuse an existing tab, then close and reopen it from Library
  before continuing task capture/review and agent setup. Validation outcome below.
- Desktop typecheck and private package build pass. Actual packaged library,
  browsing, task review and agent setup journey passes. Library and setup renders
  visually inspected from synthetic-profile screenshots; controls fit the tested
  desktop layout. `git diff --check` passes. The runtime was unchanged, so the
  already-passing broad runtime suite was not repeated for this UI milestone.
- The private preview now includes this Library experience. Credentials, real
  browsing profiles, signing and publishing remain untouched. The full roadmap,
  live provider qualification and broader browser compatibility remain open.

## Developer collaboration milestone — external agent → task → human review

- Packaged the MCP bridge with the desktop application, using the application's
  own executable in Node mode. Settings now generates Codex TOML and Claude Code
  JSON entries for this installation/profile. No client configuration is written,
  no credentials are embedded, and no client authentication is read or imported.
- Added shared-contract MCP tools for workspace/task create/list/get/update/archive,
  built-in task start, external evidence notes, browser evidence captures, receipts.
  Human acceptance/reconciliation are not exported as MCP tools and remain gated
  in runtime handlers. External notes carry external_client provenance.
- Generated configuration selects canonical aux_* browser tool names. Legacy
  clients keep vector_* browser tools by default; task tools use aux_* and the
  server identifies as Aux. Legacy resource URIs remain registered.
- Documented the actual authority boundary: this is trusted local browser access,
  not task-isolated execution; external model/cost/auth/session controls remain
  with the client. The setup UI makes no live connection or health claim.
- Workspace build, desktop typecheck, focused MCP transport/stdio/evidence checks,
  and the private package build pass. The actual packaged UI-generated command
  connects with the MCP SDK, lists canonical tools, creates a task, records an
  external claim, captures a real fixture observation, reads the receipt, and
  shows that task's provenance/Needs review state in the desktop. Prior browsing,
  Library, setup and human task-review flows pass in the same smoke session.
- External-agent setup screenshot visually inspected; git diff --check passes.
  Official Codex/Claude configuration formats checked; sources and walkthrough
  are in AUX-EXTERNAL-AGENTS.md. Actual authenticated Codex/Claude sessions, managed
  agent lifecycle, task-scoped external authority, full rename, direct providers,
  local development environments and cloud execution remain open roadmap work.
- No personal credentials or client config accessed, no provider calls made, and
  no signing/publishing/release. `pnpm preview` now includes this collaboration flow.

## 2026-09-19 — Aside-led private build redesign

- Delivered the three connected review experiences: charcoal shell and Search/Ask
  home, persistent full-page conversations with captured images and reply
  continuity, and dedicated searchable Settings with appearance/tab layout options.
- Kept existing tabs, folders, spaces, Library, task review and the webpage agent
  panel. Sidebar transitions update native browser bounds; saved tabs and selection
  survive layout changes. Unresolved actions and task ownership still gate replies.
- Polished Lucide icon sizing, favicon bounds, system typography, secondary text,
  rounded focus rings, keyboard resizing and reduced-motion handling. macOS sidebar
  vibrancy provides the native frosted material; this is not AppKit Liquid Glass.
- Direct OpenAI, Anthropic and Google provider adapters now accompany Gateway.
  Keys and model choices are separate by provider; official endpoints and explicit
  selection avoid implicit fallback. Synthetic SDK requests and credential storage
  checks pass. Live provider execution still needs user-supplied credentials.
- Actual packaged-app checks exercised browsing, bookmark rename/remove/undo,
  sidebar collapse/expand/native bounds, saved task review, provider setup,
  horizontal/vertical layout, theme choices and the UI-generated MCP connection.
  A prior intermittent Library check failed; rerun with an explicit post-transition
  runtime bookmark assertion passed. Do not treat that single rerun as proof of a
  diagnosed root cause; retain the assertion for follow-up.
- Seeded temporary-profile visual checks exercise two persisted conversation turns,
  captured image rendering, setup/draft recovery, and reduced transparency. No
  real credentials, personal profile, provider calls, publishing or signing used.
- See design-qa.md and AUX-DESIGN-DIRECTION.md for evidence and remaining limits.
  Full identity migration, authenticated model/client qualification, richer history,
  routines, global popup and the wider roadmap remain open after first review.
- Final rebuilt package passed both desktop journeys again, including bookmark
  persistence after transitions. Final rounded-focus home and light-layout
  screenshots were inspected. The earlier intermittent failure did not recur.

## 2026-09-19 — Readable, actionable conversation answers

- Agent answers now render headings, emphasis, lists, tables, quotes and fenced
  code in both conversation and side-panel views. Code has a copy control; explicit
  web links open actual Aux browser tabs. Home cards summarize formatted content.
- No raw HTML is executed, non-web destinations are inert, and model-authored
  images cannot make remote tracking requests from the trusted shell. Existing
  captured screenshot artifacts remain visible through their established path.
- Desktop typecheck and focused rendering/security checks pass. Packaged-app
  verification confirms exact code copying and navigation to a real local fixture
  tab, then returns to persisted conversation history and draft-recovery checks.
- Actual rendered answer/home captures inspected at reference size. Fixed reset
  styles hiding list markers, link contrast, and excessive home excerpt height.
  Evidence: release/test-artifacts/aux-formatted-answer.png.
- Live model qualification, identity migration and the broader roadmap remain
  active. No personal credentials inspected or external publication performed.

## 2026-09-19 — Corrected visual direction, original sidebar restored

- User correction supersedes prior sidebar reorganization and tint direction.
  Restored the original navigation/address → pins → space → folders/tabs structure
  from Git history while retaining new conversations, tasks, Library and settings.
- Removed tint from settings/API/runtime snapshots and rendering. Existing stored
  tint values have no effect. Neutral frosted material and solid mode remain.
- One continuous rounded content outline replaces the doubled sidebar seam;
  neutral fine focus indicators replace blue rings. Search/Ask, pin/address
  shadows, footer alignment, empty state and home composition are refined.
- Captured and visually compared the actual native app against the Aside reference
  at matching logical size, with populated sidebar and real grayscale backdrop.
  Frosted/solid captures prove visible blur versus opaque fallback. See design-qa.md.
- Packaged browser, saved data, Library, task, provider setup, MCP collaboration,
  formatted conversations and appearance flows pass. Context recovery also passes:
  a saved observed URL reuses an existing human tab or opens a new one, retaining
  conversation context and linking the preview to the actual tab.
- Full roadmap remains active. This completes the focused visual correction for
  private review, not native AppKit Liquid Glass, full identity migration, or
  live-model/browser compatibility qualification.

## 2026-09-19 — Conversation draft continuity

- Replaced the shared draft field for existing chats with drafts keyed by durable
  conversation ID. Full-page and side-panel composers share the same chat draft;
  unrelated conversations and the generic new-chat prompt remain separate.
- Saved-chat drafts persist in the local browser profile through renderer reloads.
  Successful replies clear their own draft only; setup/runtime errors retain it.
  Storage failures keep the in-memory text and show a one-time warning rather
  than claiming it was saved. Submission disables editing until it resolves.
- Focused checks cover malformed storage, exact Unicode/text restoration, setup
  interruption, and unrelated draft preservation. The actual packaged journey
  writes distinct replies, switches chats, reloads, verifies both replies, and
  moves between a full conversation and its side panel.
- Shell organization and neutral material remain unchanged. New-chat drafts are
  still session-only; no new claim of whole-profile/crash recovery is made.
- Screenshot review caught the rounded main surface retaining a hidden horizontal
  scroll offset after focus moved through the agent rail. The shell now clips
  paint without becoming a scroll container; the regression journey explicitly
  requires zero horizontal offset after switching composers.


## 2026-09-19 — Visible identity preparation; packaging deferred

- Changed optional packaging configuration to Aux Browser.app and Aux display
  name. Aux alone is a reserved filesystem name in the cross-platform packager.
  The CFBundleName must still match Aux Browser for native helper discovery.
- Kept dev.vector.browser and @vector/desktop stable. A synthetic launch of the
  previous bundle confirmed app.getName() is @vector/desktop. Electron 43.6.0
  derives macOS storage service/account names from that internal name:
  https://github.com/electron/electron/blob/v43.6.0/shell/browser/electron_browser_main_parts.cc
- About, Hide and Quit menu labels now explicitly use Aux; About panel displays
  Aux without mutating app.name. Local packaging completed after correcting helper
  naming, but real OS credential continuity remains unqualified.
- User clarified that an app bundle is not needed yet. Further packaging work is
  deferred; the running development app and visible product experiences take
  priority. No signing or publishing occurred. The optional identity smoke is
  retained for later bundle qualification, not recorded as passed.


## 2026-09-19 — Find and continue older conversations

- Replaced the 500-turn history ceiling with runtime-backed search across saved
  prompts and response text. Matching an earlier turn returns the latest turn of
  its conversation. Chat rows page on demand with a timestamp/run-ID cursor.
- Opening a saved chat fetches its latest turns; earlier messages load in batches.
  Reply is held while history is loading or has an unresolved load error. Empty,
  loading, retry and no-match states are explicit; stale search responses are ignored.
- Verified in the development Electron app using 675 synthetic saved turns:
  paging, an old prompt match beyond the former cap, opening its latest thread,
  and loading the complete 55-turn conversation. Existing recovery, independent
  reply drafts, side-panel continuity and settings journeys still pass.
- Reviewed search and earlier-message screenshots. Corrected the search input’s
  double focus outline to a single neutral line. Runtime checks include identical
  timestamps, literal wildcard characters, grouping and missing/duplicate pages.
- No application bundle built for this milestone. Packaging remains deferred.


## 2026-09-19 — Workspace-aware closed-tab recovery

- Reopen Closed Tab (native menu / Command-Shift-T) restores the URL into its
  original space, folder and position. The folder opens to reveal the selected
  restored tab. Removed spaces fall back to the current space; removed folders
  are not recreated. Open failures retain the recovery entry for another attempt.
- Concurrent reopen requests are serialized; invisible agent pages are excluded
  from the human closed-tab stack. Closing the active tab chooses a human
  neighbor within the current space instead of an unrelated workspace or agent.
- Verified the development app with real local pages: close a folder tab, switch
  spaces, invoke the native menu, and inspect restored membership, ordering and
  selection. Screenshot: release/test-artifacts/aux-tab-recovery.png. Focused
  checks cover failed reopening, deleted space/folder, and agent-page exclusion.
- Recovery remains session-only and reopens the URL; it does not restore unsaved
  form contents or a closed page’s navigation stack. No package was built.


## 2026-09-19 — Bookmark portability in Library

- Added HTML bookmark import with explicit file selection and preview. The
  lazy-loaded parse5 parser treats HTML as data, without browser DOM insertion,
  script execution or fetching file-supplied URLs. Limits: 5 MB / 10,000 bookmarks.
- Runtime validates web URLs without embedded credentials and imports the batch
  transactionally. Existing URLs keep their titles; repeated imports are safe.
  Any database failure rolls back the batch. Folder contents are flattened and
  clearly disclosed; sidebar spaces, folders and pins are unchanged.
- Export writes escaped standard Netscape bookmark HTML through the existing
  native save dialog. Unsupported addresses are excluded with a notice.
- Development-app journey covers preview, actual import, existing-title
  preservation, export to a synthetic temporary file, duplicate-free round trip,
  and Library reload. Parser/database checks cover hostile markup, entities,
  unsupported URLs, oversized files and transaction rollback.
- Inspected rendered import and Library screenshots and refined the search focus
  treatment to a rounded single neutral border. No application bundle built.


## 2026-09-19 — Usable native download controls

- Downloads shelf now pauses, resumes and cancels actual Electron DownloadItems.
  Controls use trusted-shell-only IPC and the registered live item; unsupported
  or expired actions produce visible errors. No arbitrary download ID can act on
  another filesystem path. Paused indicators and neutral progress remain readable.
- Opening the shelf reconciles persisted rows with the native live download
  snapshot, restoring controls after a renderer reload. Old unfinished records
  without a live item display Interrupted instead of indefinite fake progress.
- Open now reports OS failures, including moved/deleted files. Zero received bytes
  display explicitly rather than leaving an incomplete progress sentence.
- Development-app journey uses local streamed files: pause, reload, resume, exact
  byte comparison after completion, cancel a second download, and show an actual
  missing-file error. Reviewed paused/completed/cancelled/error screenshots.
- This does not persist resumable transfers across application restarts. Downloads
  still use Aux’s existing managed download location. No bundle was built.

## 2026-09-19 — Native tab recovery

- Crashed tabs now expose a usable Reload action and recover the same native tab,
  profile and page identity. A fresh protocol connection restores agent observation
  after Chromium invalidates the old connection. Reconnection failures retain an
  explicit recovery state instead of implying that the tab is fully usable.
- Failed main-frame navigation shows the attempted address with Try again and
  Go back. Chromium's internal error-page address is excluded from tab metadata;
  failure stops the loading indicator. Aborted navigations are not error screens.
- Validated in the development app with an isolated synthetic profile: forced
  renderer crash, same-tab reload, runtime observation, connection failure, retry
  after the server recovers, and back navigation. Reviewed rendered recovery
  screens at 1200×944. Source builds, desktop type checking and relevant shell and
  driver lifecycle checks pass. No application bundle created.
- Reload cannot restore unsaved page forms. Live model-provider qualification
  remains pending an explicitly configured provider connection.

## 2026-09-19 — Website permission controls

- Dedicated Site permissions settings category displays readable per-site decisions,
  search by origin or permission, individual resets and whole-site reset. Loading,
  empty, no-match and save-failure states are explicit. Unrelated decisions remain.
- Reset guidance distinguishes future permission requests from active capture;
  resetting does not promise immediate hardware revocation or clear site cookies.
- Permission read/reset IPC is restricted to the trusted main Aux interface.
  Writes use an atomic file replacement before updating the in-memory decisions.
  A failed write leaves the previous decisions intact and surfaces an error.
- Isolated development-app verification covers search, individual reset, UI reload,
  whole-site reset, preservation of other decisions, and an injected filesystem
  write failure. Reviewed the actual 1200×944 settings screenshot; desktop source
  build and type checking pass. No live camera/microphone or personal data used.
- This does not qualify conferencing, OS privacy prompts, screen-sharing selection,
  or immediate termination of active capture; those browser compatibility gaps remain.

## 2026-09-19 — Save browser pages as PDF

- File → Save Page as PDF (Command-Shift-P) and the command palette export the
  actual Chromium page using its print stylesheet, background graphics and CSS
  page sizing. A native Save dialog chooses the destination. Capture occurs before
  the dialog so later navigation cannot silently change the requested document.
- Trusted-shell-only export checks native page availability and prevents concurrent
  exports of the same tab. Cancellation leaves the page unchanged; write failures
  show a readable actionable error. Unsupported attached/engine pages are explicit.
- Exact palette command matches now rank ahead of Ask. Refined its neutral focus
  boundary and connected palette tab-reopen to the existing space-aware recovery.
- Real development-app verification exercised the File menu, inspected extracted
  text from both PDF pages with pypdf, checked print page breaks, cancellation,
  write failure, preserved tab identity and exact palette selection. Inspected
  `aux-pdf-command.png` at 1200×944. Desktop build and type checking pass.
- Export uses the page's printable representation, not an archival capture of
  interactive state. Custom margins/ranges use the existing Print dialog. No bundle
  created, credentials inspected, or external publication performed.

## 2026-09-19 — Full-page task editing and draft continuity

- Tasks now occupies the main content surface while preserving the browser sidebar.
  The underlying start/page UI is inert during Tasks/Settings so keyboard navigation
  cannot reach obscured controls. Tasks is a nonmodal region with normal access back
  to browser chrome. Search filters task titles/objectives within the workspace.
- Local drafts are separated by workspace and task, persisted on edit, and restored
  across switching/reloading. Last workspace/task selection is remembered. Saved
  task state changes only on explicit Save task. Draft storage failures are visible.
- Drafts retain their base revision. An advanced saved revision prevents Save/run/
  evidence actions until the user reviews and applies the draft to that revision
  or discards it. Runtime optimistic revision checks continue to protect writes.
- Development smoke verifies workspace isolation, new-task drafts, reload recovery,
  conflict review/rebase, and retained task revision history. Task-specific existing
  smoke verifies evidence/acceptance/archive/restore/setup and synthetic external
  MCP collaboration. Desktop build/type checking pass; reviewed full-page screenshot.
- Broader legacy smoke intermittently fails before Tasks: a bookmarked fixture is
  missing after sidebar collapse/expand (tests/smoke/tasks-desktop.mjs line 67).
  One instrumented run passed that section; the cause is not established. Added an
  explicit --tasks-only mode to qualify this task milestone, not to claim the broad
  browser regression passed. Resolve the bookmark/sidebar issue next.
- Browser spaces and persistent task workspaces remain separate. No bundle built;
  live model and authenticated external-client qualification remain pending.

## 2026-09-19 — Foreground loading and regression diagnosis

- Resolved the previously open bookmark/sidebar report. Event tracing showed that
  the failing run never created a bookmark: the shortcut preceded foreground tab
  activation. The old async waitForFunction condition also accepted a truthy Promise
  before its boolean result. This was not evidence of deleting a saved bookmark.
- Foreground tabs now activate before navigation waits for completion. Slow sites
  can be selected/bookmarked while loading. Completing an open request preserves
  later user selection and live metadata; a closed tab is not resurrected by its
  late response. Explicit background-open behavior remains unchanged.
- Replaced async waitForFunction predicates in the affected desktop journeys with
  test-side awaited runtime polling. Inspected the installed Playwright implementation
  to establish the cause; no arbitrary readiness delay substitutes for a condition.
- Qualified a deliberately unfinished local response: activation and bookmark occur
  before the server finishes; selecting another tab survives response completion.
  Full browser/Library/sidebar/task/evidence/setup/synthetic MCP journey now passes.
  Crash/navigation recovery and task-draft conflict journeys pass with corrected
  polling. Focus/metadata/closed-tab late-response cases have targeted coverage.
  Workspace and desktop builds and desktop type checking pass; no bundle created.

## 2026-09-19 — Portable task receipts

- Tasks exports a fresh runtime receipt as readable Markdown through a native Save
  dialog. It retains task/revision/time, objective, criteria, user reviews and their
  evidence references, provenance, source URL/page/observation identity, stale
  warnings, unresolved actions, run revisions/errors/durations and cost completeness.
- Captured page text is explicitly opt-in. Embedded HTML and Markdown image/link
  syntax from task/evidence text are escaped rather than made active. User acceptance
  remains labeled as such; uncertain actions and unknown cost remain explicit.
- Export refuses a changed task revision instead of mixing the old displayed task
  with a new receipt. Canceled exports report cancellation. File-export IPC requires
  the trusted Aux interface; write errors show a readable destination error.
- Verified real saved task/evidence export, optional captured body and cancellation
  in the development app's task journey. Formatter checks cover stale evidence,
  external claims, unresolved outcomes, earlier runs and active-content escaping;
  UI check verifies changed revision cannot reach Save. Inspected rendered export
  controls. Desktop build/type checking pass. No app bundle or external publication.
- Markdown is a portable review snapshot, not a restorable task/evidence backup or
  independent business-outcome verification. Live-provider qualification remains.

## 2026-09-19 — Supplied Aux identity and task references

- Adopted the user's exact PNG/SVG artwork in the home and empty conversation,
  favicon, development Dock/About icon, and macOS icon asset. Generated icon
  sizes from that artwork; no app bundle, signing, or publication performed.
- Rechecked the actual development shell at 1200×944 with populated pins, spaces,
  folders and tabs. Inspected native window capture over a grayscale backdrop:
  neutral frosted blur is visible, the main surface retains curved left corners,
  and the search focus remains a fine neutral outline. Solid appearance and
  collapse/expand preserve the original navigation structure.
- Task references can be added as URLs, renamed, removed, or opened explicitly;
  current tabs can be attached. Saving a URL does not fetch it or grant access.
  Changes use existing revision checks and require fresh evidence review. Closed
  tabs remain visibly unavailable; removing a reference leaves its tab intact.
- Fixed duplicate resource controls caused by sibling React key collisions.
  Real development-app checks verify persistence through reload, unsafe and
  duplicate URL rejection, explicit navigation, rename/removal and closed tabs.
  Desktop compilation/type checking and focused task-runtime checks passed.
- Next: user's first hands-on development review (`pnpm dev`), followed by
  functional blockers found there. Live model/provider qualification still needs
  a connection configured by the user; no credential-store searches. Optional
  polish, routines, global popup and packaging remain deferred.

## 2026-09-19 — Reliable first development launch

- Dependencies: existing workspace compiler, Vite renderer, Electron runtime and
  supplied public icon assets. Acceptance: actual development launch, visible
  artwork, real navigation, owned-server readiness, shutdown and clear port errors.
- `pnpm dev` now waits for Vite's own ready announcement rather than a fixed delay.
  A startup failure stops before Electron opens; an occupied port cannot silently
  attach the browser to an unrelated server. Renderer termination stops the app.
- Normal Electron development no longer depends on three unrelated fixture servers.
  The specialized engine harness retains its fixtures. Development Dock/About
  resolves the canonical source PNG without needing a prior renderer build.
- Verified the real launcher using an isolated temporary HOME/profile and mock
  keychain: startup, loaded SVG, native page navigation, shutdown, then a second
  launch with the renderer port occupied. Workspace compilation passed through
  that same launch path. No personal data, provider credentials or bundle used.
- First-review guide now documents startup errors and completed reference editing.
  Next remains hands-on review and live-provider qualification with user-configured
  credentials; optional new features and packaging remain deferred.

## 2026-09-19 — Preserve browser organization across restart

- Integrated first-review browser/Library/task/evidence/setup/local MCP journey
  passed. Inspection then found restoreTabs assigned new IDs to tabs, breaking
  the persisted sidebar's ID-based space/folder/order associations.
- Restored tabs now retain their identity while receiving fresh document and
  controller epochs. The driver is initialized beyond the previous document
  epoch; previous captured datasets are invalidated. Network navigation continues
  asynchronously so a slow site does not hold up reopening the remaining tabs.
- Native surfaces restore before runtime readiness. The shell preserves its saved
  layout through the initial partial snapshot and late full-page events, until
  it receives the complete workspace. Shutdown destruction events no longer
  masquerade as user tab closures. Snapshot writes are held during restoration.
- A real development-app close/relaunch check caught and now verifies the fix for
  partial-list reordering: IDs, two spaces, folder membership, custom order and
  selected tab survive, with newer document epochs. Workspace/desktop builds and
  renderer type checking passed. No package or personal profile used.
- Navigation history and unsaved form content are not restored. Full crash/disk
  recovery qualification and live model-provider verification remain roadmap work.
- Final integrated checks also passed after the restart fix: crash/retry/back
  recovery with runtime observation, browser/Library/task/setup/MCP journey, and
  focused stale-evidence, operation-authority and interrupted-run recovery checks.

## 2026-09-19 — First-review handoff gate

- Reconciled the authoritative roadmap's stale packaged-first wording with the
  user's explicit development-app-first instruction. No packaging is required
  for the current review. Added a concise current-state handoff to FIRST-REVIEW.
- The agreed design and known startup/restart blockers have current evidence.
  Further optional features await the user's requested hands-on review; live
  model qualification awaits a user-configured connection. Asked for review
  status, without requesting secrets or searching credential stores.
- Full founder acceptance is not achieved: wider local/cloud work, qualification
  and the user's visual/interaction acceptance remain outstanding.

## 2026-09-19 — First-review minimal shell correction

- Dependencies: existing native view bounds, sidebar data model, menu actions,
  appearance IPC and macOS vibrancy. Acceptance: full-height vertical browsing,
  zero-width collapsed sidebar, accessible restoration, compact utilities,
  neutral native material, preserved horizontal tabs and existing functionality.
- Removed vertical-mode toolbar, consolidated footer to New chat / Agent / More,
  softened pins/fields/selected rows, quieted agent history, and removed blur tuning.
  Native under-window material has no added colored tint; Solid and reduced
  transparency remain supported. This is not an AppKit Liquid Glass integration.
- Full sidebar collapse retains only a 7px edge hit target. Command-S toggles;
  Command-L opens/focuses the address field. Native window buttons follow the
  visible navigation layout; keyboard and native menus remain available.
- Inspected actual development-app native captures at 1200×944: populated glass
  home, full-height local webpage plus agent, collapsed page, and settings.
  Tested zero-width collapse, edge reveal, address focus, Glass/Solid and
  horizontal/vertical switching. Integrated browser/Library/task/setup/MCP passed
  using the new utility menu. Desktop build and renderer typing passed.
- No personal profile, credential lookup, app bundle or external release. Existing
  development process must restart for native material/window-control updates.

## 2026-09-19 — Selected local documents as evidence

- Dependencies: trusted native file picker, existing revisioned tasks, evidence store,
  human review, and Markdown receipts. Acceptance: select/preview/save UTF-8 text,
  Markdown, CSV or JSON; retain exact snapshot across restart; review against a
  criterion; export metadata with opt-in body; reject invalid files/stale revisions.
- Native reader reads only the user-selected regular file, bounded to 512 KB.
  Preview requires explicit saving, keeps file content inert, and never sends it
  to a model. Runtime import is desktop-only, rejects active/archived tasks, and
  computes the saved byte count and SHA-256 itself. No absolute host path is stored.
- Uses existing evidence persistence without a schema migration. New evidence
  invalidates prior acceptance. Snapshots are historical: original edits are not
  watched or reread. Fingerprints establish saved-byte identity, not factual truth.
- Verified real Electron select/preview/save, quit/relaunch after source changes,
  review, receipt exports with/without content, inert markup, malformed UTF-8,
  canceled selection and stale-revision rejection. Inspected actual screenshots:
  release/test-artifacts/aux-document-preview.png and aux-document-evidence.png.
- Workspace/desktop builds, renderer type checking, focused file/evidence/export
  checks, and existing task/setup/synthetic MCP desktop journey passed.
- Scope limits: UTF-8 text formats only; PDF/Office extraction, automatic synthesis,
  richer artifact editing and cloud execution remain roadmap work. No app bundle,
  personal profile, provider request, credential lookup or external release.

## 2026-09-19 — Reliable page search while browsing

- Dependencies: existing Find strip, native page lifecycle, runtime find contract,
  and tab activation. Acceptance: real visible-text counts/highlights, next/previous,
  no-result/empty states, switching tabs/navigation, clean close and zoom coexistence.
- Actual browser verification exposed the inverted Electron new-search flag: the
  old fallback counted hidden/script text. Corrected the flag mapping against
  Electron's webContents documentation and verified actual Chromium match ordinals.
  Removed the obsolete cold-search retry machinery; fallback counts use rendered
  body text and do not pretend to have an active highlighted match.
- Request IDs and per-page cancellation prevent mixed results. Renderer request
  ordering and document identity reject stale responses. Find stays open across
  tab selection, refreshes after native layout/navigation, and cancels delayed
  work on exit. Empty queries clear native selection.
- Real Electron workflow passed visible/hidden text, next/previous, no matches,
  two tabs, navigation, clear/close debounce cancellation, and zoom/reset. Native
  window screenshot inspected at release/test-artifacts/aux-find-page.png.
  Desktop build, renderer typing, focused ordering and tab-recovery checks passed.
- Next: qualify a real model/agent connection supplied or configured by the user;
  continue complete local-development/research workflows, remaining browser
  compatibility cases, and later cloud continuity. Full roadmap remains open.
- Reference: https://www.electronjs.org/docs/latest/api/web-contents#contentsfindinpagetext-options

## 2026-09-19 — Saved task history and earlier receipts

- Dependencies: existing task revisions, per-revision evidence/reviews, task drafts,
  and receipt export. Acceptance: inspect saved objectives/resources/evidence,
  export an earlier receipt, retain the current draft, survive restart/archive,
  and never imply that an earlier review establishes the current task's outcome.
- Added Task history to saved tasks. Earlier definitions and receipts are read-only;
  changing revisions cancels obsolete loads. Current form/draft state stays intact.
  Keyboard focus and scrolling move to the history heading below the sticky header.
- `tasks.receipt` accepts an optional positive revision; unknown revisions fail.
  Existing persistence is reused without a migration. Earlier receipts include runs
  through their selected revision, original recorded reviews and evidence, and the
  current task revision. Freshness is reassessed now; this is not time-travel status.
  Newer revisions do not inherit old evidence or acceptance. Mutation guards remain.
- Exports fetch the requested saved revision and prominently identify earlier
  receipts and their limits. Captured text remains opt-in. MCP uses the same schema.
- Real Electron workflow passed: saved document + human review, revised objective
  and criterion, unsaved draft, old receipt inspection/export, quit/relaunch, draft
  recovery, and archive with earlier evidence preserved. Inspected and corrected
  heading visibility in release/test-artifacts/aux-task-history.png. Existing
  task-review/setup/synthetic MCP journey passed; workspace/desktop builds, renderer
  type checking and focused receipt/revision checks passed.
- No personal profile, provider/credential lookup, bundle, publish or release.
- Next implementation scope: complete local project/development workflows using
  explicit selected resources, plus remaining everyday-browser compatibility gaps.
  Live model qualification requires a user-configured connection but does not
  block independent implementation. Full founder acceptance remains incomplete.
- Continuity audit found RunPanel's generic “Run again” could drop a saved task's
  identity. Task-bound terminal runs now offer “Open saved task” and select the
  exact persisted task/workspace before opening Tasks. Full-page conversations
  use the same path. Generic conversations keep their existing rerun behavior.
- Extended the real desktop journey with a synthetic completed run persisted in
  the isolated database while Aux was stopped: returning through the run panel
  and full conversation selects the correct task despite another remembered
  workspace, preserves the draft, and never creates an unscoped replacement run.
  SQLite setup waits for the runtime's shutdown lock to release. No model called.

## 2026-09-19 — Isolated local projects attached to tasks

- Dependencies: native folder selection, installed Git, existing task resources and
  revision guards. Acceptance: review the selected repository and dirty state,
  create a checkout from the reviewed commit, attach it, inspect external changes,
  survive restart, and preserve original files and index exactly.
- Local projects now provides this complete setup workflow in task resources.
  Selection tokens are single-use; manifests persist setup and recovery state.
  Removal detaches a reference only; it never deletes a checkout. Re-attachment
  uses the same task revision guards as other resources.
- Git uses fixed arguments without a shell, bounded output/time, no credential
  helper/network protocol, and disabled hooks, filesystem monitors and filters.
  Dirty/untracked files are not copied. Submodules and large-file downloads are
  not performed. No dependencies, setup scripts or commands run automatically.
- Canonicalized the project storage root to handle macOS /var symlinks correctly.
  Desktop bundling now reads main/preload source files: previously an incremental
  build could bundle stale output when TypeScript did not re-emit its entrypoint.
- Real Electron workflow passed cancellation, review, creation, task attachment,
  external-change refresh, quit/relaunch, reference removal and re-attachment.
  Original dirty file and Git index were unchanged. Synthetic hostile Git hook,
  filter and filesystem-monitor checks did not execute their marker commands.
  Inspected release/test-artifacts/aux-local-project.png. Desktop build and the
  existing task review/setup/external MCP regression passed.
- Next: approved local commands, file/diff inspection, service lifecycle and browser
  previews remain open parts of G1/G2. This milestone does not claim a development
  agent or terminal is implemented. Live model qualification still requires a
  user-configured connection; independent implementation can continue.
- No real credentials, personal repository, app bundle or external release used.

## 2026-09-19 — Review local project changes in Aux

- Dependencies: saved isolated checkout identity and reviewed baseline commit.
  Acceptance: show actual changes, refresh external edits, reopen after restart,
  leave files/index untouched, and never execute repository diff drivers.
- Inspect checkout now includes a collapsible change review against the original
  reviewed commit. It displays the net tracked diff, including later commits,
  staged and working-tree edits; untracked filenames are listed separately.
  Binary content, ignored files and submodule contents are explicitly excluded.
- The desktop service fixes diff arguments and disables external diff/textconv in
  addition to existing hook/filter/monitor protections. No user-supplied file path
  is accepted. Oversized or unavailable diff output produces a visible limitation
  while retaining working-tree status; it is never presented as no changes.
- Real Electron journey verified rendered additions/deletions, external refresh,
  untracked files, restart and existing attach/detach preservation. Screenshot
  release/test-artifacts/aux-local-project-changes.png inspected. Build, renderer
  typing, hostile-driver checks, baseline-versus-later-commit/staged/working-edit
  comparison, index preservation and bounded-output behavior passed.
- Current review is read-only and refreshed on demand. It is not an immutable
  evidence snapshot, integrated editor or command runner. Those development
  workflow capabilities remain next; the full roadmap remains open.

## 2026-09-19 — Approved local commands and browser previews

- Dependencies: validated saved project checkout, trusted desktop IPC and existing
  native browser tabs. Acceptance: explicit command approval, output/exit status,
  cancellation, bounded execution/logs, restart recovery and real localhost page.
- Commands & preview now accepts a command in the isolated checkout. A native
  dialog shows the exact command/path and execution scope, defaulting to Cancel.
  No command runs on project creation, navigation or restart. One active command
  per checkout; shell input is explicit, stdin closed, timeout ten minutes.
- This is human-approved local execution, not an OS sandbox or model tool. The
  process gets a separate HOME/TMPDIR and a limited environment without inherited
  provider keys or shell startup configuration. It still has ordinary OS access
  to files and network. These limits are visible before execution.
- Persistent command records retain merged stdout/stderr, exit code and outcome;
  latest 128K characters are retained with truncation indicated. Stop uses the
  process group with escalation. Shell exit and normal app quit clean up children.
  Interrupted records never auto-resume. Forced app termination can leave process
  state unknown; the UI states this instead of claiming it stopped the process.
  Output persistence failures stop execution and report the durability failure.
- Manually entered HTTP(S) localhost preview URLs open real Aux tabs; credentials
  and non-loopback hosts are rejected in this control. It does not claim server
  readiness or automatic service discovery. Existing browsing remains unchanged.
- Real Electron journey verified native cancellation (zero command records),
  successful execution/output, Python server startup, actual preview page text,
  stop, and saved successful/canceled records after restart. Inspected the rendered
  command/log view at release/test-artifacts/aux-project-commands.png. Builds,
  renderer typing and focused execution/project checks passed including failure
  exit codes, output limits, timeout, group cleanup and interrupted recovery.
- Records are project-level execution history, not task evidence or acceptance.
  Next: task-linked execution receipts, service/readiness lifecycle, file editing,
  JS/TS qualification, external editor continuity and remaining G1/G2 requirements.
  Cloud execution and real model qualification remain open. No bundle or release.

## 2026-09-19 — Command results as task evidence

- Dependencies: persisted native command identities and existing revisioned task
  evidence/receipts. Acceptance: preview a finished result from an attached project,
  save it to a criterion, preserve provenance/limits, export and reopen it without
  automatically accepting the criterion or carrying it into a newer revision.
- Import command result lists finished commands only from projects attached to
  the current task. The native main process accepts identity selection only and
  retrieves its own record; it rejects caller-supplied command/output payloads.
  The runtime denies external-client import, unattached projects, mismatched IDs,
  active commands, active task runs, archived tasks and outdated task revisions.
- Saved evidence includes command/project IDs, outcome, exit status, truncation,
  observed finish time and a fingerprint of the saved command/output/context.
  UI labels this as a historical result, not current checkout verification.
  Later local edits/commands are not monitored by this snapshot. Successful exit
  never automatically accepts the criterion. No database migration was needed.
- Receipt export includes provenance, outcome and limitations by default; command
  text, working directory and output require Include captured text. Rendered and
  exported content remains inert text. Old revision evidence remains readable.
- Real desktop workflow passed command selection/preview, native payload-forgery
  rejection, persistence across restart and both export modes. Inspected screenshot
  release/test-artifacts/aux-command-evidence.png. Workspace/desktop builds, renderer
  typing and focused evidence/export/read-only receipt checks passed.
- Remaining: task-bound execution authority at launch, current-state verification,
  service readiness/lifecycle, light file editing, JS/TS qualification and broader
  roadmap gates. This milestone provides selected historical evidence, not an
  autonomous development agent or full G1/G2 completion. No bundle or release.

## 2026-09-19 — Edit checkout files and recover drafts

- Dependencies: validated isolated project paths, Git filename inventory, existing
  change review and local command lifecycle. Acceptance: select/edit/save a file,
  review its diff, keep drafts across restart, detect external changes, retain a
  recovery copy and reject paths outside the selected checkout.
- Files provides filename search over tracked/untracked non-ignored files. Nothing
  reads file contents until the user selects one. UTF-8 text up to 256 KB is editable;
  the inventory is bounded to 5,000 files and the visible search to 100 matches.
  File and command panels are mutually exclusive to keep the task surface compact.
- Drafts persist in the Aux profile by project/file and original hash. Reopening
  restores the draft; external changes block normal saving. Reload disk and discard
  draft is explicit. Storage failures are visible rather than silently discarding
  work. The editor preserves uniform CRLF and UTF-8 BOM content.
- Native file access checks the selected Git inventory, canonical checkout/path,
  regular-file type and single link. Traversal, .git metadata, symbolic/hard links,
  binary and oversized files are rejected. Saving rechecks hash/inode immediately
  before atomic rename, preserves mode and retains the pre-save text/fingerprint in
  a private file-history JSON copy outside the checkout. Show recovery copy reveals
  that file in Finder. This handles ordinary external-editor conflicts; it is not
  a cross-process filesystem transaction or hostile-process sandbox.
- Saving and Aux command start are mutually excluded per project. Existing active
  commands must stop before saving. Original source checkout remains untouched.
- Real desktop workflow passed conflict detection without overwriting external
  edits, explicit reload, save, resulting Git diff, unsaved draft after restart,
  and continued command/evidence/export/attachment journeys. Inspected and refined
  release/test-artifacts/aux-project-editor.png (monospace and neutral focus).
  Builds/renderer typing and focused link/path/size/mode/recovery checks passed.
- Limits: existing files only; no creation/deletion, syntax services, merge editor
  or automatic recovery restore UI. Service readiness, JS/TS app qualification,
  task-bound execution and broader G1/G2/cloud/model gates remain open.

## 2026-09-19 — Local preview response checks and saved URLs

- Dependencies: project manifests, approved local commands, native browser tabs.
  Acceptance: bounded loopback probe, useful refusal/HTTP/timeout states, open only
  after a successful response, retained URL and explicitly historical check status.
- Check preview issues a five-second GET from the desktop process without browser
  cookies/authorization, ambient proxies or redirect following. Only HTTP(S)
  localhost/127.0.0.1/::1 URLs without credentials are accepted. Connections pin
  loopback addresses and preserve Host/TLS server identity; HTTPS trust checks stay
  enabled. Headers are sufficient; the response body is not buffered or evaluated.
- A 2xx response enables the Check & open action to open the real browser page.
  Redirects, other HTTP statuses and connection errors remain visible instead of
  claiming success. This proves the URL answered, not process ownership, app health
  or task acceptance. Saved check timestamps are shown as historical, never live.
- The latest URL/result persists on the project and restores when returning to
  Tasks or restarting Aux. Checks do not start/restart servers. Per-project checks
  are serialized; manifest writes now use unique temporary files.
- Real desktop journey passed initial refusal, Python response/open/stop, Node
  JavaScript response/open/stop, named localhost probing, retained URL/history and
  restart. Existing edit/conflict/draft, evidence/export and attachment paths passed.
  Inspected release/test-artifacts/aux-local-preview-readiness.png. Unit checks cover
  redirects without following, HTTP 503, timeout, refusal, credential-free headers
  and URL restrictions. Workspace/desktop builds and renderer typing passed.
- Remains open: full JS/TS framework/dependency workflows, sustained service
  management/ownership, automatic readiness monitoring, task-bound command authority,
  cloud execution and live model qualification. No G1/G2 completion claim or release.

## 2026-09-19 — Local commands retain reviewed task identity

- Dependencies: existing task revision/idle/unresolved-action guards, native command
  approval and persistent command records. Acceptance: stale/detached context cannot
  pass preparation, approval identifies the task, results retain execution revision,
  and a task changed during the dialog does not launch the reviewed command.
- Commands now require a saved task ID and expected revision. Desktop-only runtime
  preparation reuses the existing run guards and requires the selected project to
  be attached. Archived tasks, active agent work and unresolved browser effects
  block preparation. External clients cannot call this preparation route.
- Native approval includes task title/revision, exact command and working directory.
  Preparation runs again after approval and checkout inspection. Saved command
  records retain task ID, revision, title and workspace. The UI labels earlier
  revisions, commands from another task and legacy records without task binding.
- Execution identity carries into saved command evidence and default receipt
  provenance; command/output text stays opt-in. Historical result import can be
  deliberately selected for another criterion; it never changes original identity
  or automatically accepts the new criterion. No persistence migration required.
- This is an authorization snapshot at the final preparation check. Already running
  commands remain bound to that revision; later task edits do not retarget them.
  There is no cross-process task lock or OS sandbox, and local commands are still
  explicit human operations rather than autonomous agent command tools.
- Real desktop journey passed normal bound command/preview flows, preserved IDs
  through restart, stale-context rejection, and task mutation while approval was
  pending: approval returned yes but no command launched. Existing edit/draft,
  evidence/export and attachment flows also passed. Inspected the rendered command
  evidence provenance. Builds, renderer typing and focused task/command/evidence/
  export checks passed including archived, active and unresolved-effect guards.
- Remaining: sustained task/process coordination, complete JS/TS app setup/build
  qualification, editor handoff, autonomous scoped development, cloud continuity
  and live provider qualification. Full roadmap remains active; no bundle/release.

## 2026-09-19 — Persistent local services and TypeScript live editing

- Dependencies: approved task-bound commands, saved logs, checkout editor, loopback
  response checks and native tabs. Acceptance: check/build a TypeScript app, start
  its dev server as a service, edit while running, observe the preview change,
  stop it and preserve mode/outcome after restart.
- A single Keep running as a local service choice removes the command deadline;
  approval explicitly describes this lifetime. Services run until stopped, exited
  or normal Aux quit. They are not detached daemons and never auto-restart.
  Existing records default to ordinary command mode for compatibility.
- The command runner retains bounded output, process-group cleanup, task revision
  binding and explicit approval. Service mode is visible in history and captured
  command text. UI reload restores the active mode and provides Stop service.
- File saves remain blocked during ordinary build/check commands or stopping
  processes. Running services allow edits for watcher-driven development, using
  the same file conflict/recovery protections. Services have ordinary OS access;
  this does not add a sandbox or lock out external writers.
- Real desktop fixture completed a TypeScript check and Vite production build,
  opened the Vite preview, saved a TypeScript edit through Aux, observed the updated
  text in the native browser without restarting the server, then stopped it.
  Service mode/outcome survived restart. Full existing project/draft/evidence/
  export/stale-approval flows passed. Inspected and corrected the service toggle's
  layout in release/test-artifacts/aux-local-service.png. Builds, renderer typing,
  service timeout exclusion/stop/shutdown and evidence checks passed.
- Qualification uses the workspace's already installed TypeScript/Vite toolchain;
  it does not qualify fresh dependency installation, all frameworks or external
  services. Multi-service coordination, editor handoff, autonomous scoped tools,
  cloud continuity and live model qualification remain open. No bundle/release.

## 2026-09-19 — Preview and restore file recovery versions

- Dependencies: isolated project checkout, selected-file editor, retained pre-save
  copies and conflict-checked atomic saves. Acceptance: preview a retained version,
  restore after restart, preserve the replaced contents, protect drafts and reject
  corrupt copies without deleting them.
- Recovery history now lists dated file versions and opens a plain-text preview.
  Fingerprint verification happens before contents are offered for restoration.
  Restoration uses the same guarded save path as ordinary edits, retaining the
  replaced file and preserving mode. Unsaved drafts disable restoration; stale
  disk hashes reject it. Archived task views remain read-only.
- Native desktop verification restored an earlier version after restart, then
  restored the replaced version from the new history entry. A dirty draft blocked
  restoration. Existing TypeScript build/live-preview/edit/stop, command evidence,
  export, task revision approvals and detach/re-attach workflows also passed.
  Inspected release/test-artifacts/aux-file-recovery.png. Desktop build, renderer
  typing and focused corruption/path/conflict/restart checks passed.
- Reads are bounded and reject links; known replacement of the history directory
  is rejected. This is ordinary local file protection, not a hostile-process
  filesystem sandbox. History searches the newest 100 project copies and declines
  enumeration beyond 1,000; all retained files remain on disk. Deleted-file recovery,
  automatic merge, retention management and power-loss guarantees are not provided.
- Next: continue first-review functional gaps and full roadmap qualification.
  Live model/provider qualification still needs a user-configured connection;
  independent local work can continue. Packaging and external release remain deferred.

## 2026-09-19 — Create, edit and retain new project files

- Dependencies: managed checkout identity, Git file inventory, draft editor,
  conflict-safe saves and command/save coordination. Acceptance: create a nested
  text file, edit/save it, see its untracked status, reopen it after restart and
  preserve both the original checkout and other unsaved file drafts.
- New file opens a compact relative-path form inside Files. Creation uses an
  exclusive filesystem open and makes missing folders one at a time. Existing or
  tracked paths, ignored files, Git metadata, traversal, symlinked folders and
  nested Git repositories are rejected. Created files use the normal editor,
  draft persistence, conflict handling and recovery history.
- The native action shares project save coordination: ordinary active/stopping
  commands block creation; running services may watch new files. Archived views
  disable creation. Repository scripts and filters are not run by this action.
- Actual desktop journey created src/components/created.ts, saved content, verified
  untracked status and unchanged original checkout, rejected duplicate/ignored
  paths, retained another file's unsaved draft, and reopened the new file after
  restart. Existing service/build/preview/recovery/evidence flows also passed.
  Inspected release/test-artifacts/aux-create-file.png. Desktop build, renderer
  typing, workspace build and focused project/file/process/preview checks passed.
- Files remain untracked until explicitly staged elsewhere. Failed creation may
  leave empty folders; it does not delete or roll back existing data. Protection
  covers ordinary concurrent creation and known links, not a hostile-process
  filesystem sandbox. File deletion/rename, external editor handoff, autonomous
  development tools and wider roadmap qualification remain open. No bundle/release.

## 2026-09-19 — Review new files alongside checkout changes

- Dependencies: Git untracked inventory and the existing bounded, link-rejecting
  UTF-8 file reader. Acceptance: explicit selected-file preview, no automatic bulk
  content read, snapshot timestamps, refresh invalidation and clear empty/error
  states without stale content masquerading as the newly selected file.
- Review changes now includes selectable untracked files. Large lists have filename
  search and a 100-result display limit. The selected content is plain text, not an
  invented Git patch. It excludes editor drafts and does not stage or modify files.
  Refreshing checkout inspection unmounts the previous snapshot and error state.
- Actual desktop journey verified initial absence of content, selected text,
  external edits leaving the old snapshot unchanged, refresh clearing it, empty
  file display, binary rejection clearing old contents, and a fresh updated read.
  Existing creation/edit/restart/recovery/service/evidence flows also passed.
  Desktop build and renderer typing passed. Inspected the rendered view in
  release/test-artifacts/aux-untracked-review.png. No backend or data-model changes.
- Remaining: external editor handoff, fuller development execution/agent integration,
  cloud continuity and full founder qualification. Live model checks still need a
  user-configured connection. No packaging, credential discovery or external release.

## 2026-09-19 — Choose and retain the download destination

- Dependencies: native download lifecycle and Downloads shelf. Acceptance: native
  selection/cancel, persisted choice after restart, active downloads retaining their
  original path, exact completed bytes, unavailable-folder feedback and reset.
- Downloads has one folder row with Change folder and, when needed, Use default.
  Selection writes a private atomic preference separately from runtime settings.
  Existing downloads never move. Missing/unwritable or replaced selected folders
  interrupt new downloads instead of silently using another location. Corrupt
  preferences require explicit recovery; the original preference is not read as
  a fallback path. Reset returns to the existing private downloads folder.
- Native download names now remain readable, with numbered collision suffixes.
  In-process reservations include case/Unicode normalization and existing entries
  are checked before selection. This avoids known duplicates, not arbitrary hostile
  external writes racing Chromium's eventual file open. Very long names are bounded.
- Real desktop verification passed cancellation, changing folders while paused,
  old destination stability on completion, saved selection after app restart,
  exact bytes at the new destination, removed-folder interruption, default reset,
  pause/resume/cancel and missing-file Open feedback. Inspected
  release/test-artifacts/aux-download-folder.png. Native build/renderer typing and
  focused damaged-preference/replaced-folder/duplicate-name checks passed.
- Cross-restart transfer resume remains unsupported; retry from the source page.
  No files were moved or deleted outside isolated test fixtures. Full roadmap and
  live provider qualification remain open. No bundle, publishing or release.

## 2026-09-19 — Retry saved downloads after restart

- Dependencies: durable download history, native browser session, destination
  selection and shell-only IPC. Acceptance: retain a supported source URL, reopen
  after app restart, explicitly retry as a new transfer, retain the cancelled
  record and recover from an unavailable destination after selecting a valid one.
- Native HTTP(S) source URLs are retained with download records in the existing KV
  store; no table migration. Existing records without a source remain compatible.
  The Retry handler resolves the saved record by ID rather than accepting a URL
  from the renderer, rejects active/completed/unsupported records, and uses the
  browser session for a new download. The UI marks the request and keeps old records.
- URL userinfo, non-HTTP(S) schemes, invalid and oversized URLs are not retained for
  retry. Saved URLs are local browsing data and may contain expiring query tokens.
  Retry issues a new GET; it does not replay form bodies, partial bytes, or prior
  request headers. Blob downloads and form-generated/expired links may require
  the original page. Cross-restart partial-transfer resume remains unimplemented.
- Real desktop check retried a cancelled transfer after restart into the persisted
  chosen folder, verified exact bytes/source and retained cancellation, then retried
  an unavailable-folder failure after resetting the destination. Existing download
  pause/resume/cancel/missing-file flows passed. Inspected the rendered retry shelf
  in release/test-artifacts/aux-download-retry.png and corrected its recovery text.
  Workspace/desktop builds, renderer typing, source validation and persisted-history
  checks passed. Full goal remains active; no app bundle or external release.

## 2026-09-19 — Native tab audio controls

- Dependencies: native WebContents identity, existing tab layouts and shell event
  bridge. Acceptance: reflect actual audible/muted state, mute one background tab
  without switching selection, keyboard operation, reload resynchronization,
  navigation continuity, both tab layouts and closed-tab rejection.
- Native audio events and a startup snapshot feed a small per-tab shell state map.
  Snapshot merging respects newer events and destruction removes stale entries.
  Speaker controls use the existing icon family and sizes; the tab menu and native
  webpage menu also support muting silent tabs. Shell-only native IPC validates the
  exact page and boolean; engine-paint views do not advertise audio support.
- Real desktop fixture verified a very low-volume WebAudio tone, audible indicator,
  exact native mute state, unrelated tab remaining unmuted, background selection,
  Space activation, shell reload, silent-tab menu, horizontal layout, navigation
  preserving mute, and rejection after tab close. Silent-output fixtures were
  unsuitable for audible-indicator qualification because Chromium correctly reports
  them as inaudible. Inspected aux-tab-audio-vertical.png and
  aux-tab-audio-horizontal.png in release/test-artifacts. Build/renderer typing pass.
- This is current-tab audio control, not persisted site muting or a media/DRM/
  conferencing qualification. Mute resets when the native view is recreated or Aux
  quits. Wider roadmap remains active; no bundle, release or credential access.

## 2026-09-19 — Execution strategy consolidated at the user's request

- Replaced control-sized delivery milestones with substantial delivery phases in the
  authoritative roadmap, ordered by impact on a usable Aux browser.
- Preserved every A–L requirement, the full evaluation/fault gates and M0–M11
  traceability. Existing verified pieces do not imply complete phase acceptance.
- Phase 1 is active. Keyboard-tab investigation is a task within it; no new keyboard
  implementation was started before this planning correction. Later-phase work must
  serve a concrete dependency or a real external-input block, not easier progress.
- Each phase now states a user outcome, coordinated remaining scope, dependencies,
  exit evidence and requirement ownership. Reports should use these phase outcomes
  and blockers; old “milestone” headings below/above are historical checkpoints.
- First hands-on review stays early. The no-bundle/no-release and no-credential-store
  instructions remain in force. Phases 1–4 now end in a private development handoff;
  founder acceptance, packaging and later refinements are not current completion gates.

## 2026-09-20 — Read-only operations health and additional local toolchains

- Dependencies: existing encrypted desktop secret storage, task/repository revision
  authority, attached-project UI and reviewed command runner. Acceptance: explicit
  connect/revoke, account/project selection, useful task-level health and guided
  non-JavaScript environments without enabling remote mutations.
- Connections now supports separately supplied Vercel and Sentry tokens. Tokens are
  stored through native OS encryption and are only sent to each service's fixed
  HTTPS API host; they are never returned to the renderer. Vercel exposes account,
  team and project selection. Sentry exposes organization and project selection.
  Disconnect removes the saved token and stale probe data.
- Attached development tasks can run one read-only operations check that reports the
  selected Vercel project's recent deployment state and the selected Sentry project's
  recent unresolved issues. Task and revision access is checked before and after the
  remote reads. Incident snapshots also preserve the bounded deployment summary and
  up to ten issue summaries beside local changes, commands and browser diagnostics.
  The MCP surface has the same scoped read path. No deploy, promotion,
  rollback, issue assignment/resolution/deletion, push or pull request is available.
- Project inspection now recognizes root Rust/Cargo and Go module environments.
  It offers exact check, test and build commands and a service command only when a
  runnable binary/main package is detected. Inspection reads bounded regular files
  and never executes repository code; every command still requires native review.
- Contracts, runtime, desktop and MCP bridge build together, and the integrated diff
  passes whitespace validation. Live account qualification remains pending because
  no credentials were supplied or searched. No app bundle, publishing or release.

## 2026-09-20 — Delivery readiness and first Vercel Sandbox lifecycle

- Dependencies: selected GitHub/Vercel projects, encrypted Vercel credential storage,
  attached task repositories and the existing task-revision authority boundary.
  Acceptance: richer read-only remote delivery evidence plus an explicit, durable
  cloud lifecycle that cannot be triggered by an external agent.
- GitHub repository checks now combine classic commit status, GitHub check runs and
  existing open pull requests for the checkout branch. The attached-project view can
  open the existing PR, and local handoffs/incident snapshots record the bounded
  results. Handoffs identify when the saved GitHub result predates the current HEAD.
  These calls remain read-only; Aux still does not push or create a pull request.
- Added the official `@vercel/sandbox` SDK and durable task-bound cloud environment
  records. From an attached project, the user can explicitly create a 15-minute
  persistent Node or Python environment, open its protected browser preview, run an exact
  executable with newline-separated arguments, stop and checkpoint it, inspect
  CPU/network use, resume it through another command, and permanently delete it and
  orphan snapshots. A billing acknowledgement precedes creation and deletion has a
  destructive confirmation.
- Source transfer is now an explicit bounded action: Aux uploads at most 500 UTF-8
  project files and 8 MB into `/vercel/sandbox`, reports skipped files, and never
  copies host environment variables. The cloud panel can reconcile provider state
  after an Aux restart, browse up to 500 regular files per remote directory, and
  open text files up to 256 KB. Paths remain inside the remote workspace and
  symbolic-link file reads are rejected.
- Cloud command records are durable and bounded. Aux preserves the exact executable,
  arguments, outcome, timing and capped output across restarts, and exposes the same
  read-only history to a scoped external agent. The command itself still requires
  an explicit Aux UI action and uses no shell string.
- The same reviewed executable and argument form can start a detached 15-minute
  service. Aux saves Vercel's command identity before returning, so the service can
  keep running while the desktop request is gone. After restart, Refresh logs
  reconnects to that exact provider command, updates its terminal state and retains
  bounded stdout/stderr; Stop service sends SIGTERM to that command. No shell,
  arbitrary environment map or credential forwarding is introduced.
- Provider refresh also records the environment's cumulative CPU and network totals,
  while every session remains time-bounded and retained snapshots expire after seven
  days. A reviewed remote text file can be saved back through Aux's native Save dialog,
  keeping an explicit local artifact outside disposable compute.
- Environment creation now makes the compute location and 15/30/45-minute maximum
  session duration explicit before billing acknowledgement. The saved environment
  retains that limit beside its provider expiry and cumulative CPU/network use.
  The user can export the remote workspace as a bounded compressed archive through a
  native Save dialog. Export excludes `.git`, `node_modules` and Aux's preview helper,
  rejects archives above 100 MB, denies external agents, cleans both the remote
  temporary archive and the protected local handoff, and records only export time and
  size in the durable environment record.
- A stopped checkpoint now has an explicit Resume action. Aux resumes the named
  sandbox through a bounded no-op command, refreshes its session expiry and preview
  route, and leaves source and command history attached to the same task record.
- Cloud environments now support a real interactive terminal. Opening it requires
  an explicit action in the attached task and rechecks the task revision/project
  authority. The runtime keeps the saved Vercel access token private, requests an
  ephemeral provider PTY token, and passes that token only to a lazily loaded xterm
  client in renderer memory. The client speaks Vercel's binary input/output and
  resize protocol, starts Bash in `/vercel/sandbox`, reconnects stopped persistent
  environments, and closes the WebSocket when the panel unmounts. External agents
  cannot request a terminal. No PTY URL/token is saved in Aux data or command history.
- New cloud environments begin without a publicly exposed application port. Opening
  a preview starts an Aux-owned proxy inside the sandbox, rotates a 256-bit secret,
  replaces the sandbox's public routes with only that proxy and opens the result as a
  normal Aux tab. The desktop adds the secret through an origin-scoped request header
  for documents, assets, API calls and WebSocket upgrades, while the proxy strips it
  before forwarding to the user's service. The secret stays in runtime/desktop memory
  and is never written to the address bar, browser history, task records or command
  history. External agents and private windows cannot create or register preview sessions.
- Cloud environments bind the originating task revision and attached project. All
  mutating methods recheck current task/project authority and reject external API or
  MCP callers; scoped external agents can only list their task's durable environments.
  Aux passes only the explicitly saved Vercel token/team/project to the SDK and sends
  no browser cookies, model keys, host environment, or repository files automatically.
- Contracts, runtime, desktop renderer and MCP bridge build together; whitespace
  validation passes. No live sandbox or detached service was created, billed, stopped or deleted because
  no credentials were supplied. Larger/binary workspace transfer, remote browser takeover,
  live provider qualification of protected previews, desktop-independent
  orchestration, cost budgets and orphan cleanup remain Phase 4 work. No app bundle,
  publishing or release.

## 2026-09-20 — Cloud account reconciliation and guarded orphan cleanup

- Dependencies: the existing encrypted Vercel connection, task-bound environment
  records and provider tags applied at environment creation. Acceptance: show every
  Aux-created sandbox visible to the connected account, distinguish durable records
  from true orphans, and delete only an explicitly confirmed unchanged orphan.
- The attached-project cloud panel can now request a fresh provider inventory. Aux
  lists only resources carrying its `product=aux` tag and `aux-` name prefix, caps the
  result at 200, and labels each sandbox as attached to a local task or orphaned from
  this Aux installation. Provider status, creation/update times, runtime, region,
  configured duration and resource shape are reported without saving a second copy.
- Cleanup is deliberately narrow and destructive. The renderer names the sandbox and
  snapshots in its confirmation; the runtime rejects external agents, refuses any
  sandbox referenced by a non-deleted local record, requires the exact provider update
  timestamp from the inventory, rechecks the Aux tag and exact name, then deletes the
  sandbox and orphan snapshots. A changed or disappeared resource requires refresh.
- Aux now applies fixed safeguards without adding another settings surface: at most
  three active Aux sandboxes in the connected account, two retained environments per
  task, 45 minutes per provider session, 90 lifetime CPU minutes and 1 GB lifetime
  egress before a stopped environment can no longer resume. Inventory shows the policy
  and current active count. Creation checks the account before allocating compute;
  resume checks fresh provider lifetime totals and persists the exact refusal reason.
- Reconciliation also handles the inverse orphan case. If a durable local record is
  absent from a complete tagged provider listing, the panel marks it missing. Removing
  that stale record requires an explicit confirmation, the exact saved update time,
  task/project authority and a second provider absence check. This prevents external
  deletion from permanently consuming the task's retained-environment allowance.
- Contracts, runtime and desktop compile together. Live provider inventory and deletion
  were not exercised because no credential was supplied or searched, and no billable
  resource was created. Scheduled expiry cleanup, provider currency limits, remote browser
  takeover and desktop-independent orchestration remain Phase 4 work. No app bundle,
  publishing or release.

## 2026-09-20 — Guided Ruby, JVM, PHP and container projects

- Dependencies: bounded root-manifest inspection and the existing reviewed local
  command/service/preview lifecycle. Acceptance: useful conservative workflows for
  four previously manual ecosystems without importing or executing project code.
- Ruby projects now offer Bundler setup, Rake/RSpec checks when matching root markers
  exist, and Rails or Rack services only when their regular entry files are present.
  Maven and Gradle projects use checked-in wrappers when available, load test/build
  commands, and expose Spring Boot services only when the bounded build manifest
  declares the plugin.
- Composer projects offer dependency setup, declared test scripts or PHPUnit, and a
  local PHP server only when an index entry point exists. Dockerfile and Compose
  projects expose reviewed image-build, configuration-check and foreground service
  commands. Aux never runs these during detection; every action still uses the native
  reviewed command boundary and durable output/recovery path.
- Runtime availability is checked from Aux's fixed command search path and shown before
  use. Missing Bundler, Maven/Gradle, Composer/PHP or Docker disables the corresponding
  suggestion instead of pretending it ran. Bounded manifest behavior, the full desktop
  renderer typecheck, integrated desktop build and whitespace validation pass.

## 2026-09-20 — Revision-pinned cloud coordinator authority

- Dependencies: revision-pinned source upload, persistent task/environment records,
  task mutation gates and lease-validated result manifests. Acceptance: one explicit
  sandbox owns one exact task revision, conflicting local work is fenced, stale
  coordinators cannot submit results, and stopping or deleting returns local control.
- A synced running sandbox now has an explicit **Hand off task** action. It rewrites
  `.aux/task.json` with a durable UUID authority lease, the exact task revision and
  source tree, plus a result contract that requires the same lease in
  `.aux/result.json`. Aux rejects a result whose task, revision, tree or lease differs.
- While that lease is active, Aux blocks local runs, task definition changes, human
  evidence decisions and local project writes. Only the owning environment can issue
  cloud mutations; a second environment cannot operate on the revision, and a synced
  environment cannot start commands, services, previews, terminal sessions or exports
  until it receives an explicit handoff. Read-only
  task/project inspection stays available. The cloud panel shows the owner and lease,
  disables source replacement, and clearly identifies the action that returns control.
- The worker result contract has a bounded, nonsecret `localRequest` for browser,
  credential, approval, file or question dependencies. A `needs_input` result must
  explain that request. Aux retains it on the environment record, shows it after
  reconnect, and offers one checkpoint-and-continue-locally action that returns task
  authority without pretending the remote worker can access the local signed-in browser.
  Resuming later requires another explicit handoff and receives a new lease.
- Parent tasks now expose their bounded descendant tree in the main task view. Each
  child shows its own current run state, stale-revision signal and cloud ownership,
  and opens into its independent resources, evidence and history. Child tasks still
  inherit no repository, page, file or credential authority from the parent.
- Project mutation authority is now exclusive across tasks, including sibling and
  unrelated roots that explicitly reference the same managed checkout. A cloud lease
  on that project blocks local runs, commands, commits and file writes from every
  other task; an active local task run blocks another task from starting against the
  same checkout. Read-only inspection remains available. The owning cloud environment
  can continue its approved commands, while competing environments and task trees fail
  before dispatch. This closes a data-integrity race that task-only fencing left open.
- Worker results are now preserved independently from acceptance claims. A completed,
  failed or `needs_input` result keeps its exact manifest, bounded local request and
  verified artifact bytes in the task receipt before the sandbox is stopped or
  deleted. Preservation is idempotent for the exact environment and result timestamp;
  criterion claims remain a separate import that still requires desktop review.
  This prevents an honest handoff with no claim from losing its diagnostics simply
  because it cannot yet satisfy a criterion.
- Parent and child task lifecycle now remains coherent. A parent cannot be archived
  while any descendant is open, and an archived child cannot be restored beneath an
  archived ancestor. Each task still keeps independent revisions, evidence and cloud
  authority; the guard prevents hidden active work inside an archived task tree.
- Parent receipts now aggregate every descendant task outcome. Active or uncertain
  child work takes precedence, rejected child work prevents a successful parent
  outcome, and a parent can be accepted only when its own criteria and every child
  receipt are accepted. The receipt UI and Markdown export retain each descendant's
  revision, hierarchy depth, archive state and cloud coordinator, so a coordination
  plan cannot look complete while delegated work is merely hidden elsewhere.
  An active cloud authority lease now counts as in-progress work even when no local
  run exists, preventing both the child and every ancestor receipt from appearing
  accepted while a remote coordinator can still change the checkout.
  Each descendant also contributes its own model-call count, known cost and cost
  completeness to a separate coordinated total. The parent’s direct usage remains
  visible, avoiding both hidden delegated cost and misleading attribution to the
  parent task itself.
- Tasks with unresolved browser actions or connected write outcomes can no longer be
  archived. The user must attach current evidence and reconcile what happened first;
  child lifecycle rules then prevent a parent archive from concealing the unresolved
  descendant. This applies to old revisions as well as the current run.
- A repository attachment now remains authoritative while its task retains any live,
  stopped, failed or checkpointed cloud environment. Aux refuses to detach that
  project until the environment is deleted or its missing provider record is
  reconciled, preserving the scoped path needed to inspect, export, stop and clean up
  the resource. Deleted records no longer constrain later task revisions.
- The Vercel connection and selected team/project remain fixed while Aux retains any
  non-deleted sandbox record. Disconnect and scope changes are refused until those
  environments are deleted or reconciled, preventing a billable resource from being
  orphaned from its cleanup authority. A replacement token remains allowed so a
  revoked credential can be recovered without weakening the fence.
- Stop/checkpoint, provider-confirmed stop, deletion, scheduled cleanup and guarded
  removal of a missing provider record return authority to Aux. Provider refresh
  failures remain fail-closed because Aux cannot prove that the remote coordinator
  stopped. Resuming a stopped environment does not silently reacquire authority; a
  fresh explicit handoff is required.
- Retention cleanup is now two-stage for an environment that still owns its task.
  At the deadline Aux first stops and checkpoints the sandbox, returns task authority
  locally and retains the checkpoint for a 24-hour result-recovery window. Only a
  later cleanup pass may delete the locally owned checkpoint. If provider stop cannot
  be confirmed, cleanup remains failed and cloud authority stays fenced. This prevents
  unattended result/artifact loss at the same instant that a worker lease expires.
- Contracts, runtime and desktop build together; the focused evidence/handler/MCP
  checks pass with a coordinator regression covering local run/edit/project/review
  rejection, matching-environment access, competing-environment rejection and local
  authority restoration. Live provider behavior remains unqualified until the user
  supplies a Vercel account; no credentials were searched, no paid resource was
  created, and no bundle or release was produced.
- The source development app was restarted through its normal shutdown path so the
  running main/runtime processes use the new authority API. Its renderer was reached
  over the development CDP endpoint, reported the Aux shell and saved home content,
  and rendered without a startup error. The actual 2880×1920 light-mode shell capture
  is retained as `vector-ui-screenshots/aux-source-build-2026-09-20.png`; the neutral
  search focus, rounded main surface, original space/folder/sidebar structure and
  recent-task composition are visible. This is source-build evidence, not an app bundle.

## 2026-09-20 — GitHub issue-to-task intake

- Dependencies: the existing encrypted GitHub connection, a selected managed
  checkout and task/project revision authority. Acceptance: inspect bounded open
  issues for that exact repository, attach one explicitly to the task, expose the
  same read-only result to scoped agents and retain issue identity in delivery
  evidence without enabling a remote write.
- **Check GitHub** now includes up to 20 recently updated open issues, excluding pull
  requests returned by GitHub's shared issues endpoint. Aux retains the issue number,
  title, URL, author, labels, update time and at most 8,000 characters of body text.
  Repository responses are capped at 2 MB even when GitHub omits Content-Length.
  Full bounded bodies are returned only by the live explicit check. The durable local
  project record retains issue identity, labels and timestamps with bodies removed,
  so disconnecting GitHub does not leave a cache of private issue descriptions in the
  checkout metadata.
- The attached-project view can open an issue in the real browser or add its URL and
  identity to the current saved task. Attachment creates a normal revision-checked
  task resource; it does not inherit GitHub token authority or mark any criterion
  complete. Scoped MCP clients receive the same status response and cannot expand
  repository access.
- Local incident and delivery summaries record the bounded recent issue list beside
  commit/check/PR state. No issue was edited, assigned or closed, no branch was pushed,
  and no pull request was created. Live account qualification still requires the
  user-configured GitHub connection; no credential store was searched.

## 2026-09-20 — Deployment and incident intake

- Dependencies: an attached managed checkout, the existing read-only Vercel/Sentry
  connection health path and current task revision authority. Acceptance: turn the
  latest deployment or an unresolved incident into explicit task context, while
  preserving the separation between a URL reference and service credential authority.
- **Check operations** now presents the latest Vercel deployment and up to ten recent
  unresolved Sentry issues as actionable records. Each can open in a real Aux browser
  tab or be attached to the saved task with its bounded identity and canonical URL.
  Duplicate references are recognized, archived or full tasks refuse attachment, and
  the normal revision-checked task update remains the only mutation boundary.
- A deployment or incident attachment does not expose the Vercel/Sentry token, enable
  provider writes, assert root cause or satisfy a criterion. The existing incident
  snapshot and delivery handoff retain the dated read-only health summary, allowing a
  saved issue reference to lead into diagnostics, a prepared fix and review without
  claiming that a production action occurred. Live service behavior remains
  unqualified until the user configures those connections; no credential was searched.

## 2026-09-20 — Cloud-to-local browser handoff

- Dependencies: a revision-matched worker result, explicit cloud coordinator lease
  and a resource already attached to that task revision. Acceptance: a worker can stop
  honestly for local browser access, the user can reach the exact saved context, and
  no new browser or credential authority is silently granted to the sandbox.
- A `needs_input` worker result that names an attached page or URL now shows the saved
  resource label and opens that exact local Aux tab or canonical URL. Missing tabs,
  detached resources, non-web resources and stale resource IDs fail visibly instead
  of opening an inferred page. The worker contract and runtime reject any requested
  resource ID outside the current task revision before the result can be preserved or
  imported.
- Opening local browser context does not return project authority to Aux or share the
  signed-in profile with Vercel. **Checkpoint & continue locally** still preserves the
  result, stops the environment and explicitly returns authority; resuming remote work
  still requires another upload-compatible handoff and a fresh lease. This completes
  the local-browser dependency loop without claiming a general remote browser.

## 2026-09-20 — Retention-safe cloud result preservation

- Dependencies: the existing scheduled cleanup, revision/lease-validated result
  contract, bounded artifact staging and durable task artifact store. Acceptance:
  retention may stop costly compute on schedule, but it must not delete the only copy
  of a worker result or declared artifact while preservation is unresolved.
- When a cloud-owned environment reaches retention, Aux now checks for a validated
  worker result before stopping it. Any result manifest and declared artifacts are
  copied into durable task storage through the same strict preservation path used by
  the explicit UI. The environment records whether a result was preserved, no result
  existed at checkpoint time, or preservation failed; the cloud panel exposes that
  state rather than implying the checkpoint alone protected task evidence.
- Cleanup still checkpoints and returns authority locally even when preservation
  fails, containing compute cost while retaining the sandbox for the 24-hour recovery
  window. Before the later destructive delete, Aux retries any unresolved
  preservation. A failed retry leaves the stopped checkpoint intact and schedules
  another cleanup attempt instead of discarding evidence. Exact task revision,
  criterion, resource and artifact validation still applies.

## 2026-09-20 — Whole-window unsaved-work gate requalified

- The current source tree already contained the coordinated native preflight for
  whole-window close and application Quit; the older “current state” paragraph that
  still described this as missing was historical and stale. The current first-review
  guide already reflects the implemented behavior.
- Fresh isolated native journeys passed for both entry points. Choosing **Stay** on
  any dirty page preserves every live tab, unsaved value, ordering and selection,
  including pages whose warnings were approved earlier in the same attempt. Unanimous
  **Leave** exits. Recovery state is committed only after the agreement succeeds.
- Crash recovery still restores URLs and saved organization rather than unsaved DOM
  form values. The all-or-nothing adapter remains pinned to Electron 43.6.0 and must
  fail closed and be requalified when that runtime changes.

## 2026-09-20 — Blank app-to-project workflow

- Dependencies: the existing saved-task resource boundary and managed project file,
  command, preview, recovery and review systems. Acceptance: begin a bounded app from
  an empty local baseline without requiring an existing repository, inheriting Git
  identity or introducing a second project execution path.
- Saved tasks now offer **New blank project** beside repository selection. Aux creates
  an empty private Git repository under its managed-project root, assigns a unique
  `codex/aux-*` branch and records a fixed empty baseline commit made by `Aux
  <aux@localhost>`. It neither reads global Git configuration nor creates a remote,
  runs hooks, installs dependencies, executes code or touches another checkout.
- The project is attached through the normal revision-checked task resource update.
  Its first files are created through the existing conflict-safe editor and then use
  the same environment detection, reviewed commands/services, linked preview,
  external-editor continuity, recovery history, portable patch, delivery manifest
  and exact local-commit boundary as imported repositories. Invalid project names
  are rejected and interrupted setup retains its partial directory for recovery.

## 2026-09-20 — Local model connection without a credential

- Dependencies: the existing OpenAI-compatible provider, validated endpoint policy,
  provider-scoped model profiles and connection probe. Acceptance: a local Ollama,
  LM Studio or equivalent endpoint can power Aux without inventing a credential,
  while any nonlocal endpoint remains credential-gated.
- Aux now treats validated `localhost`, `127.0.0.1` and `::1` compatible endpoints as
  configured when a planner model is saved. Settings explains that a key is optional
  for those endpoints, discovers model IDs from their bounded OpenAI-compatible
  `/models` response, and enables the existing live connection test. The runtime uses
  a fixed nonsecret placeholder header because OpenAI-compatible clients require a
  value; it is not stored and grants no authority.
- Remote compatible endpoints still require HTTPS and a provider key from the encrypted
  desktop store or process environment. Endpoint URLs still reject embedded credentials,
  queries and fragments. A live local model was not running during this qualification,
  so the final network probe remains a first-review action once the user starts one.
- Vercel and Sentry response parsing now enforces the two-megabyte limit on the actual
  received body as well as `Content-Length`, then rejects invalid JSON explicitly. This
  keeps read-only connection checks bounded even when a service omits a size header.

## 2026-09-20 — Cargo and Go monorepo development workflow

- Dependencies: the existing manifest-only environment inspector, Git change snapshot,
  reviewed command runner, task revision authority and local preview/review workflow.
  Acceptance: a multi-crate or multi-module checkout yields useful bounded commands
  without executing repository code, following symlinks outside the checkout or
  silently running every package when a narrower affected set is known.
- Cargo workspace member patterns are read from the bounded root `Cargo.toml`, resolved
  to at most 50 in-checkout member manifests and compared with the current change set.
  Aux shows member crates and loads per-package checks for directly affected crates.
  Root Cargo configuration changes mark every detected member affected. Commands use
  `--locked` only when `Cargo.lock` exists, so new and intentionally unlocked projects
  no longer receive a guaranteed-failing default.
- Go workspaces now read bounded `go.work` use entries, retain only in-checkout modules
  with regular `go.mod` files and produce module-scoped test/vet/build commands. The
  affected action targets changed modules, while root workspace configuration changes
  mark all detected modules. This fixes the invalid `go test ./...` default at a
  workspace-only root.
- Suggestions remain inert text until loaded into the existing command review. Native
  confirmation, task/revision binding, clean environment, output bounds, cancellation,
  restart history, preview diagnostics and delivery review remain unchanged.

## 2026-09-20 — Task, development and cloud CLI parity

- Dependencies: the runtime's validated method schemas, loopback bearer boundary,
  saved-task revision checks and the existing MCP development/cloud tools. Acceptance:
  a local operator can inspect and continue the supported task lifecycle from
  `auxctl` without knowing private RPC method names or bypassing desktop approval.
- `auxctl workspace` and `auxctl task` now cover listing and creating workspaces,
  listing/getting/creating/updating/archiving/restoring saved tasks, reading receipts
  and starting the built-in agent on explicitly named page IDs. Structured task
  definitions and patches accept inline JSON or `@file`, preserving the runtime's
  criteria/resource/revision validation.
- `auxctl dev` now exposes attached projects, environment/diff inspection, bounded
  file and command reads, GitHub/operations status and durable review generation.
  `auxctl cloud` exposes task-owned environment, command, directory/file and detached
  result reads. The CLI does not add remote push, deployment, cloud creation/deletion,
  evidence acceptance or secret access commands.
- Both CLI and MCP builds pass, and the running Aux runtime returned live workspace and
  task listings through the new commands. Mutation and native confirmation behavior
  remains owned by the same runtime handlers and exact method schemas.

## 2026-09-22 — Engine separation and the Aux identity reset

- The Rust/custom engine left the product path: `engine/` and `docs/engine/`
  live on the `engine-track` branch; the workspace, CI, packaging and runtime
  no longer build, route, or fall back to it. Managed Chromium (`aux`) and
  explicitly attached Chrome (`chrome`) are the only connection kinds.
- The rename completed in staged codemods: packages are `@aux/*`
  (`@aux/chromium-driver` is the browser driver), configuration is `AUX_*`
  only, errors are `AuxError`, events `AuxEvent`, the renderer bridge is
  `window.aux`, MCP tools are `aux_*`, partitions are `persist:aux-*`, the
  bundle identity is `dev.aux.browser`, and page-injected markers are
  `__aux*`/`__auxTid`.
- Legacy compatibility was removed rather than carried: `VECTOR_*` keys are
  ignored, the Vector→Aux migration UI/importers and the old JSON journal
  conversion are gone, and retained dual-name constants were deleted.
- The runtime database is a consolidated schema v1: `aux_meta` marks Aux
  databases, foreign keys are explicit, chat/task columns are indexed, and
  rows are typed. Pre-versioning and legacy versioned databases are refused
  unchanged with a recoverable message — nothing is silently reset. Future
  `user_version` transitions back up before migrating and require tests
  proving data survives.
- Verification: `tsc -b` clean, oxlint clean under the warning cap, unit +
  integration + e2e green, benchmark fixtures validate, the packaged app
  contains no engine artifacts, and `bundle.mjs` cleans `dist` so stale emit
  cannot ship.

## 2026-09-23 — Main-owned tab control (BR-01 foundation)

- Typed tab commands (`open/close/activate/navigate/back/forward/reload/stop/
  setMuted/reorder`) now actuate in the desktop main process through a
  `TabController` over a monotonic `TabCatalog` — no runtime round trip for
  human browsing (J1 works with the runtime child killed).
- Commands are idempotent (`commandId` dedupe), window-scoped (wrong-window
  and cross-window actuation rejected), and stale-checked against per-tab
  structural revisions; content churn does not invalidate pending commands.
- Browser state persists in a `node:sqlite` worker thread
  (`browser-store.cjs`) with durable-write acks and backpressure — never on
  the main UI thread. Catalog versions are monotonic across restarts.
- Renderer converges on ordered `tabs.patch` ops (upsert/remove/window) with
  gap detection falling back to `tabsSnapshot`/`tabsSince` snapshots; the
  runtime subscribes to `tabs.catalog` and lazily attaches drivers by marker.
- Popups, external opens and agent-created pages are ingested once into the
  same catalog; double-remove races between `onDestroyed` and controller
  closes are suppressed.
- Verification: `tsc -b` clean, oxlint 0 errors, 805 unit/renderer tests and
  21 integration tests green, packaged app smoke-tested (boot, auth, browse,
  persistence across restart).

## 2026-09-23 — BR-01 completion: moves, reopen history, agent commands, private parity

- Cross-window moves are main-process direct (`move` command + shared
  `movePageToWindow` actuation): the human path no longer round-trips the
  runtime, destination Space/folder placement rides `tabs.placement`, and
  both windows' orders/activation publish through catalog ops.
- Close/reopen restores real navigation history: `navigationHistory` stacks
  are captured before destruction (LRU 50, in-memory like every browser's
  session restore) and restored on reopen via the preserved logical `pageId`;
  generation bumps keep stale commands aimed at prior instances rejected.
- Agent `pages.open`/`pages.close` for aux tabs route through the same
  controller via `native.tabCommand` — trusted issuers get `runtimeOwned`
  records and idempotent opens (a persisted record materializes, a live tab
  focuses); renderer issuers cannot claim runtime ownership.
- Private windows reuse the shared `TabCatalog`/`TabController` in their own
  process (`ui.tabCommand`, `tabsSnapshot`, `tabsSince`, `tabs.patch`) — fully
  in-memory, no persistence worker, no closed-history cache. This fixed the
  Slice-5 regression where private tab actions failed on a missing handler.
- Verification: `tsc -b` clean, oxlint 0 new errors (one pre-existing fixture
  issue), 805 unit/renderer tests green including new controller move/trust/
  generation and renderer placement/reopen-id coverage.

## 2026-09-23 — BR-02: responsive stores, layout and startup

- Whole-array `s.pages` subscriptions narrowed to what each surface renders:
  App (active page + split companion only), Toolbar, AgentRail, Inspector,
  CommandBar (tab digest), RunPanel (run-scoped pages) and Conversation
  (digest-gated: loading/favicon churn no longer re-renders the transcript).
- `TabRow` memoization made effective: `useTabSelection` returns stable
  callbacks via a ref-backed api, and all Sidebar drag/drop/context handlers
  are `useCallback`d reading current state imperatively — a title or loading
  update now re-renders only the affected row.
- `RunRow` memoized with `setRailView` routed internally — a ticking run only
  re-renders its own row in the rail.
- Stage effect deps narrowed to active/companion structural fields — tab
  churn no longer re-subscribes the ResizeObserver + `setStage` report loop.
- Private shell gains `render-process-gone` recovery (reload + catalog
  reconvergence), matching regular windows — page WebContents survive since
  they live in their own processes.
- Verified pre-existing requirements: `RootBoundary`, lazy surfaces
  (Settings/Library/Inspector/Tasks/Reader), deduplicated `persistLayout`,
  structural-only `applyStage` triggers, catalog-restore-before-first-paint,
  `font-display: swap` + unicode-range subset loading, refresh backoff.
- Verification: `tsc -b` clean, oxlint 0 errors, 784 unit/renderer tests
  green.

## 2026-09-23 — BR-03: lifecycle, restoration, and resource management

- Explicit `lifecycle` state on `TabRecord`/`PageTarget`: `placeholder`
  (restored record, no view) → `live` → `frozen` → `discarded`; crashes stay
  on the existing flag. Sleeping rows dim in the strip.
- Restore order: the stage's shown/split page materializes inside
  `applyStage` (active-first); other saved tabs materialize under a bounded
  idle queue (1 per 1.5s, cap 20) — no startup stampede. Agent-owned records
  wait for the runtime's own re-attach.
- Freeze → discard ladder: 10min idle freeze via
  `Page.setWebLifecycleState`, then 30min frozen → view destroyed. The
  catalog record survives (`lifecycle:"discarded"`), so activation lazily
  rebuilds with real `navigationHistory` + captured scroll offset —
  measurable memory return without losing the tab.
- Safety guards unified in `page-lifecycle.ts` (pure, unit-tested):
  focused/split, popup, offscreen stage/preview holds, live downloads, media
  permission, audible/loading/captured, dirty documents, agent-held pages.
  Cross-window `move` materializes a discarded tab first.
- Dirty-state hints: an isolated-world collector flags input/change/paste/
  drop gestures; routine decisions run a cheap probe and only walk the DOM
  when hints or editable surfaces exist — no full-DOM walk per check.
- Unload vetoes respected: discard closes with `waitForBeforeUnload`; a veto
  (or a mid-discard activation) aborts and leaves the tab frozen.
- Paused runs release resources: `run.updated` events feed a paused-page
  tracker — paused agent pages become freezable (never discarded — the
  driver keeps its target), and resume wakes them before the next command.
- Verification: `tsc -b` clean, oxlint 0 errors, 795 unit/renderer tests
  green including the new `page-lifecycle` matrix and dirty-hint coverage.

## 2026-09-23 — BR-04: omnibox, commands, and fast retrieval

- Unified ranked providers in `CommandBar`: open tabs, bookmarks,
  recently-closed tabs (reopen action), runtime history, saved programs and
  recent conversations, all scored by `suggest.ts` match tiers
  (exact → host/title prefix → word boundary → substring) + recency decay,
  deduped by URL in provider order.
- Bounded hot index + FTS fallback: browsing history is now indexed by a
  SQLite FTS5 external-content table (`history_fts`, schema v1→v2 with
  triggers + `rebuild` backfill migration). `Repo.listHistory` runs
  token-prefix FTS then fills with a LIKE scan so mid-token substrings
  still match — migration and backup validator updated accordingly.
- Ranking stability: selection is identity-stable (`selId` survives
  re-ordering); an explicit search row always exists; `?` forces search,
  `>` agent, `/` commands — now seeded into the shared palette registry.
- Stale-response safety: history + remote suggestion effects carry
  cancellation (equivalent to sequence IDs) so slow providers can't
  overwrite newer input.
- Inline URL completion: ghost tail for a bare hostname prefix only
  (open tabs + bookmarks + history); → / End / ↵ accept like Chrome;
  disabled for multi-word or path input and during IME composition.
- Keyword engines (`engines.ts`): built-ins (ddg, g, gh, mdn, npm, yt,
  wiki, so, maps) merge with user engines from Settings by keyword;
  `gh aux browser` resolves to an engine-aware search intent with the
  engine name on the chip.
- Remote suggestions are an opt-in preference (`searchSuggestions`,
  off by default), never fire in Private mode, never for probable
  private/intranet addresses (`isPrivateAddress`: localhost, private
  ranges, single-label names, .local/.internal/.lan/.corp, credential
  URLs, IPv6), and only for engines with known suggest endpoints.
- `chrome.ts` classification widened: unicode domains (`münchen.de`,
  `例え.jp`), bracketed/bare IPv6 (normalized to `http://[::1]`), ports,
  `node.js`-style single-word domains; TLD must lead with a letter so
  `version 1.2` and `a,b` stay searches.
- Settings UI: keyword-engine editor + suggestions toggle under Browsing.
- Verification: `tsc -b` clean, oxlint 0 errors, 206 renderer tests + new
  `suggest`/`engines`/`history-fts`/`command-bar` suites green; the FTS
  dedupe path caught and fixed a real `Set.add` truthiness bug.

## 2026-09-23 — BR-05a: folder color/emoji + placement round-trip

- `Folder` gains optional `color`/`emoji`; `updateFolder` is the single
  partial-update path (name/color/emoji, null clears, missing id no-ops
  with the same layout reference).
- Folder context menu now offers the Space swatch language plus a preset
  emoji row; the folder glyph tints via the existing `data-space` →
  `--space-color` mechanism and shows the chosen emoji.
- `TabPlacement` schema carries folder color/emoji so a folder survives
  cross-window moves visually intact; `tabPlacementFor` emits them and
  `applyTabsPlacement` applies them on arrival.
- Agent-created-tab grouping verified already working (runtime-owned tabs
  file under their run with takeover/keep paths) — preserved, not rebuilt.
- Verification: `tsc -b --force` clean, workspace 19 + tab-transfer 5 +
  full renderer suite green, oxlint 0 errors.

## 2026-09-23 — BR-05b: navigation gestures + pinch zoom

- New `page-nav-gesture.ts`: a pure one-shot overscroll tracker (240px
  horizontal accumulation, 350ms gesture gap, direction-flip reset,
  page-consumption reset) plus a shadow-DOM-aware `consumesHorizontalWheel`
  walker with RTL scrollLeft handling. Both serialize into an
  isolated-world wheel listener (`auxNavGesture` world) that reports over a
  `Runtime.addBinding` channel — pages cannot observe or forge it.
- Wheel edge-overscroll (the default two-finger trackpad config), 3-finger
  `swipe` events, and Win/Linux `app-command` mouse buttons all converge on
  `onNavGesture` → the same `tabPorts.back/forward` actuation as menu and
  keyboard nav — identical wake/history/takeover guards. A deliberate
  gesture-nav on an idle agent page takes control exactly like a click;
  held pages stay protected via the existing offscreen-hold check.
- Private windows get identical coverage: shared `installNavGesture`
  self-attaches the debugger (regular views reuse the target-marker
  session), plus swipe/app-command on the private window.
- `did-create-window` popup windows get their own swipe/app-command
  handlers; hook-path popups are covered by the per-webContents wheel path.
- Trackpad pinch zoom enabled per view (`setVisualZoomLevelLimits(1,3)`)
  for regular and private pages; pinch stays ephemeral per document and
  pinch wheel events (ctrlKey) can never trigger navigation.
- Media keys: deliberately not wired via globalShortcut — hijacking
  hardware media keys system-wide is worse than the gap. Electron lacks a
  HardwareKeyMediaController; noted as an open item, not hacked around.
- Verification: `tsc -b` clean, oxlint 0 errors (2 pre-existing warnings),
  858 unit/renderer/integration tests green including 9 new
  page-nav-gesture tests exercising the real serialized script (edge runs,
  carousel consumption, RTL, pinch suppression).

## 2026-09-23 — BR-05c: unified shortcut registry + customizable bindings

- New `packages/contracts/src/shortcuts.ts`: one `SHORTCUTS` registry
  (command id → label, bindings, intercept flag) consumed by application
  menus, page-level `before-input-event` interception, renderer dispatch,
  Quick Ask global registration and the Settings editor. `command` is the
  platform-primary modifier (Cmd on darwin, Ctrl elsewhere); `ctrl` is the
  macOS Control key only, so Ctrl+Tab maps correctly on every platform.
- `matchShortcut` is exact-chord (extra modifiers no longer match — the
  old tables silently swallowed ⌘⌥T/⌘⌥W into new-tab/close-tab); shifted
  variants for `=`/`+`/`-`/`_`/`[`/`]`/`{`/`}` cover keys whose symbol
  requires Shift. `platforms` scopes Alt+←/→ interception to win/linux.
- Interception now tags the resolved `commandId` — menu clicks and page
  chords dispatch the command directly instead of re-matching, so a
  conflicted or custom chord can never fire the wrong command.
- Menu click paths synthesize `bindings[0]` only as a fallback chord;
  popupCommand honors `commandId` so popup-local nav/reload/zoom/close
  works under custom bindings.
- `shortcutOverrides` flows settings.set → settings.changed →
  `ui.shortcutOverrides` (schema-validated) → effective defs → menus,
  interception and Quick Ask retune in one step; renderer reads the same
  store field for shell keydowns.
- Quick Ask accelerator is rebindable: retune unregisters/restores on
  failure, persists `{enabled, accelerator}` so a custom global chord
  survives restarts.
- `ShortcutsSetting` records the next chord (capture-phase, suppresses
  the command it would fire), rejects modifier-less keys, explains
  collisions ("⌘⇧P is used by 'Save Page as PDF'") with an explicit
  steal that rewrites the rival's remaining bindings, plus per-row
  Reset and a global conflict banner for injected collisions.
- Tests: 21 new registry/interception/popup cases (normalization,
  platform modifiers, exact-modifier matching, overrides, conflict
  reporting, schema rejection, menu/page/renderer same-source).
  history-fts update test made deterministic — same-ms revisit rows are
  a distinct legitimate row, not a trigger bug.
- Verification: `tsc -b` clean, oxlint 0 errors on touched files,
  879 unit/renderer/integration tests green.

## 2026-09-23 — BR-05d: reading list as a bookmark subtype

- Reading list lives on the bookmark row (`reading_list`, `read_at`
  columns; schema v3 with a chained v2→v3 migration) — one ownership
  path, so folders, import/export, edit and move all keep working on
  reading-list entries. `bookmark_articles` holds one offline copy per
  bookmark (plain table — passes the backup validator's executable-
  schema check).
- New API surface: `bookmarks.readingList` (toggle; creates the
  bookmark when absent, title required), `bookmarks.markRead`,
  `bookmarks.offline.set` (requires the item to be on the list),
  `bookmarks.offline.get`. `bookmarks.add` accepts `readingList`.
  Leaving the list clears `read_at` and drops the offline copy;
  removing the bookmark cascades the copy; a URL edit moves it.
- Renderer: Sidebar page menu and Palette gain Add/Remove reading-list
  actions (regular windows only). Library gains a "Reading list" view
  grouped Unread/Read with mark read/unread, remove, and save/refresh
  offline copy (extracted from the live tab when it is open). A
  foreground open marks the item read; background opens stay unread.
- ReaderView falls back to the saved offline copy when live extraction
  fails (labeled "Offline copy · saved …"), and marks the item read
  when an article renders — either path.
- Private mode persists nothing: `toggleReadingList` no-ops, the
  reading view is hidden in the private Library (tab list and arrow
  nav share one filtered list), and offline.get is never consulted.
- Renderer method gate (`RENDERER_METHODS`) admits the four new
  methods; `bookmarks.changed` remains the authoritative list source.
- Tests: 5 repo cases (flag/toggle, read state lifecycle, re-bookmark
  keeps membership, single offline copy + cascades, article follows
  URL edit) + migration fixture updated to v3 with a v1-shaped DB
  carrying a real bookmarks table.
- Verification: `tsc -b` clean, oxlint 0 errors on touched files,
  884 unit/integration + 190 renderer tests green.

## 2026-09-23 — BR-05e: persistent profiles — deletion + external-link routing

- Profiles were already separate instances per identity (own
  `AUX_DATA_DIR` runtime + `AUX_PROFILE_DIR` Chromium session → cookies,
  permissions, extensions, history, chats, memory and agent grants are
  isolated structurally; each instance holds its own single-instance
  lock via per-profile `userData`).
- Deletion is now a distinct action from archiving: `browserProfiles.delete`
  removes the record and every managed byte under `<catalog>/<id>/`.
  It refuses the original profile (data lives outside the catalog), the
  running instance, and any profile whose `instance.json` heartbeat
  (2 min interval, 10 min staleness + `kill(pid,0)`) still looks alive —
  the safe failure direction on pid reuse is refusal.
- Settings UI gains a two-step Delete…/Delete permanently confirm on
  live and archived rows, with a plain-English data-loss warning.
- External links route by account context: a shared `active.json`
  marker (written on instance activation, window creation and URL
  opens) names the last-browsed profile. `queueExternalUrl` forwards
  to that instance through the same env-spawn path profile switching
  uses — the target's argv/second-instance handling opens the link
  whether it is running or not. `AUX_EXTERNAL_FORWARD` bounds routing
  to two hops; archived/deleted/stale markers fall back to local open.
- Tests: delete guards (original/missing/live-instance refused, dead
  pid proceeds, data+record removed) and routing rules (no marker →
  local, own profile → local, archived → local, valid → target) — 5
  profile cases green; `tsc -b` clean, oxlint 0 errors.

## 2026-09-23 — BR-05f: default-browser registration + site controls audit

- Default browser registration: Settings → General gains a Default
  browser row backed by `aux:default-browser` IPC — reads
  `app.isDefaultProtocolClient("http"/"https")`, registers via
  `app.setAsDefaultProtocolClient`, and for a manual fallback opens
  `shell.openExternal` on the OS default-browser panel
  (`ms-settings:defaultapps` / macOS System Settings). Live state shown
  as a badge; registration failure surfaces the manual path.
- Site controls and permissions were already complete and were audited:
  `SiteControls` panel exposes per-permission revoke + reset-all for
  every site, permission persistence rides the runtime settings store,
  and `PageRecovery` renders nav-error surfaces with reload / go back /
  edit-address / proceed-through-cert paths.
- Tests: `default-browser.test.tsx` covers badge state, register call
  and failure fallback.

## 2026-09-23 — BR-05g: form autofill + media keys feasibility

- Form autofill shipped as a non-secret personal-info filler aligned
  with BR-06 (which owns credentials/passkeys — passwords are never
  handled here):
  - `apps/desktop/main/autofill.ts` — serializable page-side classifier
    + filler. Autocomplete tokens map to a fixed key set; heuristic
    name/id/label/placeholder patterns cover forms without
    autocomplete. Read-only/disabled/password/number/range/date/checkbox
    /radio/button fields are skipped; selects resolve by value then
    label then substring.
  - Context-menu "Fill personal info" (regular pages only — never
    private windows) plus a palette command routed over `ui.autofill`.
    The menu passes the actual context-clicked frame; the IPC path
    resolves the page's main frame from the tab registry behind
    `requireShellUi`. `runAutofill` pulls the runtime `autofill`
    settings object at click time — nothing is cached in main — and
    fills in the main world via `executeJavaScript` with
    `userGesture`.
  - Settings → General "Personal info" editor stores name/email/phone/
    company/address under `autofill`; the settings-search index covers
    both new rows.
- Media keys: feasibility answer is *already supported*. Chromium's
  `HardwareMediaKeyHandling` flag is enabled by default in Electron, so
  hardware media keys route to the focused window's active media
  session (and the Media Session API) with no per-app work — the same
  behavior Chrome ships. A `globalShortcut` on media keys would hijack
  them system-wide and was rejected.
- Tests: `autofill.test.ts` evals the real serialized script in jsdom
  — autocomplete fields, heuristic fields, select matching, private/
  unsupported field skipping and empty-profile no-op — 6 cases green.
  Full suite: 681 unit + 21 integration + 192 renderer, `tsc -b`
  clean, oxlint 0 errors.

## 2026-09-23 — BR-06: import, credentials, passkeys, extension compatibility

- **Unified browser-data import** (Settings → Data → Import, replacing the
  Chrome-bookmarks-only row):
  - `apps/runtime/src/services/import-sources.ts` — read-only discovery for
    Chromium-family profiles (Chrome/Chrome Beta/Chromium/Edge), Arc and
    Firefox; Safari with an explicit Full-Disk-Access blocker. SQLite sources
    (Chromium History, Safari History.db, Firefox places.sqlite) are opened
    through WAL-aware read-only snapshots — source browser files are never
    mutated. Arc sidebar metadata (space/folder/pin/title) folds into the
    bookmark stream; attached Chrome contributes live open tabs.
  - `apps/runtime/src/services/browser-import.ts` — preview → run lifecycle.
    Preview lists per-source, per-category availability/counts/blockers
    before anything is read. Runs emit `import.progress` events, yield
    between batches so cancel interleaves mid-import, dedupe history on
    `(url, visited_at)` and bookmarks by URL, bound job history, and report
    a per-source partial-result table — a failed or locked source never
    blocks the rest.
  - `ImportDataSetting.tsx` — checkbox preview, run/cancel, live progress
    rows and the finished partial report; the settings-search index covers
    the row. `import.preview|run|status|cancel` are renderer-allowlisted.
  - Deliberately not imported: other browsers' encrypted credential stores
    (Chrome Login Data, Firefox logins.json, Safari keychain) — the native
    vault is the scoped credential experience instead.
- **Human credential experience on the vault** — a real login path, not just
  agent grants:
  - Trusted fill: context-menu "Fill sign-in" (editable right-click resolves
    matching items async) and palette "Fill sign-in…" (item picker). Main
    validates the *filled frame's* normalized http(s) origin against the
    item's stored origin via `vault.fill` — subdomains, lookalikes, other
    ports and credential-bearing URLs are denied and recorded. Fill is
    user-initiated only and lands via `credentialFillScript` in the target
    frame; secrets travel main→page, never into renderer/model context.
  - Save/update prompts: `credential-detect.ts` isolated-world watcher
    reports the account name (never the password) on submits and
    submit-ish clicks, coalesced to one report per 800 ms. Main captures
    the field values in the reporting frame (subframe-aware via
    `framesInSubtree`), suppresses the offer when `vault.secretMatches`
    says nothing changed, holds the pending save for 5 min keyed by
    page+origin (cleared on page close), and broadcasts to the owning
    shell. The banner offers Save / Update — update rewrites the secret
    in place via `vault.update`.
  - Locked vault: offers still capture; the banner collects the passphrase
    inline and unlocks-then-saves, keeping the offer open on a mismatch.
  - Generator: `vault.generate` (12–64 chars, CSPRNG, no-lookalike
    alphabet) wired into the Settings save form.
  - Explicit import/export: Settings → Vault exports live items to a
    user-chosen JSON file (mode 600) and imports `aux-vault` exports with
    validation + origin/username/label dedupe.
  - Boundary: `kind:"secret"` items never surface as sign-in fills;
    private windows get no watcher/offers/banner; `vault.fill|export|
    import|update|secretMatches` are main-process-only (`desktopUser`),
    external clients get metadata reads at most; agents keep opaque
    credential references. Ownership enforced via `requireOwnedEntry` on
    every credential IPC.
- **Feasibility decisions recorded** in `docs/AUX-BROWSER-COMPATIBILITY.md`
  (BR-06 refresh section): native messaging is API-present but host
  qualification needs a signed bundle — deferred with signing, which keeps
  1Password-style desktop unlock unqualified (native vault is the scoped
  answer); platform/synced passkeys need the Touch ID entitlement — also
  deferred (virtual CTAP2 path already verified); Widevine DRM is out of
  scope for this build; full Chrome Web Store parity stays out of scope
  with the managed-unpacked subset as the documented baseline.
  `docs/AUX-CREDENTIALS.md` gained the vault section (deterministic secret
  names for keychain continuity, origin-exact reveal, opaque model refs).
- Tests: `human-vault.test.ts` (21) — exact/wrong/lookalike/subdomain
  origins, revoked+expired denials, credential-URL rejection, secret-match
  silence, update, generator bounds, export/import round-trip+dedupe,
  jsdom fill/capture/detector scripts (field targeting, disabled/hidden
  skipping, serialization safety, username-only reports, click+submit
  coalescing). `browser-import.test.ts` (8) — Arc sidebar folders, Chromium
  + Firefox history readers, WAL snapshotting, dedupe, cancel mid-run,
  preview blockers, job lifecycle.
- Verification: `tsc -b` clean; 710 unit + 21 integration + 192 renderer
  green; oxlint 0 errors.

## 2026-09-23 — BR-07: private mode, content blocking, and site behavior

- **One request-policy router** (`apps/desktop/main/request-policy.ts`) owns
  `webRequest.onBeforeRequest` per session — it folds the HTTPS-first upgrade,
  global toggle, per-site allow and maintained host lists into a single
  `decideRequest`; main-frame navigations always pass, malformed URLs are
  ignored, domain+subdomain matching rejects sibling-suffix false positives,
  and a per-session block counter feeds the privacy UI. Installed identically
  in regular and private processes.
- **Maintained filter lists** (`filter-lists.ts`, `filter-fetch.ts`): built-in
  seed + user sources over https only, cached on disk so startup works
  offline, atomic temp-file+rename writes for lists and `sources.json`,
  etag/conditional refresh off the boot path (stale lists update in the
  background), enable/disable/add/remove with a merged host set rebuilt
  live. Settings → Privacy exposes status, refresh, add/remove and the
  per-site exception list; Site Controls carries a per-site
  "Block trackers and ads" switch.
- **Cosmetic filtering** (`cosmetic-filter.ts`): bounded selector rules
  serialized into an isolated-world script — removes/hides matching elements
  via CDP, no preload, reapplied live on toggle and per-site allow.
- **Private parity without persistence**: the private child receives
  read-only blocking config via env (`AUX_PRIVATE_*`), reads the shared
  cached lists but never writes — filter mutations proxy to the parent over
  child IPC (`aux-private-filters`) so the cache stays single-writer.
  Tracker-block toggle, per-site allow, blocked counts, cosmetic filter and
  site controls all work in private; every exception dies with the process.
- **HTTPS-first** (`https-first.ts`): eligible http navigations upgrade to
  https (Settings → Privacy toggle, Chrome-parity "Always try secure
  connections first"); localhost/127/::1/.local/.test/.internal/.lan/
  .localhost/.home.arpa/192.168/10/172.16-31 and non-standard ports are
  never rewritten. Aux-originated upgrades are tracked session-scoped —
  only those earn the "Continue over HTTP" recovery action, enriched onto
  `navigationError.upgradedFrom` (contract field on `PageTarget` + tabs
  schema). Explicit user http URLs and existing cert-error/proceed-insecure
  handling are untouched. Wired in both processes.
- **Download protection** (`download-guard.ts`): dangerous extensions and
  http-sourced files get a confirm dialog before bytes land (`Download.warning`
  on the contract, shown in the Downloads shelf); private downloads always
  prompt `showSaveDialogSync` with "saved outside private browsing" copy and
  are fail-closed when the window is gone. Regular download recovery
  (retry/resume/folder-unavailable paths) preserved.
- **Translation through the configured provider**:
  - `apps/runtime/src/services/translate.ts` — `translate.page` batches page
    text through `settings.model()` (cap 400 segments, `truncated` flag),
    bisects misaligned batches so text can't be misapplied, `translate.text`
    for selections; no configured model → clean `backend_unavailable`.
  - `apps/desktop/main/page-translate.ts` — isolated-world scripts extract
    visible text (skips code/forms/hidden/noscript/contenteditable),
    extract selection, apply in place behind a document token (stale pages
    refuse re-application), and restore originals exactly.
  - Surfaces: page context menu ("Translate page…", "Translate selection…"
    with an in-page result bubble), palette commands, `TranslationBar`
    under the stage with progress → detected-language → "Show original",
    errors as toasts. Private windows get the same flow — page text transits
    the parent's runtime over `aux-private-translate` child IPC (translate
    methods only; never persisted).
- **Private isolation audit**: separate process has no
  `--remote-debugging-port`, `NODE_OPTIONS`/`ELECTRON_EXTRA_LAUNCH_ARGS`
  are scrubbed at spawn, page `webContents` are sandboxed; private history,
  tabs, thumbnails, favicons, permissions, tracker exceptions, memory,
  extension state and agent context live only in the child's memory and its
  scratch `userData` is removed on exit. Extension/agent/data-export IPCs
  throw "unavailable in private browsing". Private search runs locally off
  the default engine without touching the runtime.
- **Verification tooling fix**: the renderer was never covered by `tsc -b` —
  a missing `Shield` icon export (used by Site Controls) and a stale
  `StoreState` name survived unnoticed. `tsconfig.renderer.json` is now part
  of `npm run typecheck`; the latent `CommandBar`/`Inspector`/
  `SearchEnginesSetting`/mock-bridge errors it exposed are all fixed.
- Tests: `request-policy` (8), `filter-lists` (6), `cosmetic-filter` (3),
  `https-first` (6), `download-guard` (4), `translate` (8 — batching,
  bisect-on-misalign, truncation, no-model, selection, jsdom
  extract/apply/restore round-trip).
- Verification: `npm run typecheck` clean (all projects + renderer);
  739 unit + 21 integration + 192 renderer green; oxlint 0 errors on
  touched files.

## 2026-09-22 — CH-01–CH-04: conversation continuity, page-help actions, context chips, reading/search

- **CH-01 (one conversation across presentations)** — verified already landed:
  the Quick Ask popup, side rail and full-page conversation share one
  `conversationId` and one composer draft. Drafts and page context persist in
  `localStorage` (`conversation-drafts.ts`) and sync live across windows via
  `storage` events with per-entry tombstones, so the mini popup, rail and full
  page never fork text. Expand keeps the chat instead of starting a new one.
- **CH-02 (page-help actions)** — selected-text actions (Ask/Explain/
  Summarize/Remember) and keyboard + drag region capture already landed.
  New: **right-click image → "Ask Aux about image…"** opens a conversation
  seeded with the instruction and the image attached.
  - `packages/contracts` — `PageQuickAction` gains `image` +
    `image: { dataUrl?, srcURL?, altText?, captureError? }`.
  - `apps/desktop/main/image-capture.ts` — `imageCaptureScript(x,y)` finds the
    `<img>` under the click (nested overlays included) and renders it to a
    bounded PNG (≤1600px, ≤3.8MB); tainted cross-origin canvases fall back to
    `session.fetch` + `nativeImage` re-encode with one downscale pass.
    Failures return honest `captureError`s, never silent blanks.
  - `page-menu.ts` shows the item only for real `mediaType === "image"` with a
    `srcURL`, same process gate as other quick actions; `native-views.ts`
    wires capture through the page's own frame — runtime-owned/private pages
    stay out of the shared quick-action path.
  - `App.tsx` attaches via `conversations.images.add` on a fresh chatId, seeds
    the draft with instruction + source/alt provenance, and toasts an honest
    note when capture fails (the conversation still opens with its source).
- **CH-03 (context chips)** — pages/documents/images/workspace memory already
  attach; new: **generated results are context chips**. The context panel now
  lists `conversations.artifacts.get` entries with include toggles wired to
  `conversations.artifacts.toggle` (runtime `conversationArtifacts:` selection
  already enforced `included` in `inheritedContext`) plus a Preview button
  that opens `SavedResultPreview`. Mock bridge learned `artifacts.toggle`.
- **CH-04 (typography / continuation / search)** — verified already landed:
  `AnswerMarkdown` (headings/tables/code), conversation sources and result
  previews, the Home "recent work" continuation list, and Palette ⌘K search
  across chats/tasks/history/memory/results with `all|tabs|work|pages`
  type filters.
- Tests: `image-capture` (13 — script happy path, nested overlay, no image,
  unloaded, tainted→fetch fallback, oversize refusal, fetch shrink +
  failure propagation, protected-source refusal).
- Verification: `npm run typecheck` clean (all projects + renderer);
  13 new unit tests + 59 existing conversation/contracts/renderer tests
  green; oxlint 0 errors on touched files.

## 2026-09-22 — AI workstream: labeled account boundary + sources surface

- **AI-05 (labeled account/profile selection)** — `routine.accountLabels`
  (schema field existed, never populated) now forms a declared account
  boundary. `handlers.ts` stamps `run.config.accountLabels` at routine
  dispatch; `runs.start`/`coordinator.start` carry it into the run config;
  `coordinator-turn` passes it to `vault.grants({taskId, origin,
  accountLabels})` so the planner only sees matching labeled grants
  (unlabeled grants never enter a scoped run). `revealForFill` re-checks
  the boundary at fill time — a stale skill or hand-authored
  `credentialRef` outside the labels is `permission_denied` and journaled
  as `denied`. Empty/absent labels keep the run unrestricted, unchanged
  behavior. `Routines.tsx` gained an Accounts editor fed by distinct
  `vault.list` account labels (checkbox chips → `routines.update`),
  surviving label renames via the union of known + saved labels.
- **AI-06/07 (sourced results, prepared-form loop)** — the context panel
  now renders `conversations.sources.get` as a read-only "Pages read"
  list (title + host + observed time) beside generated-results chips, so
  a research run's provenance is inspectable in-place, not only in the
  export. The "prepare → human edit → resume" loop already exists via
  `SavedResultPreview` (edited copy attaches as a new source); the
  `needs_input` ask/answer loop covers missing-information questions.
- **AI-03/04 audit (bounded observations/batching/cached context/
  parallel reads)** — verified present, no gap: scoped+bounded observe
  (`maxElements`/`maxTextChars`, forms/links/tables/subtree), revision
  diffs via `sinceRevision`, `carriedObs` reuse across turns, the
  observation cache keyed on scope+limits, `EarlyDispatcher` safe
  batching of streamed steps, and pilots-first bounded `Promise.all`
  member jobs in `set-runner`. No speculative perf work added.
- Tests: `agent-vault` +2 (grant scoping by declared labels, fill-time
  refusal of out-of-boundary references). `image-capture` test fixture
  typing fixed for `resize` mocks.
- Verification: `npm run typecheck` clean; `agent-vault` 6/6, `routines`
  7/7, `human-vault` 21/21, `image-capture` 13/13 green; oxlint 0 errors
  on touched files (pre-existing warnings only).
