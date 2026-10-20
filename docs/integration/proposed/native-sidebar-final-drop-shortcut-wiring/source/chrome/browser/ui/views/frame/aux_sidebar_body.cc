// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_sidebar_body.h"
#include <algorithm>
#include <utility>
#include "base/check.h"
#include "base/functional/bind.h"
#include "chrome/browser/profiles/profile.h"
#include "components/prefs/pref_service.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_agent_session_tabs_view.h"
#include "chrome/browser/ui/views/frame/aux_bookmark_tab_associations.h"
#include "chrome/browser/ui/views/frame/aux_bookmarks_section.h"
#include "chrome/browser/ui/views/frame/aux_chats_controller.h"
#include "chrome/browser/ui/views/frame/aux_chats_section.h"
#include "chrome/browser/ui/views/frame/aux_cross_section_drag_coordinator.h"
#include "chrome/browser/ui/views/frame/aux_cross_section_drag_preview.h"
#include "chrome/browser/ui/views/frame/aux_sidebar_contents_view.h"
#include "chrome/browser/ui/views/frame/aux_sidebar_projection.h"
#include "chrome/browser/ui/views/frame/aux_sidebar_presentation.h"
#include "chrome/browser/ui/views/frame/aux_saved_entry_drop_target.h"
#include "chrome/browser/ui/views/tabs/common/tab_strip_collection_controller.h"
#include "chrome/browser/ui/views/frame/aux_tabs_actions.h"
#include "chrome/browser/ui/views/frame/aux_tabs_section.h"
#include "chrome/browser/ui/views/frame/aux_vertical_new_tab_button.h"
#include "chrome/browser/ui/views/frame/aux_vertical_tab_bookmarks_view.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/frame/browser_widget.h"
#include "chrome/browser/ui/views/frame/vertical_tab_strip_region_view.h"
#include "chrome/browser/ui/views/tabs/common/tab_strip_view.h"
#include "chrome/browser/ui/views/tabs/common/unpinned_tab_container_view.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_tab_strip_scroll_bar.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/gfx/geometry/point_conversions.h"
#include "ui/views/controls/button/button.h"
#include "ui/views/layout/flex_layout.h"
#include "ui/views/view_class_properties.h"
namespace aux {
AuxSidebarBody::AuxSidebarBody(BrowserWindowInterface& browser,
    VerticalTabStripRegionView& region,
    tabs::VerticalTabStripStateController& state, TabHoverCardController& hover,
    VerticalPinnedTabEntriesView& saved, base::RepeatingClosure new_tab)
    : browser_(&browser), region_(&region), state_(&state), hover_(&hover),
      saved_(&saved), before_new_tab_(std::move(new_tab)) {
  ConfigureSidebarContentsScrollView(*this);
  auto bar = std::make_unique<VerticalTabStripScrollBar>(state_);
  bar->SetThumbVisible(false);
  SetVerticalScrollBar(std::move(bar));
}
AuxSidebarBody::~AuxSidebarBody() { Unmount(); }
void AuxSidebarBody::SetRunningChangedCallback(base::RepeatingCallback<void(bool)> cb) {
  running_ = std::move(cb);
}
void AuxSidebarBody::Mount(TabStripView& strip) {
  CHECK(!strip_ || strip_ == &strip);
  strip_ = &strip;
  if (!paused_ && !body_) Build();
}
void AuxSidebarBody::Build() {
  CHECK(strip_ && !body_ && !retiring_);
  building_ = true;
  auto* model = browser_->GetTabStripModel();
  CHECK(model && strip_->collection_node());
  auto changed = base::BindRepeating(&AuxSidebarBody::Changed, weak_.GetWeakPtr());
  body_ = SetContents(std::make_unique<SidebarContentsView>(
      base::BindRepeating(&AuxSidebarBody::RightClick, weak_.GetWeakPtr())));
  associations_ = std::make_unique<BookmarkTabAssociations>(*browser_);
  auto bookmarks = std::make_unique<VerticalTabBookmarksView>(browser_, model, hover_, state_);
  bookmarks_ = body_->AddChildView(std::make_unique<AuxBookmarksSection>(
      *browser_->GetProfile()->GetPrefs(), std::move(bookmarks),
      AuxBookmarksSection::Actions{
        base::BindRepeating([](base::WeakPtr<AuxSidebarBody> body, bool enabled) {
          if (!body) return;
          if (!enabled && body->drag_) body->drag_->Cancel();
          body->Changed();
        }, weak_.GetWeakPtr()), changed}));
  chats_ = std::make_unique<AuxChatsController>(*browser_, *associations_,
                                               GetNewChatShortcutHelp(), changed);
  chats_section_ = body_->AddChildView(chats_->TakeSection());
  divider_ = body_->AddChildView(std::make_unique<AuxSectionDivider>());
  tabs_ = body_->AddChildView(std::make_unique<AuxTabsSection>(AuxTabsSection::Actions{
      base::BindRepeating([](base::WeakPtr<AuxSidebarBody> body) {
        if (body && body->actions_) body->actions_->Tidy();
      }, weak_.GetWeakPtr()),
      base::BindRepeating([](base::WeakPtr<AuxSidebarBody> body) {
        if (body && body->actions_) body->actions_->Clear();
      }, weak_.GetWeakPtr())}));
  actions_ = std::make_unique<AuxTabsActions>(*browser_,
      base::BindRepeating([](base::WeakPtr<AuxSidebarBody> body) {
        return body && body->tabs_ && body->tabs_->tidy_button()->GetEnabled();
      }, weak_.GetWeakPtr()),
      base::BindRepeating([](base::WeakPtr<AuxSidebarBody> body, bool busy) {
        if (body && body->tabs_) body->tabs_->SetTidyBusy(busy);
      }, weak_.GetWeakPtr()));
  auto* tabs_contents = tabs_->contents();
  new_tab_ = tabs_contents->AddChildView(std::make_unique<AuxVerticalNewTabButton>(*browser_));
  new_tab_subscription_ = new_tab_->AddBeforeInvokeCallback(before_new_tab_);
  // Source464ccfc: actual native collection root under Tabs, external pinned
  // container under region, Agent5d0 under the actual unpinned collection.
  tabs_contents->AddChildView(strip_.get());
  strip_->SetExternalScrollMode(true);
  strip_->SetExternalParents(region_, this);
  auto* unpinned = strip_->GetUnpinnedTabsContainer();
  CHECK(unpinned);
  agent_ = unpinned->AddChildView(std::make_unique<AgentSessionTabsView>(
      *browser_, *model, *hover_,
      base::BindRepeating(&AuxSidebarBody::QueueProjectionRefresh, weak_.GetWeakPtr())));
  unpinned->SetAgentSessionTabsView(agent_);
  projection_ = std::make_unique<AuxSidebarProjection>(*browser_, *associations_,
      *bookmarks_->bookmarks_view(), *chats_, *saved_, *hover_, *agent_,
      *strip_->collection_node(), changed);
  preview_ = region_->AddChildView(std::make_unique<CrossSectionDragPreview>());
  preview_->SetProperty(views::kViewIgnoredByLayoutKey, true);
  CHECK(region_->GetAuxProfilePreviewAdmission());
  CHECK(strip_->GetPinnedTabsContainer());
  saved_drop_ = std::make_unique<SavedEntryDropTarget>(*browser_, *region_,
      *saved_, *strip_->GetPinnedTabsContainer(), *this,
      region_->GetTabStripCollectionController()->GetDragHandler(), *preview_,
      *region_->GetAuxProfilePreviewAdmission(),
      base::BindRepeating([](base::WeakPtr<AuxSidebarBody> body)
          -> std::unique_ptr<ExpandOnHoverLock> {
        return body ? body->region_->AcquireDragExpansionLock() : nullptr;
      }, weak_.GetWeakPtr()),
      base::BindRepeating([](base::WeakPtr<AuxSidebarBody> body) {
        if (body) body->region_->ClearAuxEmptyPinnedDrop();
      }, weak_.GetWeakPtr()),
      base::BindRepeating([](base::WeakPtr<AuxSidebarBody> body) {
        if (body) body->region_->SavedPinConversionCompleted();
      }, weak_.GetWeakPtr()));
  drag_ = std::make_unique<CrossSectionDragCoordinator>(*browser_, *region_,
      *bookmarks_, *saved_, *this, strip_->GetPinnedTabsContainer(),
      *region_->GetAuxProfilePreviewAdmission(), *preview_, *region_);
  bookmarks_->bookmarks_view()->SetActivatedCallback(base::BindRepeating(
      [](base::WeakPtr<AuxSidebarBody> body) {
        if (body && body->projection_) body->projection_->Refresh();
      }, weak_.GetWeakPtr()));
  building_ = false;
  bookmarks_->bookmarks_view()->SetContentsChangedCallback(base::BindRepeating(
      [](base::WeakPtr<AuxSidebarBody> body, bool present) {
        if (!body) return;
        body->bookmark_has_contents_ = present;
        body->ApplyPresentation();
      }, weak_.GetWeakPtr()));
  ApplyPresentation();
  chats_->Start();
  agent_->Refresh();
  projection_->Start();
  Changed();
}
void AuxSidebarBody::Retire() {
  if (retiring_ || !body_) return;
  retiring_ = true;
  if (saved_drop_) saved_drop_->Retire();
  saved_drop_.reset();
  if (drag_) drag_->Retire();
  drag_.reset();
  if (projection_) projection_->Retire();
  projection_.reset();
  if (actions_) actions_->Retire();
  actions_.reset();
  if (chats_) chats_->Retire();
  chats_.reset();
  if (bookmarks_) bookmarks_->RetireForProfileChange();
  if (agent_) {
    agent_->Retire();
    auto* unpinned = strip_->GetUnpinnedTabsContainer();
    CHECK(unpinned && agent_->parent() == unpinned);
    unpinned->SetAgentSessionTabsView(nullptr);
    unpinned->RemoveChildViewT(agent_.get());
    agent_ = nullptr;
  }
  if (strip_) {
    strip_->SetExternalParents(nullptr, nullptr);
    // BaseTabStripRegionView clears/deletes only its direct owned child.
    if (strip_->parent() != region_) region_->AddChildView(strip_.get());
  }
  new_tab_subscription_ = {};
  associations_.reset();
  if (preview_) { region_->RemoveChildViewT(preview_.get()); preview_ = nullptr; }
  bookmarks_ = nullptr; chats_section_ = nullptr; divider_ = nullptr;
  tabs_ = nullptr; new_tab_ = nullptr; bookmark_has_contents_ = false;
  body_ = nullptr;
  SetContents(std::unique_ptr<views::View>());
  if (running_) running_.Run(false);
  retiring_ = false;
}
void AuxSidebarBody::Unmount() { Retire(); strip_ = nullptr; }
void AuxSidebarBody::ApplyPresentation() {
  if (building_ || !body_ || !tabs_ || retiring_) return;
  const auto* admission = region_->GetAuxProfilePreviewAdmission();
  if (!admission) return;
  const auto presentation = CalculateSidebarSectionPresentation(*admission,
      region_->width(), chats_->agent_installed(),
      browser_->GetProfile()->GetPrefs()->GetBoolean(kBookmarksSectionEnabledPref),
      bookmark_has_contents_);
  bookmarks_->SetVisible(presentation.bookmarks_visible);
  chats_section_->SetVisible(presentation.chats_visible);
  divider_->SetVisible(presentation.divider_visible);
  tabs_->SetVisible(presentation.content_visible);
  new_tab_->SetVisible(presentation.content_visible);
  new_tab_->SetCompact(presentation.compact);
  bookmarks_->bookmarks_view()->SetCompact(presentation.compact);
  agent_->SetExternalVisibility(presentation.content_visible);
}
TabDragTarget* AuxSidebarBody::GetProvidedSavedDropTarget(const gfx::Point& point) {
  if (!saved_drop_ || !strip_ || building_ || retiring_ || paused_) return nullptr;
  switch (GetSavedEntryDropRoute(region_->GetDragContext(), *saved_,
                                *region_, this, point)) {
    case SavedEntryDropRoute::kUnpinnedTopBand:
      region_->ClearAuxEmptyPinnedDrop();
      if (auto* unpinned = strip_->GetUnpinnedTabsContainer())
        return &unpinned->GetTabDragTarget(point);
      return nullptr;
    case SavedEntryDropRoute::kSavedEntries:
      region_->ClearAuxEmptyPinnedDrop();
      return saved_drop_.get();
    case SavedEntryDropRoute::kNone:
      return nullptr;
  }
}
TabDragTarget* AuxSidebarBody::GetProvidedBookmarkDropTarget(const gfx::Point& point) const {
  if (building_ || retiring_ || paused_ || !bookmarks_ ||
      !bookmarks_->GetVisible() || !bookmarks_->bookmarks_view()->GetVisible() ||
      !region_->GetBoundsInScreen().Contains(point)) return nullptr;
  return bookmarks_->bookmarks_view();
}
bool AuxSidebarBody::IsPublishingProjection() const {
  return projection_ && projection_->is_publishing();
}
void AuxSidebarBody::QueueProjectionRefresh() {
  if (projection_) projection_->QueueRefresh();
  Changed();
}
bool AuxSidebarBody::CanRebindForAuxProfileSwitch(Profile* target) const {
  return target && !paused_ && !retiring_;
}
uint64_t AuxSidebarBody::BeginAuxProfileSwitch(Profile* target) {
  CHECK(CanRebindForAuxProfileSwitch(target));
  paused_ = true;
  Retire();
  return ++generation_;
}
void AuxSidebarBody::RebindAuxProfileSwitch() { CHECK(paused_); }
void AuxSidebarBody::EndAuxProfileSwitch(uint64_t generation) {
  CHECK(paused_ && generation == generation_);
  paused_ = false;
  if (strip_ && !body_) Build();
}
void AuxSidebarBody::Changed() {
  if (building_ || retiring_ || paused_) return;
  if (running_ && chats_) running_.Run(std::ranges::any_of(chats_->chats(),
      [](const Chat& chat) { return chat.status == ChatStatus::kRunning; }));
  ApplyPresentation();
  region_->RefreshAuxPinnedPresentation();
  InvalidateLayout();
  PreferredSizeChanged();
}
void AuxSidebarBody::RightClick(views::View* source, const ui::MouseEvent& event) {
  auto point = gfx::ToFlooredPoint(event.location_f());
  views::View::ConvertPointToScreen(source, &point);
  BrowserView::GetBrowserViewForBrowser(browser_)->browser_widget()->ShowContextMenuForViewImpl(
      source, point, ui::mojom::MenuSourceType::kMouse);
}
BEGIN_METADATA(AuxSidebarBody)
END_METADATA
}  // namespace aux
