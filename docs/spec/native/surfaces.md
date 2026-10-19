# Native surfaces and browser interaction

Status: ready for behavior and explicitly identified owner-required dimensions; exact target-version pixel parity remains draft until disposable-profile screenshots are captured. Sources N1, N3, N8, N9 in `provenance-sp3.md`. Historical geometry/palette measurements are labelled and must not be passed off as live 1.26.1016 evidence.

## V1. Sidebar structure and dimensions

The browser sidebar is native and spans the window height. It contains the top controls, pinned tile grid, bookmarks, chat/task sections, ordinary tabs and a fixed bottom profile/search bar. Expanded width is 282 pt per accepted plan/current Aux target. A resize edge persists width per profile. The historical capture had a 5 pt edge handle, 8 pt row side insets, 28 pt section headers, 32 pt rows, 16 pt favicons, 42 pt footer, and 42 pt toolbar; treat these as initial measurement targets pending version-specific comparison.

Section headers collapse their own content without destroying underlying tabs/sessions. Persist expanded bookmark folders, section expansion and pin order. Bookmarks use native model observers; folder expansion, open-in-current/new tabs/window, rename and delete operate on the real model. Chat rows show read/activity/attention state and open the right session; title editing writes through the daemon. Task rows must not be inferred from ordinary browser tabs alone.

A pointer entering a collapsed sidebar can expand it when expand-on-hover is enabled. Keep expanded while interacting with its popovers/menus or drag operation; do not collapse beneath an active click. Velocity-sensitive delay avoids opening when a pointer merely passes across the edge. Exact velocity thresholds/timings are not recovered. Resize/collapse/hover transitions must preserve content bounds and keyboard focus. Reduced motion skips unnecessary animation. The blur backdrop uses native material; opaque fallback is available when transparency is disabled or system accessibility requires it.

Pinned tiles support activation, close, reload, duplicate, unpin and drag reorder. Dragging a normal tab into the grid pins it; dragging away unpins as appropriate. A drag ghost follows pointer coordinates, supports cancellation on capture loss/Escape and must not duplicate tabs. Profile switching preserves each profile's own pin/bookmark/tab state.

## V2. Chat/task and agent-tab controls

Poll daemon sessions through authenticated contracts. Filter archived and ephemeral/batch-only sessions from ordinary chat display where the session type requires it. Resolve browser targets back to their owning session. New-chat handoff tolerates the interval before the daemon session arrives, preventing duplicate new-chat tabs or prematurely deleting the handoff target.

Task rows show current task state, unread/attention markers and valid contextual actions. Attention can expand the task section. Use a native macOS popover anchored to the row for actionable task details. Its close button has normal/hover/pressed states and correct tracking areas. Popover callbacks carry task/popover/action identity and route through authenticated daemon action resolution. Stale actions fail without affecting another task. Tooltip appears for truncated task content without covering a pending action.

An agent-tabs toolbar button opens a native bubble listing agent-owned tabs grouped by session. Rows activate the exact target and show title/favicon. Include close/cleanup configuration with policy-backed auto-close state; never close ordinary tabs merely because they have a similar URL. Detached targets disappear through observation. Task popover and agent bubble exact dimensions are not recovered; do not invent a parity threshold for them.

## V3. Tab search and Ctrl-Tab

Tab search uses a native anchored bubble containing the independently built tab-search WebContents. The accepted target size is 620 × 340 pt. Footer search and Cmd+Shift+A open the same surface. Focus starts in search; query filters title/URL; arrow keys change selection; Enter activates; Escape dismisses and restores browser focus. Closed tabs disappear while open. Resolve matches to IDs instead of reopening URLs when switching tabs.

Ctrl-Tab supports rapid switching and a held-key switcher. Under the accepted 250 ms quick-tap threshold, move to the next target without flashing the large switcher. When held, show native switcher rows, use Tab/Shift+Tab to cycle and commit on Control release. Escape cancels and restores the original tab. Preference chooses MRU versus strip order; current tab is not accidentally reordered merely by preview. Missing/closed candidates are removed safely. Native accelerator handling must not trigger upstream tab switching a second time.

## V4. Mini popup and options

The global shortcut opens the popup for the active/bound profile. Its native window hosts the extension mini-popup page, supports compact/attachment/expanded state and native backdrop. Accepted corner radii are 16 pt outer and 12 pt inner; exact state-dependent geometry needs screenshots. The options window is separately sized and coordinated so clicks within options do not prematurely close the parent. Escape and focus dismissal follow standard transient-window behavior while respecting active file/directory pickers. Popup cannot bypass a locked account. Disabled shortcut or unavailable OS registration is reported in settings.

## V5. Profile menu, icon picker and toolbar

The native profile menu lists profiles with current check and edit/delete actions, followed by create-profile and browser navigation/actions. Menu entries open bookmarks, downloads, extensions, history, developer tools, settings, new tab and private window through the browser's real commands. Profile ordering persists and the footer indicates multiple profile pages. Account locking state is reflected before navigation.

Profile editor has a name field and a native icon grid. The accepted original set has 16 choices representing bag, luggage, money, telescope, trophy, rocket, pencil, palette, split-circle, headphones, chart, circle, square, diamond, flower and speech bubble. Draw Aux icons or use independently licensed equivalents; do not extract vector paths. Save applies name/icon to profile attributes and footer; cancel leaves prior values. Delete confirms the affected local profile and does not delete another account's data.

Toolbar is a compact strip to the right of the sidebar. Keep back/forward/reload, native location field and trailing download/extension controls in the agreed Aux order. Avoid duplicate avatar in the toolbar when the profile footer is present. On a new-tab page, show an empty unfocused location field with search affordance and original Aux placeholder text. Extension pages display their human-readable page title. Internal pages display `aux://` consistently in location field, history and suggestion rows, with canonical internal URL handling underneath. Never rewrite arbitrary external URL text containing the substring `chrome`.

Local update badge reflects installed/local version status only; it must not poll a reference update service. Exact badge geometry/color need target-version capture. Horizontal-tab mode retains standard keyboard/group behavior, respects shrink-to-fit preference and selected Aux tab style, and hides redundant vertical controls rather than showing both strips.

## V6. Appearance measurements

Both light/dark and system selection must work without restarting. Native colors use roles coordinated with UI tokens; render native vibrancy rather than imitating transparency with a flat CSS color. Historical reference role measurements:

| Role | Dark RGBA | Light RGBA |
| --- | --- | --- |
| Window backdrop | `#17171780` | see token inventory; exact target-version value pending |
| Floating sidebar | `#24272bff` | `#f3f4f6ff` |
| Accent | `#38bdf8ff` | `#38bdf8ff` |
| Switcher backdrop | `#171717b3` | target-version measurement pending |
| Primary text | approximately 85% near-white | token inventory light foreground |
| Secondary text | approximately 55% near-white | token inventory light muted foreground |
| Border | `#fafafa1a` | token inventory light border |
| Hover on subtle | `#fafafa14` | token inventory light hover |
| Pressed on subtle | `#fafafa26` | token inventory light pressed |

The existing Aux neutral-dark palette is carried forward until version-specific evidence resolves historical differences; do not replace current user-owned native work wholesale with older blueprints. Geometry and behavior can be built now, but a visual parity claim requires calibrated screenshots of the actual target in both appearances.

## V7. Acceptance inventory

Capture expanded/collapsed/hover/resize sidebar, pinned drag reorder and drag-to-pin, bookmarks rename/folder, chat row states/actions, task popover/tooltip, agent-tab bubble, tab search, Ctrl-Tab quick/held/cancel, mini popup each state/options/shortcut, profile menu/icon picker, toolbar/newtab/internal URL and horizontal tab modes in light and dark. Include keyboard-only operation and transparent/reduced-transparency system settings. No screenshots or runtime acceptance were produced by this lane.
