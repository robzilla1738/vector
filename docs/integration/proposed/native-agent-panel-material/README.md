# Agent sidepanel material boundary

The actual v529 Agent panel displays the supplied header, context and composer, but its backing is opaque. The supplied root explicitly sets sidepanel body data-theme=transparent. The native panel instead paints an opaque toolbar-color parent over Chromium's opaque main-region matte. Its plain ExtensionViewViews host also lacks the recovered transparent WebContents setup.

This proposal confines changes to the actual bundled Agent entry/host. It applies the same persistent transparent observer, page-base color and existing render-view background/override semantics already used by ApplyTransparentPopupBackground in aux_mini_popup_api.cc, before attaching the sidepanel view. Replacing a differently colored preexisting helper matches that recovered helper's update semantics. It retains original WebContents lifetime and renderer; no supplied CSS or page is edited.

The panel parent paints one 80% tint from the existing toolbar palette, matching the pinned supplied normal Agent page stylesheet. The sidepanel body is transparent, so this one native tint supplies its backing. The native main-region matte is omitted only while the actual Agent entry is current, so it cannot make that tint opaque from behind when the active browsing tab is an external site. Third-party panels, custom themes and high contrast keep their existing backing policy. This is a native host adaptation inferred from the supplied transparency contract and observed reference, not recovered original C++ for the sidepanel painter.

## Integration

Apply native.patch against the three manifest preimages in the current v529 composition, register output hashes in the next composition, and serialize the normal native build through scripts/native-build.py. Changed objects are extension_side_panel_coordinator_views.o, side_panel.o and themed_background.o. No GN addition is expected: these existing owners already depend on Views WebView and content. Assemble from the matching build receipt and use root's current authorized development launch process. Verify Ask panel beside an external page and NTP, close/reopen, and focused composer; preserve the current working preview until replacement is ready.

Patch application passes against exact current files. No native checkout mutation, build, package, signing or launch by this lane. Reference screenshot and profile content remain local-only and uncommitted. Pixel agreement still requires the combined native observation.
