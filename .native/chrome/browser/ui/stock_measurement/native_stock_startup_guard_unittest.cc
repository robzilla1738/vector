// Copyright 2026 The Aux Authors
// Source admission contracts only. No helper/browser launch or measured frame.
#include "chrome/browser/ui/aux/native_startup_launch_receipt.h"
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && !BUILDFLAG(ENABLE_AUX_SHELL)
#include <sys/stat.h>
#include "base/files/file_util.h"
#include "base/files/scoped_temp_dir.h"
#include "base/test/scoped_command_line.h"
#include "base/threading/thread_restrictions.h"
#include "chrome/browser/ui/aux/journey_fixture_path.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
class NativeStockStartupGuardTest : public testing::Test {
 protected:
  void SetUp() override {
    base::FilePath path;
    ASSERT_TRUE(base::CreateTemporaryDirInDir(base::FilePath("/private/tmp"), "aux-native-journey-", &path));
    ASSERT_TRUE(root_.Set(path)); ASSERT_EQ(chmod(path.value().c_str(), 0700), 0);
    profile_ = path.AppendASCII("profile"); ASSERT_TRUE(base::CreateDirectory(profile_));
    ASSERT_EQ(chmod(profile_.value().c_str(), 0700), 0);
    command_.GetProcessCommandLine()->AppendSwitchPath("user-data-dir", profile_);
  }
  base::ScopedTempDir root_;
  base::FilePath profile_;
  base::test::ScopedCommandLine command_;
};
TEST_F(NativeStockStartupGuardTest, AuxStartupAndPerformanceFlagsCannotAdmitStockKind) {
  auto* command = command_.GetProcessCommandLine();
  command->AppendSwitch("aux-native-startup-observer"); command->AppendSwitch("aux-native-performance-observer");
  ScopedNativeObservationMetadataForTesting metadata(*command);
  EXPECT_FALSE(NativeStartupObservationEnabled());
}
TEST_F(NativeStockStartupGuardTest, StockMemoryFlagAloneCannotConsumeStartupLaunchReceipt) {
  auto* command = command_.GetProcessCommandLine(); command->AppendSwitch("aux-native-stock-measurement-observer");
  ScopedNativeObservationMetadataForTesting metadata(*command);
  EXPECT_TRUE(NativeStockObservationMetadataEnabled()); EXPECT_FALSE(NativeStartupObservationEnabled());
}
TEST_F(NativeStockStartupGuardTest, DedicatedStockStartupUsesOriginalHeldRootAndRefusesReplacedProfile) {
  auto* command = command_.GetProcessCommandLine();
  command->AppendSwitch("aux-native-stock-measurement-observer"); command->AppendSwitch("aux-native-stock-startup-observer");
  ScopedNativeObservationMetadataForTesting metadata(*command);
  { base::ScopedDisallowBlocking no_ui_resolution; EXPECT_TRUE(NativeStartupObservationEnabled()); }
  ASSERT_EQ(chmod(profile_.value().c_str(), 0750), 0); EXPECT_FALSE(NativeStartupObservationEnabled());
  ASSERT_EQ(chmod(profile_.value().c_str(), 0700), 0); EXPECT_TRUE(NativeStartupObservationEnabled());
  const auto retained = root_.GetPath().AppendASCII("old-profile"); ASSERT_TRUE(base::Move(profile_, retained));
  ASSERT_TRUE(base::CreateDirectory(profile_)); ASSERT_EQ(chmod(profile_.value().c_str(), 0700), 0);
  EXPECT_FALSE(NativeStartupObservationEnabled());
}
}  // namespace aux
#endif
