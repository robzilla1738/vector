# Mini Popup callback ownership

Pinned native610. The supplied popup focus/option handoff remains the behavior authority (native-mini-popup-position-focus and popup-picker-lifecycle source inventories). Aux uses a singleton manager across successive options windows, so its manager WeakPtr alone does not prove that a queued callback still belongs to the window that scheduled it.

Four existing zero-delay tasks now capture the popup generation and options generation. ShowFor/Hide already advance the popup generation; options replacement and actual close advance a distinct options generation. Callbacks for an older popup/options pair cannot close, deactivate or focus its successor. DestroyWindows still invalidates every WeakPtr. Scheduling, active/picker predicates, dimensions, CSS, animation and shortcut defaults are unchanged. This is native ownership integration, not a new popup UI.

Validation: exact single-file baseline/output hashes, all replacement counts asserted, isolated patch replay, followed by integration compilation. Actual physical global shortcut delivery remains a separate observation; this patch does not claim to repair an unproven registration failure.
