# Aux status — October 16, 2026


## October 16 UI parity review — in progress

Appearance default page zoom now offers 25%–500%, including the upper choices
in reference025. The renderer, host argument schema and native writer agree on
the range; managed-policy and Profile restrictions remain intact. Area0044 is
registered and applied (reverse-apply check passes). Endpoint writer and schema
tests pass. Integrated check passed typecheck/lint and 4,581/4,582 tests; the sole
failure remains the coder-worktrees 60-second timeout. This run also passed the
final asynchronous bookmark parser UI tests. Renderer build passed in 1.79s.
Native range acceptance and the newer Appearance/import changes still require
a fresh disposable preview; the last built app remains native0edb56c33 below.

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
