# Zap and site CSS native hook

The host-neutral B10 implementation stores Zap rules and user CSS in the runtime SQLite database, keyed by `(browser Profile ID, exact HTTP(S) origin)`. The renderer's **Site controls → Customize this site** flow picks elements, reviews bounded CSS selectors, saves rules, and applies the resulting stylesheet to the current document through the attached page driver. The runtime starts with `AUX_BROWSER_PROFILE_ID`; the native host must supply the Profile identity already used for browser-owned state. Private windows do not expose this flow until private Profile isolation is wired end to end.

The native Chromium fork must install one Profile-scoped stylesheet hook for persistence across navigations:

1. At each primary document creation, obtain the committed top-level HTTP(S) origin and the owning `Profile*`. Never derive the Profile from a renderer-supplied string, and never use the previously active tab's origin.
2. Ask the runtime for `customization.css.effective({origin})` on the trusted browser channel associated with that Profile. The response combines Zap selectors and user CSS. Do not expose this host-only method to web content or the external client API. A failed lookup should leave the document unmodified and surface a host diagnostic, without blocking navigation.
3. Inject that CSS into the main frame at document start, before first paint when possible. Keep one replaceable, browser-owned sheet per document, tagged as Aux customization. A later rule edit calls `customization.css.apply({pageId,expectedDocumentEpoch})` for the open document; the native implementation should replace the same sheet, not accumulate copies. A navigation to another origin must discard the previous document's sheet.
4. The hook should run again for reload, same-tab cross-document navigation, session restore, and reopened tabs. Same-document history changes retain the current sheet. Do not inject into `chrome://`, `file://`, or other schemes. Subframes and closed shadow roots are outside the initial Zap scope; the picker rejects elements in an unreachable shadow root.

The current `pages` driver method provides immediate application but cannot guarantee document-start styling after reload. The native hook is required to complete persistent visual behavior without a flash of unstyled content. CSS only is accepted; Zap does not run page JavaScript boosts.

The native Profile must enable the registered `zapAndUserCss` feature for `chromium-fork` before these runtime methods are exposed; fork features default to off until explicitly enabled.
