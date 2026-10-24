// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/views/frame/multi_contents_view_delegate.h"

#include "chrome/browser/ui/views/frame/aux_split_commands.h"
#include "chrome/browser/ui/views/tabs/dragging/drag_session_data.h"
#include "chrome/browser/sessions/session_service.h"
#include "chrome/browser/sessions/session_service_factory.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/navigator/browser_navigator.h"
#include "chrome/browser/ui/navigator/browser_navigator_params.h"
#include "chrome/browser/ui/tabs/split_tab_metrics.h"
#include "chrome/browser/ui/tabs/tab_enums.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/tab_strip_model_delegate.h"
#include "chrome/browser/ui/views/frame/multi_contents_drop_target_view.h"
#include "components/sessions/core/session_id.h"
#include "components/split_tabs/split_tab_visual_data.h"
#include "components/tabs/public/split_tab_data.h"
#include "components/tabs/public/tab_interface.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/common/url_constants.h"
#include "ui/base/dragdrop/os_exchange_data.h"
#include "ui/base/page_transition_types.h"
#include "ui/base/window_open_disposition.h"
#include "url/url_constants.h"

MultiContentsViewDelegateImpl::MultiContentsViewDelegateImpl(
    BrowserWindowInterface& browser)
    : browser_(browser), tab_strip_model_(*browser.GetTabStripModel()) {}

void MultiContentsViewDelegateImpl::WebContentsFocused(
    content::WebContents* web_contents) {
  const tabs::TabInterface* tab =
      tabs::TabInterface::MaybeGetFromContents(web_contents);
  if (!tab || !tab->IsSplit()) {
    return;
  }

  std::vector<tabs::TabInterface*> tabs =
      tab_strip_model_->GetSplitData(tab->GetSplit().value())->ListTabs();

  // Ensure that the focused WebContents and the active tab are part of the same
  // split. There could be a race condition between when the focus happens and
  // when the contents of MultiContentsView are swapped out. See
  // crbug.com/485670308.
  if (tab_strip_model_->GetActiveTab() != tab &&
      std::find(tabs.begin(), tabs.end(), tab_strip_model_->GetActiveTab()) !=
          tabs.end()) {
    tab_strip_model_->ActivateTabAt(tab_strip_model_->GetIndexOfTab(tab));
  }
}

void MultiContentsViewDelegateImpl::ReverseWebContents() {
  const int active_index = tab_strip_model_->active_index();

  const std::optional<split_tabs::SplitTabId> split_tab_id =
      tab_strip_model_->GetTabAtIndex(active_index)->GetSplit();

  CHECK(split_tab_id.has_value());
  tab_strip_model_->ReverseTabsInSplit(split_tab_id.value());
}

void MultiContentsViewDelegateImpl::ResizeWebContents(double start_ratio,
                                                      bool done_resizing) {
  const std::optional<split_tabs::SplitTabId> split_tab_id =
      tab_strip_model_->GetActiveTab()->GetSplit();

  CHECK(split_tab_id.has_value());
  tab_strip_model_->UpdateSplitRatio(split_tab_id.value(), start_ratio,
                                     !done_resizing);

  if (done_resizing) {
    const split_tabs::SplitTabId split_id =
        tab_strip_model_->GetActiveTab()->GetSplit().value();

    SessionService* const session_service =
        SessionServiceFactory::GetForProfile(browser_->GetProfile());

    if (!session_service) {
      return;
    }

    const split_tabs::SplitTabVisualData* visual_data =
        tab_strip_model_->GetSplitData(split_id)->visual_data();
    session_service->SetSplitTabData(browser_->GetSessionID(), split_id,
                                     visual_data);
  }
}

void MultiContentsViewDelegateImpl::ResizePaneBranch(uint32_t node,
                                                       double ratio, bool done) {
  auto* active = tab_strip_model_->GetActiveTab();
  if (!active || !active->GetSplit()) return;
  const auto split = *active->GetSplit();
  const auto* data = tab_strip_model_->GetSplitData(split);
  if (!data || !data->visual_data()->pane_tree()) return;
  auto tree = *data->visual_data()->pane_tree();
  if (!tree.ResizeBranch(node, ratio)) return;
  tab_strip_model_->UpdateSplitPaneTree(split, tree, !done);
  if (done) {
    if (auto* sessions = SessionServiceFactory::GetForProfile(browser_->GetProfile()))
      sessions->SetSplitTabData(browser_->GetSessionID(), split,
                               tab_strip_model_->GetSplitData(split)->visual_data());
  }
}

void MultiContentsViewDelegateImpl::HandleLinkDrop(
    MultiContentsDropTargetView::DropSide side,
    const ui::DropTargetEvent& event) {
  auto urls = event.data().GetURLs(ui::FilenameToURLPolicy::CONVERT_FILENAMES);
  CHECK(!urls.empty());
  tabs::TabInterface* active_tab = tab_strip_model_->GetActiveTab();
  CHECK(!active_tab->IsSplit());

  // Disallow javascript: URLs to prevent self-XSS.
  std::vector<GURL> filtered_urls;
  for (const auto& url_info : urls) {
    if (url_info.url.SchemeIs(url::kJavaScriptScheme)) {
      filtered_urls.emplace_back(content::kBlockedURL);
    } else {
      filtered_urls.push_back(url_info.url);
    }
  }

  // Insert the tab before or after the active tab, according to the drop side.
  const int new_tab_idx =
      tab_strip_model_->active_index() +
      (side == MultiContentsDropTargetView::DropSide::START ? 0 : 1);

  const split_tabs::SplitTabVisualData split_data(
      side == MultiContentsDropTargetView::DropSide::BOTTOM
          ? split_tabs::SplitTabLayout::kStacked
          : split_tabs::SplitTabLayout::kSideBySide);

  // We currently only support creating a split with one link; i.e., the first
  // link in the provided list.
  NavigateParams params(&browser_.get(), filtered_urls.front(),
                        ui::PAGE_TRANSITION_LINK);
  params.tabstrip_index = new_tab_idx;
  params.disposition = WindowOpenDisposition::NEW_FOREGROUND_TAB;
  params.initiator_origin = event.data().GetRendererTaintedOrigin();
  if (active_tab->IsPinned()) {
    params.tabstrip_add_types |= AddTabTypes::ADD_PINNED;
  }
  if (active_tab->GetGroup()) {
    params.group = active_tab->GetGroup().value();
  }

  // If the navigation failed, don't try to create a split view.
  if (!Navigate(&params)) {
    return;
  }

  // Create a split with the previously active tab, which should be before or
  // after the newly created tab.
  tab_strip_model_->AddToNewSplit(
      {new_tab_idx +
       (side == MultiContentsDropTargetView::DropSide::START ? 1 : -1)},
      split_data, split_tabs::SplitTabCreatedSource::kDragAndDropLink);
}

void MultiContentsViewDelegateImpl::HandleTabDrop(
    MultiContentsDropTargetView::DropSide side,
    TabDragTarget::DragController& drag_controller) {
  auto* target = tab_strip_model_->GetActiveTab();
  if (!target) return;
  if (target->IsSplit()) {
    const auto& drag = drag_controller.GetSessionData();
    if (drag.num_dragging_tabs() != 1 || !drag.dragging_groups.empty()) return;
    auto* source = tabs::TabInterface::MaybeGetFromContents(drag.source_dragged_contents());
    if (!aux::CanJoinNativeSplit(browser_.get(), target, source)) return;
    const auto target_handle = target->GetHandle();
    auto detached = drag_controller.DetachTabAtForInsertion(drag.source_view_index_);
    if (!detached) return;
    // Keep the detached tab recoverable even if target admission changes.
    auto* current_target = target_handle.Get();
    const int inserted = tab_strip_model_->InsertDetachedTabAt(
        tab_strip_model_->count(), std::move(detached),
        current_target && current_target->IsPinned() ? AddTabTypes::ADD_PINNED : AddTabTypes::ADD_NONE,
        current_target ? current_target->GetGroup() : std::nullopt);
    auto* added = tab_strip_model_->GetTabAtIndex(inserted);
    aux::JoinNativeSplit(browser_.get(), target_handle.Get(), added,
        side == MultiContentsDropTargetView::DropSide::BOTTOM
            ? split_tabs::SplitPaneTree::Axis::kVertical : split_tabs::SplitPaneTree::Axis::kHorizontal,
        side == MultiContentsDropTargetView::DropSide::START);
    tab_strip_model_->ActivateTabAt(tab_strip_model_->GetIndexOfTab(added));
    return;
  }

  const split_tabs::SplitTabVisualData split_data(
      side == MultiContentsDropTargetView::DropSide::BOTTOM
          ? split_tabs::SplitTabLayout::kStacked
          : split_tabs::SplitTabLayout::kSideBySide);

  std::unique_ptr<tabs::TabModel> detached_tab =
      drag_controller.DetachTabAtForInsertion(
          drag_controller.GetSessionData().source_view_index_);

  // Insert the tab next to the currently active tab, add it to a split,
  // then activate it.
  const int new_tab_idx =
      tab_strip_model_->active_index() +
      (side == MultiContentsDropTargetView::DropSide::START ? 0 : 1);

  tabs::TabInterface* active_tab = tab_strip_model_->GetActiveTab();
  const int inserted_tab_idx = tab_strip_model_->InsertDetachedTabAt(
      new_tab_idx, std::move(detached_tab),
      active_tab->IsPinned() ? AddTabTypes::ADD_PINNED : AddTabTypes::ADD_NONE,
      active_tab->GetGroup());
  tab_strip_model_->AddToNewSplit(
      {inserted_tab_idx}, split_data,
      split_tabs::SplitTabCreatedSource::kDragAndDropTab);
  tab_strip_model_->ActivateTabAt(inserted_tab_idx);
}
