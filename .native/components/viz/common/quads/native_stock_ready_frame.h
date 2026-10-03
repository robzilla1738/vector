// Copyright 2026 The Aux Authors
#ifndef COMPONENTS_VIZ_COMMON_QUADS_NATIVE_STOCK_READY_FRAME_H_
#define COMPONENTS_VIZ_COMMON_QUADS_NATIVE_STOCK_READY_FRAME_H_
#include <stdint.h>
#include "base/time/time.h"
#include "base/unguessable_token.h"
#include "components/viz/common/viz_common_export.h"
#include "ui/gfx/geometry/rect.h"
namespace viz {
// Private native Views witness. It is not an input event or a paint receipt.
// Only the originating browser's committed native tree supplies this marker.
// Display additionally authenticates its own root sink/nonce and actual root
// surface/token/full output, so renderer-provided metadata grants no scope.
struct VIZ_COMMON_EXPORT NativeStockReadyFrame {
  NativeStockReadyFrame();
  ~NativeStockReadyFrame();
  NativeStockReadyFrame(const NativeStockReadyFrame&);
  NativeStockReadyFrame& operator=(const NativeStockReadyFrame&);
  base::UnguessableToken nonce;
  gfx::Rect client_bounds;
  base::TimeTicks ready, commit, submitted;
  uint32_t frame_token = 0;
};
}  // namespace viz
#endif
