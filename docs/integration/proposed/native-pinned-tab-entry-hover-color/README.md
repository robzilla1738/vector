# Genuine saved-entry colour, paint and hover-card port

Incremental after `native-pinned-tab-entry-drag` (`4b624daba`), changing only the two leaf files. Root owns registration and region integration. No native build, execution or owner state was used.

The original record stores optional RGB at +258/+25c and active at +260. Actual favicon pixels feed eight swatches, filtered at alpha >=128, saturation >=.18 and lightness .12..88. The first surviving colour supplies only the original active RGB overlay/border; absent colour uses the original palette fallback. Vector placeholders do not fabricate an accent. The actual `gfx::Image` remains alive while its bitmap is inspected.

Original `460d25c` calls base View paint, hence `460d780` is the background pass, not the full paint. The port adds the separately proven external-only shadow (0,3; blur5; role231=0x0d000000) and .5px role235 border, or active 2px RGB border with alpha0x66. Active background alpha is0x33. Role235 is dark0x26fafafa/light0x260a0a0a. Source bindings35e7b10..35e7bb0 and35e7e10..35e7ec8 are pinned; no Chromium155 numeric colour-role IDs are assumed.

The saved-entry view now is a real `HoverCardAnchorTarget`. It supplies `TabData::FromTabInterface` from a genuine current model association; URL-only saved entries have no fabricated card. Original secondary addresspoint e7201a0 has ten entries: +48 resolves3f512c0, which returns4 (`LEFT_TOP`). Thumbnail eligibility is !active; validity rejects paused/dragging/unassociated targets. Enter/exit use kHover; press/drag/pause dismiss through kEvent. Actual tooltip text is suppressed during outgoing drag and restored afterward. No destructor calls the parent-owned controller after its lifetime; the real controller's ViewObservation handles anchor deletion.

## Required root integration

Use the actual base region's already-owned controller at the existing construction site:

```cpp
std::make_unique<VerticalPinnedTabEntriesView>(
    browser_view->browser(), hover_card_controller())
```

No new controller, URL-derived tab ownership, hover-card replacement, region callback or GN edit is included. The optional accent is appended to `EntryDragData` for genuine region preview consumers; its existing fields remain unchanged.

## Verification and limits

`python3 verify.py` independently replays the two-file unified patch in a temporary directory, verifies both baseline/output hashes and eleven bounded original binary pins. This is source verification only. Root must compile the leaf and region constructor call, then observe hover/drag/paint in an authorized disposable browser.

This slice closes the recovered optional-colour, separate shadow/border and shared-hover-card omissions. It does **not** declare the entire leaf complete: root still owns actual region outgoing drag/preview callback integration; cache/service/icon-population and all existing context-menu command branches have not been exhaustively matched here. Profile-switch/controller ownership is the existing real region lifecycle, not a newly invented controller lifetime.
