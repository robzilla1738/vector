// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_saved_entry_drop_target.h"
#include <algorithm>
#include "base/check.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_cross_section_drag_preview.h"
#include "chrome/browser/ui/views/frame/aux_profile_preview_admission.h"
#include "chrome/browser/ui/views/frame/aux_sidebar_presentation.h"
#include "chrome/browser/ui/views/frame/base_tab_strip_region_view.h"
#include "chrome/browser/ui/views/tabs/dragging/tab_drag_controller.h"
#include "chrome/browser/ui/views/tabs/common/pinned_tab_container_view.h"
#include "chrome/browser/ui/views/tabs/common/tab_drag_handler.h"
#include "chrome/browser/ui/views/tabs/common/tab_view.h"
#include "chrome/browser/ui/views/tabs/dragging/drag_session_data.h"
#include "chrome/browser/ui/views/frame/tab_strip_region_view.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_pinned_tab_entries_view.h"
#include "components/tabs/public/tab_interface.h"
#include "content/public/browser/web_contents.h"
#include "ui/compositor/layer.h"
#include "ui/views/controls/scroll_view.h"
#include "ui/views/view_utils.h"
#include "ui/gfx/geometry/insets.h"
namespace aux {
SavedEntryDropRoute GetSavedEntryDropRoute(TabDragContext* context,
    const VerticalPinnedTabEntriesView& saved, BaseTabStripRegionView& region,
    const views::ScrollView* outer, const gfx::Point& point) {
  if (!context || (!region.GetPinnedTabsContainer() &&
                   !region.GetUnpinnedTabsContainer()))
    return SavedEntryDropRoute::kNone;
  const auto* drag = context->GetDragController();
  if (!drag || !drag->active() || drag->attached_context() != context)
    return SavedEntryDropRoute::kNone;
  const auto& data = drag->GetSessionData();
  const bool any_pinned = std::ranges::any_of(data.tab_drag_data_,
      [](const auto& entry) { return entry.pinned; });
  // Original465a884: source89ef60 is View::GetVisibleBounds(), not preferred
  // size. A scrolled contents origin offers the real unpinned top-edge target.
  // Original metric57 dispatch is30 (ced81c8[57] ->5039b0);155's enum is34.
  if (outer && outer->contents() && !any_pinned &&
      outer->contents()->GetVisibleBounds().y() >= 1 &&
      region.GetUnpinnedTabsContainer()) {
    const auto bounds = outer->GetBoundsInScreen();
    const gfx::Rect top_band(bounds.x(), bounds.y(), bounds.width(), 30 / 2);
    if (top_band.Contains(point)) return SavedEntryDropRoute::kUnpinnedTopBand;
  }
  // Original465a5f8/465a998 and duplicate465a540/465aae0 tails.
  if (data.tab_drag_data_.empty() || any_pinned || data.group_header_id())
    return SavedEntryDropRoute::kNone;
  auto* model = context->GetTabStripModel();
  if (!model) return SavedEntryDropRoute::kNone;
  bool found = false;
  for (const auto& entry : data.tab_drag_data_) {
    if (!entry.contents) continue;
    const int index = model->GetIndexOfWebContents(entry.contents);
    if (index == TabStripModel::kNoTab || model->GetTabAtIndex(index)->GetGroup())
      return SavedEntryDropRoute::kNone;
    found = true;
  }
  if (!found) return SavedEntryDropRoute::kNone;
  if (saved.GetVisible() && saved.GetBoundsInScreen().Contains(point))
    return SavedEntryDropRoute::kSavedEntries;
  // Original465a530..53c: nonempty entries cannot route outside their visible
  // screen bounds. Only the empty saved owner receives the fallback rectangle.
  if (saved.HasSavedEntries() || !outer) return SavedEntryDropRoute::kNone;
  gfx::Rect fallback;
  if (auto* pinned = region.GetPinnedTabsContainer())
    fallback = GetAuxEmptyPinnedDropBounds(region, outer, *pinned);
  else {
    const auto bounds = region.GetBoundsInScreen();
    fallback = gfx::Rect(bounds.x(), outer->GetBoundsInScreen().y(),
                         bounds.width(), 40 + 12);
  }
  return fallback.Contains(point) ? SavedEntryDropRoute::kSavedEntries
                                  : SavedEntryDropRoute::kNone;
}
SavedEntryDropTarget::SavedEntryDropTarget(BrowserWindowInterface& browser,
    views::View& region, VerticalPinnedTabEntriesView& pins,
    PinnedTabContainerView& physical, views::ScrollView& outer,
    TabDragHandler& drag, CrossSectionDragPreview& preview,
    ProfilePreviewAdmission& admission, AcquireLock acquire,
    base::RepeatingClosure clear, base::RepeatingClosure completed)
    : browser_(browser.GetWeakPtr()), profile_(browser.GetProfile()),
      drag_(&drag), admission_(&admission), acquire_lock_(std::move(acquire)),
      clear_empty_drop_(std::move(clear)), completed_(std::move(completed)) {
  CHECK(acquire_lock_ && clear_empty_drop_ && completed_);
  region_.SetView(&region); pins_.SetView(&pins); physical_pins_.SetView(&physical);
  outer_.SetView(&outer); preview_.SetView(&preview);
}
SavedEntryDropTarget::~SavedEntryDropTarget() { Retire(); }
bool SavedEntryDropTarget::Current() const {
  return !retired_ && browser_ && browser_->GetProfile() == profile_ &&
      region_.view() && pins_.view() && physical_pins_.view() && outer_.view() &&
      preview_.view() && drag_->GetDragContext() &&
      drag_->GetDragContext()->GetTabStripModel() == browser_->GetTabStripModel();
}
void SavedEntryDropTarget::RestoreDraggedView() {
  if (hidden_.view() && previous_opacity_ && hidden_.view()->layer()) {
    hidden_.view()->layer()->SetOpacity(*previous_opacity_);
    hidden_.view()->SchedulePaint();
  }
  hidden_.SetView(nullptr); previous_opacity_.reset();
}
void SavedEntryDropTarget::Cleanup(bool retain) {
  url_ = GURL(); title_.clear();
  RestoreDraggedView();
  auto release = std::move(lock_);
  auto alive = weak_.GetWeakPtr();
  if (preview_.view()) static_cast<CrossSectionDragPreview*>(preview_.view())->Hide();
  if (!alive || !Current()) return;
  auto* pins = static_cast<VerticalPinnedTabEntriesView*>(pins_.view());
  if (retain) pins->PreserveDropInsertionAtEnd();
  else pins->SetDropInsertion(std::nullopt);
  if (alive && Current()) clear_empty_drop_.Run();
}
void SavedEntryDropTarget::Retire() {
  if (retired_) return;
  retired_ = true;
  url_ = GURL(); title_.clear();
  RestoreDraggedView();
  auto release = std::move(lock_);
  if (preview_.view()) static_cast<CrossSectionDragPreview*>(preview_.view())->Hide();
  if (pins_.view()) static_cast<VerticalPinnedTabEntriesView*>(pins_.view())->SetDropInsertion(std::nullopt);
  destroying_.Notify();
  weak_.InvalidateWeakPtrs();
}
void SavedEntryDropTarget::OnTabDragEntered() {
  if (!Current()) return;
  auto alive = weak_.GetWeakPtr();
  static_cast<VerticalPinnedTabEntriesView*>(pins_.view())->PreserveDropInsertionAtEnd();
  if (alive && Current()) clear_empty_drop_.Run();
}
TabDragContext* SavedEntryDropTarget::OnTabDragUpdated(
    DragController& controller, const gfx::Point& point) {
  if (!Current()) return nullptr;
  auto* context = drag_->GetDragContext();
  if (controller.GetAttachedContext() != context) return context;
  const auto& data = controller.GetSessionData();
  const auto count = std::ranges::count_if(data.tab_drag_data_, [](const auto& entry) {
    return entry.view_type == TabSlotView::ViewType::kTab;
  });
  if (count != 1 || data.source_view_index_ >= data.tab_drag_data_.size()) {
    Cleanup(true); return nullptr;
  }
  const auto& source = data.tab_drag_data_[data.source_view_index_];
  auto* contents = source.contents.get();
  auto* slot = contents ? context->GetTabForContents(contents) : nullptr;
  auto* view = slot ? views::AsViewClass<TabView>(drag_->ViewFromTabSlot(slot)) : nullptr;
  if (!contents || !view) { Cleanup(true); return nullptr; }
  url_ = contents->GetVisibleURL();
  if (!url_.is_valid()) url_ = contents->GetLastCommittedURL();
  title_ = contents->GetTitle();
  auto alive = weak_.GetWeakPtr();
  auto* pins = static_cast<VerticalPinnedTabEntriesView*>(pins_.view());
  std::optional<gfx::Rect> target;
  if ((pins->GetVisible() && !pins->GetBoundsInScreen().IsEmpty()) || pins->HasSavedEntries())
    target = pins->UpdateDropInsertion(point);
  else {
    target = GetAuxEmptyPinnedDropBounds(*region_.view(),
        static_cast<views::ScrollView*>(outer_.view()),
        *static_cast<PinnedTabContainerView*>(physical_pins_.view()));
    target->Inset(gfx::Insets::TLBR(4, 8, 8, 8));
  }
  if (!alive || !Current()) return nullptr;
  if (!url_.is_valid() || !target || target->IsEmpty()) {
    RestoreDraggedView();
    auto release = std::move(lock_);
    static_cast<CrossSectionDragPreview*>(preview_.view())->Hide();
    return context;
  }
  if (admission_->hover_expanded() && !lock_) {
    auto acquired = acquire_lock_.Run();
    if (!alive || !Current()) return nullptr;
    CHECK(acquired); lock_ = std::move(acquired);
  }
  const auto source_bounds = view->GetBoundsInScreen();
  const auto image = view->data().favicon;
  const auto visual_title = view->data().title;
  const auto from = views::View::ConvertRectFromScreen(region_.view(), source_bounds);
  const auto to = views::View::ConvertRectFromScreen(region_.view(), *target);
  static_cast<CrossSectionDragPreview*>(preview_.view())->Update(visual_title, image, from, to, true);
  if (!alive || !Current()) return nullptr;
  if (hidden_.view() != view) {
    RestoreDraggedView(); hidden_.SetView(view);
    // Original4132e90 saves the real layer opacity and restores it on release.
    if (!view->layer()) {
      view->SetPaintToLayer();
      view->layer()->SetFillsBoundsOpaquely(false);
    }
    previous_opacity_ = view->layer()->opacity();
    view->layer()->SetOpacity(0); view->SchedulePaint();
  }
  return context;
}
void SavedEntryDropTarget::OnTabDragExited(const gfx::Point&) { Cleanup(true); }
void SavedEntryDropTarget::OnTabDragEnded() { Cleanup(true); }
bool SavedEntryDropTarget::CanDropTab() { return Current() && url_.is_valid(); }
void SavedEntryDropTarget::HandleTabDrop(DragController& controller) {
  if (!CanDropTab()) return;
  auto alive = weak_.GetWeakPtr();
  const bool committed = static_cast<VerticalPinnedTabEntriesView*>(pins_.view())
      ->CommitDroppedEntry(url_, title_);
  if (!alive || !Current()) return;
  if (committed) {
    auto* context = drag_->GetDragContext();
    auto* model = context->GetTabStripModel();
    std::vector<int> indices;
    bool valid = !controller.GetSessionData().group_header_id();
    for (const auto& data : controller.GetSessionData().tab_drag_data_) {
      if (!data.contents) continue;
      const int index = model->GetIndexOfWebContents(data.contents);
      if (index == TabStripModel::kNoTab || model->GetTabAtIndex(index)->GetGroup()) {
        valid = false; break;
      }
      indices.push_back(index);
    }
    if (valid && !indices.empty()) {
      std::ranges::sort(indices);
      indices.erase(std::unique(indices.begin(), indices.end()), indices.end());
      model->PinTabsForAuxSavedEntryDrop(indices);
      if (!alive || !Current()) return;
      context->GetPositioningDelegate()->ForceLayout();
      if (!alive || !Current()) return;
      completed_.Run();
      if (!alive || !Current()) return;
    }
  }
  Cleanup(true);
}
base::CallbackListSubscription SavedEntryDropTarget::RegisterWillDestroyCallback(
    base::OnceClosure callback) { return destroying_.Add(std::move(callback)); }
}  // namespace aux
