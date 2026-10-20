# Anchor theme notification without an attached bubble widget

The v522 activation crash reported `SEGV_ACCERR 0x330` from Widget::ThemeChanged during the GlassFrame activation notification. Exact candidate disassembly at 0x9b362e0 is `strb wzr, [x0, #0x330]`, the first state write in Widget::ThemeChanged: this is a null Widget receiver, rather than evidence of a dangling GlassFrameService.

The caller under the Widget observer notification is the deduplicated ObserverList dispatch. BubbleDialogDelegate::AnchorWidgetObserver::OnWidgetThemeChanged unconditionally calls `owner_->GetWidget()->ThemeChanged()`. Its SetAnchorView/SetAnchorWidget paths attach the observer as soon as the anchor exists, independently of whether the bubble has its own Widget. AuxTabSearchDelegate follows that upstream constructor path before CreateBubbleDeprecated, and retirement can similarly remove the widget while the delegate still observes its anchor.

The narrow repair checks that actual nullable widget before forwarding theme notification. Existing attached bubbles retain the same propagation; GlassFrame and theme eligibility are unchanged. No theme caching, deferred callback, fake state or disabled glass effect is introduced. This fixes the concrete null receiver path; runtime reproduction must still confirm it was the exact observer behind this crash, as deduplicated symbols omit that identity.

Validation: exact native input/output hashes pinned, patch application checked. No native modification, build, signing or runtime action by this lane. Integrator should exercise activation and creation/retirement of search and profile bubbles with theme updates.
