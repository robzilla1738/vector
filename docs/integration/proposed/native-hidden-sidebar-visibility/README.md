# Hide the empty sidebar subtree

Integrated v520 observation found a second Expand control below the toolbar even though web content correctly occupies the former rail. AX likewise retained the sidebar's Expand descendant. The computed zero-width rectangle was correct, but `ProposedLayout` still marked the region visible unconditionally for vertical mode. Zero-width bounds do not themselves hide overflowing descendant layers or accessibility nodes.

This one-file typed integration correction marks the region visible only when vertical mode has nonempty computed bounds. This implements the owner-supplied fully hidden collapsed presentation established by the original/reference comparison; it is not described as a newly decoded original visibility instruction.

The view is neither removed nor destroyed. The existing native `EventMonitor::CreateWindowMonitor` remains attached to its Widget, and its edge predicate does not require region visibility. The main layout branch uses `IsParentedTo`, not `GetVisible`, so retained entry continues to calculate nonempty bounds and restores visibility. Toolbar-chip retention also continues through the actual mounted owner. Ordinary expanded/retained states are unchanged.

Exact actual v520 preimage/output hashes are pinned in files.json; temporary patch replay passed. Native checkout/build/launch untouched. Integrator should verify collapsed AX omission, toolbar Expand click and actual edge reveal/retraction.
