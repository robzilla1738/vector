# Genuine outer Bookmarks section

`aux::AuxBookmarksSection` ports the actual region668 wrapper around the compiled inner460f608 Bookmarks owner6a0. It reuses the genuine AuxSectionView/AuxSectionClipView, adds no alternative rows/backend and changes no shared region or GN source.

Source37e11c4..37e12cc creates the Bookmarks disclosure section with original outer TLBR(4,0,8,0); source37e1438 overwrites the contents top margin to3 and gives the clip zero margins. The header has no secondary/context callback or accessory. Bound462c0a8 is the **bool expansion persistence callback** stored atouter3d0, not a right-click handler. This wrapper therefore introduces no Bookmarks header menu.

The two source preferences are `aside.vertical_tabs.bookmarks_section_enabled` and `aside.vertical_tabs.bookmarks_section_expanded`, both booleantrue/flags0. Original034e3f1c.c and raw native registration bytes are pinned. The root-owned real registration path must register them once; this class exposes their exact constants and CHECKs their presence. The inner owner's separate empty-list folder-ID registration remains unchanged.

The actual180ms/reduced-motion-zero SlideAnimation is reversible, using the supplied default EASE_OUT behavior. On toggle, it measures and freezes the genuine child's full natural height, preserves the current preferred clip height, makes the clip visible and starts Show/Hide. It persists the actual expanded pref; the original4659c84 same-state observer guard prevents that write from canceling its own animation. External changed preferences instead call the source nonanimated46598b0 application. Actual AnimationDelegate slots resolve Ended/Canceled→4664c00 and Progressed→4664c68; progress updates rounded preferred clip height, while Ended/Canceled clear the frozen child-height override after applying the final frame. Completed expansion removes the preferred-height override entirely, so subsequent real folder/model updates determine natural size. Completed collapse stays hidden at zero; a zero-height in-progress transition remains visible, matching4664ddc.

## Integration

Add the two new h/cc outputs to the actual macOS Aux UI target (root owns GN). Construct `AuxBookmarksSection(realPrefs, unique_ptr<VerticalTabBookmarksView>, Actions)` with the genuine inner owner and real callbacks:

- `Actions::enabled_changed(bool)` is the source region's enabled-state cleanup seam (4659ab8 includes real disabled-state popup retirement). Bind the actual owner; do not substitute a generic menu or no-op.
- `Actions::layout_changed()` binds the source ApplyLayout/PreferredSizeChanged effects for current actual region state. The region still owns collapsed/presentation visibility and original parent flex policy.

`bookmarks_view()` returns the exact owned inner view for its cache, selection, hover, pending navigation and drag callbacks. Both callbacks are required, and the class itself reads/writes the real registered PrefService—there is no UI-only persisted state or synthetic success.

Call `RetireForProfileChange()` at the actual region's profile-transfer retirement boundary. It cancels observation/animation and retires the actual inner owner. Recreate the wrapper/inner pair with genuine target prefs/model after transfer; normal compact/hide/reopen does not invoke retirement. Root must avoid duplicating the same pref dispatch through both old and new body owners when replacing the independent body.

## Validation and limits

The proposal pins eight bounded original raw/LLVM ranges, true pref keys/default source, contents inset bytes, exact animation vtable slots and inspected155/shared-component API snapshots. `verify.py` verifies all those pins plus exact two-file disposable patch replay. It executes no native UI, preferences, dialogs, haptics, profile access, signing or builds. The actual inner owner is separately delivered and compile-corrected by root326–328. Remaining acceptance is root GN, genuine body/region assembly with actual callbacks/flex/collapsed policy, focused compile and disposable observation; this source proposal does not claim a mounted product or visual acceptance.
