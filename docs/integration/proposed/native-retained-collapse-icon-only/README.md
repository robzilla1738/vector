# Retained Collapse chip: original icon-only action binding

This one-file proposal restores the supplied toolbar chip's action-text policy. It does not modify the genuine sidebar Collapse button. The existing 32×32 chip, 8px internal padding, 16px current action icon, theme, hover retention, tooltip, real action invocation and enablement remain in place.

The supplied constructor at41f8e28 installs primary vtable e606c30; its slot2e0 is41fbda4, which allocates the chip's action interface and installs e228a90. That interface's ActionItemChanged slot10 is41fd4c0. The chained pointers and complete bounded method listings are pinned in source-evidence.json. The original updater:

- calls ButtonAction's updater28539a0 (tooltip/base state, not LabelButton's visible-text updater);
- copies action+e8 tooltip to the chip with846944;
- copies action+d0 text to the chip's ViewAccessibility object+2c8 through116d8d8;
- reads the real vector ImageModel and writes the ToolbarButton vector-icon state at+6d8/+6e0/+6e8, matching its actual vector setter41f12bc.

There is no LabelButton visible-text copy in that updater. The source accessor also retains the original invocation interface274fc70 and its no-op OnViewChanged slot. This is an icon-only control whose action text remains accessible.

Chromium155's inherited ToolbarButtonActionViewInterface instead calls LabelButtonActionViewInterface, which copies action text into SetText before applying the image. In this fixed32px chip that can consume the icon's available space and elide the label. This proposal overrides only this chip's GetActionViewInterface and ActionItemChangedImpl: it uses the existing ButtonActionViewInterface update, original tooltip/accessibility policy and current SetVectorIcon. It does not hardcode a glyph, clear accessibility text or hide the control. Other ToolbarButton consumers retain their existing behavior.

Baseline is actual406. Run `python3 verify.py` for binary/data pins, count checks and temporary-directory patch replay. Source-only verification passed; native compilation and actual visual confirmation belong to the integrator and are not claimed here. The observed tiny toolbar mark motivates the investigation, but its final disappearance still requires that visual check. No shared native sources, owner data, running apps, OS grants or signing were touched.
