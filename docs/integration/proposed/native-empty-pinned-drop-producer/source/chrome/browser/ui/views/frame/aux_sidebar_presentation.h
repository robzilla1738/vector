// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SIDEBAR_PRESENTATION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SIDEBAR_PRESENTATION_H_
#include "ui/base/metadata/metadata_header_macros.h"
#include "ui/views/view.h"
class PinnedTabContainerView;
class TabStripModel;
class TabDragContext;
namespace views { class ScrollView; }
class VerticalPinnedTabEntriesView;
namespace aux {
class ProfilePreviewAdmission;
// Original region6d0: a noninteractive, initially hidden 1px preferred-height
// View. Its actual parent supplies width and the source visibility condition.
class AuxSectionDivider final : public views::View {
  METADATA_HEADER(AuxSectionDivider, views::View)
 public:
  AuxSectionDivider();
  ~AuxSectionDivider() override;
  void OnPaint(gfx::Canvas*) override;
  void OnThemeChanged() override;
};
struct SidebarSectionPresentation {
  bool compact;
  bool content_visible;
  bool chats_visible;
  bool bookmarks_visible;
  bool divider_visible;
};
// Original464a8c0. Agent-installed/pref/contents operands must come from the
// real owners. Compact geometry is NOT the separate VisuallyCollapsed state.
SidebarSectionPresentation CalculateSidebarSectionPresentation(
    const ProfilePreviewAdmission&, int actual_region_width,
    bool agent_installed, bool bookmarks_enabled, bool bookmark_has_contents);
struct PinnedPresentation {
  bool visible;
  bool show_empty_placeholder;
};
// Original4645400. source839 is the actual region drag-placeholder latch, not
// an account/URL/width-derived approximation. Saved entries are optional exactly
// as in the original source; the physical native container is required.
PinnedPresentation CalculateAuxPinnedPresentation(const TabStripModel&,
    const PinnedTabContainerView&, const VerticalPinnedTabEntriesView*,
    const ProfilePreviewAdmission&, int actual_region_width, bool source839);
void ApplyAuxPinnedPresentation(PinnedTabContainerView&, PinnedPresentation);
// Original464d3f0 real screen rectangle; no capture or inferred profile state.
gfx::Rect GetAuxEmptyPinnedDropBounds(const views::View& region, const views::ScrollView*,
                                     const PinnedTabContainerView&);
// Original465a3c0's +839 producer. Call from the real region's drag-target
// query with its actual GetDragContext(), after the source publication guard
// and saved-entry target branch. Clear the owned latch on drag exit/retire.
bool CalculateAuxEmptyPinnedDropActive(TabDragContext*,
    const PinnedTabContainerView&, const views::View& region, const views::ScrollView*,
    const gfx::Point& point_in_screen);
}  // namespace aux
#endif
