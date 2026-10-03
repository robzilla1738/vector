// Copyright 2026 The Aux Authors
// Synthetic geometry/lifetime contracts only; no GPU or startup qualification.
#include "components/viz/service/display/native_stock_raster_draw.h"
#include <memory>
#include "base/functional/bind.h"
#include "ui/gfx/color_space.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace viz {
class NativeStockRasterDrawTest : public testing::Test {
 protected:
  auto Reply() {
    return base::BindOnce([](int* calls, bool* full, bool actual, bool /*alpha_readback_attempted*/) {
      ++*calls; *full = actual;
    }, &calls_, &full_);
  }
  auto Context() { return base::BindRepeating([]() { return true; }); }
  auto Read(bool opaque) {
    return base::BindRepeating([](bool result, ExternalUseClient::ImageContext*, const gfx::Rect&) {
      return NativeStockBackingRead{true, result, false};
    }, opaque);
  }
  int calls_ = 0;
  bool full_ = false;
};
TEST_F(NativeStockRasterDrawTest, CompleteActualPartsCoverRoot) {
  NativeStockRasterDraw draw(gfx::Rect(800, 600), Reply());
  draw.AddExecutedOpaqueSolid(gfx::Rect(0, 0, 400, 600));
  draw.AddExecutedOpaqueSolid(gfx::Rect(400, 0, 400, 600));
  draw.CompleteSuccessfulOriginalDraw(Read(false), Context());
  EXPECT_EQ(calls_, 1); EXPECT_TRUE(full_);
}
TEST_F(NativeStockRasterDrawTest, BoundingBoxesCannotHideHole) {
  NativeStockRasterDraw draw(gfx::Rect(800, 600), Reply());
  draw.AddExecutedOpaqueSolid(gfx::Rect(0, 0, 399, 600));
  draw.AddExecutedOpaqueSolid(gfx::Rect(400, 0, 400, 600));
  draw.CompleteSuccessfulOriginalDraw(Read(true), Context());
  EXPECT_EQ(calls_, 1); EXPECT_FALSE(full_);
}
TEST_F(NativeStockRasterDrawTest, OriginalBackingReadRequiredForImageHole) {
  ExternalUseClient::ImageContext image(gpu::Mailbox(), gfx::Size(800, 600),
      SinglePlaneFormat::kRGBA_8888, gfx::ColorSpace::CreateSRGB());
  NativeStockRasterDraw draw(gfx::Rect(800, 600), Reply());
  draw.AddExecutedOriginalImage(&image, gfx::Rect(800, 600), true, gfx::Rect(800, 600));
  draw.CompleteSuccessfulOriginalDraw(Read(false), Context());
  EXPECT_EQ(calls_, 1); EXPECT_FALSE(full_);
}
TEST_F(NativeStockRasterDrawTest, UnsupportedCompositionCannotBorrowOpaqueBackground) {
  NativeStockRasterDraw draw(gfx::Rect(800, 600), Reply());
  draw.AddExecutedOpaqueSolid(gfx::Rect(800, 600)); draw.Invalidate();
  draw.CompleteSuccessfulOriginalDraw(Read(true), Context());
  EXPECT_EQ(calls_, 1); EXPECT_FALSE(full_);
}
TEST_F(NativeStockRasterDrawTest, DroppedGpuTaskRefusesOnce) {
  { NativeStockRasterDraw draw(gfx::Rect(800, 600), Reply());
    draw.AddExecutedOpaqueSolid(gfx::Rect(800, 600)); }
  EXPECT_EQ(calls_, 1); EXPECT_FALSE(full_);
}
TEST_F(NativeStockRasterDrawTest, ReentrantReadRetiresPackWithoutBorrowingMemberLifetime) {
  ExternalUseClient::ImageContext image(gpu::Mailbox(), gfx::Size(800, 600),
      SinglePlaneFormat::kRGBA_8888, gfx::ColorSpace::CreateSRGB());
  auto draw = std::make_unique<NativeStockRasterDraw>(gfx::Rect(800, 600), Reply());
  draw->AddExecutedOriginalImage(&image, gfx::Rect(800, 600), true, gfx::Rect(800, 600));
  draw->CompleteSuccessfulOriginalDraw(base::BindRepeating(
      [](std::unique_ptr<NativeStockRasterDraw>* owner, ExternalUseClient::ImageContext*, const gfx::Rect&) {
        owner->reset(); return NativeStockBackingRead{};
      }, &draw), Context());
  EXPECT_FALSE(draw); EXPECT_EQ(calls_, 1); EXPECT_FALSE(full_);
}
TEST_F(NativeStockRasterDrawTest, SourceOverwriteCannotBorrowOpaqueBackground) {
  ExternalUseClient::ImageContext image(gpu::Mailbox(), gfx::Size(800, 600),
      SinglePlaneFormat::kRGBA_8888, gfx::ColorSpace::CreateSRGB());
  NativeStockRasterDraw draw(gfx::Rect(800, 600), Reply());
  draw.AddExecutedOpaqueSolid(gfx::Rect(800, 600));
  draw.AddExecutedOriginalImage(&image, gfx::Rect(800, 600), false, gfx::Rect(800, 600));
  draw.CompleteSuccessfulOriginalDraw(Read(false), Context());
  EXPECT_EQ(calls_, 1); EXPECT_FALSE(full_);
}
TEST_F(NativeStockRasterDrawTest, ContextLossCannotBorrowSolidBacking) {
  NativeStockRasterDraw draw(gfx::Rect(800, 600), Reply());
  draw.AddExecutedOpaqueSolid(gfx::Rect(800, 600));
  draw.CompleteSuccessfulOriginalDraw(Read(true), base::BindRepeating([]() { return false; }));
  EXPECT_EQ(calls_, 1); EXPECT_FALSE(full_);
}
}  // namespace viz
