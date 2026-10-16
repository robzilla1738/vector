# Aside UI parity — October 16, 2026

This is the active capture-by-capture ledger for the owner's full Aux surface
review. The goal remains full visual and functional parity wherever Aux can
support the behavior, using Aux identity. This ledger supplements
[the earlier surface ledger](aside-parity.md); it does not narrow its acceptance.

## Reference handling

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
| 007 | Composer project picker                     | captured                                                                                                                  | Direct source/error route reviewed; native/scratch flow open                                                            |
| 008 | Composer permission guard                   | captured                                                                                                                  | Open                                                            |
| 009 | Composer model picker                       | captured                                                                                                                  | Direct control implemented; visual comparison open              |
| 010 | Composer model provider row focused         | supplemental — Provider row focused; see 011 for the expanded Aside models.                                               | Open                                                            |
| 011 | Composer aside models expanded              | captured                                                                                                                  | Open                                                            |
| 012 | Composer chatgpt models expanded            | captured                                                                                                                  | Open                                                            |
| 013 | Composer reasoning effort                   | captured                                                                                                                  | Direct control implemented; visual comparison open              |
| 014 | Composer context mention                    | captured                                                                                                                  | Open                                                            |
| 015 | Settings general top                        | captured                                                                                                                  | Source changed; native comparison open                          |
| 016 | Settings search engine dropdown             | captured                                                                                                                  | Open                                                            |
| 017 | Settings new tab mode dropdown              | captured                                                                                                                  | Open                                                            |
| 018 | Settings language configuration             | captured                                                                                                                  | Compact dialog implemented; native composition comparison open |
| 019 | Settings add language dropdown              | captured                                                                                                                  | Open                                                            |
| 020 | Settings browser import dialog              | captured                                                                                                                  | Compact dialog implemented; native composition comparison open |
| 021 | Settings import browser picker              | captured                                                                                                                  | Open                                                            |
| 022 | Settings general about section              | captured                                                                                                                  | Open                                                            |
| 023 | Settings appearance top                     | captured                                                                                                                  | Reviewed; matching native comparison open                       |
| 024 | Appearance theme dropdown                   | captured                                                                                                                  | Open                                                            |
| 025 | Appearance zoom dropdown                    | captured                                                                                                                  | Open                                                            |
| 026 | Appearance tab position dropdown            | captured                                                                                                                  | Open                                                            |
| 027 | Appearance sidebar sections dropdown        | captured                                                                                                                  | Open                                                            |
| 028 | Appearance recent chats dropdown            | captured                                                                                                                  | Open                                                            |
| 029 | Appearance tab order dropdown               | captured                                                                                                                  | Open                                                            |
| 030 | Appearance tidy tabs configuration          | captured                                                                                                                  | Open                                                            |
| 031 | Appearance keyboard shortcuts               | captured                                                                                                                  | Open                                                            |
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
- 084/087: routine-level model and notification switches are still absent in the
  current RoutineDefinition contract. Real persisted runtime support and behavior
  verification are needed before matching controls can be accepted.
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
