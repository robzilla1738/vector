// Copyright 2018 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "components/viz/service/display/skia_output_surface.h"
#include "components/viz/service/display/native_stock_raster_draw.h"

namespace viz {

SkiaOutputSurface::SkiaOutputSurface() = default;

SkiaOutputSurface::~SkiaOutputSurface() = default;

void SkiaOutputSurface::SetNativeStockRasterDrawForNextRootPaint(
    std::unique_ptr<NativeStockRasterDraw> draw) {}

SkiaOutputSurface* SkiaOutputSurface::AsSkiaOutputSurface() {
  return this;
}

}  // namespace viz
