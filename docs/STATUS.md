# Aux status — October 17, 2026

The full Aside parity goal is active on local `main`. Work remains incomplete.
Use [ROADMAP](ROADMAP.md) for owner decisions and the
[reference ledger](design/aside-parity-2026-10-16.md) for surface evidence.
The accumulated chronological status entries are preserved in
[historical status](STATUS-HISTORY-2026-10-17.md); old preview handles there are
retired and old gaps may have been resolved by later entries.

## Settings structure and editor batch — source

The next local slice replaces inline selection-action forms with compact rows and
focused editors, puts MCP registration in a reviewed dialog, adds keyboard-operated
Skills/MCP tabs, and moves password transfer and night-shift forms into focused
editors. Models cards now share the full Settings column; feature cards share the
reference's 4px inset, 10px gap and 288px illustration width. Settings/popup inputs
and permission cards use the shared quiet fills. Package defaults use shared rows
and switches. Aux branding, supported commands and permission boundaries remain.

Save/preview/reorder ownership is retained. Selection editors expose the original
save/reload commands and keep unsaved drafts on dismissal. Routed search waits for
hidden tab panels to become visible before focusing. Feature sections propagate
active state so their dialogs retire when leaving the section. The initial 27
focused editor/ownership tests passed. Integrated typecheck and lint passed;
4,644 tests passed and five integration tests still used the removed inline form.
Those tests now open the real editor, and all six parent ownership tests pass.
The full run covered747files/4,649tests in97.85s; unchanged tests were not repeated.
Logs: `/tmp/aux-parity-settings-batch-check.log` and
`/tmp/aux-parity-parent-owners.log`. The first renderer build caught static search-index generation attempting to index
installed package names. Dynamic rows now opt out of static field indexing while
the containing package section remains searchable. Generation and nine affected
tests passed, as did focused lint. Native acceptance is pending.

## Popup and editor follow-up — native verified

Packaged `56f74fd32` passed the native build in 9m14.56s; About confirmed the source.
The model picker and nested submenu now use compact 192px/208px widths and Escape
returns through each level correctly. General's native select has no default blue
outline/shadow. Tidy Tabs opens with the prompt focused and a quiet field fill.
Local captures 32–35 record these checks. The earlier full check passed 4,647 tests
across 746 files; the menu-width follow-up passed 31 targeted tests. Full parity
remains open, including selected-item popup alignment and populated/narrow states.

## Live Aside audit — Settings and shared surfaces

The foundation build `da1c89ef4` was verified natively against the installed Aside:
Settings canvas/card/navigation colors now match the sampled opaque planes, with
section breadcrumbs and corrected sidebar spacing. Both preceding disposable
previews were retired through their launchers; the next native build is pending.
See [the full audit](design/aside-full-audit-2026-10-17.md) for evidence and the
182-image inventory. Full paired parity remains incomplete.

The next source slice gives Home a separate content canvas token, standardizes
remaining project/routine/provider card fills, removes default blue option
outlines in favor of menu row highlights, and centers modal dialogs in the main
content area with a clipped backdrop and resize tracking. Existing native dialog
focus and cancellation ownership is retained. Integrated typecheck/lint passed;
4,646 tests passed and one stylesheet expectation needed the new canvas token.
That fixture and Settings dialog controls passed all 27 targeted tests. The new
stage geometry test and existing dialog tests passed (six total). Native visual
verification of this slice is pending.

## Pills, buttons and typography consolidation — source

The owner requested consistent pills, buttons and text sizes across surfaces.
Settings and portaled dialog buttons/inputs now share controls.css; removed the
replaced Settings.css and shell.css button recipes. Status badges and timeline
chips share pill geometry in primitives.css, with semantic height/radius/type
tokens. Settings headings now scale with Interface text via page/dialog title
tokens; no literal font sizes remain in settings stylesheets. Permission sections
use SettingsGroup rather than title-specific margin/corner selectors. Feature cards
now align with the surrounding groups.

The integrated check passed 4,640 tests and found six stylesheet-fixture failures
in four files after moving the rules. Updated those fixtures to read the shared
stylesheet and actual tokens; all 54 affected tests in five files passed. Renderer
build passed (`/tmp/aux-control-standards-build.log`). Final typecheck/lint passed
in `/tmp/aux-controls-final-check.log`. Packaged 1ab8c11b2 shows the shared controls
in General and Appearance, including light/dark theme selection. Quick Ask feature
card and shortcut grouping were visually reviewed. Narrow layouts and populated
pill states remain pending. Composite search inputs are excluded from standalone
input borders to preserve the shared outer focus surface.

The local mock preview was briefly embedded inside Aux for source inspection,
which duplicated browser sidebars. It has been closed and the visible app returned
to native Quick Ask Settings. Keep the user-visible preview on native pages.

## Shared feature cards and Settings tokens — source

CLI and Quick Ask now reuse the same responsive feature-card layout in
SettingsField. Quick Ask shortcut rows and Routine preferences use SettingsGroup
instead of title-dependent corner rules. Shared Settings spacing, text sizes and
weights use the existing design scale; unique reference geometry remains explicit.
Removed the replaced Quick Ask layout and per-page group styling. The CLI preview
shows the real supported `aux open` command; installation behavior is unchanged.

Integrated check passed 4,646 tests / 746 files, typecheck and lint in 96.48s
(`/tmp/aux-settings-feature-check.log`). Subsequent grouping passed typecheck and
six affected tests across three files. Renderer build passed. CLI and Quick Ask
feature cards were reviewed in the local renderer after a full refresh; alignment
was corrected. Packaged Quick Ask was reviewed in 1ab8c11b2; packaged CLI feature
card acceptance remains pending.

## Developers, Passwords and shared surfaces — packaged a51e5a915

Developers now uses shared CLI, Remote control and Skills & MCP groups. Passwords
uses Password managers and Autofill groups, with a working navigation row to Aux
Vault. Both were reviewed in the local renderer; the Vault row reaches the existing
Vault settings. Controls retain their existing authorization and lifecycle behavior.
Permissions uses a shared plain SettingsField surface rather than page-specific
card overrides; spacing reuses existing tokens.

Integrated check passed 4,646 tests / 746 files, typecheck and lint
(`/tmp/aux-developer-password-layout-check.log`). Follow-up typecheck and all nine
Permissions tests passed; all five native-library route tests passed. Native area
0053 passed native acceptance: History → Delete browsing data opened the native
dialog with the return route; Cancel returned directly to chrome://history/. No
data was deleted. Packaged Developers grouping and the plain Tool permissions
surface were observed; the remaining permission groups were then consolidated.

## General, Agents and Memory layout consolidation — packaged c9d878e2


General now groups search/new-tab preferences, picture in picture, and language/
spellcheck rows; import editors use navigation chevrons. Agents uses the shared
select styling for File access and Agent mode, keeps their existing confirmation
and revision checks, and groups the related behavior controls. Notification delivery
details remain available in a disclosure. Memory configuration uses an inset index
status line. Profiles uses the existing person icon.

Both Agents cards now reuse `settings-card`; removed their duplicate surface rules.
Dropdowns reuse control-height and spacing tokens plus one semantic fill token.
Design ownership is documented in ARCHITECTURE for future changes.

General, Agents and Memory were reviewed in packaged c9d878e2 at full viewport.
Memory rebuild reported the actual empty index status. Saving 30-day retention
in the disposable empty Profile persisted after refresh. Populated expiry remains
unverified natively. Agents exposed a CSS ordering issue addressed by the shared
plain surface follow-up above. Integrated check passed 4,646 tests / 746 files, typecheck and lint
(`/tmp/aux-agents-controls-check.log`); subsequent layout edits passed typecheck
and affected General/search, Permissions/attention and dialog checks. Final token
consolidation passed typecheck (`/tmp/aux-settings-token-check.log`).

## Shared Settings control parity — packaged d6e6c016a

The owner requested substantial batches focused on 1:1 Aside design parity.
One shared stylesheet now covers single-choice dropdowns across Settings and
portaled dialogs: 32px rounded triggers, paired chevrons, quieter fills, rounded
scrollable menus, trailing checkmarks, disabled states and keyboard focus. Native
select semantics, command refs, labels and change handlers are preserved. Removed
conflicting Settings select overrides. Simple single-select rows automatically use
the compact label/control layout; labels and hints use regular weight. Custom
popover triggers share the same dimensions and border treatment.

Observed in the local Vite renderer inside the existing disposable Aux preview:
General, Appearance dark/light, keyboard Theme selection, long Preferred languages
menu, and Escape closing only the picker while preserving Settings/the dialog.
The visual pass found and fixed Escape leaking into parent dismissal handlers.
Captures: aux-settings-shared-picker-dark.jpg, aux-settings-shared-picker-light.jpg,
aux-settings-shared-picker-dialog.jpg under /tmp/aux-parity-2026-10-16/.
Native d6e6c016a also passed Theme picker rendering and Escape preserving Settings.
Retention showed Never forget / 30 days / 90 days, opened the shorter-retention
confirmation, and Cancel preserved the existing policy. Saving/expiry native
acceptance remains pending. Reference rescan182PNG/192TXT. No full-parity claim.

The combined batch also completes the pending source implementation of episodic
retention: Never forget (default),30days,90days. A shorter choice requires an
explicit confirmation tied to the loaded policy. Expiry removes approved/pending
notes, owner edits and recoverable history using original capture time; root
MEMORY.md stays. Existing extraction watermarks prevent reimport. New recall
withholds expired notes before idle cleanup. Cleanup runs at startup/idle through
the same recovery-generation and derivative invalidation path as Forget, including
when extraction is paused. Offline exported packages remain outside this cleanup.
Native retention save/expiry acceptance remains pending.

Validation: integrated retention check passed4,645tests/746files in102.51s
(/tmp/aux-retention-check.log). After policy conflict and shared control changes,
typecheck/lint and86affected tests in6files passed in2.08s
(/tmp/aux-settings-controls-check.log). Final typecheck and3dismissal tests passed,
including native-picker Escape ownership (/tmp/aux-settings-controls-final.log).
No unchanged full suite repeated. Packaged build succeeded in 9m52.23s.

## Current native preview

The `56f74fd32` preview has been retired normally through launcher **86926**.
App **88158**, disposable Profile **aux-dev-jTFpmK** and the native lock were
verified removed. Log: `/tmp/aux-parity-popup-native.log`. The next integrated
Settings batch awaits its native build. Never embed the full mock renderer inside
the user-visible native preview; inspect native `chrome://aux` pages.

The following populated Memory evidence is from earlier disposable previews:

Native acceptance: created synthetic root MEMORY.md through Edit/Save and observed
Markdown plus actual update time. Imported two fictional paper-garden/workshop
notes through local preview/review; accepted both as unverified personal context.
One dated file contains both notes. Edited both in a single Save, observed changed
prose and updated time, then expanded both original-source disclosures: original
quotes remained intact. Rebuild reported2chunks and advanced index time; refresh
and reopening preserved both edited daily notes and root content. Management/back
navigation works. No provider call was needed. Observed populated dark and light
layouts; restoredDark. Narrow acceptance remains open.

Captures under `/tmp/aux-parity-2026-10-16/`:
- `aux-memory-daily-edited-498b9a550.jpg`
- `aux-memory-config-flat-native-498b9a550.jpg`
- `aux-memory-daily-light-498b9a550.jpg`

Reference073 comparison exposed the redundant large Memory heading above the
file toolbar and truncated words in derived note headings. Source follow-up moves
Close into the file toolbar, hides the redundant heading only for the visible
Memory browser, adds folder expansion indicators, shortens the tree heading and
uses word-boundary ellipses. Layout selectors now exclude hidden Settings sections.
Typecheck and14affected tests passed in0.700s (/tmp/aux-memory-chrome-check.log).
Renderer inspection confirmed the single toolbar and functioning replacement Close
action; capture aux-memory-toolbar-renderer.jpg. Its mock pipeline is unavailable,
so this does not add native runtime evidence. Closed the renderer inspection tab.
This small follow-up is not yet packaged; combine it with the next substantive
batch rather than rebuilding unchanged native code again immediately.

## Memory configuration layout — packaged in498b9a550

Source now leads with the index under Memory, followed by one Settings group.
The pipeline and manual-memory controls retain their existing distinct behavior;
manual controls are composed below the pipeline toggle in actual DOM order.
The nested Space memory card, long repeated explanation and redundant single-Space
heading are removed from Configure. Overview and other Memory views retain their
existing controls. An initial read failure now shows Index unavailable and a real
Retry action; successful retry clears the error without invoking Rebuild.

Local Vite renderer layout observed in dark and light modes through a disposable
native tab. Its mock has no memory.pipeline.policy implementation, so these are
unavailable-state layout observations, not working-index native acceptance.
Captures `aux-memory-config-flat-renderer.jpg` and
`aux-memory-config-flat-light-renderer.jpg` under the capture directory. Restored
mock Dark, closed that temporary tab and restored native sidebar. Productf8a63b938
was live at that renderer review. This layout is now packaged and observed in498b9a550.

Layout `npm run check` passed typecheck/lint and4,631tests/745files in109.59s
(`/tmp/aux-memory-layout-check.log`). The subsequent read-error correction passed
typecheck/lint plus40focused tests in3files, including a new recovery-from-failure
case (`/tmp/aux-memory-retry-check.log`). No unchanged full suite was repeated.
Native light/narrow configuration comparison remains open; healthy-state verification
now passed in498b9a550. Earlier source-only notes below are historical. Further comparison
remain open; renderer evidence is not a claim of complete Memory parity.

## Approved-document editing foundation — source only

Approved notes now expose stable episodic paths and modification times through
memory.pipeline.documents. Owner edits are stored separately from immutable source
quotes, inside the same encrypted claims/generation/history. Saves require the
exact loaded generation, including after restore/rebuild, and preserve the user's
supplied text on a conflict by rejecting the write. The future UI must retain that
draft and let the owner review the current document.

Recall, encrypted search chunks, handbook and approved-note rows use the effective
owner prose with explicit owner-edited/unverified attribution. Original source
eligibility and exact quote/hash checks still apply; changing/revoking the source
withholds the edit from recall. Consolidation preserves distinct owner edits and
uses modification time for age. Editing recomputes contradictions without merging
or expiring unrelated documents. Source Forget removes edits and recoverable copies.

Integrated check passed typecheck/lint and4,634tests/745files in98.55s
(`/tmp/aux-memory-document-model-check.log`). After the contradiction correction,
typecheck/lint and33focused Memory/recovery tests in2files passed in3.32s
(`/tmp/aux-memory-document-conflicts-check.log`). Runtime dist rebuilt before tests.
Evidence includes stale save rejection, preserved source quotes, changed recall/
search, encryption, recovery inventory, source revocation/Forget, distinct edits
through consolidation and removal of stale contradiction flags.

This is a data/API foundation, not a delivered document browser. Root owner docs,
the folder tree/editor, draft-preserving conflict UI and native walkthrough remain
required. Existing Space content/items remain authoritative and must not be copied
into a second divergent store. No native build started; group this with the browser
UI and the already-checked configuration layout. Live product remainsf8a63b938.

## Previous Home/history native preview (retired)

Product **0a5a757e0**, launcher **26443**, app **27577**, runtime **27591**,
exec **4789**, API port **51167**, disposable Profile **aux-dev-juErea**.
Log `/tmp/aux-home-history-native-build.log`; native build passed in **9m22.03s**
and runtime staging completed. CUA **homeHistoryApp** is stale; this preview retired normally. About confirmed clean
source `0a5a757e0d00e973ad7d3845a9059a33cddb021a`, Chromium154.0.8037.98 and ABI9021388e….
Prior launcher17093, app18292, runtime18307, Profileaux-dev-c7Z9wr and lock all
retired normally and were verified removed before replacement.

Native acceptance at3456×2010: three synthetic real-provider chats completed
without tools. Search-mode Home shows timestamp/title/reply cards without oversized
icons or repeated action buttons. Opening Paper garden shows its actual checklist
conversation. History now has a full-column composer and inherited background.
From history, Cmd-T plus `http://127.0.0.1:5197` displayed the new page immediately,
without clicking its tab. The temporary page was closed afterward.

Captures under `/tmp/aux-parity-2026-10-16/`:
- `aux-home-populated-0a5a757e0.jpg`
- `aux-home-routines-ask-0a5a757e0.jpg`
- `aux-history-populated-0a5a757e0.jpg`
- `aux-history-navigation-0a5a757e0.jpg`

Remaining comparison: Ask mode places Recent work about44CSSpx lower than reference004
because its composer toolbar adds height; Search mode aligns closely with001.
Ask also lacks the reference's Tab-to-switch affordance; any hint must have working,
draft-preserving keyboard behavior. Real image thumbnails and native narrow/light
states remain open. These observations do not establish full Home parity.

## Ask follow-up — packaged and natively observed

The empty Ask composer now uses a56px Recent work gap on wide Home layouts,
offsetting the toolbar height; narrow layouts and nonempty transcripts retain
their existing spacing. Ask shows the same Tab-to-switch hint as Search. Plain
Tab from its textarea invokes the scoped Search command without modifying the
durable draft. Modified, composing, already-handled and other-control events
keep their existing behavior. The hint hides at the existing narrow breakpoint.

Local renderer observed through the disposable browser: Ask → Tab → Search → Ask
restored the unfinished text. The synthetic draft was cleared, the temporary tab
closed and native sidebar restored. Capture `aux-ask-spacing-live-renderer.jpg`
under the capture directory shows the empty Ask/Routines layout. It includes an
extra outer native toolbar; accounting for that toolbar, Recent work aligns with004.
This is renderer evidence, not packaged acceptance. Native0a5a757e0 has retired; this source change is included in the
combined f8a63b938 replacement.

`npm run check` passed typecheck/lint and **4,629 tests /745 files** in95.79s
(`/tmp/aux-home-ask-check.log`). Reference rescan remains182PNG/192TXT/6support.
Full parity, image thumbnails and native light/narrow comparison remain open.

## Memory index batch — packaged and natively observed

Memory now persists encrypted512-character search chunks with64-character overlap,
a digest of approved source text and a real update time. Search uses these chunks
and still checks current source eligibility, contradictions and sensitivity.
Rebuild rewrites the derivative; older absent indexes report not-built while
searching through a transient rebuild. Recovery validates the derivative against
claims, then reseals/rebuilds at restore. Forget regenerates it without removed
text. Configuration exposes actual status, update time, approved-note chunk count
and Rebuild, with paused/loading/error states.

`npm run check` passed typecheck/lint and **4,631 tests /745 files** in95.94s
(`/tmp/aux-memory-index-check.log`). Added evidence covers multiple chunks per note,
cross-chunk search, encryption, restart, rebuild, recovery inventory, source Forget
and the configuration Rebuild/refresh action. Existing recovery-package tests pass.
The initial compile caught stale generated authorization, corrected by regenerating
host bindings. Only explanatory text and removal of unrelated formatting followed.

This adds the approved-note index foundation. Editable documents, indexing those
future documents, model extraction and episodic retention remain incomplete.
See [Memory implementation boundary](design/memory-parity-implementation.md).
Native behavior is observed above; configuration layout and light/narrow comparison remain open.

## Previous accepted native preview (retired)

Product **eabff947d**, launcher **17093**, app **18292**, runtime **18307**,
exec **50761**, disposable Profile **aux-dev-c7Z9wr**, API port49455.
Log `/tmp/aux-home-settings-native-build.log`; native build passed in **8m49.07s**
and runtime staging finished. About verified clean source
`eabff947db8db210d384dbe549cf8acab8047163`, Chromium154.0.8037.98 and ABI9021388e….
CUA binding **homeSettingsApp** is stale; this preview was retired normally.
Previous12644 preview retired normally; addressFocusApp is stale.

Native acceptance: Home Recent work spacing now aligns closely with001 at a
near-matched window size (3456×2010 versus3424×1978). Home's upper-right menu
opens Profiles, Usage & Budgets and General settings. Escape closes the menu and
returns focus to its trigger. General Configure/Import and Appearance Configure
have bordered surfaces; Languages and Customize Tidy Tabs dialogs open and cancel.
Three synthetic real-provider chats completed without tools in this disposable
Profile. Populated Home was captured in Search mode before this preview was retired.

Captures under `/tmp/aux-parity-2026-10-16/`:
- `aux-home-menu-eabff947d.jpg`
- `aux-general-actions-eabff947d.jpg`
- `aux-appearance-actions-eabff947d.jpg`
- `aux-home-populated-eabff947d.jpg`

## Home card follow-up — packaged and observed

Populated native evidence exposed the remaining large mismatch with001: oversized
chat icons, status badges and repeated action buttons displaced the actual reply.
Chat cards now lead with real relative timestamps, title and Markdown response.
Non-completed status and drafts remain visible. Only non-automatic deliverables
get an openable result preview; redundant automatic report actions are removed.
The whole card still opens the conversation, and draft subscriptions remain local
to their own card. Old result-button presentation is removed.

Integrated check passed typecheck, lint and **4,625 tests /745 files** in95.78s
(`/tmp/aux-home-cards-check.log`). Only dead CSS removal and formatting followed.
Packaged0a5a757e0 confirms the hierarchy and conversation navigation described above.
Do not claim complete populated-card parity; real image thumbnails and
narrow/light comparison remain to verify. Keep the substantial Memory
model/UI batch open per the implementation boundary.

## Related Home/history batch — source checked and natively observed

Reference113 comparison found the history composer constrained by the inner896px
compose-content wrapper even though its outer history column was full width.
The wrapper now spans that column. History no longer paints an opaque bg-0 over
the content surface. Shared Markdown typography covers Home and history card
previews. A Home card with a saved deliverable bounds its text preview to three
lines so the actual result remains visible and openable.

Native eabff947d also reproduced Cmd-T URL acceptance from history creating a tab
while leaving history covering it. Native omnibox open previously changed only
the host tab selection. Its renderer acknowledgement now switches to browser mode
for foreground navigation, leaving background opens alone and preserving a newer
view/focus request or owner if acknowledgement is delayed. Regression coverage
includes suggestion acceptance, refused navigation and a newer chat during a
pending typed navigation.

Final integrated check passed typecheck/lint and **4,627 tests /745 files** in
102.70s (`/tmp/aux-home-navigation-check.log`), including the8 native omnibox tests.
The preceding CSS-only check passed4,625tests in96.17s before the navigation fix.

Local renderer (Vite5197) checked through a page in the disposable native browser:
`aux-home-cards-live-renderer.jpg` and `aux-history-live-renderer.jpg` under the
capture directory. These have an extra outer native toolbar and mock data; they
are source-layout observations, not packaged native acceptance. Reference113
native before-capture: `aux-history-populated-eabff947d.jpg`. The temporary preview
tab was closed. No extra browser provider is available through CUA.

## Previously accepted keyboard corrections

Native patch0052 hands embedded-page focus back to the shell. Renderer3c34b442b
focuses/selects synchronously and does not select again after the native ack.
Native Cmd-L and subsequent Cmd-T preserved full rapid input; Escape restored the
retained Bookmarks query and keyboard focus. Window hide/raise retained page focus.
See the reference ledger for evidence. These corrections remain in the current
preview; no unchanged keyboard campaign was repeated.

## Latest accepted behavior

- Product2408e4727: native Memory History opens Activity by default. A real
  synthetic completed chat generated2review notes, dated activity with the source
  title, Chat completed trigger and measured2ms duration. Recovery revisions is
  separate and empty before note acceptance. Local extraction makes no model
  request; no fabricated token/cost fields. Native capture:
  `/tmp/aux-parity-2026-10-16/aux-memory-activity-native-2408e4727.png`.
- Encrypted activity records cover success/no-change, deduplication, restart,
  recovery export/import, and source/claim/all Forget. Unit and component evidence
  is recorded in the historical status and reference ledger. Native Memory
  document-tree parity is not complete.
- Prior layout preview: fresh Profiles keep sidebar and42px toolbar visible;
  actions align right. Auto-hide respects its preference and Labs opt-out.
  Reading-list mark-read moves the row and preserves action-button focus.
- Native Bookmarks/History/Downloads use Chromium pages with Aux presentation.
  Bookmark folders/split/private capabilities update live and survive temporary
  runtime unavailability. Empty Mobile/Managed roots are hidden. SavedPages holds
  Reading, Archived and Recently closed; the replaced combined Library is deleted.
- Rounded model-search focus has been verified natively, without the inner
  rectangular outline. Capture:
  `/tmp/aux-parity-2026-10-16/aux-model-search-rounded-4b1358c58.png`.
- Zoom25–500% is implemented in patch0044; older50–200% gap entries are historical.

## Memory document browser — packaged in498b9a550

Overview now has an episodic daily-file list, MEMORY.md, modification times,
Markdown preview and Edit/Cancel/Save. Daily edits submit changed fragments in one
generation-checked encrypted write; original source quotes stay available. Root
MEMORY.md edits authoritative WorkspaceMemory.content and shares the existing
saved draft store. Conflicts preserve drafts for comparison and explicit rebase;
new fragments survive rebase and Forget prunes removed fragments from open drafts.
Episodic drafts stay in memory while this Settings view is mounted, not across
closing Settings. Review and manage notes retains the existing import, review,
Forget, individual notes and Space-selection controls. Those controls stay mounted
to preserve focus when switching Spaces. USER.md/TAXONOMY.md, sites and routines
are not fabricated into the tree and remain open work.

Integrated check passed compilation/lint and4,636tests, with3Space-selection focus
failures in2files (108.90s, /tmp/aux-memory-document-browser-check.log). Fixed the
remount regression, then compilation/lint and pipeline/editor checks passed; the
isolated management fixtures were updated to open their new secondary destination.
Final14tests/3files passed in0.555s, including existing root draft recovery,
conflict/rebase, batched saves, Forget draft pruning and unavailable-state retry
(/tmp/aux-memory-document-browser-final-tests.log). Pipeline27tests and existing
editor22tests passed in the focused run. No unchanged full suite repeated.

The Vite renderer showed the new tree/root editor with the mock pipeline unavailable;
this is layout/error-state evidence only. Native populated-file editing, light and
narrow acceptance remain pending. The next package must include this batch plus
the preceding configuration layout and edit-model commits. Corpus rescan remains
182PNG/192TXT/6support files, excluding182JPG thumbnails.

## Remaining work

Reference corpus:182PNG,192TXT and6support files, excluding thumbnails, under
`/Users/rcourson/Desktop/Aside UI Reference 2026-10-16`. Rescan between batches as
the owner adds captures. Reopened073overview and075configuration on October17.

Packaged daily-document editing has native evidence; the latest configuration
layout and retention save passed in the empty c9d878e2 Profile; populated expiry
still needs native acceptance. Broader root/site/
routine authority remains incomplete. Approved-note editing, recall, recovery/
Forget and index rebuild have source coverage and native observations described
above. See
[Memory implementation boundary](design/memory-parity-implementation.md).
Model extraction/usage, errors, file diffs and Dream now also remain open.

Other known work includes real channel transports/pairing/reply delivery
([channel plan](design/channels-implementation.md)), named custom JSON providers
and subscription adapters, standalone routine behavior, cleanup/timer ownership,
device capture/file grants/maintenance, completion sound behavior, and matched
native light/narrow/populated-state comparisons. The native Clear History cancel
path now returns to History; the dialog itself still includes Chromium wording. These are not an
exhaustive completion checklist; audit the full reference ledger and ROADMAP.

Phase performance evidence and the manual20-task smoke remain incomplete.
Do not claim full parity or phase completion from a passing focused check.

## Development constraints

Commit coherent slices to local main; never push, dispatch hosted Actions, enable
Dependabot, sign, notarize or release. Use one native launcher/plain lock and
preserve cleanup ownership. Retire through the original launcher and verify app,
runtime, disposable Profile and lock removal before replacement. Never reset the
stable checkout or force-clear an active lock. Only disposable Profiles; ask before
touching the owner's real Profile. Runtime edits require dist rebuild before tests.
