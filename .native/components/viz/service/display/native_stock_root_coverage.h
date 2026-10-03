// Copyright 2026 The Aux Authors
#ifndef COMPONENTS_VIZ_SERVICE_DISPLAY_NATIVE_STOCK_ROOT_COVERAGE_H_
#define COMPONENTS_VIZ_SERVICE_DISPLAY_NATIVE_STOCK_ROOT_COVERAGE_H_
#include "components/viz/service/viz_service_export.h"
namespace viz {
class AggregatedRenderPass;
// Read-only emitted-root coverage, not eligibility, ownership, or paint timing.
// No opaque-layer hints/default colors or enclosing transformed boxes count.
VIZ_SERVICE_EXPORT bool NativeStockRootHasFullCoverage(const AggregatedRenderPass& actual);
}  // namespace viz
#endif
