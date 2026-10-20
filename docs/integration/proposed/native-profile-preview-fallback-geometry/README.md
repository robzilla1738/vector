# Connect actual profile-preview geometry

This source-only proposal connects an existing supplied-page consumer to its genuine region producer. `ProfilePagePreviewPageView::SetFallbackGeometry` had no callers in actual397: every metadata page therefore fell back to the renderer's default top profile/search/scroll rectangles even after the real native profile/search controls had been correctly moved to the bottom. The source supplied the exact missing producer; no replacement preview layout is designed here.

## Implementation

`ProfilePreviewRegionOwner` now updates the real page bounds and its three actual fallback rectangles during Populate and Begin. It uses the genuine profile-button/search-button getters and role2 of the existing five-surface tuple (actual sidebar scroll), checks original visibility and descendant ownership, converts each real parent's bounds to region coordinates, and subtracts the preview top. Chromium155's nested header children are converted through the real hierarchy; their child-local coordinates cannot simply be copied as though they were direct region children.

The existing source renderer owns empty-rectangle defaults and its actual scrolling rows. Hidden/missing roles retain zero-sized rectangles with the same top subtraction; no extra visible content is manufactured. The page and owner lifetimes are checked after the real SetBounds/InvalidateLayout notifications. No new region API, body owner, GN registration or preference is needed. The patch changes only the existing region-owner h/cc.

Actual data, account/profile gates, asynchronous target loading, live target borrowing, image lookup, captured-image precedence, real request/gesture settlement, cancel and completion logic remain unchanged. A metadata page is still metadata, a captured image is still an actual capture, and a loaded target is never reported as successful activation by this helper.

## Supplied source authority

All addresses are from the pinned supplied arm64 framework SHA `64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c`. Exact source-byte hashes and bounded LLVM listings are retained in `source-evidence.json` and `evidence/`.

- `4654ac4..4654acc`: Populate passes its actual region and actual page to `4658b68` before real preview-tab metadata is obtained (`455ca00`).
- `4657b74..4657b7c`: Begin also refreshes the selected real page through the same producer before live/fallback admission.
- `4658b68..4658bcc`: obtains the actual preview rectangle from `4640600`, compares the real page bounds and updates them through `8a4b90` when different.
- `4658c10..4658d38`: reads **region+598 profile**, **+5a0 search**, **+5b0 scroll**. Each visible role walks its real parent chain, converts its parent's actual bounds to region coordinates through `1426944`, and otherwise supplies an empty rectangle. `4658cd4..4658ce8` passes all three rectangles plus preview top to `46407f8`.
- `46407f8..4640970`: subtracts the preview-top argument from each Y coordinate and stores the three final rectangles in the actual page's `+380/+390/+3a0` fields. Original signed/saturating Rect arithmetic is represented through actual `gfx::Rect` conversion and Offset, not raw integer reinterpretation.
- `467de40..467e000`: the existing page renderer reads those geometry fields; original default header/search/scroll behavior applies only to empty rectangles. This consumer was already ported and compiled; the missing owner calls are the change here.

The current actual155 headers/page/presentation are pinned separately as integration APIs, not mislabeled as original supplied binary source. No new REA session, native execution or owner state was used for this slice.

## Integration and verification

Apply only against the exact actual397 h/cc baseline hashes in `manifest.json`, after root finishes the frozen build/package. No shared checkout write or build was performed by this lane.

Run `python3 docs/integration/proposed/native-profile-preview-fallback-geometry/verify.py`: five counted anchors, five source ranges, seven actual API snapshots, and exact two-file patch replay are checked in disposable storage. Native compilation and real disposable-profile preview/gesture observation remain root verification. This fixes one concrete producer/consumer gap; it does not declare complete profile-preview or whole-product parity.
