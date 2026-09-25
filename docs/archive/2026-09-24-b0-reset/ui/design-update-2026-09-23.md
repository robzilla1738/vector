# September 23 shell design checkpoint

This is the implementation map for the Aside-inspired Aux refinement. The current
behavior is described below; the chronological [QA log](../../design-qa.md) also
contains rejected intermediate treatments. Its early “passed” labels apply to
individual checks, not full visual acceptance.

## Navigation and materials

- New profiles default to **Horizontal** tabs. Appearance → **Tab layout** and
  the tab context menu switch between Horizontal and Vertical. Existing explicit
  preferences survive. Both modes share tabs, selection, Spaces and tab folders.
- Horizontal tabs use rounded upper corners and inverted lower corner joins into
  the address row. The selected tab has no bottom separator. Tabs share available
  width up to 233px; favicons are 16px, title spacing 10px and close icons 14px.
  The native glass strip stays compact; its background must not be painted over
  with an opaque renderer layer. Aux colors, icons and identity are retained.
- Pinned sites have a compact tray and use a live tab favicon when available.
  Clicking a pin activates a matching open tab before opening another.
- Horizontal mode's chat sidebar opens by button/shortcut. It has no edge-hover
  reveal. In Vertical mode, the expanded sidebar remains a persistent, resizable
  column. Closing it removes the column entirely.
- Only a **collapsed vertical sidebar** gets the inset edge-hover glass preview.
  The preview sits over the page, leaves its bounds unchanged, and can be pinned
  with **Keep sidebar open**. Leaving, Escape or an outside click dismisses the
  preview, not an expanded sidebar.
- Home and internal blank surfaces share the restrained glass treatment across
  the center and side areas. A rendered website keeps its own content surface.
  Strong separators between sidebars and center are removed.

## Tabs and previews

Tab folders appear as compact horizontal group chips or vertical groups. Creation,
rename, color, collapse, membership and ungrouping use existing workspace storage.
Horizontal groups are contiguous in tab order; the selected tab remains visible
when its group is collapsed. Keyboard reorder stays within its group.

Delayed tab previews use real page captures when available and text otherwise.
They have bounded viewport placement and reserve thumbnail space before capture
arrives. Raising a preview must not resize, shift, or blank the native website.
Escape and departure dismiss it. Aux does not invent memory-usage measurements.

## Chats and projects

Both sidebar layouts share `ChatSessions`. Rows reserve space for move, archive
or restore, and delete controls shown on hover or keyboard focus. Selection is
only applied to the active conversation; New chat is not simultaneously selected.

**Projects in this chat list are session folders.** They are distinct from runtime
repository Projects, saved Tasks, browser tab folders, Spaces and Profiles:

| Item | Storage and meaning |
| --- | --- |
| Chat project | Profile-local renderer `localStorage`; groups conversation IDs |
| Conversation | Existing runtime conversation APIs and durable history |
| Tab folder | Existing workspace layout and tab membership |
| Runtime Project | Existing repository/workspace resources and tools |
| Space | Browser organization, not account isolation |

Chat folders support create, rename, collapse and remove. Removing a folder keeps
its chats under Chats. Membership and folder definitions use separate versioned
entries (`aux.chat-folder.v1:` / `aux.chat-folder-member.v1:`) and synchronize
between windows through storage events. This is not cloud sync or a runtime
schema migration. Invalid folder records do not hide conversations.

Archive/restore uses existing conversation APIs. Permanent deletion requires an
inline confirmation. Move and delete disclosures expand as part of the same row
surface, with inert closed controls and Escape/Cancel focus restoration.

Full-page empty chats center the Aux mark above a bottom composer, capped at
880px with responsive insets. Add context reveals existing attachment actions and
browser context selection. Existing messages, embedded chats, drafts, approval
controls and task-promotion behavior remain functional. Jump to latest is an
accessible floating arrow, with no extra layout bar or composer shift.

## Work surfaces and consistency

- Recent-work cards have bounded heights, readable truncated titles and correct
  draft/failure previews. Chats/Routines switching supports keyboard navigation.
- Tasks and routines have status filters/counts, useful empty states and separate
  editors. Schedules show a readable timezone summary and weekday/every-day presets.
- Settings has searchable categories, clear/no-results behavior, keyboard
  destination focus, connection tabs and a separate narrow-window navigation row.
- Work/Settings buttons and single-line fields share 36px height, corners and
  typography. Spacing and soft surfaces replace etched dividers and empty-state
  outlines. Destructive actions remain visibly distinct.
- Shared hover entry/exit is 100ms/300ms where applied; press scaling is removed.
  Icon slots and keyboard focus are consistent. Reduced-motion and transparency
  alternatives remain available.
- Secondary ink is strengthened to 72%; glass labels use existing 85% ink.
  Inputs have explicit placeholder styling. Decorative faint ink is not used for
  essential metadata, and disabled text controls remain readable.

## Native input invariants

A loaded vertical page can reveal its 40px URL row from the top edge or focus.
The page-side frost has a short feather and exits with the controls. Toolbar ink
adapts to a local sample of the page's top strip; the sample is not saved or sent
to a provider. Native window glass and injected page blur are separate mechanisms.

The shell and websites are separate `WebContentsView`s. CSS `z-index` and a
renderer backdrop filter alone cannot establish native hit order or blur a page
in another view. `placeChrome` detaches/reinserts the affected native views when
changing their order. Validated page-region input forwarding stays installed
while a native page is shown, including after the reveal closes. Toolbar/sidebar
controls are excluded; modal overlays retain their input boundary. A page wheel
scroll releases URL focus and the reveal so page input resumes.

Blank toolbar and sidebar areas use shell-only window-drag IPC. Controls, inputs,
links, draggable tabs and resize handles are excluded. Each drag surface owns its
capture lifecycle; unmounting another surface cannot cancel it. Screen positions
are validated and rounded before `BaseWindow.setPosition`. Ordinary renderer
focus transfers must not stop a sidebar drag. Regular and private shells share
the native helper.

## Verification and remaining acceptance

The focused native smoke files are listed in [local testing](../local-testing.md).
Checks cover both layouts, persisted folders, disposable chat mutations, keyboard
controls, narrow windows, reduced motion, preview bounds, URL focus, continued
page scrolling, and actual native window bounds after a sidebar drag.

Unsigned local packaging and fixture checks are not signing/notarization,
VoiceOver certification, universal contrast over every wallpaper, or exact
Aside fidelity. B1–B7 in [HANDOFF](../HANDOFF.md) remain separate. Source reference
assets and ignored local screenshots are not redistributed in this checkpoint.

### Checkpoint validation

Local verification completed on September 23, 2026:

| Gate | Result |
| --- | --- |
| Typecheck and desktop build | Passed |
| Lint | Passed; 387 warnings within the existing 390 cap |
| Unit tests | 204 files, 1,029 tests passed |
| Integration tests | 6 files, 27 tests passed |
| Focused native design checks | All eleven commands listed in local testing passed |
| Task benchmark manifest validation | Passed |
| Bundle budgets | Startup JS 464 KB, CSS 217 KB, total JS 1,682 KB |
| Unsigned macOS ARM64 package | Built successfully |

The CSS ceiling increased from 190 KB to 225 KB for these UI states; JavaScript
ceilings and CSS literal ratchets were not raised. See the budget tradeoff in
[ROADMAP](../ROADMAP.md). Run integration separately from native smoke fixtures
and packaging: shared fixture ports and rewritten runtime build output can cause
false failures. GitHub CI is a separate post-push gate; these are local results.

### Pickup checklist

1. Use an isolated profile; preserve explicit tab-layout and material preferences.
2. Recheck real-page scrolling after revealing, editing and hiding the URL row.
3. Drag both toolbar whitespace and the sidebar header; click their controls.
4. Keep expanded-sidebar layout distinct from collapsed edge preview.
5. Check preview opening does not change native page bounds.
6. Exercise chat folders/archive/restore/delete only with disposable fixture chats.
7. Review light/dark, reduced motion/transparency and narrow layouts with the user.
