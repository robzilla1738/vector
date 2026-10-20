// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_BOOKMARK_DRAG_HINT_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_BOOKMARK_DRAG_HINT_H_

#include <memory>
#include <optional>
#include <string>

#include "base/memory/weak_ptr.h"
#include "base/memory/raw_ptr.h"
#include "ui/gfx/geometry/point.h"
#include "ui/gfx/geometry/rect.h"
#include "ui/views/view_tracker.h"

class VerticalPinnedTabEntriesView;
class PinnedTabContainerView;
namespace bookmarks {
class BookmarkNode;
}
namespace views {
class View;
class Widget;
}
namespace aux {
class ProfilePreviewAdmission;
struct BookmarkPinnedDropProjection {
  bool admitted = false;
  raw_ptr<const bookmarks::BookmarkNode> candidate = nullptr;
  std::optional<gfx::Rect> target_bounds;
};
// Actual 464d3f0 producer views: region, custom outer scroll5b0 and
// optional real live PinnedTabContainerView, proven +478 child+338.
gfx::Rect BookmarkPinnedDropFallbackBounds(
    const views::View& region, const views::View* outer_scroll_body,
    const PinnedTabContainerView* pinned_container);
BookmarkPinnedDropProjection UpdateBookmarkPinnedDropProjection(
    const bookmarks::BookmarkNode* node,
    const ProfilePreviewAdmission& admission, int actual_region_width,
    VerticalPinnedTabEntriesView& entries, const gfx::Point& screen_point,
    const gfx::Rect& actual_empty_fallback_bounds);

// Original region6d8 floating bookmark projection hint, distinct from the
// region6b8 CrossSectionDragPreview. Own this inside the actual region.
class BookmarkDragHint final {
 public:
  explicit BookmarkDragHint(views::View& owner);
  ~BookmarkDragHint();
  BookmarkDragHint(const BookmarkDragHint&) = delete;
  BookmarkDragHint& operator=(const BookmarkDragHint&) = delete;

  // All state comes from the actual VerticalTabBookmarksView projection.
  void Update(bool active, bool detached, const std::u16string& title,
              const gfx::Point& screen_point);
  void Hide();
  static std::u16string Text(bool detached, const std::u16string& title);
  static gfx::Rect Bounds(const gfx::Point& point, const gfx::Size& size,
                          const gfx::Rect& work_area);

 private:
  class Contents;
  bool EnsureWidget();
  views::ViewTracker owner_;
  std::unique_ptr<views::Widget> widget_;
  base::WeakPtrFactory<BookmarkDragHint> weak_factory_{this};
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_BOOKMARK_DRAG_HINT_H_
