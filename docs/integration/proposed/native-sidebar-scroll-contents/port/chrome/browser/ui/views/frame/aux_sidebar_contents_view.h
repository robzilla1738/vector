// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SIDEBAR_CONTENTS_VIEW_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SIDEBAR_CONTENTS_VIEW_H_
#include <map>
#include <optional>
#include "base/functional/callback.h"
#include "ui/base/metadata/metadata_header_macros.h"
#include "ui/views/view.h"
namespace views { class ScrollView; }
namespace aux {
// Original region5c0 anonymous View (e724750). The inherited original metadata
// did not identify its real width cache, child invalidations or mouse callback.
class SidebarContentsView final : public views::View {
  METADATA_HEADER(SidebarContentsView, views::View)
 public:
  using RightClick = base::RepeatingCallback<void(views::View*, const ui::MouseEvent&)>;
  explicit SidebarContentsView(RightClick right_click);
  ~SidebarContentsView() override;
  bool OnMousePressed(const ui::MouseEvent&) override;
  gfx::Size CalculatePreferredSize(const views::SizeBounds&) const override;
  void ChildPreferredSizeChanged(views::View*) override;
  void ChildVisibilityChanged(views::View*) override;
  void ViewHierarchyChanged(const views::ViewHierarchyChangedDetails&) override;
 private:
  void ClearSizeCache();
  RightClick right_click_;
  mutable std::map<std::optional<int>, gfx::Size> preferred_sizes_;
};
// Applies only source-proven generic outer5b0 properties. Caller still owns its
// actual VerticalTabStripScrollView input owner and real vertical scrollbar.
void ConfigureSidebarContentsScrollView(views::ScrollView& scroll);
}  // namespace aux
#endif
