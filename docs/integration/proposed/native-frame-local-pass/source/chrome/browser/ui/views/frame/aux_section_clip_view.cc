// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_section_clip_view.h"

#include <algorithm>
#include <utility>
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/compositor/layer.h"

namespace aux {
AuxSectionClipView::AuxSectionClipView(std::unique_ptr<views::View> child) {
  SetPaintToLayer();
  layer()->SetFillsBoundsOpaquely(false);
  layer()->SetMasksToBounds(true);
  child_ = AddChildView(std::move(child));
}
AuxSectionClipView::~AuxSectionClipView() = default;
void AuxSectionClipView::SetHeights(std::optional<int> preferred,
                                   std::optional<int> content) {
  const bool preferred_changed = preferred_height_ != preferred;
  const bool content_changed = content_height_ != content;
  if (!preferred_changed && !content_changed) return;
  preferred_height_ = preferred;
  content_height_ = content;
  if (preferred_changed) PreferredSizeChanged();
  if (content_changed) InvalidateLayout();
}
gfx::Size AuxSectionClipView::CalculatePreferredSize(const views::SizeBounds&) const {
  if (preferred_height_) return gfx::Size(0, std::max(0, *preferred_height_));
  if (!preferred_child_size_) preferred_child_size_ = child_->GetPreferredSize();
  return *preferred_child_size_;
}
void AuxSectionClipView::Layout(PassKey) {
  int content_height;
  if (content_height_) content_height = *content_height_;
  else {
    if (!layout_child_size_) layout_child_size_ = child_->GetPreferredSize();
    content_height = layout_child_size_->height();
  }
  child_->SetBounds(0, 0, std::max(0, width()), std::max(0, content_height));
}
void AuxSectionClipView::InvalidateChildSize() {
  preferred_child_size_.reset();
  layout_child_size_.reset();
  InvalidateLayout();
}
void AuxSectionClipView::ChildPreferredSizeChanged(views::View*) {
  preferred_child_size_.reset();
  layout_child_size_.reset();
  if (!content_height_) InvalidateLayout();
  // With no animated height override, the section's preferred height comes
  // from this child. Propagate changes to the outer sidebar layout/cache.
  if (!preferred_height_) PreferredSizeChanged();
}
void AuxSectionClipView::ViewHierarchyChanged(
    const views::ViewHierarchyChangedDetails& details) {
  views::View::ViewHierarchyChanged(details);
  if (details.child == this || details.child == child_) InvalidateChildSize();
}
BEGIN_METADATA(AuxSectionClipView)
END_METADATA
}  // namespace aux
