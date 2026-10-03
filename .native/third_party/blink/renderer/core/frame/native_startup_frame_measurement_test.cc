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
// Pure timestamp/purpose controls; no widget, native owner or paint authority.
TEST(NativeStartupFrameTimingTest, ColdRequiresExactOriginalLaunchEndpoint) {
  NativeStartupFrameScope scope;
  scope.launch = base::TimeTicks() + base::Seconds(1);
  scope.measurement_input = scope.launch;
  scope.hardware_registration = scope.launch + base::Milliseconds(10);
  const auto now = scope.hardware_registration + base::Milliseconds(1);
  scope.purpose = NativeStartupFramePurpose::kAuxCold;
  EXPECT_TRUE(ValidateNativeStartupFrameTiming(scope, now));
  scope.measurement_input += base::Microseconds(1);
  EXPECT_FALSE(ValidateNativeStartupFrameTiming(scope, now));
}
TEST(NativeStartupFrameTimingTest, MissingAndForeignPurposesRefuse) {
  NativeStartupFrameScope scope;
  scope.launch = base::TimeTicks() + base::Seconds(1);
  scope.measurement_input = scope.launch;
  scope.hardware_registration = scope.launch;
  EXPECT_FALSE(ValidateNativeStartupFrameTiming(scope, scope.launch));
  scope.purpose = static_cast<NativeStartupFramePurpose>(99);
  EXPECT_FALSE(ValidateNativeStartupFrameTiming(scope, scope.launch));
}
TEST(NativeStartupFrameTimingTest, WarmMustBeLaterThanRetainedLaunch) {
  NativeStartupFrameScope scope;
  scope.launch = base::TimeTicks() + base::Seconds(1);
  scope.purpose = NativeStartupFramePurpose::kAuxWarm;
  scope.measurement_input = scope.launch;
  scope.hardware_registration = scope.launch + base::Milliseconds(10);
  const auto now = scope.hardware_registration;
  EXPECT_FALSE(ValidateNativeStartupFrameTiming(scope, now));
  scope.measurement_input = scope.launch - base::Microseconds(1);
  EXPECT_FALSE(ValidateNativeStartupFrameTiming(scope, now));
  scope.measurement_input = scope.launch + base::Microseconds(1);
  EXPECT_TRUE(ValidateNativeStartupFrameTiming(scope, now));
}
TEST(NativeStartupFrameTimingTest, RegistrationCannotPrecedeInputOrBeFuture) {
  NativeStartupFrameScope scope;
  scope.launch = base::TimeTicks() + base::Seconds(1);
  scope.purpose = NativeStartupFramePurpose::kAuxWarm;
  scope.measurement_input = scope.launch + base::Milliseconds(10);
  scope.hardware_registration = scope.measurement_input - base::Microseconds(1);
  EXPECT_FALSE(ValidateNativeStartupFrameTiming(scope, scope.measurement_input));
  scope.hardware_registration = scope.measurement_input + base::Microseconds(1);
  EXPECT_FALSE(ValidateNativeStartupFrameTiming(scope, scope.measurement_input));
}
}  // namespace blink
