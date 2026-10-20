# Supplied vertical-scroll preferred-layout policy

Source-only incremental proposal. Apply after `a78e82997` (`vertical-scroll-view.patch`); the constructor baseline is that proposal's output. Base `ScrollView` files are pinned to the actual native170 checkout. The manifest distinguishes this overlap explicitly. No shared source was changed and no native build or runtime acceptance occurred.

## Original behavior

The supplied `VerticalTabStripScrollView` constructor at `0x42455c0` creates a real layered `ScrollView`, then enables inherited byte `+0x3a9` at `0x42456e0..0x4245700`. This is a separate policy from `UseContentsPreferredSize`: the latter's metadata descriptor points to getter `0xa6a8c78` and setter `0xa6a8ca4`, which access `+0x3a8`. The original base constructor initializes `+0x3a9` false.

Original `ScrollView::Layout` (`0x43e9d00`) takes the optimization only when both policies are enabled, content and a real layered viewport exist, the available size is nonempty, and the content's actual preferred size is nonempty. It obtains that preferred size once before provisional layout, skips provisional viewport/content layout, uses the same size for scrollbar calculation and the final layered content bounds, and skips the duplicate final content layout. Its ordinary scrollbar, final bounds, scroll-offset, RTL and post-layout work remains real.

The supplied `Viewport` temporarily suppresses bounds-driven child layout around final bounds (`0x43ea444..0x43ea4b0`, original private byte `+0x318`). Current155 `ScrollView::Viewport` has no corresponding bounds-change child-layout override. This proposal therefore does not invent that private flag: it preserves the current final `SetBoundsRect` and implements the directly recoverable skipped provisional calls and cached size reuse.

## Current155 adaptation

`SetUseInitialPreferredSizeForLayout(bool)` defaults false, preserving all other scroll views. Only the restored vertical-strip constructor enables it. It does **not** enable `UseContentsPreferredSize` for the owner. A real `ViewTracker` guards the newly moved preferred-size callback against synchronous deletion or content replacement. Existing fallback behavior remains when the full original guard is not met.

## Region mounting contract

The restored type is global `::VerticalTabStripScrollView` (no `aux` namespace), header `chrome/browser/ui/views/tabs/vertical/vertical_tab_strip_scroll_view.h`. Construct with `std::make_unique<VerticalTabStripScrollView>()`, attach the actual owner content using the normal `views::ScrollView` APIs, and retain the actual instance for the region's admission guard:

- `scroll_sequence_active()` returns genuine sequence ownership.
- `axis_lock()` is `Axis::kUndecided` (0), `kVertical` (1), or `kHorizontal` (2).
- `ResetScrollSequence()` resets real scrolling/elastic state; it is not a synthesized gesture completion.

The original region holds one custom scroll owner at `+0x5b0`. Current155 `TabStripView` creates two stock scroll views for its pinned/unpinned structure. Replacing both without the recovered original hierarchy would not establish equivalence. The parent owns that actual hierarchy/region mount; no extra child or gesture trigger is added here.

## Verification

The three-file incremental patch independently replays into a disposable filesystem tree. Every input and output SHA is verified against the manifest, including the constructor overlap. Raw bounded disassembly and current source hashes are in `vertical-scroll-layout-evidence.json`. Compilation and actual native layout/input observation remain pending the serialized integrator build.
