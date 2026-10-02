// Copyright 2026 The Aux Authors
#include "components/viz/service/display/native_guest_inclusion_receipt.h"
#include <algorithm>
#include <cmath>
#include <utility>
#include "cc/base/math_util.h"
namespace viz {
std::optional<gfx::Rect> NativeGuestFullCoverage(const gfx::Rect& child,
    const gfx::Rect& visible, const gfx::Transform& transform,
    const std::optional<gfx::Rect>& clip, const std::optional<gfx::Rect>& added_clip,
    bool masked) {
  if (masked || child.IsEmpty() || visible != child || !transform.Preserves2dAxisAlignment())
    return std::nullopt;
  const auto full = cc::MathUtil::MapEnclosingClippedRect(transform, child);
  auto covered = full;
  if (clip) covered.Intersect(*clip);
  if (added_clip) covered.Intersect(*added_clip);
  if (full.IsEmpty() || covered != full) return std::nullopt;
  return full;
}

NativeGuestInclusionReceipt::NativeGuestInclusionReceipt(NativeGuestInclusionScope scope)
    : scope_(std::move(scope)) {
  invalid_ = !scope_.display_sink.is_valid() || !scope_.shell_sink.is_valid() ||
      !scope_.mutation_shell_token || scope_.guests.size() > 4 || scope_.shapes.size() != scope_.guests.size() ||
      scope_.input.is_null() || scope_.mutation < scope_.input ||
      scope_.shell_submission < scope_.mutation || !base::TimeTicks::IsConsistentAcrossProcesses();
  switch (scope_.kind) {
    case NativeInclusionScopeKind::kGuestStage:
      // Original guest policy: no empty guests and no borrowed startup fields.
      invalid_ |= scope_.guests.empty() || scope_.startup_shell.has_value() ||
          !scope_.startup_shell_size.IsEmpty() || !scope_.startup_shell_bounds.IsEmpty();
      break;
    case NativeInclusionScopeKind::kShellStartup:
      invalid_ |= !scope_.guests.empty() || !scope_.shapes.empty() ||
          !scope_.startup_shell || !scope_.startup_shell->is_valid() ||
          scope_.startup_shell->frame_sink_id() != scope_.shell_sink ||
          scope_.display_sink == scope_.shell_sink ||
          scope_.startup_shell_size.IsEmpty() || scope_.startup_shell_bounds.IsEmpty();
      break;
    default:
      invalid_ = true;
  }
  for (size_t i = 0; i < scope_.guests.size(); ++i) {
    if (i < scope_.shapes.size()) {
      const auto& shape = scope_.shapes[i];
      if (shape.surface != scope_.guests[i] || shape.inner_in_shell_pixels.IsEmpty() ||
          shape.pane_in_shell_pixels.IsEmpty() || !std::isfinite(shape.radius) ||
          shape.radius < 0 || 2 * shape.radius > std::min(shape.pane_in_shell_pixels.width(), shape.pane_in_shell_pixels.height()) ||
          !std::isfinite(shape.pane_in_shell_pixels.x()) || !std::isfinite(shape.pane_in_shell_pixels.y()) ||
          !std::isfinite(shape.pane_in_shell_pixels.width()) || !std::isfinite(shape.pane_in_shell_pixels.height()) ||
          !shape.pane_in_shell_pixels.Contains(gfx::RectF(shape.inner_in_shell_pixels))) invalid_ = true;
    }
    if (!scope_.guests[i].is_valid() || scope_.guests[i].frame_sink_id() == scope_.shell_sink ||
        scope_.guests[i].frame_sink_id() == scope_.display_sink) invalid_ = true;
    for (size_t j = 0; j < i; ++j)
      if (scope_.guests[j].frame_sink_id() == scope_.guests[i].frame_sink_id()) invalid_ = true;
  }
}
NativeGuestInclusionReceipt::~NativeGuestInclusionReceipt() = default;
void NativeGuestInclusionReceipt::BindShellPlacement(const SurfaceId& shell,
    uint32_t token, const gfx::Rect& full, const gfx::Transform& transform,
    const std::optional<gfx::Rect>& clip, bool masked) {
  if (invalid_ || consumed_ || shell.frame_sink_id() != scope_.shell_sink) return;
  if (scope_.kind == NativeInclusionScopeKind::kShellStartup &&
      (scope_.startup_shell != shell || full != gfx::Rect(scope_.startup_shell_size))) {
    invalid_ = true; return;
  }
  if (!shell.is_valid() || token != scope_.mutation_shell_token ||
      !transform.IsScaleOrTranslation() ||
      !NativeGuestFullCoverage(full, full, transform, clip, std::nullopt, masked) ||
      (shell_to_root_ && *shell_to_root_ != transform)) { invalid_ = true; return; }
  for (const auto& shape : scope_.shapes)
    if (!gfx::RectF(full).Contains(shape.pane_in_shell_pixels)) { invalid_ = true; return; }
  if (scope_.kind == NativeInclusionScopeKind::kShellStartup &&
      NativeGuestFullCoverage(full, full, transform, clip, std::nullopt, masked) !=
          scope_.startup_shell_bounds) { invalid_ = true; return; }
  shell_to_root_ = transform;
  const auto coverage = NativeGuestFullCoverage(full, full, transform, clip, std::nullopt, false);
  const auto prior = std::ranges::find_if(coverage_proofs_, [&](const NativeDrawnGuest& item) { return item.surface == shell; });
  if (prior == coverage_proofs_.end()) coverage_proofs_.push_back({shell, token, *coverage, full.size()});
  else if (prior->visible_bounds != *coverage || prior->surface_size != full.size()) invalid_ = true;
}
std::optional<gfx::Rect> NativeGuestInclusionReceipt::BoundGuestCoverage(
    const SurfaceId& guest, const gfx::Rect& child, const gfx::Rect& visible,
    const gfx::Transform& transform, const std::optional<gfx::Rect>& clip,
    const std::optional<gfx::Rect>& added_clip, const gfx::MaskFilterInfo& mask,
    const gfx::MaskFilterInfo& quad_mask) {
  if (invalid_ || consumed_ || !shell_to_root_ || !transform.IsScaleOrTranslation() ||
      mask.gradient_mask() || quad_mask.gradient_mask()) return std::nullopt;
  const auto shape = std::ranges::find_if(scope_.shapes,
      [&](const NativeGuestExpectedShape& item) { return item.surface == guest; });
  if (shape == scope_.shapes.end()) return std::nullopt;
  // Full native child emission must equal its authenticated connector rectangle.
  // Rounded corners remove only the declared pane corners, never arbitrary area.
  const auto expected_inner = shell_to_root_->MapRect(gfx::RectF(shape->inner_in_shell_pixels));
  if (transform.MapRect(gfx::RectF(child)) != expected_inner) return std::nullopt;
  const auto full = NativeGuestFullCoverage(child, visible, transform, clip, added_clip, false);
  if (!full) return std::nullopt;
  gfx::MaskFilterInfo expected(gfx::RRectF(shape->pane_in_shell_pixels, shape->radius));
  expected.ApplyTransform(*shell_to_root_);
  if (expected.IsEmpty()) return std::nullopt;
  if (shape->radius == 0) {
    if (!mask.IsEmpty() || !quad_mask.IsEmpty()) return std::nullopt;
  } else {
    if (mask.IsEmpty() && quad_mask.IsEmpty()) return std::nullopt;
    if ((!mask.IsEmpty() && mask.rounded_corner_bounds() != expected.rounded_corner_bounds()) ||
        (!quad_mask.IsEmpty() && quad_mask.rounded_corner_bounds() != expected.rounded_corner_bounds()))
      return std::nullopt;
  }
  const auto prior = std::ranges::find_if(coverage_proofs_, [&](const NativeDrawnGuest& item) { return item.surface == guest; });
  if (prior == coverage_proofs_.end()) coverage_proofs_.push_back({guest, 0, *full, child.size()});
  else if (prior->visible_bounds != *full || prior->surface_size != child.size()) { invalid_ = true; return std::nullopt; }
  return full;
}
void NativeGuestInclusionReceipt::RecordDrawnSurface(const SurfaceId& surface, uint32_t token) {
  if (invalid_ || consumed_) return;
  const bool shell = surface.frame_sink_id() == scope_.shell_sink;
  const auto guest = std::ranges::find(scope_.guests, surface);
  if (!shell && guest == scope_.guests.end()) return;
  if (!surface.is_valid() || !token || (shell && token != scope_.mutation_shell_token)) {
    invalid_ = true; return;
  }
  const auto prior = std::ranges::find_if(drawn_, [&](const NativeDrawnGuest& item) {
    return item.surface.frame_sink_id() == surface.frame_sink_id();
  });
  if (prior != drawn_.end()) {
    if (prior->surface != surface || prior->token != token) invalid_ = true;
    return;
  }
  if (drawn_.size() >= 5) { invalid_ = true; return; }
  drawn_.push_back({surface, token, gfx::Rect(), gfx::Size()});
}
void NativeGuestInclusionReceipt::RecordEmittedSurface(const SurfaceId& surface,
    uint32_t token, const gfx::Rect& visible, float opacity, const gfx::Size& size) {
  if (invalid_ || consumed_ || size.IsEmpty() || visible.IsEmpty() || !std::isfinite(opacity) || opacity != 1.0f) return;
  const auto proof = std::ranges::find_if(coverage_proofs_, [&](const NativeDrawnGuest& item) { return item.surface == surface; });
  if (proof == coverage_proofs_.end() || proof->visible_bounds != visible || proof->surface_size != size) return;
  const auto prior = std::ranges::find_if(drawn_, [&](const NativeDrawnGuest& item) {
    return item.surface == surface && item.token == token;
  });
  if (prior != drawn_.end()) {
    if (!prior->surface_size.IsEmpty() && prior->surface_size != size) { invalid_ = true; return; }
    prior->surface_size = size; prior->visible_bounds.Union(visible);
  }
}
NativeGuestInclusionResult NativeGuestInclusionReceipt::Present(const SurfaceId& display,
    base::TimeTicks draw, const gfx::SwapTimings& swap,
    const gfx::PresentationFeedback& feedback, base::TimeTicks observed) {
  NativeGuestInclusionResult result{false, scope_, display, drawn_, draw, swap, feedback, std::nullopt};
  if (consumed_) return result;
  consumed_ = true;
  if (invalid_ || !shell_to_root_ || !display.is_valid() || display.frame_sink_id() != scope_.display_sink ||
      drawn_.size() != scope_.guests.size() + 1 || draw.is_null() || draw < scope_.shell_submission ||
      swap.is_null() || swap.swap_start < draw || swap.swap_end < swap.swap_start ||
      feedback.failed() || !(feedback.flags & gfx::PresentationFeedback::kHWCompletion) ||
      feedback.timestamp.is_null() || feedback.timestamp < swap.swap_end ||
      feedback.timestamp > observed || feedback.timestamp - scope_.input > base::Seconds(5)) return result;
  if (std::ranges::any_of(drawn_, [](const NativeDrawnGuest& item) { return item.visible_bounds.IsEmpty() || item.surface_size.IsEmpty(); }))
    return result;
  if (scope_.kind == NativeInclusionScopeKind::kShellStartup &&
      (drawn_.front().surface != scope_.startup_shell ||
       drawn_.front().token != scope_.mutation_shell_token ||
       drawn_.front().visible_bounds != scope_.startup_shell_bounds ||
       drawn_.front().surface_size != scope_.startup_shell_size)) return result;
  for (const auto& guest : scope_.guests)
    if (std::ranges::none_of(drawn_, [&](const NativeDrawnGuest& item) { return item.surface == guest; }))
      return result;
  result.measured = true;
  result.elapsed = feedback.timestamp - scope_.input;
  return result;
}
}  // namespace viz
