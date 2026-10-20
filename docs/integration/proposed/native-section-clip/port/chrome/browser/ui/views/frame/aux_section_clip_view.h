// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SECTION_CLIP_VIEW_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SECTION_CLIP_VIEW_H_

#include <memory>
#include <optional>
#include "base/memory/raw_ptr.h"
#include "ui/views/view.h"

namespace aux {
// Supplied AsideSectionClipView4666440: keep the full child painted under the
// genuinely animated clip height. Expansion remains owned by the section.
class AuxSectionClipView : public views::View {
  METADATA_HEADER(AuxSectionClipView, views::View)
 public:
  explicit AuxSectionClipView(std::unique_ptr<views::View> child);
  ~AuxSectionClipView() override;
  views::View* contents() const { return child_; }
  void SetHeights(std::optional<int> preferred, std::optional<int> content);
  gfx::Size CalculatePreferredSize(const views::SizeBounds&) const override;
  void Layout(PassKey) override;
 protected:
  void ChildPreferredSizeChanged(views::View* child) override;
  void ViewHierarchyChanged(const views::ViewHierarchyChangedDetails&) override;
 private:
  void InvalidateChildSize();
  raw_ptr<views::View> child_ = nullptr;
  std::optional<int> preferred_height_;
  std::optional<int> content_height_;
  mutable std::optional<gfx::Size> preferred_child_size_;
  std::optional<gfx::Size> layout_child_size_;
};
}  // namespace aux
#endif
