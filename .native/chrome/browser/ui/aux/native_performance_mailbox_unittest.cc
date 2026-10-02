// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_performance_mailbox.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <sys/stat.h>
#include "base/files/file_util.h"
#include "base/files/scoped_temp_dir.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
class NativePerformanceMailboxFileTest : public testing::Test {
 public:
  NativePerformanceMailboxFileTest();
  ~NativePerformanceMailboxFileTest() override;
  void SetUp() override {
    ASSERT_TRUE(root_.CreateUniqueTempDirUnderPath(base::FilePath("/private/tmp"), "aux-native-journey-mailbox-test-"));
    ASSERT_TRUE(base::SetPosixFilePermissions(root_.GetPath(), 0700));
    ASSERT_EQ(0, lstat(root_.GetPath().value().c_str(), &identity_));
  }
  void Write(const std::string& value) {
    ASSERT_TRUE(base::WriteFile(root_.GetPath().AppendASCII("performance-request.json"), value));
    ASSERT_TRUE(base::SetPosixFilePermissions(root_.GetPath().AppendASCII("performance-request.json"), 0600));
  }
  std::optional<base::DictValue> Read(uint64_t sequence = 0) {
    return ReadNativePerformanceMailboxFile(root_.GetPath(), sequence, identity_.st_dev, identity_.st_ino);
  }
  base::ScopedTempDir root_;
  struct stat identity_;
};
NativePerformanceMailboxFileTest::NativePerformanceMailboxFileTest() = default;
NativePerformanceMailboxFileTest::~NativePerformanceMailboxFileTest() = default;
TEST_F(NativePerformanceMailboxFileTest, FixedOwnedOperationAndHistoricalRequest) {
  Write(R"({"sequence":"1","operation":"prepareGuestTabSwitchPresentation"})");
  auto request = Read(); ASSERT_TRUE(request); EXPECT_EQ("1", *request->FindString("sequence"));
  EXPECT_EQ("prepareGuestTabSwitchPresentation", *request->FindString("operation"));
  EXPECT_FALSE(Read(1));
}
TEST_F(NativePerformanceMailboxFileTest, MissingFileIsIdle) { EXPECT_FALSE(Read()); }
TEST_F(NativePerformanceMailboxFileTest, MemoryOperationCannotCarryAProcessSelector) {
  Write(R"({"sequence":"1","operation":"sampleShellMemory"})");
  auto request = Read(); ASSERT_TRUE(request);
  EXPECT_EQ("sampleShellMemory", *request->FindString("operation"));
  Write(R"({"sequence":"1","operation":"sampleShellMemory","rendererPid":42})");
  auto refusal = Read(); ASSERT_TRUE(refusal);
  EXPECT_EQ("refused", *refusal->FindString("status"));
}
TEST_F(NativePerformanceMailboxFileTest, LittleFixedOperationsCannotSelectWindowOrNavigation) {
  Write(R"({"sequence":"1","operation":"prepareLittleWindowPresentation"})");
  auto ready = Read(); ASSERT_TRUE(ready);
  EXPECT_EQ("prepareLittleWindowPresentation", *ready->FindString("operation"));
  Write(R"({"sequence":"2","operation":"completeLittleWindowPresentation"})");
  auto complete = Read(1); ASSERT_TRUE(complete);
  EXPECT_EQ("completeLittleWindowPresentation", *complete->FindString("operation"));
  Write(R"({"sequence":"2","operation":"completeLittleWindowPresentation","windowId":99})");
  auto refused = Read(1); ASSERT_TRUE(refused); EXPECT_EQ("refused", *refused->FindString("status"));
  Write(R"({"sequence":"2","operation":"completeLittleWindowPresentation","url":"https://example.invalid"})");
  refused = Read(1); ASSERT_TRUE(refused); EXPECT_EQ("refused", *refused->FindString("status"));
}
TEST_F(NativePerformanceMailboxFileTest, ExtraSelectorOrSkippedSequenceRefuses) {
  Write(R"({"sequence":"1","operation":"prepareGuestTabSwitchPresentation","windowId":7})");
  auto refusal = Read(); ASSERT_TRUE(refusal); EXPECT_EQ("refused", *refusal->FindString("status"));
  Write(R"({"sequence":"3","operation":"completeGuestPresentation"})");
  refusal = Read(1); ASSERT_TRUE(refusal); EXPECT_EQ("refused", *refusal->FindString("status"));
}
TEST_F(NativePerformanceMailboxFileTest, ForeignPermissionAndRootIdentityRefuse) {
  Write(R"({"sequence":"1","operation":"prepareGuestTabSwitchPresentation"})");
  ASSERT_TRUE(base::SetPosixFilePermissions(root_.GetPath().AppendASCII("performance-request.json"), 0644));
  auto refusal = Read(); ASSERT_TRUE(refusal); EXPECT_EQ("refused", *refusal->FindString("status"));
  ASSERT_TRUE(base::SetPosixFilePermissions(root_.GetPath().AppendASCII("performance-request.json"), 0600));
  refusal = ReadNativePerformanceMailboxFile(root_.GetPath(), 0, identity_.st_dev, identity_.st_ino + 1);
  ASSERT_TRUE(refusal); EXPECT_EQ("refused", *refusal->FindString("status"));
}
TEST_F(NativePerformanceMailboxFileTest, SymlinkCannotSelectAnyOtherFile) {
  const auto target = root_.GetPath().AppendASCII("synthetic-target");
  ASSERT_TRUE(base::WriteFile(target, "untouched"));
  ASSERT_TRUE(base::CreateSymbolicLink(target, root_.GetPath().AppendASCII("performance-request.json")));
  auto refusal = Read(); ASSERT_TRUE(refusal); EXPECT_EQ("refused", *refusal->FindString("status"));
  std::string original; ASSERT_TRUE(base::ReadFileToString(target, &original)); EXPECT_EQ("untouched", original);
}
TEST_F(NativePerformanceMailboxFileTest, PipeIsRefusedWithoutWaitingForAWriter) {
  ASSERT_EQ(0, mkfifo(root_.GetPath().AppendASCII("performance-request.json").value().c_str(), 0600));
  auto refusal = Read(); ASSERT_TRUE(refusal); EXPECT_EQ("refused", *refusal->FindString("status"));
}
TEST_F(NativePerformanceMailboxFileTest, UnknownOperationAndRecordBoundRefuse) {
  Write(R"({"sequence":"1","operation":"pages.open"})");
  auto refusal = Read(); ASSERT_TRUE(refusal); EXPECT_EQ("refused", *refusal->FindString("status"));
  Write(std::string(513, 'x')); refusal = Read(); ASSERT_TRUE(refusal); EXPECT_EQ("refused", *refusal->FindString("status"));
}
}  // namespace aux
#endif
