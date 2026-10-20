# Restore the original retained-hover animation dispatch

The earlier region-hover port correctly copied the beginning of original4650a04 (pinned temporary width, state flag, timer and layout effects) but omitted its final controller dispatch. Its comment incorrectly claimed that the source never starts the browser animation controller. The complete already-pinned `native-profile-preview-region-hover/hover-state.asm` disproves that claim.

Original4650bc0..4650c3c resolves the actual same-browser controller from the keyed owner. Original4650c50..4650c8c selects motion e87b2a8/e87b2b0 from the requested hover flag and starts it in group e87b290 through770061c. The same group and motion identifiers are read by the supplied frame's hover geometry. Thus the supplied implementation intentionally uses **two different owners for two different transitions**: region SlideAnimation for collapse width, BrowserAnimationController for hover width/opacity.

This patch restores the missing tail using the existing typed `kExpandOnHover`/`kCollapseOnHover` motions, restores the real controller subscription for per-frame invalidation, and makes frame geometry consume its continuous hover width/opacity instead of substituting a boolean. The callback takes an admission-specific branch so upstream controller completion cannot mutate the recovered collapse state. No new animation object or timer is created. The existing typed hover animation's interruption behavior and reduced-motion policy are retained; exact original timing constants have not been independently recovered by this patch.

Apply after `native-hidden-sidebar-overlay` (its exact output hashes are this proposal's preimages). The retained rectangle already contains the original continuous-progress slide formula; it now receives actual progress. Source lifecycle remains in the existing admission/retention owners, including the native edge monitor, real toolbar request and actual cursor checks.

## Stacking and hit testing

Actual BrowserView creates MultiContentsView before the layered VerticalTabStripRegionView. The region is therefore above page contents in existing child/layer order. BrowserView hit testing converts the pointer to the region's real bounds before treating its caption/non-caption areas; it does not rely on reserved content width. The patch adds no global reorder or independent input shield.

## Verification

Both file patches apply to the exact preceding proposal outputs and reproduce their pinned output hashes. No native checkout changes, build, launch or profile access occurred. Integrated runtime observation must check collapse, edge entry, smooth reveal, pointer departure/retraction, toolbar-chip click, rapid reversal and ordinary web-content interaction. This is a concrete missing original dispatch correction, not a claim that the entire UI now has parity.
