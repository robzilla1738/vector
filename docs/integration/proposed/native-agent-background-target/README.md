# Supplied Agent background target and switch lifecycle

Nine-file follow-up against **unapplied** `1f68ffe5a` background outputs on appliedv27. Use `native.patch` + `manifest.json` after the staged background proposal; do not apply directly to v27. No shared source changes or build. Source pins and bounded original instructions accompany this proposal.

## Actual target and exclusions

Original045ce218 is a visual target predicate, separate from profile preload eligibility. It rejects null contents and the address-only user-data marker0xcee54b8; then examines pending-entry, visible-entry and committed-entry virtual URLs and the primary RFH committed URL for the exact Agent extension host. For pending/visible native new-tab aliases it resolves the actual currently controlling extension against **that WebContents' BrowserContext** and compares its ID. There is no new profile-account mapping, title inference or generic private-browser exemption in this style predicate. The actual preloader retains its separate incognito/guest/system/feature guards.

Original045cfae4 recognizes chrome newtab/new-tab-page, chrome-search local-ntp/remote-ntp and the existing search::IsNTPURL helper (original00b1cc60 matches its source branch/callees). The port reuses actual155 ExtensionUrlOverrides::GetExtensionControllingURL; a native alias alone never proves Agent ownership. Direct extension-host checks preserve the supplied visual predicate rather than imposing a new enabled-extension policy on old documents.

The exclusion is recovered as `extensions::SidePanelHelper` through its named SidePanelWebUIView owner,24byte WebContentsUserData/dispatcher-delegate constructor and embedding browser WindowController callback. Both target query and navigation observer use existing SidePanelHelper::FromWebContents. The original class literal is stripped; the independently matching source/control-flow identification and exact limitations are recorded in ../native-ntp-background/marker-followup/. Earlier “observer registration” wording is corrected: the constructor sets the actual extension dispatcher delegate.

## Distinct transition guards and call order

Prepare045cc690 first checks the prerender feature and same BrowserContext, and requires old/new **native NTP alias** visible URLs (falling back to the committed entry) actually controlled by Agent. Direct chrome-extension pages can use the body-background readiness path; they do not thereby qualify for an old-page clone. This proposal preserves that distinction and uses the real shared feature accessor instead of tying style eligibility to preload profile restrictions.

The sole original direct Prepare caller is045aebb0 in BrowserView's active-tab switch. It runs **before** inactive/active SetWebContents(nullptr), then the destination is attached later. The earlier proposal's Prepare-inside-SetWebContents(new) would have lost the source because current155 clears it first. This follow-up adds the explicit BrowserView pre-detach call and preserves the prepared clone, weak destination and remaining timeout through the intermediate null. Only adopting a different nonnull destination invalidates it. A null gap restores native opacity without fabricating background readiness or dropping the held image. All existing normal switch/focus/layout code remains.

Other supplied Prepare implementation checks involving the root frame/page fields and its separate view-overlay pointer remain source-recovery limits; this follow-up does not guess new public meanings for those offsets. It preserves the existing surface-copy requirement and documents this remaining difference rather than claiming exhaustive native visual parity.

## Popup/native scope and page-base lifetime

Original045cf484 treats BrowserInitState names `aside_account_password_popup` and `aside_extension_popup` as transparent native surfaces. The port reads those actual native creation parameters via the contents' real top-level Widget/BrowserView or the owning Widget. It never infers a window role from its URL/title. Existing independently implemented raw mini-popup/bootstrap WebViews have no BrowserInitState role and do not use ContentsWebView; their actual behavior is not newly claimed or silently reclassified.

Original030ae900 applies optional transparent/unset **to the current hosted WebContents on each background update**, including ordinary pages. The previous owner-tracked conditional reset is removed. Recovered original306c2c0 SetWebContents delegates to base2608a00, then applies/refreshes the replacement only; its null branch restores native-layer opacity and status state without clearing an old detached WebContents' page-base color. The actual155 WebView base also preserves old color-provider observation to avoid color pop-in. No source evidence supports inventing an old-WebContents page-base reset on detach/destruction, so none is added. Moving a detached page into a raw WebView may preserve its explicit base color, as in the recovered source; a later ContentsWebView ordinary update unsets it.

Mac NativeViewHost constructor creates its real LAYER_NOT_DRAWN compositor layer; GetUiLayer returns host_->layer(). The recursive clone uses virtual Layer::Clone, including current LayerSurface::Clone primary/fallback surfaces and LayerTreeOwner descendant ownership, preserving actual renderer surfaces rather than a screenshot.

## Build boundary and validation

The state implementation moves from the small frame target into the existing UI target, which already consumes the real extensions component and its allowed circular headers. This avoids adding frame→extensions→UI dependency cycles. The frame target publicly exposes only the state header; the UI target adds the real search/viz dependencies. Original UI component/CSS/assets are untouched.

Temporary replay validates all seven parent outputs and nine follow-up outputs. The root composer independently replays the cumulative appliedv27→background→target patch from actual frozen inputs; validation.json records its hashes/count. No C++/GN compilation or actual UI acceptance is claimed. The separate native DP/carrier authentication blocker remains unrelated and unresolved. Next focused compile after the active full build: state, ContentsWebView, BrowserView and service objects plus GN dependency checks; then approved disposable actual visual handoff/profile/side-panel/popup/navigation observation.
