// Copyright 2026 The Aux Authors
#ifndef COMPONENTS_VIZ_SERVICE_DISPLAY_NATIVE_STARTUP_FIRST_HARDWARE_RETENTION_H_
#define COMPONENTS_VIZ_SERVICE_DISPLAY_NATIVE_STARTUP_FIRST_HARDWARE_RETENTION_H_
#include <map>
#include <memory>
#include <optional>
#include <vector>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/timer/timer.h"
#include "base/unguessable_token.h"
#include "components/viz/service/display/native_guest_inclusion_receipt.h"
namespace viz {
// Original aggregation facts, populated only by the actual aggregator's
// existing placement/drawn/full-emission hooks. No browser geometry is inserted
// into this capture and no predicate result is treated as painted evidence.
class VIZ_SERVICE_EXPORT NativeStartupShellFootprint final {
 public:
  explicit NativeStartupShellFootprint(FrameSinkId shell);
  ~NativeStartupShellFootprint();
  void BindShellPlacement(const SurfaceId& shell, uint32_t token,
      const gfx::Rect& full, const gfx::Transform& to_root,
      const std::optional<gfx::Rect>& clip, bool masked);
  void RecordDrawnSurface(const SurfaceId& shell, uint32_t token);
  void RecordEmittedSurface(const SurfaceId& shell, uint32_t token,
      const gfx::Rect& bounds, float opacity, const gfx::Size& size);
  std::optional<std::pair<SurfaceId, uint32_t>> Identity() const;
  FrameSinkId shell_sink() const { return shell_; }
  bool ambiguous() const { return ambiguous_; }
  NativeGuestInclusionResult Validate(const NativeGuestInclusionScope& expected,
      const SurfaceId& display, base::TimeTicks draw, const gfx::SwapTimings& swap,
      const gfx::PresentationFeedback& feedback, base::TimeTicks observed) const;
 private:
  struct Placement {
    Placement();
    ~Placement();
    SurfaceId surface;
    uint32_t token = 0;
    gfx::Rect full;
    gfx::Transform to_root;
    std::optional<gfx::Rect> clip;
    bool masked = false;
  };
  struct Emission {
    SurfaceId surface;
    uint32_t token = 0;
    gfx::Rect bounds;
    float opacity = 0;
    gfx::Size size;
  };
  void Seen(const SurfaceId& surface, uint32_t token);
  FrameSinkId shell_;
  std::optional<std::pair<SurfaceId, uint32_t>> identity_;
  bool ambiguous_ = false;
  std::optional<Placement> placement_;
  std::vector<std::pair<SurfaceId, uint32_t>> drawn_;
  std::vector<Emission> emitted_;
  bool invalid_ = false;
};
// Installed and ACKed BEFORE the renderer is armed. Records the FIRST actual
// aggregation group for each exact shell SurfaceId/token, reserving that group
// before feedback arrives. Later redraws never replace it. Unknown/overflow/
// timeout/partial/software evidence refuses; no eviction-to-later fallback.
class VIZ_SERVICE_EXPORT NativeStartupFirstHardwareRetention final {
 public:
  using Reply = base::OnceCallback<void(std::optional<NativeGuestInclusionResult>)>;
  NativeStartupFirstHardwareRetention(base::UnguessableToken nonce,
      FrameSinkId display, FrameSinkId shell);
  ~NativeStartupFirstHardwareRetention();
  base::TimeTicks registered_at() const { return registered_; }
  bool active() const { return active_; }
  const base::UnguessableToken& nonce() const { return nonce_; }
  FrameSinkId shell_sink() const { return shell_; }
  std::optional<uint64_t> RegisterFrame(std::unique_ptr<NativeStartupShellFootprint> footprint,
      const SurfaceId& display, base::TimeTicks actual_draw);
  void Presented(uint64_t ticket, const gfx::SwapTimings& swap,
      const gfx::PresentationFeedback& feedback);
  void Join(const base::UnguessableToken& nonce, NativeGuestInclusionScope expected, Reply reply);
  void Cancel();
  base::WeakPtr<NativeStartupFirstHardwareRetention> GetWeakPtr();
 private:
  struct OriginalGroup {
    OriginalGroup();
    ~OriginalGroup();
    std::unique_ptr<NativeStartupShellFootprint> footprint;
    SurfaceId display;
    base::TimeTicks draw;
    std::optional<gfx::SwapTimings> swap;
    std::optional<gfx::PresentationFeedback> feedback;
    base::TimeTicks observed;
  };
  void TryJoin();
  void Finish(std::optional<NativeGuestInclusionResult> result);
  const base::UnguessableToken nonce_;
  const FrameSinkId display_, shell_;
  const base::TimeTicks registered_;
  bool active_ = true;
  bool used_ = false;
  uint64_t next_ticket_ = 0;
  std::map<std::pair<SurfaceId, uint32_t>, uint64_t> first_;
  std::map<uint64_t, std::unique_ptr<OriginalGroup>> groups_;
  std::optional<NativeGuestInclusionScope> expected_;
  Reply reply_;
  base::OneShotTimer timeout_;
  base::WeakPtrFactory<NativeStartupFirstHardwareRetention> weak_factory_{this};
};
}  // namespace viz
#endif
