# Actual toolbar and native window retention producers

This proposal implements both original producers of the retained sidebar state. It adds the actual collapse/expand ToolbarChipButton-derived child and the real window-only native EventMonitor, with the original geometry, activity and ownership guards. No global application monitor, blanket toolbar handler, synthetic pointer or window/profile inference is added.

## Exact toolbar identity

The supplied ToolbarView's child+568 is created41f8e28 and bound to action302 at41f62b8. Its inherited metadata41f1464→41f1410 points to the exact toolbar_button.h/ToolbarChipButton strings. The collapse state controller41d9b98 reads actual persisted collapse state+90 and updates action302 using locale IDs11294/11295. The supplied pinned locale export spells these **Collapse Tabs**/**Expand Tabs**. This identifies the actual existing `kActionToggleCollapseVertical` action, rather than infer a button from its position.

The real chip is inserted before navigation controls, as in the original construction path. Current ActionViewController retains the actual action's enablement, title, tooltip, image and invocation, including the existing real keyboard accelerator. Final original dimensions are32×32, internal padding8 and icon16. The common intermediate20/6 values are explicitly overridden at41f8f48..6c; they are not the final result. The port reuses the existing ToolbarChipButton renderer, controller, shape, theme and mouse behavior. No replacement button UI is drawn.

Original41fbd60 calls the genuine ButtonController mouse-enter behavior, then BrowserView45abe40(true). Original7d89b78 preserves ToolbarButton's disabled/drag/pressed exit handling and forwards false. Only this exact chip receives the forwarding subclass. A weak actual BrowserWindowInterface resolves the current same-window BrowserView, so no old profile pointer is retained through a real profile switch. The real region/native mode decides the request; there is no unconditional expansion.

## Native monitor, geometry and lifetime

Original33f5918 creates the region EventObserver's monitor using2cde604. Original data at d6e50ec contains **6,4**, registering mouse-exit and mouse-move only; the generic callback also accepts dragged2 but that does not broaden registration. The port calls the actual public `EventMonitor::CreateWindowMonitor` on the same real top-level native window. It attaches only after a genuine admission delegate is installed, and detaches before the region leaves its Widget. Its last mouse position comes from the actual EventMonitor. RemovedFromWidget clears only the edge request directly, matching463f960.

The exact465034c edge predicate requires the genuine vertical mode/normal browser, actual collapsed controller, active Widget, no ForceCollapse lock and a real native window. Native window x/width are preserved; a visible nonempty real MultiContentsView supplies y/height. After half-open bounds containment, the left8px side is used in LTR and right8px in RTL. No URL/title/profile-name approximation is involved. The real `BrowserView::ShouldDrawVerticalTabStrip` is independently pinned against original28ad220 and the identical45abe40 native mode check.

Original465020c's retained pointer predicate unions the region screen bounds with the genuine ToolbarView area above it, then accepts the actual cursor in that union or the real edge predicate. BrowserView+5b0 is positively tied to the real ToolbarView by constructor36a615c→41f3b80 and store36a61a8. Original99d480 uses min origins/max ends, proving Rect::Union; an intersection would prematurely lose retention when entering the toolbar.

The original terminal f90 flag is set by4634dd8 and by4647cc0 only after checking the same source TabStripModel. The port retires the actual monitor before region destruction and on the actual observed model's destruction, using standard TabStripModelObserver ownership. Real ViewTracker and weak admission/browser ownership prevent stale callbacks. This is actual owner retirement, not a guessed focus/animation mode.

## Integration and limits

Nine outputs: four new retention/chip sources; actual232 ToolbarView header/source; exact04db region header/source; admission header after04db. L4 confirmed no concurrent region edits and will layer its header/pager on these exact outputs. The region creates/owns the real monitor when its actual admission is explicitly installed and forwards true Widget attach/detach and model teardown. No GN file is edited; parent must register the four new sources under enabled Mac Aux UI, with existing Views event-monitor/toolbar/tab-model dependencies.

**The full admission delegate installer remains uncalled.** Real collapse/layout/header geometry and temporary-width bindings must finish before installation. This patch therefore does not activate preview input or capture and does not claim runtime/UI parity. The leading action chip itself invokes the genuine existing collapse action. Original UI/gesture observation and native compilation are pending. Shared native source is untouched; no native app, owner profile, OS grant, Keychain, network or signing operation was used.

`verify.py` verifies original framework byte/extract hashes, the complete supplied locale hash/selected strings, original monitor type bytes, and independently replays all nine outputs in disposable filesystem state. This is source evidence and patch replay, not runtime acceptance.
