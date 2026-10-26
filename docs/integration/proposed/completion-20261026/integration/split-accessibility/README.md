# Stable split-pane accessibility and controls

The actual unchanged A38 Personal window has a confirmed two-pane labeling mismatch: the visible left page is window-two and the right page is palette-t, while the window accessibility label says palette-t is the left view. Native geometry already binds each collection member to a stable `pane_slots` entry; the accessibility and toolbar helpers instead used collection order. The attempted third-tab drag remains inconclusive. This source work is not evidence of a three-pane runtime crash or a completed three/four-pane gesture.

`source-plan.json` pins the exact 13 current Chromium files and supplies 36 counted replacements. `changes.patch` contains only those reviewable hunks. `prepare.py` verifies each baseline, applies the hunks to a fresh external source closure, checks exact reverse replay and confirms that the existing close-owner method is byte-identical. It supports a composed input root so the integrator can preserve independent reviewed source edits. It does not project files into Chromium, compile, build, operate the app or mutate a profile. Shared resource registration remains with the root integrator.

## Resulting behavior

`SplitPaneTree::VisualPaneSlots()` obtains leaf positions from the same tree `Layout` implementation used by `MultiContentsView`, then returns stable slots top-to-bottom and left-to-right. It does not reorder tabs or change geometry. The tab utility maps those slots back to the genuine collection members by `pane_slots`, exactly like the contents view. Collection reordering and branch swapping therefore cannot assign a different page's left/right or ordinal position.

A legacy two-pane split without a pane tree keeps its current labels, icons and controls. A two-pane tree uses its actual root axis and visual member order for Left/Right or Top/Bottom labels, toolbar location and directional close targets. The menu also derives its orientation from that actual root. After a larger tree collapses to two panes, `UpdateSplitLayout` no longer returns early solely because its old legacy field already equals the requested layout; the actual root axis must match too.

Three and four panes use the existing page title with a localized “View N of M” accessibility suffix. They do not enter the binary label function's NOTREACHED case. A new appended `kMultiple` state is paired through the native utility, native toolbar icon/label, menu icon fallback, toolbar Mojo enum, WebUI conversion, localized strings and TypeScript label consumer. The generic existing split icon is reused. Existing enum values and persisted menu command/metrics IDs remain unchanged.

For N panes, the global menu omits binary reverse/orientation/left-right/top-bottom close entries. Its execution delegate also rejects those commands if an older open menu outlives a change to N panes. Existing Separate views and mini-toolbar Close remain available. Close still passes the actual WebContents through the original `TabStripModel::CloseWebContents` owner with USER_GESTURE and CREATE_HISTORICAL_TAB; no direct deletion, before-unload bypass or replacement close policy is introduced. The model's existing RemoveSplit/RemoveSplitImpl already handles its complete tab collection. Branch-specific layout controls remain intact.

The existing BrowserView visual-change observer already recomputes accessible names on layout updates, so branch swaps use the new mapping rather than stale collection-index labels. The ordinary active-tab title source is retained; this patch does not rewrite page titles or URLs.

## Focused verification and root integration

The preparation check passed all 36 forward anchors and their exact reverse replay, pinned all 13 outputs, and proved the protected close owner remained byte-identical. `prepared.json` records the new private source directory. No worker native compilation was performed, as requested.

`visual-order-fixture.cc` exercises the actual new tree method on the actual existing tree implementation: the reported palette/window-two pair swap, vertical orientation, three panes with reordered collection bindings, a four-pane grid and branch swap, and a four-to-three-to-two collapse with the remaining root axis. It is ready for the root's final serialized native batch; it has not been run by this lane. A minimal root-side command is:

```sh
clang++ -std=c++20 -I "$prepared_split_source" \
  "$prepared_split_source/components/split_tabs/split_pane_tree.cc" \
  docs/integration/proposed/completion-20261026/integration/split-accessibility/visual-order-fixture.cc \
  -o "$disposable_fixture_path"
"$disposable_fixture_path"
```

Use the existing build lock for any native compiler work. The root should apply the two GRD resource hunks and regenerate paired Mojo/WebUI resources as part of the coherent final native build. No new GN source registration is required: the new method belongs to the already-built tree source.

After the coherent successor is built, actual acceptance still requires the same two-pane page/title/AX comparison and real three/four-pane creation, focus, labels, close/before-unload, collapse and Separate views. The prior third-tab drag does not prove or disprove those outcomes. This patch supplies the source join and focused fixture, not a relabeled live result.
