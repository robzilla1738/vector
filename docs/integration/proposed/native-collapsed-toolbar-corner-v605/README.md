# Collapsed toolbar interior-corner correction

One file/one exact anchor, pinned to605 composition output. No shared native mutation, build or UI operation.

User screenshot `Screenshot 2026-10-21 at 4.01.53 PM.png` (actual filename contains narrow space before PM) shows a gray rounded wedge at x214 physical pixels immediately after the Mac caption controls. It is an interior header edge, not the outer window edge.

`DoPostLayoutVisualAdjustments` unconditionally overrides the toolbar's upper-leading corner with `GetWindowCorner(true)` for every Aux vertical surface. In zero-rail collapse, caption-button exclusion offsets the toolbar to the interior of the continuous header, so this paints an unwanted corner at that position. Floating sidebar corner views already require nonempty sidebar bounds; the unconditional toolbar override remains even with no reserved sidebar width.

Use the same native radius when the horizontal layout reserves positive sidebar width; use the existing square Corner default at zero width. Hover-revealed floating panels also reserve zero width and round their own independent surface. This changes neither the outer top-container/window corners nor the sidebar/chat radii, material, colors, blur, offsets or hit targets. Expanded/docked behavior retains the existing radius; fullscreen remains on its existing path.

Validation: native605 output hash matches; one anchor verified; `git apply --check` passes. Integrator should observe collapsed toolbar and hover reveal, then expanded sidebar once in the combined successor. No runtime result claimed by this static proposal.
