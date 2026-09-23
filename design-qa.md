# Shell design QA history — 2026-09-23

This is a chronological local QA record, including rejected intermediate designs.
Per-section pass labels describe the checks performed at that point. Later user
corrections supersede earlier treatments. The authoritative current behavior and
remaining acceptance are in [the checkpoint](docs/ui/design-update-2026-09-23.md).
Local screenshot and reference paths below are evidence locations on the review
Mac, not portable repository files or redistributed Aside assets.

## Horizontal tabs

final result: passed

Scope: match the supplied tab geometry and native glass treatment while preserving Aux's palette and identity. Sidebar opens and closes by click.

Evidence:
- Source: `/var/folders/1j/bkszg0h10ng2tfhcbdk94cpm0000gp/T/TemporaryItems/NSIRD_screencaptureui_0pSMYU/Screenshot 2026-09-23 at 2.54.13 PM.png` (854×174, approximately 2× density).
- Native implementation: `release/test-artifacts/tabs/screen.png` (2400×1800; 1200×900 CSS window, 2× density).
- Combined focused comparison: `release/test-artifacts/tabs/comparison.png`. Both chrome regions retain their 2× density. A deliberately striped neutral window behind Aux demonstrates real AppKit blur; the source has a different backdrop.
- Full-view evidence: native screenshot plus both supplied full-window references. Compared the persistent top rows, sidebar width, and sidebar toggle position. Home contents differ because the review profile is empty.

Resolved findings:
1. Opaque horizontal-chrome container obscured NSGlassEffectView. Removed the cover and CSS gradient in the native translucent mode. Screen capture confirms blurred background content through the strip. Window-only thumbnails exclude this desktop composition and are not sufficient glass evidence.
2. Scroll container clipped both 12px tab scoops. Added protected space inside the scroller; native capture now shows both joins into the toolbar.
3. Tab proportions and pinned tray differed. Verified 34px tabs, 7px top inset, 200px resting width, 12px upper corners, 12px scoops, 30px tray and 28px new-tab target. Tabs share available space up to 233px each.
4. Horizontal pins discarded live site favicons. Reused the corresponding open tab's favicon and activate that tab when clicked.

Fidelity review:
- Typography: Aux's Geist retained; tab title uses the existing 13px small-text token, 16px favicon, 10px title gap, 14px close control.
- Spacing and geometry: inspected combined chrome crops at identical density; tab and pinned-tray positions now align with the reference dimensions.
- Colors/material: no palette tokens changed. Native NSGlassEffectView is exposed; solid appearance keeps its opaque fallback. Browser preview uses a translucent fallback because AppKit material is available only in the native app.
- Assets: approved Aux mark identifies blank tabs; visited pinned sites use their session favicons. Fresh unvisited pins retain the existing globe fallback.
- Copy/content: retained Aux labels and data. Added context-menu tab-position toggle.

Verification: native launch, transparent ancestor/strip checks, measured tab bounds, twelve equal shrinking tabs, visible plus control, context-menu switch to vertical, return to horizontal, sidebar open/close, and pointer-at-edge check all passed. Desktop typecheck and 12 focused unit tests passed. Diff whitespace check passed.

Intentional differences: Aux brand, typeface and neutral palette are preserved; background-dependent glass appearance varies with the desktop. No actionable P0/P1/P2 findings remain within this scope.

Follow-up: selected real tabs exposed a 1px seam. The inner tab button's text plus vertical padding exceeded the 34px tab height; scrollIntoView shifted the scroller vertically. Set the button to the tab's full height with zero vertical padding. Verified with two real tabs: tab bottom equals toolbar top, scrollTop is zero, and all eight sampled rows across the native join are the identical opaque (23,23,23) surface. The native screenshot shows no seam.

## Browser chrome refinement pass

final result: passed

Applied the local extracted references to the toolbar (42px), address field (34px), navigation targets (32px), and tab close icon (14px inside a 16px control). Preserved existing color tokens. Pinned sites now support overflow, keyboard navigation, context actions, reordering, background opening, and active-state feedback. The click-operated chat sidebar supports pointer/keyboard resizing with saved width; its chat history scrolls independently.

Native interaction checks passed with seven pins and two real tabs: overflow ArrowDown/Escape, context-menu reordering, sidebar width persistence across closing/opening, and address focus. Also passed twelve-tab compression and horizontal/vertical switching. Native screenshot confirms glass and an unbroken selected-tab/toolbar surface. Rebuilt the arm64 application; desktop typecheck, twelve unit tests and diff whitespace checks passed.

## Panel balance and separator follow-up

final result: passed

Reduced desktop bleed through the broad horizontal-mode chat and assistant panels using the existing sidebar surface token at 85% minimum opacity. Preserved the title-bar glass. Changed recent cards to reserve grid columns when there is only one item and capped card height at 280px. Start-page top spacing now scales with window height. Removed both permanent vertical panel borders following the user's screenshot feedback; resize controls remain accessible with hover/focus feedback. Packaged successfully and inspected the reopened native app with both panels visible: no vertical divider strokes, bounded recent card, and retained panel controls. No palette tokens changed. Diff whitespace check passed.

## Continuous empty-view surface

The empty center, side panels, URL toolbar, active tab and tab corner fillets now share the existing sidebar material. A native regression check confirmed identical computed surfaces for all five regions, then opened a native page and confirmed the normal content surface was restored. Packaging passed. This refinement applies only while no native page is displayed; palette tokens are unchanged.

Compact title strip: reduced height from 41px to 38px and top tab inset from 7px to 4px at the user's request. Native geometry checks passed: tabs remain 34px and their bottoms meet the toolbar exactly. Shared empty-view surfaces and native page transition also passed. Packaged successfully.

## Assistant, suggestions and shared menus

final result: passed

Refined existing components using the supplied Aside spacing, surface and corner references, retaining Aux tokens and actions. Assistant header controls are consistently 28px; the empty state is now visible and centered. The embedded composer has a full-width text row, separate actions and softer focus treatment. Suggestion rows have inset rounded selection areas and sentence-case section labels. Shared menus have consistent 32px minimum rows, smaller type, aligned shortcuts and explicit disabled states.

Native checks passed: empty-state visibility, draft retention through recent-conversation switching, address suggestion keyboard selection, Escape dismissal and tab context-menu opening. Reviewed assistant-polish.png, suggestions-polish.png and menu-polish.png in release/test-artifacts/tabs. Desktop typecheck, build and diff checks passed. No live agent request was submitted during these UI checks.

## New-tab refinement

final result: passed

Made hero spacing responsive to viewport height and center-column width. Recent cards use bounded 240px height (180px in narrow columns), two-line titles and three-item routine previews. Draft text takes precedence in chat previews, while failed/cancelled/interrupted chats no longer show stale progress text. Refined recent-work control targets and added arrow/Home/End keyboard switching. Native UI checks passed for both empty states, keyboard switching and a 1100×740 window with both panels open and no horizontal overflow. Inspected home-compact.png. Typecheck, packaging and whitespace checks passed; Aux colors and existing glass chrome remain unchanged.

## Tab groups and previews

final result: passed

Horizontal tabs now display persisted folders as compact 20px group chips with 6px corners, matching the supplied group-chip geometry while retaining Aux tokens. Added tab-menu group creation, F2/context-menu rename, existing folder color controls, collapse/expand, drag membership and ungrouping. Collapsed groups preserve visibility of the active tab. Group order is shared with close-to-right actions; keyboard reordering stays within the current group.

Both horizontal and vertical tabs have delayed preview cards containing the page title, host and a real captured thumbnail when available. Blank tabs and unavailable captures use text only. No memory-usage numbers are invented. Escape, pointer departure and focus changes dismiss previews. Preview bounds are reported to the native content surface.

Native smoke checks passed for creation, rename, collapse, active visibility, drag membership, reload persistence, ungrouping and actual page capture in both modes. Fixed stale group-menu state suppressing previews after ungrouping. Added tests/smoke/tab-groups.mjs for regression coverage. Desktop typecheck and all 20 workspace tests passed. Inspected tab-groups.png and tab-preview.png under release/test-artifacts/tabs; screenshot alpha does not include the native desktop glass composition. Diff whitespace check passed.

## Projects and routines

final result: passed

Refined task cards and editor sections, added task and routine status filters with counts and clear-filter empty states, and made schedule descriptions readable on routine cards. Added weekday/every-day presets with a live time-and-timezone summary. Existing Aux palette tokens, review policy, task saving and routine execution semantics are retained.

Native smoke checks passed for active/archive task filtering, routine filtering and reset, saving a weekday schedule, opening the editor, and no horizontal overflow at a narrower window. Inspected projects-index.png, routine-narrow.png and task-editor.png in release/test-artifacts/tabs. Corrected a clipped Space selector and reset scroll when opening a task. Five schedule unit tests and desktop typecheck passed. No agent runs were started during verification.

## Settings and uniform work controls

final result: passed

Refined Settings category navigation, search with a clear control, descriptive headings, connection tabs, and rounded search results. Fixed navigation overlap in narrow content panes using a separate horizontal category row. Preserved the existing Aux palette and preference behavior.

Following the user's screenshot correction, removed etched dividers and empty-state outlines in Tasks, Routines, task resources/history, memory lists and Settings. Preference sections use spaced rounded surfaces. Work and Settings buttons and single-line inputs now share 36px height, corner radius and typography; textareas share their corner and padding treatment. Keyboard focus remains visible.

Native smoke passed search-result keyboard selection and destination focus, no-results clearing, connection-tab keyboard switching, narrow navigation geometry, work divider removal and matching input/button heights. Inspected settings-appearance.png, settings-narrow.png and work-controls.png. Desktop typecheck and diff whitespace checks passed. No credentials, external connections or permissions were changed during testing.

## Vertical tabs and session projects

final result: passed

Vertical tab groups now use soft trays, counts, disclosure arrows, 34px rows, keyboard expansion and F2 rename. Escape correctly cancels renaming. Removed sidebar section separators and the dashed empty-bookmark outline; existing colors and click-only sidebar behavior remain.

Both sidebar modes share persistent session projects with create/rename/collapse/remove and a per-chat project picker. Folder membership is stored per entry in the local browser profile and synchronized between windows. Removing a folder retains its chats. Hover/focus actions archive, restore and delete using the existing conversation APIs; permanent deletion requires an explicit inline confirmation. The old horizontal Projects navigation now says Tasks to distinguish saved tasks from session folders.

Two storage tests, desktop typecheck and native interaction checks passed. Native checks cover reload persistence, moving, archive/restore, delete cancellation and confirmation using disposable fixture chats, folder removal retaining chats, both modes, and tab-group keyboard rename/collapse/cancel. Inspected session-projects.png and vertical-sessions.png; vertical renderer capture has transparent pixels, also inspected composited over a neutral background. No real user conversations were modified during verification.

Hover/selection follow-up: removed large folder background blocks in favor of inset child rows; hover actions now occupy fixed positions with reserved label space, so titles and highlights do not jump. Corrected New chat being permanently highlighted beside a selected session, and restrict saved-chat selection to conversation mode. Added space between the horizontal sidebar toggle and conversation heading. Native regression passed again, including unchanged row bounds across hover. Re-inspected the selected session with its hover controls visible.

## Motion and icon consistency

final result: passed

Unified common controls around 100ms hover entry and 300ms departure, removed press scaling, reduced menu translation/scale, standardized compact 14px and normal 16px icon slots, added focus indicators and a larger invisible horizontal tab-close hit area without changing tab geometry. Tab-menu labels now share a consistent leading icon column; menu separators use spacing. Chat loading no longer presents an empty-state message before the first response. Existing Aux palette tokens are unchanged.

Native checks passed hover timing, unchanged hit-area bounds, icon dimensions, keyboard focus, disabled buttons, empty chats, menus and reduced motion in both tab layouts. Session project/move/archive/restore/delete regression also passed. Inspected motion-menu.png and the prior session-state captures; reduced-motion native capture is saved as motion-vertical.png. Desktop typecheck and whitespace checks passed.

## Delete confirmation follow-up

final result: passed

Removed the solid dark delete-button fill. Confirmation actions now sit directly on the sidebar surface with consistent spacing and a subtle hover treatment; the existing red destructive label remains. Inspected delete-confirmation.png and verified the button has a transparent idle background. Native cancellation/deletion regression passed on disposable fixture chats.

## Minimal jump-to-latest control — September 23
- Replaced the text pill with a 32px floating arrow using the shared icon style and existing surface colors.
- Removed its layout row; added a soft scroll-edge fade only while away from the latest message.
- Verified in native Electron: icon-only accessible button, zero-height wrapper, successful jump to bottom, and unchanged composer position. Inspected `release/test-artifacts/tabs/minimal-jump.png`.
- Desktop typecheck and renderer build passed.

## Collapsed toolbar glass and input — September 23
- Removed the revealed toolbar's native drag region so URL and toolbar clicks reach controls.
- Kept keyboard focus independent from pointer hover; editing stays open when the pointer leaves.
- Coordinated traffic-light visibility with shell readiness.
- Reworked page-side frost and shell contrast together. Final user-directed treatment uses lighter 64% neutral tint, 20px blur, and only a 12px feather below the 40px row.
- Native smoke passed over white and dark fixtures: click URL to edit, retain focused field, reopen sidebar, fully dismiss toolbar. Native window captures inspected under `release/test-artifacts/tabs/toolbar-white.png` and `toolbar-dark.png`.
- Desktop typecheck passed; toolbar glass/edge unit tests passed (4 tests).

### Toolbar follow-up after native user feedback
- Replaced the dark contrast band with 18% neutral glass. Local capture of the page's top strip chooses light/dark control ink; refreshes after navigation completes. No captured image is persisted or sent outside the app.
- Explicitly detach/reinsert the shell when raising it, refreshing native view hit order as well as paint order. Native CUA clicks in an isolated Electron window focused the URL and opened the sidebar successfully.
- Page frost now transitions with the controls instead of remaining until the end of the shell's hide animation. Reduced-motion is respected.
- Final smoke asserts white/dark URL contrast, field focus retention, sidebar action, and frost starting its exit alongside the controls; passed. Desktop typecheck and 4 targeted unit tests passed.
- Earlier 64% tint QA above describes the rejected intermediate version, not the final treatment.

## Tab preview stability — September 23
- Reproduced the original native page jump: preview changed x from 281 to 560 and width from 919 to 640.
- Removed hover previews from menu obstruction layout. They now raise the shell above the native page without changing the page's bounds.
- Reserved thumbnail height before capture arrives and constrained the complete card to the viewport.
- Native smoke passed in vertical and horizontal layouts: identical page bounds before/during/after preview, stable thumbnail/card height, viewport containment, Escape dismissal. Inspected native captures `preview-vertical.png` and `preview-horizontal.png`.
- Desktop typecheck passed.

## Inset vertical sidebar reveal — September 23
- Changed the vertical sidebar from a layout column to a floating panel inset 8px from the sides/bottom and below the 40px toolbar.
- Added 260ms inward motion with a shorter opacity transition, neutral translucent material, soft shadow, and real page-side backdrop blur beneath native web content.
- Preserved click-to-open; added click-outside, Escape, and toolbar toggle dismissal. The toolbar remains available while the panel is open.
- Removed the expanded-layout border change that caused a half-pixel home shift.
- Native smoke passed: exact home/native page bounds before/after opening, inset geometry, live blur, all dismissal paths, reduced motion. Inspected `floating-sidebar.png`.
- Tab-preview regression passed in vertical/horizontal modes. Desktop typecheck passed.

## Continuous chat-row disclosures — September 23
- Move-to-project and delete confirmation now unfold inside one rounded chat-row surface, with transparent interior content and no nested popup background.
- Height and opacity animate together; closed controls are inert. Cancel/Escape restore trigger focus, and reduced motion disables the transition.
- Desktop typecheck and diff whitespace checks pass. Native session smoke passes project movement, archive/restore, delete/cancel, shared surface styling, Escape, focus restoration, inert closed content, and reduced motion in the isolated fixture profile.

## Restore pinned sidebar; restrict glass reveal to collapsed edge hover
- Corrected the prior floating-sidebar change: expanded vertical sidebar again occupies its normal persistent column, with the original header and resize handle. Escape/outside clicks no longer dismiss it.
- Only collapsed mode uses the inset glass preview. Native left-edge events and renderer pointer movement reveal it; a short leave delay permits crossing the inset and using its controls. The preview can be pinned using Keep sidebar open.
- Native fixture smoke verifies pinned layout, collapsed home/native page bounds, edge reveal, pointer-leave dismissal, Escape/outside dismissal, native glass and reduced motion. Typecheck and diff whitespace checks passed.

## Text contrast refinement
- Added explicit placeholder color/opacity for all inputs and textareas, with stronger text on sidebar/chat glass and rail forms. Project name no longer uses browser-default gray.
- Increased shared secondary-text opacity from 55% to 72%; glass secondary labels use the existing 85% ink. Removed additional fading from empty states and sleeping tab titles. Text metadata/counts now use secondary ink rather than the decorative 25% token.
- Disabled text buttons retain readable text and an inactive neutral surface without fading the whole control.
- Native fixture test measures composed foreground/background values against a representative screenshot-colored glass backdrop: dark project placeholder/Save 4.97:1, label 5.59:1; light controls/labels all above 9:1. Arbitrary desktop wallpaper is not an exhaustive contrast guarantee. Desktop typecheck and diff checks pass.

## Full-page new-chat composition
- Centered the Aux mark in the empty conversation area and widened the bottom composer to 880px with responsive insets. Added a quiet Aux / New chat heading using existing colors.
- Added compact Add context disclosure for existing image/capture actions and the working browser-context selector below the composer. No model or permission controls were mocked.
- Existing chats and embedded conversation panels retain their layouts.
- Desktop typecheck, diff check and native fixture smoke pass: centered geometry, wider composer, image controls, context selection, narrow-window fit, and draft preservation. Inspected wide screenshot (native transparent sidebar capture artifacts excluded from visual judgment).

## Toolbar reveal input and drag regression
- Restored native drag regions on the toolbar and whitespace around controls. URL field, buttons, and form controls retain explicit no-drag regions.
- Added a near-transparent (0.4%) non-draggable hit surface over the page while shell chrome is raised, so AppKit can deliver page gestures to the existing input forwarding path instead of treating completely clear shell pixels as window hits.
- Extended native fixture regression to verify page clicks, scroll offsets, and requestAnimationFrame progression during reveal, plus drag/no-drag computed regions and URL focus on white/dark pages. Desktop typecheck and smoke pass.
- Native CUA interacted with the isolated fixture toolbar; blank-space drag did not focus the URL. Full OS window displacement was not instrumented; no user browsing pages were operated.

## 2026-09-23 — URL reveal input and sidebar dragging

- Reproduced stale native hit testing: the transparent shell received wheel events after its toolbar had hidden, while forwarding was disabled. Lowering the toolbar now reattaches page views to refresh native hit order; page-region forwarding remains available whenever a native page is showing. Scrolling releases address focus and dismisses the reveal.
- Added captured window dragging for blank toolbar and sidebar areas. Interactive controls and tab dragging are excluded. Drag ownership is scoped per surface, and pointer positions are validated and rounded before moving the native window. Renderer focus transfers no longer cancel sidebar drags.
- Verification: desktop build and typecheck; `toolbar-glass-design.mjs` passed light/dark page clicks, URL-focused scrolling, continued scrolling after reveal closes, sidebar controls, and a native-window bounds assertion for sidebar dragging. A recorded sidebar drag moved the window from (100,100) to (259,232). GitHub native instrumentation also confirmed resumed scrolling after the toolbar closed.

## Publication checkpoint — September 23, 2026

Typecheck, lint (387 warnings / cap 390), 1,029 unit tests, 27 integration tests,
all eleven focused native design smokes, benchmark manifest validation, bundle
budgets, and unsigned macOS ARM64 packaging passed. Integration was rerun alone
after fixture-port/build-output contention in overlapping runs. Current behavior,
limitations and pickup steps are in [the checkpoint](docs/ui/design-update-2026-09-23.md).
GitHub CI remains a separate post-push gate.
