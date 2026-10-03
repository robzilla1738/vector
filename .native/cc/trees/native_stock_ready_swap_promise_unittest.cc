// Copyright 2026 The Aux Authors
// Synthetic cc lifecycle contracts, not Stock startup measurement evidence.
#include "cc/trees/native_stock_ready_swap_promise.h"
#include "base/functional/bind.h"
#include "base/test/task_environment.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace cc {
class NativeStockReadySwapPromiseTest : public testing::Test {
 protected:
  viz::NativeStockReadyFrame NativePaint() {
    viz::NativeStockReadyFrame frame; frame.nonce = nonce_;
    frame.client_bounds = gfx::Rect(800, 600); frame.ready = base::TimeTicks::Now(); return frame;
  }
  auto Reply() {
    return base::BindOnce([](int* calls, std::optional<viz::NativeStockReadyFrame>* out,
        std::optional<viz::NativeStockReadyFrame> value) { ++*calls; *out = std::move(value); }, &calls_, &result_);
  }
  base::test::TaskEnvironment environment_{base::test::TaskEnvironment::TimeSource::MOCK_TIME};
  const base::UnguessableToken nonce_ = base::UnguessableToken::Create();
  int calls_ = 0;
  std::optional<viz::NativeStockReadyFrame> result_;
};
TEST_F(NativeStockReadySwapPromiseTest, SameCommittedActivatedTokenRequiresActualSubmission) {
  NativeStockReadySwapPromise promise(NativePaint(), Reply());
  environment_.AdvanceClock(base::Milliseconds(1)); promise.OnCommit(); promise.DidActivate();
  viz::CompositorFrameMetadata metadata; metadata.frame_token = 7; promise.WillSwap(&metadata);
  ASSERT_TRUE(metadata.native_stock_ready); EXPECT_EQ(metadata.native_stock_ready->nonce, nonce_);
  EXPECT_TRUE(metadata.native_stock_ready->submitted.is_null());
  environment_.AdvanceClock(base::Milliseconds(1)); const auto submitted = base::TimeTicks::Now();
  promise.WillSubmit(7, submitted); promise.DidSwap();
  ASSERT_TRUE(result_); EXPECT_EQ(result_->frame_token, 7u); EXPECT_EQ(result_->submitted, submitted); EXPECT_EQ(calls_, 1);
}
TEST_F(NativeStockReadySwapPromiseTest, MetadataPreparationNeverSubstitutesForActualSubmit) {
  NativeStockReadySwapPromise promise(NativePaint(), Reply()); promise.OnCommit(); promise.DidActivate();
  viz::CompositorFrameMetadata metadata; metadata.frame_token = 7; promise.WillSwap(&metadata); promise.DidSwap();
  EXPECT_EQ(calls_, 1); EXPECT_FALSE(result_);
}
TEST_F(NativeStockReadySwapPromiseTest, ForeignActualSubmitTokenRefuses) {
  NativeStockReadySwapPromise promise(NativePaint(), Reply()); promise.OnCommit(); promise.DidActivate();
  viz::CompositorFrameMetadata metadata; metadata.frame_token = 7; promise.WillSwap(&metadata);
  promise.WillSubmit(8, base::TimeTicks::Now()); promise.DidSwap(); EXPECT_EQ(calls_, 1); EXPECT_FALSE(result_);
}
TEST_F(NativeStockReadySwapPromiseTest, ActivationWithoutCommitAndOccupiedMetadataRefuse) {
  for (int variant = 0; variant < 2; ++variant) {
    NativeStockReadySwapPromise promise(NativePaint(), Reply());
    if (variant) promise.OnCommit();
    promise.DidActivate(); viz::CompositorFrameMetadata metadata; metadata.frame_token = 7;
    if (variant) metadata.native_stock_ready = NativePaint();
    promise.WillSwap(&metadata); promise.WillSubmit(7, base::TimeTicks::Now()); promise.DidSwap();
    EXPECT_FALSE(result_);
  }
  EXPECT_EQ(calls_, 2);
}
TEST_F(NativeStockReadySwapPromiseTest, BrokenOrDestroyedPromiseNeverRearmsLaterFrame) {
  {
    NativeStockReadySwapPromise promise(NativePaint(), Reply());
    EXPECT_EQ(promise.DidNotSwap(SwapPromise::COMMIT_NO_UPDATE, base::TimeTicks::Now()), SwapPromise::DidNotSwapAction::BREAK_PROMISE);
    promise.OnCommit(); promise.DidActivate(); viz::CompositorFrameMetadata metadata; metadata.frame_token = 7;
    promise.WillSwap(&metadata); EXPECT_FALSE(metadata.native_stock_ready); promise.DidSwap();
  }
  EXPECT_EQ(calls_, 1); EXPECT_FALSE(result_);
  { NativeStockReadySwapPromise uncommitted(NativePaint(), Reply()); }
  EXPECT_EQ(calls_, 2); EXPECT_FALSE(result_);
}
}  // namespace cc
