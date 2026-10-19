# Exact primary-page paint guards

One-file incremental proposal against actual applied v30 state output, also identical to staged v29's state output. `native.patch` + `manifest.json` are source-pinned and temporary-replay verified; no shared source changes, compilation or runtime acceptance.

Supplied Prepare045cc774..790 refuses a replacement whose primary Page has completed first visually nonempty paint. Supplied probe callback045ceb6c..bc0 accepts a true body result OR the existing transparent-popup role, then requires that same primary-page paint flag before marking ready or inserting its visual-state fence. The patch uses actual155 `WebContents::CompletedFirstVisuallyNonEmptyPaint()` for both temporal guards. Failed/unpainted callback results retain the existing bounded retry/current-document checks. This is distinct from DOMContentLoaded.

`root-page/` pins the original GetPage accessor, its optional<DocumentAssociatedData> engagement CHECK, two independent first-paint writers/delegate notifications, and actual155 public source. No render-frame-live/lifecycle approximation is introduced. The root engagement byte is an internal accessor invariant; using the public accessor preserves it.

The remaining original overlay pointer is separately recovered as a screenshot child View for horizontal-tab gesture crossfade, not the NTP LayerTreeOwner or WebContentsCloseHandler clone. That separate behavior is not guessed into these two paint guards.
