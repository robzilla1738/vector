// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CROSS_SECTION_DRAG_PREVIEW_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CROSS_SECTION_DRAG_PREVIEW_H_

#include <string>
#include "base/memory/raw_ptr.h"
#include "ui/base/models/image_model.h"
#include "ui/gfx/animation/animation_delegate.h"
#include "ui/gfx/animation/slide_animation.h"
#include "ui/gfx/geometry/rect.h"
#include "ui/views/view.h"

namespace views { class ImageView; class Label; }
namespace aux {

// Original VerticalTabStripRegionView::CrossSectionDragPreview. The region
// supplies real source/target rectangles in its own coordinate space.
class CrossSectionDragPreview final : public views::View,
                                     public gfx::AnimationDelegate {
  METADATA_HEADER(CrossSectionDragPreview, views::View)
 public:
  CrossSectionDragPreview();
  ~CrossSectionDragPreview() override;
  void Update(const std::u16string& title, const ui::ImageModel& image,
              const gfx::Rect& source_bounds, const gfx::Rect& target_bounds,
              bool target_is_pinned_tile);
  void Hide();

 protected:
  void Layout(PassKey) override;
  void OnPaint(gfx::Canvas*) override;
  void OnThemeChanged() override;
  void AnimationProgressed(const gfx::Animation*) override;
  void AnimationEnded(const gfx::Animation*) override;
  void AnimationCanceled(const gfx::Animation*) override;

 private:
  void ApplyAnimation();
  raw_ptr<views::ImageView> image_ = nullptr;
  raw_ptr<views::Label> label_ = nullptr;
  gfx::SlideAnimation animation_{this};
  gfx::Rect start_bounds_;
  gfx::Rect target_bounds_;
  double start_morph_ = 0;
  double target_morph_ = 0;
  double morph_ = 0;
};
}  // namespace aux
#endif
