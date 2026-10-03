// Copyright 2026 The Aux Authors
#ifndef COMPONENTS_VIZ_SERVICE_DISPLAY_NATIVE_STOCK_RASTER_DRAW_H_
#define COMPONENTS_VIZ_SERVICE_DISPLAY_NATIVE_STOCK_RASTER_DRAW_H_
#include <vector>
#include "base/functional/callback.h"
#include "components/viz/service/display/native_stock_backing_read.h"
#include "base/memory/raw_ptr.h"
#include "components/viz/service/display/external_use_client.h"
#include "ui/gfx/geometry/rect.h"

namespace viz {
// Private per-original-root draw pack, moved once from Viz to the real GPU
// paint task. Only actual executed draw geometry may populate its parts.
// Its reply is already bound to the retained nonce/root/token/first group.
class VIZ_SERVICE_EXPORT NativeStockRasterDraw final {
 public:
  using Image = ExternalUseClient::ImageContext;
  using Reply = base::OnceCallback<void(bool, bool)>;
  using ReadOriginal = base::RepeatingCallback<NativeStockBackingRead(Image*, const gfx::Rect&)>;
  NativeStockRasterDraw(gfx::Rect root, Reply reply);
  ~NativeStockRasterDraw();
  NativeStockRasterDraw(const NativeStockRasterDraw&) = delete;
  NativeStockRasterDraw& operator=(const NativeStockRasterDraw&) = delete;
  const gfx::Rect& root() const { return root_; }
  void Invalidate();
  void AddExecutedOpaqueSolid(gfx::Rect actual_device_rect);
  void AddExecutedOriginalImage(Image* actual, gfx::Rect actual_device_rect,
                                bool actual_source_over,
                                gfx::Rect actual_sample_bounds);
  // Called only after actual successful root draw and original GPU acquire
  // waits, while all admitted original read scopes are still alive. The read
  // callback must look up each pointer in that exact GPU paint's access set.
  void CompleteSuccessfulOriginalDraw(
      ReadOriginal read, base::RepeatingCallback<bool()> actual_context_valid);
 private:
  struct Part {
    Part(Image* image, gfx::Rect rect, bool opaque_required, gfx::Rect sample);
    ~Part();
    Part(Part&&);
    Part& operator=(Part&&);
    raw_ptr<Image> image;
    gfx::Rect rect;
    bool opaque_required;
    gfx::Rect sample;
  };
  void Add(Image* image, gfx::Rect rect, bool opaque_required, gfx::Rect sample);
  void Finish(bool full);
  const gfx::Rect root_;
  std::vector<Part> parts_;
  Reply reply_;
  bool valid_ = true;
};
}  // namespace viz
#endif
