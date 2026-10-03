// Copyright 2026 The Aux Authors
#include "components/viz/service/display/native_stock_root_coverage.h"
#include <cmath>
#include <vector>
#include <utility>
#include "components/viz/common/quads/aggregated_render_pass.h"
#include "components/viz/common/quads/solid_color_draw_quad.h"
namespace viz {
bool NativeStockRootHasFullCoverage(const AggregatedRenderPass& actual) {
  if (actual.output_rect.IsEmpty() || actual.output_rect.origin() != gfx::Point() ||
      !actual.transform_to_root_target.IsIdentity()) return false;
  constexpr size_t kMaxParts = 512;
  std::vector<gfx::Rect> missing{actual.output_rect};
  size_t seen = 0;
  for (const auto* quad : actual.quad_list) {
    if (++seen > kMaxParts) return false;
    const auto* color = quad->DynamicCast<SolidColorDrawQuad>();
    const auto* state = quad->shared_quad_state.get();
    // Unknown/destructive composition can erase previously counted backing.
    // Skipping such a foreground quad would turn a full bounding box into a
    // false full-root proof. Only ordinary source-over composition is admitted.
    if (!state || state->blend_mode != SkBlendMode::kSrcOver) return false;
    // Unsupported quads cannot fill a hole. A genuine unmasked integer solid
    // backing may establish coverage while foreground controls paint above it.
    if (!color || state->opacity != 1.0f ||
        !state->quad_to_target_transform.IsIdentity() ||
        !state->mask_filter_info.IsEmpty() || state->mask_filter_info.gradient_mask().has_value() ||
        state->mask_filter_info.clip_id().has_value() ||
        state->sorting_context_id ||
        color->color.fA != 1.0f || !std::isfinite(color->color.fR) ||
        !std::isfinite(color->color.fG) || !std::isfinite(color->color.fB) ||
        !quad->rect.Contains(quad->visible_rect)) continue;
    gfx::Rect visible = quad->visible_rect;
    if (state->clip_rect) visible.Intersect(*state->clip_rect);
    visible.Intersect(actual.output_rect);
    if (visible.IsEmpty()) continue;
    std::vector<gfx::Rect> next;
    for (const auto& hole : missing) {
      const auto cut = gfx::IntersectRects(hole, visible);
      if (cut.IsEmpty()) { next.push_back(hole); }
      else {
        if (cut.y() > hole.y()) next.emplace_back(hole.x(), hole.y(), hole.width(), cut.y() - hole.y());
        if (cut.bottom() < hole.bottom()) next.emplace_back(hole.x(), cut.bottom(), hole.width(), hole.bottom() - cut.bottom());
        if (cut.x() > hole.x()) next.emplace_back(hole.x(), cut.y(), cut.x() - hole.x(), cut.height());
        if (cut.right() < hole.right()) next.emplace_back(cut.right(), cut.y(), hole.right() - cut.right(), cut.height());
      }
      if (next.size() > kMaxParts) return false;
    }
    missing = std::move(next);
    // Keep scanning to enforce the bound on the entire actual root pass.
  }
  return missing.empty();
}
}  // namespace viz
