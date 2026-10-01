# Browser-runtime visual acceptance

Reviewer: `/root/design_reviewer`. Source: F21 and each feature's geometry/motion specification in `docs/BROWSER-RUNTIME-PLAN.md`, plus the current owner corrections recorded in `design-qa.md`. Historical pass labels do not approve new feature implementations.

Only the dedicated builder operates the native app. Reviewer inspects the actual builder captures, AX/native observations and timing evidence. Product and qualification edits stay with their owners. Reference images stay outside git; this directory contains review metadata only.

## Evidence requirements

Each reviewed state records product commit/tree, native build/manifest identity, shell digest, journey ID, manifest path, capture path and SHA256, window dimensions, capture density, tab layout, theme, Reduce Transparency and Reduce Motion settings. Unknown preference values remain unknown; a dark-looking capture does not prove a forced dark preference. A renderer-only image cannot prove AppKit glass, native anchors or SurfaceEmbed composition. Screen-composited evidence is required for glass, while bounded window images remain useful for geometry.

Contact sheets use original capture proportions, legible labels and a link to each full-resolution source. Label every state and preference cell. Sheets summarize evidence; they never replace full-resolution inspection. A sheet must contain an actual image for every claimed cell, not a repeated image or a simulated theme.

For every mapped feature, collect these four appearance cells:

| Cell | Theme | Reduce Transparency |
|---|---|---|
| L | Light | Off |
| D | Dark | Off |
| LR | Light | On |
| DR | Dark | On |

Within each cell inspect default, hover/press, keyboard focus, selected/disabled, empty/loading/error, toast and sheet/popover states that the feature exposes. Include long labels and a narrow usable window where the feature has responsive UI. Both tab layouts apply to shared browser chrome, surfaces and navigation. Missing applicable states keep approval pending; truly inapplicable states need an explicit reason.

Motion verification covers each theme with Reduce Motion off and on. Static screenshots cannot establish durations or an instant transition. Use native/renderer timestamped state changes or frame sequences tied to the same candidate identity and real UI input. Reduced motion must remove the motion called out as instant/off, while preserving feedback, visibility, focus and final geometry. Reduced Transparency must preserve readable ink and opaque material fallback.

## Exact checks

| Area | Required values / behavior |
|---|---|
| F21 shared tokens | Squircle radii 8.4/11.2/16.8; 4px spacing; .5px hairlines; Geist and Geist Mono scale |
| F21 motion | Default 150ms cubic-bezier(.4,0,.2,1); tab hover 100ms in/300ms out; drag settle 300ms; popup opacity 82ms; chip expand 350/collapse250ms; material state layer 120ms |
| F21 material | Blur 3–4px, plus-lighter fills, xor-mask hairline, inner glow; opaque reduced-transparency fallback; floating sidebar #24272b dark/#f3f4f6 light |
| F21 command rows | Height 32; icon 20 positioned 12px from left; font 14; radius 16 |
| F2 sidebar | Reveal edge 6/leeway 8; in 200/out 150ms; resize handle 5; width 126–400; snap thresholds 15; keyboard step 50 with announcement; row 30/pin 32/radius 8/padding 12 |
| F3 Minimal UI | 200ms emphasized, instant reduced motion; stage≥99%; traffic-light reveal 60×40; restored controls and no lost drag targets |
| F7 command surface | Floating at 18% stage height; width min(680px,70vw); radius 12; edit field selects URL; modes/providers visually coherent |
| F9 split | Gutter 8/inset 8/radius 6; pane minimum max(200px,10%); snap 15; hover header 24; spring 400/damping 34, off reduced motion; controls never cover unrelated chrome |
| F14 Little | Window 960×720; strip 40; downloads popover 280; promotion/copy/tray remain legible and reachable |
| F16 mentions | Caret-anchored listbox; complete-token deletion; Changed/Closed chips; no misplaced listbox or clipped hint |
| All features | Visible focus rings, readable text, 14/16px icon slots, consistent hover/press feedback, real copy, no control overlap or offscreen interactive popovers, intact empty/loading/error states |

More-specific feature values take precedence over the shared defaults. A source value supports the cause but does not by itself verify the native result. Geometry is measured in CSS/native points after accounting for image density, not in resized preview pixels.

## Coverage ledger

Maintain one review row per feature, including all targets in the feature→journey map and every LJ claim. The following rows start pending; none are approved by the foundation sample.

| Features | Journey / owner | Required cells | Status |
|---|---|---|---|
| commandRegistry | shortcut-registry / L1 | L,D,LR,DR; focus/conflicts/recorder/toast; motion | Pending |
| floatingSidebar,autoHideToolbar,layouts | sidebar-modes / L2 | Four cells, both layouts, reveal/resize/locks; motion | Pending |
| minimalUi | minimal-ui / L2 | Four cells, both layouts, edge reveal; motion | Pending |
| windowSync | cross-window / L4 | Four cells, both windows, moved/agent-owned cards | Pending |
| commandBar | command-bar-modes / L3 | Four cells, all modes/providers/loading/error/focus; motion | Pending |
| splitView | split-fluid / L5 | Four cells, 2/3/4 panes, both layouts, hover/divider/drop; motion | Pending; foundation sample inspected |
| pinnedApps,liveFolders,folders,tabSections | pinned-live / L8 | Four cells,pin drift/badges/four sources/errors/unread | Pending |
| smartDownloadNames | smart-download-rename / L9 | Four cells,toast/Undo/conflict/row/settings | Pending |
| profiles | in-app-profiles / L6 | Four cells,chip/menu/appearance/isolation copy | Pending |
| extensions | extension-actions / L7 | Four cells,badge/overflow/popup/sidepanel/shortcut | Pending |
| linkRouting | link-routing / L6 | Four cells,table/editor/test/ask/fallback toast | Pending |
| cliOpen,appleScript | cli-open,applescript / L6 | Four cells of resulting native placement/focus; CLI output reviewed separately | Pending |
| littleWindow | little-window / L4 | Four cells,strip/tray/promotion/empty; motion | Pending |
| autoArchive,archive | auto-archive / L8 | Four cells,education/Undo/archive/search/empty | Pending |
| tabMentions | tab-mentions / L10 | Four cells,listbox/chips/drift/closed/focus; motion | Pending |
| pictureInPicture | pip / L5 | Four cells,enter/exit/no-video/media/Document PiP | Pending |
| agentSitePermissions | agent-site-permissions / L10 | Four cells,site rules/grants/revoke/all confirmation tiers | Pending |
| demonstrationSkills | demonstration-skill / L11 | Four cells,banner/pause/steps/variables/ambiguity/drift | Pending |
| overnightReview | overnight-review / L11 | Four cells,start card/inbox/budget/parked/empty | Pending |
| sitePermissions,reader,inboundAgents,electronMigration,quickAsk,aiTranslate,httpsFirst,contentBlocking,pageZoom,automations,spaces,outboundMcp,aiTidy,tabLifecycle,peek,titleRules,aiTabNaming | LJ ports / LJ and overlapping feature owners | Separate per-feature four-cell sheets, applicable states/motion | Pending; Reader/pageZoom foundation samples inspected |

## Finding format and closure

Each finding has a stable ID, priority, feature/spec, owner, status, exact evidence path/hash/identity, observed behavior, required behavior, practical impact, repair scope and closure evidence. P0 blocks safe use or loses user work; P1 blocks a normal core workflow or makes it inaccessible; P2 is a concrete polish/accessibility inconsistency or specification mismatch. Unknown evidence is a pending check rather than an invented defect. P0/P1 must close before the owning lane merges. All P0–P2 must close for final acceptance.

Closure requires a new native capture plus the relevant AX/native observation or timing trace, inspected by the reviewer. A source fix or owner self-report alone changes status to awaiting verification. Track accepted deviations through the integrator's plan document and review their final result. Final reviewer approval still requires the owner's separate visual sign-off.
