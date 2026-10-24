# Native recursive split proposal

Source-only successor. Preserves the supplied two-pane path when `pane_tree` is absent. Eight genuine native panes maximum, mixed horizontal/vertical branches, stable slot identities and explicit collection-order mapping. Root owns shared registration and model/browser/session hooks. No WebContents recreation or URL-based identity.

Implemented in this slice: validated recursive component model, mixed layout/minimum sizing, branch resize/removal, versioned optional session payload. Invalid extensions refuse restoration rather than reinterpret existing state. Existing two-pane serialization remains byte-identical.

Verification: standalone tree source strict C++20 syntax passed; focused gtest source supplied but not executed. Native Views/model/drag integration and actual compile/runtime verification remain pending. This is not a finished user-facing split feature.

Native Views source now includes recursive layout over actual ContentsContainerView objects, dynamic divider handles and nested branch resize, N-pane focus/overlay handling, and native split tab rows. Two-pane layout calculations remain on the original branch. It requires root's `TabStripModel::UpdateSplitPaneTree(id, tree, intermediate)` and `BrowserView::PrepareSplitView` call before filling all slots. Source has not yet been compiled against the selected native build.

Shared integration still required before enabling N-pane commands: native tab admission with exact leaf-count validation; slot mapping update for reorder/removal; preserving remaining branches when a pane closes; metadata-first session restore; all-visible native contents/focus/profile-transfer iteration; actual drag/command entry points. The supplied binary split move helper rotates the first tab, so it must not be used for arbitrary N-pane reordering.
