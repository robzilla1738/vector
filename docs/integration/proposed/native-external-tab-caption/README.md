#155 external-tab caption adapter

One current-native file, one counted insertion. No header, region, GN, shared-native write or native build. This is a necessary **Chromium155 hierarchy adaptation** to the proven supplied external-scroll topology; it does not claim that an unlocated original caption implementation was recovered.

## Source correction and authority

The requested41294a0..4129628 range is **focus ownership**, not a point/caption hit test. It never consumes x1, obtains the actual widget/focus manager, reads focused view+18 and walks parents+188 against this, pinned338 and unpinned360. No proposed hit-test policy is attributed to those bytes.

Supplied41277dc..4127c34,4129628..41298b0 and464ccfc..464d3f0 prove the real external-mode topology: genuine unpinned is a direct TabStripView child and genuine live pinned is reparented into the actual region before shared outer scroll5b0. Root's actual mount and current fields preserve that topology. The proposed caption adapter recognizes those actual native children, not saved-entry tiles or independently constructed rows.

Current155 `IsPositionInWindowCaption` only recognizes ScrollView/TabScrollButtonContainer children. When a real direct UnpinnedTabContainerView hits, the existing `!scroll_view -> true` branch incorrectly calls it caption. External live pinned is not in children() at all. The exact current baseline and155 View/ScrollView APIs are retained. This is the positive structural incompatibility being fixed.

The owner-provided `AI Blueprints/06/assets/upstream-src/.../vertical_tab_strip_region_view.cc` states the region's general actual-visible-child policy: translate the point, call real HitTestPoint, absorb a hit as noncaption. It agrees with current region code. Its snapshot is explicitly classified as **provided upstream source**, not asserted to equal shipped fork caption bytes. The original fork's precise corresponding caption function remains unidentified; this adapter makes no new typography/layout/paint decision and does not infer a source function from a neighboring address.

## Narrow behavior

Only actual `external_scroll_mode_` enters the new branch. Pinned/unpinned pointers are the existing native collection views. A real visible hit returnsfalse (client), preserving tab click/drag interaction. Invisible/outside hits retain the old fallback. Default/horizontal wrapped-scroll handling is byte-for-byte unchanged.

External pinned is considered only when its actual parent is this native root or the registered real external parent that still contains this root. This prevents translating a detached/transferred child from an unrelated hierarchy. Direct unpinned must actually be parented to this root. No tab ID, URL, group-title or row-index heuristics are involved.

When the real shared outer scroll is registered, unpinned hits are clipped by that actual visible viewport and common ancestry. Offscreen unpinned content cannot incorrectly absorb header/profile/search points. Its actual visible vertical scrollbar remains a client hit, mirroring the existing wrapped-scroll policy. External pinned remains independent of the shared viewport, as the supplied sibling topology requires. With no registered external scroll, a genuine direct child can still be tested during the source-supported setup/clear boundary; no fake viewport rect is supplied.

## Integration and checks

Apply to exact baseline `a39b439425885b1e78e0f8b2b3f6e08e42b2d14fa95da8c6a89bc490b02b5077`; output is recorded in manifest. Only `tab_strip_view.cc` needs focused compilation; no public-header invalidation or new dependencies. Root owns actual application/build/runtime observation.

`verify.py` validates four supplied byte ranges, immutable155 API and provided-upstream classification snapshots, disposable patch replay to the output hash, and exact preservation of the original wrapped-scroll fallback. Static checks pass. Actual nonclient hit testing, clipped pointer/drag behavior and profile-transfer observation are unverified. The current region also has its own caption dispatch; this helper correction alone is not presented as full window-interaction acceptance.
