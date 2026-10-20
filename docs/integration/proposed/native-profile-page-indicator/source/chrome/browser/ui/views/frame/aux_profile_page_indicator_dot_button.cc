// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/views/frame/aux_profile_page_indicator_dot_button.h"

#include <utility>

#include "base/numerics/clamped_math.h"
#include "cc/paint/paint_flags.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/color/color_provider_key.h"
#include "ui/compositor/layer.h"
#include "ui/events/event.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/geometry/point_conversions.h"
#include "ui/gfx/paint_vector_icon.h"
#include "ui/gfx/scoped_canvas.h"
#include "ui/views/widget/widget.h"

namespace aux {

ProfilePageIndicatorDotButton::ProfilePageIndicatorDotButton(
    PressedCallback pressed,
    ButtonCallback context_menu,
    ButtonCallback drag_started,
    DragUpdateCallback drag_updated,
    DragEndCallback drag_ended)
    : views::Button(std::move(pressed)),
      context_menu_(std::move(context_menu)),
      drag_started_(std::move(drag_started)),
      drag_updated_(std::move(drag_updated)),
      drag_ended_(std::move(drag_ended)) {
  SetAnimateOnStateChange(false);
  SetFocusBehavior(FocusBehavior::ACCESSIBLE_ONLY);
  SetPaintToLayer();
  layer()->SetFillsBoundsOpaquely(false);
}

ProfilePageIndicatorDotButton::~ProfilePageIndicatorDotButton() = default;

void ProfilePageIndicatorDotButton::SetCurrent(bool current) {
  if (current_ == current) {
    return;
  }
  current_ = current;
  SchedulePaint();
}

void ProfilePageIndicatorDotButton::SetProfileIcon(
    const gfx::VectorIcon* icon) {
  if (icon_ == icon) {
    return;
  }
  icon_ = icon;
  SchedulePaint();
}

void ProfilePageIndicatorDotButton::SetDragHighlight(bool highlighted) {
  drag_highlight_ = highlighted;
  SchedulePaint();
}

gfx::Size ProfilePageIndicatorDotButton::CalculatePreferredSize(
    const views::SizeBounds& available_size) const {
  return gfx::Size(24, 24);
}

bool ProfilePageIndicatorDotButton::OnMousePressed(
    const ui::MouseEvent& event) {
  if (event.IsOnlyRightMouseButton() && context_menu_) {
    context_menu_.Run(this);
    return true;
  }
  if (!event.IsOnlyLeftMouseButton()) {
    return false;
  }
  pressed_ = true;
  pressed_local_ = gfx::ToFlooredPoint(event.location_f());
  pressed_parent_ = pressed_local_;
  if (parent()) {
    views::View::ConvertPointToTarget(this, parent(), &pressed_parent_);
  }
  SetState(STATE_PRESSED);
  return true;
}

bool ProfilePageIndicatorDotButton::OnMouseDragged(
    const ui::MouseEvent& event) {
  if (!pressed_ || !event.IsOnlyLeftMouseButton() || !parent()) {
    return false;
  }
  auto point = gfx::ToFlooredPoint(event.location_f());
  views::View::ConvertPointToTarget(this, parent(), &point);
  if (!dragging_) {
    const int x = base::ClampSub(point.x(), pressed_parent_.x());
    const int y = base::ClampSub(point.y(), pressed_parent_.y());
    if (x >= -8 && x <= 8 && y >= -8 && y <= 8) {
      return false;
    }
    dragging_ = true;
    if (drag_started_) {
      drag_started_.Run(this);
    }
  }
  if (drag_updated_) {
    drag_updated_.Run(this, point, pressed_local_);
  }
  return true;
}

void ProfilePageIndicatorDotButton::OnMouseReleased(
    const ui::MouseEvent& event) {
  if (!pressed_) {
    return;
  }
  const bool was_dragging = dragging_;
  pressed_local_ = gfx::Point();
  pressed_parent_ = gfx::Point();
  pressed_ = false;
  dragging_ = false;
  if (was_dragging) {
    if (drag_ended_) {
      drag_ended_.Run(this, DragEnd::kReleased);
    }
    return;
  }
  const bool inside = HitTestPoint(gfx::ToFlooredPoint(event.location_f()));
  SetState(inside ? STATE_HOVERED : STATE_NORMAL);
  if (event.IsOnlyLeftMouseButton() && inside) {
    NotifyClick(event);
  }
}

void ProfilePageIndicatorDotButton::OnMouseCaptureLost() {
  const bool was_dragging = dragging_;
  pressed_local_ = gfx::Point();
  pressed_parent_ = gfx::Point();
  pressed_ = false;
  dragging_ = false;
  SetState(STATE_NORMAL);
  if (was_dragging && drag_ended_) {
    drag_ended_.Run(this, DragEnd::kCaptureLost);
    return;
  }
  views::Button::OnMouseCaptureLost();
}

void ProfilePageIndicatorDotButton::PaintButtonContents(gfx::Canvas* canvas) {
  const bool dark =
      GetWidget()->GetColorMode() == ui::ColorProviderKey::ColorMode::kDark;
  cc::PaintFlags flags;
  flags.setAntiAlias(true);
  if (drag_highlight_ || GetState() == STATE_HOVERED ||
      GetState() == STATE_PRESSED) {
    // Original247 aliases220; both hover and pressed use the same recipe.
    flags.setColor(dark ? 0x14fafafa : 0x140a0a0a);
    canvas->DrawRoundRect(gfx::RectF(GetLocalBounds()), 8, flags);
  }
  const SkColor foreground =
      current_ ? (dark ? 0xd9fafafa : 0xd90a0a0a)   // Original221.
               : (dark ? 0x73fafafa : 0x730a0a0a);  // Original226.
  if (icon_) {
    gfx::ScopedCanvas scoped(canvas);
    canvas->Translate(gfx::Vector2d(5, 5));
    gfx::PaintVectorIcon(canvas, *icon_, 14, foreground);
    return;
  }
  flags.setColor(foreground);
  // Original df47a90 is SkRect ltrb(-3,-3,3,3), not a 6px offset.
  canvas->DrawOval(gfx::RectF(width() / 2 - 3, height() / 2 - 3, 6, 6), flags);
}

BEGIN_METADATA(ProfilePageIndicatorDotButton)
END_METADATA

}  // namespace aux
