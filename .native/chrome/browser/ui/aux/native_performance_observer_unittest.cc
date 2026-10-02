// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license in the LICENSE file.
// Synthetic clock/feedback contract tests; these are not native perf trials.
#include "chrome/browser/ui/aux/native_performance_observer.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "cc/trees/aux_performance_swap_promise.h"
#include "cc/trees/aux_performance_content_frame.h"
#include "base/test/task_environment.h"
#include "base/functional/bind.h"
#include "base/test/test_future.h"
#include "components/viz/common/quads/compositor_frame_metadata.h"
#include "ui/gfx/presentation_feedback.h"

namespace aux {
namespace {
TEST(NativePresentationTiming, RetainsFractionalBudgetBoundary) {
  const auto input = base::TimeTicks() + base::Seconds(1);
  const auto matched = input + base::Milliseconds(2);
  const auto presented = input + base::Microseconds(30004);
  gfx::PresentationFeedback feedback(presented, base::Microseconds(16667),
                                     gfx::PresentationFeedback::kHWCompletion);
  const auto elapsed = ValidatedPresentationInterval(input, matched, presented, feedback);
  ASSERT_TRUE(elapsed);
  EXPECT_EQ(elapsed->InMicroseconds(), 30004);
  EXPECT_GT(elapsed->InMillisecondsF(), 30.0);
}
TEST(NativePresentationTiming, RefusesFailureAndGuessedCompletion) {
  const auto input = base::TimeTicks() + base::Seconds(1);
  const auto presented = input + base::Milliseconds(30);
  for (uint32_t flags : {0U, static_cast<uint32_t>(gfx::PresentationFeedback::kVSync),
      static_cast<uint32_t>(gfx::PresentationFeedback::kHWCompletion | gfx::PresentationFeedback::kFailure)}) {
    gfx::PresentationFeedback feedback(presented, base::Microseconds(16667), flags);
    EXPECT_FALSE(ValidatedPresentationInterval(input, input, presented, feedback));
  }
}
TEST(NativePresentationTiming, RefusesNullReversedFutureAndStaleClocks) {
  const auto input = base::TimeTicks() + base::Seconds(1);
  const auto presented = input + base::Milliseconds(30);
  gfx::PresentationFeedback feedback(presented, base::Microseconds(16667),
                                     gfx::PresentationFeedback::kHWCompletion);
  EXPECT_FALSE(ValidatedPresentationInterval(base::TimeTicks(), input, presented, feedback));
  EXPECT_FALSE(ValidatedPresentationInterval(input, input - base::Microseconds(1), presented, feedback));
  EXPECT_FALSE(ValidatedPresentationInterval(input, presented + base::Microseconds(1), presented, feedback));
  EXPECT_FALSE(ValidatedPresentationInterval(input, input, presented - base::Microseconds(1), feedback));
  feedback.timestamp = input + base::Seconds(5) + base::Microseconds(1);
  EXPECT_FALSE(ValidatedPresentationInterval(input, input, feedback.timestamp, feedback));
}
TEST(NativePerformanceSwapPromise, EmitsActualSubmittedTokenExactlyOnce) {
  base::test::TaskEnvironment environment;
  base::test::TestFuture<NativePerformanceSwapPromise::Submission> future;
  NativePerformanceSwapPromise promise(base::SingleThreadTaskRunner::GetCurrentDefault(), future.GetCallback());
  viz::CompositorFrameMetadata metadata;
  metadata.frame_token = 73;
  promise.OnCommit(); promise.DidActivate(); promise.WillSwap(&metadata);
  promise.WillSubmit(metadata.frame_token, base::TimeTicks::Now()); promise.DidSwap();
  const auto result = future.Get();
  if (base::TimeTicks::IsConsistentAcrossProcesses()) {
    EXPECT_TRUE(result.submitted_frame); EXPECT_EQ(result.frame_token, 73U);
    EXPECT_FALSE(result.commit.is_null()); EXPECT_GE(result.submitted, result.commit);
  } else EXPECT_FALSE(result.submitted_frame);
}
TEST(NativePerformanceSwapPromise, RefusesNoDamageAndPreActivationToken) {
  base::test::TaskEnvironment environment;
  for (bool no_damage : {true, false}) {
    base::test::TestFuture<NativePerformanceSwapPromise::Submission> future;
    NativePerformanceSwapPromise promise(base::SingleThreadTaskRunner::GetCurrentDefault(), future.GetCallback());
    promise.OnCommit();
    if (no_damage) {
      promise.DidActivate();
      promise.DidNotSwap(cc::SwapPromise::COMMIT_NO_UPDATE, base::TimeTicks::Now());
    } else {
      viz::CompositorFrameMetadata metadata; metadata.frame_token = 9;
      promise.WillSwap(&metadata); promise.DidSwap();
    }
    EXPECT_FALSE(future.Get().submitted_frame);
    EXPECT_EQ(future.Get().frame_token, 0U);
  }
}
TEST(NativeContentFrameMeasurement, ForeignSinkAndUnrelatedTokenCannotComplete) {
  base::test::TaskEnvironment environment;
  ContentPerformanceScope scope{1, 2, 3, 4, viz::FrameSinkId(5, 6)};
  NativeContentFrameMeasurement measure(base::BindRepeating([](ContentPerformanceScope* actual) { return std::optional(*actual); }, base::Unretained(&scope)));
  base::test::TestFuture<ContentPresentationSample> future;
  ASSERT_TRUE(measure.Arm(base::TimeTicks::Now(), future.GetCallback()));
  ASSERT_TRUE(measure.MatchingMutation(base::TimeTicks::Now()));
  NativePerformanceSwapPromise::Submission submission;
  submission.commit = base::TimeTicks::Now(); submission.submitted = submission.commit;
  submission.activated = true; submission.submitted_frame = true; submission.frame_token = 71;
  ASSERT_TRUE(measure.Submitted(submission));
  gfx::PresentationFeedback feedback(base::TimeTicks::Now(), base::Microseconds(16667),
                                     gfx::PresentationFeedback::kHWCompletion);
  viz::FrameTimingDetails timing;
  timing.received_compositor_frame_timestamp = submission.commit;
  timing.embedded_frame_timestamp = submission.commit;
  timing.draw_start_timestamp = submission.commit;
  timing.presentation_feedback = feedback;
  measure.Presented(viz::FrameSinkId(5, 7), 71, timing);
  measure.Presented(scope.frame_sink, 72, timing);
  EXPECT_FALSE(future.IsReady());
  measure.Presented(scope.frame_sink, 71, timing);
  EXPECT_TRUE(future.Get().measured);
}
TEST(NativeContentFrameMeasurement, MissingActualParentInclusionRefusesHardwareFeedback) {
  base::test::TaskEnvironment environment;
  ContentPerformanceScope scope{1, 2, 3, 4, viz::FrameSinkId(5, 6)};
  NativeContentFrameMeasurement measure(base::BindRepeating([](ContentPerformanceScope* actual) { return std::optional(*actual); }, base::Unretained(&scope)));
  base::test::TestFuture<ContentPresentationSample> future;
  ASSERT_TRUE(measure.Arm(base::TimeTicks::Now(), future.GetCallback()));
  ASSERT_TRUE(measure.MatchingMutation(base::TimeTicks::Now()));
  NativePerformanceSwapPromise::Submission submission;
  submission.commit = base::TimeTicks::Now(); submission.submitted = submission.commit;
  submission.activated = true; submission.submitted_frame = true; submission.frame_token = 71;
  ASSERT_TRUE(measure.Submitted(submission));
  viz::FrameTimingDetails timing;
  timing.received_compositor_frame_timestamp = submission.commit;
  timing.draw_start_timestamp = base::TimeTicks::Now();
  timing.presentation_feedback = gfx::PresentationFeedback(base::TimeTicks::Now(), base::Microseconds(16667),
      gfx::PresentationFeedback::kHWCompletion);
  measure.Presented(scope.frame_sink, 71, timing);
  EXPECT_FALSE(future.Get().measured);
  EXPECT_TRUE(future.Get().timing.embedded_frame_timestamp.is_null());
}
TEST(NativeContentFrameMeasurement, DocumentChangeAndFailedCommitRetainRefusal) {
  base::test::TaskEnvironment environment;
  ContentPerformanceScope scope{1, 2, 3, 4, viz::FrameSinkId(5, 6)};
  NativeContentFrameMeasurement measure(base::BindRepeating([](ContentPerformanceScope* actual) { return std::optional(*actual); }, base::Unretained(&scope)));
  base::test::TestFuture<ContentPresentationSample> future;
  ASSERT_TRUE(measure.Arm(base::TimeTicks::Now(), future.GetCallback()));
  ++scope.document_generation;
  EXPECT_FALSE(measure.MatchingMutation(base::TimeTicks::Now()));
  EXPECT_FALSE(future.Get().measured);
  base::test::TestFuture<ContentPresentationSample> next;
  ASSERT_TRUE(measure.Arm(base::TimeTicks::Now(), next.GetCallback()));
  ASSERT_TRUE(measure.MatchingMutation(base::TimeTicks::Now()));
  EXPECT_FALSE(measure.Submitted(NativePerformanceSwapPromise::Submission()));
  EXPECT_FALSE(next.Get().measured);
}
TEST(NativeContentFrameMeasurement, MissingExactFrameTimesOutWithoutProxy) {
  base::test::TaskEnvironment environment(base::test::TaskEnvironment::TimeSource::MOCK_TIME);
  ContentPerformanceScope scope{1, 2, 3, 4, viz::FrameSinkId(5, 6)};
  NativeContentFrameMeasurement measure(base::BindRepeating([](ContentPerformanceScope* actual) { return std::optional(*actual); }, base::Unretained(&scope)));
  base::test::TestFuture<ContentPresentationSample> future;
  ASSERT_TRUE(measure.Arm(base::TimeTicks::Now(), future.GetCallback()));
  environment.FastForwardBy(base::Seconds(5));
  EXPECT_FALSE(future.Get().measured);
}
}  // namespace
}  // namespace aux
