// Copyright 2026 The Aux Authors
#ifndef COMPONENTS_VIZ_SERVICE_DISPLAY_NATIVE_STOCK_FIRST_HARDWARE_RETENTION_H_
#define COMPONENTS_VIZ_SERVICE_DISPLAY_NATIVE_STOCK_FIRST_HARDWARE_RETENTION_H_
#include <map>
#include <optional>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "base/unguessable_token.h"
#include "components/viz/common/surfaces/surface_id.h"
#include "components/viz/service/viz_service_export.h"
#include "ui/gfx/geometry/rect.h"
#include "ui/gfx/presentation_feedback.h"
#include "ui/gfx/swap_result.h"
namespace viz {
// A distinct root-Views witness: no Aux child SurfaceDrawQuad, renderer mark,
// title, caller geometry or root/child token equality supplies these facts.
// Call sites must populate the nonce and ready/commit/submission from the SAME
// actual committed native Views tree and actual root compositor submission.
struct VIZ_SERVICE_EXPORT NativeStockRootFrame {
  NativeStockRootFrame();
  ~NativeStockRootFrame();
  NativeStockRootFrame(const NativeStockRootFrame&);
  NativeStockRootFrame& operator=(const NativeStockRootFrame&);
  base::UnguessableToken nonce;
  SurfaceId surface;
  uint32_t token = 0;
  gfx::Rect output;
  gfx::Rect committed_client_bounds;
  base::TimeTicks ready, commit, submitted;
  bool entire_client_painted = false;
  bool requires_original_raster_draw = false;
  bool alpha_readback_attempted = false;
};
struct VIZ_SERVICE_EXPORT NativeStockRootPresentation {
  NativeStockRootPresentation();
  ~NativeStockRootPresentation();
  NativeStockRootPresentation(const NativeStockRootPresentation&);
  NativeStockRootFrame frame;
  base::TimeTicks draw, observed;
  gfx::SwapTimings swap;
  gfx::PresentationFeedback feedback;
};
// Installed/ACKed before the first eligible native Views paint. First groups
// are reserved BEFORE feedback. Partial/software first groups cannot be
// replaced with a later redraw. No eviction or arbitrary latest-frame fallback.
class VIZ_SERVICE_EXPORT NativeStockFirstHardwareRetention final {
 public:
  using Reply = base::OnceCallback<void(std::optional<NativeStockRootPresentation>)>;
  NativeStockFirstHardwareRetention(base::UnguessableToken nonce, FrameSinkId display);
  ~NativeStockFirstHardwareRetention();
  base::TimeTicks registered_at() const { return registered_; }
  bool active() const { return active_; }
  const base::UnguessableToken& nonce() const { return nonce_; }
  std::optional<uint64_t> RegisterFrame(NativeStockRootFrame actual, base::TimeTicks draw);
  void Presented(uint64_t group, const gfx::SwapTimings& swap, const gfx::PresentationFeedback& feedback);
  void RasterDrawCompleted(uint64_t group, base::UnguessableToken nonce,
                           SurfaceId original_root, uint32_t original_token,
                           bool full_original_draw_succeeded, bool alpha_readback_attempted);
  void Join(base::UnguessableToken nonce, SurfaceId actual_root, uint32_t actual_token, Reply reply);
  void Cancel();
  base::WeakPtr<NativeStockFirstHardwareRetention> GetWeakPtr();
 private:
  struct Group {
    Group();
    ~Group();
    NativeStockRootPresentation result;
    bool received = false;
    bool raster_received = false;
  };
  void TryJoin();
  void Finish(std::optional<NativeStockRootPresentation> result);
  const base::UnguessableToken nonce_;
  const FrameSinkId display_;
  const base::TimeTicks registered_, deadline_;
  bool active_ = true, used_ = false;
  uint64_t sequence_ = 0;
  std::map<std::pair<SurfaceId, uint32_t>, uint64_t> first_;
  std::map<uint64_t, Group> groups_;
  std::optional<std::pair<SurfaceId, uint32_t>> expected_;
  Reply reply_;
  base::OneShotTimer timeout_;
  base::WeakPtrFactory<NativeStockFirstHardwareRetention> weak_factory_{this};
};
}  // namespace viz
#endif
