// Copyright 2026 The Aux Authors
#include "components/viz/service/display/native_stock_backing_read.h"
#include <array>
#include <limits>
#include "testing/gtest/include/gtest/gtest.h"

namespace viz {
TEST(NativeStockBackingReadTest, ExactOpaqueSamples) {
  const std::array<float, 8> pixels{0, 0, 0, 1, 1, 0.5f, 0, 1};
  EXPECT_TRUE(NativeStockPixelsHaveExactOpaqueAlpha(pixels));
}
TEST(NativeStockBackingReadTest, RoundedNearOpaqueCannotQualify) {
  const std::array<float, 4> pixels{0, 0, 0, 0.99999f};
  EXPECT_FALSE(NativeStockPixelsHaveExactOpaqueAlpha(pixels));
}
TEST(NativeStockBackingReadTest, TransparentOrNonfiniteCannotQualify) {
  for (float alpha : {0.0f, 0.5f, std::numeric_limits<float>::infinity(),
                       std::numeric_limits<float>::quiet_NaN()}) {
    const std::array<float, 4> pixels{0, 0, 0, alpha};
    EXPECT_FALSE(NativeStockPixelsHaveExactOpaqueAlpha(pixels));
  }
  const std::array<float, 4> invalid_rgb{0, std::numeric_limits<float>::quiet_NaN(), 0, 1};
  EXPECT_FALSE(NativeStockPixelsHaveExactOpaqueAlpha(invalid_rgb));
}
TEST(NativeStockBackingReadTest, IncompleteOrEmptyCannotQualify) {
  EXPECT_FALSE(NativeStockPixelsHaveExactOpaqueAlpha({}));
  const std::array<float, 3> incomplete{0, 0, 0};
  EXPECT_FALSE(NativeStockPixelsHaveExactOpaqueAlpha(incomplete));
}
}  // namespace viz
