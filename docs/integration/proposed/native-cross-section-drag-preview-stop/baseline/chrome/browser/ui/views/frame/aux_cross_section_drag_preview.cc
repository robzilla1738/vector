// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_cross_section_drag_preview.h"

#include <algorithm>
#include <cmath>
#include <memory>
#include "base/time/time.h"
#include "cc/paint/paint_flags.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/color/color_provider_key.h"
#include "ui/compositor/layer.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/geometry/rect_f.h"
#include "ui/gfx/text_constants.h"
#include "ui/views/controls/image_view.h"
#include "ui/views/controls/label.h"
#include "ui/views/style/typography.h"
#include "ui/views/widget/widget.h"

namespace aux {
namespace {
bool Dark(const views::View& view) {
  return view.GetWidget() && view.GetWidget()->GetColorMode() ==
      ui::ColorProviderKey::ColorMode::kDark;
}
}  // namespace

CrossSectionDragPreview::CrossSectionDragPreview() {
  // Original4634874: transparent layer, no input, ImageView16, Label context5.
  SetPaintToLayer();
  layer()->SetFillsBoundsOpaquely(false);
  SetCanProcessEventsWithinSubtree(false);
  image_ = AddChildView(std::make_unique<views::ImageView>());
  image_->SetImageSize(gfx::Size(16, 16));
  label_ = AddChildView(std::make_unique<views::Label>(
      u"", views::style::CONTEXT_LABEL, views::style::STYLE_PRIMARY));
  label_->SetHorizontalAlignment(gfx::ALIGN_TO_HEAD);
  label_->SetElideBehavior(gfx::FADE_TAIL);
  label_->SetAutoColorReadabilityEnabled(false);
  label_->SetSubpixelRenderingEnabled(false);
  label_->SetPaintToLayer();
  label_->layer()->SetFillsBoundsOpaquely(false);
  animation_.SetSlideDuration(gfx::Animation::PrefersReducedMotion()
      ? base::TimeDelta() : base::Milliseconds(170));
  animation_.SetTweenType(gfx::Tween::FAST_OUT_SLOW_IN);
  SetVisible(false);
}
CrossSectionDragPreview::~CrossSectionDragPreview() = default;

void CrossSectionDragPreview::Update(
    const std::u16string& title, const ui::ImageModel& image,
    const gfx::Rect& source_bounds, const gfx::Rect& target_bounds,
    bool target_is_pinned_tile) {
  // Original4651140 updates the real content before its bounds/morph state.
  if (label_->GetText() != title) label_->SetText(title);
  image_->SetImage(image);
  const double target = target_is_pinned_tile ? 0 : 1;
  if (!GetVisible()) {
    SetVisible(true);
    SetBoundsRect(source_bounds);
    morph_ = 1 - target;
  } else if (target_morph_ == target) {
    if (target_bounds_ == target_bounds) return;
    target_bounds_ = target_bounds;
    // Moving the same destination while animating does not restart the clock.
    if (animation_.is_animating()) return;
    SetBoundsRect(target_bounds_);
    morph_ = target;
    InvalidateLayout();
    SchedulePaint();
    return;
  }
  start_bounds_ = bounds();
  target_bounds_ = target_bounds;
  start_morph_ = morph_;
  target_morph_ = target;
  animation_.Reset(0);
  animation_.Show();
  ApplyAnimation();
}

void CrossSectionDragPreview::Hide() {
  // Original drop/exit hides the retained preview; it is not destroyed.
  SetVisible(false);
}

void CrossSectionDragPreview::Layout(PassKey) {
  // Original465af70: interpolate centered icon to left8, fixed label origin32.
  const int centered = (width() - 16) / 2;
  const int x = static_cast<int>(std::floor(
      centered + morph_ * (8 - centered) + 0.5));
  image_->SetBounds(x, (height() - 16) / 2, 16, 16);
  label_->SetBounds(32, 0, std::max(0, width() - 40), std::max(0, height()));
  label_->layer()->SetOpacity(static_cast<float>(morph_));
}

void CrossSectionDragPreview::OnPaint(gfx::Canvas* canvas) {
  if (!GetColorProvider()) return;
  const bool dark = Dark(*this);
  // Original465b0e0 switches fill at morph0.5; it does not crossfade fills.
  cc::PaintFlags fill;
  fill.setAntiAlias(true);
  fill.setColor(morph_ >= 0.5 ? (dark ? 0x14fafafa : 0xffffffff)
                            : (dark ? 0x0ffafafa : 0xd9ffffff));
  gfx::RectF rect(GetLocalBounds());
  canvas->DrawRoundRect(rect, 10, fill);
  cc::PaintFlags stroke;
  stroke.setAntiAlias(true);
  stroke.setStyle(cc::PaintFlags::kStroke_Style);
  stroke.setStrokeWidth(0.5f);
  stroke.setColor(dark ? 0x33fafafa : 0x260a0a0a);
  rect.Inset(0.5f);
  canvas->DrawRoundRect(rect, 10, stroke);
}

void CrossSectionDragPreview::OnThemeChanged() {
  views::View::OnThemeChanged();
  label_->SetEnabledColor(Dark(*this) ? 0xa6fafafa : 0xb80a0a0a);
  SchedulePaint();
}

void CrossSectionDragPreview::ApplyAnimation() {
  const double value = animation_.GetCurrentValue();
  SetBoundsRect(gfx::Tween::RectValueBetween(value, start_bounds_, target_bounds_));
  morph_ = gfx::Tween::DoubleValueBetween(value, start_morph_, target_morph_);
  InvalidateLayout();
  SchedulePaint();
}
void CrossSectionDragPreview::AnimationProgressed(const gfx::Animation* animation) {
  if (animation == &animation_) ApplyAnimation();
}
void CrossSectionDragPreview::AnimationEnded(const gfx::Animation* animation) {
  if (animation == &animation_) ApplyAnimation();
}
void CrossSectionDragPreview::AnimationCanceled(const gfx::Animation* animation) {
  if (animation == &animation_) ApplyAnimation();
}
BEGIN_METADATA(CrossSectionDragPreview)
END_METADATA
}  // namespace aux
