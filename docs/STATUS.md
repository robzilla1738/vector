# Aux status — October 16, 2026

Current replacement build: **930d6632f**, launcher **95514**, exec **35247**,
log `/tmp/aux-layout-defaults-build.log`. Includes the f95a500ce layout defaults
and toolbar alignment, plus regenerated settings-search copy. Native compilation
passed and framework linking is in progress. Wait for staging and launch, verify
About, then fresh sidebar/toolbar visibility and right-aligned actions.
Launcher 91436/app 92805 retired normally; aux-dev-2gPXgK and its lock were
verified removed before this replacement. Do not bind the retired app or start
another builder. Subsequent 196c543fd records the already-generated search copy
and architecture description; it does not introduce a different renderer design.


Previously accepted candidate **4b1358c589f27d8dd830e3eaca76163325ed2793** built
in 9m15.86s. Launcher **91436**, app **92805**, exec **57397**, disposable Profile
**aux-dev-2gPXgK**; log `/tmp/aux-native-library-features-build.log`.
About source/Chromium/ABI verified. Empty Mobile/Managed bookmark roots are hidden.
A synthetic Example bookmark exposed Private/group/split actions; switching those
three features off in Labs immediately removed them from the existing native page.
Model search focus visibly follows the rounded full field, with no inner rectangle:
`/tmp/aux-parity-2026-10-16/aux-model-search-rounded-4b1358c58.png`.
Runtime-unavailable preference retention and reading-row focus still need native
acceptance; neither is inferred from the successful live feature check.

Next layout batch: fresh Profiles open the sidebar and keep the toolbar visible;
saved collapse/auto-hide choices survive. Labs Auto Hide Toolbar now gates the
behavior and its Appearance switch. The native vertical toolbar spacer expands
to keep actions at the right edge while preserving its drag region.
Integrated `npm run check` passed typecheck/lint and all 4,618 tests / 744 files in
100.95s (`/tmp/aux-layout-defaults-check.log`). This layout batch awaits replacement
native preview. Preserve launcher cleanup ownership during normal retirement.


Live candidate **70b1bd1b5c35689528c35607da547bbd211b9e94** built in 8m33.88s.
About verified source, Chromium 154.0.8037.98 and unchanged ABI 9021388e….
Launcher **87016**, app **88409**, exec **92146**, disposable Profile
**aux-dev-8h142T**, runtime API `http://127.0.0.1:56877`.
Log `/tmp/aux-native-library-routes-build.log`. Preserve launcher cleanup ownership.

Native acceptance: toolbar Bookmarks opens chrome://bookmarks; Cmd-Y opens native
History; Clear History opens chrome://settings/clearBrowserData (cancelled without
deleting data). More exposes Reading list and saved tabs; all three retained
reading/archive/recently closed views render and focus their rounded search field.
Adding a reading item and marking it read updates the correct group. Direct Private
History now stays in its Private window and shows a rejected page; Cmd-Y there
also does not open persistent History. Private window closed normally afterward.
Captures `/tmp/aux-parity-2026-10-16/aux-saved-pages-70b1bd1b5.png` and
`aux-private-history-70b1bd1b5.png`. Native Settings still exposes Chromium/Google
wording through Clear History; that presentation remains to be reviewed.

Next source batch, area patch **0051-native-library-feature-preferences.patch**:
cache only folders/splitView/privateWindows booleans from normal-profile runtime
settings events in browser preferences. Native Bookmarks seeds and observes those
preferences, hides opted-out actions immediately, and rechecks deferred opens.
Private runtimes cannot overwrite the normal Profile cache. Defaults remain on.
The combined native bookmark model and Aux sidebar now honor permanent-node
visibility, hiding empty Mobile/Managed roots while retaining populated roots.
Native Library delayed opens preserve newer window kind/overlay ownership.
Reading-list row moves restore focus to their new action trigger (or search after
removal), while preserving newer external focus. This correction was found during
the live mark-read walkthrough and awaits consolidated native acceptance.

Validation: 0051 Bookmarks TypeScript/resources and changed C++ objects compiled
in 51.95s; reverse-apply check passed. Integrated `npm run check` passed all 4,618
tests / 744 files in 101.94s. Subsequent focus correction passed typecheck/lint and
12 reading/navigation focus tests. No full suite was repeated for that correction.
Logs `/tmp/aux-native-library-features-{compile,check}.log`,
`/tmp/aux-reading-focus-{typecheck,lint,check}.log`.
Next native acceptance: Labs opt-outs with an already-open bookmark page, cache
retention without runtime, empty/populated roots and reading-row focus. Full UI
parity, populated History groups, light/narrow comparisons and phase smoke/perf
remain incomplete.

Native candidate **21d7d725cfce93aa84a5762c3bfc381d01ee6603** built and launched
under launcher **81608**, app **82974**, disposable Profile **aux-dev-UFpGbW**,
exec **95623**, log `/tmp/aux-native-library-presentation-build.log`.
About verified source identity, Chromium 154.0.8037.98 and ABI
`9021388efb6b3a3f317178bce1b0794baf2826aa9c132b5bb276b28470fb8c68`.
Native Bookmarks shows the Aux logo, dark palette and rounded search focus;
creating a synthetic bookmark immediately updates the Aux sidebar (0048 accepted).
Its menu shows Edit/Delete, Cut/Copy/Paste, Private/group/tab/window/split actions.
History exposes By date/By group and Aux history navigation without synced tabs.
Populated clustering and light/narrow comparisons remain pending.

The next source batch routes Bookmarks, History and Clear History to real browser
pages; removes the combined cloned Library and its obsolete helpers; retains
Reading list, Archived tabs and Recently closed in SavedPages. Saved pages preserve
background-open unread state, offline extraction ownership and focus restoration.
Persistent Library commands reject Private/Little windows and do not depend on
the agent runtime. Native APIs remain available to their structured clients.
Native group/split Labs opt-outs still need integration; this is not full parity.

Private testing exposed an additional native redirect: History navigation moved
to a normal window before HistoryUIConfig could reject it. Area patch 0050 keeps
Aux History requests in their initiating context so 0049's WebUI guard applies,
including view-source requests. Bookmarks already rejected the Private URL. The
0050 fix and replacement renderer await a consolidated native build/walkthrough.

Integrated `npm run check`: typecheck/lint passed, 4,607/4,616 tests passed initially.
Six stale overlay/focus expectations were updated; all 47 tests in those three
files passed on retry. Three routine tests depended on the wall clock staying
outside the minute before 09:00 UTC; fixed fixture clocks preserve the same
schedule assertions, and all three passed. No passing full suites were repeated.
Renderer build passed in 2.22s. Logs `/tmp/aux-library-routes-{check,retry,routines-retry,renderer-build}.log`.


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


Replacement candidate `479f5a96b` is building under launcher **73597**, exec
session **88582**, log `/tmp/aux-bookmark-clipboard-rebuild.log`. It includes the
Library layout follow-up and the clipboard link correction. Source now constructs
BookmarkNodeData from the validated native node and calls its implemented
WriteToClipboard API. Patch 0047 reverse-apply check passed. Prior launcher 70194
exited and released the lock; no preview was launched from that failed build.
Preserve launcher 73597 ownership. Native clipboard, context menu, split readiness
and updated Library layout walkthroughs remain pending this candidate.

The reported rectangular model-search focus box is already fixed by shared
rounded input-surface focus styling (commit c612736f5), with native acceptance
recorded below. Existing capture `/tmp/aux-parity-2026-10-16/model-focus-final-crop.png`
shows the whole rounded search control without an inner text rectangle.


Library layout follow-up: permanent bookmark roots stay in the folder rail, not
as duplicate rows in the main pane. Nested breadcrumbs follow the actual native
parent chain; root views omit breadcrumbs. Bookmark rows show titles with URLs
on hover, and folder/bookmark rows share compact card spacing. Integrated check
passed 4,649 tests / 749 files; renderer built in 2.99s. Native visual acceptance
of this follow-up is pending. Logs `/tmp/aux-bookmark-layout-{check,build}.log`.

The consolidated candidate launcher 70194 exited and released its lock after a
linker failure: Chromium declares CopyToClipboard but provides no implementation
in this checkout. The replacement will use BookmarkNodeData::WriteToClipboard.
No app was launched from that candidate; its acceptance remains pending.


Consolidated native clipboard candidate started from `f22e40699`, including
context menus and split-readiness follow-up. Launcher **70194**, exec session
**48817**, log `/tmp/aux-bookmark-clipboard-native.log`; process confirmed live at
8s. Preserve its ownership and poll this session. Previous launcher 59717 received
SIGTERM; app 63674 exited, Profile aux-dev-R84mt4 was removed and lock release was
verified before replacement. Next: About identity, Cut/Copy/Paste and Undo using
synthetic bookmarks, right-click/keyboard menus, and actual split opening.

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

Consolidated native build started from `03e1dc205` with bookmark sort/undo,
menu ordering and group/split destinations. Launcher **59717**, exec session
**56581**, log `/tmp/aux-bookmark-arrangements-native.log`. Process confirmed live
at 7s. Preserve this launcher's ownership and poll this session; do not start a
second builder. Previous launcher 52233 retired via SIGTERM; app 56049 exited,
Profile aux-dev-GXRhpY disappeared and native lock release was verified before
replacement. Native walkthrough remains pending for this candidate.

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


Native Library consolidation is running for source `122155dbe`: launcher **32186**,
exec session **11165**, log `/tmp/aux-library-consolidated-native.log`.
The previous launcher 18613 was retired with SIGTERM; launcher/app 22360 exited,
Profile `aux-dev-8UsqSc` was removed, and the plain lock was released before this
build began. Preserve launcher 32186's cleanup ownership; poll this existing
build instead of starting another. Build completion and native acceptance remain
pending. Next walkthrough: About source, Library entry, new folder/bookmark,
row edit/delete/undo and persistence, search radius and narrow layout; then the
previously pending Memory/Quick Ask/chat-card acceptance.


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

Split shortcut evidence reconciliation: current registry and Appearance source
already include both orientation commands. The existing native horizontal/stacked
captures and later `80b9431f8` Separate-to-stacked capture were checked; stale
“missing command” ledger entries were corrected. No product edits or repeated
tests were needed. Matching viewport/light/narrow/full-card acceptance remains
open. Continue the active native consolidation at launcher 75304/session 72707.

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

Native consolidation is running for `4e5fa2188`: launcher 75304, exec session
72707, log `/tmp/aux-models-routines-native.log`. Previous preview retired normally
as recorded below. Preserve this one builder and poll its live handle; do not
start another. Pending native acceptance includes searchable routine/thinking
controls, routine persistence, image menus and focused provider dialogs.

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

Validation: integrated typecheck/lint and 4,617 tests across 741 files passed.
Final account-dialog checks passed seven tests, final typecheck passed, and renderer
build passed in 1.84s. Logs: `/tmp/aux-provider-dialogs-check.log`,
`/tmp/aux-provider-dialogs-final-tests.log`, and `/tmp/aux-provider-dialogs-build.log`.
Native launcher 60321 was retired with SIGTERM; app 64878 exited and its disposable
Profile `aux-dev-BlQeyX` was confirmed removed before the next consolidation.

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

Latest routine visual review: the local renderer confirms searchable model
selection (GPT filtering and GPT-6.1 Sol selection), High thinking selection and
completion notification opt-out. Reference 084 comparison exposed overly bright
form fields and a redundant standalone Time zone disclosure. Inputs now use the
dialog surface, the heading uses medium weight, and creation's Time zone joins
Advanced with saved-task, review and spend controls. The saved trigger editor
retains its independent Time zone disclosure. The walkthrough confirms Advanced
reveals the editable fields. Capture:
`/tmp/aux-parity-2026-10-16/aux-routine-form-polish-vite.png`.
No routine was created, activated or run in this walkthrough.
`npm run check` passed typecheck/lint and all 4,615 tests across 741 files;
renderer build passed in 3.35s. Logs: `/tmp/aux-routine-form-polish-check.log`
and `/tmp/aux-routine-form-polish-build.log`. No runtime source changed.

Native consolidation has finished: 9m07.50s, 25 steps, success. Launcher 60321
owns live app 64878 and disposable Profile `aux-dev-BlQeyX`; log remains
`/tmp/aux-routine-preferences-native.log`. About confirms shell source
`286ae0c3b3f63f94e5215a081b39f042b7d731be`. Native Agents naming, the three-category
notification menu and rounded focused model search have been inspected. Capture:
`/tmp/aux-parity-2026-10-16/aux-agents-menu-native-286ae.png`.
The searchable routine picker/thinking and this form polish are newer renderer
source, verified through local Vite inside the disposable native preview. Native
routine persistence, live completion delivery, matching viewport/light/narrow
comparisons and full parity remain open. Earlier linking notes below are historical;
do not start a duplicate builder or touch the owner's Profile.


October 16 Channels review: references 091–096 expose an unimplemented messenger
surface, including Slack/Telegram/Discord connections, peer pairing, per-channel
mention/follow-up rules and reconnect. Current Calendar/MCP grants and developer
client connections are not equivalent. The active parity ledger now records the
source evidence and implementation dependencies; all six references remain open.
No product source changed or tests repeated during this audit. Native launcher
60321/session 43285 and linker 60972 are confirmed live on the existing build;
continue polling this handle for the pending native walkthrough.


October 16 routine model-menu follow-up: the flat list is replaced by the shared
searchable provider-grouped model picker. Thinking choices Auto/Low/Medium/High
persist with each routine and feed normal/overnight starts; clearing the value
restores automatic reasoning. Models explicitly declaring no reasoning clear and
disable that choice. Catalog model IDs now accept the same 500-character bound as
the model registry. The shared picker accepts a contextual accessible name and an
optional Settings action; composer behavior retains its existing defaults.

Runtime dist rebuilt. Integrated typecheck/lint passed; 738 test files passed with
4,609 tests, while three suites failed to load a shared Vite cache module. Those
three suites passed all six tests on an isolated retry. Final creation/control
checks passed four tests, including non-reasoning reset and retry persistence.
Renderer build passed in 3.13s. Logs: `/tmp/aux-routine-model-menu-check.log`,
`/tmp/aux-routine-model-menu-recovery-tests.log`, and
`/tmp/aux-routine-model-menu-final-tests.log`. Avoid concurrent Vitest runs sharing
this cache. Visual acceptance of this newer menu is pending: native builder 60321
is still linking the previous `286ae0c3b` renderer, and no alternate browser surface
is available. Do not launch another builder or the owner's real Profile.


Native consolidation for `286ae0c3b` is running: launcher 60321, exec session
43285, log `/tmp/aux-routine-preferences-native.log`. Previous launcher 48050/app
52745 exited normally and disposable Profile `aux-dev-6yaYYY` was removed before
replacement. Keep this one builder; do not start another. Pending native checks:
Agents naming and three-category menu, compact aligned pickers, routine model and
notification persistence. Live routine delivery and full parity remain open.


October 16 routine run preferences (reference 084): Create routine now includes
Model and Notifications in the grouped timing card. Model-led saved routines also
expose Run preferences. A blank model follows the default; explicit models persist
and feed normal/overnight launch. Notification opt-out is captured in durable run
config for normal, overnight and saved-step execution, suppressing completion
alerts while preserving requests needing attention. Existing routines retain their
previous defaults. Routine updates can clear the model without resetting unrelated
fields. Catalog loading is deferred until saved preferences are expanded.

Vite walkthrough selected GPT-6.1 Sol and switched completion notifications off;
capture `/tmp/aux-parity-2026-10-16/aux-routine-model-notifications-vite.png`.
No routine was created or activated in this walkthrough. A shared schedule input
style was corrected so switches retain their compact shape. Creation copy and
duplicate schedule summary were reduced. Runtime dist rebuilt before checks:
`npm run check` passed typecheck/lint and 4,615 tests across 741 files. Final schedule
checks passed 11 tests; renderer build passed in 3.33s. Native launch, live routine
model selection and delivery acceptance remain open. Reasoning/provider presentation,
standalone behavior and remaining full-surface comparisons are not yet complete.


October 16 settings-menu refinement: notification and task-model selectors now
align menus to the control's trailing edge, retaining viewport clamping and
above/below placement. Shared anchored menus use tighter corners. Notification
rows have compact spacing, stable checkmark space and enough width for the routine
subtitle; Preview includes the speaker icon. Vite walkthrough confirms alignment,
unwrapped notification descriptions, Escape focus return, and model search.
Captures: `/tmp/aux-parity-2026-10-16/aux-notification-menu-aligned-vite.png` and
`/tmp/aux-parity-2026-10-16/aux-model-menu-aligned-vite.png`.
`npm run check` passed typecheck/lint and all 4,613 tests across 741 files;
renderer build passed in 2.25s. Native shell remains `6f38844cc`; these refinements
await the next consolidated build. Full matched-viewport/light/narrow comparisons
and remaining functional parity are still open. Reference inventory remains 562 files.


October 16 routine-notification follow-up (reference 046): Needs attention,
Task completions and Routine completions are independently selectable. Runtime
routine execution, overnight routine execution and saved-step replay now stamp
routine provenance on their runs; the notification gate checks durable provenance
rather than titles or task guesses. Public run creation cannot set this field.
Routine questions still follow Needs attention, independently from completion
choices. Existing disabled-completion preferences remain disabled during migration.
The visible settings category, heading, icon and search result labels now say
Agents; the existing route/category identity remains stable and both Agents and
Permissions search terms find its fields.

Runtime dist rebuilt before the integrated check: typecheck/lint and all 4,612
tests across 741 files passed. Final producer/navigation/search checks passed all
12 tests; renderer build passed in 1.86s and final shell typecheck passed.
Vite visual acceptance confirms the Agents title/icon and all three notification
choices; toggling Routine completions leaves the other two choices unchanged.
Capture: `/tmp/aux-parity-2026-10-16/aux-agents-three-notification-types-vite.png`.
The popup alignment and subtitle-spacing follow-up is recorded above. Native acceptance
of this newer source, automatic background sound and live routine delivery remain
open, alongside agent-tab cleanup and full surface/phase acceptance.

Native consolidation for `6f38844cc` completed in 9m06.48s (25 steps). About
confirmed source `6f38844ccab6e40ae4f336f75cd9f496765b0df8`, ABI `08299a59570b`.
Launcher 48050/session 93092 owns app 52745 and disposable Profile `aux-dev-6yaYYY`;
log: `/tmp/aux-agent-behavior-native.log`. Previous launcher 34917/app 36707
exited normally and its disposable Profile was removed before replacement.
Native Steer persisted through Settings reload. Bell preview entered Playing and
returned to Preview without an error; audible/background delivery is not claimed.
Two unsent drafts on example.com and example.org restored independently across
switching and assistant hide/reopen. Keep current chat then retained the second
draft when switching back to the first tab. No inference was invoked.
Captures under `/tmp/aux-parity-2026-10-16/`:
`aux-tab-draft-restored-native-6f388.png` and
`aux-keep-current-chat-native-6f388.png`.
This native shell predates the newer routine-notification/Agents naming batch.

October 16 behavior batch (references 048–049): Agent access now groups mode,
Follow-up behavior (Queue/Steer), and Ask Aux on tab switch (New chat per tab/Keep
current chat) in one rounded card. Both choices persist in runtime Settings and
are indexed by Settings search. Queue is the default for live follow-ups; pending
questions still default to Answer and explicit composer choices remain available.
Per-tab assistant views are scoped to this browser-window session and Space;
switching tabs preserves drafts and running work. Hiding the assistant retains
associations. Explicit navigation and Set panels take precedence; deleted chats
are evicted, and private/Quick Ask windows do not apply per-tab behavior.

Runtime dist was rebuilt before tests. The focused defaults, live composer and
tab ownership suites passed all 36 tests. Vite inspection verified both selectors,
successful saves and grouped layout; capture:
`/tmp/aux-parity-2026-10-16/aux-agent-behavior-settings-vite.png`.
Final renderer build passed in 3.08s. Integrated `npm run check` passed typecheck,
lint and all 4,610 tests across 741 files. Focused native acceptance is recorded above. Agent-tab cleanup, full Agents
parity and phase acceptance remain open.

October 16 Chat attention batch (references 045–046): notification controls moved
from General to the Permissions/Agents surface, in a compact Chat card. An anchored
selector independently filters completions and requests needing attention through
the durable notification gate; category changes also agree with the existing Task
notices toggle. Completion sound has three local tones, Preview and Change controls,
and remembers the selected tone while disabled. Background sound respects notice
filters, Focus Mode and the existing foreground suppression. System delivery stays
an explicit opt-in and sends only the existing generic payload.

Local Vite walkthrough verified category toggling, Escape focus return, Bell
selection surviving reload, and Preview activating the browser audio indicator
then returning to idle. Capture:
`/tmp/aux-parity-2026-10-16/aux-chat-notification-settings-vite.png`.
Integrated check passed typecheck/lint and 4,602 tests across 739 files; after final
preference refinements, 19 focused tests passed. Renderer build passed in 2.20s.
The live native app remains `80b9431f8`; this batch awaits native consolidation.
Reference parity is still incomplete: routine completions need independent source
tracking/filtering, and follow-up, tab-switch and cleanup controls remain open.
Native background sound delivery is not yet accepted by this Vite preview check.

October 16 native consolidation: source `80b9431f8` built successfully in
9m06.79s (26 steps). The disposable preview now includes Models, Permissions and
the shared rounded input-focus correction. Native model search showed no inner
rectangular outline. Selecting GPT-6.1 Sol persisted through Settings reload.
Adding a Publish posts deny rule also persisted through reload; the test rule was
then removed. Rapid Separate followed immediately by the stacked split shortcut
successfully restored two panes without the stale-tabs guard. These are focused
walkthroughs, not full parity or phase acceptance.

Captures under `/tmp/aux-parity-2026-10-16/`:
`aux-model-saved-native-80b943.png`, `aux-permission-saved-native-80b943.png`,
and `aux-split-separate-stacked-native-80b943.png`.
Launcher 34917/app 36707 owns this disposable preview. Previous launcher 21465,
its app and disposable Profile were retired normally before this build.

A follow-up permission-editor correction keeps the popover mounted during saves,
so failed saves retain the draft and successful closing can restore focus.
Its deferred-save regression and all nine permission tests pass. Integrated
`npm run check` passed typecheck, lint and all 4,601 tests across 739 files.
The final renderer build also passes. This follow-up is source-only until the next
native consolidation; the shared input-focus correction is already native.

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

October 16 Projects batch: replaced the inline folder-access form with a compact
Create row and a 512px Create Project dialog, using references 055–057. Project
names, 24 existing library icons and nine colors persist with reviewed folders;
composer choices display saved names. Folder selection uses the implemented
native directory chooser when available. Canonical-path/AGENTS.md review remains
required before Create grants access. Cloud execution setup now lives in
Developers, with its search destination corrected. The reference's automatic
managed working directory and full icon catalog are still outstanding.

Split restoration now waits for queued native split operations to settle, avoiding
reconstruction of an intentionally separated pair between native ACK and layout
commit. Regression coverage includes deliberate separation and deferred recovery.
`npm run check` passes typecheck, lint and 4,596 tests across 738 files. Local Vite
inspection confirmed dialog layout, icon/color selection and Escape focus return;
`/tmp/aux-parity-2026-10-16/aux-project-create-vite.png` records the final rounded
form controls. Subsequent native persistence evidence is recorded above; native
chooser acceptance remains open. No full-parity or phase completion claimed.



## October 16 UI parity review — in progress

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

The settings-card batch brings the shared content column to636px, adds leading
history/adblock icons, and moves cookie/crash status under the label. Full-width
details keep confirmation, retry errors and paused-blocking website exceptions
out of the narrow control column. Settings search retains the same destinations.
Full check passes typecheck, lint and all4,594 tests/738 files (86.92s).
Renderer build passes in1.95s. Visual acceptance is pending: the single native
launcher9489/session75082 is linking fc9df54b1 from before this card batch, with
log /tmp/aux-appearance-consolidated-native.log. The prior launcher94580/app4604
retired normally and disposable aux-dev-aQO2gg was removed. The latest cards can
be inspected through Vite5197 after that preview launches; do not claim these
later changes are compiled into its native renderer. Full parity remains open.

Appearance now exposes eight common shortcut rows, including separate side-by-side
and stacked split commands in reference031 order. Both commands open the existing
tab picker and preserve the requested edge through the registered split writer.
Command-Shift-backslash selects side-by-side; Command-Shift-minus selects stacked.
Command-minus remains Zoom Out. Common default badges show the primary binding,
while the full editor retains keyboard-layout aliases and custom bindings.
Settings search indexes both new rows. Full check passes all4,594 tests/738 files;
after the final badge presentation adjustment,17 affected tests and the renderer
build pass (2.17s). Native interception of the new commands still needs acceptance.

CUA observation recovered without restarting the b1b4a2544 native preview. Its
Privacy layout, configured filter search (EasyPrivacy), rounded search focus and
Escape return to Configure were observed. Browsing-history review showed actual
counts and Cancel without deletion. Evidence in /tmp/aux-parity-2026-10-16:
aux-filter-search-native-b1b4a.png, aux-history-review-native-b1b4a.png, and
aux-appearance-eight-shortcuts-vite.png (newer local renderer, not compiled native).
The live native preview is still b1b4a2544; newer Appearance and split changes are
local source until the next consolidated build. Full product parity remains open.

The recurring coder-worktrees verification timeout is resolved. An isolated timed
diagnostic completed all assertions in51.07s; the monolithic60s test exceeded its
limit under full-suite load. Split it into independent snapshot/integration/undo,
interrupted-snapshot recovery, and batch-integration scenarios with disposable
fixtures and explicit current-worktree access. All34 original assertions remain;
each case retains the60s timeout. The temporary diagnostic was removed.
`npm run check` now passes typecheck, lint and all4,592 tests across738 files.
The three cases took27.44s,34.54s and22.08s under the full suite. No runtime behavior
or permissions were changed. Native launcher94580/session68095 remains active,
generating debug symbols for the b1b4a2544 renderer build.

Appearance now includes Quick Ask in the same common-shortcut recorder, with
read-only global registration status refreshed after shortcut changes and window
focus. Disabled, unregistered, conflicting, unavailable and Private states have
distinct explanations. A stale response cannot overwrite the current registration.
Extension shortcuts has a compact navigation row to chrome://extensions/shortcuts;
that route is present in the current Chromium extension navigation source.
The existing guarded native navigation control is shared with Privacy & Security.
Direct side-by-side/stacked commands remain unfinished reference031 work.

Full check passed typecheck/lint and 4,589/4,590 tests (existing coder-worktrees
timeout only). Renderer build passed in3.10s. New status and navigation tests pass.
These newer Appearance rows still need visual/native acceptance. Native build
launcher94580, session68095, log /tmp/aux-privacy-consolidated-native.log is alive
and linking the previously staged b1b4a2544 renderer; it does not include these
subsequent Appearance changes. Do not start a competing builder or clear its lock.
The coder-worktrees timeout remains unresolved; its test limit was not changed.

Privacy & Security now has compact Site settings and Advanced navigation rows,
opening chrome://settings/content and chrome://settings/security. Both destinations
were inspected in native a8e2a2ea8: permissions/content controls and Safe Browsing,
secure DNS, security keys and certificates are present. chrome://settings/adPrivacy
redirects to Settings home, and the current Chromium Settings route source has no
Ads privacy destination; no nonfunctional link was added.

Aux's saved permission/data review remains accessible through a compact Manage
dialog. Escape/Done preserve data; dismissal is prevented while its writer runs.
The old inline presentation is removed. Vite verification covered the new rows,
dialog opening and Escape returning to Manage. Evidence:
aux-privacy-navigation-vite.png and aux-native-security-destination-a8e2a.png in
/tmp/aux-parity-2026-10-16. Full check passed typecheck/lint and 4,588/4,589 tests
(only the existing coder-worktrees timeout); renderer build passed in 2.53s.
Navigation tests cover exact destinations, duplicate clicks and inactive controls.

The previous native preview retired through launcher74686 normally: both launcher
and app82128 ended, and disposable aux-dev-i17F6V was removed. A consolidated native
build is the next acceptance step for recent renderer changes. No complete parity
or phase acceptance is claimed.

Privacy & Security now separates Adblock from site permissions and places its
compact switch/Configure card before Privacy (references040–041). Configure
opens a searchable anchored menu of configured sources and bundled recommendations;
selection opens the existing source editor with the chosen source or draft.
Selecting a recommendation does not download it: the HTTPS review remains required.
The editor cannot dismiss during a pending write. Website exceptions remain
available, and blocking uses native acknowledgement with stale-read/duplicate-write
protection. The replaced mixed privacy block was removed from SitePermissions.

Vite visual checks passed compact grouping, search, Add filter and Done. Captures:
/tmp/aux-parity-2026-10-16/aux-adblock-group-vite.png and aux-filter-search-vite.png.
Full check passed typecheck/lint and 4,587/4,588 tests; the only failure was the
existing coder-worktrees timeout. Final typecheck and all11 affected cases passed,
including keyboard entry into filtered menu results. Renderer build passed.
Compiled native verification is pending; running native preview is still a8e2a2ea8.
Filter source-count wording, exact recommendation catalogue, site-settings
navigation and the remainder of the Privacy & Security surface remain open.
Reference folder rescan remains562 files. This is not whole-surface acceptance.

Latest acceptance supersedes the pending area0045 notes below: native
a8e2a2ea8 built in 26 steps (8m46.25s). The disposable preview kept the Aux shell
at normal size at both 25% and 500% website defaults. Fresh example.org and
example.com tabs reported the respective zoom values; Settings retained them
after reopening, and saved website sizes excluded the shell. Restored 100%.
Restart and private-window coverage remain outstanding.

Native shortcut recording passed Tab navigation, Escape cancellation, temporary
New chat binding save/readback, and reset. Cookie policy retained Block all after
reopening Settings, then was restored to Allow. Evidence is saved under
/tmp/aux-parity-2026-10-16 in the native-a8e2a screenshots.

Common shortcut fields now size to their contents (36–160px), visually checked
in the local Vite preview: aux-shortcuts-content-sized-vite.png. The latest
history review dialog opened with counts; Cancel and Escape returned to Settings
without clearing data. These latter observations use mock data. Compiled
acceptance for the dialog, content sizing and Page zoom Reset remains pending.
Renderer build passed. Integrated check passed typecheck/lint and 4,584/4,585
tests, with only the existing coder-worktrees 60-second timeout. Active native
preview remains a8e2a2ea8, launcher74686/app82128, disposable aux-dev-i17F6V.
Whole-product parity remains open.

Appearance now presents the first five common shortcut controls inline, with one
shared recorder and the complete editor available from Manage shortcuts. Explicit
row declarations preserve Settings search indexing. Tab leaves a recorder,
conflicts retain the existing reassignment review, changing presentations cancels
recording, and native accelerators are restored. Agent Rail keeps its truthful
command label; direct split-orientation commands and the global Quick Ask row
remain unfinished reference031 work. This is not complete card parity.
Integrated check passed typecheck/lint and 4,582/4,583 cases (only the existing
coder-worktrees timeout). After adjusting the row presentation for static search
indexing, final typecheck and all three recorder cases passed; renderer build
passed in 2.97s. Live visual acceptance remains pending.

Native39f9e3a26/area0044 completed29 steps in8m47.05s, ABI08299a59570b,
Node26.9. Disposable preview72653 (launcher63412, aux-dev-SNBZqr) passed shared
bookmark import: chooser Cancel retained the editor, standard HTML preview showed
one bookmark/one folder, Import reported one, and SDK bookmarks.list confirmed
exactly the synthetic changed URL in Synthetic parity folder. The TrustedHTML
parser failure is resolved in the compiled app. Screenshot:
aux-shared-bookmark-import-native-39f9e.png.

Native zoom acceptance FAILED: selecting500% also magnified the Aux shell itself.
Restored100% through the native control and captured
aux-default-zoom-shell-regression-39f9e.png plus
aux-appearance-restored-native-39f9e.png. Do not accept the zoom slice from schema
or writer tests. The preview retired through its launcher; both processes ended
and its disposable Profile was removed.

Area0045 pins chrome://aux at100% using Chromium's nonpersistent scheme/host zoom
override before initial shell navigation, independently of website default zoom.
The shell-only entry is excluded from saved website sizes. Applied under the plain
lock; reverse-apply check passes. Compilation/live endpoint tests remain pending.
The current shortcut and cookie renderer changes also need live visual acceptance.

Appearance default page zoom now offers 25%–500%, including the upper choices
in reference025. The renderer, host argument schema and native writer agree on
the range; managed-policy and Profile restrictions remain intact. Area0044 is
registered and applied (reverse-apply check passes). Endpoint writer and schema
tests pass. Integrated check passed typecheck/lint and 4,581/4,582 tests; the sole
failure remains the coder-worktrees 60-second timeout. This run also passed the
final asynchronous bookmark parser UI tests. Renderer build passed in 1.79s.
Native39f9e3a26 accepted shared import but exposed the shell zoom bug described
above. Area0045 requires a fresh disposable preview before range acceptance.

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

Current source adds Appearance → Customize Tidy Tabs, matching capture030’s
compact dialog, 300-character counter, draft Cancel and explicit Save. The saved
preference is persisted through settings and reaches the actual Tidy proposal;
only page titles and origins are supplied, with existing output validation and
review/undo unchanged. Private/stale editors cannot save or publish completions.
Runtime dist rebuilt before tests. All36 focused cases pass; integrated typecheck
and lint pass, 4,575/4,576 tests across733 files pass (only the existing
coder-worktrees timeout). Renderer build passes in1.90s. Live renderer walkthrough confirms Cancel discards, Save closes on acknowledgement,
and reopening retains the43-character prompt. Capture: aux-tidy-saved-live-d3078.png.
Compiled-native Save/reopen and runtime settings.get are now verified in0edb56c33
as recorded above; the later Appearance card ordering remains newer than that build.

**Native544da21a2 / area0042 built and launched.** Build passed38 steps in
8m33.45s; launcher41893 owned disposable preview46360, Profile aux-dev-Q0doIW.
This owned preview has now retired normally; its disposable Profile was removed
and the next plain-lock command acquired successfully. The selected-export
walkthrough accepted an unchanged standard Netscape HTML file after a deliberate
directory xattr/ctime change: one bookmark imported with its folder; SDK listing
confirmed exactly that synthetic URL. Editing the selected file after a fresh
review then refused Begin with permission_denied; SDK listing remained one original
bookmark and zero changed URLs. Evidence: aux-export-directory-change-native-544da.png
and aux-export-file-change-refused-native-544da.png.

The initial compact one-line synthetic HTML parsed as zero bookmarks. It was
replaced with standard export line structure before the successful acceptance;
zero was not counted as writer success. Only owned synthetic files were used.

The shared Settings chooser gap found in native544 is corrected and verified in
native0edb: file selection opens and Cancel preserves the editor. The subsequent
TrustedHTML parser failure is fixed in newer source but still needs compiled
shared-import acceptance. New export reviews now distinguish completed receipts
with a Previous import heading in source; native0edb predates that label change.

Native 2425d212a verification is complete for the changed provider/language UI:
Brave stays checked after the real Chromium URL normalization, fresh Settings and
Home both show Search, and Add’s bounded alphabetized menu adds/saves Akan across
reopening. Build passed 25 steps / 9m06.34s, 217 assets, unchanged host ABI.
The owned preview has retired; its disposable Profile was confirmed removed.

Historical native2425 export walkthrough used only the owned synthetic bookmark HTML. It
populated Detected browser and reviewed category controls, then native Begin
refused the supposedly stale preview. Standard SDK bookmarks.list confirmed zero
bookmarks, including zero synthetic URLs; the human-only import.status SDK request
was correctly denied. No retry or owner source Profile discovery was performed.
The chosen file’s metadata stayed unchanged while its directory ctime changed and
macOS access/provenance attributes were present. Directory metadata appears to
invalidate the current broad snapshot guard. Area 0042 adds an explicit selected-
file scope: one leaf only, strict file checks and pinned directory identity/mode/
uid/gid; whole-Profile content checks remain. Native544 acceptance and changed-file refusal are verified above; a replaced-inode
walkthrough remains unchecked. Patch forward/reverse checks
pass against exact before/current source. Source IDs now show browser display names.

The shared bookmark-file Settings entry has current renderer evidence: native
file chooser opened only the owned fixture, inert parser showed one bookmark and
one preserved folder, explicit Import completed with one item and Done. This
was the mock renderer’s mutation producer, not a native shared-flow acceptance.
Evidence: aux-bookmark-file-preview-live-4e417.png. The fixture remains in its
owned temporary directory for upcoming native tests.

Newer source adds General’s separate Import bookmarks entry through a shared
Library/Settings file-preview flow. Replaced Library’s duplicate parser/import UI
and stale styles. Files stay inert and bounded; preview preserves folders and
supported URLs, then explicit import uses the existing native method. Window/
view retirement protects fresh editors. A known accepted import cannot be retried
merely because its view refresh failed. The synthetic fixture and UI walkthrough
remain pending. Initial integrated typecheck/lint and 4,560/4,561 tests pass
(known coder-worktrees timeout only); final 32 affected cases pass. Renderer build
2.44s. Settings search index now contains 203 fields. This source is newer than
the 2425d212a native build currently in progress.

Latest source recognizes Chromium-normalized search templates by their exact
provider origin, search path and q=%s placeholder. Native verification exposed
Brave’s added source=csChrome parameter: the prior exact-string comparison lost
its selection/checkmark after a successful save. The correction preserves the
actual template, rejects different endpoints/placeholders and does not rewrite
native settings merely to label them. General’s unset New tab mode now displays
Search, matching actual fresh Home behavior; explicit saved Ask remains honored.

Capture 019: Add opens an alphabetized menu backed by 183 local Chromium
accept-language tags, excluding selected entries. Custom code entry is inside
the menu. Density-corrected Languages geometry uses 520px width, 50px rows and
32px content-sized selectors. The menu’s inner scroll area remains bounded even
when anchored placement adjusts the outer surface. Live renderer inspection
confirmed its alphabetic list, bounded height, intended Akan draft row and Cancel.
The exact Chromium-returned Brave template also retained its checked selection.

Captures 020/021: real Detected browser selection follows explicit discovery.
Only its Profile/category review is shown; switching clears previous categories
and extension choices. Empty discovery explains alternatives. Source discovery
and import remain opt-in. Populated visual/native selector acceptance and closer
reference dialog composition remain pending; no owner source Profile was read.

**Last completed native build: `2425d212a`.** Launcher 31852 retired after its
walkthrough; it returned 1 after SIGTERM, but finally cleanup removed its disposable
Profile and released the lock. A subsequent plain-lock wrapper applied area 0042
without clearing any active lock. Next native build must include 0042 and the
shared bookmark-file entry; do not claim their native acceptance yet.

**Compiled/staged candidate: `9d677b376`.** Native build passed in 26 steps /
8m45.61s with 217 renderer assets, rebuilt runtime, Node 26.9 and unchanged
273 methods / 30 events (cce8203bcbd0). The disposable preview proved native
language Cancel leaves the saved list unchanged and Save persists en-GB across
reopening, returning focus to Configure. It also exposed the native provider
normalization and unset-New-tab display bugs corrected in newer source. Evidence:
aux-languages-saved-native-9d677.png and aux-search-engine-menu-native-9d677.png.
The Add menu/catalog/geometry, import source selector and these bug fixes are
newer than this compiled renderer and need their own native staging/walkthrough.

Final typecheck/lint pass; 4,551/4,552 tests across 731 files pass, with only the
longstanding coder-worktrees 60-second timeout. Nineteen focused provider/General
cases pass. Prior final affected integration checks: 44 pass, including language,
import and migrated onboarding; all 20 focused import cases pass. Final renderer
build: 2.10s. Live evidence: aux-language-add-menu-live-d63caf.png and
aux-search-engine-native-template-live.png in /tmp/aux-parity-2026-10-16/.

Earlier native 985ad7381 evidence established real reviewed-folder Project
selection/checkmark, compact Routines anatomy, initial title focus and rounded
model-search focus. No agent run was started for the Project review. Earlier
ffb87541f evidence established a paused daily routine with matching source task
revision/manual criteria and zero occurrences/agent runs. Scratch Project creation,
native folder chooser anatomy and actual pointer reorder remain open.

Work continues on local main against the growing
~/Desktop/Aside UI Reference 2026-10-16 corpus. Latest recursive inventory still
has 192 manifest entries and 562 total files, including derivatives/metadata.
The [active ledger](design/aside-parity-2026-10-16.md) retains the full scope.
Full parity is not established. Previous goal turns made source/native progress;
no unresolved compilation blocker or phase acceptance is being claimed.

Remaining comparisons include the complete ledger, new source native staging,
pointer reorder, exact Time/custom recurrence popup, routine model/notifications,
standalone/task and permission semantics, pagination beyond 200 routines, scratch
Project creation, provider nesting, Settings details and native floating sidebar
behavior. Matched viewports, themes, accessibility, error/approval states and phase
performance/smoke evidence remain required before full-product acceptance.

## Aside parity checkpoint — owner wrap-up

The owner resumed the full surface/option comparison. Home, Settings, composers,
transcripts, model selection, compact windows and shared menu/dialog controls now
use dimensions from the current extracted Aside extension. Settings has one
category rail, full-width editors, appearance thumbnails and real bookmark
visibility, recent-chat count, tab insertion, shrink-to-fit and Quick Ask shortcut
preferences. Complete chat history remains available. The composer has a
searchable model picker with its original catalog/authority checks. Browser-object
search has the reference's compact grouped presentation and preserves the normal
address and command routes.

Held Ctrl-Tab has a renderer preview with stable ordering, commit on Control
release and cancellation on Escape, window blur, tab retirement or changed
browsing context. Native area 0041 forwards the actual Ctrl-Tab chord and focuses
the shell while preserving immediate alternate shortcuts. Renderer tests and
narrow-window observations cover selection, placement and focus restoration;
the physical native hold/release/cancel walkthrough remains unfinished.

The native build succeeded in **24 steps / 8m56.42s**, with 206 renderer assets,
**273 methods / 30 events** (`cce8203bcbd0`) and slim Node 26.9. The disposable
app launched, Home was inspected and two local fixture pages loaded. This
candidate includes area 0041 and the main parity changes, but predates the final
renderer fixes for inspected-work disclosure, empty-transcript layout,
permission-menu retirement, shortcut-save ordering, narrow Home/switcher layout
and dialog animation. It must be rebuilt before those changes receive native
acceptance. Build log: `/tmp/aux-aside-parity-native-final.log`.

Closing typecheck and lint pass. The final full unit run passed **4,513 of
4,514 tests** across 726 files; the unchanged coder-worktrees test reached its
60-second timeout. It passed in **54.1 seconds** in the earlier isolated run.
The initial integrated pass's stale expectations and the new regression tests'
conditional-assertion lint errors were corrected. A full-suite attempt using
the slim Node 26.9 binary aborted with a segmentation fault; the subsequent
standard development Node 26.11 run produced the counts above. The full check
is therefore not all-green. Logs: `/tmp/aux-aside-parity-wrapup-check.log`,
`/tmp/aux-aside-parity-wrapup-tests.log` and
`/tmp/aux-aside-parity-worktrees-postbuild.log`.

At the owner's wrap-up request, implementation stopped at this slice. The
disposable native app exited normally, its launcher exited 0 and removed both
its Profile and the plain build lock. Temporary renderer/browser/fixture
servers were stopped. Resume with one ordinary
`node scripts/dev.mjs --temp-profile` build and the native Ctrl-Tab, Settings and compact-window
walkthrough. Chromium-created tab placement still needs explicit native
creation provenance; the new top/bottom preference currently covers tabs
created through Aux's shell actions. Quick Ask's reference sizing/Profile
picker, broader native prompts and complete surface/state comparison remain
open in [the parity ledger](design/aside-parity.md). No phase, full-parity or
performance acceptance is claimed.

The October 8 pause and older build/profile notes below are historical. Current
development uses the preserved product checkout at
`~/Documents/Code/aux-chromium-product/chromium/src`, the single native builder,
and disposable Profiles. No source has been pushed.

## Sidebar refinement

The left sidebar follows the owner's Aside reference with soft pinned tiles,
fine section dividers, open/closed bookmark folder icons and quiet selected-tab
borders. Aux's existing address field sits directly above Tabs. Bookmark tools
sit beside their heading, empty Chats is compact, and the archive education
notice lives above the footer with its explicit Got it acknowledgement.
Dark/light appearances, narrow-width controls and the address suggestion popup
were inspected in the renderer preview. Typecheck and lint pass. The integrated
check found the two previously recorded unrelated failures plus two old layout expectations; those
expectations were updated and all 42 affected tests passed. Logs:
`/tmp/aux-sidebar-refinement-check.log` and
`/tmp/aux-sidebar-refinement-focused.log`. The native build succeeded in 24 steps /
11m36.93s, with 273 methods / 30 events (`cce8203bcbd0`) and staged Node 26.9.
The disposable app launched and its accessibility tree confirms the new section
order and compact empty Chats. The screenshot/native folder walkthrough was
interrupted before completion; those visual and interaction checks remain open.
Aux is left running for the owner's screenshots. Build log:
`/tmp/aux-sidebar-refinement-build-launch-final.log`.

## Glass appearance correction

The owner resumed UI work after comparing the disposable Aux preview with Aside.
Native area 0040 removes the implicit 80% dark window tint so the default clear
Liquid Glass can respond to the desktop. Horizontal toolbar chrome now uses the
same optional tint as both sidebars, including on new tabs; the selected tab
retains a visible highlight. Content opacity is consistent across tab layouts.
Typecheck and lint pass. The integrated check passed 4,472 of 4,474 tests; the
failures are the generated-host refusal list missing `copyStoredImage` and the
external page-summary retirement expecting an error object but receiving the
trusted takeover symbol. The latter also fails in isolation. Neither test nor
its implementation was changed in this appearance slice. The native build
succeeded in 49 steps / 16m06.22s, including areas 0038–0040, with 273 methods /
30 events (`cce8203bcbd0`) and staged Node 26.9. The disposable app launched;
vertical sidebars and horizontal chrome share the clear material at 0% tint,
and the light → dark switch preserves it. Window-only captures show a much
lighter material and do not establish a desktop-backed match to Aside; the
owner's visual comparison remains pending. That preview was retired normally
before the sidebar refinement build above. Logs: `/tmp/aux-clear-glass-check.log`,
`/tmp/aux-clear-glass-summary-recheck.log` and
`/tmp/aux-clear-glass-build-launch.log`.

## October 8 local checkpoint

Work is consolidated on local `main`. Nothing has been pushed; no hosted CI, signing, notarization or release has run. Aux remains under development. The competitive-browser execution is paused at the owner’s October 8 wrap-up request; remaining work is preserved in [the execution graph](ROADMAP-EXECUTION-GRAPH.md). Integrated source and the native candidate remain distinct from measured acceptance; competitor parity is not yet established.

Read the [fluidity and coding plan](AUX-FLUIDITY-PLAN.md) for the delivered scope, [ROADMAP](ROADMAP.md) for owner decisions and scheduled acceptance, [ARCHITECTURE](ARCHITECTURE.md) for system boundaries, and [native build instructions](../chromium/BUILDING.md) before starting another builder. Earlier chronological notes are [archived](archive/status-before-sidebar-polish-2026-10-07.md).

## Final local checkpoint — owner wrap-up

- **Source:** local `main` includes verified document citations and direct saved-section navigation, early Enter/draft preservation, full-size image Save/Reveal, real native image Copy, and lossless icon compression. Native areas 0038–0039 are registered in `chromium/patches/series` and applied to the preserved product source under the sole lock after the preview retired. Generated source has **273 methods / 30 events**, `cce8203bcbd0`.
- **Built app:** the latest candidate compiled areas 0033–0037 in **44 steps / 26m07.40s**, with **272 methods / 30 events**, `97d6daa5466e`, 200 renderer assets and slim Node 26.9. It includes the citation, early-Enter, image Save/Reveal and window-measurement slices, but **does not include native image Copy or compressed icons**. Those require the next ordinary combined build; runtime-only staging cannot bridge the ABI difference.
- **Observed:** one native four-file selection retained the valid DOCX, UTF-8 text and PDF attachments; the malformed DOCX was not imported. The earlier DOCX Next/Previous and late-fact preview evidence remains valid. No provider call, citation opening, office/image generation, full-chat workflow, receipt Save or clipboard acceptance was completed in this walkthrough. The owner took over the preview; automation stopped. The preview subsequently retired with launcher exit 0, and its disposable Profile and plain lock were removed normally.
- **Checks:** the consolidated citation check passed typecheck/lint and 4,473 of 4,474 cases; its stale Run-returning mock was fixed and the four affected cases passed. Image Copy contracts/UI have focused TypeScript/lint and one affected UI case; native patches have exact replay and code review. No additional test suite or build was run after the owner’s wrap-up request.
- **Remaining:** native compilation/clipboard acceptance for 0038–0039, source-to-office/image journeys, full-chat context, extension/export/cloud/provider walkthroughs, paired performance and the required manual 20-task smoke. The app-size target remains unmet; no phase or competitor-parity claim is made.

## Competitive-browser work in progress

The October 7 approved plan was implemented with three isolated workers and one integrator. Completed slices are on local main. Further builds and acceptance work are paused; the earlier owner deferral described below is historical and does not waive this plan's performance, design or workflow evidence.

- Optional setup now ends after four stages. Starters fill the ordinary composer with current native source identities. The separate first-task dispatcher was deleted.
- Native areas 0087–0090 replace the polling bridge, add Profile-owned memory saving and expose bookmark controls/events without Node. The first candidate compiled in 96 steps / 11m46.78s. With its exact runtime paused, native bookmark folder Rename/Undo, Settings and memory-saver controls remained usable. Chromium proactively discarded a clean background tab; activation restored it. Area 0095 now publishes sleeping/wake state; its changed-flow observation remains pending.
- Ordinary Send now has durable UUID reconciliation and in-memory Temporary/private drafts. Native area 0092 forwards original window authority for reconciliation. A native lost-acknowledgement/restart walkthrough remains pending.
- Independent public web reads overlap under original cancellation and dispatch authority. Native search preference is authoritative. Model working context uses route capacity while preserving the full durable transcript.
- Encrypted indexes/embeddings warm cooperatively outside search; cold recall returns lexical results while vectors prepare. Automatic recall is now bounded and ephemeral at provider boundaries. Forget/model changes/shutdown fence late preparation; active Space policy reads schedule idle prewarm. Historical durable recall snippets remain in old transcripts where writer provenance cannot be established safely; no heuristic deletion of human history is introduced.
- Source collections preserve exact live/captured identities, page metadata pickers and remove selection count walls. Recapture changes the capture identity even under the same clock. Provider excerpts use current human text and the actual remaining input budget after plans, coding evidence and images. Native collection walkthroughs remain pending.
- Native area 0093 owns private AI in the actual off-the-record Profile, with an authenticated UUID, in-memory database, isolated temporary artifacts and last-Profile retirement. The 0091–0093 walkthrough opened private browsing, but its AI worker failed during service startup. Persistence-dependent feature admission was corrected in source; area 0097 provides fixed-stage diagnostics. Native area 0098 and the runtime credential broker now route selected direct/Gateway/OAuth access through the original credential owner; private prompts and refresh tokens do not cross that broker. Streaming revocation, shared normal/private spending limits and original Sandbox credential sharing are integrated in source. The budget owner admits concurrent requests transactionally; normal invoices settle once and private costs retain only anonymous amounts in the original Profile. Connection probes, images, utility calls and cloud resources use the same account limits. Basic private source-backed answer delivery, Stop and last-window cleanup are observed below; broader provider, streaming and shared-budget acceptance remains open.
- Cloud files/processes route to their original retained VM/Session. Native preview and human Changes/Logs/Stop/Undo routes are integrated in source. Process status no longer loads embedded multi-megabyte logs: encrypted UTF-8 chunks serve bounded history windows, with a one-time authenticated schema-4 conversion before API admission. Human Undo uses the original native window and retained Session even after agent dispatch ends. Actual cloud acceptance remains pending.
- The synthetic 300-turn chat workload now mounts eight initial detail panels instead of 300, makes 25 detail/image reads instead of about 900, and preserves focus/drafts. Deferred settled-turn bodies and whole-chat search/jump are integrated. These synthetic results do not establish native timings. Source selections retain more than 30 saved artifacts without truncation. Full conversation exports preserve rich answers, result details and delivered corrections.
- Native area 0099 publishes real Space/workspace bindings from the authenticated runtime and keeps browser tab placement available without Node. Area 0100 identifies the original shell/runtime processes for physical-footprint measurement. Both are compiled. Native Space creation and its authentic runtime workspace adoption were observed with the runtime paused and resumed; formal role measurements remain pending. The original stock app already contains the same v3 timing instrumentation. Aux-only role telemetry does not require a stock rebuild.

The preceding integrated check on checksum-verified official Node 26.9 passed **4,446 tests across 720 files**, typecheck and lint. Runtime dist was rebuilt first. The affected recovery checks all passed separately, with 4.52 seconds of assertions versus 224.98 seconds in the preceding Node-26.7 run. A bare same-process diagnostic also reproduced the upstream Promise-completion defect: 26.7 waited for an unrelated wake callback, while 26.9 completed before it. Node 26.9 is now the source pin and recommended development version; ICU, build flags and the package API floor are preserved. The packaged runtime is now checksum-pinned slim Node 26.9; its owned disposable launch and normal cleanup completed. No timeout, worker-pool or production callback workaround is applied. The integrated test phase took **249.61 seconds under concurrent native build load**; this is not an uncontended development-check performance measurement, and the under-60-second target remains open. Evidence: `/tmp/aux-node269-model-routine-cloud-integrated-check.log`, `/tmp/aux-node269-affected-recovery.log` and `/tmp/aux-backup-node269-probe/RCA.md`. Passing unchanged suites are not repeated. Routine shutdown joins accepted launch receipts before repository closure; ten focused cases passed without unhandled database errors. Borrowed tab readers follow the acknowledged native task-session lifetime, including cold driver connection. Completed cloud servers retain their original Session, funding expiry, native window and Stop ownership. Result revisions have no version-20 wall; concurrent revisions receive distinct ordinals and deck source groups are labeled Sections.

The performance harness records an immediate same-Profile warm relaunch, 100 native input samples per browser for p95 and original shell/runtime physical footprints. Available runtime boot marks include elapsed process time. No complete valid measurement report exists yet.

The coverage audit found ordinary Find/Zoom still depended on Node. Area 0036 moves them to the original browser window and one Profile-owned Find service; runtime retirement cancels its own pending requests without canceling human Find. The old private-only Zoom bridge is removed. Enter now executes the visible Ask/Search choice immediately. The committed-input AI classifier and its 150 ms wait have been removed from the browser path. Explicit utility classification remains available through the governed runtime API, with bounded cancellation and no chat-library entry. Runtime dist rebuilt and the preceding 17 affected tests passed; the immediate command-bar flow then passed 29 affected tests. The 267-method source ABI is `bb4454bd1568`; the native changes compiled, and Find/Zoom were observed with the exact disposable runtime paused. The immediate-Enter renderer is staged in the latest 272-method app; the early-startup walkthrough remains open.

The final source coverage pass removed the separate five-document wall. Document collections keep all metadata and separately protected immutable bodies and previews. Validated old collections convert on first access; untouched historical inline collections have not been scanned at startup. New turns persist exact hash-bound references and prepare relevant ephemeral excerpts within the actual remaining model budget, shared with selected articles. Retry, branch, delegated work and Set runs preserve exact source identities; Remove, source-chat deletion, Forget and backup authentication have explicit handling. Skills and occurrence history now support keyset paging and complete server-side search/suggestions. Full Space export/import round-tripped 501 Skills. Scheduling cooperatively visits all eligible candidates while re-reading current definitions; older work is not skipped by a newest-200 limit. These source changes have focused checks; native document/routine workflows remain pending.

The combined areas 0034–0036 candidate compiled and packaged in **420 steps / 32m32.25s** after correcting the incomplete Mojo input-envelope include. In a fresh disposable Profile, the ordinary composer completed a source-backed Records question through the real default provider, correctly reporting 30 records and saving its answer. This occurred within two minutes of launch. With its exact runtime process paused, native Find showed and advanced between both Jordan matches; native Zoom enlarged the page and reset through the browser shortcut. Normal shutdown exited 0 and removed the development Profile and plain lock. These observations prove those changed flows, not paired performance or complete workflow acceptance.

Private AI now completes a real source-backed answer through the configured Gateway provider, correctly reporting 30 Records across three pages, with verified evidence and a saved result. Authenticated off-the-record settings skip regular-only memory-saver preferences, and task admission uses that original Profile’s private session partition while preserving ephemeral run retention. Configured private key/ChatGPT routes no longer request redundant browsing approvals; provider origin/path, credential owner/revision, cancellation and redirect refusal remain. Typed local predispatch failures survive SDK wrapping. The affected settings, 61 egress and 12 private-provider cases pass.

The native private Stop control cancelled an active research task. Two private windows shared one worker; closing one kept it alive, and closing the last retired it. After completed and cancelled turns, last-window closure exited the worker and removed `/tmp/aux-private-MmKI6f`; the normal browser stayed alive with an empty conversation list. Normal shutdown exited 0 and removed its disposable Profile and plain lock. These observations establish basic private answer/Stop/retirement, without proving every provider, export, streaming revocation or shared-budget/cloud flow. An attempted physical takeover during navigation could not target the retired accessibility element; it is not takeover evidence.

The earlier 270-method candidate compiled and linked in **47 steps / 10m59.84s**, with **270 methods / 30 events**, `289705b74098`. The consolidated 32 areas plus additive `0033-native-browser-api-repairs.patch` are built. Area 0033 repairs the pinned History constructor and keeps an owned hostname through the site-control callback. With its exact runtime paused, native History search and no-match state worked; a new Orchid Space retained native tab placement and acquired its authentic runtime mapping after resume. Download Reveal selected the saved file in Finder; dismissal survived Refresh after resume and kept the file. A native tracker exception persisted across resume. Native Save as PDF produced a real 176,171-byte PDF while Node was paused. These are changed-flow observations, without paired performance or phase acceptance.

A single native selection retained **30 valid documents from 31 files**, reporting the invalid UTF-8 file separately. The provider correctly retrieved **847213 credits** from late in the 159,193-byte document 30 when asked in the side panel. The same question in full chat failed because covering the page destroyed its native input connector; Retry then rejected changed state. The source fix now retains the selected native WebContents layer through full chat, History and Settings while excluding covered pages from focus, input and visible timing witnesses. Normal navigation preserves the connector; actual owner retirement still destroys it. Six focused lifecycle tests pass; the full-chat fix awaits native observation. The candidate retired normally with exit 0, removing its disposable Profile and plain lock. Evidence: `/tmp/aux-native-library-filter-build-launch-api-repaired.log`.

Task evidence now stores its complete JSON in authenticated ciphertext tied to the actual SQLite sequence, with original task/criterion identity checked on read. New inserts never write the plaintext body. Existing evidence converts once with authenticated resumable progress, secure deletion and WAL retirement before completion; subsequent starts check only the completion proof. Backup and cross-Profile recovery preserve authenticated inventory. Physical reopened-SQLite, migration, transplant rejection and protected restore checks pass. The slow backup fixture is callback-sensitive under Vitest: observed stage timings complete in 221 ms, while bare awaits can take tens of seconds. Standalone production backup takes 50–99 ms. A Node/Vitest scheduling interaction is suspected, not established; no production callback workaround, timeout increase or startup-improvement claim was introduced. Runtime dist was rebuilt on main.

The sidebar now retains stable hooks when a tab retires, enables its private Chats disclosure and fetches only three rows for the compact chat preview. Private chat history reads its own ephemeral repository, fences late replies to the original private identity and avoids normal folder storage. Complete history remains available through All chats; preview folder counts no longer claim totals. Twenty-two relevant tests, shell TypeScript and touched lint pass. These renderer changes are staged in the latest 272-method app.

Initial native catalog adoption preserves address drafts, and delayed private Home autofocus respects an earlier Cmd-L; 29 focused cases pass. The private composer now explains cloud request routing and ephemeral chat retention. Account-provider admission bypasses only the default redundant model review after managed/explicit policy, with original-owner checks and genuine parked model continuation; subscription acceptance remains pending.

Native tracker exceptions use the browser’s durable blocking snapshot, with generation fences preserving human changes during downloaded-list updates; the replaced runtime toggle/polling path is deleted. The earlier 270-method picker accepts bounded UTF-8 text. The 272-method source now wires native PDF/DOCX/text extraction, strict import/read interfaces, one schema-5 protected DocumentSnapshots service, original-owner cursor binding, atomic publication, authenticated backup/recovery and bounded previews/retrieval. The dedicated byte-only PDFium/DOCX utility compiled successfully after reusing Chromium’s PDFium include configuration. Complete receipt export streams captured evidence through a native retained-file save claim; closing its original window retires pending preparation. The combined native app compiled and launched. Actual DOCX import, paged preview and retained-composer observation are recorded below; PDF batch intake was observed subsequently; provider retrieval, receipt Save and extension reload observations remain pending. No binary extraction is inferred from filenames.

## Delivered behavior

- Chromium is the only engine. Vertical layout and Ask first default; Skip confirmation is remembered and Auto remains in Settings. The sidebar contains the native address/search field, pinned icon tray, separate bookmark folders and manually ordered tabs. Native browsing remains available without the runtime.
- Compact composers, anchored context/model menus, consistent controls and native glass work in both appearances. Core page rendering is eager; approval UI mounts only for an actual confirmation. Long Settings controls wrap. Project and package choices stay in run options.
- Per-run modes and explicit once/run/site/global scopes share the policy boundary. Exact file/browser/command review binds concrete effects and current authority; broader grants remain separate. Drift, revocation, Stop and late approvals cannot silently enlarge authority.
- Aux's own loop provides governed search, versioned create/edit/move/delete batches, durable changes/diff, reconciliation and conflict-safe file undo. Supervised commands and background monitors retain process identity and bounded log artifacts. Arbitrary command side effects are not advertised as undoable.
- QuickJS coding surfaces use the same admission, journal and suspension path, replay confirmed results and stop on uncertain mutations. Declarative coder profiles use isolated worktrees; integration preserves parent changes and individual outcomes. Aux Packages provide pinned skills, profiles and declarative workflows, without a foreign runtime or permission bypass.
- Tool, budget, model and cloud reviews survive restart through explicit continuation. Native window/workspace/source authority is rebound before dispatch. Accepted ordinary answers persist through budget pauses. Cloud recovery retains exact session identity and funding for uncertain creation, preventing duplicate creation.

## Observed native behavior

Disposable Profiles and a synthetic local Git project were used throughout. The owner's real Profile was not used.

- A real provider completed a reviewed two-file change, with a single exact batch review and confirmed durable receipt. The shipped Aux package and project selection were visible in the native composer.
- A pending command survived normal app shutdown. After reopening, Aux refreshed its exact review and ran `npm test` once: exit 0, one test passed, durable log artifact. File hashes stayed unchanged across restart.
- Native Undo rejected a deliberate later manual edit and preserved both files. Removing only that test edit allowed a journaled reversal that restored a clean Git project.
- A Full-mode background process started without redundant confirmation, produced real monitor output and ticks, and reached stopped state through the native process control.
- Pausing the exact disposable runtime process left native navigation and tab activation usable. The runtime was resumed afterward.
- Both light and dark Liquid Glass remained readable at 0% sidebar tint. Native area 0080 corrects retained material appearance; 0081 forwards native owner proof for undo, worktree/package management and restart continuation.
- A fresh browser-backed question accepted its answer and completed through the configured default provider. The walkthrough exposed and corrected tool-result/context ordering and guarded-source answer admission. After native area 0082, a completed browser chat could immediately start another on the same two tabs.
- A parked question survived normal shutdown and restart: its cached source loaded automatically without manual reload, the same run accepted the answer and completed “Preference saved: Morning,” and Aux saved its report. Native areas 0083–0086 cover restored navigation, owned cleanup identity and truthful cached-response endpoint metadata. Normal shutdown with a parked question and after completion both exited with code 0.

The actual default provider used in these walkthroughs was `anthropic/claude-sonnet-5.5`; the workspace Gateway configuration worked. The inherited shell credential was rejected. A separate small request also verified the configured Luna fast route. These observations do not verify every provider, subscription/OAuth flow or offline model.

## Earlier delivery evidence and current native candidate

Runtime dist was rebuilt before runtime tests. The earlier delivery check passed **4,218 tests across 686 files**, typecheck and lint, with existing advisory warnings (`/tmp/aux-final-owner-command-check.log`). Earlier integrated failures were fixed and rerun in their affected suites; passing suites were not repeatedly rerun. The subsequent reply/context fixes passed **40 focused tests**, including real SDK prompt conversion, native-source drift rejection and strict restored-source admission. Runtime dist was rebuilt and staged; touched-file lint passed. Evidence: `/tmp/aux-final-recovery-focused.log`, `/tmp/aux-final-recovery-mentions.log` and `/tmp/aux-final-recovery-lint.log`.

Chromium is **154.0.8037.98**. The app path is `/Users/rcourson/aux-chromium-product/chromium/src/out/AuxFast/Aux.app`. Its latest native build has **272 methods / 30 events**, `97d6daa5466e`, and launched with matched slim Node 26.9. The areas 0033–0037 candidate reached runtime ready at **1,095.27 ms elapsed process time**; the preceding areas 0033–0036 candidate recorded **526.06 ms**. These single diagnostics are not paired performance acceptance. The previous fully staged 270-method candidate used `289705b74098` and 198 renderer assets; its fresh runtime reached ready at **330.67 ms elapsed process time**. That is one earlier boot observation without a paired comparison, not timing for the new candidate. Runtime-only disposable launches verify the actual compiled ABI before staging. Earlier evidence: `/tmp/aux-native-library-filter-build-launch-api-repaired.log`.

The latest 42-patch source checkpoint is consolidated into **32 disjoint area patches**, followed by the additive native API repairs. Replay from the pinned Chromium baseline reproduced all 850 native paths and exact aggregate bytes; comparison with the product source found zero content or executable-mode differences. This extends the earlier 100-to-32 consolidation. [Patch documentation](../chromium/patches/README.md) records the replay evidence. This consolidation adds no new native behavior or performance claim.

The stock checkout and packaged comparison app are preserved. A role-patch build was stopped normally when missing object outputs requested a full rebuild; its unused additive patch was then retired. Stock retains the same v3 timing triggers, while Aux adds only its shell-role witness. That instrumentation difference will be explicit in the performance report.

The preceding 0091–0093 walkthrough verified Cmd+T then Cmd+L navigation. Pausing and resuming its exact disposable runtime retained an ordinary submitted turn through startup, but the run then failed to read its fixture source. This does not prove successful first-task delivery or lost-ACK reconciliation. Private worker startup also failed as described above. The app and disposable Profile retired normally; the development lock was released before the attempted stock instrumentation build.

## Remaining acceptance

The current implementation is distinct from empirical phase acceptance. Before the competitive-browser plan, the owner deferred broad acceptance: detailed Aside comparisons, the manual 20-task default-provider smoke, offline/provider/OAuth acceptance, and native import/extension/filter walkthroughs. Their targets remain in ROADMAP; none is marked passed from source or unit tests.

The paired native performance runner has been exercised, but setup failures have produced no valid samples or performance claims. Its preparation now uses the normal native UI and ordinary fixture tabs while preserving the privileged shell's exclusion from CDP. Record a benchmark row only after all required observations complete. See [benchmark instructions](native-benchmark.md).

Preserve Stop, Take over, site policy, secret protections, durable effects and undo while continuing development. No unrestricted evaluation or foreign agent harness is required by this implementation.

The current source also removes the duplicate QuickJS WASM payload while preserving
both sandbox execution routes. Installed runtime byte reports now include Node,
ICU and manifests; this is accounting, not a stock-relative size pass. Account
model controls use authoritative configured state for ChatGPT/Vercel/Copilot, and
a completed Vercel sign-in identifies Vercel. Fourteen focused UI checks pass.

Unchanged renderer staging now preserves asset and manifest timestamps, avoiding
unnecessary native regeneration. Disposable byte/inventory mutation verification
confirmed replacement and cleanup still occur when needed; syntax and lint pass.
Native extension reload now waits for actual Chromium completion or load failure.
Its area 0036 is compiled in the latest combined native candidate; the
unpacked-extension walkthrough remains pending.

Explicit provider metadata now excludes non-text models from agent and utility
choices while preserving unknown/manual IDs. Opaque connection revisions retire
late model catalogs and probes, including account A→B→A. Accepted Skill manual,
reviewed and event-triggered launches join before repository closure. Uncertain
cloud commands with retained command IDs keep Retry Stop; expanded visible
completed turns refresh retained servers until terminal/unlocated. These slices
have focused checks; cloud provider execution remains unobserved. Covering a
split view now retires divider pointer capture while preserving its native page
connectors; five focused renderer cases pass, native observation remains open.

The combined native 0033–0036 build succeeded in **33 steps / 30m40.20s** with
**272 methods / 30 events**, `97d6daa5466e`. The owned pipeline compiled and staged
checksum-pinned slim Node 26.9, then launched in a disposable Profile. Native
DOCX import and its saved preview showed the heading and table value 73; Next
section reached the late ORCHID-7319 / 42,860-unit fact, header/footer and
MAPLE-4826 footnote beyond the first 128 KiB. Previous returned to the first
section. Closing the preview or cancelling a subsequent picker retained the
attachment and unsent composer draft. Normal menu Quit exited 0 and removed the
Profile and plain lock. This establishes the changed DOCX flow only; no provider
call, full-chat connector, PDF/text/malformed batch, receipt Save or extension
reload acceptance is inferred.

Later account, retained cloud refresh, split-drag, receipt-completion, early-Enter,
image Save and citation renderer slices plus the generated source-identity change
need the next combined staging/build. Source identity stamping now changes
implementation bytes while preserving header bytes/timestamps; the disposable
staging proof passed. Build duration and app inventories are not performance
acceptance. Evidence: `/tmp/aux-native-272-documents-export-extension-node269-build-launch.log`
and `/tmp/aux-host-identity-proof.json`.

Area 0037 and matching stock instrumentation now measure warm-window creation,
first presentation and live address/shortcut readiness separately, plus exact
tab-switch latency/display-interval pairs in microseconds. The existing runner
retains one accepted callback pair per input and all 100 samples, verifies the
original process and additional window, proves subsequent ordinary address input,
and closes only that new window. Role observation ends after the completed
one-window memory snapshot. Eight focused measurement/target cases, Swift source
typecheck, two renderer readiness cases and shell TypeScript passed. The new
instrumentation is compiled in the latest 272-method build; measurements remain pending. No
performance report or target pass is claimed. The preserved stock app's missing
object inputs need rebuilding before equivalent new measurements can run.

Early Enter now has a lightweight startup handoff into the normal Search/Ask
handlers. It preserves the original prompt and newer unsent typing separately,
waits for the exact native search acknowledgement, and retires on source changes.
Failed Search preserves newer visible text with explicit original-text recovery;
ordinary Send no longer clears a draft edited during its awaits. Focused checks,
shell TypeScript and touched lint passed; native startup observation remains open.

All completed generated images now retain native Save access, including images
too large for inline preview. Small previews remain lazy; larger supported
previews are explicit, and oversized images avoid unsupported message reads.
Image and office-result exports offer Reveal for the exact acknowledged
destination, bound to their original artifact/view and native/runtime owner.
Three focused affected cases and shell TypeScript passed, with no lint errors.
These renderer slices are staged in the latest 272-method candidate; native result-export acceptance remains pending.

Verified saved-document citations are integrated in source. The successful model
step retains only protected source-relative admission recipes; continuation reads
only an actually cited segment and rechecks its immutable capture and excerpt
digest. Typed document citations cannot reconcile browser effects. Public Run
responses and events exclude the internal recipes before event journaling. A
citation opens the exact server-bound saved section, with literal quote
highlighting at its matching locator and honest relative section navigation.
Seven focused runtime cases, one physical reopened-journal/API projection case,
one affected viewer case, TypeScript and touched lint passed. The consolidated
integration check passed typecheck, lint and 4,473 of 4,474 cases across 722 files.
Its remaining suspension fixture returned undefined instead of the coordinator's
Run; the existing mock now follows that contract and its four affected cases
pass. No production shim or broad repeat was added. Evidence:
`/tmp/aux-document-citations-integrated-check.log` and
`/tmp/aux-run-suspension-fixture.log`. Native citation observation remains pending.

The sole-owner combined build completed with 200 renderer assets and native
area 0037 with the stable generated header. Its owned preview retired normally. Both preserved source trees
have their matching window/display-interval instrumentation applied; StockFast
still needs its missing object outputs reconstructed before paired measurement.

A read-only inventory of the observed 272-method app found 514,841,398 logical
file bytes against stock's 353,158,965: **161.68 decimal MB overhead**, above the
90 MB target. Its staged Node 26.9 runtime is 130,976,821 bytes, including a
78,979,712-byte executable and 33,105,536-byte full ICU data. Required Node and
ICU already exceed 90 MB together; trivial cleanup cannot meet the target. No
large duplicate runtime payload remains. The lossless icon-compression
slice is integrated in source, saving 1,550,898 bytes across the three icon copies
without changing image representations; it is not yet in the built app, and startup code-cache changes await actual measurements.
This inventory is not a phase performance pass.


Native image Copy is a human-WebUI-only method. It reuses the original retained
artifact claim, reads and verifies bytes off the UI thread, and decodes through
Chromium’s isolated image decoder without shrinking. It checks the original
window/document and clipboard sequence before writing; a newer clipboard is
preserved. Private copies retain native off-the-record provenance. Cancellation,
replacement and the preparation deadline retire the decoder and exact claim.
The gallery checks that precise method capability once, independently of Save,
and reports Copy only after the native image acknowledgement. Source bounds are
64 MiB encoded and Chromium’s 128 MiB decoded limit; larger originals retain Save.
Native compilation and clipboard observation remain pending.

Final selected-export slice check: typecheck/lint pass; 4,563/4,564 tests
across 732 files pass, with only the longstanding coder-worktrees 60-second
timeout. All 21 focused import cases pass. Native 0042 build is still required.


Next native correction: area0043 forwards the shell WebContents file chooser to
Chromium’s existing BrowserWebContentsDelegate/standard FileSelectHelper rather
than silently inheriting the no-op delegate. No new file-read method is exposed.
Dialog now ignores bubbled descendant cancel events, so cancelling a file input
cannot dismiss its enclosing editor. A focused lifecycle regression covers file
cancel versus actual modal cancel. Area0043 reverse apply check passes; native
compilation and the actual chooser/import walkthrough remain pending.


Area0043 integrated check: typecheck/lint pass,4,576/4,577 tests across733
files pass; only the existing coder-worktrees timeout fails. All5 Dialog cases,
including descendant-cancel regression, pass. Renderer build passes3.03s.
Native chooser forwarding is source/patch verified only until compiled launch.


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

October16 shortcut follow-up: common inline rows now retain compact reset-icon
positions, disabled until a custom binding exists; single-command and full editors
keep their existing reset presentation. Typecheck/lint and4,582/4,583 tests pass;
only coder-worktrees60s timeout remains. Renderer2.81s. Native comparison pending.
Reference040/044 inspection found Security & Privacy card/order gaps and confirms
that the cookie reference uses exactly Allow/Block all, supported by Aux's existing
boolean native policy; its current switch should become that selector.

October16 cookie selector: reference044's Allow/Block all choices replace the
third-party cookie switch, backed by the existing Chromium boolean policy writer.
Managed/private restrictions and acknowledgement/readback remain intact. Row
label now matches the reference; no cookie deletion was introduced. Both writer
directions and managed-policy tests pass. Integrated typecheck/lint pass,
4,583/4,584 tests pass with only coder-worktrees60s timeout; renderer2.13s.
This newer renderer is not part of active native63412; live verification remains.

Active native builder: a8e2a2ea8/area0045, launcher74686, exec session46286,
log /tmp/aux-shell-zoom-isolation-native.log. This build also stages the newer
inline shortcut/reset-icon and cookie-selector renderer. Keep this owner/lock.
Integrated check completed: typecheck/lint pass and4,583/4,584 tests pass; only
coder-worktrees60s timeout failed (log /tmp/aux-shell-zoom-isolation-check.log).
Poll the existing native builder rather than restarting. Next: shell stays100% at website defaults
25%/500%, fresh websites inherit the chosen default, restore100%, verify saved
website sizes exclude chrome://aux, then inspect current shortcut/cookie controls.

October16 Security & Privacy source: Browsing history now leads with compact
Delete/View rows. Delete opens the existing reviewed category/count workflow in a
focus-contained dialog; Cancel and Escape dismiss without deletion, leaving the
trigger mounted for focus return. Inactive sections cannot start a clear. The
component owns its dialog-form styling independently of Library loading. Privacy
contains cookies/crash reports; HTTPS-first is under Advanced. Adblock and site
permissions still need their compact reference040/041 restructuring.
Typecheck/lint pass. Full check4,582/4,584: existing coder-worktrees60s timeout and
native-cdp-broker reconnect30s timeout; isolated CDP+clear-dialog recheck passed all
11 cases in1.13s. Renderer2.57s. This source postdates staged nativea8e2a2ea8 and
still needs live visual acceptance; don't treat it as compiled evidence.

October16 page zoom follow-up: Reset no longer assumes100% is the Profile default.
It remains available once the current page zoom is known, so a100% site override
can reset to a different configured default. Regression verifies100%→500% through
the native reset request. Typecheck/lint pass;4,584/4,585 tests pass across734 files
(only coder-worktrees60s timeout). CDP reconnect passed in this run. Renderer2.01s.
This renderer change also postdates active nativea8e2a2ea8; native Reset acceptance
must use a build containing it. Native74686 remains alive generating debug symbols.
