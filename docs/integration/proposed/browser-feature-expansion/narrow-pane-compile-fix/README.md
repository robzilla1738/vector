# Narrow-pane native control compilation correction

Exact two-file overlay against the projected a19 `multi_contents_view.{h,cc}`. No GN/mini-toolbar dependency or upstream `ToolbarButton` edit is included.

The three direct `ToolbarButton::SetText` calls were invalid because that native method is protected. A small private `MultiContentsView::NarrowPaneButton` subclass exposes only `SetControlLabel` for these controls and calls the inherited protected setter legitimately. It retains the actual native toolbar-button appearance, focus, pressed and hover behavior. Its metadata and constructor/destructor are defined using the selected Chromium patterns.

The narrow-only row no longer requires three long text labels: the focus toggle uses “Focus”/“All” and the previous/next controls use compact chevrons. Full action names and pane-count state remain accessible; existing full tooltips remain. Each native button has a scale-to-zero/preferred-width flex rule, so layout shrinks within the supplied narrow viewport instead of depending on unlimited label widths. No pane minimum, tree ratio, document, history or selection logic changes.

Ordered count-one source replay and equivalent unified-patch byte/whitespace checks pass. Selected native APIs inspected: protected `ToolbarButton::SetText`, `PressedCallback`, nested metadata macros, and native `FlexSpecification` size rules. No compiler, build, app lifecycle, signing or runtime acceptance was performed by this worker. The integrator should recompile only the previously failed object and retain actual small-window visual acceptance as unverified until observed.
