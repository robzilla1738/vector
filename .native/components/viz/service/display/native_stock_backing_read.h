// Copyright 2026 The Aux Authors
#ifndef COMPONENTS_VIZ_SERVICE_DISPLAY_NATIVE_STOCK_BACKING_READ_H_
#define COMPONENTS_VIZ_SERVICE_DISPLAY_NATIVE_STOCK_BACKING_READ_H_

#include "base/containers/span.h"
#include "components/viz/service/viz_service_export.h"
#include "ui/gfx/geometry/rect.h"
#include "components/viz/common/resources/shared_image_format.h"
#include "gpu/command_buffer/service/shared_image/shared_image_representation.h"

class SkImage;

namespace viz {
struct VIZ_SERVICE_EXPORT NativeStockBackingRead {
  bool original_access_valid = false;
  bool opaque = false;
  bool alpha_readback_attempted = false;
};

// Internal GPU-thread primitive only. The caller must hold the original live
// nonfallback scope and have waited its acquire semaphores. A successful result
// does not alone prove draw geometry, root identity or hardware presentation.
VIZ_SERVICE_EXPORT NativeStockBackingRead NativeStockReadOriginalBackingOpaque(
    gpu::SkiaImageRepresentation::ScopedReadAccess& actual_access,
    gpu::SharedContextState& context,
    const gpu::Mailbox& original_mailbox,
    const gfx::Size& original_size,
    SharedImageFormat original_format,
    const gfx::Rect& executed_sample_bounds,
    const SkImage* actually_consumed_image);

// Exact floating alpha check used by the actual read path; never round to 8-bit.
VIZ_SERVICE_EXPORT bool NativeStockPixelsHaveExactOpaqueAlpha(base::span<const float> rgba);
}  // namespace viz
#endif
