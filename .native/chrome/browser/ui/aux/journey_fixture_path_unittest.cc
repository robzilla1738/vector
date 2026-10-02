// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/aux/journey_fixture_path.h"
#include "base/files/scoped_temp_dir.h"
#include "base/threading/thread_restrictions.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace aux {
TEST(JourneyFixturePathTest, RefusesTraversalNestedMissingRelativeAndTrailingRoots) {
  for (const std::string& path : {"aux-native-journey-test", "/tmp/aux-native-journey-missing", "/tmp/aux-native-journey-x/../../owner", "/tmp/aux-native-journey-x/nested", "/tmp/aux-native-journey-x/", "/tmp/aux-native-journey-"})
    EXPECT_FALSE(OwnedJourneyFixtureRoot(path));
}
TEST(JourneyFixturePathTest, AcceptsOnlyOwnedPrivateCanonicalImmediateChild) {
  base::FilePath path;
  ASSERT_TRUE(base::CreateTemporaryDirInDir(base::FilePath("/private/tmp"), "aux-native-journey-", &path));
  base::ScopedTempDir root;
  ASSERT_TRUE(root.Set(path));
  ASSERT_EQ(chmod(path.value().c_str(), 0700), 0);
  EXPECT_TRUE(OwnedJourneyFixtureRoot(path.value()));
  EXPECT_TRUE(OwnedJourneyFixtureRoot("/tmp/" + path.BaseName().value()));
  EXPECT_FALSE(OwnedJourneyFixtureRoot(path.value(), geteuid() + 1));
  ASSERT_EQ(chmod(path.value().c_str(), 0750), 0);
  EXPECT_FALSE(OwnedJourneyFixtureRoot(path.value()));
  ASSERT_EQ(chmod(path.value().c_str(), 0700), 0);
  const auto link = base::FilePath(path.value() + "-link");
  ASSERT_TRUE(base::CreateSymbolicLink(path, link));
  EXPECT_FALSE(OwnedJourneyFixtureRoot(link.value()));
  EXPECT_TRUE(base::DeleteFile(link));
}
TEST(JourneyFixturePathTest, AppearanceRequiresOptInAndExactPrivateProfile) {
  base::FilePath path;
  ASSERT_TRUE(base::CreateTemporaryDirInDir(base::FilePath("/private/tmp"), "aux-native-journey-", &path));
  base::ScopedTempDir root;
  ASSERT_TRUE(root.Set(path));
  ASSERT_EQ(chmod(path.value().c_str(), 0700), 0);
  const auto profile = path.AppendASCII("profile");
  ASSERT_TRUE(base::CreateDirectory(profile));
  ASSERT_EQ(chmod(profile.value().c_str(), 0700), 0);
  base::CommandLine command(base::CommandLine::NO_PROGRAM);
  command.AppendSwitchPath("user-data-dir", profile);
  EXPECT_FALSE(NativeAppearanceObservationEnabled(command));
  command.AppendSwitchASCII("remote-debugging-port", "0");
  EXPECT_FALSE(NativeAppearanceObservationEnabled(command));
  command.AppendSwitch("aux-native-appearance-observer");
  EXPECT_TRUE(NativeAppearanceObservationEnabled(command));
  ASSERT_EQ(chmod(profile.value().c_str(), 0750), 0);
  EXPECT_FALSE(NativeAppearanceObservationEnabled(command));
  ASSERT_EQ(chmod(profile.value().c_str(), 0700), 0);
  ASSERT_TRUE(base::DeletePathRecursively(profile));
  EXPECT_FALSE(NativeAppearanceObservationEnabled(command));
  const auto other = path.AppendASCII("other");
  ASSERT_TRUE(base::CreateDirectory(other));
  ASSERT_EQ(chmod(other.value().c_str(), 0700), 0);
  ASSERT_TRUE(base::CreateSymbolicLink(other, profile));
  EXPECT_FALSE(NativeAppearanceObservationEnabled(command));
}
TEST(JourneyFixturePathTest, CapturedObservationMetadataRemainsValidWithoutUIResolution) {
  base::FilePath path;
  ASSERT_TRUE(base::CreateTemporaryDirInDir(base::FilePath("/private/tmp"), "aux-native-journey-", &path));
  base::ScopedTempDir root;
  ASSERT_TRUE(root.Set(path));
  ASSERT_EQ(chmod(path.value().c_str(), 0700), 0);
  const auto profile = path.AppendASCII("profile");
  ASSERT_TRUE(base::CreateDirectory(profile));
  ASSERT_EQ(chmod(profile.value().c_str(), 0700), 0);
  base::CommandLine command(base::CommandLine::NO_PROGRAM);
  command.AppendSwitchPath("user-data-dir", profile);
  EXPECT_FALSE(NativeObservationMetadata::Capture(command));
  command.AppendSwitch("aux-native-performance-observer");
  auto metadata = NativeObservationMetadata::Capture(command);
  ASSERT_TRUE(metadata);
  {
    base::ScopedDisallowBlocking no_ui_resolution;
    EXPECT_TRUE(metadata->Enabled(false));
    EXPECT_FALSE(metadata->Enabled(true));
  }
  ASSERT_EQ(chmod(profile.value().c_str(), 0750), 0);
  EXPECT_FALSE(metadata->Enabled(false));
  ASSERT_EQ(chmod(profile.value().c_str(), 0700), 0);
  EXPECT_TRUE(metadata->Enabled(false));
  const auto retained = path.AppendASCII("old-profile");
  ASSERT_TRUE(base::Move(profile, retained));
  ASSERT_TRUE(base::CreateDirectory(profile));
  ASSERT_EQ(chmod(profile.value().c_str(), 0700), 0);
  EXPECT_FALSE(metadata->Enabled(false));
  auto replacement = NativeObservationMetadata::Capture(command);
  ASSERT_TRUE(replacement);
  EXPECT_TRUE(replacement->Enabled(false));
  ASSERT_TRUE(base::DeletePathRecursively(profile));
  EXPECT_FALSE(replacement->Enabled(false));
  ASSERT_TRUE(base::CreateSymbolicLink(retained, profile));
  EXPECT_FALSE(metadata->Enabled(false));
  EXPECT_FALSE(NativeObservationMetadata::Capture(command));
}
TEST(JourneyFixturePathTest, CapturedObservationMetadataRefusesReplacedRoot) {
  base::FilePath path;
  ASSERT_TRUE(base::CreateTemporaryDirInDir(base::FilePath("/private/tmp"), "aux-native-journey-", &path));
  base::ScopedTempDir root;
  ASSERT_TRUE(root.Set(path));
  ASSERT_EQ(chmod(path.value().c_str(), 0700), 0);
  const auto profile = path.AppendASCII("profile");
  ASSERT_TRUE(base::CreateDirectory(profile));
  ASSERT_EQ(chmod(profile.value().c_str(), 0700), 0);
  base::CommandLine command(base::CommandLine::NO_PROGRAM);
  command.AppendSwitchPath("user-data-dir", profile);
  command.AppendSwitch("aux-native-appearance-observer");
  auto metadata = NativeObservationMetadata::Capture(command);
  ASSERT_TRUE(metadata);
  EXPECT_TRUE(metadata->Enabled(true));
  EXPECT_FALSE(metadata->Enabled(false));
  ASSERT_EQ(chmod(path.value().c_str(), 0750), 0);
  EXPECT_FALSE(metadata->Enabled(true));
  ASSERT_EQ(chmod(path.value().c_str(), 0700), 0);
  const auto retained = base::FilePath(path.value() + "-retained");
  ASSERT_TRUE(base::Move(path, retained));
  base::ScopedTempDir old_root;
  ASSERT_TRUE(old_root.Set(retained));
  ASSERT_TRUE(base::CreateDirectory(profile));
  ASSERT_EQ(chmod(path.value().c_str(), 0700), 0);
  ASSERT_EQ(chmod(profile.value().c_str(), 0700), 0);
  EXPECT_FALSE(metadata->Enabled(true));
}
TEST(JourneyFixturePathTest, ScopedRealMetadataDrivesDefaultGettersAndRestoresAdmission) {
  const bool original_appearance = NativeAppearanceObservationEnabled();
  const bool original_performance = NativePerformanceObservationMetadataEnabled();
  base::FilePath path;
  ASSERT_TRUE(base::CreateTemporaryDirInDir(base::FilePath("/private/tmp"), "aux-native-journey-", &path));
  base::ScopedTempDir root;
  ASSERT_TRUE(root.Set(path));
  ASSERT_EQ(chmod(path.value().c_str(), 0700), 0);
  const auto profile = path.AppendASCII("profile");
  ASSERT_TRUE(base::CreateDirectory(profile));
  ASSERT_EQ(chmod(profile.value().c_str(), 0700), 0);
  base::CommandLine command(base::CommandLine::NO_PROGRAM);
  command.AppendSwitchPath("user-data-dir", profile);
  command.AppendSwitch("aux-native-appearance-observer");
  command.AppendSwitch("aux-native-performance-observer");
  {
    ScopedNativeObservationMetadataForTesting admission(command);
    {
      base::ScopedDisallowBlocking no_ui_resolution;
      EXPECT_TRUE(NativeAppearanceObservationEnabled());
      EXPECT_TRUE(NativePerformanceObservationMetadataEnabled());
    }
    base::CommandLine invalid(base::CommandLine::NO_PROGRAM);
    invalid.AppendSwitch("aux-native-appearance-observer");
    {
      ScopedNativeObservationMetadataForTesting denied(invalid);
      EXPECT_FALSE(NativeAppearanceObservationEnabled());
      EXPECT_FALSE(NativePerformanceObservationMetadataEnabled());
    }
    EXPECT_TRUE(NativeAppearanceObservationEnabled());
    EXPECT_TRUE(NativePerformanceObservationMetadataEnabled());
    ASSERT_EQ(chmod(profile.value().c_str(), 0750), 0);
    EXPECT_FALSE(NativeAppearanceObservationEnabled());
    EXPECT_FALSE(NativePerformanceObservationMetadataEnabled());
    ASSERT_EQ(chmod(profile.value().c_str(), 0700), 0);
  }
  EXPECT_EQ(original_appearance, NativeAppearanceObservationEnabled());
  EXPECT_EQ(original_performance, NativePerformanceObservationMetadataEnabled());
}
}  // namespace aux
