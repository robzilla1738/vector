// Copyright 2026 The Aux Authors
// Filesystem/admission refusal fixtures, not startup performance evidence.
#include "chrome/browser/ui/aux/native_startup_launch_receipt.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <fcntl.h>
#include <sys/stat.h>
#include <unistd.h>
#include <utility>
#include "base/command_line.h"
#include "base/files/file_util.h"
#include "base/files/scoped_temp_dir.h"
#include "base/test/scoped_command_line.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
class NativeStartupLaunchReceiptTest : public testing::Test {
 public:
  NativeStartupLaunchReceiptTest();
  ~NativeStartupLaunchReceiptTest() override;
 protected:
  void SetUp() override {
    command_.GetProcessCommandLine()->RemoveSwitch("aux-native-performance-observer");
    ASSERT_TRUE(root_.CreateUniqueTempDirUnderPath(base::FilePath("/private/tmp"), "aux-native-journey-startup-"));
    profile_ = root_.GetPath().AppendASCII("profile");
    ASSERT_TRUE(base::CreateDirectory(profile_));
    ASSERT_EQ(chmod(root_.GetPath().value().c_str(), 0700), 0);
    ASSERT_EQ(chmod(profile_.value().c_str(), 0700), 0);
    command_.GetProcessCommandLine()->AppendSwitchPath("user-data-dir", profile_);
  }
  void Enable() { command_.GetProcessCommandLine()->AppendSwitch("aux-native-performance-observer"); }
  base::test::ScopedCommandLine command_;
  base::ScopedTempDir root_;
  base::FilePath profile_;
};
NativeStartupLaunchReceiptTest::NativeStartupLaunchReceiptTest() = default;
NativeStartupLaunchReceiptTest::~NativeStartupLaunchReceiptTest() = default;
TEST_F(NativeStartupLaunchReceiptTest, MissingOptInAndMissingReceiptsNeverAdmit) {
  EXPECT_FALSE(ReadNativeStartupLaunchReceipt());
  Enable();
  EXPECT_FALSE(ReadNativeStartupLaunchReceipt());
}
TEST_F(NativeStartupLaunchReceiptTest, WrongRootModeAndProfileSymlinkRefused) {
  Enable();
  ASSERT_EQ(chmod(root_.GetPath().value().c_str(), 0755), 0);
  EXPECT_FALSE(ReadNativeStartupLaunchReceipt());
  ASSERT_EQ(chmod(root_.GetPath().value().c_str(), 0700), 0);
  ASSERT_TRUE(base::DeletePathRecursively(profile_));
  ASSERT_EQ(symlink(root_.GetPath().value().c_str(), profile_.value().c_str()), 0);
  EXPECT_FALSE(ReadNativeStartupLaunchReceipt());
}
TEST_F(NativeStartupLaunchReceiptTest, UnsafeOrMalformedFixedFilesCannotAdmit) {
  Enable();
  const auto metadata = root_.GetPath().AppendASCII("startup-build.json");
  const auto receipt = root_.GetPath().AppendASCII("startup-launch-receipt.json");
  ASSERT_TRUE(base::WriteFile(metadata, "{}"));
  ASSERT_TRUE(base::WriteFile(receipt, "{}"));
  ASSERT_EQ(chmod(metadata.value().c_str(), 0644), 0);
  EXPECT_FALSE(ReadNativeStartupLaunchReceipt());
  ASSERT_EQ(chmod(metadata.value().c_str(), 0600), 0);
  ASSERT_EQ(chmod(receipt.value().c_str(), 0600), 0);
  EXPECT_FALSE(ReadNativeStartupLaunchReceipt());
  ASSERT_TRUE(base::DeleteFile(receipt));
  ASSERT_EQ(symlink(metadata.value().c_str(), receipt.value().c_str()), 0);
  EXPECT_FALSE(ReadNativeStartupLaunchReceipt());
}
// Filesystem-only lifetime controls. The fake executable bytes below are NEVER
// an admitted helper; testing its held FD/path does not grant process authority.
class NativeStartupLaunchLeaseFileTest : public testing::Test {
 public:
  NativeStartupLaunchLeaseFileTest();
  ~NativeStartupLaunchLeaseFileTest() override;
 protected:
  void SetUp() override {
    command_.GetProcessCommandLine()->RemoveSwitch("aux-native-performance-observer");
    ASSERT_TRUE(root_.CreateUniqueTempDirUnderPath(base::FilePath("/private/tmp"), "aux-native-journey-lease-"));
    ASSERT_EQ(chmod(root_.GetPath().value().c_str(), 0700), 0);
    profile_ = root_.GetPath().AppendASCII("profile");
    ASSERT_TRUE(base::CreateDirectory(profile_));
    ASSERT_EQ(chmod(profile_.value().c_str(), 0700), 0);
    for (const char* name : {"startup-build.json", "startup-launch-receipt.json", "synthetic-helper-only"}) {
      const auto file = root_.GetPath().AppendASCII(name);
      ASSERT_TRUE(base::WriteFile(file, "synthetic-filesystem-unit-only"));
      ASSERT_EQ(chmod(file.value().c_str(), 0600), 0);
    }
  }
  std::unique_ptr<NativeStartupLaunchLease> CreateFileLease() {
    auto state = std::make_unique<NativeStartupLaunchLease::State>();
    state->root_name = root_.GetPath().BaseName().value();
    state->profile_path = profile_;
    state->parent.reset(open("/private/tmp", O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC));
    state->root.reset(openat(state->parent.get(), state->root_name.c_str(), O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC));
    state->profile.reset(openat(state->root.get(), "profile", O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC));
    state->metadata.reset(openat(state->root.get(), "startup-build.json", O_RDONLY | O_NOFOLLOW | O_CLOEXEC));
    state->receipt.reset(openat(state->root.get(), "startup-launch-receipt.json", O_RDONLY | O_NOFOLLOW | O_CLOEXEC));
    state->helper_path = root_.GetPath().AppendASCII("synthetic-helper-only").value();
    state->executable.reset(open(state->helper_path.c_str(), O_RDONLY | O_NOFOLLOW | O_CLOEXEC));
    if (!state->parent.is_valid() || !state->root.is_valid() || !state->profile.is_valid() ||
        !state->metadata.is_valid() || !state->receipt.is_valid() || !state->executable.is_valid() ||
        fstat(state->root.get(), &state->root_identity) || fstat(state->profile.get(), &state->profile_identity) ||
        fstat(state->metadata.get(), &state->metadata_identity) || fstat(state->receipt.get(), &state->receipt_identity) ||
        fstat(state->executable.get(), &state->executable_identity)) return nullptr;
    state->metadata_bytes = "synthetic-filesystem-unit-only";
    state->receipt_bytes = state->metadata_bytes;
    return std::unique_ptr<NativeStartupLaunchLease>(new NativeStartupLaunchLease(std::move(state)));
  }
  bool FilesStable(const NativeStartupLaunchLease& lease) { return lease.ValidateOwnedFiles(); }
  base::test::ScopedCommandLine command_;
  base::ScopedTempDir root_;
  base::FilePath profile_;
};
NativeStartupLaunchLeaseFileTest::NativeStartupLaunchLeaseFileTest() = default;
NativeStartupLaunchLeaseFileTest::~NativeStartupLaunchLeaseFileTest() = default;
TEST_F(NativeStartupLaunchLeaseFileTest, OriginalHeldFilesRemainStableButNeverAdmitFakeHelper) {
  auto lease = CreateFileLease(); ASSERT_TRUE(lease);
  EXPECT_TRUE(FilesStable(*lease));
  EXPECT_TRUE(FilesStable(*lease));  // validation must not consume/read-shift FDs
  EXPECT_FALSE(lease->Validate());
}
TEST_F(NativeStartupLaunchLeaseFileTest, ReceiptInodeReplacementWithSameBytesRefused) {
  auto lease = CreateFileLease(); ASSERT_TRUE(lease); ASSERT_TRUE(FilesStable(*lease));
  const auto file = root_.GetPath().AppendASCII("startup-launch-receipt.json");
  ASSERT_TRUE(base::DeleteFile(file));
  ASSERT_TRUE(base::WriteFile(file, "synthetic-filesystem-unit-only"));
  ASSERT_EQ(chmod(file.value().c_str(), 0600), 0);
  EXPECT_FALSE(FilesStable(*lease));
}
TEST_F(NativeStartupLaunchLeaseFileTest, ProfileSymlinkCannotBorrowFreshPath) {
  auto lease = CreateFileLease(); ASSERT_TRUE(lease); ASSERT_TRUE(FilesStable(*lease));
  ASSERT_TRUE(base::DeletePathRecursively(profile_));
  ASSERT_EQ(symlink(root_.GetPath().value().c_str(), profile_.value().c_str()), 0);
  EXPECT_FALSE(FilesStable(*lease));
}
TEST_F(NativeStartupLaunchLeaseFileTest, RenamedRootCannotBorrowReplacementRoot) {
  auto lease = CreateFileLease(); ASSERT_TRUE(lease); ASSERT_TRUE(FilesStable(*lease));
  const base::FilePath moved_path(root_.GetPath().value() + "-moved");
  ASSERT_TRUE(base::Move(root_.GetPath(), moved_path));
  base::ScopedTempDir moved;
  ASSERT_TRUE(moved.Set(moved_path));
  ASSERT_TRUE(base::CreateDirectory(profile_));
  ASSERT_EQ(chmod(root_.GetPath().value().c_str(), 0700), 0);
  ASSERT_EQ(chmod(profile_.value().c_str(), 0700), 0);
  EXPECT_FALSE(FilesStable(*lease));
}
TEST_F(NativeStartupLaunchLeaseFileTest, ExecutablePathReplacementCannotBorrowOriginalFd) {
  auto lease = CreateFileLease(); ASSERT_TRUE(lease); ASSERT_TRUE(FilesStable(*lease));
  const auto file = root_.GetPath().AppendASCII("synthetic-helper-only");
  ASSERT_TRUE(base::DeleteFile(file));
  ASSERT_TRUE(base::WriteFile(file, "synthetic-filesystem-unit-only"));
  ASSERT_EQ(chmod(file.value().c_str(), 0600), 0);
  EXPECT_FALSE(FilesStable(*lease));
}
}  // namespace aux
#endif
