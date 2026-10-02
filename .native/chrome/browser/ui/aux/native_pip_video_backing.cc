// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_pip_video_backing.h"
#include <cmath>
#include "ui/compositor/layer.h"
#include "ui/compositor/layer_solid_color.h"
#include "ui/views/view.h"
#include "ui/views/widget/widget.h"
namespace aux {
std::optional<NativePipSolidBacking> ReadNativePipSolidBackingView(
    views::Widget* widget, views::View* background) {
  if (!widget || !widget->IsVisible() || !background || background->GetWidget() != widget ||
      !background->IsDrawn() || !background->layer()) return std::nullopt;
  const gfx::Rect frame = widget->GetWindowBoundsInScreen();
  if (frame.IsEmpty() || background->GetBoundsInScreen() != frame) return std::nullopt;
  auto* solid = background->layer()->AsSolidColor();
  if (!solid || !solid->IsShowingSolidColorContent() ||
      solid->bounds() != gfx::Rect(background->size())) return std::nullopt;
  const auto color = solid->background_color();
  if (!std::isfinite(color.fR) || !std::isfinite(color.fG) || !std::isfinite(color.fB) ||
      color.fR < 0 || color.fR > 1 || color.fG < 0 || color.fG > 1 ||
      color.fB < 0 || color.fB > 1 || color.fA != 1) return std::nullopt;
  // Every compositor ancestor must actually preserve the full installed fill.
  // Never infer solid material from opacity, a default color, a gradient, or a
  // reflected subtree. Unknown masks/transforms/clips remain diagnostic-only.
  bool root = false;
  unsigned depth = 0;
  for (const ui::Layer* layer = solid; layer && depth++ < 64; layer = layer->parent()) {
    if (!layer->visible() || layer->opacity() != 1 || !layer->transform().IsIdentity() ||
        layer->layer_mask_layer() || !layer->gradient_mask().IsEmpty() ||
        !layer->rounded_corner_radii().IsEmpty() ||
        (!layer->clip_rect().IsEmpty() && !layer->clip_rect().Contains(gfx::Rect(frame.size())))) return std::nullopt;
    if (layer->bounds().width() < frame.width() || layer->bounds().height() < frame.height()) return std::nullopt;
    if (layer == widget->GetLayer()) { root = true; break; }
    if (!layer->bounds().origin().IsOrigin()) return std::nullopt;
  }
  if (!root) return std::nullopt;
  return NativePipSolidBacking{reinterpret_cast<uintptr_t>(background),
      reinterpret_cast<uintptr_t>(solid), frame, color};
}
}  // namespace aux
