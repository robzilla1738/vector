# Retained Collapse chip: exact layout insets and margins

This corrects the original port's setter identification. It preserves the source-positive icon-only action-interface correction and subsequent Chromium155 UTF16 API adaptation in actual408. That earlier correction alone did not resolve the observed two-dot rendering; visible-label clipping was a hypothesis, not a confirmed cause.

At41f8f54–41f8f6c the original chip passes four8px inset values **plus an engaged byte** to214c0f0. The complete setter214c0f0–214c174 compares and stores the optional Insets at chip+678, with its presence byte+688, then invokes the chip's UpdateColorsAndInsets virtual. The chip renderer2394f60 reads exactly those optional fields when choosing target insets. This is `ToolbarButton::SetLayoutInsets`, not `SetInternalPadding`.

At41f8f28–41f8f44 the constructor separately sets propertyea05488 to TLBR(0,2,0,2). The actual adjacent property-name entryea05490 resolves to `kMarginsKey`. The distinct internal-padding property isea054a8, named `kInternalPaddingKey` at ea054b0; those descriptors are pinned directly. Thus the2px horizontal values are external layout margins, not extra internal icon padding.

The current Chromium155 ToolbarButton computes target insets as optional LayoutInsets (or default ToolbarButton insets) + layout delta + internal padding. Its constructor initializes internal padding to zero, and its non-touch default toolbar insets are7px. The original port incorrectly added8px internal padding, yielding15px per side inside the fixed32px chip: only2px remained for its16px icon. Replacing that call with the actual optional8px layout insets leaves16px for the icon. This is a direct renderer translation correction, not a new size, glyph, theme or offset.

The proposal changes one chip CC: exact `SetLayoutInsets(Insets(8))`, actual external Margins property, and the explicit property-header include. No global ToolbarButton renderer changes or fallback glyphs. Actual action/accessibility/tooltip, mouse retention, 32×32 limits and16px current action icon remain intact.

Run `python3 verify.py`: original whole-image/range/property pins, two count-one anchors and temporary-directory patch replay. Native compilation and disposable visual confirmation are pending integrator verification. No shared native files, running applications, owner profiles, OS grants or signing were touched.
