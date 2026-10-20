// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SIDEBAR_BODY_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SIDEBAR_BODY_H_
#include <cstdint>
#include <memory>
#include "base/callback_list.h"
#include "base/functional/callback.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_tab_strip_scroll_view.h"
class BrowserWindowInterface;
class Profile;
class TabStripView;
class TabDragTarget;
class VerticalTabStripRegionView;
class VerticalPinnedTabEntriesView;
class TabHoverCardController;
namespace tabs { class VerticalTabStripStateController; }
namespace aux {
class AuxBookmarksSection;
class AuxChatsController;
class AuxChatsSection;
class AuxTabsSection;
class AuxTabsActions;
class AuxVerticalNewTabButton;
class AgentSessionTabsView;
class BookmarkTabAssociations;
class AuxSidebarProjection;
class CrossSectionDragCoordinator;
class CrossSectionDragPreview;
class SidebarContentsView;
class SavedEntryDropTarget;
class AuxSectionDivider;
// Mounts supplied owners under original shared scroll5b0/contents5c0. It does
// not render replacement rows or synthesize model/backend state.
class AuxSidebarBody final : public VerticalTabStripScrollView {
 METADATA_HEADER(AuxSidebarBody, VerticalTabStripScrollView)
 public:
  AuxSidebarBody(BrowserWindowInterface&, VerticalTabStripRegionView&,
                 tabs::VerticalTabStripStateController&, TabHoverCardController&,
                 VerticalPinnedTabEntriesView&, base::RepeatingClosure new_tab);
  ~AuxSidebarBody() override;
  void Mount(TabStripView&);
  void Unmount();
  void ApplyPresentation();
  void QueueProjectionRefresh();
  bool IsPublishingProjection() const;
  TabDragTarget* GetProvidedSavedDropTarget(const gfx::Point&);
  TabDragTarget* GetProvidedBookmarkDropTarget(const gfx::Point&) const;
  bool CanRebindForAuxProfileSwitch(Profile*) const;
  uint64_t BeginAuxProfileSwitch(Profile*);
  void RebindAuxProfileSwitch();
  void EndAuxProfileSwitch(uint64_t);
  void SetRunningChangedCallback(base::RepeatingCallback<void(bool)> cb);
 private:
  void Build();
  void Retire();
  void Changed();
  void RightClick(views::View*, const ui::MouseEvent&);
  raw_ptr<BrowserWindowInterface> browser_;
  raw_ptr<VerticalTabStripRegionView> region_;
  raw_ptr<tabs::VerticalTabStripStateController> state_;
  raw_ptr<TabHoverCardController> hover_;
  raw_ptr<VerticalPinnedTabEntriesView> saved_;
  raw_ptr<TabStripView> strip_ = nullptr;
  raw_ptr<SidebarContentsView> body_ = nullptr;
  raw_ptr<AuxBookmarksSection> bookmarks_ = nullptr;
  raw_ptr<AuxChatsSection> chats_section_ = nullptr;
  raw_ptr<AuxSectionDivider> bookmarks_divider_ = nullptr;
  raw_ptr<AuxSectionDivider> chats_divider_ = nullptr;
  raw_ptr<AuxTabsSection> tabs_ = nullptr;
  raw_ptr<AuxVerticalNewTabButton> new_tab_ = nullptr;
  raw_ptr<AgentSessionTabsView> agent_ = nullptr;
  raw_ptr<CrossSectionDragPreview> preview_ = nullptr;
  std::unique_ptr<BookmarkTabAssociations> associations_;
  std::unique_ptr<AuxChatsController> chats_;
  std::unique_ptr<AuxTabsActions> actions_;
  std::unique_ptr<AuxSidebarProjection> projection_;
  std::unique_ptr<CrossSectionDragCoordinator> drag_;
  std::unique_ptr<SavedEntryDropTarget> saved_drop_;
  base::RepeatingClosure before_new_tab_;
  base::RepeatingCallback<void(bool)> running_;
  base::CallbackListSubscription new_tab_subscription_;
  uint64_t generation_ = 0;
  bool paused_ = false, retiring_ = false, bookmark_has_contents_ = false;
  bool building_ = false;
  base::WeakPtrFactory<AuxSidebarBody> weak_{this};
};
}  // namespace aux
#endif
