# Historical Aux status entries

Archived October 17, 2026. These entries preserve prior evidence and superseded
build handles. They are not current operating instructions. Use [STATUS](STATUS.md)
for the active preview and next work.

## October 17 checkpoint before compact surfaces

# Aux status — October 17, 2026

The full Aside parity goal is active on local `main`. Work remains incomplete.
Use [ROADMAP](ROADMAP.md) for owner decisions and the
[reference ledger](design/aside-parity-2026-10-16.md) for surface evidence.
The accumulated chronological status entries are preserved in
[historical status](STATUS-HISTORY-2026-10-17.md); old preview handles there are
retired and old gaps may have been resolved by later entries.

## Named custom model providers — integrated source

Models Settings now supports named JSON providers with independent destinations,
keys, model catalogs, role choices and disconnect/remove actions. The four
declared transports are OpenAI Chat Completions, OpenAI Responses, Anthropic
Messages and Google Generative AI. Credentials leave the imported JSON before
configuration persistence and use separate OS entries bound to endpoint/protocol.
Changed destinations cannot silently reuse an old key. Anonymous authentication
must be explicit; local-only policy still excludes remote providers.

Settings writes bind the current connection revision, active tasks prevent
connection changes, and previously acquired transports refuse later dispatch
after retirement. Private inference inherits the declared protocol through the
credential-only broker. Custom transports retain inline tool schemas, suppress
authentication when requested and refuse redirects. Explicit reasoning choices
reach the supported protocol fields. The shared dialog, buttons, popup material
and typography tokens serve add/edit and original-control removal reviews.

Runtime dist was rebuilt. Integrated `npm run check` passed typecheck, lint and
4,705tests/751files in136.45s, including all four SDK wire formats, anonymous
headers, redirect refusal, connection/key isolation and private routing.
The final removal-review refinement passed renderer typecheck and4dialog tests
in0.922s. Logs: `/tmp/aux-custom-provider-integrated-check.log` and
`/tmp/aux-custom-provider-final-ui-tests.log`. Native acceptance and real-provider
inference remain pending. The native UI control service currently reports
`Sky Computer Use native pipe startup failed`; no live Aside comparison is
claimed for this batch. Chromium155 continues its separate cold build.

The composer still uses the selected connection's catalog; a combined picker
across saved connections remains separate work. Supported subscription setup,
Memory, channels, routines and cloud acceptance remain open under R5.

## Native autofill accepted; redirect correction awaiting build

Nativec366c7dc8 completed its incremental build/link and launched through
owner79146 in disposable Profileaux-dev-eWrIyF (app85709/runtime API51202).
The synthetic address flow no longer crashes. Chromium's Save address offer,
Edit dialog, Cancel return and Save all worked. Reopening the form exposed the
saved native autofill suggestion and filled every field. Changing the synthetic
name produced the native Update address offer; Update persisted and the next
suggestion showed the changed name. Payment-specific prompts remain unobserved.

The same walkthrough isolated a general HTTP redirect defect. A redacted local
network trace records19same-destination307Delegate redirects after a real302,
ending with ERR_TOO_MANY_REDIRECTS. The content filter unconditionally passed the
unchanged destination as an override. Area0058 now forwards an override only
when policy actually changes the transport destination, and uses Chromium's
redirect helpers for method/body/header/referrer state. Post-task person
navigation receipts now also admit their exact redirect hops; all document,
control-generation and retirement checks remain. Native acceptance follows.

The full integrated check passed typecheck/lint and4,677/4,678tests; the existing
coder-worktree fixture timed out during compilation. Its single failed case
passed in isolation in26.40s. Logs: `/tmp/aux-native-window-handback-check.log`
and `/tmp/aux-native-window-handback-coder-retry.log`. Unchanged TypeScript checks
are retained for the native-only redirect correction. The original launcher
retired normally, removing its Profile, app and lock before native edits.

## Native readiness — window lookup correction awaiting acceptance

The local minidump identifies the repeatable address-save SIGSEGV at
`address_bubbles_controller.cc:62`: the shared BrowserWindow lookup returned
only BrowserView, while Aux uses WebUIBrowserWindow. Area0057 resolves both
native window implementations, including background tabs, and removes a second
BrowserView assumption from the address promo. The actual existing Chromium
address/payment bubble handler remains shared. Native compilation and the
synthetic save/update/cancel walkthrough follow; no autofill acceptance yet.

The same slice deletes the superseded PageSignals takeover callback. Native
platform input admission remains the sole physical takeover producer. Network
factories now retain their document's sticky protection marker after document
destruction; returning control never clears old factory protection or permits
late agent traffic. These changes need changed-flow native observation.

The crash capture used only synthetic local form data and a disposable Profile.
The minidump and symbolized stack remain local in `/tmp`; no process dump enters
the repository. The live debugger request was retired through its original
launcher, including its lock/Profile. macOS Developer Tools authorization is
unneeded for the offline stack. No default-Profile process is running.
The UI tool restarted Aux without the disposable Profile argument after the
first crash; that process was stopped immediately and no further UI inspection
used it. Crash-risk checks now inspect the owned PID before reading UI state.

The separate Chromium155 checkout completed dependency sync/hooks and is
replaying the ordered native areas. The stable product pin is unchanged until
migration and build evidence are ready.

## Compact provider tool schemas — source

OpenAI and Anthropic tool calls now use the SDK's shared local JSON-schema
definitions. The exact51-tool SDK payload measures109,361bytes inline and
54,559bytes with shared definitions. Original Zod validation, tool capabilities,
governed dispatch and prompt-cache placement remain. Compatible transports keep
inline schemas because their parsers may not resolve local references; context
budget accounting retains its conservative existing estimate.

Runtime dist was rebuilt. The initial focused run passed98tests/3files; the final
SDK cases verify compound browser steps, resolvable references and compatible
transport behavior. Typecheck and final lint pass. The integrated test phase
passed4,677/4,678tests; one existing coder-worktree case timed out under native
linking. All3cases in that file then passed in isolation in92.16s. No unchanged
full suite is repeated. Logs: `/tmp/aux-prompt-efficiency-check.log`,
`/tmp/aux-prompt-efficiency-final-lint.log`,
`/tmp/aux-prompt-efficiency-final-tests.log`,
`/tmp/aux-prompt-efficiency-coder-retry.log`.
Real provider/token-latency and native smoke acceptance remain pending.

## Readiness implementation — source

The owner authorized completing all six readiness batches with substantial
implementation slices and focused verification. The active dependency and
acceptance record is now at the top of ROADMAP-EXECUTION-GRAPH.

Native area0056 gives trusted shell tab commands a navigation receipt attached
to the actual Chromium NavigationRequest. Only the exact returned borrowed
document and unchanged retired control generation qualify; runtime tab commands
cannot mint a person receipt. Navigation factories retain it through header and
redirect checks. Protected document tombstones, late task denial and original
Profile cookie ownership remain. This targets the post-task address/back/forward/
reload failure; no native acceptance is claimed yet.

The same batch installs Chromium's existing address/payment autofill bubble
handler in Aux's native window. It obtains its anchor from the actual Aux
location element, with the window content view as fallback. The normal Chromium
window supplies its existing toolbar anchor through the same callback. There is
one implementation of save/update/payment dialogs and no null handler path.

Launcher41079 retired normally before these edits. Its app42302, runtime42316,
API60846, disposable Profileaux-dev-dOcpUP and lock are gone. Native compilation
and changed-flow observation of area0056 are pending; the last accepted candidate
remains769ba5f86. The upstream155.0.8059.85 tag was resolved from Chromium's
official repository for the following security-update batch; the product pin
has not changed before replay/build evidence.

Integrated `npm run check` passed typecheck, lint and4,675tests/749files in108.26s
(`/tmp/aux-person-navigation-check.log`). Area0056 reverse-apply verification
passes against the edited product tree. This is source/integrated evidence;
the native build and walkthrough follow from the frozen commit.
The first native compile stopped at tab_catalog callback binding/name shadowing;
both integration errors are corrected before the incremental retry. No runtime
or renderer behavior changed, so the passing integrated suite is retained.

## Native dropdowns across the shell

Single-choice selects now use startup-loaded Chromium `base-select` styling
throughout Aux, including composer reasoning, Execution, Agent and Settings.
The old Settings-only lazy stylesheet and gradient-arrow implementation are
removed. Picker material uses the same 80% backing, 8px blur and glass rings as
other popup surfaces; disabled states, keyboard focus and accessibility fallbacks
remain. Native values, labels, refs, typeahead and change handlers are retained.
Menu and details keyboard handlers now leave open native pickers in charge of
Escape and typing; closed-select typeahead cannot jump to a parent menu item.
The rail model wrapper no longer stretches a gap between model and reasoning.

The native 021613d38 preview confirmed the earlier content-sized Auto spacing.
Temporary CSS prototypes then confirmed the shared native picker (captures91–93),
Execution keyboard selection/cloud Agent disabling, restoration to local mode,
and Medium persisting from full chat to rail. These are prototype observations,
not packaged acceptance of this batch. A synthetic inspector URL was accidentally
sent while changing DevTools focus and immediately stopped; the UI confirmed
Cancelled by user. The original launcher31315 retired normally; app32382,
runtime32403, API58237, disposable Profileaux-dev-EuqoBh and lock are gone.

Focused validation passed45tests/4files, including actual reasoning selection
through Send, draft-scoped Execution/Agent/package changes, and nested picker
keyboard ownership. Integrated `npm run check` passed typecheck, lint and
4,675 tests / 749 files in101.72s (`/tmp/aux-shared-select-check.log`). The reference folder remains182PNGs.

Native3db40c683 built in7m54.18s. About/native identity and runtime identity match
that clean commit. Before Settings was loaded, reasoning and Execution used the
shared glass picker (captures94–95). Keyboard typeahead changed Execution;
cloud disabled Agent, returning local re-enabled it. Escape closed the nested
picker before its containing popup. Light Theme, Settings, a182-language list
and light Run options passed the same walkthrough (98–101); language editing
was canceled without changes, and Dark was restored. Full chat→rail preserved
Low, and400px/280px footer controls fit (96–97).

Synthetic run`run_mvcshsbe_0p98xw` returned exactly AUX READY. Its runtime record
confirmed reasoning=low, executionTarget=local, agentProfile=read_only,
agentMode=ask and aux-core, with no page context. This proves selected native
controls reach the real provider run. Loaded About Version↔History tab switches
updated the native window title, accepting area0055. Repeated popup and tab
switches did not reproduce the earlier preview exit.

The280px populated rail review exposed its status label shrinking under the
expand action. The follow-up keeps status/actions/chevrons fixed and lets title
text truncate; spacing/button sizes reuse the shared tokens. Integrated check
passed typecheck, lint and4,675tests/749files in100.61s
(`/tmp/aux-rail-header-check.log`). The live Aside window also has a bright native
glass backdrop on the current desktop; no extra dark backing was added to Aux.
Launcher36642 retired normally; its app, runtime, listener, Profile and lock are gone.

Final native769ba5f86 built in8m27.57s. About/native and runtime report the same
clean source. Captures102–103 verify a completed long-title conversation at400px
and280px: title truncates and status, expand, new-chat and close remain separate.
Synthetic run`run_mvct5lla_0z06qv` returned AUX READY with Low/local/Ask first and
no page context. Default400px width is restored, with dark Run options open
(capture104). No diagnostic styles were injected. Live launcher41079/app42302/
runtime42316, API60846, disposable Profileaux-dev-dOcpUP, exec85819,
log`/tmp/aux-rail-header-native.log`. Only this launcher owns cleanup.
This is native acceptance of the dropdown/header batch, not full Aside parity,
20-task smoke completion or a browser-readiness claim.


## Shared popup material and browser search

The live Aside rail-model popup (capture 86) and shipped `bg-glass`/`border-glass`
styles establish an 80% menu backing, 8px blur, 1px inner ring, half-pixel outer
ring and compact shadow. The source now uses this single recipe for menus,
anchored pickers, search and tab previews. The added window-glass decorative
layers were lightening popups a second time; they are removed from these surfaces.
Light and dark material share semantic tokens and solid accessibility fallbacks.
Native area 0055 refreshes the window title on active-tab changes, including
already-loaded tabs that emit no new title event. Reverse-apply verification passes.
The reasoning select now sizes to its selected text instead of its longest option;
its chevron uses the same size and label gap as the other composer triggers.
This fixes the owner's Auto/Automatic spacing report in both full chat and rail.
The popup integration passed typecheck, lint and 4,672 tests / 749 files in
102.40s (`/tmp/aux-popup-recipe-check.log`). The CSS spacing follow-up passed
typecheck (`/tmp/aux-arrow-typecheck.log`). The rail's compact padding and gap
now override shared variables, including the reasoning select's chevron offset.
Popup shadows retain the reference 10% opacity in both appearances. The first
96fdcf27d build was stopped normally before packaging to include those refinements;
its lock retired. Packaged3db40c683 accepts spacing and the native title update
as recorded above.

Native `ed45559fb` built in 8m26.90s. About and runtime both confirmed the same
clean source identity. The sidebar search button opens dedicated browser search;
the real website remains visible and visibly blurred behind it (capture 87).
Search owns input and retires split dragging while retaining page paint. Default
results omit repeated URL lines and the utility footer; keyboard-selected provider
filters retain their controls. No extra search dimmer is painted. A synthetic rail
draft and its current-page context both survived expansion into a full chat with
one toolbar (capture 88); nothing was sent. The integrated search check passed
4,672 tests / 749 files, typecheck and lint in 110.28s
(`/tmp/aux-search-material-check.log`).

That preview subsequently exited with SIGABRT; its log contained no fatal/check
diagnostic and no corresponding macOS crash report was found. The launcher
removed its disposable Profile and lock; the app and API listener are gone.
The replacement walkthrough must include repeated tab switching and dismissal.

The preceding `19dbb7105` preview had native/renderer 19dbb7105 and runtime
275690ec6 because runtime staging follows native linking. It retired normally;
its app, listener, disposable Profile and lock were verified gone. The replacement
kept source frozen until runtime staging finished. Its earlier captures 68–78
confirmed the 400px/280px rail, fresh UUID Project menu and popup focus restoration.

Temporary diagnostics 79–85 showed sharp text through popup material over a
transparent document, while ordinary blur and backdrop blur over opaque content
worked. Live Aside also exhibits faint text through its rail popup; Aux's lighter
backing and extra decorative fill amplified it. The opaque-backing experiment
was not adopted, and all temporary styles were removed. Native search capture 87
confirms that retaining page content supplies its real blurred backdrop. Full
liquid-glass parity still requires the corrected material walkthrough.

The live Aside search popup measures 620×340 logical pixels (local capture 67).
The follow-up uses that width, applies the source context-card fill/blur/ring,
removes the duplicate composer ring, and includes tab previews in popup glass.
Normal-window rail defaults persist when the draft expands into a full chat;
Quick Ask does not acquire that automatic page context.

Runtime reader admission now rejects failed or blank website documents. An
unavailable implicit tab is omitted before admission; explicit and recovered
selections still fail with a clear stale-document error. This addresses the
failed-document path found in L02; it does not fix post-task native navigation.
Runtime dist was rebuilt before tests. The integrated follow-up passed typecheck,
lint and 4,669/4,670 tests; one existing worktree test timed out during native
linking. All three tests in that file passed in isolation (67.52s). The full run
covered 749 files; logs are `/tmp/aux-context-followup-check.log` and
`/tmp/aux-context-coder-retry.log`. Follow-up native acceptance remains pending.

The owner's new rail and search screenshots show a persistent multiline composer,
a context card, compact controls and translucent popup material. The rail now uses
an 84px minimum writing/action area with its selected website card above it; empty
state branding is 44px. Confirmation and Project use compact icon/chevron triggers
with retained names and tooltips. Run options and feature actions share More.
The rail supports 280px through 620px without changing the saved/default width.
Fresh rail drafts expose the current website; explicit no-context choices remain.
Unsaved UUID drafts use the active Space's reviewed projects only after their
metadata/context loads; saved and unavailable chats do not borrow that scope.
Failed/blank website documents are excluded from renderer context selection.

The earlier batch introduced shared `popup-material` and removed opaque overrides
and the second popup pseudo-layer recipe. The follow-up above also removes its
window-glass decorative layers in favor of the reference menu rings. Reduced
transparency and forced colors retain solid surfaces. Full settings editors keep
their separate material.
47 focused tests passed. Integrated `npm run check` passed typecheck/lint and
4,667 tests; one old stylesheet assertion still required the replaced 80% fill.
That assertion now checks the shared popup material and all 26 tests in its file
pass on targeted retry (4,668 tests total). This earlier implementation has the native observations above; the refined
material still awaits its package. The reference folder still contains 182 PNGs; the two new owner images are also
comparison references. Full parity remains incomplete.

Packaged `c5d9bfc67` passed Developers field focus, compact/long Quick Ask sizing,
a real READY reply, expansion into a full chat with one toolbar, grouped footer in
the 400px rail, extension menu and extension-only import editor Escape/focus return.
Quick Ask sizes were 440×202 empty, 440×360 long and 520×640 conversation; Aside's
92px compact draft remains different. Captures 59–66 are local audit artifacts.
Extension discovery/import was not run against owner Profiles.

The manual native 20-task smoke was stopped after two scored tasks: L01-owner
passed; L02-status failed with an invalid `sourceOrigin`. Manual navigation in the
completed L01 tab returned `ERR_BLOCKED_BY_CLIENT`; a fresh tab navigated normally.
The report is local `tasks-local-2026-10-17T18-00-47-270Z.json`; no 20-task acceptance
or phase completion is claimed. Runner/fixture PIDs 14483–14486 were retired.
Native document retirement/navigation and failed-document context admission need
investigation before resuming the smoke. No provider sweep is scheduled.

## Composer, window chrome and extensions — current source

Native `986b4d070` built in 8m28.35s and About confirmed the source. Toolbar
Back/Forward now stay enabled correctly and navigate in both directions. Cloud
setup initially focuses its token field, and Developers follows the reference group
order. Its initial focus still targeted a hidden field in a collapsed disclosure;
the shared focus predicate and editor handoff now skip closed disclosure content.
Quick Ask was unavailable because its new layout method was absent from native
registration. Area 0054 now includes that registration; bridge coverage reports
188 used members with zero missing handlers. Native reacceptance remains pending.

The owner's wide and sidebar composer captures exposed mixed chevrons and controls
wrapping independently. Project, permission, model and reasoning now share one
trigger recipe and chevron. Context and model/action groups wrap together; the
confirmation label stays visible. Full-chat titles/actions share the window toolbar
instead of adding a second header. Extensions uses compact rows with inline pin
controls, management/import first, and an extension-only reviewed import editor
loaded on demand. Existing permission prompts and import receipts remain intact.
The reference folder still has 182 PNGs. Integrated `npm run check` passed
typecheck, lint and 4,663 tests / 749 files in 99.07s
(`/tmp/aux-controls-check.log`). Area 0054 passes reverse-apply verification.
The original preview launcher 7794 retired normally; app 9125, runtime 9146,
API listener 52524, temporary Profile `aux-dev-vD5Ku7` and native lock are gone.
The replacement package is the next required observation.

## Settings editor behavior and layout follow-up — source

Packaged `0ea3c3575` built in 8m22.98s and About confirmed its source. Native
rename/reorder/preview/save completed without the previous Selection conflict;
reload retained the new name/order. New-action focus and removal focus passed.
MCP fields, Models card edges and password transfer controls were reviewed.
Cloud setup cleared a synthetic token draft on dismissal. Night shift opened
with the time focused and persisted 00:01 with overnight work still disabled.
Quick Ask transferred a synthetic draft intact into a full window, and a real
default-route chat returned `READY`. Native navigation/bookmark creation worked;
a destination redirect error recovered with Back. Toolbar history buttons still
incorrectly appeared disabled, leading to the next source correction. Local
captures 50–57 include a 1200×850 logical-pixel light editor walkthrough.

## Browser readiness and remaining shared parity — source

Native catalog history flags now survive late runtime page snapshots/patches,
keeping toolbar navigation usable independently of runtime updates. Shared
settings editors focus fields that arrive asynchronously without stealing focus
after user interaction. Developers follows the reference group order; client and
scope controls stay fixed during connection requests, and route/window retirement
discards late configuration results. Cloud setup can retry a failed status read.
Feature cards use the reference's 16px title and 14px description tokens.

Native area 0054 adds bounded Quick Ask layout updates, accepted only from the
current compact window. Drafts start at 440×184 and grow up to 360px; conversations
use 520×640. The renderer measures draft content independently of window height
and avoids repeating unchanged resize requests. Aux's native window controls and
full composer controls retain a taller minimum than Aside's 92px draft. This is a
remaining parity difference, not complete Quick Ask acceptance. Integrated
`npm run check` passed typecheck/lint and 4,662 tests across 749 files in 95.01s
(`/tmp/aux-parity-readiness-check.log`). The native patch passes reverse-apply
verification against the checkout. Native follow-up evidence and corrections are recorded above.

## Earlier settings editor source details

The native5c4a43a07 walkthrough found Selection & Capture misclassifying its own
persisted settings broadcast as an external conflict. Pending saves now retain
ownership only for their exact expected value or a previously acknowledged value;
other revisions and retired window/Private owners still invalidate delivery. New
actions open their editor immediately, and moving an action returns focus to its
name. Night shift also keeps its exact broadcast pending until the native ACK;
its editor closes only on success and remains searchable before mounting.

Shared regular/wide dialog tokens and field/action layouts fix compressed action
controls. Developers connections and cloud account/rate setup now use focused
editors. Cloud credentials are ephemeral and clear on dismissal. MCP setup removes
the duplicate heading/border. Models provider and Connect edges align, and empty
Skills no longer reserves two empty panels. These changes await native acceptance.
The integrated check passed typecheck/lint and4,654tests across747files in106.89s
(`/tmp/aux-parity-followup-check.log`). A further delayed-prior-broadcast case and
search/editor regressions passed28focused tests; final typecheck passed. The last
password-transfer geometry correction uses the same field/action layout. No
unchanged full suite was repeated.

## Settings structure and editor batch — packaged5c4a43a07

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
tests passed, as did focused lint. Packaged5c4a43a07 built in8m38.02s and About
confirmed its source. Compact Selection, Skills/MCP keyboard switching, MCP setup,
Models, Night shift and Quick Ask were inspected. Captures40–48 exposed the save
race and compressed editor/provider geometry addressed above; this package is not
full acceptance of the batch.

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

The5c4a43a07 preview retired normally through original launcher **92379**.
App **93690**, API **49536**, disposable Profile **aux-dev-ZXr486** and the native
lock were verified absent. CUA binding `settingsBatchApp` is stale. Its final
capture49 confirmed password editor focus/dismissal geometry and exposed cramped
transfer buttons, now corrected in source. The first replacement build (launcher98844) was retired normally during early
compilation to fold in reference-derived neutral primary-button tokens,384/512px
dialog widths and MCP label alignment. Its builder and lock were verified absent.
The consolidated `0ea3c3575` preview retired normally through original launcher
**117**. Launcher/app 3397, API 51079, disposable Profile aux-dev-uD6wXE and the native
lock were verified absent. CUA binding `editorFinalApp` is stale. New source changes
above have not yet been packaged; the replacement preview is pending.
Never embed the full mock renderer inside Aux.

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

---

# Aux status — October 16, 2026

Current replacement build: **dd642e5a4**, launcher **8670**, exec **81841**,
log `/tmp/aux-focus-handoff-native-build.log`. The previous launcher4140, app5496,
runtime5517, disposable Profileaux-dev-NybYhE and lock retired normally and were
verified gone before replacement. Do not use retired memoryActivityApp binding.
Changed SurfaceEmbed connector/host and shell native sources have compiled; full
link/package and live acceptance remain pending. Wait on this same builder.
Do not edit runtime/renderer before staging finishes. Next acceptance: About,
Bookmarks search focused → Cmd-T → immediate typing; Escape without clicking the
command field; Cmd-L and return to page input; check window deactivation preserves
page input ownership. No native fix claim until these checks pass.

Focus handoff source patch **0052** is applied in the native checkout and recorded
in the patch series. SurfaceEmbed element blur now returns keyboard ownership to
its parent when that child still owns focus, excluding window-focus notifications
and pending nested embed focus requests. Native shell shortcuts and focusShell
explicitly release the active embedded page before focusing the shell. This
addresses the reproduced Cmd-T/typing/Escape failure below; native acceptance is
pending. Integrated `npm run check` passed typecheck/lint and all4,620tests in
744files (95.67s), log `/tmp/aux-focus-handoff-check.log`. No renderer/runtime edits.

Previously accepted preview (retired): product **2408e4727**, launcher **4140**, app **5496**,
runtime **5517**, exec **37073**, disposable Profile **aux-dev-NybYhE**,
API `http://127.0.0.1:60568`. Log `/tmp/aux-memory-activity-native-build.log`.
Native build passed in **9m36.99s**. About verified clean source
2408e4727a04378863f612cfe10e4044201e5f2e, Chromium154.0.8037.98 and ABI9021388e….
This preview is retired; its CUA binding memoryActivityApp is stale.

Native acceptance: a real synthetic two-sentence notebook chat completed and
produced two pending review notes. Memory History opened Activity by default,
showing the source title, date, Chat completed trigger, measured2ms duration and
2notes; local extraction explicitly has no model request. Recovery revisions is
a separate view and correctly empty before note acceptance. Capture:
`/tmp/aux-parity-2026-10-16/aux-memory-activity-native-2408e4727.png`.
No unchanged tests rerun. Reference corpus remains182PNG.

Next concrete defect: from native Bookmarks with its search field focused,
Cmd-T then immediate typing opens the command surface but text reaches the old
page. Escape also fails to dismiss until clicking the command input. This
reproduces the earlier fixture observation in the new packaged app; it is not
merely an unverified timing suspicion. CommandBar surfaceMode layout effect
focuses only the DOM input; the separate address focusRequest path calls native
bridge.focusShell then refocuses. Native DispatchAuxShortcut already calls
WebContents::Focus before emitting the shortcut. Trace native embedded-content
focus ownership and overlay handoff; do not assume a delayed retry fixes it.
The source fix above awaits a replacement build. The preview is left on native Bookmarks with search
cleared after clicking the command input and Escape. Broader parity remains open.


Source batch: Memory History now opens a dated extraction-activity list and detail
pane, with Recovery revisions retained as a separate view. Records contain actual
local extraction duration, manual/completed-chat trigger and candidate identities;
no model token/cost figures are invented. Successful and no-change extractions are
committed with notes in encrypted `activity.json.enc`, bounded to 200 records.
Restart, recovery export/import, extraction deduplication and source/claim/all
Forget include activity; activity-only removal also refreshes managed recovery.
The read API is Aux-WebUI-only and rechecks source eligibility before displaying
its title. Existing pre-activity generations remain readable without fabricated
history. Document tree, model-based extraction/usage, errors, file diffs, index
status and episodic retention remain open.

Validation: integrated check passed typecheck/lint and 4,619/4,620 tests in104.26s.
One descendant-Forget expectation omitted the new removed activity count; corrected
it, then typecheck/lint and all56 tests in the three affected suites passed.
Renderer build2.19s. No passing full suite repeated. Logs
`/tmp/aux-memory-activity-{check,retry,renderer}.log` and final typecheck/lint logs.
Synthetic Vite preview checked selection, dated grouping, no-change detail, wide
dark and narrow light layout. Final narrow light capture:
`/tmp/aux-parity-2026-10-16/aux-memory-activity-narrow-light-vite.png`.
Wide capture predates the final stronger active-row color. Temporary fixture files
were removed and its tab closed. Native Memory activity acceptance is recorded above; the previews below are historical.


Previously accepted layout preview built successfully in **9m10.20s**. Launcher **95514**,
app **96859**, runtime **96875**, exec **35247**, disposable Profile
**aux-dev-cVMdy3**, runtime API `http://127.0.0.1:58795`.
Log `/tmp/aux-layout-defaults-build.log`. Preserve this launcher's cleanup ownership.
About reports product **f95a500ce2a37b65552022dfa31f5349d7c993d9+dirty**,
Chromium 154.0.8037.98 and ABI 9021388e…. The native identity was captured after
renderer generation changed settings/search.generated.ts; that exact search-copy
change was subsequently committed in **196c543fd**. Docs-only HEAD advances are
excluded from product identity. Do not label this app 930d6632f or a clean build.
The current checkout is clean; no product source changed during runtime staging.

Native acceptance: fresh Profile sidebar expanded and toolbar visible, with actions
at the right edge. Explicit Auto-hide preference switches on; Labs opt-out leaves
the toolbar visible despite that saved preference. Reading-list mark-read moves
the item to Read and retains focus on its action button. Native Bookmarks reloads
and preserves Private/group/split opt-outs while the owned runtime process is
suspended (STAT T verified); runtime was resumed (STAT S verified) immediately
afterward. Feature settings were restored on, Auto-hide preference off.
Capture `/tmp/aux-parity-2026-10-16/aux-visible-navigation-f95a500ce-dirty.png`.
No unchanged tests were rerun; f95a500ce integrated check already passed 4,618 tests.

Memory references 072, 074 and 075 were reopened. Current revision history is not
the extraction-activity history in 074; current report splitting has no model usage
to display. Document tree, real extraction activity, index status and retention
remain implementation gaps. See `docs/design/memory-parity-implementation.md`.
Broader parity, matched light/narrow views, populated History, phase perf and manual
20-task smoke remain incomplete.


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


## Retired ownership notes before the final popup preview

## Current build ownership

No accepted product preview is running. The last accepted unchanged product
observations belong to `c366c7dc8` (Chromium154, areas through0057); its disposable
launcher retired normally. Area0058 compiled in the155baseline and still needs
changed-flow acceptance. Area0059's compact Quick Ask compiled in the155candidate
and still needs changed-flow acceptance.

The isolated `aux-readiness-chromium` worktree, branch
`codex/chromium-155-security`, completed its58-area baseline at `96f772c6d`.
Source is `/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src`,
official155.0.8059.85 / `0e66b94549a8bd85f03fbdf189b752d6e7b63c32`.
The first two cold attempts exposed a changed WebSocket storage-access callback
and the removed password-store result type. Those boundaries were rebased in
areas0007/0015; their original owners90979/67020 retired normally. Owner85228
compiled both affected credential objects and completed the remaining build in
29m28.15s (`/tmp/aux-chromium-155-credential-build.log`). All58areas replay across
890owned paths with matching bytes/modes (`/tmp/aux-chromium-155-final-replay.log`).

The155app launched as2370 with disposableProfile`aux-dev-USiBHb`. Its first
runtime worker timed out awaiting `native.profileStorageFactor`; a subsequent
worker reachedReady in46.66ms and answered the normal `runtime.describe` API.
The sanitized receipt is `/tmp/aux-155-baseline-runtime.json`. The1s native sample
was collected after the initial stall cleared and does not establish its cause.
No storage-factor timeout workaround was introduced without diagnosis. Original
launcher85228 then retired app/runtime/Profile/plainlock normally, all verified.

Current main through6351de349 was merged into the155candidate at `d253a1242`,
including area0059. Owner3890 completed its40-step incremental build in8m48.63s
(`/tmp/aux-chromium-155-current-source-build.log`). Disposableapp7136 reachedReady
in63.75ms and answered461API methods with matching native/runtime commit receipts
(`/tmp/aux-155-current-runtime.json`). It then exited withSIGTRAP; its log does
not identify the trapping native frame. This is not accepted startup stability.

The same candidate ran under LLDB as9344/Profile`aux-dev-OH9Hh6`, owner9023,
and reachedReady in82.58ms. The crash did not recur during that observation.
Retiring LLDB exposed its default detach-on-error behavior: app9344 survived in a
separate process group after launcher9023 exited. That exact disposable target
was terminated and verified gone. The launcher now sets target.detach-on-error
false so debugserver kills its original target on disconnect; native retirement
verification of this setting remains pending. No active target/lock from this
probe remains. Diagnostic log: `/tmp/aux-155-debug-current.log`.

Integrate the completed owner-document and popup/motion source into the155
candidate, then build under one owner. Capture the actual stack ifSIGTRAP recurs
and inspect changed surfaces when native UI control is available. Root main stays
pinned154 until migration acceptance; stable product/stock checkouts remain
untouched. No storage-factor workaround was added. Earlier logs remain in place.

Local fixture96158 serves address POST→303,302navigation and a synthetic test-card
form at `http://127.0.0.1:4826`; no form fields are logged. Its prior owner87871
retired normally. This setup is not native acceptance.

Native UI control currently reports `Sky Computer Use native pipe startup failed`,
including after resetting its session. No current live Aside or Aux visual check
is claimed. CUA bindings from retired previews must not be reused: a stale binding
can launch the default Profile. Check the owned app PID and disposable Profile
argument before creating a new binding. Only disposable Profiles are authorized.


## Superseded adoption checkpoints through source34117c740

The following status text is preserved as historical evidence. The current operating state is in STATUS.md.

# Aux status — October 17, 2026

Full Aside parity and browser readiness remain active and incomplete on local
`main`. [ROADMAP](ROADMAP.md) records owner decisions; the active adoption A1–A9 and readiness R1–R6 work is in
[the execution graph](ROADMAP-EXECUTION-GRAPH.md). Detailed earlier evidence and
retired preview handles are in [historical status](STATUS-HISTORY-2026-10-17.md).
Older entries there are not current operating instructions.

## Aside adoption foundation — October 17

The approved full program is recorded in [the adoption specification](design/aside-adoption.md).
The first source slice corrects startup bundle traversal and cache usage accounting,
removes broad runtime validation from initial browser code, bounds idle prefetch and
WebSocket queues, and adds liveness/authority checks. Shared tokens, popup material
roles, controls, drag switches and 45 utility silhouettes now follow the reference.
Home spacing, single-scroll Settings, shared chat cards, Memory tree navigation and
narrow nested model menus have source implementation and focused tests.

The integrated check passed typecheck and lint, with 4,800 tests passing and three
obsolete glyph-path assertions failing. The six-test icon file passed after those
assertions were updated for the adopted filled utility glyphs. No product source
changed after that integrated run. Evidence: `/tmp/aux-aside-foundation-check.log`.
This is source verification, not full native appearance or capability acceptance.
Compaction, Dream, desktop context, PDF jobs, richer channels and app adapters remain
in progress. The corrected report on the prior emitted assets is 873 KB startup JS
and 213 KB CSS; the rebuilt foundation measurement is recorded below.

Foundation source is committed locally as `7806e41fc`. The rebuilt production
renderer measures **741 KB startup JavaScript / 214 KB CSS / 2,918 KB total
JavaScript** using actual boot/preload/static closure traversal. The 490/180/1,800
KB targets remain unmet; these bytes are not startup timing evidence.

The 26-step Chromium155 foundation build passed in8m38.08s
(`/tmp/aux-aside-foundation-native.log`). Its disposable launcher39142/app42802
advertised source7806e41fc and the prior274-method ABI. Runtime Ready84.7ms is a
single startup observation, not a cold-performance benchmark. Native Home and
Settings were inspected: Home spacing, Settings heading/body scroll ownership and
solid search results work in the observed dark state. Current bounds were
1728×1005 logical pixels versus the reference1712×989, so exact-bounds, both-theme,
narrow and all-state comparison remains open. Captures are under
`/tmp/aux-aside-7806-native/`.

The foundation preview retired through Aux's application-menu Quit. Its original
launcher/app, disposable Profile `aux-dev-zBc4rt` and plain lock retired normally.
Runtime shutdown reported a late powerRelease against its already closed native
channel. The next source slice explicitly distinguishes disconnected-owner cleanup,
and native retirement ends the original power assertion before admitting another
connection. Changed-flow native verification remains pending.

## Conversations, Memory and automation — integrating

Source adds exact-boundary semantic compaction, hydrated context occupancy and
controls; revision-bound queued-message order with immutable admitted context;
authoritative site/routine Memory documents; Dream/proposals/diffs/revert; unified
heading/line-aware recall; scoped channel commands/interactions and encrypted
per-file attachment originals; snapshot-bound routine drafts; admitted image
references; and masked full-page screenshot fallback with actual extent/reason.
All continue through existing authority, encryption, accounting and retirement.

The integrated `npm run check` now passes typecheck, lint and **4,878 tests across
776 files** (`/tmp/aux-aside-capabilities-check3.log`,86.22s unit suite). The earlier
full attempt found missing required methods in test fixtures, deferred handoff
context published after its boundary, late source-revocation accounting and a
recovered-answer status transition. These were corrected without permissive
production fallbacks. The changed210 conversation/lifecycle tests pass separately;
all three long worktree fixtures also pass without timeout changes. The Memory
activity region now has a named accessibility role. Five masked screenshot
integration tests pass in a real headless browser; this is separate from native155
appearance acceptance.

Native area0060 contains async dispatch, bounded outgoing transport, connection
power retirement and isolated image normalization. It passed an incremental native
build in35steps/8m03.15s (`/tmp/aux-aside-native-async-compile2.log`) after replacing
two rejected unsafe pointer expressions with bounded spans. The six-path area
replays exactly from the preceding59 patches and reverse-checks against current155
source (proof `/tmp/aux-aside-native-area-proof.json`). Native ABI is275methods/
30events/hash`cf5a4db25bd7`. The diagnostic build predates the clean source commit
and new renderer packaging; live changed-flow verification remains pending. Its
original builder51531 has retired and its lock is absent. Use the existing launcher
for the next disposable clean candidate, and do not clear an active lock.

At07199225f manual compaction required a running agent-loop turn. The following
working slice adds owned idle-chat compaction; its current evidence is recorded
below. Source, compilation, native observation and full program acceptance remain
separate evidence.

Configured voice transcription, isolated native byte document intake/seven PDF jobs,
selected-app desktop context, connected-app adapters, remaining UI states, default
20-task smoke, matching155stock performance and earlier SIGTRAP diagnosis remain
open. Account-only background Memory model routes still require a supported
background admission source and honestly refuse without one; API-key/local routes
use existing admission. No real channel messages, pushes or releases were made.

## Current clean native observation and follow-on slice

The clean `07199225f` candidate built successfully in25steps/8m08.12s
(`/tmp/aux-aside-capabilities-native.log`) and its General pane advertised exactly
source07199225f / Chromium155.0.8059.85 / ABIcf5a4db25bd7. Runtime Ready77.87ms
is one diagnostic observation, not a performance result. In its disposable Profile,
Home Ask retained pasted Unicode text and native selection. This does not prove
IME composition or early first-input transfer. Memory's new workbench rendered,
but a Create action correctly refused: native ingress omitted the required
original-window proof. The routing audit also found Channels and an older task
replacement action omitted from that manual list. A contract-generated routing
list plus source regression checks is replacing the list; changed-flow native
verification is required before accepting those controls.

Captures are `/tmp/aux-aside-071992-native/`. The original launcher59647/app65535,
Profile`aux-dev-An0QA0` and plain lock retired normally through application-menu
Quit. The former disconnected-channel powerRelease shutdown error did not recur.
This observation does not resolve the earlier SIGTRAP or browser-readiness gates.

The following source slice adds four Aux artwork heroes,180×44 context cards and
nine glyph corrections, plus explicit account/permission UI. Isolated both-theme
geometry at1712/700/400px is recorded in [artwork evidence](design/aside-ui-artwork-2026-10-17.md).
These are renderer observations, not current native all-surface acceptance.

Working source now contains:

- Genuine idle-chat compaction utility accounting, protected exact-boundary
  inheritance, original cancellation and next-turn use. Active private-window
  compact/cancel controls retain their actual run/window token ownership rather
  than borrowing the normal-window-only idle path. The26 focused owner/idle/routing
  checks pass (`/tmp/aux-compaction-owner-tests.log`).
- Background Memory model-job admission through API/local/Vercel/ChatGPT routes,
  exact sources/consent/model generations, actual usage/cache receipts and joined
  retirement. Copilot/private background routes explicitly refuse unsupported
  admission; no live inference acceptance is claimed.
- Separate encrypted selected-app desktop context with capture off by default,
  native consent counters distinct from restored Settings, bounded AX/local OCR
  and join-before-retirement. No desktop capture was enabled and no OS permission
  was granted. Model source admission/retirement is still being completed.
- Optional channel transcription using an explicitly selected Gateway transcriber,
  immutable complete-decode native inspection, original per-file receipts and
  partial-failure retention. WAV/Ogg/FLAC/MP3/AAC-in-MP4 are inspected; WebM is
  explicitly unsupported. No development Gateway key was present, so the standalone
  synthetic probe sent no request and establishes no live transcription result.
- Seven isolated PDF operations, snapshot-bound immutable original byte reads,
  selected/run-owned source inventory, encrypted manual/task originals and exact
  channel-original reuse. Scanned PDFs preserve bytes with honest empty located
  text/warnings. Schema10 includes Google9 grants and original document chunks;
  recovery rekeys bytes and retires restored account/grant authority.
- Six normal-window Google setup/account/grant methods and real governed loop
  dispatch through the original RunControl, Stop and durable write ledger. Calendar
  retains its existing grants. Gmail/Docs/Sheets/People and four read-only YouTube
  search/video/comment/reply operations have sealed REST requests. YouTube needs
  its own scope; caption downloads are not advertised. Authorized watch-page reads
  preserve actual cue timing/language and reject stale video identity.
- Official Notion/eligible Slack MCP setup, discovered capabilities and provider
  OAuth behavior; captured connector selections bind exact account/source/tool
  authority. Gateway Perplexity/Exa structured search retains actual sources,
  requested/default/observed filter provenance, original funding/cancellation and
  unknown search-cost components. HTML fallback is labelled and rejects unsupported
  filters. Authorized Google/Bing image-page extraction returns source links and
  only page-supplied dimensions, without fetching image bytes.

The integrated `npm run check` passed typecheck/lint and **5,088 tests across804
files**, with one existing coder-worktree case timing out at60s while the native
linker was active (`/tmp/aux-connected-integrated-check2.log`). The unchanged failed
file passes all3 cases in a quiet rerun (65.10s total, each case below its original
60s limit; `/tmp/aux-connected-coder-rerun.log`). No timeout was raised.
The preceding100-case focused run exposed two historical schema fixtures that
left the new document table behind; those fixtures were corrected while production
inventory validation remained strict.

The renderer builds (`/tmp/aux-connected-shell-build.log`), measuring **749 KB
startup JS /213 KB CSS /2,995 KB total JS** through the corrected closure traversal
(`/tmp/aux-connected-bundle-budget.log`). Byte targets remain unmet; these are not
native startup timings.

Native areas0061–0064 cover window-proof routing, isolated media jobs, selected-app
context and immutable PDF originals. Forward/reverse checks and actual-source byte
proofs are `/tmp/aux-native-followup-area-proof.json` and `/tmp/aux-native64-proof.json`.
A baseline204-step app build passed in11m07.94s
(`/tmp/aux-desktop-media-native-build.log`); it predates the latest source/renderer.
The subsequent12-step PDF byte/parser/host object build passed in1m52.71s
(`/tmp/aux-pdf-source-object-build2.log`). Expanded PDF/audio fixtures previously
passed9/9 (`/tmp/aux-media-expanded-native-fixtures.log`); the current10/10 native
PDF/audio/import tests pass, including canonical empty-text digest, counted
warning and unchanged source bytes (`/tmp/aux-native-pdf-audio-current-tests2.log`).
The final fixture rebuild passed2steps/2m00.35s
(`/tmp/aux-pdf-import-fixture-build2.log`). Current ABI is278methods/30events/hash550bdeb5fbbd.
A new clean native app build and changed-flow observation remain required.

The separate155 stock source/dependency checkout is pinned to the same upstream
revision. Its eight-path benchmark patch passes source replay/byte proof
(`/tmp/aux-stock155-proof.json`). The fresh stock graph requires a full compile;
its original builder was interrupted normally to prioritize product verification.
No matching-stock timing result exists. Existing154 trees were not reset.

All25 available Aux crash reports identify154.0.8037.98; none identifies155app7136.
The old155SIGTRAP remains unresolved and is not excused by later successful starts.
The default-route20-task smoke, current native matched-dimension comparisons,
browser workflows and performance acceptance remain open. A subsequent Google recovery fix
validates original account lookup identity and rebuilds the destination Profile
HMAC after re-encryption. Its rebuilt runtime, scoped lint and27 affected
recovery/restore/account tests pass (`/tmp/aux-google-restore-main-tests.log`); the
regression instantiates the restored Google account service and verifies the
destination lookup rather than merely checking row state.
X and LinkedIn adapters and desktop model-use completion remain active. Google/X/Slack registration and
account access stay explicit setup dependencies per the owner's decision; no fake
connections, real third-party messages, pushes or releases were made.

## Local main consolidation — October 17

All completed readiness implementation is consolidated on local `main`, including
Chromium 155.0.8059.85, its rebased native areas and build fixes from
`codex/chromium-155-security`. The product branch's named providers and shared
tool schemas were already integrated; main also retains subsequent authority fixes.
The isolated preview was subsequently retired normally as recorded above.
No stable Chromium checkout was reset, and nothing was pushed or released.
The consolidation check passed typecheck, lint and all 4,784 tests across 762
files in 95.15s (`/tmp/aux-main-consolidation-check.log`). Application, runtime,
launcher and native source match the compiled candidate; only current docs differ.
No redundant native rebuild was needed for this source-identical consolidation.

This consolidation changes the development baseline, not its acceptance status.
The unresolved SIGTRAP, native visual comparison, migration and browser smoke
checks remain open. Use the matching 155 source for future native builds; the
older 154 product/stock trees are not matching build or benchmark inputs.

## Earlier readiness build ownership — historical

The retired local preview was the isolated155candidate `a22cc01b2`, containing
main through `d494c0688` (owner documents and final popup/motion overrides).
Source is `/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src`,
official155.0.8059.85 / `0e66b94549a8bd85f03fbdf189b752d6e7b63c32`, with59areas.
Its35-step incremental native build passed in8m55.53s
(`/tmp/aux-155-final-popup-native-build.log`). Runtime Ready took71.23ms.

Original builder15811 and its disposable app18882, debugserver18883 and runtime
18910 retired through the normal launcher. The observed Profile-removal event
found all four target processes gone and the lock absent
(`/tmp/aux-155-debugger-retirement.json`). LLDB now has detach-on-error disabled;
the earlier orphaned-target behavior did not recur. That Profile was removed.

The same compiled native/renderer assets were reopened with the standard launcher
and ABI-checked runtime staging. Its final owner was19445, app19611, disposable
Profile`aux-dev-BWXBny`; it was observed under LLDB for crash capture before retirement. Runtime Ready
took82.42ms. The receipt `/tmp/aux-155-popup-preview-runtime.json` verifies matching
native/runtime commit, a clean runtime tree,462API methods and the new owner-
document method. All273product host methods are advertised; the274thgenerated
method is appearanceSnapshot, an explicitly conditional test/observation hook.
Compiled ABI remains274methods/30events/hash4afd8361e388.

The earlier candidate app7136 exited withSIGTRAP after startup; its exact native
frame is unresolved. The trap did not recur during these startup/retirement
observations. The first155storage-factor timeout also has no established cause;
subsequent fresh Profiles started without it and no timeout workaround was added.
This is build/startup/retirement evidence, not migration or full-browser acceptance.
Root main is now pinned to 155.0.8059.85; stable product/stock checkouts are unchanged.

Native UI control was unavailable during the earlier observation. CUA initialization
now succeeds; that earlier tool failure is historical. No current live Aside/Aux
visual comparison is claimed. Never reuse retired app bindings: verify the owned
app PID and disposable Profile before any new binding.

Local fixture96158 serves POST→303,302navigation and a synthetic test-card form
at `http://127.0.0.1:4826`; no form fields are logged. No payment was made and no
real messenger message sent. Earlier ownership/probe notes are historical.

## Shared popup glass and fluid motion

Shared dialogs use solid popover material, including stage dialogs and floating
inspectors. Glass remains specific to menus, selects and appropriate popovers. Model-provider submenus, mention suggestions, citation previews,
tooltips, reader contents and notifications now use the same recipe as anchored
menus, command search and native-select pickers. The shared80% backing,8px blur,
no added saturation, edge/shadow pair and secondary text tokens own their appearance;
replaced opaque surfaces and duplicate material/entrance rules were removed.
Reduced-transparency, forced-colors and increased-contrast modes retain explicit
fallbacks. OS-owned menus keep their native material.

Menus/popovers position before first paint; anchor size changes and model-submenu
window resizing update their bounds. One opacity entrance avoids animating blur
or moving anchors. Left/chat/right sidebar widths and page spacers share the200ms
layout timing; disclosure and hover timings use shared tokens. Direct resizing
stays immediate and reduced motion disables layout/reveal transitions.

A final override pass removed the sidebar-address and Settings model-picker
rules that disabled blur, along with separate tab-switcher/omnibox recipes.
The narrow right-rail overlay uses the shared material; docked rails retain native
window glass. The complete source was compiled in the 35-step native build recorded above.

The earlier readiness integrated `npm run check` passed typecheck, lint and all4,784tests/
762files in91.75s (`/tmp/aux-final-popup-overrides-check.log`), including the
corrected debugger setting. Raw CSS colors outside tokens remain0.
The contrast check now evaluates actual popup material instead of a removed CSS
navigation tint (native navigation glass belongs to the OS). Secondary popup text
passes4.5:1 over both black/white underlays in both themes: minimum4.69:1
(`/tmp/aux-popup-glass-contrast.log`). These computations do not replace matched
native captures or prove every surface's liquid-glass appearance.

## Owner-written Memory documents — integrated source

Each Space can explicitly create, edit and remove USER.md and TAXONOMY.md beside
its independent MEMORY.md. Documents have distinct bodies and modification times,
revision-bound saves and concrete deletion review. Conflicting drafts remain
available for comparison; a Space/window change retires their local state.
Generated daily notes retain their original quotes and separate generation rules.
No placeholder owner files are synthesized.

Original normal-window proof owns writes. The encrypted workspace record and
cross-Profile recovery retain these documents; replacement/removal retires older
managed backups and derived context through the existing Memory boundary. Root
edits preserve owner documents. Recall and search include their text within the
existing bounded Space context; they grant no site, tool or routine authority.
Site/routine documents, file diffs and Dream remain open.

Runtime dist and renderer typecheck passed. The62focused document/authority/
context/paste/task/recovery tests passed in6.28s
(`/tmp/aux-owner-memory-focused.log`). The integrated combined document/material
check initially passed4,782of4,784tests; two old CSS recipe assertions were updated
and passed alone. The final integrated check passed all4,784tests/762files in91.75s
(`/tmp/aux-final-popup-overrides-check.log`). Native document acceptance remains open.

## Channels — integrated transport, task and Settings source

Slack Socket Mode, Telegram long polling and Discord Gateway have real independent
transports. Authenticated bot/app/user identities bind incoming events. Slack ACKs
and Telegram offsets follow durable receipt; Discord heartbeat and resume state
retire with their original socket. Provider redirects are refused, existing
Telegram webhooks remain unchanged and errors omit credentials and socket tickets.
Rate limits retain provider retry guidance. Interrupted sends become unknown.

Schema6 separately encrypts connections, peers, threads, inputs, outbound receipts
and resume cursors. Opaque keyed indexes and historical content survive reviewed
cross-Profile recovery; restored connections are disabled with fresh revisions,
retired work, cleared cursors and revoked pairing authority. No imported remote
permission resumes automatically. Migration preserves schema2–5 records.

Original normal-window proof owns configuration and native secret writes; private
and external configuration requests are refused. Pair/block binds actual provider
IDs and revocable workspace authority. Each person/thread owns an ordinary task
and chat. Initial turns and Queue/Steer retain external authority, normal approval
rules and parent sessions. Stop affects the originating person's conversation.
Disable, configuration changes, blocking and shutdown retire/join original work;
network reconnect preserves pairing. Reply publication validates the original
request/run/task/authority and destination. Unknown acceptance requires local
review of the exact reply/recipient before retry; retired receipts stay viewable.

Channels Settings now includes shared hero/rows, bundled provider marks, Add menu,
Options/Pairing/Credentials, explicit Space and audience choices, reconnect and
removal. Shared fields, dialogs, native selects, switches, buttons and command
dispatch provide the controls. A wiring audit also registered22missing model/
subscription command IDs and fixed secondary form buttons accidentally submitting.
Queued page-free follow-ups now preserve their external authority in RunService.

Integrated `npm run check` passed typecheck, lint and4,772tests/760files in132.21s
(`/tmp/aux-channel-integration-check.log`). This includes actual cross-Profile
recovery, provider protocol/storage fixtures, source-window retirement, pairing/
revocation, Queue/Steer, person-scoped Stop, uncertain reply review and command
registration. Earlier transport foundation checks remain valid. No messenger
credential was read or real message sent. Native visual and live messenger
acceptance, including provider permissions/reconnect, remain open. Personal-
assistant cards require separate implementation; full channel readiness is open.

## Shared visual tokens and live Terminal appearance

All29remaining raw CSS colors outside `tokens.css` now use shared semantic tokens
or existing liquid palette values. Settings illustration gradients remain grouped
as artwork tokens; project icon colors, layout selection and Home controls use
central definitions. Home status pills and actions follow theme surfaces.
Terminal spacing/radius/type use the shared scale. Its actual xterm canvas reads
the computed background, foreground and font, and updates/refits on theme or
interface-text changes without restarting its original shell session. The same
observer retires with that session's view.

Renderer build passes (`/tmp/aux-token-renderer-build.log`), and the raw-color audit
reports0outside the token file. Typecheck/lint pass; integrated tests passed
4,771/4,772 in147.78s (`/tmp/aux-token-terminal-metrics-check.log`). The unchanged
coder-worktree fixture exceeded60s during native compilation; only that failed
case was rerun and passed in23.94s (`/tmp/aux-token-coder-retry.log`). Terminal's
existing lifecycle test now also proves appearance changes preserve its original
process. No unchanged full suite was repeated. Native visual acceptance remains
open while computer control is unavailable.

## Reviewed, conflict-safe approved-note restoration

Memory history now reads a concrete restoration preview on demand. It shows each
approved note's full current/restored text, daily document path, addition/change/
removal and original source quote before an explicit Restore action. An unchanged
revision offers no write. A refreshed preview never silently authorizes different
changes. Root MEMORY.md and automatic document organization remain separate scope.

Restore requires the exact previewed generation, refusing later edits, Forget or
other Memory updates. It preserves the former current state in encrypted history.
Lease and pause checks run again at actual publication after native key writes.
The replaced unchecked restore signature is removed. Preview/restore use normal
Aux WebUI authorization; external/code-mode management remains denied. Retired
window/Space owners cannot publish previews; Memory-update events immediately
clear reviewed content and invalidate admitted reads, including after Forget.

Dist rebuild,94focused tests/6files and renderer build pass. Integrated typecheck/
lint passed;4,775/4,776tests passed in89.85s
(`/tmp/aux-memory-restore-integration-check.log`). One older workspace fixture
expected immediate restoration; it now verifies preview/no-op behavior and passed
alone in67ms (`/tmp/aux-memory-restore-workspace-retry.log`). No unchanged full
suite was repeated. Host ABI remains274methods/30events,`4afd8361e388`; runtime
authorization/feature maps are regenerated. Native review remains pending.

## Model-based Memory extraction — integrated source

The production sentence splitter is replaced by a budget-admitted structured
request on the selected connection's fast route. It selects at most20exact quotes
from32,000report characters, without tools. Original source eligibility and the
review inbox remain; source-run tokens/costs are never reused as extraction usage.
The operation records its own model invoices, input/output/cache usage, known or
estimated cost, duration and safe failure codes. History shows proposed notes and
an original-control retry for failures. Completed sources retain watermarks;
failed requests can retry without duplicating successful notes.

Per-Space queues preserve simultaneous completions. Source content/eligibility,
policy, model generation and operation lease are checked before dispatch and at
the actual encrypted publication point. Pause/shutdown cancel uncommitted work
while joining native key writes. Forget all cancels/joins active and queued
sources and records their retirement so a later extraction cannot revive them.
Activity remains encrypted and follows recovery and Forget. Retired direct model
transports now mark their pre-network refusal as undispatched for budget accounting.

Integrated `npm run check` passed typecheck, lint and4,719tests/754files in126.16s
(`/tmp/aux-model-memory-integrated-check.log`). The final queue refinement passed
runtime rebuild and38focused tests in2.43s; Forget retirement passed rebuild and
54focused tests in2.51s (`/tmp/aux-model-memory-forget-tests.log`). Extraction/UI
metadata and original Settings controls passed39tests in2.24s. The RPC result
declaration is split into typed domains to avoid TypeScript's oversized-inference
limit while preserving validators. No unchanged full suite was repeated.

Two bounded real-provider requests used the configured development Gateway key
and disposable in-memory state, with no personal Profile reads. The untrusted
fictional report completed in1.239s with0proposals,823input/36output tokens,
actual Gateway cost$0.001003 and one settled memory invoice. The second request
with verified public Aux facts failed after33.429s; it produced one unpriced
failure invoice and no automatic retry. Logs contain synthetic/nonsecret results:
`/tmp/aux-real-memory-untrusted-report.json` and
`/tmp/aux-real-memory-extraction.json`. This establishes transport/accounting and
safe failure behavior, not successful real-note publication. Native populated/
error/light/narrow comparison and real-proposal acceptance remain pending. USER/TAXONOMY/site/routine document authority, actual file diffs and Dream
remain open; proposed-note disclosures are not file-change receipts.

## Compact Quick Ask and recent downloads — integrated source

Quick Ask uses the same conversation/draft owner with a92px draft floor, real
context menu and Send, and an Open in Aux action that preserves the draft. The
full header/transcript and ordinary task controls return for submitted or error
states. Text, attachments and offline notices participate in native sizing.
Area0059 updates both native validation and sizing, hides native traffic controls
for compact drafts, and preserves normal transcript controls. It reverse-applies
on product154 and applies cleanly to155; the active155 source has not been mutated.

Both browser layouts now expose recent downloads from the shared toolbar when
items exist. The anchored glass popup reuses the native snapshot, open/reveal,
pause/resume/cancel, retry and error paths; Full Download History opens the existing
complete view. It retains file failures and works with the runtime unavailable.
The popup lists20recent items with shared typography, spacing, borders and popup
material. Matched native geometry, platform file icons and automatic-open behavior
remain comparison work; no full popup-parity claim follows from source tests.

Integrated `npm run check` passed typecheck, lint and4,710tests/752files in136.01s
(`/tmp/aux-compact-surfaces-check.log`). Focused21tests passed in8.96s before the
final integrated check. The final resize-observation refinement passed renderer
typecheck, lint and its focused test in4.47s; unchanged suites were not repeated. Native compilation/inspection
remains pending behind the existing builder and UI connection.

## Named custom model providers — integrated source

Models Settings now supports named JSON providers with independent destinations,
keys, model catalogs, role choices and disconnect/remove actions. The four
declared transports are OpenAI Chat Completions, OpenAI Responses, Anthropic
Messages and Google Generative AI. Credentials leave the imported JSON before
configuration persistence and use separate OS entries bound to endpoint/protocol.
Changed destinations cannot silently reuse an old key. Anonymous authentication
must be explicit; local-only policy still excludes remote providers.

Settings writes bind the current connection revision, active tasks prevent
connection changes, and previously acquired transports refuse later dispatch
after retirement. Private inference inherits the declared protocol through the
credential-only broker. Custom transports retain inline tool schemas, suppress
authentication when requested and refuse redirects. Explicit reasoning choices
reach the supported protocol fields. The shared dialog, buttons, popup material
and typography tokens serve add/edit and original-control removal reviews.

Runtime dist was rebuilt. Integrated `npm run check` passed typecheck, lint and
4,705tests/751files in136.45s, including all four SDK wire formats, anonymous
headers, redirect refusal, connection/key isolation and private routing.
The final removal-review refinement passed renderer typecheck and4dialog tests
in0.922s. Logs: `/tmp/aux-custom-provider-integrated-check.log` and
`/tmp/aux-custom-provider-final-ui-tests.log`. Native acceptance and real-provider
inference remain pending. The native UI control service currently reports
`Sky Computer Use native pipe startup failed`; no live Aside comparison is
claimed for this batch. Chromium155 continues its separate cold build.

The composer still uses the selected connection's catalog; a combined picker
across saved connections remains separate work. Supported subscription setup,
Memory, channels, routines and cloud acceptance remain open under R5.

## Native autofill accepted; redirect correction awaiting build

Nativec366c7dc8 completed its incremental build/link and launched through
owner79146 in disposable Profileaux-dev-eWrIyF (app85709/runtime API51202).
The synthetic address flow no longer crashes. Chromium's Save address offer,
Edit dialog, Cancel return and Save all worked. Reopening the form exposed the
saved native autofill suggestion and filled every field. Changing the synthetic
name produced the native Update address offer; Update persisted and the next
suggestion showed the changed name. Payment-specific prompts remain unobserved.

The same walkthrough isolated a general HTTP redirect defect. A redacted local
network trace records19same-destination307Delegate redirects after a real302,
ending with ERR_TOO_MANY_REDIRECTS. The content filter unconditionally passed the
unchanged destination as an override. Area0058 now forwards an override only
when policy actually changes the transport destination, and uses Chromium's
redirect helpers for method/body/header/referrer state. Post-task person
navigation receipts now also admit their exact redirect hops; all document,
control-generation and retirement checks remain. Native acceptance follows.

The full integrated check passed typecheck/lint and4,677/4,678tests; the existing
coder-worktree fixture timed out during compilation. Its single failed case
passed in isolation in26.40s. Logs: `/tmp/aux-native-window-handback-check.log`
and `/tmp/aux-native-window-handback-coder-retry.log`. Unchanged TypeScript checks
are retained for the native-only redirect correction. The original launcher
retired normally, removing its Profile, app and lock before native edits.

## Prompt efficiency

Known OpenAI/Anthropic tool calls share local JSON-schema definitions. The exact
51-tool SDK payload fell from109,361 to54,559bytes. Custom/compatible transports
keep inline schemas; original Zod validation, governed dispatch and conservative
budget estimates remain. Real provider token/latency and native performance
measurements remain open; byte reduction is not a latency claim. Live catalog
inspection returned387models and listed every configured default/fallback route
(`/tmp/aux-live-provider-catalog.json`); listing does not establish inference
availability. Explicit zero cache-read tokens now survive SDK usage normalization;
unknown cache usage remains absent.

## Accepted behavior retained

Earlier disposable previews established native dropdown keyboard/focus handling,
rounded model search, one browser sidebar, native Bookmarks/History with live Labs
preferences during runtime outages, History clear-data Cancel returning to History,
zoom25–500%, DOCX/text/PDF intake, source-backed answers, basic private answer/Stop,
and last-private-window retirement. Reuse that evidence for unchanged behavior.
The exact builds and captures are in historical status and the reference ledger.

Memory's approved daily documents and authoritative root MEMORY.md have native
edit/reopen and original-source observations. Encrypted owner edits, index Rebuild,
Forget/recovery and30/90-day retention are implemented. Empty-Profile retention
persistence and populated dark/light daily-note editing were observed; populated
expiry and narrow comparison remain open. The latest shared Settings/model/popup
source is newer than those accepted previews.

## Remaining readiness work

- R1: accept exact post-task person navigation, redirects/back/forward/reload,
  Stop/Take over and payment-specific prompts; preserve late-task denial.
- R2/R3: diagnose155SIGTRAP, verify debugger retirement and accept latest-source
  startup/changed flows, then browser restore,
  sleep/wake, runtime outage, imports/extensions/files/media/permissions and the
  default-route20-task manual smoke (at least18/20), with real workflow receipts.
- R4: valid paired native startup/interaction/memory measurements against matching
  stock155, plus actual provider prompt/token/cache/latency evidence. Run phase
  performance acceptance without reusing unmatched154stock numbers.
- R5: supported subscription setup/inference; combined provider picker; Memory
  owner-document native acceptance, site/routine authority, real-model extraction acceptance, file diffs/Dream;
  live channel/pairing/reply acceptance and personal assistants; standalone routine lifecycle;
  cloud provisioning/preview/Stop/recovery/cleanup; device/file-grant and notification
  acceptance. See the implementation boundaries in `docs/design/`.
- R6: matched light/dark, normal/narrow and populated/error/focus comparisons across
  the growing Aside corpus. Latest rescan:182PNG/192TXT/6support files, excluding
  thumbnails, under `/Users/rcourson/Desktop/Aside UI Reference 2026-10-16`.

No phase or complete-browser claim is justified yet. Distribution, signing,
notarization, sync and other platforms remain separate scope.

## Development constraints

Commit coherent slices to local main; never push, run hosted Actions, enable
Dependabot, sign, notarize or release. Use one native builder/launcher/plain lock;
retire through its original owner and preserve live preview cleanup ownership.
Never reset stable checkouts or clear active locks. Runtime edits rebuild dist
before tests. Run one integrated check per slice and changed-flow native
observations; retry failures or changed behavior without repeating unchanged work.
