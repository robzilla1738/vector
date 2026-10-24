// Copyright 2014 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "components/value_store/value_store.h"

#include <cstdint>
#include <string_view>
#include <utility>

#include "base/check.h"
#include "base/json/json_reader.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/utf_string_conversions.h"
#include "crypto/hash.h"

namespace value_store {

// Implementation of Status.

ValueStore::Status::Status() = default;

ValueStore::Status::Status(StatusCode code, const std::string& message)
    : Status(code, RESTORE_NONE, message) {}

ValueStore::Status::Status(StatusCode code,
                           BackingStoreRestoreStatus restore_status,
                           const std::string& message)
    : code(code), restore_status(restore_status), message(message) {}

ValueStore::Status::Status(Status&& other) = default;

ValueStore::Status::~Status() = default;

ValueStore::Status& ValueStore::Status::operator=(Status&& rhs) = default;

void ValueStore::Status::Merge(const Status& status) {
  if (code == OK)
    code = status.code;
  if (message.empty() && !status.message.empty())
    message = status.message;
  if (restore_status == RESTORE_NONE)
    restore_status = status.restore_status;
}

// Implementation of ReadResult.

ValueStore::ReadResult::ReadResult(base::DictValue settings, Status status)
    : settings_(std::move(settings)), status_(std::move(status)) {}

ValueStore::ReadResult::ReadResult(Status status)
    : status_(std::move(status)) {}

ValueStore::ReadResult::ReadResult(ReadResult&& other) = default;

ValueStore::ReadResult::~ReadResult() = default;

ValueStore::ReadResult& ValueStore::ReadResult::operator=(ReadResult&& rhs) =
    default;

// Implementation of WriteResult.

ValueStore::WriteResult::WriteResult(ValueStoreChangeList changes,
                                     Status status)
    : changes_(std::move(changes)), status_(std::move(status)) {}

ValueStore::WriteResult::WriteResult(Status status)
    : status_(std::move(status)) {}

ValueStore::WriteResult::WriteResult(WriteResult&& other) = default;

ValueStore::WriteResult::~WriteResult() = default;

ValueStore::WriteResult& ValueStore::WriteResult::operator=(WriteResult&& rhs) =
    default;

ValueStore::AuxUiPreferenceCapture::AuxUiPreferenceCapture() = default;
ValueStore::AuxUiPreferenceCapture::~AuxUiPreferenceCapture() = default;

std::array<std::optional<std::string>, 6>
ValueStore::AuxUiPreferenceCapture::CopyRecordsForNativeJournal() const {
  return recovery ? recovery->source : records;
}

ValueStore::AuxUiPreferenceRecords
ValueStore::AuxUiPreferenceCapture::CopyFreshRecordsForNativeJournal() const {
  return records;
}

std::array<std::optional<std::string>, 6>
ValueStore::AuxUiPreferenceCapture::CopyTargetRecordsForNativeJournal() const {
  if (recovery) return recovery->target;
  auto target = records;
  for (size_t index = 0; index < target.size(); index += 2) if (records[index]) {
    target[index + 1] = records[index]; target[index].reset();
  }
  return target;
}

ValueStore::AuxUiPreferenceCaptureResult
ValueStore::CaptureAuxUiPreferencesForMigration() {
  return base::unexpected(Status(OTHER_ERROR, "Aux migration backend unsupported"));
}

ValueStore::Status ValueStore::CommitAuxUiPreferenceMigration(
    std::unique_ptr<AuxUiPreferenceCapture> capture) {
  return Status(OTHER_ERROR, "Aux migration backend unsupported");
}

ValueStore::AuxUiPreferenceReadbackResult
ValueStore::CommitRetainedAuxUiPreferenceMigration(std::shared_ptr<AuxUiPreferenceCapture> capture) {
  return base::unexpected(Status(OTHER_ERROR, "Retained Aux migration backend unsupported"));
}
ValueStore::AuxUiPreferenceReadbackResult
ValueStore::ReadRetainedAuxUiPreferenceMigration(std::shared_ptr<AuxUiPreferenceCapture> capture) {
  return base::unexpected(Status(OTHER_ERROR, "Retained Aux migration backend unsupported"));
}
ValueStore::AuxUiPreferenceReadbackResult
ValueStore::RestoreRetainedAuxUiPreferenceMigration(std::shared_ptr<AuxUiPreferenceCapture> capture) {
  return base::unexpected(Status(OTHER_ERROR, "Retained Aux migration backend unsupported"));
}

namespace {
constexpr size_t kAuxPreferenceRecordBytes = 64 * 1024;
void AuxPreferenceLength(std::string& bytes, uint64_t value) {
  for (size_t index = 0; index < 8; ++index) {
    bytes.push_back(static_cast<char>(value & 0xff)); value >>= 8;
  }
}
std::string AuxPreferenceDescriptorDigest(std::string_view source,
                                          std::string_view target) {
  std::string bytes("aux.ui-preference-recovery.v1"); bytes.push_back('\0');
  bytes.append(source); bytes.append(target);
  return base::HexEncodeLower(crypto::hash::Sha256(bytes));
}
}
ValueStore::AuxUiPreferenceFingerprintResult
ValueStore::FingerprintAuxUiPreferenceRecords(const AuxUiPreferenceRecords& records) {
  size_t total = 0;
  for (const auto& record : records) if (record) {
    if (record->size() > kAuxPreferenceRecordBytes - total)
      return base::unexpected(Status(OTHER_ERROR, "Fixed-six Aux journal records exceed 64 KiB"));
    total += record->size();
  }
  std::string bytes("aux.ui-preference-records.v1"); bytes.push_back('\0');
  AuxPreferenceLength(bytes, records.size());
  for (const auto& record : records) {
    bytes.push_back(record ? '\1' : '\0');
    AuxPreferenceLength(bytes, record ? record->size() : 0);
    if (record) bytes.append(*record);
  }
  return base::HexEncodeLower(crypto::hash::Sha256(bytes));
}
ValueStore::AuxUiPreferenceTargetResult
ValueStore::DeriveAuxUiPreferenceTargetRecords(const AuxUiPreferenceRecords& source) {
  auto bounded = FingerprintAuxUiPreferenceRecords(source);
  if (!bounded.has_value()) return base::unexpected(std::move(bounded.error()));
  for (size_t index = 0; index < source.size(); ++index) if (source[index]) {
    const auto value = base::JSONReader::Read(*source[index], base::JSON_PARSE_CHROMIUM_EXTENSIONS);
    const size_t family = index / 2;
    if (!value || (family == 1 ? !value->is_bool() : !value->is_string()))
      return base::unexpected(Status(CORRUPTION, "Invalid fixed Aux journal preference schema"));
    if (family != 1) {
      const auto& text = value->GetString();
      if (family == 0 ? (text != "system" && text != "light" && text != "dark") :
                        base::UTF8ToUTF16(text).size() > 300)
        return base::unexpected(Status(CORRUPTION, "Invalid fixed Aux journal preference value"));
    }
  }
  auto target = source;
  for (size_t index = 0; index < source.size(); index += 2) {
    if (source[index] && source[index + 1] && source[index] != source[index + 1])
      return base::unexpected(Status(OTHER_ERROR, "Conflicting original Aux journal preferences"));
    if (source[index]) { target[index + 1] = source[index]; target[index].reset(); }
  }
  return target;
}
ValueStore::AuxUiPreferenceRecoveryDescriptorResult
ValueStore::MakeAuxUiPreferenceRecoveryDescriptor(const AuxUiPreferenceRecords& source) {
  auto target = DeriveAuxUiPreferenceTargetRecords(source);
  if (!target.has_value()) return base::unexpected(std::move(target.error()));
  auto source_digest = FingerprintAuxUiPreferenceRecords(source);
  auto target_digest = FingerprintAuxUiPreferenceRecords(*target);
  if (!source_digest.has_value()) return base::unexpected(std::move(source_digest.error()));
  if (!target_digest.has_value()) return base::unexpected(std::move(target_digest.error()));
  AuxUiPreferenceRecoveryDescriptor descriptor;
  descriptor.source = source; descriptor.target = std::move(*target);
  descriptor.source_sha256 = std::move(*source_digest);
  descriptor.target_sha256 = std::move(*target_digest);
  descriptor.descriptor_sha256 = AuxPreferenceDescriptorDigest(
      descriptor.source_sha256, descriptor.target_sha256);
  return descriptor;
}
ValueStore::Status ValueStore::ValidateAuxUiPreferenceRecoveryDescriptor(
    const AuxUiPreferenceRecoveryDescriptor& descriptor) {
  auto expected = MakeAuxUiPreferenceRecoveryDescriptor(descriptor.source);
  if (!expected.has_value()) return std::move(expected.error());
  if (expected->target != descriptor.target || expected->source_sha256 != descriptor.source_sha256 ||
      expected->target_sha256 != descriptor.target_sha256 ||
      expected->descriptor_sha256 != descriptor.descriptor_sha256)
    return Status(OTHER_ERROR, "Fixed-six Aux recovery descriptor/digests do not match the original transform");
  return Status();
}
ValueStore::AuxUiPreferenceCaptureResult
ValueStore::RequalifyAuxUiPreferenceRecovery(std::shared_ptr<AuxUiPreferenceCapture> fresh,
    AuxUiPreferenceRecoveryDescriptor descriptor) {
  return base::unexpected(Status(OTHER_ERROR, "Aux preference recovery backend unsupported"));
}

}  // namespace value_store
