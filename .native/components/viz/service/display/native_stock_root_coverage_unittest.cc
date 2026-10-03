// Copyright 2026 The Aux Authors
#include "components/viz/service/display/native_stock_root_coverage.h"
#include "components/viz/common/quads/aggregated_render_pass.h"
#include "components/viz/common/quads/solid_color_draw_quad.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace viz {
namespace {
SolidColorDrawQuad* Solid(AggregatedRenderPass& pass, gfx::Rect bounds) {
  auto* state = pass.CreateAndAppendSharedQuadState();
  state->quad_layer_rect = bounds; state->visible_quad_layer_rect = bounds;
  auto* quad = pass.CreateAndAppendDrawQuad<SolidColorDrawQuad>();
  quad->SetNew(state, bounds, bounds, SkColors::kWhite, false);
  return quad;
}
TEST(NativeStockRootCoverageTest, ExactAdjacentPaintTilesCoverWithoutBoundingBoxInference) {
  AggregatedRenderPass pass; pass.output_rect = gfx::Rect(0, 0, 100, 100);
  Solid(pass, gfx::Rect(0, 0, 49, 100)); Solid(pass, gfx::Rect(50, 0, 50, 100));
  EXPECT_FALSE(NativeStockRootHasFullCoverage(pass));
  Solid(pass, gfx::Rect(49, 0, 1, 100));
  EXPECT_TRUE(NativeStockRootHasFullCoverage(pass));
}
TEST(NativeStockRootCoverageTest, RealClipAndTranslucentPaintCannotFillMissingArea) {
  AggregatedRenderPass pass; pass.output_rect = gfx::Rect(0, 0, 100, 100);
  auto* clipped = Solid(pass, pass.output_rect);
  auto* state = const_cast<SharedQuadState*>(clipped->shared_quad_state);
  state->clip_rect = gfx::Rect(0, 0, 100, 99);
  auto* translucent = Solid(pass, pass.output_rect); translucent->color.fA = 0.5f;
  EXPECT_FALSE(NativeStockRootHasFullCoverage(pass));
  Solid(pass, gfx::Rect(0, 99, 100, 1)); EXPECT_TRUE(NativeStockRootHasFullCoverage(pass));
}
TEST(NativeStockRootCoverageTest, TransformsAndNonSourceBlendNeverBecomeFullBacking) {
  AggregatedRenderPass pass; pass.output_rect = gfx::Rect(0, 0, 100, 100);
  auto* quad = Solid(pass, pass.output_rect);
  auto* state = const_cast<SharedQuadState*>(quad->shared_quad_state);
  state->quad_to_target_transform.Translate(1, 0);
  EXPECT_FALSE(NativeStockRootHasFullCoverage(pass));
  state->quad_to_target_transform.MakeIdentity(); state->blend_mode = SkBlendMode::kClear;
  EXPECT_FALSE(NativeStockRootHasFullCoverage(pass));
  state->blend_mode = SkBlendMode::kSrcOver; EXPECT_TRUE(NativeStockRootHasFullCoverage(pass));
}
TEST(NativeStockRootCoverageTest, DestructiveForegroundInvalidatesEarlierFullBacking) {
  AggregatedRenderPass pass; pass.output_rect = gfx::Rect(0, 0, 100, 100);
  Solid(pass, pass.output_rect); EXPECT_TRUE(NativeStockRootHasFullCoverage(pass));
  auto* foreground = Solid(pass, gfx::Rect(40, 40, 20, 20));
  auto* state = const_cast<SharedQuadState*>(foreground->shared_quad_state);
  state->blend_mode = SkBlendMode::kClear;
  EXPECT_FALSE(NativeStockRootHasFullCoverage(pass));
}
TEST(NativeStockRootCoverageTest, RoundedMaskCannotProveRectangularRootCoverage) {
  AggregatedRenderPass pass; pass.output_rect = gfx::Rect(0, 0, 100, 100);
  auto* quad = Solid(pass, pass.output_rect);
  auto* state = const_cast<SharedQuadState*>(quad->shared_quad_state);
  state->mask_filter_info = gfx::MaskFilterInfo(gfx::RRectF(gfx::RectF(pass.output_rect), 6.f));
  EXPECT_FALSE(NativeStockRootHasFullCoverage(pass));
  state->mask_filter_info = gfx::MaskFilterInfo(); state->mask_filter_info.set_clip_id(1);
  EXPECT_FALSE(NativeStockRootHasFullCoverage(pass));
  state->mask_filter_info = gfx::MaskFilterInfo();
  EXPECT_TRUE(NativeStockRootHasFullCoverage(pass));
}
TEST(NativeStockRootCoverageTest, EntirePassBoundRefusesEvenWithAnEarlyFullBacking) {
  AggregatedRenderPass pass; pass.output_rect = gfx::Rect(0, 0, 100, 100);
  for (size_t i = 0; i < 513; ++i) Solid(pass, pass.output_rect);
  EXPECT_FALSE(NativeStockRootHasFullCoverage(pass));
}
}  // namespace
}  // namespace viz
