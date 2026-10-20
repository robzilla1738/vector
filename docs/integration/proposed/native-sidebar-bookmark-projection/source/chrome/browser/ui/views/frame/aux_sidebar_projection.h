// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SIDEBAR_PROJECTION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SIDEBAR_PROJECTION_H_
#include <memory>
#include <set>
#include "base/callback_list.h"
#include "base/functional/callback.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/raw_ref.h"
#include "base/memory/weak_ptr.h"
#include "base/scoped_observation.h"
#include "chrome/browser/ui/tabs/tab_strip_model_observer.h"
#include "components/bookmarks/browser/bookmark_model_observer.h"
#include "components/prefs/pref_change_registrar.h"
#include "components/tabs/public/tab_interface.h"
#include "ui/views/view_tracker.h"
class BrowserWindowInterface;
class Profile;
class TabCollectionNode;
class TabHoverCardController;
class TabStripModel;
class VerticalPinnedTabEntriesView;
namespace bookmarks { class BookmarkModel; }
namespace aux {
class AgentSessionTabsView;
class AuxChatsController;
class AuxOrdinaryTabProjection;
class BookmarkTabAssociations;
class VerticalTabBookmarksView;
// Source462c2c0: publishes the real region caches to the genuine sections and
// applies the actual collection visibility graph. Adds no model or View.
class AuxSidebarProjection final : public TabStripModelObserver,
                                   public bookmarks::BookmarkModelObserver {
 public:
  AuxSidebarProjection(BrowserWindowInterface&, BookmarkTabAssociations&,
      VerticalTabBookmarksView&, AuxChatsController&,
      VerticalPinnedTabEntriesView&, TabHoverCardController&,
      AgentSessionTabsView&, TabCollectionNode&, base::RepeatingClosure changed);
  ~AuxSidebarProjection() override;
  // Call after all genuine children have been mounted. This installs the real
  // Chats projection callback, model/pref observers, then reconciles once.
  void Start();
  void Refresh();
  void QueueRefresh();
  // Original b90/b92 lifecycle. Only the actual metadata transfer owner calls
  // these; ordinary live state starts false as in the source constructor.
  void BeginMetadataCapture();
  void DidRestoreMetadata();
  void FinishMetadataTransfer();
  // Retire before browser/profile identity or owned-child destruction. A new
  // current-profile instance observes the actual restored model afterward.
  void Retire();
  const std::set<tabs::TabHandle>& pending_bookmark_tab_handles() const {
    return handles_fb0_;
  }
 private:
  bool ScopeCurrent() const;
  bool BookmarkRepresents(const tabs::TabInterface&) const;
  void PublishBookmarks();
  void BindOrRetainPending(tabs::TabInterface*);
  void OnTabStripModelChanged(TabStripModel*, const TabStripModelChange&,
                             const TabStripSelectionChange&) override;
  void OnTabChangedAt(tabs::TabInterface*, TabChangeType) override;
  void OnTabStripModelDestroyed(TabStripModel*) override;
  void TabGroupedStateChanged(TabStripModel*, std::optional<tab_groups::TabGroupId>,
      std::optional<tab_groups::TabGroupId>, tabs::TabInterface*, int) override;
  void OnTabGroupChanged(const TabGroupChange&) override;
  void OnSplitTabChanged(const SplitTabChange&) override;
  void BookmarkModelLoaded(bool) override;
  void BookmarkModelBeingDeleted() override;
  void BookmarkNodeMoved(const bookmarks::BookmarkNode*, size_t,
                        const bookmarks::BookmarkNode*, size_t) override;
  void BookmarkNodeAdded(const bookmarks::BookmarkNode*, size_t, bool) override;
  void BookmarkNodeRemoved(const bookmarks::BookmarkNode*, size_t,
      const bookmarks::BookmarkNode*, const std::set<GURL>&,
      const base::Location&) override;
  void BookmarkNodeChanged(const bookmarks::BookmarkNode*) override;
  void BookmarkNodeFaviconChanged(const bookmarks::BookmarkNode*) override;
  void BookmarkNodeChildrenReordered(const bookmarks::BookmarkNode*) override;
  void BookmarkAllUserNodesRemoved(const std::set<GURL>&,
                                  const base::Location&) override;
  base::WeakPtr<BrowserWindowInterface> browser_;
  base::WeakPtr<Profile> profile_;
  raw_ptr<TabStripModel> model_;
  raw_ptr<TabCollectionNode> root_;
  const raw_ref<BookmarkTabAssociations> associations_;
  const raw_ref<VerticalTabBookmarksView> bookmarks_;
  const raw_ref<AuxChatsController> chats_;
  const raw_ref<AgentSessionTabsView> agent_;
  views::ViewTracker bookmark_tracker_, agent_tracker_, pin_tracker_;
  std::unique_ptr<AuxOrdinaryTabProjection> ordinary_;
  base::RepeatingClosure changed_;
  PrefChangeRegistrar prefs_;
  base::ScopedObservation<bookmarks::BookmarkModel,
                          bookmarks::BookmarkModelObserver> bookmark_model_{this};
  base::CallbackListSubscription root_destroyed_;
  // Original fb0: real Insert/Replace with an unmatched pending navigation.
  // A successful bind erases the handle; an empty queue clears the set.
  std::set<tabs::TabHandle> handles_fb0_;
  bool started_ = false, retired_ = false, refreshing_ = false, queued_ = false;
  bool metadata_capture_ = false, model_changed_during_capture_ = false,
       restored_metadata_ = false; // b90 / b91 / b92.
  base::WeakPtrFactory<AuxSidebarProjection> weak_{this};
};
}  // namespace aux
#endif
