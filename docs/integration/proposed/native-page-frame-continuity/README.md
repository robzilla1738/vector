# Restore the observed desktop page surface and native panel material

This is a minimal Chromium155 integration adaptation grounded in the owner's actual desktop reference. It does not claim the equivalent original C++ function has been recovered. The supplied source remains the default; these corrections remove replacement-browser frame behavior that visibly differs.

Reference captures made by the integrator in `out/pass1-ui-completion/aside-external.png` and `aside-external-panel.png` show the same example.com page with and without the Agent panel: the main toolbar/page surface meets the top and bottom window edges, its upper corners remain rounded, the toolbar follows the page background, and the panel exposes the same native material as the sidebar. Current `aux-before-external.png` and earlier `out/material-authority-pass/aux-v533-sidepanel.png` show the bright separator, fixed toolbar color and inset square panel/main surface. Exact capture hashes are pinned in reference-evidence.json; images are not copied into Git.

## Actual owners corrected

- Stock side-panel padding adds8 to the main top and bottom and offsets the Agent panel top. Actual Aux Agent panel padding becomes0, retaining native panel width/resizing and transition owners. Other sidepanel entries are unchanged.
- Removing the Chromium native panel header previously retained its9px content border. The real coordinator knows the entry being installed before any current-entry query is reliable, so only the Aux Agent entry gets an empty native border there. Supplied WebUI spacing remains unchanged.
- The previously added80% native Agent-panel tint was an incorrect inference from the full-page NTP CSS. Fresh live reference disproves it: the panel background is native glass like the sidebar. That native tint is removed; original NTP80% tint remains.
- Both real top-container and toolbar backgrounds now round their leading edge using existing window-corner geometry. Rounding only one painter leaves the other square underneath. Existing bottom content clipping also rounds both lower corners for the Aux Mac vertical shell, including beside the Agent panel.
- Normal external pages use the existing actual WebContents CSS background for the toolbar/top-container paint when opaque. They do not use a hardcoded sample color. The existing active WebContents observer repaints those owners on background change and tab selection. Missing/translucent background, custom theme and increased contrast retain the existing palette.
- The Aux normal external page removes the bright stock one-pixel separator reservation, under the same no-infobar/no-split/high-contrast guards already used for supplied Agent pages. No independent border/line is invented.

This patch follows `native-retained-material-eligibility` on v533. That preceding proposal changes the same layout file; the recorded layout preimage is its exact output. Five other files use actual v533 preimages. Disposable sequential patch replay and all six hashes pass. No native checkout, build, app, signing or profile mutation by this lane.

Runtime acceptance must compare external page with panel open/closed, NTP, light/dark appearances, background changes and actual panel resize. Omnibox presentation is a separate coordinated proposal; this patch does not synthesize domain/title text or change editing/security behavior. Retained motion/lifetime is unchanged. Exact original retained blur paint constants remain an explicit gap from the preceding audit, not claimed solved here.
