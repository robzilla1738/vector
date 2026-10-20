# Source sidebar section/divider and live-pinned presentation

Three-file source-only proposal: new `aux_sidebar_presentation.{h,cc}` plus one genuine saved-entry read accessor. Shared Chromium remains untouched. Pure replay, eight original function ranges, color expression/name, geometry and Flex constants pass. Native compilation/mount/behavior acceptance remain pending. Register the new two files in the existing enabled-Mac UI list; order after the separate genuine PinnedTabContainerView port providing `SetShowEmptyPlaceholder(bool)`.

## Real region/body integration

`aux::AuxSectionDivider` is original region6d0, metadata AsideSectionDivider at4667274/e726ab0. Constructor37e19ac supplies preferred size **(0,1)**, disables event processing and starts hidden. Paint4667374 fills a full-width **0.5px** rectangle centered at `(height−0.5)/2`; source defaults are fill/SrcOver (flags0x300), with no invented stroke or antialias override. Role229 is actual `kColorAsideBaseBorder`: dark0x1afafafa/light0x1a0a0a0a. Metadata entrye9101e0, actual private mixer35e7984..99c and literals are pinned independently.

Call `CalculateSidebarSectionPresentation(admission,actualRegionWidth,actualAgentInstalled,actualBookmarkPref,actualInnerHasContents)` from the real region/body layout. It returns:

- compact = inverse of actual151px geometry admission; **not** `VisuallyCollapsed()`.
- content_visible = actual collapse animation active OR original initial expansion OR admitted geometry.
- chats_visible = content_visible AND actual Agent installed.
- bookmarks_visible = content_visible AND registered original bookmarks-section-enabled pref.
- divider_visible = bookmarks_visible AND actual inner Bookmarks has-contents (+6f0).

The genuine Tabs section, New Tab child and normal TabStrip share content_visible. The Agent leaf receives `SetExternalVisibility(content_visible)` and preserves its separate actual-children visibility. Bookmarks receives actual compact state. These are source464a8c0/464aff0..b13c effects, not invented empty-model visibility tests. Body/header placement stays root-owned. Outer5b0 margins are zero in actual ApplyLayout464afd0..fec; do not retain the independent wrapper's horizontal8px margins on top of real inner/header insets.

## 4645400 operates the genuine live-pinned container

This function is not a generic body visibility updater: it resolves actual TabStripView+338, the native PinnedTabContainerView. `CalculateAuxPinnedPresentation` computes its original flags from actual child count, real TabStripModel pinned tabs, actual saved leaf `HasSavedEntries`/`RepresentsTab`, exact admission geometry and the actual source839 drag-placeholder latch. It never infers ownership or closes a tab. A missing/empty saved leaf starts unmatched=true; otherwise any genuinely pinned tab not represented by saved entries makes it true. With admitted geometry, visible = (physical child count nonzero AND unmatched) OR source839; empty-placeholder = physical child count zero AND source839. Non-admitted geometry makes both false.

`ApplyAuxPinnedPresentation` forwards the source mode to the real `SetShowEmptyPlaceholder`, native SetVisible, exact preferred/preferred/default-cross Flex rules5/0/5 (order1,weight1,stretch3), and actual visible TLBR(4,8,8,8), otherwise zero. The independent native branch that hides all vertical pinned children is separately being replaced by the genuine layout owner; merely running this helper does not restore missing native pinned geometry.

Root's public `RefreshAuxPinnedPresentation()` should resolve its actual native container, call Calculate/Apply with its genuine admission/model/saved leaf and owned `aux_empty_pinned_drop_active_` source state. That state starts false as in original constructor. Its real source producer is GetTabDragTarget465a3c0..ab: actual attached live tab drag/no originally pinned rows/no group-header/valid current tab lookup, then true only within original empty-pinned target geometry (464d3f0). It clears on native drag exit/cleanup/invalid owner. **Exact remaining Tab+90 guard→155 identity is still under recovery; active producer wiring and runtime drag acceptance remain pending.** Do not pass a fabricated callback or claim drag completeness. The literal false initial latch is source state, not a mock capability.

## Projection scheduling and lifecycle

Original conversion-completed462c188 rejects while sourcef90 publishing, coalesces1199, then posts a weak actual UI callback464d6e0 that invokes462c2c0. Call the real mounted `AuxSidebarProjection::QueueRefresh()` and real `RefreshAuxPinnedPresentation()` on conversion completion; no synthetic cache or immediate successful action callback is needed. Source layout and native ownership remain real. Source current bookmark/Chats/cache/projection callbacks are separately delivered and compiled; this module adds no replacement owner/model.

`verify.py` only replays filesystem patches and verifies original static inputs. No native build, app execution, owner data, network, OS grant or signing was performed.
