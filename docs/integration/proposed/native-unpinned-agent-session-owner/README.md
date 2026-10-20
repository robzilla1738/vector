# Genuine Unpinned container Agent child

Source-only followup to the actual applied Unpinned files. No shared native files changed, build, runtime calls, owner state or signing. Pure three-file replay/source pins passed. Native compilation and mounted UI acceptance remain pending.

Original `4134400` checks that a nonnull child already belongs to the container, stores the special child at +570 and invalidates layout. The proposed `SetAgentSessionTabsView(View*)` preserves that effect; null clears it. Root must reparent the genuine `AuxAgentSessionTabsView` into the real unpinned container before setting it, then call its real `Refresh()`. Clear the association before removing/reparenting that child. The destructor clears its raw association before View destroys its children. No physical collection node/group is fabricated.

Original `4135080` inserts +570 at the **front** of the real collection-child vector. It starts y=1, advances visible children by height+4, and returns nonempty final cursor+4 (empty returns zero). The actual child preferred size, horizontal padding, drag offsets, focused-group visibility and drag bounds remain native. `4135580` counts the special child only when genuinely visible and outside focused-group mode; minimum height is ceil(rowHeight*min(1.5,count)) + (count>1?4:0) + (count>0?1:0). Horizontal layout remains unchanged.

Original `4134620` returns true for +570 or real SplitTabView (metadata `78a04fc`, literal `da9b9a7`). This maps to the actual `ShouldSnapToTarget` delegate. The special view does not enter ordinary tab-group drag routing; existing real group/model operations remain native.

Original `3161a40` is a grandparent ScrollView metadata oracle, matching actual155 `GetScrollViewForContents`. Original `41290b4..c4` / `41290d4..e4` wrap it in an ancestor walk. The proposal uses that real walk for the unpinned drag/layout lookup, so the external body scroll remains discoverable after the original reparenting. It does not store or assume an unrelated ScrollView.

The source callback runner `4134510` is separately retained in root's mounting evidence; this patch does not invent a new callback producer. Root owns original TabStripView external-scroll and parent APIs/GN; no overlap here. `profile_transaction` supplies the actual Agent child; ordinary-tab projection and region mounting remain separately integrated prerequisites.

`layout-analysis-snapshot.json` retains the bounded raw ARM64 Ghidra observation (static only). LLVM ranges and original full thin-image SHA remain authority; pseudocode is not original source. The snapshot's temporary analysis path is historical and not an installation dependency.

Run `python3 verify.py` for disposable filesystem replay and pinned source verification. This is not native compilation or UI acceptance.
