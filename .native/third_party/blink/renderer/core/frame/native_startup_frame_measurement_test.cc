// Copyright 2026 The Aux Authors
// Callback/lifecycle unit fixtures, not native readiness or paint evidence.
#include "third_party/blink/renderer/core/frame/native_startup_frame_measurement.h"
#include <utility>
#include "base/functional/bind.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "third_party/blink/renderer/platform/testing/task_environment.h"
namespace blink {
class NativeStartupFrameMeasurementLifetimeTest : public testing::Test {
 protected:
  test::TaskEnvironment environment_;
  void Seed(NativeStartupFrameMeasurement& measurement, uint64_t sequence) {
    measurement.sample_.emplace();
    measurement.sample_->scope.sequence = sequence;
    measurement.queued_ = true;
  }
  auto DelayedSubmission(NativeStartupFrameMeasurement& measurement) {
    return base::BindOnce(&NativeStartupFrameMeasurement::Submitted,
        measurement.weak_factory_.GetWeakPtr(), aux::NativePerformanceSwapPromise::Submission());
  }
  auto DelayedLifecycle(NativeStartupFrameMeasurement& measurement) {
    return base::BindRepeating(&NativeStartupFrameMeasurement::Lifecycle,
        measurement.weak_factory_.GetWeakPtr());
  }
  uint64_t Current(const NativeStartupFrameMeasurement& measurement) {
    return measurement.sample_ ? measurement.sample_->scope.sequence : 0;
  }
};
TEST_F(NativeStartupFrameMeasurementLifetimeTest, RetiredCallbacksCannotRefuseFreshSequence) {
  NativeStartupFrameMeasurement measurement(nullptr, {}, {});
  Seed(measurement, 1);
  auto old_submission = DelayedSubmission(measurement);
  auto old_lifecycle = DelayedLifecycle(measurement);
  measurement.Cancel();
  EXPECT_EQ(Current(measurement), 0U);
  Seed(measurement, 2);
  std::move(old_submission).Run();
  old_lifecycle.Run();
  EXPECT_EQ(Current(measurement), 2U);
  auto current = DelayedSubmission(measurement);
  std::move(current).Run();
  EXPECT_EQ(Current(measurement), 0U);
}
TEST_F(NativeStartupFrameMeasurementLifetimeTest, NoWidgetCannotAuthorizePreparationOrEmitSample) {
  NativeStartupFrameMeasurement measurement(nullptr, {}, {});
  bool replied = false;
  EXPECT_FALSE(measurement.Prepare(base::BindOnce(
      [](bool* called, std::optional<NativeStartupFrameSubmission>) { *called = true; }, &replied)));
  measurement.Cancel();
  EXPECT_FALSE(replied);
}
}  // namespace blink
