# Original empty pinned-drop producer

Source-only incremental proposal after `native-sidebar-section-presentation` (86860b087). The projection header baseline is the actual mounted header. No shared native source was modified, built or run.

`CalculateAuxEmptyPinnedDropActive(context, pinned, region, outer_scroll, screen_point)` ports original 465a708..465aaac's actual +839 producer. It admits only an active drag attached to the same real context, with nonempty data, no originally pinned entry/group-header, at least one WebContents, and every nonnull contents resolving to an ungrouped tab in the actual context model. Tab+90 is positively identified as the group optional's engaged byte by the independent 4646654 binder; it is not an invented eligibility field.

`GetAuxEmptyPinnedDropBounds(region, outer_scroll, pinned)` preserves original464d3f0: **region** screen x/width, **scroll body** screen y, or visible nonzero pinned-container screen top minus4; height is actual native pinned-height metric plus12. The same actual metric maps original selector58 (40px). Region and body coordinates must not be interchanged.

## Region integration

Root owns the region and its initialized-false `aux_empty_pinned_drop_active_` state. From actual `GetTabDragTarget`, preserve the projection publication early-return (`projection.is_publishing()`), the existing saved-entry branch priority, and then evaluate this helper with the actual native drag context, physical pinned container, region, outer scroll and screen point. Do not infer drag state from URLs or tab titles.

When the real latch changes, original465a69c..465a6d0 calls4645400 (region `RefreshAuxPinnedPresentation`), then invalidates layout and schedules paint on both actual body and region. Return the actual pinned drag target when either its ordinary screen rectangle or this active placeholder admits the point. Original465a778 and saved-entry branch465a5b8 clear the latch with the same effects; the real drag-exit/retirement path must also clear it. This proposal supplies the recovered predicate/bounds and real publication getter, not a substitute target or fake drop completion. Full drag routing remains the real region's responsibility.

`verify.py` checks isolated three-file patch replay and original binary/assembly pins. No new GN sources are needed. Native compilation and actual drag behavior remain unverified.
