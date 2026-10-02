// Copyright 2026 The Aux Authors
// Synthetic compositor contract cases, never native performance evidence.
#include "cc/trees/aux_performance_swap_promise.h"
#include <optional>
#include <utility>
#include "base/functional/bind.h"
#include "base/location.h"
#include "base/run_loop.h"
#include "base/test/test_simple_task_runner.h"
#include "components/viz/common/quads/compositor_frame_metadata.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
namespace {
NativePerformanceSwapPromise::Callback Capture(
    std::optional<NativePerformanceSwapPromise::Submission>* output) {
  return base::BindOnce([](std::optional<NativePerformanceSwapPromise::Submission>* output,
                           NativePerformanceSwapPromise::Submission sample) {
    *output = std::move(sample);
  }, output);
}
void Prepare(NativePerformanceSwapPromise& promise) {
  promise.OnCommit(); promise.DidActivate();
  viz::CompositorFrameMetadata metadata; metadata.frame_token = 7;
  promise.WillSwap(&metadata);
}
TEST(NativePerformanceSwapPromiseTest, MetadataPreparationWithoutActualSubmissionRefuses) {
  auto runner = base::MakeRefCounted<base::TestSimpleTaskRunner>();
  std::optional<NativePerformanceSwapPromise::Submission> result;
  NativePerformanceSwapPromise promise{runner, Capture(&result)};
  Prepare(promise); promise.DidSwap(); runner->RunUntilIdle();
  ASSERT_TRUE(result); EXPECT_FALSE(result->submitted_frame); EXPECT_TRUE(result->submitted.is_null());
}
TEST(NativePerformanceSwapPromiseTest, ExactSubmitTimestampSurvivesDelayedCallback) {
  auto runner = base::MakeRefCounted<base::TestSimpleTaskRunner>();
  std::optional<NativePerformanceSwapPromise::Submission> result;
  NativePerformanceSwapPromise promise{runner, Capture(&result)};
  Prepare(promise); const auto actual_submit = base::TimeTicks::Now();
  promise.WillSubmit(7, actual_submit); promise.DidSwap();
  // cc_unittests already owns the thread TaskEnvironment. Hold the callback
  // on its explicit queue while the existing loop advances the real clock.
  base::RunLoop delayed;
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostDelayedTask(
      FROM_HERE, delayed.QuitClosure(), base::Milliseconds(100));
  delayed.Run();
  runner->RunUntilIdle();
  ASSERT_TRUE(result);
  if (!base::TimeTicks::IsConsistentAcrossProcesses()) { EXPECT_FALSE(result->submitted_frame); return; }
  EXPECT_TRUE(result->submitted_frame); EXPECT_EQ(result->submitted, actual_submit);
  EXPECT_LT(result->submitted, base::TimeTicks::Now());
}
TEST(NativePerformanceSwapPromiseTest, ForeignFrameTokenNeverGetsSubmissionEvidence) {
  auto runner = base::MakeRefCounted<base::TestSimpleTaskRunner>();
  std::optional<NativePerformanceSwapPromise::Submission> result;
  NativePerformanceSwapPromise promise{runner, Capture(&result)};
  Prepare(promise); promise.WillSubmit(8, base::TimeTicks::Now());
  promise.DidSwap(); runner->RunUntilIdle();
  ASSERT_TRUE(result); EXPECT_FALSE(result->submitted_frame); EXPECT_TRUE(result->submitted.is_null());
}
}  // namespace
}  // namespace aux
