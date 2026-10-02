// Copyright 2026 The Aux Authors
#ifndef COMPONENTS_VIZ_SERVICE_DISPLAY_NATIVE_GUEST_INCLUSION_RECEIPT_H_
#define COMPONENTS_VIZ_SERVICE_DISPLAY_NATIVE_GUEST_INCLUSION_RECEIPT_H_
#include <optional>
#include <vector>
#include "base/time/time.h"
#include "components/viz/common/surfaces/surface_id.h"
#include "components/viz/service/viz_service_export.h"
#include "ui/gfx/presentation_feedback.h"
#include "ui/gfx/geometry/rect.h"
#include "ui/gfx/geometry/rect_f.h"
#include "ui/gfx/geometry/mask_filter_info.h"
#include "ui/gfx/geometry/size.h"
#include "ui/gfx/geometry/transform.h"
#include "ui/gfx/swap_result.h"
namespace viz {
// Full rectangular coverage only; rounded matching is a separate bound shape.
VIZ_SERVICE_EXPORT std::optional<gfx::Rect> NativeGuestFullCoverage(
    const gfx::Rect& child, const gfx::Rect& visible, const gfx::Transform& transform,
    const std::optional<gfx::Rect>& clip, const std::optional<gfx::Rect>& added_clip,
    bool masked);

struct NativeGuestExpectedShape {
  SurfaceId surface;
  gfx::Rect inner_in_shell_pixels;
  gfx::RectF pane_in_shell_pixels;
  float radius = 0;
  bool operator==(const NativeGuestExpectedShape&) const = default;
};
enum class NativeInclusionScopeKind { kGuestStage = 0, kShellStartup = 1 };
struct NativeGuestInclusionScope {
  FrameSinkId display_sink;
  FrameSinkId shell_sink;
  uint32_t mutation_shell_token = 0;
  base::TimeTicks input;
  base::TimeTicks mutation;
  base::TimeTicks shell_submission;
  std::vector<SurfaceId> guests;
  std::vector<NativeGuestExpectedShape> shapes;
  // Startup fields come only from current native owned-window/client geometry;
  // renderer/requested dimensions are assertions and cannot populate this grant.
  NativeInclusionScopeKind kind = NativeInclusionScopeKind::kGuestStage;
  std::optional<SurfaceId> startup_shell = std::nullopt;
  gfx::Size startup_shell_size = gfx::Size();
  gfx::Rect startup_shell_bounds = gfx::Rect();
};
struct NativeDrawnGuest {
  SurfaceId surface;
  uint32_t token = 0;
  gfx::Rect visible_bounds;
  gfx::Size surface_size;
};
struct NativeGuestInclusionResult {
  bool measured = false;
  NativeGuestInclusionScope scope;
  SurfaceId display_surface;
  std::vector<NativeDrawnGuest> drawn;
  base::TimeTicks draw;
  gfx::SwapTimings swap;
  gfx::PresentationFeedback feedback;
  std::optional<base::TimeDelta> elapsed;
};
// Private trusted-owner instrumentation only; this class grants no authority.
// One instance belongs to ONE actual aggregation / PresentationGroupTiming.
// The owner must supply a verified post-mutation shell token and real native
// input. Reused guest tokens are valid only for exact SurfaceId drawn here.
class VIZ_SERVICE_EXPORT NativeGuestInclusionReceipt {
 public:
  explicit NativeGuestInclusionReceipt(NativeGuestInclusionScope scope);
  ~NativeGuestInclusionReceipt();
  // Must be the actual post-mutation shell root pass, before its children.
  // Intermediate pass ancestry, clipped/masked shell and conflicting placement
  // remain unavailable; no screen/window offset is guessed here.
  FrameSinkId ShellSink() const { return scope_.shell_sink; }
  void BindShellPlacement(const SurfaceId& shell, uint32_t token,
      const gfx::Rect& full, const gfx::Transform& shell_to_root,
      const std::optional<gfx::Rect>& clip, bool masked);
  std::optional<gfx::Rect> BoundGuestCoverage(const SurfaceId& guest,
      const gfx::Rect& child, const gfx::Rect& visible,
      const gfx::Transform& child_to_root, const std::optional<gfx::Rect>& clip,
      const std::optional<gfx::Rect>& added_clip,
      const gfx::MaskFilterInfo& actual_root_mask,
      const gfx::MaskFilterInfo& actual_quad_root_mask);
  void RecordDrawnSurface(const SurfaceId& actual_surface, uint32_t actual_token);
  void RecordEmittedSurface(const SurfaceId& actual_surface, uint32_t actual_token,
      const gfx::Rect& actual_visible_bounds, float actual_opacity,
      const gfx::Size& actual_surface_size);
  NativeGuestInclusionResult Present(const SurfaceId& actual_display,
      base::TimeTicks actual_draw, const gfx::SwapTimings& actual_swap,
      const gfx::PresentationFeedback& actual_feedback, base::TimeTicks observed);
 private:
  NativeGuestInclusionScope scope_;
  std::vector<NativeDrawnGuest> drawn_;
  std::vector<NativeDrawnGuest> coverage_proofs_;
  std::optional<gfx::Transform> shell_to_root_;
  bool invalid_ = false;
  bool consumed_ = false;
};
}  // namespace viz
#endif
