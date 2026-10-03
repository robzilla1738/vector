// Copyright 2026 The Aux Authors
// Synthetic lifecycle/event contracts only; no native startup qualification.
#include "components/viz/service/display/native_stock_first_hardware_retention.h"
#include "base/functional/bind.h"
#include "base/test/scoped_standalone_mock_time.h"
#include "components/viz/common/surfaces/local_surface_id.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace viz {
class NativeStockFirstHardwareRetentionTest : public testing::Test {
 protected:
  NativeStockRootFrame Frame(NativeStockFirstHardwareRetention& retention, bool full = true) {
    NativeStockRootFrame frame;
    frame.nonce = nonce_; frame.surface = surface_; frame.token = 7;
    frame.output = gfx::Rect(800, 600); frame.committed_client_bounds = gfx::Rect(full ? 800 : 400, 600);
    frame.entire_client_painted = true;
    frame.ready = retention.registered_at() + base::Milliseconds(1);
    frame.commit = retention.registered_at() + base::Milliseconds(2);
    frame.submitted = retention.registered_at() + base::Milliseconds(3);
    return frame;
  }
  auto Reply() {
    return base::BindOnce([](int* count, std::optional<NativeStockRootPresentation>* output,
        std::optional<NativeStockRootPresentation> result) { ++*count; *output = std::move(result); }, &calls_, &result_);
  }
  void Feedback(NativeStockFirstHardwareRetention& retention, uint64_t group, bool hw = true) {
    gfx::SwapTimings swap;
    swap.swap_start = retention.registered_at() + base::Milliseconds(5);
    swap.swap_end = retention.registered_at() + base::Milliseconds(6);
    retention.Presented(group, swap, gfx::PresentationFeedback(retention.registered_at() + base::Milliseconds(7),
        base::Milliseconds(16), hw ? gfx::PresentationFeedback::kHWCompletion : 0));
  }
  base::test::ScopedStandaloneMockTime environment_;
  const base::UnguessableToken nonce_ = base::UnguessableToken::Create();
  const FrameSinkId sink_{1, 1};
  const SurfaceId surface_{sink_, LocalSurfaceId(1, 1, base::UnguessableToken::Create())};
  int calls_ = 0;
  std::optional<NativeStockRootPresentation> result_;
};
TEST_F(NativeStockFirstHardwareRetentionTest, ExactOriginalRootGroupBeforeJoinSurvivesLateJoin) {
  NativeStockFirstHardwareRetention retention(nonce_, sink_); environment_.AdvanceClock(base::Milliseconds(10));
  const auto group = retention.RegisterFrame(Frame(retention), retention.registered_at() + base::Milliseconds(4)); ASSERT_TRUE(group);
  Feedback(retention, *group); retention.Join(nonce_, surface_, 7, Reply());
  ASSERT_TRUE(result_); EXPECT_EQ(calls_, 1); EXPECT_EQ(result_->frame.surface, surface_);
  EXPECT_EQ(result_->feedback.timestamp, retention.registered_at() + base::Milliseconds(7)); EXPECT_FALSE(retention.active());
}
TEST_F(NativeStockFirstHardwareRetentionTest, PartialFirstGroupCannotBeReplacedByLaterFullRedraw) {
  NativeStockFirstHardwareRetention retention(nonce_, sink_); environment_.AdvanceClock(base::Milliseconds(10));
  const auto group = retention.RegisterFrame(Frame(retention, false), retention.registered_at() + base::Milliseconds(4)); ASSERT_TRUE(group);
  EXPECT_FALSE(retention.RegisterFrame(Frame(retention), retention.registered_at() + base::Milliseconds(8)));
  Feedback(retention, *group); retention.Join(nonce_, surface_, 7, Reply()); EXPECT_EQ(calls_, 1); EXPECT_FALSE(result_);
}
TEST_F(NativeStockFirstHardwareRetentionTest, SoftwareOriginalCannotBeReplacedByHardwareRedraw) {
  NativeStockFirstHardwareRetention retention(nonce_, sink_); environment_.AdvanceClock(base::Milliseconds(10));
  const auto group = retention.RegisterFrame(Frame(retention), retention.registered_at() + base::Milliseconds(4)); ASSERT_TRUE(group);
  Feedback(retention, *group, false);
  EXPECT_FALSE(retention.RegisterFrame(Frame(retention), retention.registered_at() + base::Milliseconds(8)));
  retention.Join(nonce_, surface_, 7, Reply()); EXPECT_EQ(calls_, 1); EXPECT_FALSE(result_);
}
TEST_F(NativeStockFirstHardwareRetentionTest, ReadyBeforeRegistrationOrReversedSubmissionRefuses) {
  for (int variant = 0; variant < 2; ++variant) {
    NativeStockFirstHardwareRetention retention(nonce_, sink_); environment_.AdvanceClock(base::Milliseconds(10));
    auto frame = Frame(retention);
    if (variant == 0) frame.ready = retention.registered_at() - base::Milliseconds(1);
    else frame.submitted = frame.commit - base::Milliseconds(1);
    EXPECT_FALSE(retention.RegisterFrame(frame, retention.registered_at() + base::Milliseconds(4)));
    EXPECT_FALSE(retention.active());
  }
}
TEST_F(NativeStockFirstHardwareRetentionTest, QueuedJoinPastAbsoluteDeadlineRefusesBeforeTimerRuns) {
  NativeStockFirstHardwareRetention retention(nonce_, sink_); environment_.AdvanceClock(base::Milliseconds(10));
  const auto group = retention.RegisterFrame(Frame(retention), retention.registered_at() + base::Milliseconds(4)); ASSERT_TRUE(group); Feedback(retention, *group);
  environment_.AdvanceClock(base::Seconds(6));
  retention.Join(nonce_, surface_, 7, Reply()); EXPECT_EQ(calls_, 1); EXPECT_FALSE(result_);
}
TEST_F(NativeStockFirstHardwareRetentionTest, CancelInvalidatesDelayedFeedbackAndRepliesOnce) {
  NativeStockFirstHardwareRetention retention(nonce_, sink_); environment_.AdvanceClock(base::Milliseconds(10));
  const auto group = retention.RegisterFrame(Frame(retention), retention.registered_at() + base::Milliseconds(4)); ASSERT_TRUE(group);
  retention.Join(nonce_, surface_, 7, Reply()); auto weak = retention.GetWeakPtr();
  retention.Cancel(); EXPECT_FALSE(weak); Feedback(retention, *group); EXPECT_EQ(calls_, 1); EXPECT_FALSE(result_);
}
TEST_F(NativeStockFirstHardwareRetentionTest, RasterAndHardwareRequireSameOriginalGroupInEitherArrivalOrder) {
  for (bool hardware_first : {true, false}) {
    NativeStockFirstHardwareRetention retention(nonce_, sink_);
    environment_.AdvanceClock(base::Milliseconds(10));
    auto frame = Frame(retention); frame.requires_original_raster_draw = true;
    const auto group = retention.RegisterFrame(frame, retention.registered_at() + base::Milliseconds(4)); ASSERT_TRUE(group);
    const int previous_calls = calls_;
    retention.Join(nonce_, surface_, 7, Reply());
    if (hardware_first) Feedback(retention, *group);
    else retention.RasterDrawCompleted(*group, nonce_, surface_, 7, true, false);
    EXPECT_EQ(calls_, previous_calls);
    if (hardware_first) retention.RasterDrawCompleted(*group, nonce_, surface_, 7, true, false);
    else Feedback(retention, *group);
    EXPECT_EQ(calls_, previous_calls + 1); ASSERT_TRUE(result_);
    EXPECT_TRUE(result_->frame.entire_client_painted);
  }
}
TEST_F(NativeStockFirstHardwareRetentionTest, ForeignRasterTokenAndDuplicateReceiptRefuse) {
  for (bool duplicate : {true, false}) {
    NativeStockFirstHardwareRetention retention(nonce_, sink_);
    environment_.AdvanceClock(base::Milliseconds(10));
    auto frame = Frame(retention); frame.requires_original_raster_draw = true;
    const auto group = retention.RegisterFrame(frame, retention.registered_at() + base::Milliseconds(4)); ASSERT_TRUE(group);
    const int previous_calls = calls_;
    retention.Join(nonce_, surface_, 7, Reply());
    if (duplicate) retention.RasterDrawCompleted(*group, nonce_, surface_, 7, true, false);
    retention.RasterDrawCompleted(*group, nonce_, surface_, duplicate ? 7 : 8, true, false);
    EXPECT_EQ(calls_, previous_calls + 1); EXPECT_FALSE(result_);
  }
}
TEST_F(NativeStockFirstHardwareRetentionTest, FailedRasterCannotBorrowLaterRedraw) {
  NativeStockFirstHardwareRetention retention(nonce_, sink_);
  environment_.AdvanceClock(base::Milliseconds(10));
  auto frame = Frame(retention); frame.requires_original_raster_draw = true;
  const auto group = retention.RegisterFrame(frame, retention.registered_at() + base::Milliseconds(4)); ASSERT_TRUE(group);
  retention.RasterDrawCompleted(*group, nonce_, surface_, 7, false, false);
  EXPECT_FALSE(retention.RegisterFrame(frame, retention.registered_at() + base::Milliseconds(8)));
  Feedback(retention, *group); retention.Join(nonce_, surface_, 7, Reply());
  EXPECT_EQ(calls_, 1); EXPECT_FALSE(result_);
}
TEST_F(NativeStockFirstHardwareRetentionTest, CancelledRasterCallbackCannotCompleteOldGroup) {
  NativeStockFirstHardwareRetention retention(nonce_, sink_);
  environment_.AdvanceClock(base::Milliseconds(10));
  auto frame = Frame(retention); frame.requires_original_raster_draw = true;
  const auto group = retention.RegisterFrame(frame, retention.registered_at() + base::Milliseconds(4)); ASSERT_TRUE(group);
  retention.Join(nonce_, surface_, 7, Reply()); retention.Cancel();
  retention.RasterDrawCompleted(*group, nonce_, surface_, 7, true, false);
  Feedback(retention, *group); EXPECT_EQ(calls_, 1); EXPECT_FALSE(result_);
}
TEST_F(NativeStockFirstHardwareRetentionTest, QueuedRasterPastDeadlineCannotBeatDelayedTimer) {
  NativeStockFirstHardwareRetention retention(nonce_, sink_);
  environment_.AdvanceClock(base::Milliseconds(10));
  auto frame = Frame(retention); frame.requires_original_raster_draw = true;
  const auto group = retention.RegisterFrame(frame, retention.registered_at() + base::Milliseconds(4)); ASSERT_TRUE(group);
  retention.Join(nonce_, surface_, 7, Reply()); Feedback(retention, *group);
  environment_.AdvanceClock(base::Seconds(6));
  retention.RasterDrawCompleted(*group, nonce_, surface_, 7, true, true);
  EXPECT_EQ(calls_, 1); EXPECT_FALSE(result_);
}
TEST_F(NativeStockFirstHardwareRetentionTest, ActualReadbackClassificationSurvivesOriginalJoin) {
  NativeStockFirstHardwareRetention retention(nonce_, sink_);
  environment_.AdvanceClock(base::Milliseconds(10));
  auto frame = Frame(retention); frame.requires_original_raster_draw = true;
  const auto group = retention.RegisterFrame(frame, retention.registered_at() + base::Milliseconds(4)); ASSERT_TRUE(group);
  retention.RasterDrawCompleted(*group, nonce_, surface_, 7, true, true);
  Feedback(retention, *group); retention.Join(nonce_, surface_, 7, Reply());
  EXPECT_EQ(calls_, 1); ASSERT_TRUE(result_); EXPECT_TRUE(result_->frame.alpha_readback_attempted);
}
}  // namespace viz
