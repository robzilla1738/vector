// Copyright 2026 The Aux Authors
// Native filesystem/cryptographic controls, not appearance qualification.
#include "chrome/browser/ui/aux/native_appearance_file_channel.h"
#include "chrome/browser/ui/aux/journey_fixture_path.h"
#include <vector>
#include <fcntl.h>
#include <sys/file.h>
#include <unistd.h>
#include "base/containers/span.h"
#include "base/command_line.h"
#include "base/files/file_util.h"
#include "base/files/scoped_temp_dir.h"
#include "base/json/json_reader.h"
#include "base/strings/string_number_conversions.h"
#include "chrome/test/base/testing_profile.h"
#include "content/public/test/browser_task_environment.h"
#include "crypto/keypair.h"
#include "crypto/sign.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
class NativeAppearanceFileChannelTest : public testing::Test {
 protected:
  void SetUp() override {
    base::FilePath path;
    ASSERT_TRUE(base::CreateTemporaryDirInDir(base::FilePath("/private/tmp"), "aux-native-journey-", &path));
    ASSERT_TRUE(root_.Set(path)); ASSERT_EQ(chmod(path.value().c_str(), 0700), 0);
    const auto user_data = path.AppendASCII("profile");
    ASSERT_TRUE(base::CreateDirectory(user_data)); ASSERT_EQ(chmod(user_data.value().c_str(), 0700), 0);
    command_.AppendSwitchPath("user-data-dir", user_data);
    command_.AppendSwitch("aux-native-appearance-observer");
    command_.AppendSwitch("aux-native-appearance-file-observer");
    metadata_ = std::make_unique<ScopedNativeObservationMetadataForTesting>(command_);
    profile_ = TestingProfile::Builder().SetPath(user_data.AppendASCII("Default")).Build();
    auto lease = TakeNativeAppearanceDirectoryLease(); ASSERT_TRUE(lease);
    channel_ = NativeAppearanceFileChannel::Create(std::move(*lease)); ASSERT_TRUE(channel_);
  }
  base::FilePath File() const { return root_.GetPath().AppendASCII("native-appearance-channel.jsonl"); }
  content::BrowserTaskEnvironment environment_;
  base::ScopedTempDir root_;
  base::CommandLine command_{base::CommandLine::NO_PROGRAM};
  std::unique_ptr<ScopedNativeObservationMetadataForTesting> metadata_;
  std::unique_ptr<TestingProfile> profile_;
  std::unique_ptr<NativeAppearanceFileChannel> channel_;
};
TEST_F(NativeAppearanceFileChannelTest, OriginalKeyVerifiesOriginalPublishedBytesAndMutationRefuses) {
  const auto receipt = channel_->Receipt(profile_.get()); ASSERT_TRUE(receipt);
  EXPECT_FALSE(TakeNativeAppearanceDirectoryLease());
  ASSERT_TRUE(channel_->Publish(profile_.get(), "{\"original\":true}")); environment_.RunUntilIdle();
  std::string bytes; ASSERT_TRUE(base::ReadFileToString(File(), &bytes));
  const auto end = bytes.find('\n'); ASSERT_NE(end, std::string::npos);
  const auto envelope = base::JSONReader::ReadDict(bytes.substr(end + 1), base::JSON_PARSE_RFC); ASSERT_TRUE(envelope);
  const auto* payload = envelope->FindString("payload"); ASSERT_TRUE(payload);
  const auto* signature_hex = envelope->FindString("signatureHex"); ASSERT_TRUE(signature_hex);
  const auto* key_hex = receipt->FindString("publicKeySpkiHex"); ASSERT_TRUE(key_hex);
  std::vector<uint8_t> signature, key_bytes;
  ASSERT_TRUE(base::HexStringToBytes(*signature_hex, &signature));
  ASSERT_TRUE(base::HexStringToBytes(*key_hex, &key_bytes));
  const auto key = crypto::keypair::PublicKey::FromSubjectPublicKeyInfo(key_bytes); ASSERT_TRUE(key);
  std::string signed_bytes = "AUX_NATIVE_APPEARANCE_FILE_V1\n" + *payload;
  EXPECT_TRUE(crypto::sign::Verify(crypto::sign::ED25519, *key, base::as_byte_span(signed_bytes), signature));
  signed_bytes += "changed";
  EXPECT_FALSE(crypto::sign::Verify(crypto::sign::ED25519, *key, base::as_byte_span(signed_bytes), signature));
}
TEST_F(NativeAppearanceFileChannelTest, QueuedOriginalRecordsRetainCapabilitiesAndOrderedSequence) {
  ASSERT_TRUE(channel_->Receipt(profile_.get()));
  ASSERT_TRUE(channel_->Publish(profile_.get(), "{\"first\":true}"));
  ASSERT_TRUE(channel_->Publish(profile_.get(), "{\"second\":true}"));
  environment_.RunUntilIdle();
  ASSERT_TRUE(channel_->Receipt(profile_.get()));
  std::string bytes; ASSERT_TRUE(base::ReadFileToString(File(), &bytes));
  const auto header_end = bytes.find('\n'); ASSERT_NE(header_end, std::string::npos);
  const auto first_end = bytes.find('\n', header_end + 1); ASSERT_NE(first_end, std::string::npos);
  const auto second_end = bytes.find('\n', first_end + 1); ASSERT_EQ(second_end, bytes.size() - 1);
  for (int sequence = 1; sequence <= 2; ++sequence) {
    const auto start = sequence == 1 ? header_end + 1 : first_end + 1;
    const auto end = sequence == 1 ? first_end : second_end;
    const auto envelope = base::JSONReader::ReadDict(bytes.substr(start, end - start), base::JSON_PARSE_RFC);
    ASSERT_TRUE(envelope); const auto* payload = envelope->FindString("payload"); ASSERT_TRUE(payload);
    const auto record = base::JSONReader::ReadDict(*payload, base::JSON_PARSE_RFC); ASSERT_TRUE(record);
    EXPECT_EQ(record->FindInt("sequence"), sequence);
  }
}
TEST_F(NativeAppearanceFileChannelTest, KernelWriterLeaseOutlivesLogicalRetirementAndEndsWithOriginalState) {
  const int reader = open(File().value().c_str(), O_RDONLY | O_NOFOLLOW | O_CLOEXEC);
  ASSERT_GE(reader, 0);
  EXPECT_NE(flock(reader, LOCK_EX | LOCK_NB), 0);
  channel_->Retire();
  EXPECT_NE(flock(reader, LOCK_EX | LOCK_NB), 0);
  channel_.reset();
  EXPECT_EQ(flock(reader, LOCK_EX | LOCK_NB), 0);
  EXPECT_EQ(flock(reader, LOCK_UN), 0);
  EXPECT_EQ(close(reader), 0);
}
TEST_F(NativeAppearanceFileChannelTest, ForeignProfileAndRetirementCannotPublish) {
  auto foreign = TestingProfile::Builder().SetPath(root_.GetPath().AppendASCII("foreign")).Build();
  EXPECT_FALSE(channel_->Receipt(foreign.get())); EXPECT_FALSE(channel_->Publish(foreign.get(), "{}"));
  ASSERT_TRUE(channel_->Receipt(profile_.get())); channel_->Retire();
  EXPECT_FALSE(channel_->Receipt(profile_.get())); EXPECT_FALSE(channel_->Publish(profile_.get(), "{}"));
}
TEST_F(NativeAppearanceFileChannelTest, NamedFileReplacementCannotUseOriginalDescriptor) {
  ASSERT_TRUE(channel_->Receipt(profile_.get()));
  ASSERT_TRUE(base::Move(File(), root_.GetPath().AppendASCII("original-channel")));
  ASSERT_TRUE(base::WriteFile(File(), "foreign")); ASSERT_EQ(chmod(File().value().c_str(), 0600), 0);
  EXPECT_FALSE(channel_->Receipt(profile_.get())); EXPECT_FALSE(channel_->Publish(profile_.get(), "{}"));
}
#endif
}  // namespace aux
