# Original pager drag/order owner

This source-only proposal ports the genuine pager drag lifecycle from 4652488, 4652600, 4652918, 465669c and the actual animation delegate callbacks. It operates on the real pager's bound profile-path vector and actual button children; there is no second identity registry, URL inference or profile selection action in this controller.

A drag begins with a frozen copy of the original path order and canonical centered 24×24 slots. The current parent-space point minus the original local grab point produces the proposed left edge. The nearest slot center wins, with the earlier slot winning ties. Vertical movement clamps to ±6px. Reordering moves the real path and button together, calls actual `ReorderChildView`, and preserves prior transformed positions so non-dragged siblings animate into place. The dragged button uses the actual supplied 0.94 opacity and its source hover paint.

Capture loss restores the original slot before settling and does not write preferences. A released changed order writes only the actual `aside.vertical_tabs.profile_order` local-state preference, using the existing source-ported `HorizontalProfileOrder`. The full registered roster is read again; omitted profiles keep their slots while visible slots receive the new order. No arbitrary path is introduced, no profile is loaded, and no cloud/account state changes.

Both source animations are 100ms `SlideAnimation` with EASE_OUT. This duration is explicitly set because 155 now defaults to 120ms. Original integer interpolation calls nextafter towards zero; 155's actual `gfx::Tween::IntValueBetween` has the same implementation and is reused directly. Pager input is disabled while the dragged button settles, then enabled after the exact transform/order snapshot cleanup. Pending refresh is coalesced through the real owner's callback.

## Integration

Register the two NEW paths in `manifest.json`. The completed pager owner owns `ProfilePagerDrag`, passes its **same** real path/button vectors, binds leaf drag callbacks to Start/Update/End and checks `DeferUpdate()` before rebuilding roster children. Destroy the controller before those child Views. Its Refresh callback must call the genuine owner refresh, retaining actual profile-transfer/retirement guards; do not bind a placeholder. Actual owner retirement calls Retire without committing an order.

This is a complete drag controller prerequisite, not the entire pager/header mount. Current UI remains intact. Roster/tooltips/accessible shortcuts, original menu/context lock, preview selection and parent header geometry are still a separate owner/mount proposal. No declaration of visible parity or runtime acceptance follows from this static port.

`python3 verify.py` checks the pinned original instruction ranges, the REA reorder result with its bounded-target limitations, actual float opacity, 155 APIs/interpolation and disposable patch replay. Original assembly outranks bounded pseudocode where external function signatures were omitted. No target/app execution, native build, shared source modification, signing or OS action occurred.
