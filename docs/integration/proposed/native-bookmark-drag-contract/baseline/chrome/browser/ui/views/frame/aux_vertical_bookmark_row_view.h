// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_BOOKMARK_ROW_VIEW_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_BOOKMARK_ROW_VIEW_H_

#include <optional>

#include "base/memory/raw_ptr.h"
#include "base/memory/raw_ref.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/ui/tabs/tab_data.h"
#include "chrome/browser/ui/views/tabs/hovercard/hover_card_anchor_target.h"
#include "ui/base/models/image_model.h"
#include "ui/views/view.h"

class TabCloseButton;
namespace bookmarks {
class BookmarkNode;
}
namespace views {
class BoxLayout;
class ImageView;
class Label;
}  // namespace views
namespace aux {
class AuxTabExpandChevronView;
class VerticalBookmarkRowView;

// Each operation is the original owning BookmarksView callback. None is a
// fallback menu, synthetic tab action or URL-derived association.
class VerticalBookmarkRowOwner {
 public:
  virtual ~VerticalBookmarkRowOwner() = default;
  virtual void BookmarkRowPressed(VerticalBookmarkRowView&,
                                  const ui::MouseEvent&) = 0;
  virtual bool BookmarkRowDragged(VerticalBookmarkRowView&,
                                  const ui::MouseEvent&) = 0;
  virtual bool BookmarkRowReleased(VerticalBookmarkRowView&,
                                   const ui::MouseEvent&) = 0;
  virtual bool BookmarkRowContext(VerticalBookmarkRowView&,
                                  const ui::MouseEvent&) = 0;
  virtual void ActivateBookmark(const bookmarks::BookmarkNode&,
                                const ui::Event&) = 0;
  virtual void CloseBookmarkTab(const bookmarks::BookmarkNode&,
                                const ui::Event&) = 0;
  virtual void BookmarkRowCaptureLost(VerticalBookmarkRowView&) = 0;
  virtual void HideBookmarkHoverCard() = 0;
  virtual void ShowBookmarkHoverCard(HoverCardAnchorTarget*) = 0;
  virtual bool BookmarkHasLiveTab(const bookmarks::BookmarkNode&) const = 0;
  virtual bool BookmarkIsDragging(const bookmarks::BookmarkNode&) const = 0;
  virtual std::optional<tabs::TabData> BookmarkHoverCardData(
      const bookmarks::BookmarkNode&) const = 0;
};

class VerticalBookmarkRowView final : public views::View,
                                      public HoverCardAnchorTarget {
  METADATA_HEADER(VerticalBookmarkRowView, views::View)
 public:
  VerticalBookmarkRowView(VerticalBookmarkRowOwner& owner,
                          const bookmarks::BookmarkNode& node,
                          int depth,
                          bool expanded);
  ~VerticalBookmarkRowView() override;
  const bookmarks::BookmarkNode& node() const { return *node_; }
  void SetNode(const bookmarks::BookmarkNode& node);
  void SetFavicon(ui::ImageModel image, bool has_favicon);
  void SetDepth(int depth);
  void SetExpanded(bool expanded);
  void SetCompact(bool compact);
  void SetActive(bool active);
  void SetHasAssociatedTab(bool associated);
  void SetHoverSuppressed(bool suppressed);
  void SetDragSelected(bool selected);
  void SetDropIndicator(int indicator);

  bool OnMousePressed(const ui::MouseEvent& event) override;
  bool OnMouseDragged(const ui::MouseEvent& event) override;
  void OnMouseReleased(const ui::MouseEvent& event) override;
  void OnMouseCaptureLost() override;
  void OnMouseEntered(const ui::MouseEvent& event) override;
  void OnMouseExited(const ui::MouseEvent& event) override;
  bool OnKeyPressed(const ui::KeyEvent& event) override;
  void Layout(PassKey) override;
  void OnBoundsChanged(const gfx::Rect& previous_bounds) override;
  void OnThemeChanged() override;
  bool NeedsToShowThumbnail() const override;
  bool IsValidHoverCardTarget() const override;
  views::BubbleAnchor GetAnchor() override;
  views::BubbleBorder::Arrow GetAnchorPosition() const override;

 protected:
  void OnPaint(gfx::Canvas* canvas) override;
  void OnPaintBackground(gfx::Canvas* canvas) override;

 private:
  void UpdateLayout();
  void UpdateAccessories();
  void UpdateColors();
  void UpdateGlyphs();
  void UpdateLayer();
  void UpdateTitle();
  void ClosePressed(const ui::Event& event);
  raw_ref<VerticalBookmarkRowOwner> owner_;
  raw_ptr<const bookmarks::BookmarkNode> node_;
  raw_ptr<views::BoxLayout> layout_ = nullptr;
  raw_ptr<views::ImageView> image_ = nullptr;
  raw_ptr<views::Label> label_ = nullptr;
  raw_ptr<AuxTabExpandChevronView> chevron_ = nullptr;
  raw_ptr<TabCloseButton> close_ = nullptr;
  int depth_;
  bool active_ = false;
  bool associated_ = false;
  bool has_favicon_ = false;
  bool hovered_ = false;
  bool pressed_ = false;
  bool expanded_;
  bool compact_ = false;
  bool hover_suppressed_ = false;
  bool drag_selected_ = false;
  int drop_indicator_ = 0;
  base::WeakPtrFactory<VerticalBookmarkRowView> weak_factory_{this};
};
}  // namespace aux
#endif
