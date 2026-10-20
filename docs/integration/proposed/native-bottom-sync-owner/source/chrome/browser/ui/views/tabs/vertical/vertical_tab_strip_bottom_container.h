// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef CHROME_BROWSER_UI_VIEWS_TABS_VERTICAL_VERTICAL_TAB_STRIP_BOTTOM_CONTAINER_H_
#define CHROME_BROWSER_UI_VIEWS_TABS_VERTICAL_VERTICAL_TAB_STRIP_BOTTOM_CONTAINER_H_

#include "base/callback_list.h"
#include "base/memory/raw_ptr.h"
#include "base/scoped_observation.h"
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
#include "components/sync/base/data_type.h"
#include "components/sync/service/sync_service.h"
#include "components/sync/service/sync_service_observer.h"
#endif
#include "ui/base/metadata/metadata_header_macros.h"
#include "ui/views/layout/flex_layout_view.h"

namespace views {
class Label;
class Throbber;
}  // namespace views

class BrowserWindowInterface;
class ExpandOnHoverLock;
class TabStripFlatEdgeButton;

namespace actions {
class ActionItem;
}  // namespace actions

namespace tabs {
class VerticalTabStripStateController;
enum class VerticalTabStripCollapseState;
}  // namespace tabs

// Bottom container of the vertical tab strip. Aux retains the supplied hidden
// sync-status card; other builds retain Chromium's new-tab button.
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
class VerticalTabStripBottomContainer : public views::FlexLayoutView,
                                        public syncer::SyncServiceObserver {
#else
class VerticalTabStripBottomContainer : public views::FlexLayoutView {
#endif
  METADATA_HEADER(VerticalTabStripBottomContainer, views::FlexLayoutView)
 public:
  VerticalTabStripBottomContainer(
      tabs::VerticalTabStripStateController* state_controller,
      actions::ActionItem* root_action_item,
      BrowserWindowInterface* browser,
      base::RepeatingClosure record_new_tab_button_pressed);
  ~VerticalTabStripBottomContainer() override;

  bool IsPositionInWindowCaption(const gfx::Point& point);

  void OnCollapseStateChanged(tabs::VerticalTabStripCollapseState state);

 private:
  void OnNewTabButtonContextMenuWillShow();
  void OnNewTabButtonContextMenuClosed();

  void UpdateButtonStyles(bool collapsed);
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  void InitializeSyncCard();
  void UpdateSyncState();
  void UpdateSyncLabel();
  void OnStateChanged(syncer::SyncService* service) override;
  void OnSyncShutdown(syncer::SyncService* service) override;
  void OnThemeChanged() override;

  raw_ptr<views::FlexLayoutView> sync_card_ = nullptr;
  raw_ptr<views::FlexLayoutView> sync_row_ = nullptr;
  raw_ptr<views::Throbber> sync_throbber_ = nullptr;
  raw_ptr<views::Label> sync_label_ = nullptr;
  raw_ptr<syncer::SyncService> sync_service_ = nullptr;
  base::ScopedObservation<syncer::SyncService, syncer::SyncServiceObserver>
      sync_observation_{this};
  syncer::DataTypeSet pending_initial_downloads_;
  bool sync_compact_ = false;
#endif

  raw_ptr<BrowserWindowInterface> browser_ = nullptr;
  raw_ptr<actions::ActionItem> root_action_item_ = nullptr;
  raw_ptr<TabStripFlatEdgeButton> new_tab_button_ = nullptr;
  base::CallbackListSubscription collapsed_state_change_subscription_;
  base::CallbackListSubscription new_tab_button_pressed_subscription_;

  std::unique_ptr<ExpandOnHoverLock> expand_on_hover_lock_;
};

#endif  // CHROME_BROWSER_UI_VIEWS_TABS_VERTICAL_VERTICAL_TAB_STRIP_BOTTOM_CONTAINER_H_
