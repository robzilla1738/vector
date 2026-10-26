# Split menu construction before the first tab

The signed diagnostic candidate passed startup authorization, then exited 139. The integrator's symbolized stack points to `SplitTabMenuModel::GetSplitTabId` from its constructor, through `SplitTabsToolbarButton`, `ToolbarView::Init`, and browser-window creation. The N-pane change added an unconditional split lookup in that constructor. The toolbar still constructed its persistent menu before its tab strip had any active tab, so `GetSplitTabId` dereferenced null.

A constructor null guard alone would leave a second bug: the toolbar would retain its initially non-pair menu forever, omitting pair actions after real tabs appeared and failing to reflect later two/three/four-pane changes. This two-file, four-anchor correction preserves both lifetimes:

- Construct the toolbar split menu only in the existing active-split branch when opening it, after destroying the old runner/adapter. Rebuild on each open using the current split; keep the existing menu cancellation on active-tab/split changes.
- Permit an empty/non-split tab strip or unavailable explicit index when constructing the reusable menu model. Pair-only entries require actual pair data. Disable all split commands when that target disappears, including the execution guard that already calls `IsCommandIdEnabled`.

No layout, labels, artwork, split topology, command IDs, pair action semantics, mini-toolbar close behavior or lifetime owner changes. No startup deadline/authority proposal is applied: actual authorization succeeded, so that earlier conditional proposal remains inactive.

`source-plan.json` pins the current native preimages and counted overlays. `prepare.py` replays frozen baselines only. No native source projection, build, signing or app/state operation occurred in this lane. The reviewed interfaces declare `ContainsIndex`, `IsSplit` and `GetSplit` const-compatible. Counted source replay passed; this is not a runtime result.

Integrator validation: compile affected menu/toolbar objects under the existing lock, link the coherent candidate, and repeat normal launch. During the finite split journey open the toolbar menu on a two-pane split, then after adding a third/fourth pane, and after reducing to two. Confirm pair-only entries follow actual pane count, exit split works, and closing/switching the target cancels its menu. No unrelated acceptance journeys need repeating for this change.
