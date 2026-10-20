// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_TAB_BOOKMARKS_VIEW_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_TAB_BOOKMARKS_VIEW_H_
#include <map>
#include <memory>
#include <optional>
#include <string>
#include <vector>
#include "chrome/browser/ui/tabs/aux_bookmark_tab_representation.h"
#include "chrome/browser/ui/views/frame/aux_bookmark_drag_callbacks.h"
#include "components/tabs/public/tab_interface.h"
#include "ui/views/controls/scroll_view.h"
#include "url/gurl.h"
class BrowserWindowInterface;
class TabStripModel;
class TabHoverCardController;
namespace bookmarks {
class BookmarkModel;
class BookmarkNode;
}  // namespace bookmarks
namespace tabs {
class VerticalTabStripStateController;
}
namespace aux {
// The supplied VerticalTabBookmarksView, adapted to Chromium155's public
// TabInterface and observation APIs. The genuine region owns its callbacks.
class VerticalTabBookmarksView final : public views::ScrollView {
  METADATA_HEADER(VerticalTabBookmarksView, views::ScrollView)
 public:
  VerticalTabBookmarksView(BrowserWindowInterface* browser,
                           TabStripModel* model,
                           TabHoverCardController* hover_card_controller,
                           tabs::VerticalTabStripStateController* state);
  ~VerticalTabBookmarksView() override;
  void SetProjectionChangedCallback(BookmarkDragProjectionChangedCallback);
  void SetDragCallbacks(BookmarkDragBeginCallback,
                        BookmarkDragDetachedCallback,
                        BookmarkDragFinishedCallback);
  void SetContentsChangedCallback(base::RepeatingCallback<void(bool)>);
  void SetActivatedCallback(base::RepeatingClosure);
  void SetActiveBookmark(std::optional<int64_t>, bool show_selection);
  void SetExcludedUrls(std::vector<GURL>);
  void SetCompact(bool compact);
  void SetFoldersOnly(bool folders_only);
  void SetBookmarkTabAssociations(
      std::map<tabs::TabHandle, BookmarkTabRepresentation> associations);
  const bookmarks::BookmarkNode* FindNode(int64_t id) const;
  bookmarks::BookmarkModel* bookmark_model() const;
  std::optional<tabs::TabHandle> GetAssociatedTabHandle(
      const bookmarks::BookmarkNode&) const;
  // Original pending-navigation queue461becc/46142cc, distinct from ownership.
  bool TakePendingNavigation(const GURL&, BookmarkTabRepresentation*);
  bool HasPendingNavigation() const;
  // Genuine saved-entry callbacks462b5c0/462ba98. Coordinates are SCREEN.
  // Independent from a Bookmark row's internal drag and live-tab ownership.
  std::optional<gfx::Rect> UpdateExternalBookmarkInsertion(
      const GURL&,
      const std::u16string&,
      const gfx::Point& screen_point);
  void ClearExternalBookmarkInsertion(bool animate);
  const bookmarks::BookmarkNode* CommitExternalBookmark(const GURL&,
                                                        std::u16string title);
  bool drag_projection_active() const;
  bool drag_projection_detached() const;
  const gfx::Point& drag_screen_point() const;
  const std::u16string& drag_title() const;
  const bookmarks::BookmarkNode* dragged_node() const;
  void CancelDrag();
  // Chromium155 rebinds a BWI during same-window profile transfer. Retire this
  // original profile-bound owner before that boundary; create a fresh owner
  // with the genuine target BookmarkModel/TabStripModel afterward.
  void RetireForProfileChange();

 private:
  class Impl;
  std::unique_ptr<Impl> impl_;
};
}  // namespace aux
#endif
