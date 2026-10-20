# Hidden collapsed sidebar and retained overlay geometry

Current typed155 integration leaves Chromium's permanent collapsed rail: region minimum/preferred size has a `kCollapsedWidth` floor and the horizontal allocator reserves it. The recovered admission owner and native edge monitor already exist, but retained visual width was also being used as reserved content width. Consequently content shifts, an extra Expand control remains visible in the rail, and retained content is not an inset overlay.

This proposal separates reserved width from visual overlay width. The region preferred width is its existing SlideAnimation value multiplied by target uncollapsed width, reaching zero when collapsed. Retained hover is laid out at the original max(280,persisted width) without allocating that width to content. The same genuine region remains mounted, so its existing window-only edge monitor and toolbar-chip request continue to acquire/release the same admission owner. No new hover detector, timer, fake profile or substitute controls are introduced.

## Original source and exact rectangle

Framework SHA-256 `64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c`. Full range listings are included and hashed in `source-evidence.json`.

- Existing recovered admission source uses `slide_value * target_width`, with floor(show)/ceil(hide), in its151px admission boundary. The current typed preferred-size floor was not part of that supplied calculation. Owner screenshots independently establish completely absent collapsed rail; this adaptation removes the conflicting typed rail floor.
- `45e92b8` reads actual retained+a0c; `45e92f4..45e930c` replaces visual width with max(280,persisted+94). It does not replace the horizontal reserved-width field read separately at `45e946c..45e948c`.
- `45e9368..45e9438` is the missing retained rectangle writer. It clamps hover progress; computes `round((visual_width+8)*(1-progress))`; places x at `normal_x+8-that_offset`; adds8 to normal y; subtracts16 from the height. Width remains the actual retained visual width. These values come directly from instructions, not screenshot measurements.
- `45e8860..45e88a0` clears **internal top-container allowances** when retained. It does not clear the frame's collapsed top coordinate. The earlier admission/frame bridge confused these and set top0. This proposal restores toolbar-relative collapsed positioning before applying the original8px overlay inset.
- `45eb4c4..45eb5b0` establishes four rounded retained corners, using native window-corner information with OS-dependent fallback8/16. The typed adapter uses the existing native window corner and existing renderer fallback radius; it does not claim to have ported the original OS-version fallback selector verbatim.
- Existing `native-profile-preview-retention-producers` pins actual native left/right8px edge predicate, activity/controller/lock guards, window-only mouse monitor, toolbar union pointer-retention predicate, and lifetime teardown. Those existing owners are unchanged and operate even with a zero-width region.

## Changed boundaries

Two native files only: `vertical_tab_strip_region_view.cc` and `frame/layout/browser_view_tabbed_layout_impl.cc`. Zero-width state no longer draws outside corner decorations. Retained overlay gets four rounded corners and an outline on its exposed leading edge; its visual width no longer shifts the side-panel geometry boundary. Regular expanded state, controls, model ownership, account/profile isolation and resize persistence remain on the existing owners.

`files.json` pins actual v516 preimages and outputs. Both diffs apply to exact preimages and reproduce their output hashes in temporary directories. No shared native edits, build, launch, profile access, signing or release occurred in this lane.

## Explicit remaining acceptance

The actual current admission interface exposes hover state as a boolean, so this correction establishes source-backed geometry endpoints/lifecycle without claiming original smooth hover animation timing. The existing collapse SlideAnimation still drives width continuously. Native compile, collapsed/edge-hover/leave/disclosure-click observation and any remaining hover-animation recovery are integrator work. This proposal alone is not a claim of complete visual or behavior parity.
