// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_sidebar_presentation.h"
#include "chrome/browser/themes/aux_theme_editor.h"
#include "cc/paint/paint_flags.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/layout_constants.h"
#include "chrome/browser/ui/views/tabs/dragging/tab_drag_context.h"
#include "chrome/browser/ui/views/tabs/dragging/tab_drag_controller.h"
#include "ui/views/controls/scroll_view.h"
#include "chrome/browser/ui/views/frame/aux_profile_preview_admission.h"
#include "chrome/browser/ui/views/tabs/common/pinned_tab_container_view.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_pinned_tab_entries_view.h"
#include "components/tabs/public/tab_interface.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/color/color_provider_key.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/geometry/insets.h"
#include "ui/gfx/geometry/rect_f.h"
#include "ui/views/layout/flex_layout_types.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/widget/widget.h"
namespace aux {
AuxSectionDivider::AuxSectionDivider() {
  SetPreferredSize(gfx::Size(0, 1));
  SetCanProcessEventsWithinSubtree(false);
  SetVisible(false);
}
AuxSectionDivider::~AuxSectionDivider() = default;
void AuxSectionDivider::OnPaint(gfx::Canvas* canvas) {
  // Original4667374 uses default fill/SrcOver flags (0x300), no added stroke
  // or antialias setting. Role229 is kColorAsideBaseBorder, recovered directly
  // from the original private mixer, not a CSS/color-theme approximation.
  const bool dark = GetWidget()->GetColorMode() == ui::ColorProviderKey::ColorMode::kDark;
  cc::PaintFlags flags;
  flags.setColor(aux_theme::SidebarForeground(GetWidget()->GetColorProviderKey(),
      GetColorProvider(), dark ? 0x1afafafa : 0x1a0a0a0a));
  canvas->DrawRect(gfx::RectF(0, (height() - 0.5f) * 0.5f, width(), 0.5f), flags);
}
void AuxSectionDivider::OnThemeChanged() {
  views::View::OnThemeChanged();
  SchedulePaint();
}
SidebarSectionPresentation CalculateSidebarSectionPresentation(
    const ProfilePreviewAdmission& admission, int width, bool agent_installed,
    bool bookmarks_enabled, bool bookmark_has_contents) {
  const bool compact = !admission.AdmitsProfilePreview(width);
  const bool content = admission.collapse_animating() ||
      admission.expanding_from_collapsed() || !compact;
  return {compact, content, content && agent_installed,
          content && bookmarks_enabled,
          content && bookmarks_enabled && bookmark_has_contents};
}
PinnedPresentation CalculateAuxPinnedPresentation(const TabStripModel& model,
    const PinnedTabContainerView& pinned, const VerticalPinnedTabEntriesView* saved,
    const ProfilePreviewAdmission& admission, int width, bool source839) {
  if (!admission.AdmitsProfilePreview(width)) return {false, false};
  bool unmatched = !saved || !saved->HasSavedEntries();
  for (int i = 0; i < model.count(); ++i) {
    const auto* tab = model.GetTabAtIndex(i);
    if (tab && tab->IsPinned() && (!saved || !saved->RepresentsTab(*tab)))
      unmatched = true;
  }
  const bool empty = pinned.children().empty();
  return {(!empty && unmatched) || source839, empty && source839};
}
void ApplyAuxPinnedPresentation(PinnedTabContainerView& pinned,
                               PinnedPresentation state) {
  pinned.SetShowEmptyPlaceholder(state.show_empty_placeholder);
  pinned.SetVisible(state.visible);
  // Original46455d0..644 binds preferred/preferred/default-cross rules5/0/5,
  // order1, weight1 and stretch3; margins are the actual df47a50 TLBR constant.
  pinned.SetProperty(views::kFlexBehaviorKey,
      views::FlexSpecification(views::MinimumFlexSizeRule::kPreferred)
          .WithOrder(1).WithWeight(1).WithAlignment(views::LayoutAlignment::kStretch));
  pinned.SetProperty(views::kMarginsKey,
      state.visible ? gfx::Insets::TLBR(4, 8, 8, 8) : gfx::Insets());
}
gfx::Rect GetAuxEmptyPinnedDropBounds(const views::View& region, const views::ScrollView* outer,
                                     const PinnedTabContainerView& pinned) {
  if (!outer) return {};
  const auto bounds = region.GetBoundsInScreen();
  const auto body = outer->GetBoundsInScreen();
  int y = body.y();
  if (pinned.GetVisible() && pinned.width() && pinned.height())
    y = pinned.GetBoundsInScreen().y() - 4;
  return gfx::Rect(bounds.x(), y, bounds.width(),
      /* original selector58=40; Chromium155 counterpart is32 */ 40 + 12);
}
bool CalculateAuxEmptyPinnedDropActive(TabDragContext* context,
    const PinnedTabContainerView& pinned, const views::View& region, const views::ScrollView* outer,
    const gfx::Point& point) {
  if (!context || !outer || !pinned.children().empty()) return false;
  const auto* drag = context->GetDragController();
  if (!drag || !drag->active() || drag->attached_context() != context) return false;
  const auto& data = drag->GetSessionData();
  if (data.tab_drag_data_.empty() || data.group_header_id()) return false;
  auto* model = context->GetTabStripModel();
  if (!model) return false;
  bool found_contents = false;
  for (const auto& entry : data.tab_drag_data_) {
    if (entry.pinned) return false;
    if (!entry.contents) continue;
    const int index = model->GetIndexOfWebContents(entry.contents);
    if (index == TabStripModel::kNoTab) return false;
    const auto* tab = model->GetTabAtIndex(index);
    // Original Tab+90 is the engaged byte of its group optional at+80,
    // positively cross-checked against source4646654 group-ID decoding.
    if (!tab || tab->GetGroup()) return false;
    found_contents = true;
  }
  return found_contents && GetAuxEmptyPinnedDropBounds(region, outer, pinned).Contains(point);
}
BEGIN_METADATA(AuxSectionDivider)
END_METADATA
}  // namespace aux
