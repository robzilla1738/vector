# Foundation capture review — October 1, 2026

Status: baseline inspection complete; final feature/theme/motion acceptance pending. No P0/P1 found in the inspected states. Four P2 findings remain open. Preference settings were not proven by these manifests; captures visibly use dark shell chrome. No light/reduced-transparency/reduced-motion approval is claimed.

Evidence root: `/Users/rcourson/Code/web/release/test-artifacts/`. Paths below are relative to that root. Images were inspected directly, including the clean split capture. Capture SHA256 values were checked against the manifests independently. Dirty diagnostics support concrete defect reports, not qualification. All images remain outside git.

| State | Artifact | Identity / image SHA256 |
|---|---|---|
| Split opened | `w0-v2-split-view-diagnostic-2026-10-01-b/split-open.png` | a874dea4+dirty / f71770bc9ac74d33c9067278e32cb997efb514d462ab36df2a4e069b7395610b |
| Clean split opened | `browser-runtime/f0fe15d04d94ff98a70e66105350520bb8061fc9/split-view-1790833467257-1/split-open.png` | f0fe15d0 / same f71770bc capture hash |
| Reader article | `w0-v2-reader-diagnostic-2026-10-01/reader-article.png` | a874dea4+dirty / d6a9a6b2872df9504ff36fb8855af8dac07f43dc17b34e1f50055a1d42919873 |
| Reader returned | `w0-v2-reader-diagnostic-2026-10-01/reader-returned.png` | a874dea4+dirty / b82a27c9d94cfe7a362a77c89e73ac09127a98cf145bcbb5c2693aae67500580 |
| Zoom110% | `w0-v2-page-zoom-diagnostic-2026-10-01-c/page-zoom-in.png` | a874dea4+dirty / 5afbf60226572eb2d0cde76879dde46bfb5b1099dc878bfcb19ff35a4b83236a |
| Zoom reset | `w0-v2-page-zoom-diagnostic-2026-10-01-c/page-zoom-reset.png` | a874dea4+dirty / 74837fbd16bfd37bcca964fdb48993210e33b099d8b792ff8d0d892f8af76426 |
| Visible splitView:on | `w0-docs-promoted-2026-10-01/splitview-promoted.png` | f0fe15d0 / c4c75cee18c4cda444b3298d701ea389f8bf0e1a48846809327528e3fb99e4ef |

Clean split record: `docs/qualification.json#features.splitView`; native manifest 9c8a58e9f274406550a10392694a85f835d613bc73282249679a21ee7a43dcb3; shell digest f3c53343b16128bdac4297ba5ad778c48d48659185c6d250614eaea80fea13ae. Qualification is a behavior gate and does not waive F9/F21 design requirements.

## DR-001 — P2 — Reader overlaps the sidebar control

Feature: reader/F21. Owner: integrator shared layout adapter, then L12; LJ owns regression evidence. Status: open.

In reader-article.png, the persistent Show sidebar glyph intrudes into the Back to page button. The Reader step's manifest AX confirms Show sidebar x30,y144,width28,height28 and Back to page x46,y155,width89,height24, intersecting 12×17 CSS/native points. This is a real interactive-target collision, not screenshot scaling. Reader reserves 24px left padding while the stage-level sidebar button occupies that space.

Required: distinct controls with unobstructed labels and click/focus targets, preserving shared spacing and keyboard focus. Reserve the stage control area or relocate the shared control through the owned layout adapter. Do not merely hide the collision visually while retaining overlapping hit targets.

Closure: native Reader screenshots in both layouts and all appearance cells; AX rectangle nonintersection; real press and keyboard focus of each control without triggering the other.

## DR-002 — P2 — Native zoom feedback is anchored outside the window

Feature: pageZoom/F21. Owner: integrator/native repair through builder; LJ owns regression evidence. Status: open.

The 110% capture shows an additional native zoom bubble floating in the upper-left region outside Aux. The zoom step AX identifies Reset to default zoom level as a window x−266,y0,width266,height48, completely outside the main window x22,y56,width1200,height949. Its Reset button is x−84,y6. The Site controls sheet already has working 110%/minus/plus/Reset feedback, so this detached duplicate weakens feedback and can be unreachable on the active screen.

Required: every transient control anchored to its owning native window/trigger and visible within the active display; avoid redundant stock zoom feedback when the Aux sheet already handles the action. Investigate the native browser toolbar anchor instead of clamping screenshot bounds.

Closure: change zoom through sheet and HID, move the window, repeat at screen edges and both layouts; native zoom bubble either intentionally absent with valid Aux feedback, or correctly anchored/on-screen; AX bounds and new captures confirm.

## DR-003 — P2 — Feature availability labels touch their status

Feature: About/shared settings/F21. Owner: integrator About setting or L12 shared table style. Status: open.

In splitview-promoted.png, smartDownloadNames extends to the adjacent off text, reading as one run. Short labels show the intended two columns. AboutAux.tsx renders an unstyled intrinsic table with raw feature IDs and no guaranteed column gap. The table has ample width but does not allocate readable separation to long names.

Required: maintain at least one 4px-grid spacing unit between label and status, with stable alignment, sensible narrow-window behavior and visible focus where applicable. The diagnostics panel may retain precise feature IDs; they must remain separately legible from status.

Closure: new native About capture including smartDownloadNames/demonstrationSkills/steerAndTakeover, both themes/reduced transparency and narrow width, with no collision/wrapping ambiguity. Preserve positive visible AX evidence for each qualified status.

## DR-004 — P2 — Foundation split lacks F9 stage inset

Feature: splitView/F9. Owner: future L5 surfaces. Status: open for the F9 implementation; foundation behavior qualification remains valid.

Both dirty and clean split-open captures show panes flush to the top and bottom of the available stage. F9 requires 8px inset and 8px gutter with 6px pane radius. The center gutter is visible, but the outer inset is absent. The legacy foundation capture also lacks the later F9 stacked favicons/Flip/Separate/hover-header evidence; these remain pending implementation checks rather than additional invented defects.

Required: use the exact F9 pane geometry across 2/3/4-pane layouts, preserving minimum pane size and stage cover state. Closure: measured native rectangles and screenshots in both tab layouts/all appearance cells, with divider focus/hover and narrow windows; no screenshot-only spacing guess.

## Remaining checks

Reader reading measure and type hierarchy are readable in the inspected default state. The original page is restored; fixture page typography/color is fixture content, not Aux shell styling. Site controls and Appearance have readable default labels in these samples. Visible About splitView:on is confirmed by image and positive AX frame. These observations approve only those inspected states.

Need builder evidence for light/dark forced preferences, Reduce Transparency off/on, Reduce Motion off/on, hover/keyboard-focus/disabled/error/empty states, Reader Contents/find controls, narrow layout, actual native glass composition and timing. See RUBRIC.md for the complete per-feature matrix. Existing dark samples are not final contact sheets.
