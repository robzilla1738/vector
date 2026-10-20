// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SIDEBAR_VIEW_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SIDEBAR_VIEW_H_

#include <cstdint>
#include <memory>
#include <optional>
#include <set>
#include <string>
#include <vector>

#include "base/files/file_path.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "base/scoped_observation.h"
#include "base/task/cancelable_task_tracker.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/tab_strip_model_observer.h"
#include "chrome/browser/ui/views/frame/aux_native_task_feed.h"
#include "components/bookmarks/browser/base_bookmark_model_observer.h"
#include "components/bookmarks/browser/bookmark_model.h"
#include "components/prefs/pref_change_registrar.h"
#include "ui/menus/simple_menu_model.h"
#include "ui/views/context_menu_controller.h"
#include "ui/views/controls/button/button.h"
#include "ui/views/controls/menu/menu_runner.h"
#include "ui/views/view.h"

class BrowserWindowInterface;
class Profile;
class TabDragTarget;

// Genuine supplied primary profile menu; anchor must belong to a live Widget.
void ShowAuxProfileMenu(BrowserWindowInterface* browser, views::View* anchor);
bool IsAuxProfileMenuShowing(BrowserWindowInterface* browser);
// Retire the actual menu before a real same-window profile transfer.
void CloseAuxProfileMenu(BrowserWindowInterface* browser);
// Actual kind7 menu for this registered profile and clicked live anchor.
void ShowAuxProfileActions(BrowserWindowInterface* browser,
                           views::View* anchor,
                           const base::FilePath& path);

namespace network {
class SimpleURLLoader;
}

// Bookmarks and Chats sections that sit above the vertical tab strip. Chats
// come from the local daemon's authenticated sidebar feed.
class AuxSidebarView : public views::View,
                       public views::ContextMenuController,
                       public ui::SimpleMenuModel::Delegate,
                       public bookmarks::BaseBookmarkModelObserver,
                       public TabStripModelObserver {
  METADATA_HEADER(AuxSidebarView, views::View)

 public:
  explicit AuxSidebarView(BrowserWindowInterface* browser);
  AuxSidebarView(const AuxSidebarView&) = delete;
  AuxSidebarView& operator=(const AuxSidebarView&) = delete;
  ~AuxSidebarView() override;

  // Internal same-window transaction. Cold validation precedes all effects;
  // both commit and abort rebind the real currently authoritative profile.
  bool CanRebindForAuxProfileSwitch(Profile* target) const;
  uint64_t BeginAuxProfileSwitch(Profile* target);
  void RebindAuxProfileSwitch();
  void EndAuxProfileSwitch(uint64_t generation);

  // Called with whether any chat is running, whenever that changes.
  using RunningChangedCallback = base::RepeatingCallback<void(bool)>;
  void SetRunningChangedCallback(RunningChangedCallback callback) {
    running_changed_ = std::move(callback);
  }

  struct Chat {
    std::string id;
    std::string title;
    bool unread = false;
    bool running = false;
    bool pinned = false;
    bool can_pin = false;
  };

  TabDragTarget* GetPinnedTabDragTarget(const gfx::Point& point_in_screen);

  // views::View:
  void AddedToWidget() override;
  void RemovedFromWidget() override;

  // TabStripModelObserver:
  void OnTabStripModelChanged(
      TabStripModel* tab_strip_model,
      const TabStripModelChange& change,
      const TabStripSelectionChange& selection) override;
  void OnTabChangedAt(tabs::TabInterface* tab,
                      TabChangeType change_type) override;

  // views::ContextMenuController:
  void ShowContextMenuForViewImpl(
      views::View* source,
      const gfx::Point& point,
      ui::mojom::MenuSourceType source_type) override;

  // ui::SimpleMenuModel::Delegate:
  void ExecuteCommand(int command_id, int event_flags) override;

  // bookmarks::BaseBookmarkModelObserver:
  void BookmarkModelChanged() override;
  void BookmarkModelLoaded(bool ids_reassigned) override;
  void BookmarkModelBeingDeleted() override;

 private:
  void BindProfileSources();
  void Rebuild();
  void ScheduleRebuild();
  void AddPinnedTiles();
  void ReadSidebarState();
  void SaveSectionState();
  void ToggleBookmarkFolder(int64_t id);
  void AddBookmarkRows(views::View* container,
                       const bookmarks::BookmarkNode* node,
                       int depth,
                       int* count);
  void ExecuteBookmarkCommand(int command);
  void ActivateTab(base::WeakPtr<content::WebContents> contents);
  void MovePinnedTab(base::WeakPtr<content::WebContents> contents, int to);
  void PinDraggedTab(base::WeakPtr<content::WebContents> contents, int to);
  void FinishPinnedDrag(base::WeakPtr<content::WebContents> contents,
                        const gfx::Point& point_in_screen);
  void OnTaskSnapshot(const AuxNativeTaskFeed::Snapshot& snapshot);
  void HandleChatClick(const std::string& session_id);
  void OpenChat(const std::string& session_id);
  void PostChatAction(const std::string& session_id, const std::string& action);
  void OpenNewChat();
  void OpenNewTab();
  void ToggleSection(const std::string& key);
  void UpdateActiveChat();
  void OpenAllChats();
  void OpenBookmark(const GURL& url);

  const raw_ptr<BrowserWindowInterface> browser_;
  base::WeakPtr<Profile> bound_profile_;
  bool profile_switch_paused_ = false;
  uint64_t profile_switch_generation_ = 0;
  base::ScopedObservation<bookmarks::BookmarkModel,
                          bookmarks::BaseBookmarkModelObserver>
      bookmark_observation_{this};
  std::unique_ptr<AuxNativeTaskFeed> task_feed_;
  std::vector<AuxNativeTask> projected_tasks_;
  AuxNativeTaskFeed::State feed_state_ = AuxNativeTaskFeed::State::kConnecting;
  std::u16string feed_error_;
  std::u16string action_error_;
  base::WeakPtr<views::Widget> review_widget_;
  PrefChangeRegistrar pref_changes_;
  base::CancelableTaskTracker favicon_tracker_;
  std::unique_ptr<ui::SimpleMenuModel> menu_model_;
  std::unique_ptr<views::MenuRunner> menu_runner_;
  std::string menu_chat_id_;
  bool menu_pinned_ = false;
  base::WeakPtr<content::WebContents> menu_tab_contents_;
  bool rebuild_pending_ = false;

  std::vector<Chat> chats_;
  std::set<std::string> collapsed_sections_;
  raw_ptr<views::View> pinned_grid_ = nullptr;
  std::set<std::string> expanded_bookmark_folders_;
  int64_t menu_bookmark_id_ = -1;
  std::string menu_bookmark_uuid_;
  std::string active_chat_id_;
  bool show_all_chats_ = false;
  bool any_running_ = false;
  RunningChangedCallback running_changed_;

  base::WeakPtrFactory<AuxSidebarView> weak_factory_{this};
};

// The purple agent pill that leads the sidebar header. It opens the chat list.
class AuxAgentPill : public views::Button {
  METADATA_HEADER(AuxAgentPill, views::Button)

 public:
  explicit AuxAgentPill(BrowserWindowInterface* browser);
  AuxAgentPill(const AuxAgentPill&) = delete;
  AuxAgentPill& operator=(const AuxAgentPill&) = delete;
  ~AuxAgentPill() override;

  // views::View:
  gfx::Size CalculatePreferredSize(
      const views::SizeBounds& available_size) const override;
  void Layout(PassKey) override;
};

// Profile button, profile pager dots and tab search pinned to the bottom of
// the sidebar. The profile button opens Aux profile menu.
class AuxSidebarFooter : public views::View {
  METADATA_HEADER(AuxSidebarFooter, views::View)

 public:
  explicit AuxSidebarFooter(BrowserWindowInterface* browser);
  AuxSidebarFooter(const AuxSidebarFooter&) = delete;
  AuxSidebarFooter& operator=(const AuxSidebarFooter&) = delete;
  ~AuxSidebarFooter() override;

  void SetAgentActive(bool active);
  // Refresh existing footer controls from the same Browser's real profile.
  void RebindForAuxProfileSwitch();

 private:
  void Build();

  const raw_ptr<BrowserWindowInterface> browser_;
  raw_ptr<views::View> profile_button_ = nullptr;
  raw_ptr<views::View> agent_button_ = nullptr;
  bool agent_active_ = false;
  base::WeakPtrFactory<AuxSidebarFooter> weak_factory_{this};
};

#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SIDEBAR_VIEW_H_
