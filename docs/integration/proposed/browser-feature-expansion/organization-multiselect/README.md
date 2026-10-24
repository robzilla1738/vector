# Native multiselection from logical organization rows

Apply `native-multiselect.patch` after recovery `6a41685ad` and row polish `15318552e`. Three existing files change: organization controller header/implementation and Tree implementation. No registration or storage/schema change is required.

Cmd-click toggles selection, Shift-click extends from the native selection anchor, and Cmd+Shift-click adds the range. The native anchor is mapped back to the displayed logical row order; ranges therefore behave correctly even when native insertion order differs from folder/Space/sidebar order. Only exact already-open current-window native indices are selected. There is no URL matching, auto-opening, renderer creation, cross-window activation, or logical tab reordering.

Ranges exclude unloaded or hidden rows, other Spaces, pins, folders, archived recovery views, split panes and actual bookmark/runtime-owned tabs. An invalid/hidden native anchor becomes the clicked target, matching native no-anchor behavior. Ambiguous duplicated logical identities are refused rather than guessed. The resulting native selection always retains an active selected tab. Folder/recovery and ordinary single-click behavior remain unchanged.

Native `TabStripModel::IsTabSelected` is the source of truth. Selected ordinary rows reuse existing theme-aware selected fill/text styling; only the active row gets its existing active shadow and selection motion. Modifier presses do not fall through to ordinary activation on release or start an organization drag. The existing native model observer refreshes row indication after external selection changes.

The productivity lane confirmed selected-Tidy reads exact current-window native indices with `IsTabSelected`, maps those native IDs through `SnapshotViews`, and retains its profile/Space/revision/selection fences. No new shared selected-ID store or API bridge is introduced.

## Verification

Inspected actual selected APIs: `TabStripModel::delegate`, `IsTabSelected`, `SetSelectionFromModel`, `TabStripModelSelectionState::anchor_tab`, and `ui::ListSelectionModel`. The native setter expands selected split panes, so this adapter deliberately excludes split entries from the candidate set. Patch whitespace-error checking and exact byte replay passed for all three files.

No additional build, runtime test, launch/restart, owner access, provider call or signing occurred. Root should compile the two implementation translation units and check Cmd toggle, Shift range across reordered/nested visible rows, Cmd+Shift add, unloaded-row refusal and selected-Tidy handoff in the disposable app. Those checks remain unrun, not claimed complete.
