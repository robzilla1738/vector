# Supplied profile preview page

This ports the actual `ProfilePagePreviewPageView` hierarchy constructed at `465352c`, its manual layout at `467dc80`, and the exact noninteractive preview branch of `AsideSectionRowButton` (`467ea7c`). It retains native View/Button/ImageView/Label/ScrollView descendants. It does not substitute an HTML screen, generic label list, stock browser screenshot, or fabricated target tabs.

The page has a captured-image layer, an actual live-content host for the five borrowed views, and a fallback root. The fallback contains the original 20px avatar/monogram, 14px medium name, 12px disclosure, genuine 28px ProfileSearchButton, and vertically scrolling rows. The full original icon path elements (pin, bookmark shelf, globe, disclosure) are copied bit-for-bit; proper-case icon debug identities are Aux. Row title font is 13px medium, fade-tail, no subpixel or automatic readability. Rows have original 34px height, headers28px, outer horizontal8px margins, leading inset7px (header8), icon16px/right8px, and original selected/hover native paint/radius8.

Row production preserves original order and limits: first10 pinned tabs, a Bookmarks section only when there are bookmark titles (first4), then Tabs and first10 nonpinned tabs. If there are no nonpinned rows, the supplied selected New Tab **presentation placeholder** is retained; it neither creates a tab nor claims one exists. Search is the supplied fallback's non-actionable callback branch, not an invented search operation.

Manual layout preserves source-provided header/search/scroll rectangles. Without them the original defaults are header `(8,0,width-16,32)`, search preferred size at right8 centered in that header, then full-width scroll below it. Captured-image and live host fill the page. Original source-region geometry conversion remains the separate explicit155 adaptation already in ProfilePreviewPresentation; this page does not reapply original raw coordinates over the converted live children.

`SetProfile` accepts the **actual already-resolved** label/avatar. An empty avatar means the caller has selected the original monogram branch, not that this view inferred a profile icon. `SetFallbackData` accepts real tab and bookmark metadata only. `ShowLiveContent` selects actual borrowed content or fallback; no capture, cache lookup, account/profile admission or success result is invented here. The source producer `455ca00` has a real session-service/workspace persistence fallback beyond target cache and is being ported separately before owner activation.

## Integration

Add `aux_profile_preview_page.cc/.h` to the existing enabled Mac Aux view sources. The `.inc` is included by the cc and must be staged at the same fixed path. Existing dependencies are views, gfx and the previously delivered ProfileMonogramAvatarView/ProfileSearchButton implementations. This proposal changes no existing native file and introduces no input trigger. Root owns GN and actual focused compilation.

Call `page.live_host()` from the genuine presentation binding, then the real owner supplies target metadata and geometry. The actual five role views, target-cache admission, loading, progress and settlement still need the real region lifecycle; do not present this renderer alone as completed profile switching.

Verification is static original-byte/extract/icon re-encoding plus isolated new-file patch replay. No target executable, owner profile, preferences, network, Keychain or OS grant was accessed. Not compiled or visually accepted.
