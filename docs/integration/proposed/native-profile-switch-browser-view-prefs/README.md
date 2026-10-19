# Preserve the physical BrowserView while rebinding its actual preferences

This Chromium 155 adaptation preserves the same BrowserView, widget, layout and
observer identities during the supplied same-window profile transaction. The
actual view owns one preference registrar: `prefs::kFullscreenAllowed`, bound in
construction to the original profile. Reset it before the identity changes,
register against the genuine target preference service while the tab model is
empty, and apply the target's policy after its real tabs settle. Abort restores
the actual source service after the source tabs return. Generation and weak
profile identities prevent accepting an unrelated transaction.

The capability passed to the original policy callback must remain the physical
window's genuine pre-policy `CanFullscreen()` value captured in construction.
Capturing it again after the source policy disabled fullscreen would incorrectly
carry that source restriction into a target whose policy allows fullscreen.
The ordinary `UpdateFullscreenAllowedFromPolicy` implementation remains the
policy authority. No fullscreen gesture, new window or synthetic policy value is
introduced. Other BrowserView subscriptions retain their stable migrated service
owners; this patch does not replace those owners.

Public phases are `CanRebindForAuxProfileSwitch(target)`,
`BeginAuxProfileSwitch(target) -> generation`, `RebindAuxProfileSwitch(generation)`
and `EndAuxProfileSwitch(generation)`. This is one necessary native service port;
the full provider, actual gesture and runtime acceptance remain outstanding.
