# Aside UI parity — October 16, 2026

October 17 Memory activity source batch **2408e4727**: encrypted extraction
records now accompany candidate notes, including no-change outcomes, measured
local processing duration and trigger. History separates Activity from Recovery
revisions. Recovery and Forget include activity; no model usage is fabricated.
Integrated check passed4619/4620; corrected one removed-activity expectation and
all56 affected tests passed. Wide dark and narrow light synthetic rendering and
selection were checked, with stronger light active-row contrast. Native acceptance
awaits launcher4140/exec37073; ownership and evidence paths are in STATUS.
This does not complete document-tree, model-extraction, failure/diff, retention or
index-rebuild parity.


October 17 layout native acceptance: observed About identity f95a500ce+dirty
(the generated search copy was committed afterward in 196c543fd). Fresh sidebar
and toolbar are visible, toolbar actions align right, and Labs auto-hide opt-out
overrides the saved enabled preference. Reading mark-read retains row-action focus.
Native Bookmarks retains three feature opt-outs after reload with runtime suspended;
runtime resumed and test preferences restored. Capture and live ownership are in
STATUS. This supersedes the replacement-build assumptions below, not the remaining
full-parity gaps. Memory's document/extraction gaps are specified in
[memory-parity-implementation.md](memory-parity-implementation.md).


October 17 follow-up acceptance: candidate 4b1358c58 hides empty native bookmark
roots and removes Private/group/split actions immediately after their Labs opt-outs,
without reloading the native page. The model-search focus follows the rounded
whole control; the inner rectangular box is absent. Capture:
`/tmp/aux-parity-2026-10-16/aux-model-search-rounded-4b1358c58.png`.
Layout defaults and toolbar alignment are committed in f95a500ce; integrated
check passed 4,618 tests / 744 files. Replacement candidate 930d6632f is building
under launcher 95514. Runtime-unavailable caching, reading-row focus, replacement
layout walkthrough and broader parity evidence remain open.


October 17 Library integration acceptance: candidate 70b1bd1b5 verified in About.
Toolbar/shortcuts open actual native Bookmarks, History and data-deletion controls;
Reading/Archived/Recently closed remain accessible with rounded search focus.
Native mark-read moves the saved item to Read. Private History URL and Cmd-Y stay
isolated after patch 0050. Source patch 0051 now mirrors three Library Labs opt-outs
into native preferences and hides invisible permanent bookmark roots; source also
preserves newer overlay ownership and restores focus after reading-row moves.
Native compilation and 4,618 integrated tests pass. These latest fixes still need
consolidated native acceptance; full parity remains open.


October 17 native Library follow-up: candidate 21d7d725c verified in About.
Aux logo/dark native Bookmarks styling, original bookmark menu order, immediate
sidebar synchronization after native creation and native History navigation accepted.
Direct Private Bookmarks rejected; History first redirected to a normal window,
so patch 0050 now lets the existing WebUI guard reject the originating request.
That correction still needs native acceptance. Source replaces the cloned Library
with native routes and retains Aux Reading/Archived/Recently closed in SavedPages.
Renderer build and affected navigation/focus tests pass; replacement UI acceptance,
Labs group/split opt-outs, populated History and light/narrow comparisons remain.


Native Library presentation batch is consolidated in area patch
`chromium/patches/aux/0049-native-library-presentation.patch`. History and Bookmarks
receive Aux logo slots and scoped light/dark palette variables; Aux selects the
reference-era WebUI layout and bookmark menu ordering instead of Chromium's
2026 refresh/menu simplification. Private-window menu labels use Aux wording.
History navigation says Aux history. Google bookmark/history account promotions,
the synced-tabs navigation entry and Chrome bookmark help link are omitted in Aux;
managed-profile notices remain. Native bookmark/History data operations, clustering,
selection, clipboard and Undo implementations are retained.

Both WebUI configs now reject Aux off-the-record contexts so direct internal URLs
cannot expose persistent Library pages in Private windows. Non-Aux behavior is
preserved by the build flag. This policy and all visual changes need acceptance
in the next consolidated native app; neither public entry points nor the existing
Library overlay have been replaced yet. Feature opt-out integration and accessible
Reading/Archived/Recently closed destinations remain prerequisites for replacement.

Validation: Bookmarks and History TypeScript/resource builds and both WebUI C++
objects compiled. First C++ compile caught unreachable-code warnings from constant
build-flag ternaries; explicit preprocessor branches fixed them. Final private-guard
compile passed in 13.79s. Patch reverse-apply check passed. Integrated
`npm run check` passed typecheck/lint and all 4,649 tests / 749 files in 103.64s.
Logs `/tmp/aux-native-library-presentation-{check,compile,compile-retry}.log`,
`/tmp/aux-native-library-history-final-compile.log`,
`/tmp/aux-native-library-private-compile.log`.


Native candidate `479f5a96bcb400dd801f41cc5dd8a9d6edee9a90` built in 9m22.49s
and was verified in About with ABI
`9021388efb6b3a3f317178bce1b0794baf2826aa9c132b5bb276b28470fb8c68`,
Chromium 154.0.8037.98. Live launcher **73597**, exec **88582**, app **74900**,
disposable Profile **aux-dev-a2hXEY**, runtime API `http://127.0.0.1:54041`.
Preserve this preview and its cleanup ownership.

Native acceptance: Aux Library Copy/Paste produced a duplicate, Undo paste removed
only the new bookmark; Cut removed the original and Undo cut restored it. Opening
that bookmark in split view from an active web page now produced two live panes.
Root navigation stayed in the rail without duplicate permanent-root list rows.
No claim is made yet about keyboard context-menu focus or adversarial Undo conflicts.

Direct native pages are viable: chrome://bookmarks opened in a real tab; Organize
created a synthetic bookmark, native Copy + Cmd-V pasted it and Cmd-Z undid it.
chrome://history/grouped opened with real By date/By group tabs. History was empty,
so populated clustering has not been accepted. Built-in pages still need Aux
branding, palette/menu alignment, promo review, feature opt-out/Private checks
and navigation integration. Keep Reading/Archived/Recently closed accessible when removing replaced Library code.
Captures `/tmp/aux-parity-2026-10-16/aux-native-bookmarks-479f5a96b.png`,
`aux-native-history-grouped-479f5a96b.png`, `aux-bookmark-split-native-479f5a96b.png`.

Native page testing exposed stale sidebar data after bookmark creation. Root cause:
the host emits onBookmarksChanged/onHistoryChanged but the bootstrap allowlist
silently dropped them; onDownloadsRemoved was missing too despite native producers.
Patch 0048 adds these three events. The coverage script now detects direct port
subscriptions and rejects declared events absent from forwarding. Coverage: 187
used bridge members, zero missing handlers; all 30 declared events forwarded.
Native build_ts compiled in 4.26s (first invocation used the nonexistent :build
target, corrected to :build_ts). Reverse-apply validation passed. This patch is
source-only relative to the live app; native synchronization acceptance is pending.
Validation: integrated typecheck/lint and 4,648/4,649 tests passed; the sole failure
was the existing coder-worktree snapshot test's 60s timeout. Its isolated retry
passed in 26.20s, without changing that test. No passing suites were repeated.
Logs `/tmp/aux-library-events-{check,retry}.log` and
`/tmp/aux-library-events-native-compile-retry.log`.


Architecture review, October 17: references 164–170 are actual Chromium History
and Bookmarks WebUIs (AX URLs chrome://history/grouped and chrome://bookmarks),
not a combined Library. Before extending the renderer overlay further, inspect
those built-in pages in the current disposable Aux candidate. This checkout's
`chrome/browser/resources/bookmarks/command_manager.ts` already implements native
Cut/Copy/Paste, multi-selection, new tab groups and split opening; `item.css`
shows URLs only for selected rows, as reference 170 does. Its History WebUI
constructs HistoryClustersHandler and displays native By date/By group tabs.
These are source findings, not proof that the pages render or all features are
enabled in Aux. Next: open both internal URLs using the ordinary address field,
inspect native rendering/actions, then route public Library entry points to real
pages and remove replaced overlay implementations where the native path covers
them. Preserve separate Reading/Archived/Closed surfaces, Aux policy, Private
behavior and runtime-independent usability. Avoid adding another clustering or
bookmark clipboard implementation in the renderer before this investigation.

Candidate 479f5a96b remains in native linking under launcher 73597/session 88582;
ld64.lld PID 74150 was live at launcher elapsed 4m31s. No restart is warranted.


Bookmark clipboard batch (reference 170) is implemented in source. Single-row
Cut/Copy use Chromium's native bookmark clipboard format; Paste accepts native
bookmark trees or a URL, inserts after the selected row or at the current folder's
end, and refreshes the model. Paste availability refreshes on Library/window focus
and menu opening. Menus use the reference's text-only action alignment. Cut and
Paste offer Undo through native tokens. Cut retains the existing guarded removal
receipt. Undo paste checks destination child order and each inserted subtree's
identity, titles, URLs, metadata and descendants before removing anything; changed
content causes a conflict instead of overwriting subsequent work. Receipts are
bounded to 32 batches. Clipboard paste validates all data before cloning (10,000
nodes, depth 128, valid URLs), checks managed policy and destination children after
the async clipboard read, and retains document/owner guards. Clipboard contents
are not returned to the renderer. Late UI responses cannot publish into another
window. Private windows retain the native prohibition on persistent bookmarks.

Native implementation is consolidated in area patch
`chromium/patches/aux/0047-bookmark-clipboard.patch`; generated host bindings/ABI
updated. Modified profile_library, runtime_host and Library bridge objects compiled
under inherited launcher 59717 ownership. First compile caught a chained lvalue
DictValue setter; corrected to separate Set calls. Retry succeeded in 12.26s;
other changed objects had already compiled. Reverse-apply check passed.

Validation: integrated typecheck/lint and 4,648 tests / 749 files passed in 122.13s.
Final stale-response refinement passed typecheck and 18 focused UI tests; renderer
build 2.27s. Regression covers native copy source identity, row paste index and
expected children, Undo paste token dispatch, clipboard availability and foreign
window response suppression. Logs `/tmp/aux-bookmark-clipboard-check.log`,
`/tmp/aux-bookmark-clipboard-final.log`, `/tmp/aux-bookmark-clipboard-build.log`,
`/tmp/aux-bookmark-clipboard-compile{,-retry}.log`.
Native clipboard walkthrough, split-readiness fix and semantic context menus still
require consolidated app acceptance. Folder/multi-selection clipboard controls,
separate native Library routes and full Aside parity remain incomplete.

Native candidate `03e1dc20513b9441fb120b86c30459a7c4690d79` built successfully
in 9m39.11s and was verified in About (Chromium 154.0.8037.98;
ABI c791d36afba5add46ccd2945dcc37acffe88fba766bcaebe1cc626df9aaf0b75).
Launcher **59717** / session **56581** now owns app **63674**, disposable Profile
**aux-dev-R84mt4**, API `http://127.0.0.1:51978`. Keep this preview alive; do not
restart its launcher or force-clear its lock.

Native walkthrough: created synthetic Zulu and Alpha bookmarks. Sort by name
changed their order to Alpha/Zulu; Undo sort restored Zulu/Alpha. Open in new tab
group opened the saved URL and showed a named Zulu reference group with one tab.
Split action was disabled on the new-tab home surface, enabled with an actual
page active, but failed immediately after opening its new tab. The original tab
remained active, the new tab was retained, and Library reported partial failure.
This is a failed split acceptance, not a completed destination verification.
Captures in `/tmp/aux-parity-2026-10-16/`:
`aux-bookmark-sort-native-03e1dc205.png`,
`aux-bookmark-group-native-03e1dc205.png`,
`aux-bookmark-split-not-ready-native-03e1dc205.png`.

Source fix for the observed split readiness race: subscribe to catalog changes
until the returned native tab is displayable instead of rejecting its initial
blank/loading state. Bound the wait to ten seconds; cancel on originating
window/Space/active-tab changes, moved/owned/closed tabs, crash or navigation error.
Use the latest layout after readiness and preserve the opened tab on failure.
Known home-surface bookmarks are rejected before opening. Regression covers
late readiness and cancellation when the user switches tabs, in addition to
existing saved-node, moved-window/Space and partial-failure coverage.
Validation for readiness fix: typecheck/lint and 4,647 tests / 749 files passed
in 104.87s; renderer build 3.49s. Logs
`/tmp/aux-bookmark-split-readiness-check.log` and
`/tmp/aux-bookmark-split-readiness-build.log`.
This fix and context-menu commit 4da7fd878 postdate the running native candidate;
both still need native walkthrough. Clipboard and separate Library routes remain
open, and full parity remains incomplete.

Bookmark context-menu follow-up: the Library row now opens its actions on
right-click, ContextMenu or Shift+F10, and uses the shared semantic Menu surface.
Overflow ArrowDown/ArrowUp opens the first/last enabled action. Shared menu
navigation supplies arrows, Home/End, typeahead, Escape and Tab behavior; closing
returns focus to the originating row control. Disabled/selection states close
and detach row actions. Bookmark editor inputs retain their native text menus.
The previous dialog-only Popover implementation was removed.

Validation: typecheck/lint passed. The full check passed 741 suites / 4,598 tests;
seven suites failed to load dependency-cache files during overlapping Vitest
runs. Sequential retry passed all seven / 46 tests in 1.93s. A focused context-menu
regression passed (keyboard and pointer entry, disabled action skipping, End,
Escape focus return, busy dismissal and native input context preservation).
Its first run exposed jsdom's missing scrollIntoView; the test now stubs/restores
that browser API and passes without unhandled errors. Final typecheck passed;
renderer build 2.13s. Logs `/tmp/aux-bookmark-context-{check,retry,focused,types,build}.log`.
Avoid overlapping Vitest runs against the shared cache.

This follow-up postdates candidate 03e1dc205 and still needs native visual
acceptance. Current launcher 59717 / session 56581 remains live; linker 60319
confirmed active at launcher elapsed 4m27s. Do not restart or modify the compiling
native checkout. Existing native candidate still needs sort/undo and group/split
walkthrough. Corpus rescan found 182 PNGs and 192 text files (ten text-only native
menu inventories), plus six index/metadata files; no missing image assumption.
Clipboard and separate native Library routes remain open; full parity incomplete.

Bookmark menu destination batch (reference 170): source now orders Edit/Delete,
Private window, new tab group, new tab, new window and split view, with Preview
last and a separator between editing and navigation. Clipboard actions remain
missing. New group/split actions respect Labs capabilities and reject bookmarklets.
Split is disabled without an available current browser page. Both use checked
native saved-node opening in the source Space, refresh the native catalog, and
verify local human ownership before arranging the returned page. Grouping uses
existing persistent tab-folder organization; splitting uses native ACK-backed
commitSplit. Window/Space changes stop later work. Arrangement failure retains
the opened tab and reports partial success instead of closing potential user work.

Integrated typecheck/lint and 4,643 tests / 748 files passed in 94.15s. Final
menu-order/Space-guard refinement: typecheck and 21 focused tests passed (including
five destination cases); renderer build passed in 2.07s. Logs:
`/tmp/aux-bookmark-arrangements-check.log`,
`/tmp/aux-bookmark-arrangements-final.log`,
`/tmp/aux-bookmark-arrangements-build.log`.
The Vite mock has no mutable native bookmarks, so it cannot validate these actions;
native group/split and sort/undo walkthroughs remain required. No native bridge
or C++ changes in this batch. Full Aside parity remains incomplete.

Native walkthrough on October 17: the current disposable preview is verified in
Settings > General as source `79bfa144e91b062efbbbc9f9d7adf34b107593a9`,
build/ABI `c791d36afba5add46ccd2945dcc37acffe88fba766bcaebe1cc626df9aaf0b75`,
Chromium 154.0.8037.98. Launcher 52233 and app 56049 remain live with disposable
Profile aux-dev-GXRhpY; retain their cleanup ownership.

Verified in the native UI: model search has one rounded surface focus border and
no inner rectangular text outline. Created a synthetic bookmark in Bookmarks Bar;
Open in new window opened its exact saved URL in a separate window. Open in
Private window opened the same URL; expanding its sidebar exposed the Private
indicator. Closed only those two test windows. Normal History showed the normal
visit and no second visit from Private browsing (this is limited History evidence,
not a general profile-isolation audit). Selected the visit, opened the rounded
review dialog, verified Cancel was initially focused, then cancelled; the selected
visit remained. Capture:
`/tmp/aux-parity-2026-10-16/aux-history-review-native-79bfa144e.png`.
No history deletion, provider inference or owner Profile access was performed.

Sort/undo source 0e7e6689c postdates this native candidate. Background bookmark
opening, native sort/undo, batch deletion and light/narrow comparisons remain
pending. Reference 170 still requires clipboard, tab-group and split destinations
and menu-order alignment. Full parity and separate native Library routes remain
incomplete. This was a native acceptance pass; unchanged automated checks were
not repeated. Earlier process/build notes below are historical.

Native consolidation and walkthrough: `6dba6ccbba8af3285595111b1a8f2e91845db5b6`
compiled successfully in 8m22.12s and is verified in About. Launcher **4136** /
session **59138** now owns app **8559**, disposable Profile **aux-dev-9V5SsP**,
API `http://127.0.0.1:58624`. Preserve this launcher's cleanup ownership. Build log:
`/tmp/aux-memory-navigation-native.log`.

Native evidence: Memory subpages navigate correctly; browser Back returned from
Configure to Overview with an unsaved synthetic draft intact. Saved that draft,
imported and approved one synthetic note using local preview only, inspected its
formatted History document, restored it, selected the earlier revision, and
confirmed both revisions survived Settings Reload. Quick Ask's new card rendered;
Open Quick Ask launched the compact window, and Open in Aux preserved an unsent
synthetic draft. No provider inference, owner Profile or personal data was used.
Captures under `/tmp/aux-parity-2026-10-16/`:
`aux-memory-history-native-6dba.png`, `aux-quick-ask-native-6dba.png`,
`aux-quick-ask-expanded-draft-native-6dba.png`.

The walkthrough exposed a real Quick Ask startup toast: “Routing requires an
owned regular Aux window.” The link-routing boot listener drained regular-window
receipts in compact windows. It now starts only in normal, non-private windows;
native authorization remains unchanged. Four regression cases cover compact/
private exclusion and normal receipt synchronization/cleanup. A second finding:
`.memory-space-list` flex styling overrode its hidden attribute. The explicit
hidden rule now suppresses the redundant one-Space selector. The source-preview
Memory switches and hidden selector were visually verified; capture
`aux-memory-switches-vite.png`.

Validation for these fixes: integrated typecheck/lint and 4,623 tests across 743
files passed (109.63s); renderer build passed in 2.68s. Logs:
`/tmp/aux-compact-routing-check.log`, `/tmp/aux-compact-routing-build.log`.
The routing guard, hidden-selector fix and switch styling are newer than the
running native shell. The missing-toast acceptance needs later native
consolidation. Global-shortcut registration, narrow native Memory, the document
tree/metrics/retention gaps and full Aside parity remain open.

Memory control presentation (reference 077): Space memory use, extraction,
browsing memory and page-content recall now use the shared switch appearance.
Within Memory Settings, enable rows have rounded surfaces with the switch aligned
right; retention rows align their selector with the label and wrap at narrow
widths. Context section headings and spacing follow the quieter Settings
hierarchy. Pause messages now point to Configure rather than an absent control
“above.” Existing policies, command bindings and persistence are unchanged.

Validation: integrated typecheck/lint and 4,619 tests across 742 files passed
(111.66s); renderer build passed in 3.20s. Logs:
`/tmp/aux-memory-control-rows-check.log`, `/tmp/aux-memory-control-rows-build.log`.
Visual acceptance remains pending. These renderer edits are newer than the
`6dba6ccbb` native consolidation: launcher 4136/session 59138 and Siso 4392
remain live linking the framework. Do not restart the builder. The in-app browser
surface is unavailable, and the disposable Aux preview has not launched yet.

References 112/115 were also checked against ChatHistory: list/card layout,
search, active/archive and Space filters, and newest/oldest sorting already exist.
Their native visual comparison remains open; no duplicate controls were added.
Full Aside parity remains incomplete.

Native consolidation started for `6dba6ccbb` (Memory routes/history/documents
and Quick Ask): launcher **4136**, tool session **59138**, log
`/tmp/aux-memory-navigation-native.log`. The previous launcher 88765 was retired
with SIGTERM; app 95564 exited, disposable Profile `aux-dev-VQvSoS` was removed,
and its lock was released before the replacement started. Renderer and host
method generation completed; the current Siso process 4392 is compiling under
the single launcher. No replacement preview is ready yet. Continue polling this
owner/session rather than starting another builder. No native acceptance is
claimed for the consolidated source until launch and walkthrough complete.

Memory navigation pass (references 072–077): Overview, History, Context
awareness and Configure now have nested Settings-rail destinations and stable
internal routes (`memory`, `memory-history`, `memory-context`, `memory-configure`).
Settings popstate reads the subview; selecting the parent or a search result
returns to Overview. Narrow Settings renders the destinations in its horizontal
rail. The editor stays mounted across views to retain drafts. Overview contains
saved notes and review; History exposes the revision browser; Context awareness
contains browsing/page-content recall; Configure contains memory enable/use
controls. History remains available while extraction is paused. A failed pipeline
load no longer presents a misleading empty revision list.

Validation: integrated typecheck/lint and 4,619 tests across 742 files passed
(91.82s). Final focused route/Memory suites passed 41 tests after copy and loading
state refinements; final renderer build passed in 2.06s. Logs:
`/tmp/aux-memory-navigation-check.log`, `/tmp/aux-memory-navigation-final-tests.log`,
`/tmp/aux-memory-navigation-final-build.log`. Vite inspection verified the direct
Context route, switching to Configure and History, narrow navigation and the wide
nested rail. Capture: `/tmp/aux-parity-2026-10-16/aux-memory-subnav-wide-vite.png`
(pre-final copy/heading refinement). Browser back/forward behavior has route
wiring but still needs an integrated native walkthrough. Mock pipeline methods
are unavailable; no real memory settings or owner data were changed.

This removes the navigation gap, not the remaining document-tree, extraction
metrics, episodic retention or index rebuild gaps. Native consolidation is still
pending: launcher 88765 owns the existing `c7b770bfe` preview. Full parity remains
open.

Memory history presentation (reference 074): replaced the repeated full-revision
stack with a selectable revision list and one document detail pane. Dates, note
counts and source counts use existing revision data. Restore remains bound to
the selected revision through the existing scoped command, and selection falls
back to the first available revision when a refresh removes the prior one.
Below 560px content width, the bounded list stacks above the document.

Validation: `npm run check` passed typecheck, lint and 4,618 tests across 742
files (93.01s); renderer build passed in 2.26s. A regression verifies selection,
restore targeting, removed-revision fallback and the empty state. Logs:
`/tmp/aux-memory-history-check.log`, `/tmp/aux-memory-history-build.log`.
Wide/narrow rendering and revision switching were inspected using a temporary
Vite fixture with synthetic notes and a disabled Restore action; the fixture was
removed afterward. Captures: `/tmp/aux-parity-2026-10-16/aux-memory-history-wide-vite.png`
and `aux-memory-history-narrow-vite.png`. This also visually checks the shared
Memory document headings, paragraphs and lists, but is not an integrated native
Memory acceptance. The native shell remains `c7b770bfe` under launcher 88765.

Memory nested navigation, document tree and extraction metrics remain open;
the revision browser is inside the existing history disclosure. Reference rescan
still finds 380 non-thumbnail files. Full parity is not complete.

Quick Ask presentation pass (reference 103): the page now starts with a
split introduction card, compact composer illustration and the existing Open
Quick Ask action. The enable/shortcut rows form a separate rounded group; when
the shortcut is disabled its remaining row retains rounded corners. The hero
stacks below 440px content width. The illustration is decorative and uses Aux
surface/accent tokens; it does not add nonfunctional controls or claim to be a
live popup capture. Existing native shortcut registration and recorder behavior
are unchanged. Settings search retains the Quick Ask window destination.

Integrated typecheck/lint and 4,617 tests across 741 files passed. Final renderer
build passed in 2.45s after CSS refinement. Logs:
`/tmp/aux-quick-ask-card-check.log`, `/tmp/aux-quick-ask-card-final-build.log`.
The native consolidation completed at `c7b770bfe`: launcher 88765/session
10789 owns app 95564 with disposable Profile `aux-dev-VQvSoS`. Native review
confirmed rounded model-search focus without the square inner outline, provider
marks, compact model menus and readable labels that stack at narrow widths.
A synthetic paused routine showed the revised card hierarchy; its $1 spend cap
survived Settings Reload. The routine was never resumed or run. Captures:
`/tmp/aux-parity-2026-10-16/aux-model-menu-native-c7b.png`,
`aux-models-stacked-native-c7b.png`, and `aux-routine-card-native-c7b.png`.

Quick Ask was inspected in the Vite guest at wide and narrow content widths.
Its hero selectors now outrank generic compact-field rules, keeping the action
under the introduction and allowing the illustration to span the narrow card.
The CSS-only correction passed the renderer build in 2.03s; unchanged tests were
not repeated (`/tmp/aux-quick-ask-cascade-build.log`). Narrow capture:
`/tmp/aux-parity-2026-10-16/aux-quick-ask-narrow-vite.png`.
Memory document rendering and Quick Ask are newer than the native shell and
still require native consolidation; Memory visual acceptance is pending.
Full parity remains open.

Memory reference review (072, 074, 075): approved summaries, revision
summaries and selected saved notes now share formatted document rendering instead
of raw preformatted/plain text. The existing answer Markdown renderer provides
headings, lists, links and code/table presentation, skips raw HTML and substitutes
remote images rather than fetching them. Memory documents use a bounded reading
measure, quiet headings and paragraph spacing. Stored text, editing, review and
forget/restore behavior are unchanged. Visual acceptance remains pending.

Validation: typecheck/lint passed; integrated suite passed 4,616 tests with
one old `<pre>`-specific assertion failing. That assertion now checks the rendered
memory document; all five tests in its suite passed on the focused rerun. Renderer
build passed in 1.99s. Logs: `/tmp/aux-memory-document-check.log`,
`/tmp/aux-memory-document-final-tests.log`, `/tmp/aux-memory-document-build.log`.
The same native launcher 88765/session 10789 remains live linking `c7b770bfe`;
this Memory rendering change is newer than that shell and awaits visual review.

The broader Memory gap remains explicit: Aside has nested Overview/History/
Context awareness/Configure destinations and an episodic/sites/routines file tree.
Aux currently has Space notes, reviewed claims and revisions in one page. The
pipeline history contract exposes revision time, note count, summary and source
run IDs, not the extraction duration/model/token/cache/cost/file-diff records in
reference 074. Configuration exposes pipeline enablement and separate browsing
and content retention policies, not a matching episodic Never forget policy or
index-rebuild status. These require real navigation and data-model/runtime work;
renaming existing retention or refresh controls would not establish parity.

Native consolidation started for `c7b770bfe` (Models marks/menu sizing and
Routines cards). Previous launcher 75304 retired through SIGTERM; app exit and
removal of disposable Profile `aux-dev-QzFkHv` were verified before replacement.
The single active launcher is 88765, exec session 10789, log
`/tmp/aux-routines-models-consolidation.log`. Poll this handle; do not start another
builder. Pending native walkthrough: populated routine cards/Advanced controls,
model labels/provider marks/compact menus, and narrow layouts.

Routines hierarchy pass (references 083–084): My routines now has a separate
heading and Create surface. Saved routines use individual cards with title,
status and the existing human-readable schedule summary. Review, pause and
unread-result decisions stay visible; spend caps and missed-run policy move into
Advanced. A single available Space no longer shows a redundant selector;
multiple-Space selection remains available. Secondary settings retain access.

The Vite empty state and creation form were inspected. Capture:
`/tmp/aux-parity-2026-10-16/aux-routines-overview-vite.png`. Populated-card visual
acceptance remains pending native consolidation: the mock does not implement
`tasks.create`, so it cannot provide that evidence. Full parity stays open.

Integrated typecheck/lint and 4,617 tests across 741 files passed. After CSS
cascade/corner refinement and removal of redundant JSX guards, final typecheck
and renderer build passed (2.25s). Logs: `/tmp/aux-routine-cards-check.log`,
`/tmp/aux-routine-cards-final-typecheck.log`, `/tmp/aux-routine-cards-final-build.log`.

Model selector sizing follow-up: the generic compact-control cap of 160px
clipped ordinary model names after provider marks were added. Shared model
selectors now allow 210px, preserving the adjoining options button and text
ellipsis for unusually long names. The full label is available on hover.
Below a 440px Settings content width, these rows place the selector beneath the
label/description rather than compressing both columns. This narrow rule still
needs visual acceptance.

Local Vite inspection confirms Claude Haiku 4.5, Sonnet 5.5 and Opus 5.5 display
fully. Capture: `/tmp/aux-parity-2026-10-16/aux-model-label-sizing-vite.png`.
Integrated typecheck/lint and all 4,617 tests across 741 files passed.
Logs: `/tmp/aux-model-trigger-sizing-check.log` and
`/tmp/aux-model-trigger-sizing-build.log`.
Renderer build passed in 3.63s. Native shell remains `4e5fa2188`; the sizing change
and earlier provider marks/compact menu geometry await native consolidation.
Full parity remains open.

Native consolidation acceptance follow-up: the `4e5fa2188` build completed
successfully (8m21s, 26 steps). Launcher 75304 owns the live disposable preview,
app PID 81926, Profile `aux-dev-QzFkHv`; no replacement builder was started.
The earlier linking notes below are historical.

Native Settings reload preserved the paused synthetic routine's GPT-6.1 Sol
model, High thinking and completion notifications off. The routine was never
resumed or run. Image-model search filtered to GPT Image 2, and Connect opened
a focused ChatGPT setup dialog without starting authentication. Captures under
`/tmp/aux-parity-2026-10-16/`:
- `aux-routine-preferences-reloaded-native-4e5.png`
- `aux-image-search-native-4e5.png`
- `aux-chatgpt-setup-native-4e5.png`

The newer `fcc55aac0` renderer was inspected through the local Vite guest page.
Provider marks, compact image-model menu, bottom Default action, rounded search
focus and Escape focus return render correctly. Capture:
`aux-compact-image-menu-marks-vite-fcc.png`. Reference 061 was reopened for
comparison. The native shell still predates the icon/menu geometry commits;
this Vite observation is not native consolidation or runtime persistence evidence.
Task-model trigger labels truncate earlier than the reference and need a sizing
follow-up. Matching sidebar/viewport, light/narrow states and full parity remain
open. No source changed and no unchanged tests were repeated in this walkthrough.

This is the active capture-by-capture ledger for the owner's full Aux surface
review. The goal remains full visual and functional parity wherever Aux can
support the behavior, using Aux identity. This ledger supplements
[the earlier surface ledger](aside-parity.md); it does not narrow its acceptance.

## Compact Settings model menus

Model menu geometry follow-up: reopened references 011 and 061. Settings model
menus now use a separate compact 192px layout instead of the wider 280px Connect
menu. Rows use 32px minimum height, keep long model names on one truncated line,
and place Automatic/Default below the provider choices with a divider. Provider
submenus retain their existing sizing and keyboard behavior. Connect keeps its
wider account/API list. The change applies to all shared task/image selectors.

Integrated typecheck/lint and all 4,617 tests across 741 files pass; renderer build
passes in 2.75s. Logs: `/tmp/aux-model-menu-density-check.log` and
`/tmp/aux-model-menu-density-build.log`. Visual acceptance remains pending the current
native preview's return; this source is newer than its compiled `4e5fa2188` shell.
Launcher 75304/session 72707 remains live linking; no replacement builder was
started. Reference rescan still finds 380 non-thumbnail files. Full parity is open.

## Split shortcut evidence reconciliation

Reopened reference 031 and checked current registry, mount handlers and Appearance
rows. `split-side-by-side` and `split-stacked` select the right/bottom split picker
respectively; their editable shortcuts are already registered. Existing capture
files for both native orientations were located, and the later Separate-to-stacked
capture was reopened. Old “commands missing” notes are superseded. No product
source changed and no unchanged tests were rerun during this reconciliation.

Next native acceptance priorities remain routine model/reasoning persistence,
image selection and focused account-dialog behavior in the active consolidation;
then the newer provider-mark renderer. Launcher 75304/session 72707 is still live.
Full split/card parity remains open rather than being inferred from command support.

## Provider identifiers

Provider marks follow-up: bundled ten unmodified monochrome marks from
`@lobehub/icons-static-svg@1.95.1` with source/package metadata and the upstream
MIT license under `apps/shell/src/assets/model-providers`. Composer model choices,
routine model controls, shared Settings task/image selectors, provider submenus,
connected-provider rows and Connect choices now use the same decorative mark
component. Known labels are shared; unknown providers retain their text without
an invented logo. Marks inherit the surface ink and require no network requests.

Integrated typecheck/lint and all 4,617 tests across 741 files pass; renderer
build passes in 2.78s. Logs: `/tmp/aux-provider-marks-check.log` and
`/tmp/aux-provider-marks-build.log`. Visual acceptance is still OPEN: launcher 75304
and session 72707 remain live, linking the earlier `4e5fa2188` consolidation.
Do not start another builder or launch the owner's Profile. Inspect these newer
assets through Vite after the disposable native preview returns. This is source
progress, not native or full parity acceptance.

## Provider account dialogs

Provider account setup follow-up (reference 059): Connect now exposes searchable
ChatGPT, OpenRouter and Vercel account entries, plus explicitly labeled Copilot
catalog setup. Each opens a focused dialog backed by the existing sign-in
implementation. Opening a dialog does not select a different chat provider or
start consent. Local-only mode hides account entries/dialogs. Saved accounts are
filtered to the dialog's provider; pending attempts retain existing cancellation
and retirement behavior. The detailed settings editor still offers all setup flows.

Local Vite confirms provider search, focused ChatGPT content and Escape returning
focus to Connect. No sign-in was started and no credentials were accessed.
Capture: `/tmp/aux-parity-2026-10-16/aux-chatgpt-setup-vite.png`.
Reference 060 was reopened: its named-provider JSON import is not equivalent to
Aux's single OpenAI-compatible endpoint. That runtime/data-model gap remains open,
along with missing subscription adapters, branding and matched-viewport evidence.
This batch is newer than compiled native shell `286ae0c3b`.

## Image model menu follow-up

Image model menu follow-up (reference 061): the overview now uses the same
searchable provider-grouped control as task models. The shared control was
extracted into `ui/model-choice.tsx`. Image choices use the actual supported
catalog, plus Off and Default image model (which saves the current default ID).
This is not dynamic provider routing. The detailed connection editor retains its
explicit select and scoped command. No image request is made by selection.

The new failure-path test exposed menus closing when saves became pending.
Task and image pickers now distinguish pending saves from inactive/unavailable
controls, disabling choices without discarding the menu on failure. Local Vite
confirmed GPT filtering, model/Off saves, provider submenu and final layout.
Capture: `/tmp/aux-parity-2026-10-16/aux-image-model-menu-vite.png`.
This mock walkthrough does not establish runtime persistence or native acceptance.

Integrated check passed typecheck/lint and 4,615 tests; the one new failure-path
test initially failed and prompted the correction above. Final affected tests
pass all 15 cases; final typecheck and renderer build pass (2.35s). Logs:
`/tmp/aux-image-model-picker-check.log`,
`/tmp/aux-image-model-picker-final-tests.log`, and
`/tmp/aux-image-model-picker-build.log`. Settings search generation passes after
placing the shared control with UI primitives. Provider branding, subscription
setup, custom-provider composition and full viewport comparisons remain OPEN.

## Latest routine and native walkthrough

Reference 084 was reopened against the current renderer. Search filtering and
model choice, High thinking and completion opt-out work in the local Vite
walkthrough. Title/prompt fields now share the quiet dialog surface, the heading
is medium weight, and Time zone is grouped under Advanced with secondary creation
controls. Expansion exposes the actual editable timezone and retained task/review/
spend controls. Capture and validation are recorded in STATUS. No routine ran.

The consolidated native shell is now live at `286ae0c3b`, with Agents naming,
three notification choices and rounded search focus visually inspected. The newer
routine picker/thinking and form polish still require native consolidation. Exact
viewport comparisons, light/narrow views, live delivery and full parity remain
OPEN. This supersedes the older pending-link notes below. Recursive inventory
currently contains 380 non-thumbnail files; continue rescanning for additions.

## Channels audit — references 091–096

Reviewed all six captures against current source. This is an implementation gap,
not a rename of Connected services or Developers:

| Reference | Required surface/behavior | Current evidence |
| --- | --- | --- |
| 091 | Channels introduction, messenger rows with enable/manage, personal assistants | No Channels route or messenger connection collection. Connected services currently reviews Calendar and outbound MCP. |
| 092 | Add menu: Slack, Telegram, Discord | No messenger transport adapters or credential setup in runtime/contracts. The Slack skill is browser guidance, not a bot transport. |
| 093 | Per-connection Options/Pairing/Credentials dialog, thread mentions, reconnect | No matching persisted connection configuration or transport lifecycle. |
| 094 | Paired people only / Everyone access | External-agent bearer connections are task/workspace scoped developer clients, not authenticated messenger identities. These scopes cannot substitute for pairing. |
| 095 | Queue / Steer per connection | Composer follow-up preference exists, but there is no inbound thread-to-run dispatcher to apply it. |
| 096 | Paired-person list and per-person actions | No messenger pairing records, admission/revocation flow or paired-user UI. |

Source evidence: `packages/contracts/src/connectors.ts` has Calendar/MCP variants;
`apps/runtime/src/services/connectors.ts` derives those entries from existing
provider authority. `apps/shell/src/components/ExternalAgents.tsx` manages developer
clients, while `ReviewedConnectors.tsx` manages task grants for connected services.
Neither implements the reference's channel semantics. No messenger credentials
were read and no messages were sent during this audit.

Implementation order: durable messenger connections and authenticated peer pairing;
transport lifecycle/deduplication and thread-to-chat routing; per-channel mentions,
follow-up admission and reconnect; then the reference's list/add/settings/pairing
surfaces using actual runtime state. Keep Stop/Take over and existing effect review
in the run path. Add real transport-backed controls rather than enabled mock rows.
The personal-assistant cards require separate capability evidence before wiring.
All six references remain OPEN; this audit does not narrow the full parity goal.

## Routine model and delivery controls

Reference084 now has functional Model and Notifications rows in source and Vite.
Saved model-led routines have editable run preferences, with catalog loading only
when expanded. Normal/overnight starts receive the model choice, and normal,
overnight and saved-step runs capture completion delivery preference. Approval
requests remain visible. Tests cover persistence, clearing, unrelated edits,
creation retry, durable capture and completion opt-out. STATUS records evidence.
The subsequent source batch reuses the searchable provider-grouped picker and
adds persisted Auto/Low/Medium/High reasoning, including explicit non-reasoning
model handling. Typecheck/lint, recovered integrated tests and renderer build pass.
Visual/native acceptance of this newer presentation remains OPEN while the prior
native consolidation links; brand icons and broader matched-viewport comparison
are still outstanding.

## Routine notification provenance and Agents naming

Reference046 now has all three independent notification types. Runtime-assigned
routine provenance supports classification without guessing from text; routine
questions remain under Needs attention. Source and integrated tests pass; Vite confirms the three choices and independent
routine toggling. Native acceptance remains OPEN. The visible Agents title/icon now matches the
reference and search recognizes both Agents and Permissions. Existing route IDs
remain stable. This follow-up is newer than the live native shell at `6f38844cc`. The subsequent menu batch corrects trailing-edge alignment and wrapped subtitle
spacing in Vite, with compact shared popup corners and a speaker Preview icon.
Model selectors use the same trailing-edge alignment. STATUS records captures
and the passing integrated check. Native and matched-viewport acceptance remain open.

## Agent behavior follow-up

References048–049 now have functional Queue/Steer and per-tab/current-chat
preferences in the grouped Agent access card. Runtime persistence, live send
routing, draft preservation and per-tab restoration have focused regression
coverage. Vite confirms selectors and successful saves. Associations last for the
browser window session, not across browser restart. Native `6f38844cc` confirms
Steer persistence, separate unsent drafts across tabs and assistant hide/reopen,
and Keep current chat retaining the current draft. Native Bell preview completed
without an error; background delivery remains open. STATUS records captures.
Cleanup behavior and the remaining full-surface comparisons remain OPEN.

## Chat attention follow-up

References045–046 now have a compact Chat card on the agent permissions surface,
anchored notification choices, completion sound with Preview/Change and three
local tones, and the existing system-delivery/Focus Mode controls. Local Vite
confirmed selection persistence and audio activity; STATUS records validation.
The newer routine provenance batch separates routine completion filtering in
source and Vite. Native background audio acceptance, routine delivery, cleanup
and the broader Agents comparison remain OPEN.

## October 16 native consolidation

Native `80b9431f8` verifies rounded model-search focus without the inner square,
model selection persistence, grouped permission save/reload/removal, and one
rapid Separate-to-stacked-split walkthrough. STATUS records captures and preview
ownership. Full surface, viewport and phase acceptance remain open. The subsequent
permission-editor pending-save focus correction has focused regression coverage
but is not included in this native build.

## Reference handling

Reference031: Quick Ask now joins the common inline recorder and reports actual
global registration state. Extension shortcuts has a native navigation row using
Chromium's implemented /shortcuts route. Both direct split-orientation commands
and featured rows are implemented. Native `fc9df54b1` produced side-by-side and
stacked panes; `80b9431f8` later covered a rapid Separate-to-stacked transition.
The capture paths and current source were rechecked. Full shortcut-card visual,
light/narrow and accessibility comparisons remain OPEN; do not reimplement the
orientation commands based on the historical notes below.

Latest references040–041 work: Adblock is a separate compact Settings card, with
a real switch and searchable Configure menu. Configured sources open their editor;
bundled recommendations prefill a draft and retain explicit download review.
Add filter opens the same editor, whose pending writes prevent dismissal.
Local Vite checks cover grouping, search and editor opening/closing. Eleven affected
tests pass, including stale blocking reads, native refusal and keyboard search
navigation. Native acceptance, exact source catalogue/count copy, site-settings
navigation and full surface comparison remain OPEN. Capture evidence is recorded
in STATUS; this does not supersede any other open ledger requirement.

Reference folder: `/Users/rcourson/Desktop/Aside UI Reference 2026-10-16`.
The owner is adding captures while work continues. Rescan **recursively** at each
batch and before completion. Use `manifest.json`, README and reconstruction notes
when available; also discover image/text files not yet in the manifest, including unnumbered
new captures. Exclude generated thumbnails from the surface count.
Paths and labels can change as the owner organizes the folder. Identify captures
by number and compare the actual latest image before relying on previous notes.
Do not copy the reference's personal chat contents, avatars, account information
or credentials into Aux fixtures or this repository.

The folder's README explicitly identifies unconfirmed Mini popup, citation and
image lightbox attempts, partial accessibility diffs, text-only native menus,
and missing alternate-theme/live approval/error states. Those remain missing
visual evidence. Screenshot raster dimensions are not CSS measurements; normalize
density, viewport and interaction state before judging exact geometry.

## Current implementation batch

- Captures 001/003/015/023 were opened and inspected in this run. Native Aux
  Home Search → Ask and General Settings were inspected with a disposable Profile.
- 003/009/013: Model selection and thinking were hidden behind the combined
  Model and run options popover. They now have direct composer controls;
  run/execution/package/privacy controls remain in Run options. Catalog filtering,
  retry, stale-provider/window rejection and non-reasoning model handling remain.
- 015: General Settings now separates Preferences, Languages, Import and About Aux,
  followed by Aux browsing/task/recovery controls. Languages and import now open from compact rows into dialogs using the
  existing native preference/import editors. Escape returns focus, route changes
  retire the editor, and the controls mount on demand. Five focused cases pass.
  The search-engine dropdown and exact dialog composition still need closer matching.
- 112–118: Fixed Conversation's hook-order change when switching between All Chats
  and an ordinary conversation. Added a history → draft → history regression.
- Typecheck and lint pass; the integrated suite passed 4,515/4,516 tests. The
  sole failure was the unchanged coder-worktrees 60-second timeout. The new
  history transition regression passed. Combined native observations follow below.
  No full
  surface, phase, performance, accessibility or parity acceptance is claimed.

## All Chats implementation slice

References 112–117 were inspected at normalized 1712×989 size. All Chats now
uses the ordinary task composer above List/Card controls, expandable search,
filter and sort controls. List is the default, with single-line titles, actual
answer/draft excerpts and relative update times; narrow rows retain a second
excerpt line. Cards retain the existing Markdown previews and rename/archive/
delete actions. The accessible page heading remains available without a second
visual header. The history route is selected before mounting the transcript,
so it does not mount a hidden transcript owner alongside its composer.

Newest-first retains paged loading. Oldest-first uses the complete collection
producer before reversing, then reveals 40 rows at a time; partial newest pages
are never mislabeled as the oldest results. This can read all matching summaries
for oldest-first; a server-side ascending cursor would avoid that cost for very
large histories. Archive and Space filtering remain real Aux controls. Their
current grouped editor differs from the reference's Status/Projects submenu;
that comparison remains open. Project composer controls and richer preview
artifacts also remain open. Synthetic multi-page ordering and real-composer
failed-start/draft regressions were added. Typecheck and lint pass; the integrated suite passed 4,517/4,518 tests, with
only the previously recorded coder-worktrees timeout. Native acceptance is pending rebuild.

## Capture coverage

**Open** means not yet compared in this run. **Source changed** is incomplete
until the rebuilt app and interaction state are observed. **Reviewed** means
visual evidence was inspected, not that parity was established. **Aux boundary**
means account/billing/service semantics require Aux-owned equivalents rather
than fake Aside service controls. Supplemental/text-only evidence retains its
source limitations. The complete source filename and metadata live in the folder's manifest.

| ID  | Reference surface                           | Source evidence                                                                                                           | Aux review                                                      |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 001 | New tab default                             | captured                                                                                                                  | Reviewed; matching native comparison open                       |
| 002 | New tab profile menu                        | captured                                                                                                                  | Open                                                            |
| 003 | New tab ask composer                        | captured                                                                                                                  | Source changed; native comparison open                          |
| 004 | New tab routines                            | captured                                                                                                                  | Empty panel source/live renderer reviewed; native pending                                                            |
| 005 | New tab suggested tasks                     | captured                                                                                                                  | Native cards/draft action observed; full comparison open                                                            |
| 006 | Composer options dropdown                   | captured                                                                                                                  | Open                                                            |
| 007 | Composer project picker                     | captured                                                                                                                  | Native reviewed-folder selection verified; scratch creation open |
| 008 | Composer permission guard                   | captured                                                                                                                  | Open                                                            |
| 009 | Composer model picker                       | captured                                                                                                                  | Direct control implemented; visual comparison open              |
| 010 | Composer model provider row focused         | supplemental — Provider row focused; see 011 for the expanded Aside models.                                               | Open                                                            |
| 011 | Composer aside models expanded              | captured                                                                                                                  | Open                                                            |
| 012 | Composer chatgpt models expanded            | captured                                                                                                                  | Open                                                            |
| 013 | Composer reasoning effort                   | captured                                                                                                                  | Direct control implemented; visual comparison open              |
| 014 | Composer context mention                    | captured                                                                                                                  | Open                                                            |
| 015 | Settings general top                        | captured                                                                                                                  | Source changed; native comparison open                          |
| 016 | Settings search engine dropdown             | captured                                                                                                                  | Source/live dropdown reviewed; native staging pending |
| 017 | Settings new tab mode dropdown              | captured                                                                                                                  | Open                                                            |
| 018 | Settings language configuration             | captured                                                                                                                  | Draft list source/live reviewed; normalized geometry revised, native pending |
| 019 | Settings add language dropdown              | captured                                                                                                                  | Alphabetized Add picker source changed; visual/native acceptance pending |
| 020 | Settings browser import dialog              | captured                                                                                                                  | Reviewed; source selector added, composition/native acceptance open |
| 021 | Settings import browser picker              | captured                                                                                                                  | Reviewed; real source selector added, native acceptance pending |
| 022 | Settings general about section              | captured                                                                                                                  | Open                                                            |
| 023 | Settings appearance top                     | captured                                                                                                                  | Reviewed; matching native comparison open                       |
| 024 | Appearance theme dropdown                   | captured                                                                                                                  | Open                                                            |
| 025 | Appearance zoom dropdown                    | captured                                                                                                                  | Open                                                            |
| 026 | Appearance tab position dropdown            | captured                                                                                                                  | Open                                                            |
| 027 | Appearance sidebar sections dropdown        | captured                                                                                                                  | Open                                                            |
| 028 | Appearance recent chats dropdown            | captured                                                                                                                  | Open                                                            |
| 029 | Appearance tab order dropdown               | captured                                                                                                                  | Open                                                            |
| 030 | Appearance tidy tabs configuration          | captured                                                                                                                  | Open                                                            |
| 031 | Appearance keyboard shortcuts | captured | Eight featured rows implemented; native orientation shortcuts observed. Matched viewport, light/narrow and full-card comparison remain open. |
| 032 | Settings account                            | captured                                                                                                                  | Aux boundary; compare truthful Profile/usage/budget equivalents |
| 033 | Account device actions                      | captured                                                                                                                  | Aux boundary; compare truthful Profile/usage/budget equivalents |
| 034 | Settings plan and usage                     | captured                                                                                                                  | Aux boundary; compare truthful Profile/usage/budget equivalents |
| 035 | Settings plan loaded                        | captured                                                                                                                  | Aux boundary; compare truthful Profile/usage/budget equivalents |
| 036 | Plan selection dialog                       | captured                                                                                                                  | Aux boundary; compare truthful Profile/usage/budget equivalents |
| 037 | Plan selection yearly                       | captured                                                                                                                  | Aux boundary; compare truthful Profile/usage/budget equivalents |
| 038 | Buy credits dialog                          | captured                                                                                                                  | Aux boundary; compare truthful Profile/usage/budget equivalents |
| 039 | Buy credits custom input                    | captured                                                                                                                  | Aux boundary; compare truthful Profile/usage/budget equivalents |
| 040 | Settings security privacy                   | captured                                                                                                                  | Open                                                            |
| 041 | Security adblock filter dialog              | captured                                                                                                                  | Open                                                            |
| 042 | Security filter popover dismissed           | supplemental — Supplemental capture after dismissal; expanded actions are in 043.                                         | Open                                                            |
| 043 | Security filter actions expanded            | captured                                                                                                                  | Open                                                            |
| 044 | Security cookie policy dropdown             | captured                                                                                                                  | Open                                                            |
| 045 | Settings agents                             | captured                                                                                                                  | Open                                                            |
| 046 | Agents notification dropdown                | captured                                                                                                                  | Open                                                            |
| 047 | Agents default permission dropdown          | captured                                                                                                                  | Open                                                            |
| 048 | Agents followup behavior dropdown           | captured                                                                                                                  | Open                                                            |
| 049 | Agents tab switch dropdown                  | captured                                                                                                                  | Open                                                            |
| 050 | Agents cleanup tabs dropdown                | captured                                                                                                                  | Open                                                            |
| 051 | Agents file permissions section             | captured                                                                                                                  | Open                                                            |
| 052 | Agents tool permissions section             | captured                                                                                                                  | Open                                                            |
| 053 | Agents add rule dialog                      | captured                                                                                                                  | Open                                                            |
| 054 | Agents runtime section                      | captured                                                                                                                  | Open                                                            |
| 055 | Settings projects                           | captured                                                                                                                  | Open                                                            |
| 056 | Project create dialog                       | captured                                                                                                                  | Open                                                            |
| 057 | Project icon color picker                   | captured                                                                                                                  | Open                                                            |
| 058 | Settings models                             | captured                                                                                                                  | Open                                                            |
| 059 | Models connect provider dialog              | captured                                                                                                                  | Open                                                            |
| 060 | Models custom provider form                 | captured                                                                                                                  | Open                                                            |
| 061 | Models image generation dropdown            | captured                                                                                                                  | Open                                                            |
| 062 | Models image selector dismissed             | supplemental — Supplemental capture; Plugins & MCPs page is in 063.                                                       | Open                                                            |
| 063 | Settings plugins loaded                     | captured                                                                                                                  | Open                                                            |
| 064 | Plugins system skills                       | captured                                                                                                                  | Open                                                            |
| 065 | Plugins password manager skills             | captured                                                                                                                  | Open                                                            |
| 066 | Plugins import actions                      | captured                                                                                                                  | Open                                                            |
| 067 | Settings mcps                               | captured                                                                                                                  | Open                                                            |
| 068 | Mcp connect dialog                          | captured                                                                                                                  | Open                                                            |
| 069 | Mcp transport dropdown                      | captured                                                                                                                  | Open                                                            |
| 070 | Mcp authentication dropdown                 | captured                                                                                                                  | Open                                                            |
| 071 | Mcp advanced settings                       | captured                                                                                                                  | Open                                                            |
| 072 | Settings memory                             | captured                                                                                                                  | Open                                                            |
| 073 | Memory overview                             | captured                                                                                                                  | Open                                                            |
| 074 | Memory history                              | captured                                                                                                                  | Open                                                            |
| 075 | Memory configuration                        | captured                                                                                                                  | Open                                                            |
| 076 | Memory retention dropdown                   | captured                                                                                                                  | Open                                                            |
| 077 | Settings context awareness                  | captured                                                                                                                  | Open                                                            |
| 078 | Settings passwords                          | captured                                                                                                                  | Open                                                            |
| 079 | Passwords vault getting started             | captured                                                                                                                  | Open                                                            |
| 080 | Passwords 1password menu                    | captured                                                                                                                  | Open                                                            |
| 081 | Passwords external manager picker           | captured                                                                                                                  | Open                                                            |
| 082 | Passwords other managers expanded           | captured                                                                                                                  | Open                                                            |
| 083 | Settings routines                           | captured                                                                                                                  | Direct route source/live renderer reviewed; native pending                                                            |
| 084 | Routine create form                         | captured                                                                                                                  | Prompt creation implemented; native and exact anatomy pending                                                            |
| 085 | Routine repeat dropdown                     | captured                                                                                                                  | Open                                                            |
| 086 | Routine time picker                         | captured                                                                                                                  | Open                                                            |
| 087 | Routine advanced form                       | captured                                                                                                                  | Open                                                            |
| 088 | Routine type dropdown                       | captured                                                                                                                  | Open                                                            |
| 089 | Routine environment dropdown                | captured                                                                                                                  | Open                                                            |
| 090 | Routine permission dropdown                 | captured                                                                                                                  | Open                                                            |
| 091 | Settings channels                           | captured                                                                                                                  | Open                                                            |
| 092 | Channels add menu                           | captured                                                                                                                  | Open                                                            |
| 093 | Channel slack settings                      | captured                                                                                                                  | Open                                                            |
| 094 | Channel access dropdown                     | captured                                                                                                                  | Open                                                            |
| 095 | Channel followup dropdown                   | captured                                                                                                                  | Open                                                            |
| 096 | Channel pairing tab                         | captured                                                                                                                  | Open                                                            |
| 097 | Settings developers                         | captured                                                                                                                  | Open                                                            |
| 098 | Developers cli options menu                 | captured                                                                                                                  | Open                                                            |
| 099 | Developers skill install menu               | captured                                                                                                                  | Open                                                            |
| 100 | Developers mcp setup popover                | captured                                                                                                                  | Open                                                            |
| 101 | Developers remote control popover           | captured                                                                                                                  | Open                                                            |
| 102 | Developers faqs expanded                    | captured                                                                                                                  | Open                                                            |
| 103 | Settings mini popup                         | captured                                                                                                                  | Open                                                            |
| 104 | Mini popup shortcut attempt settings remain | supplemental — The shortcut did not expose the live mini popup. This is its settings page.                                | Open                                                            |
| 105 | Settings lasso                              | captured                                                                                                                  | Open                                                            |
| 106 | Lasso hotkey dropdown                       | captured                                                                                                                  | Open                                                            |
| 107 | Lasso add shortcut dialog                   | captured                                                                                                                  | Open                                                            |
| 108 | Lasso shortcut action dropdown              | captured                                                                                                                  | Open                                                            |
| 109 | Settings archived chats                     | captured                                                                                                                  | Open                                                            |
| 110 | Feedback menu                               | captured                                                                                                                  | Open                                                            |
| 111 | Archived chat actions                       | captured                                                                                                                  | Open                                                            |
| 112 | All chats page                              | captured                                                                                                                  | Source changed; native list/card/search/sort comparison pending              |
| 113 | All chats loaded                            | captured                                                                                                                  | Source changed; native list/card/search/sort comparison pending              |
| 114 | Chats filter dropdown                       | captured                                                                                                                  | Source changed; native list/card/search/sort comparison pending              |
| 115 | Chats sort dropdown                         | captured                                                                                                                  | Source changed; native list/card/search/sort comparison pending              |
| 116 | Chats search expanded                       | captured                                                                                                                  | Source changed; native list/card/search/sort comparison pending              |
| 117 | Chats card view                             | captured                                                                                                                  | Source changed; native list/card/search/sort comparison pending              |
| 118 | Chat detail open                            | captured                                                                                                                  | All Chats transition fixed; visual comparison open              |
| 119 | Chat header actions                         | captured                                                                                                                  | Open                                                            |
| 120 | Chat share popover                          | captured                                                                                                                  | Open                                                            |
| 121 | Chat sidebar expanded                       | captured                                                                                                                  | Open                                                            |
| 122 | Chat sidepanel add menu attempt             | supplemental — The state inventory exposes Side chat; the overlay is not clearly visible in the PNG.                      | Open                                                            |
| 123 | Chat new side chat                          | captured                                                                                                                  | Open                                                            |
| 124 | Chat work log expanded                      | captured                                                                                                                  | Open                                                            |
| 125 | Chat citation attempt scrolled transcript   | supplemental — The citation button was targeted, but a citation popover was not visually confirmed.                       | Open                                                            |
| 126 | Chat inline image reference                 | captured — Inline screenshot in a chat; an image lightbox was not visually confirmed.                                     | Open                                                            |
| 127 | Browser tab search                          | captured                                                                                                                  | Open                                                            |
| 128 | Browser workspace profile menu attempt      | supplemental — Supplemental native menu attempt. Use 160–163 for visually confirmed profile menus.                        | Open                                                            |
| 129 | Browser profile actions attempt             | supplemental — Supplemental native menu attempt. Use 160–161 for profile actions.                                         | Open                                                            |
| 130 | Browser sidebar collapsed                   | captured                                                                                                                  | Open                                                            |
| 131 | Browser sidebar collapsed clean             | captured                                                                                                                  | Open                                                            |
| 132 | Browser downloads popover                   | captured                                                                                                                  | Open                                                            |
| 133 | Browser extensions popover                  | captured                                                                                                                  | Open                                                            |
| 134 | Browser address bar focused                 | captured                                                                                                                  | Open                                                            |
| 135 | Browser bookmark all tabs dialog            | captured                                                                                                                  | Open                                                            |
| 136 | Menubar aside                               | text only — Full native menu inventory, including nested menus. The window capture API could not capture this macOS menu. | Open                                                            |
| 137 | Menubar file                                | text only — Full native menu inventory, including nested menus. The window capture API could not capture this macOS menu. | Open                                                            |
| 138 | Menubar edit                                | text only — Full native menu inventory, including nested menus. The window capture API could not capture this macOS menu. | Open                                                            |
| 139 | Menubar view                                | text only — Full native menu inventory, including nested menus. The window capture API could not capture this macOS menu. | Open                                                            |
| 140 | Menubar history                             | text only — Full native menu inventory, including nested menus. The window capture API could not capture this macOS menu. | Open                                                            |
| 141 | Menubar bookmarks                           | text only — Full native menu inventory, including nested menus. The window capture API could not capture this macOS menu. | Open                                                            |
| 142 | Menubar profiles                            | text only — Full native menu inventory, including nested menus. The window capture API could not capture this macOS menu. | Open                                                            |
| 143 | Menubar tab                                 | text only — Full native menu inventory, including nested menus. The window capture API could not capture this macOS menu. | Open                                                            |
| 144 | Menubar window                              | text only — Full native menu inventory, including nested menus. The window capture API could not capture this macOS menu. | Open                                                            |
| 145 | Menubar help                                | text only — Full native menu inventory, including nested menus. The window capture API could not capture this macOS menu. | Open                                                            |
| 146 | Browser sidebar restored                    | captured                                                                                                                  | Open                                                            |
| 147 | Browser tabs section hover                  | supplemental — Section hover state; a context menu was not visibly opened.                                                | Open                                                            |
| 148 | Browser bookmarks section hover             | supplemental — Section hover state; a context menu was not visibly opened.                                                | Open                                                            |
| 149 | Browser pinned tab hover                    | supplemental — Pinned shortcut hover state; a context menu was not visibly opened.                                        | Open                                                            |
| 150 | Browser tab context inventory with window   | supplemental — Native tab context menu is present in the text inventory but omitted from the window screenshot.           | Open                                                            |
| 151 | Chat first work log expanded                | captured                                                                                                                  | Open                                                            |
| 152 | Chat work trace visible                     | captured                                                                                                                  | Open                                                            |
| 153 | Chat tool activity expanded                 | captured                                                                                                                  | Open                                                            |
| 154 | Chat tool call details                      | captured                                                                                                                  | Open                                                            |
| 155 | Chat new empty                              | captured                                                                                                                  | Open                                                            |
| 156 | Chat skill mention picker                   | captured                                                                                                                  | Open                                                            |
| 157 | Chat composer options                       | captured                                                                                                                  | Open                                                            |
| 158 | Browser profile open error dialog           | captured — Actual error shown after New profile created the empty Profile 1.                                              | Open                                                            |
| 159 | Browser fresh profile onboarding            | captured                                                                                                                  | Open                                                            |
| 160 | Browser profile edit menu                   | captured                                                                                                                  | Open                                                            |
| 161 | Browser profile actions current             | captured                                                                                                                  | Open                                                            |
| 162 | Browser profile switcher visible            | captured                                                                                                                  | Open                                                            |
| 163 | Browser history submenu                     | captured                                                                                                                  | Open                                                            |
| 164 | Browser history page                        | captured                                                                                                                  | Open                                                            |
| 165 | History group view                          | captured                                                                                                                  | Open                                                            |
| 166 | History item actions                        | captured                                                                                                                  | Open                                                            |
| 167 | Browser bookmarks submenu                   | captured                                                                                                                  | Open                                                            |
| 168 | Browser bookmark manager                    | captured                                                                                                                  | Open                                                            |
| 169 | Bookmarks organize menu                     | captured                                                                                                                  | Open                                                            |
| 170 | Bookmark item actions                       | captured                                                                                                                  | Open                                                            |
| 171 | Browser advanced security                   | captured                                                                                                                  | Open                                                            |
| 172 | Browser settings profile                    | captured                                                                                                                  | Open                                                            |
| 173 | Browser settings autofill                   | captured                                                                                                                  | Open                                                            |
| 174 | Browser settings privacy                    | captured                                                                                                                  | Open                                                            |
| 175 | Browser settings performance                | captured                                                                                                                  | Open                                                            |
| 176 | Browser settings appearance                 | captured                                                                                                                  | Open                                                            |
| 177 | Browser settings search engine              | captured                                                                                                                  | Open                                                            |
| 178 | Browser settings default browser            | captured                                                                                                                  | Open                                                            |
| 179 | Browser settings startup                    | captured                                                                                                                  | Open                                                            |
| 180 | Browser settings languages                  | captured                                                                                                                  | Open                                                            |
| 181 | Browser settings downloads                  | captured                                                                                                                  | Open                                                            |
| 182 | Browser settings accessibility              | captured                                                                                                                  | Open                                                            |
| 183 | Browser settings system                     | captured                                                                                                                  | Open                                                            |
| 184 | Browser settings reset                      | captured                                                                                                                  | Open                                                            |
| 185 | Browser third party cookies                 | captured                                                                                                                  | Open                                                            |
| 186 | Browser site settings top                   | captured                                                                                                                  | Open                                                            |
| 187 | Browser location permission page            | captured                                                                                                                  | Open                                                            |
| 188 | Browser camera permissions                  | captured                                                                                                                  | Open                                                            |
| 189 | Browser microphone permissions              | captured                                                                                                                  | Open                                                            |
| 190 | Browser notification permissions            | captured                                                                                                                  | Open                                                            |
| 191 | Browser embedded content permissions        | captured                                                                                                                  | Open                                                            |
| 192 | Browser javascript permissions              | captured                                                                                                                  | Open                                                            |

## Concrete next comparisons

These are differences to resolve against the full-size captures, not accepted
exceptions or a replacement for the complete table above.

- **Home, 001–005:** compare the whole content rhythm at a matching viewport,
  recent-card density, empty Routines, and the suggested-task reveal control.
  Aux currently limits starter suggestions to fresh Ask drafts; the reference
  has a separate reveal control beside existing recent work.
- **Composer, 006–014:** expose the actual reviewed Project choice near the
  confirmation control; compare the Add/options menu, provider submenus and
  direct thinking menu. Aux currently supports Auto/Low/Medium/High; the source
  also shows Extra High, Max, Ultrabrowse and Fast mode. Do not add inert choices
  or imply unsupported provider/run semantics.
- **General, 015–022:** compare the search-engine dropdown, selected-language
  summary, compact card group spacing, language editor and browser-import source
  picker. A compact dialog wrapper does not prove its contained editor matches.
- **Appearance, 023–031:** compare the complete option sets, actual thumbnail
  assets, tab insertion provenance, Tidy Tabs prompt and shortcut recorder.
- **Chats, 112–126 and 151–157:** compare list/card/filter/sort/search, full and
  side chat layouts, work traces, nested tool details and source previews. The
  history transition fix establishes stability only, not visual parity.
- Continue through agents, projects/models, skills/MCPs, memory/passwords,
  routines/channels, developers/capture, browser chrome/libraries and native
  settings using every remaining table entry. Keep the older ledger's empty,
  error, unavailable-runtime, focus and narrow-window checks in scope.


## Owner focus correction and first native candidate

The owner supplied a focused model-search screenshot showing a thick rectangular
inner input outline. The normal-contrast `.aux-native-dialog input:focus-visible`
override was drawing over component styling. Search controls now share one thin,
rounded focus surface; their inner text inputs omit the second outline. The
change covers model, Settings, rail/history, downloads, routines, memory, Spaces,
overview and results searches. Forced-color indicators are preserved.

The first native candidate built in 25 steps / 10m05.65s. Home Ask exposes model,
thinking and Run options directly. The actual catalog opened, filtering GPT-6.1
Sol showed its available choices, and selecting a model returned to the composer.
The thinking menu opened with Auto/Low/Medium/High; selection was not accepted as
verified after the automation reported a window change. All Chats opened without
React #310. The browser toolbar disappearing on that screen was observed and its
hiding rule removed. The first candidate predates this focus/toolbar correction
and compact dialogs; their combined native acceptance remains open.

Accepted local baseline images (viewed this run):
`/tmp/aux-parity-2026-10-16/aux-home-ask-candidate.png` and
`/tmp/aux-parity-2026-10-16/aux-model-filter-candidate.png`, both 2400×1922.
These are a different viewport and empty-profile state from the reference's
3424×1978 Home captures. They establish available controls, not exact geometry,
color, responsive or full-parity acceptance.


## Combined native observation — source c612736f5

The final combined build succeeded in 25 steps / 8m55.10s, with 207 renderer
assets, 273 methods / 30 events (`cce8203bcbd0`) and Node 26.9. The disposable
preview remains running under its launcher's normal cleanup ownership.

- Focus correction: inspected `/tmp/aux-parity-2026-10-16/aux-model-search-final.png`
  and the combined `model-focus-comparison.png`. The owner's original crop and
  revised crop are both 426×116, unscaled, with an empty focused model search.
  The former inner rectangle is gone; a thin rounded search surface remains.
- General: inspected `aux-general-final.png`. Compact language and import
  entries are present; actual controls remain available in their dialogs.
- Languages: inspected `aux-languages-final.png`. Current disposable languages
  loaded; Escape closed the dialog and focused the Preferred languages trigger.
- Import: inspected `aux-import-final.png`. Entry/information/recovery controls
  fit in the dialog. Escape focused the Import browser data trigger. No source
  discovery, owner Profile import or file selection was started.
- Chats: `aux-history-toolbar-final.png` records the toolbar surviving All Chats.
  Native sidebar navigation opened a new chat; a synthetic draft survived a
  subsequent round trip through All Chats and was then cleared without sending.
  The current native log has no React #310 during these actions.

These observations close the named interaction defects and owner focus correction
for the observed states. They do not close exact reference parity for the whole
Home/Settings/chat families, nor the complete ledger's remaining native states.


## All Chats native observations — source 68affeb44

The candidate built in **25 steps / 8m39.01s**, with 206 renderer assets,
273 methods / 30 events (`cce8203bcbd0`) and Node 26.9. It launched in a new
disposable Profile. The ordinary composer appears above the List/Card toolbar.
Search expands and dismisses; sort opens with checked Newest/Oldest choices,
Oldest selection returns focus to its trigger. Card view retained the saved
synthetic conversation and its rename/archive/delete menu; Escape returned
focus. Archive filtering produced the correct empty state and returned focus.
An unsent synthetic draft survived Card → List and was cleared without sending.

Evidence under `/tmp/aux-parity-2026-10-16/`: `aux-history-layout-68affeb.png`,
`aux-history-search-68affeb.png`, `aux-history-sort-68affeb.png`,
`aux-history-list-populated-68affeb.png`, `aux-history-card-68affeb.png`, and
`aux-history-filter-68affeb.png`. These are 2400×1922 native captures, with a
different viewport and synthetic data from the 3424×1978 reference. No exact
pixel-parity pass is claimed.

The walkthrough **did not pass full acceptance**. The composer options remain
outside the rounded input card; reference 112 puts them inside one card. The
browser toolbar occupies space but its controls fade out on internal surfaces;
the reference keeps them visible. The filter editor differs from Status/Projects.

A real synthetic prompt failed before any model call with “This page could not
be read”. Read-only inspection through the disposable runtime SDK confirmed
empty explicit `pageIds` and `contextPageRefs`. The implicit window/Space source
collector nevertheless prepared the internal New Tab page's native reader,
which correctly refused it. The runtime correction excludes non-website and
credential-bearing URLs only from implicit window context; explicit/restored
source checks stay strict. Five regression inputs cover New Tab, Aux internals,
blank pages, file URLs and credential-bearing addresses. Its rebuilt runtime
and native follow-up are pending; this must not be reported as a successful AI
reply yet.

The next Home batch can use the original unbranded card background assets found
in R5: `1-C1ScKAAP.webp`, `2-CvTUY-kA.webp`, `3-BeB6e1fn.webp`. Capture 005 shows
expandable Suggested tasks beneath Recent work, including existing-user states.
The current first-chat-only text buttons do not match that surface.


### Runtime-only follow-up — source bbcce77c3

The original disposable preview retired normally (launcher exit 0). Runtime-only
staging checked the compiled 273-method / 30-event ABI, then launched a fresh
temporary Profile. The same ordinary All Chats send path completed with the
exact synthetic reply and no page scope. Native transcript evidence:
`aux-page-free-reply-bbcce77.png`. The runtime SDK confirmed completed status,
zero page IDs and one gateway model call. Typecheck/lint pass, with 4,522/4,523
unit cases passing; only the existing coder-worktrees timeout remains.

The completed-row capture `aux-history-completed-excerpt-bbcce77.png` exposes
another actual gap: `previewText` reads only `result.answer`, whereas this real
completion uses `result.report`, so the list shows “Done”. Repo conversation
search likewise omits report text. `StepTimeline` also labels an initial
empty-step task as “Reading the page” even when no page is attached. Fix these
alongside the remaining composer/card and internal-toolbar presentation gaps.
The current renderer is still source 68affeb44; the runtime is bbcce77c3.


## Presentation follow-up — current source, native rebuild pending

All Chats now passes its actual control row into the same rounded ComposerFrame
surface. Home and ordinary reply composers keep the below-card layout shown in
005/155. Internal surfaces keep their toolbar controls visible without hover;
loaded website toolbar behavior is unchanged. The history List/Card control now
uses the reference's compact rounded-rectangle shape. The live Vite renderer was
opened in the owned disposable native browser, and the unified card was inspected
with the mock sidebar hidden to use the available main-column width. Evidence:
`aux-history-contained-live-renderer.png` in the existing `/tmp` evidence folder.
This proves the observed renderer anatomy only: the nested preview uses mock data
and an older native outer frame, with unmatched viewport/state. It is not native
acceptance of a compiled renderer or a full-window parity comparison.

The renderer now reads both `result.answer` and `result.report` for previews,
keeping unsent drafts first. Repo conversation search also matches report text
in earlier turns while retaining current title, Space and archive semantics.
The initial empty-step timeline says “Preparing this request”, with no invented
page-read claim. New report preview/search cases and the composer containment
regression pass. Runtime dist was rebuilt first. Typecheck/lint pass and
4,524/4,525 cases across 728 files passed; the sole failure remains the existing
coder-worktrees timeout. The latest source is not yet staged into the native app.

The mock populated list reveals raw Markdown headings/table syntax in single-line
excerpts; implement a proper plain-text projection while retaining rich Card
previews. The outer native floating sidebar also stayed visible when focus moved
into its web content; that transition needs investigation. Neither is accepted
as parity. Reference rescan remains 182 original images / 192 manifest entries.


## Plain list excerpts — live renderer observed

List rows now project the rich answer's Markdown AST into text, instead of
showing source headings/table fences. Draft text remains exact and rich Card
previews retain their Markdown/table/code rendering. The shared parser is loaded
on demand, uses the same GFM grammar as the answer renderer and limits teaser
input to 4,096 characters. Direct dependency pins reuse existing locked unified /
remark-parse versions; no new transitive package versions were introduced.
Tests cover table and link text, escaped literal punctuation, code, image alt,
block/hard-break boundaries and omitted HTML/reference/footnote definitions.

A fresh mock renderer load in the disposable native browser showed the parsed
list text in its accessibility tree and screenshot. Card view still rendered the
table and code preview. Evidence: `aux-history-plain-excerpts-live.png` and
`aux-history-rich-cards-live.png` in `/tmp/aux-parity-2026-10-16/`. This is nested
live-renderer/mock evidence with unmatched viewports, not native full-product
acceptance. DevTools reported a failed Vite WebSocket; after dependency changes,
reload and inspect actual rendered state rather than treating HMR logs as proof.

Typecheck and lint pass. The integrated suite passed 4,527/4,528 tests across
729 files; only the existing coder-worktrees 60-second timeout failed. A production
renderer build passed in 2.10s. Its manifest shows the text projection and parser
chunks outside both the entry and App static closures. The compiled/staged native
app remains renderer 68affeb44 / runtime bbcce77c3 until the next combined build.


## Home suggested tasks — source and live renderer

Reference 005 now has an Aux counterpart: expandable cards, original unbranded
backgrounds and filled icons, draft-only memory/routine actions, and a real
Skills & MCP Settings destination. Cards stay available for returning users and
persist a versioned presentation preference; private Profiles neither read the
preference nor show cards. Existing durable drafts and browser-context selection
survive insertion, including rail handoff. Removed the replaced onboarding strip
and its unused contract constant. Approval/secrets boundaries remain in Aux copy.

Asset mapping in `apps/shell/public/suggestions`: memory/routines/customize WebP
are supplied assets `1-C1ScKAAP.webp`, `2-CvTUY-kA.webp`, `3-BeB6e1fn.webp` from
`~/AI Blueprints/06/assets/live-1.0.928/agent-manager-live-1.26.1004/assets/`.
White SVG geometry is unchanged from onboarding-helper's V/K icons and tag-icon's
Q icon. No reference account/chat information was copied.

Live renderer/mock inspection inside the disposable native app verified three
cards, draft insertion/focus without a send, and Customize reaching Skills & MCP.
Evidence: `aux-home-suggestions-live.png` and `aux-home-suggestion-draft-live.png`
in `/tmp/aux-parity-2026-10-16/`. Viewports remain unmatched; no pixel/native parity
claim. 37 focused checks pass. Integrated typecheck/lint pass, 4,531/4,532 tests
across 730 files pass; existing coder-worktrees timeout remains. Combined native
build and narrow-layout acceptance remain pending.


## Combined native candidate — 02316f6b8

Full incremental build succeeded: 26 steps / 9m05.51s, 214 renderer assets,
273 methods / 30 events (`cce8203bcbd0`), rebuilt runtime and Node 26.9. Old
preview retired normally before building; new launcher owns the plain lock and
fresh `aux-dev-iy88v8` disposable Profile. No real Profile was touched.

Native inspection showed rounded model-search focus without the inner rectangle,
Home's three supplied-art cards and memory prompt insertion with focus but no
send. Cleared that draft before one synthetic All Chats request: “Reply with the
number of days in a week, spelled out in English.” Runtime SDK read confirmed
completed report `seven`, `pageIds: []`. The native List row showed `seven`, and
searching `seven` matched the conversation although that word is absent from its
question/title. Initial activity said Preparing this request. The All Chats
composer contained its controls and internal toolbar buttons remained visible.

Screenshots in `/tmp/aux-parity-2026-10-16/`:
`aux-model-focus-native-02316.png`, `aux-home-cards-native-02316.png`,
`aux-home-draft-native-02316.png`, `aux-reply-native-02316.png`,
`aux-report-search-native-02316.png`. This verifies the stated native behaviors;
it is not matched-viewport or complete product parity. Narrow Home layout,
remount persistence, customization's native destination and remaining ledger
surfaces still require observation. Reference rescan: unchanged 182 original
images / 192 manifest entries, latest capture 192 JavaScript permissions.


## Home Routines and narrow cards — source/live renderer

Reference 004 inspected at its supplied 2048×1183 raster. Home's empty Routines
panel now has a centered 32px icon tile, No routines heading, Aux explanation,
264px minimum height and dashed rounded edge. Removed the inline Create a task
button; All Routines retains the existing real Tasks-manager action, confirmed by
a mounted interaction regression and live navigation. That manager currently
calls the routine section Skills and does not land directly on it: the manager
route/naming are still open parity gaps, not accepted equivalents.

A 1514×1534 native window (~757×767 CSS) exposed overly tall single-column
suggestion cards. Below the 520px Home container width, cards now use content
height with a 264px minimum, preserving original art and actions. Fresh Vite
renderer inspection inside the native app showed compact cards and the complete
routine panel. Removed the stale `.home-empty span { display:none }` rule that
initially hid the icon. Other empty-task controls remain intact.

Evidence: `aux-routines-empty-live.png` and `aux-home-cards-narrow-live.png` in
`/tmp/aux-parity-2026-10-16/`; old compiled narrow baseline is
`aux-home-narrow-before-02316.png`. Latest changes await a combined native build;
this is current renderer/mock evidence. Typecheck/lint pass, 4,532/4,533 tests
across 730 files pass (only unchanged coder-worktrees timeout). Final renderer
production build passed 1.87s; cosmetic CSS correction followed the suite and was
checked by fresh rendering/build, without repeating unchanged unit tests.

Additional compiled 02316f6b8 checks passed before switching to Vite: Customize
opened Skills & MCP and explicit expansion survived the Settings round trip.
Previous goal turn made authoritative progress with source changes, local commits,
and native evidence; this turn adds empty-state/responsive corrections and
resolves those two outstanding native observations. Full parity remains open.


## Direct Routines route and prompt creation — source/live renderer

Inspected original captures 083/084. Home's All Routines action now goes directly
to Settings → Routines (`/settings/routines`) rather than Tasks/Skills. Renamed
and replaced the Automations Settings component and route; updated Settings rail,
feature navigation, budget destination, generated search and mocks. The existing
Labs automations capability gate is preserved. My routines/Create now lead the
page; scan preferences and overnight review remain below. On-demand definitions
are listed too, so All Routines does not omit Home's manual entries.

Creation accepts Title and Prompt. It saves a real task with an editable manual
review criterion, then creates a paused routine bound to that task/revision.
Daily at 09:00 is the default. Advanced retains existing reviewed-task selection,
Calendar grants and model spend cap. No run or activation occurs on creation.
After a routine-save failure, retry reuses the same task; an error explains that
the task was saved. This is not a claim of transport-level idempotency for an
unknown routine-create outcome. Reopening the page follows Home's preferred
Space; scoped display hides the previous Space during loading. Regression checks
cover retry, paused payload, exact source criteria, manual entries and Space handoff.

Live renderer inside the disposable native browser verified the route, Create
row, prompt dialog and dismissal, without submitting synthetic routines there.
Screenshots in the existing `/tmp` evidence folder:
`aux-routines-settings-live.png`, `aux-routines-settings-wide-live.png`,
`aux-routine-create-wide-live.png`. Native staging and a real paused-create check
remain pending. Form still differs visibly: its day controls/time zone/trigger
editor need compact Repeat/Time anatomy, and references 085–090 require further
control/capability comparison. Routine-specific model/notification/remote
execution semantics must be real Aux capabilities before corresponding controls
can be accepted. Existing 200-item Settings listing needs pagination comparison.

Final serialized `npm run check`: typecheck/lint pass, 4,535/4,536 tests across
730 files pass; only known coder-worktrees timeout. The earlier concurrent
focused/full run hit a missing Vitest dependency-cache chunk; the final serialized
full run passed that suite. Final presentation ordering/close button was then
checked with typecheck, production renderer build (3.06s) and 20 focused cases.
Reference rescan unchanged: 182 originals / 192 manifest entries. Previous goal
turn made source/commit/rendering progress; this turn changes route and actual
creation behavior. Full goal remains active and unproven.


## Compact routine timing — source; native build still ffb87541f

Inspected references 085 and 087–090. Replaced the exposed preset/day controls with
Repeat choices: Interval, Daily, Weekdays, Weekly and Custom, plus Aux's selected-
day/event triggers. Every choice produces its real monitor/schedule/rrule payload.
Weekly uses an explicit weekday. Existing selected-day schedules retain their
exact days and time zone. Time-zone and clock-change details are collapsed.
Advanced source/review/cap fields are below timing, Cancel/Create share actions,
and the dialog initially focuses Title. Inputs can be scheduled before the prompt
is complete, while submit remains disabled; the submit handler also enforces
busy/readiness and Calendar/day validity. No replacement shim or placeholder API.

15 focused cases passed, including Weekly payload, preserved time zone and refused
premature submit. Integrated typecheck/lint pass; 4,537/4,538 tests across 730 files
pass (only known coder-worktrees timeout). Renderer production build passed 2.74s.
Later changes only move shared action CSS, round the Time row and set initial
Title focus; final native/live rendering remains required. The one live native
builder is compiling the previously staged **ffb87541f**, not this compact source.
Its log is `/tmp/aux-routines-consolidated-native.log`, launcher session 18842.

Advanced references reviewed, still open:
- 088: Aside offers Standalone / Runs in task. Aux creates a task-backed paused
  routine and can choose an existing saved task. Exact standalone semantics need
  an explicit runtime implementation; the present binding is not full parity.
- 089: the capture only offers This computer. Aux scheduled routines run locally
  while open. Broader cloud/remote options are not evidenced in that screenshot.
- 090: Read only / Guard / Full access. Aux preserves task grants, scheduled-write
  review and activation checks. Its current routine contract has no equivalent
  per-routine permission enum; do not pretend the modes are interchangeable.
- 084/087: the later routine preferences batch adds persisted model/notification
  controls, launch wiring and focused validation. Native acceptance and exact
  model/reasoning menu presentation remain open.
- 086: native Time input exists, but the exact reference popup still needs a
  matched interaction comparison. Custom recurrence UI also remains to compare.


## Native route/paused creation and current compact renderer evidence

The single builder completed **ffb87541f**: 25 steps / 9m06.46s, 215 renderer
assets, 273 methods / 30 events (`cce8203bcbd0`), runtime and Node 26.9 staged.
Launcher PID 1327/session18842 remains owner of its live disposable preview
(app PID6044, `aux-dev-gLF8IT`). Old preview cleanup completed normally first.

Observed compiled Home's centered empty Routines panel and All Routines opening
Settings → Routines directly. UI entered synthetic title “Aux routine parity
check” and prompt “Return the words: synthetic routine review. Do not browse or
change anything.” Create saved a paused routine. Scoped SDK reads confirmed:
- `paused: true`, daily09:00, America/Chicago, days0–6;
- bound source task revision1 matches actual task revision1;
- exact matching criterion `routine-output`, manual verification;
- zero routine occurrences and zero agent runs. No model call or activation.
Returning Home showed the actual Paused routine card. Native screenshots:
`aux-routines-empty-native-ffb875.png`, `aux-routine-paused-native-ffb875.png`.
Native compact timing remains unverified because that candidate predates00c737815.

Loaded the current Vite Settings route freshly inside that native browser and
inspected00c737815's form: compact Daily/Time rows, Title initially focused,
Repeat usable before prompt entry, Weekly exposes weekday, incomplete Create stays
disabled. Dismissed without creating another routine. Screenshots:
`aux-routine-compact-live-00c737.png`, `aux-routine-weekly-live-00c737.png` in the
same evidence folder. This is current renderer/mock evidence and unmatched
viewports, not native acceptance or pixel parity. Final typecheck passed after
shared-action CSS placement, Time row rounding and initial-focus adjustments.
Previous goal turn made source/commit progress; this turn added compact controls,
regressions, local commit00c737815 and native/runtime/live-renderer evidence.
Full goal remains active; no phase completion or full acceptance is claimed.


## Composer Project picker — source and error-route rendering

Inspected reference007's Project menu: Projects header, Use an existing folder,
Start from scratch. Aux now exposes Project directly beside Ask first, before
model controls. On demand it lists reviewed writable, unarchived, unchanged
folders from the current Space. Automatic explicitly retains the existing runtime
behavior (use the only reviewed writable root if available); it is not labeled
No project because that would misrepresent the runtime fallback. Selection only
changes the ordinary composer preference; it never starts a run or grants access.
Removed the replaced Project select and folder query from Run options.

The popover loads only when opened, supports keyboard list focus, Retry and an
explicit unavailable-selection message, preserves the selected root on failures,
retires on Space/draft/window identity changes, omits private-Profile controls and
disables local projects for cloud runs. Use an existing folder opens the actual
Projects Settings review editor; it now prefers the Home Space rather than the
first catalog item. Existing canonical-path/AGENTS.md/digest/access review remains.
Start from scratch is not implemented: no folder-creation control is being counted
as parity until it has a real reviewed creation flow. Folder chooser anatomy also
remains open; Settings currently accepts a path for inspection.

Focused picker/options/editor checks:15 passed. Integrated check typecheck/lint
passed;4,542/4,544 cases across731 files passed, with the known coder-worktrees
timeout and one stale Conversation assertion for the removed select. Migrated
that integration check to the direct picker and old-Space menu retirement; final
20 affected cases pass, including six picker cases. No unchanged full-suite rerun
was needed after the test-only correction. Renderer build passed2.90s.

Fresh live renderer inside the disposable native app showed the direct control,
mock catalog-error/Retry state and Use an existing folder reaching Projects,
Folder Space and the real Local folder path/Review folder controls. Mock folder
listing is unimplemented, so it supplies no successful/populated catalog evidence.
Screenshot:`aux-project-error-live.png` in the existing evidence folder. Native
and populated selection verification remain pending. The currently compiled app
still containsffb87541f; Project and compact timing source are newer. Previous goal
turn made native/source progress; this turn adds the direct control, removes its
old implementation and migrates its integration coverage. Full goal remains open.

## General search dropdown and compiled Project/compact routine evidence

General search now uses one dropdown with Google, DuckDuckGo, Brave, Microsoft
Bing and Ecosia, plus the retained custom URL editor. Rows use flat backgrounds,
left-aligned labels and a selected checkmark. Removed the old preset strip.
Selection only closes on acknowledged save or replaced setting value; its trigger
retains identity for focus return. Busy/false acknowledgement, changed window,
stale owner, composition and custom validation protections remain covered.
Brave and Ecosia template provenance: [Brave Search FAQ](https://support.brave.com/hc/en-us/articles/4403568397837-Brave-Search-FAQ)
and [Ecosia desktop setup](https://support.ecosia.org/article/657-installing-ecosia-on-your-desktop-device).

Initial integrated result: 4,543/4,546 across 731 files, with the known
coder-worktrees timeout and two stale integration assertions (old Google button
outside the picker and the former indexed label). Updated those assertions;
18 final affected cases pass. Renderer build passed in 2.14s. Final CSS removes
inherited button shadows; fresh reload verified the flat menu in the local
renderer. Selecting Brave acknowledged save, returned focus to the same trigger,
closed the menu and retained its checked selection on reopen. Custom opened the
existing URL editor with the actual Brave template. Screenshot:
`aux-search-engine-menu-live.png`. This is renderer/mock evidence, not a new
compiled native search dropdown. Language Save/Cancel parity remains open.

The single native build of `985ad7381` succeeded in 25 steps / 8m33.06s with
215 renderer assets, rebuilt runtime and Node 26.9. Normal disposable launcher
ownership remains intact. Native Project walkthrough: empty catalog → Use an
existing folder → real Projects editor/Home Space → inspect newly created
synthetic temporary folder → review canonical path and synthetic AGENTS.md →
grant read/write in disposable Profile → Home picker lists Parity project →
select → reopen shows Automatic unchecked and Parity project checked. No agent
run was started; no real Profile or owner files were used. The fixture path is
recorded in `/tmp/aux-parity-project-fixture-path` for later owned cleanup.
Evidence: `aux-project-populated-native-985ad7.png` and
`aux-project-selected-native-985ad7.png`.

Native All Routines opened the direct Routines route; Create routine showed
initial title focus, compact Repeat/Time, collapsed zone and Advanced controls,
Cancel and disabled Create paused routine until a prompt exists. Cancelled
without creating another routine. Evidence:
`aux-routine-compact-native-985ad7.png`. This supersedes the preceding pending
compact-native/populated-Project claims; scratch creation remains unimplemented.

The original ugly model-search rectangle is absent in the latest native build:
one rounded focus surface encloses icon, text and the full field. Evidence:
`aux-model-focus-native-985ad7.png`. Shared high-contrast keyboard indicators
remain separately supported. Full product acceptance remains open.

Recursive inventory still contains 192 manifest entries; all-files count is 562
including derivatives and metadata. Existing capture comparisons remain active.

Final search-slice integrated check: typecheck/lint pass; 4,545/4,546 tests
across 731 files pass. The sole failure is the longstanding coder-worktrees
60-second timeout. Final renderer build passes in 1.92s; diff whitespace check
is clean. No runtime or native C++ source was changed in this search slice.

## Capture 018 — draft language preferences

Compared the original 018 screenshot. Replaced immediate native writes for every
list action with an owner-bound draft. Numbered rows use rounded selectors and
standard localized names, with Add, remove, drag handles and Cancel/Save. Retained
keyboard Arrow Up/Down and scoped accessible move actions; obsolete immediate
write language tests were replaced with draft/save/lifetime coverage. New scoped
set-site-language and save-site-languages commands retain normal-window routing.
The existing native preference writer remains the only mutation boundary.

A collapsed code editor preserves arbitrary valid BCP-style language codes beyond
the common-language catalog. Managed/forced policy, duplicate validation, one-to-20
limits, failed-save draft retention, read retry and stale window/Private/inactive
A→B→A retirement remain covered. The shared Settings dialog can now give an editor
its dismissal callback and let it own its actions; simple editors retain Done.
Language Cancel/Escape unmounts unsaved drafts; acknowledged Save dismisses and
returns focus to Configure. No native host/runtime methods were added.

Fresh local renderer inside the disposable native app: Add → Cancel → reopen
retained the original two languages. Add → Save → reopen retained the third
language. Keyboard reorder moved English (United Kingdom) ahead of English and
kept focus on its handle. Evidence: aux-languages-draft-live.png. A pointer drag
automation attempt produced no observed reorder, so actual pointer acceptance
remains unproven. Exact six-dot grip/icon and matched-viewport acceptance remain
open. This is renderer/mock evidence only; native language/save staging pending.

Integrated check: typecheck/lint pass, 4,543/4,544 cases across 731 files pass; only
the longstanding coder-worktrees 60-second timeout fails. Final 26 affected cases
pass after adding fresh-pending, synchronous native failure and failed-read retry
checks. Final renderer build passes in 2.08s. Full goal remains active.

The `985ad7381` disposable preview subsequently retired through its original
launcher (exit 0). Removed the exact synthetic Project fixture only after
retirement. New single native launcher builds `9d677b376` with a temporary
Profile; `/tmp/aux-settings-consolidated-native.log` tracks this build. Native
search/language acceptance remains pending; do not replace a live builder.

## Capture 019 correction and 020/021 import source selection

Opened actual 019: Add opens a language chooser. Replaced automatic first-unused
selection with an alphabetized menu; choosing an item changes the draft only.
The menu excludes current languages and retains arbitrary code entry as its last
action. Catalog: 183 tags from the product Chromium checkout’s
ui/base/l10n/chromium_language_matcher.cc kAcceptLanguageList, pseudolocales
excluded. A shared Intl.DisplayNames instance uses standard names; selectors fit
the selected label. Capture 018’s center surface spans approximately physical
x1475–2512 (1,040px), or 520 CSS pixels at 2× density. Reduced dialog width from
620 to 520, padding to 20, rows to 50 and selectors to 32; custom code fields
remain hidden until requested. Exact grip and actual pointer reorder remain open.

Opened 020/021. Aux retains explicit discovery, opt-in categories, receipt recovery
and the actual no-cookie/native-password boundaries. Added Detected browser after
discovery, showing only its Profile/category review. Switching source clears both
category selections and extension choices, preventing hidden-source imports. Empty
discovery has a next step rather than a blank review. Browser logos, reference
dialog composition, already-imported semantics and separate bookmark import remain
open. No source discovery was run against the owner’s real Profile for this slice.

Language menu checks: 14 focused pass; integrated typecheck/lint and 4,547/4,548
cases pass (known coder-worktrees timeout only). Import focused: 20 pass. Integrated
import: 4,548/4,550 pass, with the known timeout plus a stale onboarding assertion
expecting four source cards at once. Migrated onboarding to the four choices and
unchecked per-browser reviews; final 44 affected integration cases pass. Final
renderer build: 1.82s. This source is newer than native candidate 9d677b376;
visual/native acceptance of the Add menu and import selector is pending.

## Native 9d677b376 and follow-up correctness fixes

The same live builder succeeded (26 steps / 8m45.61s; 217 renderer assets,
273 methods / 30 events, cce8203bcbd0, Node 26.9). Launched with a disposable
Profile. Native language Add → Cancel → reopen retained two original languages;
Add → Save → reopen retained en-GB, with focus returning to Configure. Evidence:
aux-languages-saved-native-9d677.png. This compiled draft editor predates capture
019’s Add menu/catalog and corrected 520px geometry; those are not native-proven.

Native Brave save succeeded, but no provider remained checked. A scoped SDK read
of only searchEngine/homeEntryMode proved Chromium returned
https://search.brave.com/search?q=%s&source=csChrome and no explicit Home mode.
The prior equality check incorrectly treated this preset as Custom. New source
recognizes preset origin/path and the exact q=%s placeholder, retaining the actual
URL rather than rewriting it. Different origins/paths/placeholders stay Custom.
General’s unset New tab mode now says Search, matching actual fresh Home behavior,
instead of misleadingly showing Ask. Explicit saved modes remain unchanged.

Fresh live renderer, loaded through the outer browser’s address control, showed
the bounded 256px language chooser and 520px dialog. Selecting Akan added only ak
to the draft; cancelled it. Anchored placement’s inline outer max-height previously
overrode the intended limit; capping the inner scroll area fixes the observed
oversized menu without changing shared popover placement. Evidence:
aux-language-add-menu-live-d63caf.png. The exact Chromium-returned Brave template
was saved through the custom editor in the mock renderer, then reopened as checked
Brave: aux-search-engine-native-template-live.png. These are current-renderer
evidence, not newly compiled native fixes.

Final provider/General focused checks: 19 pass. Final integrated check: typecheck/
lint pass, 4,551/4,552 tests across 731 files pass; sole failure is the longstanding
coder-worktrees 60-second timeout. Renderer build 2.10s; whitespace check clean.
No source browser Profile discovery/import or model call was performed. Full
surface acceptance, pointer drag and newest-source native staging remain open.

After that walkthrough, the exact owned preview retired normally (launcher exit
0). A single new temporary-Profile launcher builds 2425d212a, PID 31852, log
/tmp/aux-general-final-native.log; inspect the same process before any replacement.
It includes the latest language/menu/import/native-template/default-display source.
No newest-source native acceptance is claimed until this build and walkthrough.

## General bookmark-file entry and shared Library review

Capture 017’s General surface contains a separate Import bookmarks entry. Added
that entry using the actual bookmark HTML parser/native bookmarks.import flow,
shared with Library. Removed Library’s replaced file-read/import implementation
and its old preview styles. Both entry points preserve folders, preview web URLs
only, show duplicate/unsupported counts and require an explicit final import.
The file parser remains inert, bounds files to 5 MB and rejects unsupported
addresses. Library retains its toolbar Import HTML entry and real folder refresh.
Import dialogs use the reference’s normalized 520px width.

The shared flow owns file reads and pending writes by window/private/view lifetime.
Retired reads/acknowledgements cannot publish into a fresh editor. Busy imports
exclude overlapping controls. A failed native import retains its preview; an
acknowledged import clears it before refreshing so a refresh failure cannot offer
a replay of the same accepted file. That failure explicitly says the import
completed; Settings offers Done. No browser Profile discovery is added.

Initial integrated check: typecheck/lint pass, 4,560/4,561 tests across 732 files
pass; sole failure is the longstanding coder-worktrees timeout. Added Library
wiring/fresh-pending checks; final 32 affected cases pass. A synthetic node ID in
the new Library test was corrected to the native numeric-ID contract. Renderer
build: 2.44s. Actual UI/file-chooser walkthrough and new-source native staging
remain pending. The fixture file path is recorded in /tmp/aux-settings-fixture-path
for owned cleanup; it contains one synthetic example.test bookmark only.

Also opened 023/030: the reference exposes Customize Tidy Tabs with a saved
300-character prompt. Aux’s actual Overview proposal still accepts pageIds only
(packages/contracts/src/tidy.ts, apps/runtime/src/agent/tidy.ts) and has no saved
custom prompt editor. This remains an implementable capability gap, not a mock
configuration control. Appearance option order and matched native comparison remain
open. Current native builder 31852 still builds 2425d212a and excludes the new
bookmark-file source above; do not replace that live builder.

## Native 2425d212a and selected-export failure diagnosis

Build passed 25 steps / 9m06.34s, 217 renderer assets, ABI cce8203bcbd0, Node26.9.
Disposable native verification: fresh Home/General both show Search; Brave remains
checked after its real normalized URL save; compact Add menu shows alphabetic
choices, selects Akan and persists it after Save/reopen. Evidence:
aux-search-native-normalized-2425d.png and aux-language-add-native-2425d.png.

Import: did not use browser discovery. Chose only the owned synthetic HTML via
native Export browser=Chrome, Bookmarks HTML, chooser and Review export. Real
Detected browser/category controls populated, initially unchecked. Selecting
Bookmarks produced Import selected(1). Confirmation refused: native Begin returned
permission_denied / Refresh the original browser import preview, and the receipt
truthfully retained unknown completion. Standard SDK bookmarks.list confirmed
zero total/synthetic bookmarks; no retry. A human-only import.status SDK read was
correctly denied; no token impersonation was attempted. Evidence before dispatch:
aux-import-reviewed-native-2425d.png.

The selected file’s size/mtime/ctime stayed unchanged; its directory ctime changed
while macOS access/provenance attributes appeared. Snapshot code retained the
whole source directory’s contents metadata even for one human-picked export. This
is a likely cause of the stale review, to be tested natively. Area 0042 adds an
explicit kSelectedFile scope at export capture/decoding only; it requires exactly
one file and no session capture. File identity/content guards stay strict; the
directory path/identity/mode/uid/gid stay pinned. Whole-Profile snapshots retain
full contents checks. Exact prior-source forward apply and current-source reverse
apply checks passed. No broad guard bypass or new importer capability was added.
Browser export source IDs now use display names in the selector/heading.

Latest bookmark Settings renderer walkthrough used the real native file chooser
for the same synthetic fixture, then the shared inert parser showed one bookmark,
one folder and zero existing duplicates. Explicit Import returned Imported1 and
Done through the mock producer. Capture: aux-bookmark-file-preview-live-4e417.png.
This verifies current UI/file parsing, not the shared native writer.

The exact preview retired via its original launcher; it returned1 after SIGTERM,
and its finally cleanup removed the disposable Profile. A new plain-lock command
then applied 0042, proving the old lock had released; no active lock was cleared.
Native 0042 compilation, accepted synthetic export, file-mutation refusal and
shared-flow native acceptance remain required. Source policy conclusions remain
unproven until those real changed-flow checks pass. Full goal stays active.

Final selected-export slice check: typecheck/lint pass; 4,563/4,564 tests
across 732 files pass, with only the longstanding coder-worktrees 60-second
timeout. All 21 focused import cases pass. Native 0042 build is still required.

A single new native launcher builds544da21a2/area0042, PID41893,
/tmp/aux-selected-export-native.log. Poll the existing process; do not restart
on an observation timeout. The owned fixture is retained for native review,
directory-metadata acceptance and changed/replaced-file refusal checks. Shared
Settings native file-import acceptance also remains pending.


## Capture030: real Tidy Tabs preference implementation

Reopened the current030 reference and implemented its compact448px dialog,
Prompt label, live300-character count,128px text area, top Close, Cancel and
Save actions. Appearance now has a compact Configure entry. The prompt persists
through the existing Settings writer; the real agent.tidy.propose handler reads
it and includes it as the owner grouping preference. The model still receives
only tab titles and origins, treats tab data as untrusted and validates IDs and
groups through the existing schema. Cache signatures include the preference.
No automatic grouping or model call occurs when editing this preference.

Draft Cancel discards edits. Save closes only after acknowledgement, preserves
failed drafts, excludes private/inactive editors and rejects stale window/view
completions. A preference replaced elsewhere requires reopening. Acknowledged
publication before promise delivery still closes the correct editor.

Runtime dist rebuilt before tests;36 affected cases pass, covering persisted
restart/clear/limit, prompt propagation and editor lifecycle. Full check passes
typecheck/lint and4,575/4,576 tests across733 files; the existing coder-worktrees
timeout is the sole failure. Renderer build passes1.90s. Live visual/editor
walkthrough and compiled-native inclusion remain pending. Current native544
builder staged its renderer before this edit and must finish normally.

Recursive reference rescan:562 files, unchanged192-entry manifest. The full
surface review remains open. Latest focus screenshot reinspection confirms
native985 model search has a single rounded focus surface, matching the local
shared search correction rather than the owner’s older inner-rectangle capture.


## Native544 selected-export acceptance and next discovered gap

Build succeeded38 steps/8m33.45s. Disposable Profile aux-dev-Q0doIW, launcher41893,
app46360. Standard Netscape synthetic HTML imported1 bookmark, preserving its
folder, after a deliberate directory xattr changed directory ctime while the
file’s inode/size/mtime/ctime stayed identical. SDK bookmarks.list independently
confirmed one synthetic URL and its folder path. Initial compact one-line HTML
parsed0; it was corrected before this success and is not counted as acceptance.

A fresh native review followed by an actual file edit refused Begin with
permission_denied. SDK listing still showed exactly1 original and0 mutated URLs.
Captures: aux-export-directory-change-native-544da.png and
aux-export-file-change-refused-native-544da.png. This establishes selected-file
metadata/contents protection without falsely invalidating directory-only changes.
A replaced-inode case remains an additional unchecked scenario.

Shared Settings Import bookmarks still fails native acceptance: selecting its
file action closes the dialog without showing a chooser; direct pointer reproduces.
Native shell WebContents delegate has no RunFileChooser override. File-input
cancel also bubbles into Dialog onCancel, dismissing the editor. Next slice must
forward file selection to Chromium’s chooser and scope modal cancellation to the
dialog itself, then verify real shared Settings import. Earlier mock evidence is
insufficient. New browser-export review also leaves prior finished receipt visible.


Live Tidy renderer evidence: typing43 characters updates the counter; Cancel and
reopen returns0; Save and reopen retains43 and disables unchanged Save. Capture:
aux-tidy-saved-live-d3078.png. This uses Vite’s mock Settings producer, with actual
runtime persistence/propagation covered by unit tests; it is not compiled-native
Tidy acceptance. The image also shows action fills still differ from030; matching
neutral filled Save/Cancel and the reference close glyph remain visual polish.

Retired launcher41893 normally, confirmed Profile aux-dev-Q0doIW removed, then
acquired the normal lock for area0043 source edits. New native override forwards
RunFileChooser to Chromium’s existing browser delegate. Dialog handles only its
own cancel event, ignoring bubbled file-input cancellation. Reverse patch check
passes. Native compilation and shared chooser/import evidence remain required.


The live030 comparison exposed unfilled actions: added scoped neutral filled
Cancel/Save surfaces using theme tokens, keeping disabled/busy state behavior.
Their next compiled-native visual comparison remains required.


Area0043 integrated check: typecheck/lint pass,4,576/4,577 tests across733
files pass; only the existing coder-worktrees timeout fails. All5 Dialog cases,
including descendant-cancel regression, pass. Renderer build passes3.03s.
Native chooser forwarding is source/patch verified only until compiled launch.


**Active native builder:** source0edb56c33/area0043, launcher50077,
exec session72130, log /tmp/aux-shell-chooser-native.log. It includes Tidy source
and neutral actions plus file chooser forwarding/dialog cancellation scope. Poll
this same live handle; do not restart or clear its lock. Next: compiled chooser
opens, Cancel preserves its editor, shared synthetic HTML preview/import succeeds,
SDK verifies the new synthetic URL/folders, and compiled Tidy Save/reopen persists.
Owned fixture still resides at /tmp/aux-settings-fixture-path; its URL was changed
to example.test/aux-mutated-after-review for the refusal test. It remains safe
synthetic input, and should now import only after a fresh explicit review.


Appearance source now follows023’s primary card sequence: new tab position,
Customize sidebar, Recent chats; then a separate Tabs card for switcher order and
Tidy. Extracted SidebarDetails so Aux-specific keep-open, toolbar, width and
expanded-section controls no longer interrupt the shared rows. All existing
controls remain available below Websites/shortcuts and Window details. This is
source layout progress, not a completed native Appearance comparison. Keyboard
shortcuts still need031’s inline common-command presentation. Reference025 also
shows zoom through500%; current contract/UI is50–200, a remaining native/API gap.

Integrated typecheck/lint pass;4,575/4,577 cases passed. The existing coder-worktrees
60s timeout and a native-cdp-broker reconnect30s timeout failed. The isolated CDP
suite then passed all9 cases in1.24s; no CDP source changed. Renderer1.85s. No
additional unchanged full suite was run. Native area0043 currently compiling
predates this renderer reordering; do not mistake it for native layout evidence.


Import receipt source correction: a completed durable receipt remains visible
but gains a Previous import heading while a new review is shown. Progress source
IDs now use the same browser display-name mapping as review selectors, preserving
custom labels. The regression loads an old completed receipt, reviews a new
export, verifies both are distinguished and confirms no import was started.
All15 ImportDataSetting cases pass. Full check: typecheck/lint pass,
4,577/4,578 cases across733 files pass; only coder-worktrees60s timeout fails.
The earlier CDP reconnect timeout did not recur. Native50077/area0043 predates
this receipt/UI change and remains alive linking; fresh live rendering is pending.

Reopened031: the reference shows common keyboard commands inline, including
sidebar, search tabs, Ask, New task, Copy URL, both split orientations and Mini
popup, plus Extension shortcuts. Aux currently exposes the full real editor
behind Manage shortcuts; it needs a shared inline presentation preserving one
recorder, conflict handling and native shortcut restoration. Do not relabel a
flip-layout command as a direct split-orientation command or substitute Quick
Ask for its global shortcut preference. Exact supported command behavior and
corresponding inline fields need an implementation/verification slice.


Native0edb56c33/area0043 passed29 build steps in9m27.37s. Disposable preview
56765 (launcher50077, aux-dev-Em2Vio) proved macOS file chooser opens and chooser
Cancel preserves the bookmark editor. Selecting the owned synthetic fixture then
exposed WebUI TrustedHTML enforcement in the old template.innerHTML parser;
shared import is not accepted yet. Compiled Tidy Save/reopen retained43 characters,
and independent settings.get returned the same exact synthetic grouping preference.
Capture: aux-tidy-saved-native-0edb5.png. Preview retired normally; both processes
ended and its disposable Profile directory was removed.

Replaced the DOM HTML sink with parse5 plain-data parsing, lazily loaded only for
chosen files. Uses workspace’s existing locked7.3.0 parser as an explicit shell
dependency. No Trusted Types policy exception or native file-read API was added.
Existing URL/entity/folder/duplicate/size/depth limits remain. A regression forbids
all DOM innerHTML assignments and still parses a standard export. Final20 affected
cases pass. Two UI tests now await lazy parser loading rather than assuming the
preview is synchronous. Full check before that test correction passed typecheck/
lint and4,577/4,579 cases; remaining failures were the Library timing assertion
(now fixed/verified) and existing coder-worktrees timeout. Renderer1.76s. Native
shared import acceptance remains required from a build including this parser.

Reference025 zoom range is now implemented in local source39f9e3a26 and generated
host validation c13988be7:25–500%, matching renderer/schema/native writer. Native
builder63412 (session20575, /tmp/aux-appearance-zoom-native.log) is currently linking.
Its staged renderer includes the plain-data bookmark parser and Appearance card
ordering but predates the subsequent inline-shortcut changes.

Reference031: source now shows five common shortcut rows inline through one
recorder, with full editing/import/export behind Manage shortcuts. Static field
labels keep the rows searchable. Recorder tests cover Tab leaving, native
restoration, conflict review and changing presentations. Integrated check passed
4,582/4,583 tests with only coder-worktrees60s timeout; final typecheck/three
recorder tests and renderer2.97s passed after static search indexing adjustment.
This historical five-row pass preceded the direct split commands and global Quick
Ask row, now implemented as recorded above. Exact reset-icon/card fidelity and
light/narrow acceptance remain open. Agent Rail retains its actual behavior.
Reference folder rescan still contains562 files; no new captures found this batch.

Reference040 reopened against current PrivacySecurity/SitePermissions source.
The Security & Privacy page still materially differs: Aux starts with HTTPS-first,
cookies and crash reports, then embeds the complete site-permission/filter editor,
and places clear browsing data last. Reference040 instead has Browsing history
(Delete then View), Adblock (switch then compact Configure), Privacy (cookies then
Help improve), then separate Ads privacy/Site settings/Advanced navigation rows.
Required next slice: preserve Aux’s real deletion review and filter subscription
semantics while moving the editors behind compact entry controls; expose history
navigation; separate blocking controls from website-data/permission management;
retain HTTPS-first in advanced controls. Keep crash reporting described truthfully
(build destination availability); do not invent a usage-statistics service to copy
Aside’s wording. Native Chromium destinations must be implemented/verified before
adding navigation rows. A visual-only mock of these missing destinations is not
acceptance. Reference041/043/044 nested states still require direct comparison.

Reference044 directly inspected: only Allow and Block all appear in the cookie
menu. Native content_methods.cc already implements these via CookieControlsMode
kOff/kBlockThirdParty and refuses managed/private writes. Current renderer now
uses that two-choice selector and matching row label, preserving readback/error
handling. Three tests cover Allow→Block, Block→Allow and managed policy. Integrated
check4,583/4,584 (coder timeout only), renderer2.13s. Native live comparison pending;
this source postdates builder63412's staged renderer.

Native39f9e3a26/area0044 completed29 steps in8m47.05s (ABI08299a59570b,
Node26.9). Preview72653/launcher63412, disposable aux-dev-SNBZqr, proved the shared
bookmark flow end to end: chooser Cancel retains editor; reviewed synthetic HTML
parses1bookmark/1folder; Import reports1; SDK confirms the exact synthetic URL and
folder in this disposable Profile. Capture aux-shared-bookmark-import-native-39f9e.png.

Zoom500% writer succeeds but incorrectly scales chrome://aux itself, making the
shell unusably large. This FAILS native zoom acceptance. Restored100% via the same
control; captures aux-default-zoom-shell-regression-39f9e.png and
aux-appearance-restored-native-39f9e.png. Launcher retired normally; both processes
and disposable Profile cleaned. Area0045 now uses Chromium's scheme/host override
for chrome://aux at100% before initial navigation and excludes it from saved site
zoom listings. Applied/reverse-check passes; uncompiled. Next native acceptance:
500%/25% writes and reopening, shell remains100%, fresh websites honor the default,
restore100%, no internal Aux entry in website sizes. Do not accept from source alone.

Reference040 source progress: compact Browsing history Delete/View rows now lead
Security & Privacy. Deletion review moved from an expanded in-page block into the
shared native Dialog with owned form CSS; count revalidation and category selection
remain. Cancel/Escape perform no deletion; the trigger persists for focus return.
Cookies/crash reports share a Privacy card, HTTPS-first moves to Advanced. Embedded
Adblock/site-permission editors still differ from040/041 and remain open work.
Full check4,582/4,584 (coder60s and CDP reconnect30s timeouts); isolated CDP9+clear2
pass. Renderer2.57s. Nativea8e2a2ea8 currently linking does not include this later
renderer slice. No live geometry/flow claim yet.

## Appearance split shortcuts and native Privacy observation

Reference031 now has both orientation-specific split rows, backed by registered
commands and the existing guarded split writer. The picker preserves right/bottom
placement; the common card shows primary default chords without duplicate key
aliases. Full editor bindings remain available. Full check:4,594 tests pass;
final badge adjustment:17 affected tests pass; renderer build2.17s. Native keyboard
interception and actual resulting pane orientation remain to be inspected after
consolidated compilation. Quick Ask and extension rows were visible in Vite.

Native b1b4a2544 observation confirms Privacy grouping, configured EasyPrivacy
search, rounded focus, Escape back to Configure, and browsing-history review with
actual counts and Cancel. No data was deleted. Evidence under
/tmp/aux-parity-2026-10-16: aux-filter-search-native-b1b4a.png,
aux-history-review-native-b1b4a.png, aux-appearance-eight-shortcuts-vite.png.
These observations do not close the full-surface parity ledger.

## Settings card geometry and status placement

Reference040 comparison exposed a wider content column, missing leading icons in
history/adblock rows, and crash-report status squeezed into the control column.
The shared settings column is now636px (previously672px). SettingsField supports
decorative leading icons and full-width details; Privacy uses icons for history,
delete, blocking and filters. Crash/cookie status replaces the static supporting
copy below its label. Error/retry and crash-upload confirmation use the full row;
paused-blocking website exceptions also occupy full width below Configure.
Native availability, policy-managed controls, consent confirmation and native
write acknowledgement remain intact. Controls are disabled while inactive.
Full check passes typecheck, lint and4,594 tests/738 files; renderer build1.95s.
Native/Vite visual acceptance of these newest card
changes is pending the active consolidated build. No parity closure is claimed.
Reference folder rescanned:562 files, unchanged from the last batch.

## Composer provider menus and consolidated native observation

Composer model selection now uses provider rows with adjacent model submenus
(references009–012), while search flattens matching models across providers.
Right/Left and Escape enter/leave the submenu; selection retains existing catalog
and composer ownership checks. The Settings row opens Models. The menu prefers
below the trigger and falls back above near the bottom edge; pointer movement
opens provider menus without accidental activation during initial placement.
Full check passed4,594 tests/738 files. After final placement refinements,
typecheck and10 affected tests passed; renderer build2.19s. Vite walkthrough
verified opening, OpenAI submenu, GPT-6.1 Sol selection/reopen/search and Models
navigation. Evidence: aux-model-provider-submenu-vite.png. Current card geometry
and unavailable-state layout also observed: aux-privacy-cards-vite-f36e6.png.

Native fc9df54b1 build succeeded in8m45.06s (26steps). Launcher9489/session75082,
app14309, disposable aux-dev-yXOBjc remain active. The native shortcuts opened the
tab picker and produced horizontal/stacked panes; captures:
aux-split-horizontal-native-fc9df.png and aux-split-stacked-native-fc9df.png.
A rapid Separate-then-shortcut sequence emitted the existing “tabs changed” guard;
the next selection created the stacked split. Investigate that transition before
claiming complete split-flow acceptance. Native compilation does not yet include
the newer f36e6765e cards or provider menus. All captures live under
/tmp/aux-parity-2026-10-16. Projects055–057 were inspected: creation, icon/color and
working-directory parity are still open; no substitute project UI was added.


## Projects creation and split transition batch — October 16

References 055–057 reviewed again; recursive reference inventory remains 562 files.
Projects now opens a Create dialog from a quiet full-width row. Name/icon/color
metadata is validated and stored with the folder binding, shown in project cards
and names in composer choices. Nine colors and 24 existing Central Icons form an
anchored picker with keyboard navigation. The native folder chooser is offered
only when its host feature is available. Existing folder inspection and exact
review-digest checks remain; changed instructions require another review.
Cloud setup moved to Developers and Settings search follows that location.

Observed the new renderer through Vite inside the disposable native app: dialog
opened, color and globe selection updated, Escape returned to the form. A refresh
verified final rounded input/select styling (aux-project-create-vite.png). This
is not native folder-creation acceptance: the mock has no folder RPCs. Default
managed project-directory creation, the full reference icon grid, exact same-size
comparison, light/narrow states and native persistent creation remain open.

The Separate race now gates restoration while any split operation is queued or
in flight; it rechecks when the final operation settles. The full integrated
check passes 4,596 tests/738 files. The later `80b9431f8` native walkthrough
covered a rapid Separate-to-stacked transition, captured in
`/tmp/aux-parity-2026-10-16/aux-split-separate-stacked-native-80b943.png`.
That single walkthrough does not establish full split-flow parity.


## October 16 Models overview and task-menu consolidation

October 16 Models overview batch: references 058–061 now drive a compact
Providers card, searchable Connect menu, Default model row, grouped task roles,
and image-model row. Task selectors group models into adjacent provider menus;
search flattens matching choices. Row actions save reasoning or restore automatic
routing while preserving other role overrides. Detailed setup remains accessible
in a dialog, with targeted field focus, a persistent Done control, readable model
IDs and Escape focus return. Settings search opens the appropriate detailed field.
The text registry now explicitly excludes GPT Image 2 from chat-model pickers.

Validation: `npm run check` passed typecheck, lint and 4,598 tests/739 files;
after the reasoning/reset regression was added, the three overview tests passed.
Final renderer build passed (3.34s). Vite walkthrough verified provider submenus,
search keyboard entry, targeted role setup and Escape return. The native app
still runs source `7d913f2ff`; these Models and focus refinements are Vite-only
until the next consolidated native build. Full parity remains open: provider
brand icons, individual subscription setup, custom-provider JSON configuration,
image-provider submenus, exact viewport/light/narrow comparisons and full-app
acceptance remain outstanding.

Native Projects follow-up: the `7d913f2ff` incremental build passed in 8m57.17s
(25 steps). In its disposable Profile, creating “Design review” with a blue globe
and a synthetic read-only folder succeeded after canonical-path/AGENTS.md review;
the card persisted through Settings reload. The native directory chooser itself
was not exercised. Launcher 21465/app 26376 owns this live preview; the previous
launcher 9489 and its disposable Profile were retired normally. Rapid native
Separate/re-split acceptance remains outstanding.

Evidence under `/tmp/aux-parity-2026-10-16/`:
- `aux-settings-provider-submenu-vite.png`: provider submenu positioning and keyboard focus (before the final softer menu focus styling).
- `aux-model-options-dialog-vite.png`: repaired model-ID/reasoning layout, persistent Done, targeted Fast field.
- `aux-project-saved-native-7d913.png`: native named project, icon/color and reviewed access.

The provider-menu walkthrough exposed a backdrop-filter containing-block issue:
fixed submenus were positioned outside the visible popover. The task-model popover
now uses the opaque menu surface without backdrop filtering so submenu coordinates
remain relative to the viewport. Its normal search and option focus indicators are
rounded and quiet; forced-colors styling remains available.


## October 16 Permissions grouping batch

October 16 Permissions batch: references 045 and 051–053 now inform grouped
Allow, Ask and Deny cards with anchored Add Rule forms. These edit the existing
canonical action categories; exact-site overrides and policy revisions are
preserved. Inherited defaults and person-only categories remain inspectable in
“View all action defaults.” Site-rule entry moved into a popover. File access and
folder navigation use compact cards, with the detailed access explanation in an
expandable section. Auto, Ask first and Skip confirmation stay available; existing
Full-file-access and Skip-confirmation opt-ins remain unchanged. Rejected saves
now show an error instead of escaping the permission editor.

Validation: typecheck and lint passed. The integrated unit run passed 4,584 tests
but two unrelated browser command suites could not load a shared Vite cache file;
the focused retry passed all 15 tests in those suites. Eight permission tests,
including the new grouped-rule/site-override regression, passed separately. Final
renderer build passed in 1.97s. Vite inspection confirmed compact labels without
clipping, grouped rules, anchored rule form and focus return. Capture:
`/tmp/aux-parity-2026-10-16/aux-permission-groups-vite.png`.

This is not full Agents parity: notification/sound preferences, follow-up and
tab-switch behavior, cleanup controls, direct per-folder grant lists, arbitrary
tool globs, and the runtime maintenance presentation still need comparison and
implementation against Aux's supported host behavior. Native preview remains
`7d913f2ff`; Models, Permissions and focus refinements await consolidation.

## Memory document pane — October 17

Memory document layout batch: History now uses the available Settings pane with
one page heading and a flat revision-list/document split. Removed repeated field
headings and nested cards; added icons to Memory subnavigation. Selected individual
notes now use an adjacent document pane, stacking below the list at narrow widths.
Existing edit, restore, delete and scope checks remain unchanged.

Validation: integrated check passed (4,623 tests / 743 files, 104.76s); renderer
build passed (2.58s). Logs: `/tmp/aux-memory-document-layout-check.log` and
`/tmp/aux-memory-document-layout-build.log`. Populated wide History was reviewed
using the real component in a temporary synthetic fixture; capture:
`/tmp/aux-parity-2026-10-16/aux-memory-history-full-pane-vite.png`.
The fixture files were removed. Integrated source-preview navigation from History
to General confirmed General retains its normal layout. The preview pipeline
method is unavailable, so this does not establish real history data acceptance.
Selected-note and narrow layouts still need visual acceptance; native source
remains `6dba6ccbb` under launcher 4136/app 8559. Full parity remains open.

An additional native toast appeared after expanding Quick Ask and navigating a
guest tab: “Profile organization kept changing. Try again.” Investigation remains
open; it was dismissed for the layout review, not fixed by this batch.

## Chat card sizing and preview — October 17

Chat History cards (references 112/114/117): card columns now follow the actual
chat pane width instead of the whole browser window, with four/three/two/one
columns as space decreases. Narrow list/search layout uses the same container.
Cards use a quiet border instead of elevated shadows. Removed the inherited
two-line home-excerpt clamp so card previews fill their available height, with
muted text and a bottom fade, as in the reference.

Reviewed real ChatList/ChatExcerpt components with synthetic data at 860, 580 and
360px pane widths; saved `/tmp/aux-parity-2026-10-16/aux-chat-card-responsive-vite.png`.
Temporary fixture files were removed. This is source component evidence, not
integrated native acceptance. Reference 114's Status/Projects submenu structure
still differs from Aux's active/archive and Space filter; it remains open.

Validation: typecheck/lint passed; full test run had 4,622 passes and one 30s
native CDP reconnect timeout. The unchanged CDP suite passed all nine tests on
isolated retry (1.30s). Final renderer build passed (2.42s). Logs:
`/tmp/aux-chat-layout-check.log`, `/tmp/aux-chat-layout-retry.log`, and
`/tmp/aux-chat-layout-build.log`. No runtime source changes. Native preview remains
`6dba6ccbb` under launcher 4136. Full parity remains incomplete.

## Native consolidation and browser library audit — October 17

Native consolidation started for `2cb93764b` (Memory document/control layout,
Quick Ask routing guard, and responsive chat cards). Launcher **18613**, session
**95680**, owns the only build. Log: `/tmp/aux-memory-chat-native.log`. Previous
launcher 4136 was retired using SIGTERM; both its app 8559 and launcher exited,
Profile `aux-dev-9V5SsP` was removed, and the plain lock was released before the
replacement started. Siso 18839/18841 is live linking the framework. No replacement
app or native visual acceptance is ready yet. Preserve cleanup ownership.

Next native walkthrough: verify About revision; inspect Memory History and note
panes at wide/narrow widths; open Quick Ask and expand an unsent draft while
checking the routing toast is absent; inspect chat cards in the actual shell.
The earlier Profile-organization conflict toast remains an independent open issue.

Browser-library reference audit (164–170): reference 164 is a full History page
with a left rail, rounded search, date/group tabs and date sections; Aux currently
uses a 760px modal Library with segmented archive/bookmark/reading/history/closed
views. History has date ranges and per-entry removal, but no group view. This is
an explicit remaining layout/behavior gap, not accepted parity. Keep the existing
command ownership, selection, import and undo behavior when moving these surfaces
to the referenced page presentation. Native evidence for these views remains open.

## Library page implementation and native build — October 17

Browser Library page batch: History and Bookmarks now render inside the stage
instead of a centered modal. Added a left navigation rail, rounded search, and
full-height results; narrow panes use a horizontally scrollable navigation strip.
History has date-group surfaces with time/title/address columns that wrap at
narrow widths. Existing scoped actions, selection, import and undo remain intact.
The covered Stage is inert, while the shell chrome remains reachable. Removed
modal Tab trapping and background dismissal; Close/Escape preserve command guards.

Validation: integrated typecheck/lint and 4,624 tests across 743 files passed
(94.89s), including new vertical-navigation/nonmodal-focus coverage and the
updated close/draft-preservation cases. Final typecheck after the Stage inert
adjustment passed; final renderer build passed (2.05s). Logs:
`/tmp/aux-library-page-check.log`, `/tmp/aux-library-page-final-typecheck.log`,
`/tmp/aux-library-page-build.log`.

Visual evidence: the real Library component with synthetic history was inspected
at wide and 560px widths; History-to-Bookmarks navigation worked. Captures:
`/tmp/aux-parity-2026-10-16/aux-library-history-page-vite.png` and
`aux-library-history-narrow-vite.png`. Temporary fixture files were removed.
The integrated mock toolbar's Library click produced no visible transition; its
entry-point acceptance remains open. Fixture evidence does not prove integrated
native entry, focus return, or persistence. Reference group-history and bookmark
folder-tree navigation, separate browser page routes and full parity remain open.

Native consolidation for `2cb93764b1fea59f093207aa0e9fe0800390c493` completed in
8m31.54s and About confirmed that source revision. Launcher **18613** / session
**95680** owns app **22360**, disposable Profile **aux-dev-8UsqSc**, API
`http://127.0.0.1:60816`. Keep its cleanup ownership. This native build includes
Memory and chat-card refinements and the Quick Ask routing guard, but predates
the Library page batch. Native walkthrough of those changes remains open.

Bookmark folder navigation follow-up: the Library now includes a collapsible
folder tree using native node IDs and child order. Selecting a folder updates the
breadcrumb and results; external navigation reveals collapsed ancestors, and
mutation busy states disable navigation. Duplicate folder names remain distinct.
Integrated check passed all 4,626 tests across 744 files (98.82s), typecheck and
lint (advisory effect warning); renderer build passed in 3.89s. Logs:
`/tmp/aux-bookmark-folder-nav-check.log`, `/tmp/aux-bookmark-folder-nav-build.log`.
The real Library component with synthetic folders was visually inspected:
`/tmp/aux-parity-2026-10-16/aux-bookmark-folder-navigation-vite.png`.
Temporary fixtures were removed. Narrow folder-tree and native acceptance remain
open; running native 22360 still contains source 2cb93764b.

The integrated Vite toolbar Library entry was rechecked successfully without a
command change; the earlier failure did not reproduce. Evidence:
`/tmp/aux-parity-2026-10-16/aux-library-integrated-entry-vite.png`.
This supersedes the earlier source-entry uncertainty, not native acceptance.
Separate browser page routes, grouped History and full bookmark parity remain open.

Bookmark row/action batch (reference 168/170): saved bookmarks now use compact
rows with site icons (existing page-session favicon only, otherwise a globe),
inline title/address columns and a shared rounded results surface. Narrow panes
move addresses below titles. One overflow control replaces the permanent
preview/edit/delete icon strip; the existing handlers and delete undo are retained.
The shared anchored dialog supplies dismissal/focus return; arrow keys navigate
available actions. Reading-list controls retain their existing presentation.

Validation: `npm run check` passed typecheck/lint and all 4,626 tests across 744
files (93.15s). Renderer build passed in 2.07s. Logs:
`/tmp/aux-bookmark-rows-check.log`, `/tmp/aux-bookmark-rows-build.log`.
The source fixture was reviewed in the disposable native browser; opening the
menu and choosing Edit displayed the correct bookmark form. Capture:
`/tmp/aux-parity-2026-10-16/aux-bookmark-row-actions-vite.png`.
Fixture files were removed. Native integration and narrow visual acceptance remain
open. Organize-menu parity, clipboard actions and alternate open destinations are
still incomplete; this is not full bookmark-manager parity. Active native launcher
18613/app 22360 remains on source 2cb93764b and retains cleanup ownership.

Bookmark Organize batch (reference 169): creation, selection and HTML import/export
now live in the Organize menu beside search. Added a web-bookmark form backed by
the existing native create method, showing the destination folder, guarding busy
submission and retaining failed drafts. The import input stays mounted outside
the menu, preserving file-selection delivery after menu dismissal. Shared input
styles were found overriding Library's pill radius; Library now explicitly keeps
its rounded search surface. Sort-by-name and full clipboard/open-destination
parity remain open.

Validation: integrated check passed typecheck/lint and all 4,628 tests across
745 files in 95.06s, including new form/failed-draft and persistent-import-input
coverage. Final renderer build passed in 2.10s. Logs:
`/tmp/aux-bookmark-organize-check.log`, `/tmp/aux-bookmark-organize-build.log`.
Integrated Vite Library entry and Organize menu were visually inspected. Mock
folders are read-only, so actual creation and final pill styling still require
the consolidated native walkthrough. No real Profile was touched.

Native Library consolidation is running for source `122155dbe`: launcher **32186**,
exec session **11165**, log `/tmp/aux-library-consolidated-native.log`.
The previous launcher 18613 was retired with SIGTERM; launcher/app 22360 exited,
Profile `aux-dev-8UsqSc` was removed, and the plain lock was released before this
build began. Preserve launcher 32186's cleanup ownership; poll this existing
build instead of starting another. Build completion and native acceptance remain
pending. Next walkthrough: About source, Library entry, new folder/bookmark,
row edit/delete/undo and persistence, search radius and narrow layout; then the
previously pending Memory/Quick Ask/chat-card acceptance.

History group-view audit (reference 165): this is Chromium's journey-cluster
view, with query labels spanning visits to different sites, per-cluster actions,
hide-item controls and paginated results. Aux's `HistoryEntrySchema` currently
contains only URL/title/pageId/visitedAt and `history-methods.ts` has no cluster
query or hide operation. Date or hostname grouping cannot stand in for this.
The pinned Chromium checkout provides `HistoryClustersServiceFactory` and
`history_clusters::QueryClustersState::LoadNextBatchOfClusters`; its existing
`HistoryClustersHandler` is the reference for query reset, continuation and
HideVisits. The service factory is original-Profile-only for regular Profiles;
any Aux bridge integration must preserve private-window isolation and cannot
redirect private queries to owner history. No cluster service integration or
native acceptance is claimed in this audit.

Bookmark root-navigation correction: the rail now traverses all native permanent
roots, including Other bookmarks and Mobile bookmarks, rather than only the
bookmarks bar's child IDs. Native root titles are retained; roots can collapse,
and external selection still reveals ancestors. Selected folders use the accent
pill treatment from reference 168, with Aux's brand token.
Validation: integrated typecheck/lint and all 4,629 tests across 745 files passed
in 98.36s; renderer build passed in 2.97s. Logs:
`/tmp/aux-bookmark-roots-check.log`, `/tmp/aux-bookmark-roots-build.log`.
Native acceptance is pending: active launcher 32186/session 11165 is still linking
source 122155dbe and predates this follow-up. Do not restart it or claim the root
correction is in that build. The next consolidation must include this source.

Native consolidation `122155dbee2223d3aa3a9ac73991560511b0a3bd` completed
(9m20.45s native build) and About confirmed the exact source. Launcher **32186** /
session **11165** owns app **35867**, disposable Profile **aux-dev-iuwRXZ**, API
`http://127.0.0.1:63330`. Keep this owner's cleanup; no replacement build started.

Native Library walkthrough: entry, creating a synthetic folder, folder navigation,
new-bookmark dialog/destination, save, delete and Undo succeeded. Reopening Library
confirmed the edited title persisted. The search focus border is rounded without
an inner text rectangle. Evidence:
`/tmp/aux-parity-2026-10-16/aux-library-native-122155.png`.
Editing exposed a real stale-row bug: Chromium saved the title but the row kept its
old source until Library reopened, and the next edit conflicted. Source now
explicitly refreshes bookmarks after edit acknowledgement, matching other Library
mutations. The editor also schedules Name focus after its action dialog closes.
The regression simulates a successful edit with no observer event and verifies the
new row source. Integrated check: typecheck/lint and 4,630 tests / 745 files passed
in 96.28s; renderer build 3.35s. Logs `/tmp/aux-library-edit-check.log` and
`/tmp/aux-library-edit-build.log`. These fixes and the all-root rail correction
postdate the running native build; native acceptance remains pending. Narrow
Library evidence and process-restart persistence are still open.

Native Memory Configure switches visually accepted; screenshot:
`/tmp/aux-parity-2026-10-16/aux-memory-configure-native-122155.png`.
Quick Ask opened and expanded with its unsent synthetic draft intact. The old
routing-window error did not appear. However, the delayed notification “Profile
organization kept changing” reproduced in both the expanded and original windows.
It is NOT fixed. Investigate `store/organization-persistence.ts` around the bounded
CAS retry loop next. Capture:
`/tmp/aux-parity-2026-10-16/aux-quick-ask-expanded-native-122155.png`.
The synthetic draft was cleared and its expanded window closed; no model request
was sent, shortcut registered or owner Profile touched. Populated Memory History,
notes, responsive chat cards and full parity remain unaccepted.

Organization persistence follow-up: found key-order-sensitive JSON comparisons
in the no-op commit guard and three-way merge. Chromium dictionary serialization
can reorder keys while preserving values; two normal windows refreshing Spaces
could therefore keep writing equivalent state and contend for revisions. Source
now compares object values independently of property order, retains array order,
and treats omitted optional properties consistently with native JSON. Reviewed
Tidy comparisons use the same value semantics; conflict/undo guards remain.

Regression models two windows hydrating native-sorted JSON, one genuine edit,
then repeated refresh/persist cycles: exactly one host commit. Additional cases
preserve remote edits across reordered local objects and commit real tab reorder.
Integrated check: typecheck/lint and 4,633 tests across 746 files passed in 94.25s.
Renderer build 3.15s. Logs `/tmp/aux-organization-check.log` and
`/tmp/aux-organization-build.log`. Native Quick Ask expansion must be rechecked
before claiming the recurring notification resolved; active app 35867 predates
this fix as well as the root-rail and bookmark-edit follow-ups.

Native 122155dbe model-search focus was also inspected directly: the inner text
rectangle from the owner's screenshot is absent; the rounded field retains focus
indication. Capture `/tmp/aux-parity-2026-10-16/aux-model-search-focus-native-122155.png`.
The screenshot includes the already-documented organization error from that old
build; it is not evidence that persistence is fixed.

Native follow-up consolidation is running from `bca52783c`, including organization
value comparison, all-root bookmark navigation and post-edit refresh/focus.
Launcher **41736**, exec session **82219**, log `/tmp/aux-organization-native.log`.
Previous launcher 32186 was retired with SIGTERM; its app 35867 exited, disposable
Profile `aux-dev-iuwRXZ` was removed and the plain lock was released before this
builder started. Preserve launcher 41736's cleanup ownership and poll the existing
session. No app or native acceptance for this candidate is ready yet.

Next native evidence: About revision; Quick Ask open/expand with an unsent draft
and allow the delayed organization notification window to pass; bookmark edit
updates immediately and a second edit succeeds; all native bookmark roots are
visible in the rail. Broader parity and earlier unaccepted surfaces remain open.

History reference 164 follow-up: compact visit rows now place the timestamp,
site icon, title and hostname together, with the existing Bookmark/Remove actions
in one keyboard-accessible overflow menu. Narrow rows stack title and hostname;
full addresses remain available on hover. Icons use existing page-session data
with the local globe fallback, without external favicon requests.

Directly opening History exposed a save bug: Bookmark page required the folder
snapshot loaded only by Bookmarks. Saving from History now reads a fresh root
folder destination before creating the bookmark. The regression opens History
directly, bookmarks a visit, then removes only one of two visits to the same URL.
Integrated check: typecheck/lint and 4,634 tests / 746 files passed in 95.47s;
renderer build 2.32s. Logs `/tmp/aux-history-row-check.log` and
`/tmp/aux-history-row-build.log`. An unused import failed the first lint run and
was removed before the passing check. This source batch postdates the active
bca52783c native candidate. Visual/native acceptance is pending. Date/group tabs,
real history clusters, selection and separate native page routes remain open;
this is not full History parity. Reference corpus remains 380 source files.


Native bca52783c acceptance: completed in 8m07.53s and About confirmed exact
source `bca52783c5873cc42287ee81b59841ccaf0a32a5`. Launcher 41736 / session
82219 still owns app 45506 and disposable Profile `aux-dev-vseCSW`; API port
65046. No replacement build started. Preserve this launcher's cleanup ownership.

Quick Ask opened, retained an unsent synthetic draft on expansion, and showed no
organization-save notification after the delayed observation window. The original
window also had no notification on return. Draft cleared and expanded window
closed; no provider request sent. Native bookmark creation and two consecutive
renames succeeded: Name received focus, each saved title updated immediately,
and the second edit had no stale-source conflict. All three permanent roots are
visible, with the selected root using the accent pill. Captures:
`/tmp/aux-parity-2026-10-16/aux-quick-ask-expanded-native-bca527.png` and
`/tmp/aux-parity-2026-10-16/aux-bookmark-repeat-edit-native-bca527.png`.
These observations resolve the specific previous failures; broader persistence,
restart, narrow and light-mode coverage remains pending.

Current History source was visually inspected through the existing Vite mock at
`http://127.0.0.1:5197` inside a new tab of this disposable browser. Populated rows
show timestamps, icons, inline title/hostname and functioning overflow menus.
Corrected row ellipses by rotating the shared icon wrapper (also fixes bookmark
row ellipses); reloaded preview confirms vertical dots. Capture:
`/tmp/aux-parity-2026-10-16/aux-history-compact-rows-vite.png`.
This is renderer-preview evidence, not acceptance of native History mutations.
No temporary fixture changes were needed. Full Aside parity remains incomplete.


History selection follow-up (reference 164): visit checkboxes, Shift-range
selection, Select all shown, a selected-count toolbar and reviewed deletion are
implemented. Selection identifies URL plus exact visit time; changing search,
date range or view clears it. Bulk removal uses the existing native exact-visit
method, removes acknowledged successes immediately, stops at the first failure
and retains only unfinished visits for review/retry. It checks the original
Library read owner before each dispatch. Successful removal restores search
focus. A single-row remove also clears that visit from selection.

New HistoryDeleteDialog uses the shared rounded dialog surface, a bounded list
of selected visits and Cancel as initial focus. Add Bookmark now uses that same
surface, correcting its previously unstyled square dialog. Source regression
covers review before dispatch, partial failure/retry without repeating successful
deletes, Shift-selection and reset after a date-range change. Integrated check:
typecheck/lint and 4,636 tests / 746 files passed in 95.02s. Renderer build 3.42s.
Logs `/tmp/aux-history-selection-check.log` and
`/tmp/aux-history-selection-build.log`. First check stopped on test-only optional
array indexing; fixed before the passing full check.

Visual walkthrough used resettable fixture visits in the Vite preview at port
5197, hosted in the existing disposable Aux browser. Checkboxes, selection
count, rounded review, cancel and fixture deletion worked; deleted row and
selection toolbar disappeared and search regained focus. Capture:
`/tmp/aux-parity-2026-10-16/aux-history-selection-review-vite.png`.
This is renderer evidence; native History batch mutation acceptance is pending.
Existing native app remains source bca52783c, launcher 41736, app 45506, disposable
Profile aux-dev-vseCSW. No replacement builder started. Real grouped History,
separate native page routes, narrow/light evidence and the remaining bookmark
Sort/Cut/Copy/Paste/open destinations are still open. Full parity is not complete.


Bookmark destination batch (reference 170): row actions now expose Open in new
tab, Open in new window and Open in Private window. New-tab uses the existing
background native bookmark path. Window destinations extend the exact saved-node
bridge; URL/node mismatch checks and bookmarklet current-tab restrictions remain.
Private action respects its feature opt-out and is omitted in Private windows.
The helper now takes an explicit destination; all sidebar/folder callers migrated.
New windows never inherit the source window's Space. Chromium rejects unsupported
internal URLs for Private destinations before Navigate can redirect them into the
original Profile. Failed navigation now returns an error instead of false success
(bookmarklet current-tab execution retains its existing nullable result).

Native source change is consolidated as area patch
`chromium/patches/aux/0046-bookmark-window-destinations.patch`; generated host
schema/ABI refreshed. Reverse-apply check against the product checkout passed.
Integrated check: typecheck/lint and 4,637 tests / 746 files passed in 97.37s.
Regression verifies new-window payloads omit source Space and both destinations
reject bookmarklets without invoking native navigation. Log:
`/tmp/aux-bookmark-destinations-check.log`. Native compile and walkthrough pending.

Current preview still runs bca52783c under launcher 41736 / app 45506, disposable
Profile aux-dev-vseCSW. It must be retired normally before the consolidated build
containing this batch, History rows/selection and rounded Library dialogs. The
reference corpus still contains 380 source files. Group/split destinations,
bookmark Sort/Cut/Copy/Paste and separate native Library routes remain open.
Full Aside parity is not complete.


Consolidated native build started from `79bfa144e`, including bookmark window
and Private destinations (area patch 0046), History rows/selection and rounded
Library dialogs. Launcher **52233**, exec session **58825**, log
`/tmp/aux-library-destinations-native.log`. Verified live at 58s, resource and
host-schema compilation in progress; no new app acceptance yet.

Previous launcher 41736 was retired via SIGTERM; app 45506 exited, disposable
Profile aux-dev-vseCSW was removed and the native lock released before replacement.
Keep launcher 52233's ownership; poll its existing session, never start a second
builder. Next walkthrough: About revision/ABI, synthetic bookmark opens in new
tab/new window/Private window, destination isolation, and updated History/dialog
behavior. Remaining full-parity gaps are unchanged.


Bookmark Sort by name (reference 169) is now implemented in source. It persists
folders-first, locale-aware title ordering through the existing checked native
folder/bookmark moves. Equal-title items retain their relative order. Search
results cannot be sorted; the command targets the selected folder. Already sorted
folders do not dispatch moves. Successful steps update the snapshot and collect
native inverses in reverse order for Undo sort; a failed step stops the batch and
keeps completed steps undoable. Undo retains unfinished inverses after a failure
and verifies the original window/Private identity before dispatch. Bookmarks are
refreshed after sort/undo to display native order.

Integrated check: typecheck/lint and 4,639 tests / 747 files passed in 92.19s;
renderer build 3.17s. Regression covers folder/bookmark ordering, duplicate folder
names, fresh destination children, inverse dispatch, partial failure, retired
view and no-op sorting. First typecheck exposed an unnecessarily broad Bookmark
input type requiring createdAt; narrowed to the fields used by sorting before the
passing check. Logs `/tmp/aux-bookmark-sort-check.log` and
`/tmp/aux-bookmark-sort-build.log`. Native sort/undo walkthrough remains pending;
this source postdates the active native candidate 79bfa144e under launcher 52233.
Do not restart that builder. Full parity, group/split destinations, clipboard and
separate native page routes remain open.

