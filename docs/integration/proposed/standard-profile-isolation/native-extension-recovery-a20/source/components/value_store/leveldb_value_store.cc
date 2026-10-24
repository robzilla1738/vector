// Copyright 2014 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "components/value_store/leveldb_value_store.h"

#include <inttypes.h>
#include <stdint.h>

#include <string_view>
#include <utility>

#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/notreached.h"
#include "base/memory/ptr_util.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/strings/stringprintf.h"
#include "base/strings/sys_string_conversions.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/sequenced_task_runner.h"
#include "base/threading/scoped_blocking_call.h"
#include "base/trace_event/memory_dump_manager.h"
#include "base/trace_event/process_memory_dump.h"
#include "third_party/leveldatabase/env_chromium.h"
#include "third_party/leveldatabase/src/include/leveldb/iterator.h"
#include "third_party/leveldatabase/src/include/leveldb/write_batch.h"

namespace {

const char kInvalidJson[] = "Invalid JSON";
const char kCannotSerialize[] = "Cannot serialize value to JSON";

constexpr std::array<const char*, 6> kAuxUiPreferenceKeys = {
    "aside.browserColorScheme", "aux.browserColorScheme.v2",
    "aside.capture.enabled", "aux.capture.enabled.v2",
    "aside.tabsTidy.customPrompt", "aux.tabsTidy.customPrompt.v2"};

bool IsValidAuxUiPreference(const base::Value& value, size_t family) {
  if (family == 1) {
    return value.is_bool();
  }
  if (!value.is_string()) {
    return false;
  }
  const std::string& text = value.GetString();
  if (family == 0) {
    return text == "system" || text == "light" || text == "dark";
  }
  // The supplied UI's 300-character limit counts UTF-16 code units.
  return base::UTF8ToUTF16(text).size() <= 300;
}


}  // namespace

namespace value_store {

LeveldbValueStore::LeveldbValueStore(const std::string& uma_client_name,
                                     const base::FilePath& db_path)
    : LazyLevelDb(uma_client_name, db_path) {
  base::trace_event::MemoryDumpManager::GetInstance()
      ->RegisterDumpProviderWithSequencedTaskRunner(
          this, "LeveldbValueStore",
          base::SequencedTaskRunner::GetCurrentDefault(),
          base::trace_event::MemoryDumpProvider::Options());
}

LeveldbValueStore::~LeveldbValueStore() {
  base::ScopedBlockingCall scoped_blocking_call(FROM_HERE,
                                                base::BlockingType::MAY_BLOCK);
  base::trace_event::MemoryDumpManager::GetInstance()->UnregisterDumpProvider(
      this);
}

size_t LeveldbValueStore::GetBytesInUse(const std::string& key) {
  // Let SettingsStorageQuotaEnforcer implement this.
  NOTREACHED() << "Not implemented";
}

size_t LeveldbValueStore::GetBytesInUse(const std::vector<std::string>& keys) {
  // Let SettingsStorageQuotaEnforcer implement this.
  NOTREACHED() << "Not implemented";
}

size_t LeveldbValueStore::GetBytesInUse() {
  // Let SettingsStorageQuotaEnforcer implement this.
  NOTREACHED() << "Not implemented";
}

ValueStore::ReadResult LeveldbValueStore::Get(const std::string& key) {
  return Get(std::vector<std::string>(1, key));
}

ValueStore::ReadResult LeveldbValueStore::GetKeys() {
  aux_migration_weak_factory_.InvalidateWeakPtrs();
  Status status = EnsureDbIsOpen();
  if (!status.ok()) {
    return ReadResult(std::move(status));
  }

  base::DictValue settings;

  std::unique_ptr<leveldb::Iterator> it(db()->NewIterator(read_options()));
  for (it->SeekToFirst(); it->Valid(); it->Next()) {
    std::string key = it->key().ToString();
    settings.Set(key, base::Value());
  }

  if (!it->status().ok()) {
    status.Merge(ToValueStoreError(it->status()));
    return ReadResult(std::move(status));
  }

  return ReadResult(std::move(settings), std::move(status));
}

ValueStore::ReadResult LeveldbValueStore::Get(
    const std::vector<std::string>& keys) {
  aux_migration_weak_factory_.InvalidateWeakPtrs();
  Status status = EnsureDbIsOpen();
  if (!status.ok())
    return ReadResult(std::move(status));

  base::DictValue settings;

  for (const std::string& key : keys) {
    std::optional<base::Value> setting;
    status.Merge(Read(key, &setting));
    if (!status.ok())
      return ReadResult(std::move(status));
    if (setting)
      settings.Set(key, std::move(*setting));
  }

  return ReadResult(std::move(settings), std::move(status));
}

ValueStore::ReadResult LeveldbValueStore::Get() {
  aux_migration_weak_factory_.InvalidateWeakPtrs();
  Status status = EnsureDbIsOpen();
  if (!status.ok())
    return ReadResult(std::move(status));

  base::DictValue settings;

  std::unique_ptr<leveldb::Iterator> it(db()->NewIterator(read_options()));
  for (it->SeekToFirst(); it->Valid(); it->Next()) {
    std::string key = it->key().ToString();
    std::optional<base::Value> value = base::JSONReader::Read(
        std::string_view(it->value().data(), it->value().size()),
        base::JSON_PARSE_CHROMIUM_EXTENSIONS);
    if (!value) {
      return ReadResult(Status(CORRUPTION,
                               Delete(key).ok() ? VALUE_RESTORE_DELETE_SUCCESS
                                                : VALUE_RESTORE_DELETE_FAILURE,
                               kInvalidJson));
    }
    settings.Set(key, std::move(*value));
  }

  if (!it->status().ok()) {
    status.Merge(ToValueStoreError(it->status()));
    return ReadResult(std::move(status));
  }

  return ReadResult(std::move(settings), std::move(status));
}

ValueStore::WriteResult LeveldbValueStore::Set(WriteOptions options,
                                               const std::string& key,
                                               const base::Value& value) {
  aux_migration_weak_factory_.InvalidateWeakPtrs();
  Status status = EnsureDbIsOpen();
  if (!status.ok())
    return WriteResult(std::move(status));

  leveldb::WriteBatch batch;
  ValueStoreChangeList changes;
  status.Merge(AddToBatch(options, key, value, &batch, &changes));
  if (!status.ok())
    return WriteResult(std::move(status));

  status.Merge(WriteToDb(&batch));
  return status.ok() ? WriteResult(std::move(changes), std::move(status))
                     : WriteResult(std::move(status));
}

ValueStore::WriteResult LeveldbValueStore::Set(
    WriteOptions options,
    const base::DictValue& settings) {
  aux_migration_weak_factory_.InvalidateWeakPtrs();
  Status status = EnsureDbIsOpen();
  if (!status.ok())
    return WriteResult(std::move(status));

  leveldb::WriteBatch batch;
  ValueStoreChangeList changes;

  for (const auto [key, value] : settings) {
    status.Merge(AddToBatch(options, key, value, &batch, &changes));
    if (!status.ok())
      return WriteResult(std::move(status));
  }

  status.Merge(WriteToDb(&batch));
  return status.ok() ? WriteResult(std::move(changes), std::move(status))
                     : WriteResult(std::move(status));
}

ValueStore::WriteResult LeveldbValueStore::Remove(const std::string& key) {
  return Remove(std::vector<std::string>(1, key));
}

ValueStore::WriteResult LeveldbValueStore::Remove(
    const std::vector<std::string>& keys) {
  aux_migration_weak_factory_.InvalidateWeakPtrs();
  Status status = EnsureDbIsOpen();
  if (!status.ok())
    return WriteResult(std::move(status));

  leveldb::WriteBatch batch;
  ValueStoreChangeList changes;

  for (const std::string& key : keys) {
    std::optional<base::Value> old_value;
    status.Merge(Read(key, &old_value));
    if (!status.ok())
      return WriteResult(std::move(status));

    if (old_value) {
      changes.emplace_back(key, std::move(old_value), std::nullopt);
      batch.Delete(key);
    }
  }

  leveldb::Status ldb_status;
  ldb_status = db()->Write(leveldb::WriteOptions(), &batch);
  if (!ldb_status.ok() && !ldb_status.IsNotFound()) {
    status.Merge(ToValueStoreError(ldb_status));
    return WriteResult(std::move(status));
  }
  return WriteResult(std::move(changes), std::move(status));
}

ValueStore::WriteResult LeveldbValueStore::Clear() {
  aux_migration_weak_factory_.InvalidateWeakPtrs();
  ValueStoreChangeList changes;

  ReadResult read_result = Get();
  if (!read_result.status().ok())
    return WriteResult(read_result.PassStatus());

  base::DictValue& whole_db = read_result.settings();
  while (!whole_db.empty()) {
    std::string next_key = whole_db.begin()->first;
    std::optional<base::Value> next_value = whole_db.Extract(next_key);
    changes.emplace_back(next_key, std::move(*next_value), std::nullopt);
  }

  DeleteDbFile();
  return WriteResult(std::move(changes), read_result.PassStatus());
}


LeveldbValueStore::AuxUiPreferenceCaptureResult
LeveldbValueStore::CaptureAuxUiPreferencesForMigration() {
  if (!db()) {
    return base::unexpected(Status(OTHER_ERROR,
                                  "Aux migration requires an open backend"));
  }
  auto capture = base::WrapUnique(new AuxUiPreferenceCapture());
  capture->owner = aux_migration_weak_factory_.GetWeakPtr();
  for (size_t i = 0; i < kAuxUiPreferenceKeys.size(); ++i) {
    std::string raw;
    const leveldb::Status status =
        db()->Get(read_options(), kAuxUiPreferenceKeys[i], &raw);
    if (status.IsNotFound()) {
      continue;
    }
    if (!status.ok()) {
      return base::unexpected(ToValueStoreError(status));
    }
    std::optional<base::Value> value =
        base::JSONReader::Read(raw, base::JSON_PARSE_CHROMIUM_EXTENSIONS);
    if (!value || !IsValidAuxUiPreference(*value, i / 2)) {
      return base::unexpected(Status(CORRUPTION,
                                    "Invalid Aux migration preference"));
    }
    capture->records[i] = std::move(raw);
  }
  for (size_t i = 0; i < kAuxUiPreferenceKeys.size(); i += 2) {
    if (capture->records[i] && capture->records[i + 1] &&
        capture->records[i] != capture->records[i + 1]) {
      return base::unexpected(Status(OTHER_ERROR,
                                    "Conflicting Aux migration preference"));
    }
  }
  return capture;
}

ValueStore::Status LeveldbValueStore::CommitAuxUiPreferenceMigration(
    std::unique_ptr<AuxUiPreferenceCapture> capture) {
  if (!capture || capture->owner.get() != this || !db() || capture->recovery) {
    return Status(OTHER_ERROR, "Stale or foreign Aux preference capture");
  }
  // Consume all captures before touching the database. A failed sync can have
  // an unknown outcome; only a new native-authorized capture may retry.
  aux_migration_weak_factory_.InvalidateWeakPtrs();
  for (size_t i = 0; i < kAuxUiPreferenceKeys.size(); ++i) {
    std::string raw;
    const leveldb::Status status =
        db()->Get(read_options(), kAuxUiPreferenceKeys[i], &raw);
    if (!status.ok() && !status.IsNotFound()) {
      return ToValueStoreError(status);
    }
    std::optional<std::string> current;
    if (status.ok()) {
      current = std::move(raw);
    }
    if (current != capture->records[i]) {
      return Status(OTHER_ERROR, "Aux preference changed after capture");
    }
  }
  leveldb::WriteBatch batch;
  for (size_t i = 0; i < kAuxUiPreferenceKeys.size(); i += 2) {
    if (capture->records[i]) {
      // Preserve exact original JSON bytes, including explicit false values.
      batch.Put(kAuxUiPreferenceKeys[i + 1], *capture->records[i]);
      batch.Delete(kAuxUiPreferenceKeys[i]);
    }
  }
  leveldb::WriteOptions options;
  options.sync = true;
  // An empty batch still requests sync; a retry must not mistake a previous
  // write with an unknown sync outcome for a durable completed migration.
  return ToValueStoreError(db()->Write(options, &batch));
}

ValueStore::AuxUiPreferenceReadbackResult
LeveldbValueStore::CommitRetainedAuxUiPreferenceMigration(
    std::shared_ptr<AuxUiPreferenceCapture> capture) {
  return ApplyRetainedAuxUiPreferenceMigration(std::move(capture), false, false);
}
ValueStore::AuxUiPreferenceReadbackResult
LeveldbValueStore::ReadRetainedAuxUiPreferenceMigration(
    std::shared_ptr<AuxUiPreferenceCapture> capture) {
  return ApplyRetainedAuxUiPreferenceMigration(std::move(capture), false, true);
}
ValueStore::AuxUiPreferenceReadbackResult
LeveldbValueStore::RestoreRetainedAuxUiPreferenceMigration(
    std::shared_ptr<AuxUiPreferenceCapture> capture) {
  return ApplyRetainedAuxUiPreferenceMigration(std::move(capture), true, false);
}
ValueStore::AuxUiPreferenceReadbackResult
LeveldbValueStore::ApplyRetainedAuxUiPreferenceMigration(
    std::shared_ptr<AuxUiPreferenceCapture> capture, bool restore, bool read_only) {
  if (!capture || capture->owner.get() != this || !db())
    return base::unexpected(Status(OTHER_ERROR, "Original retained Aux backend owner unavailable"));
  if (!read_only && !restore &&
      (capture->recovery || capture->retained_target_attempted || capture->retained_restore_attempted))
    return base::unexpected(Status(OTHER_ERROR, "Observe the original target attempt instead of replaying it"));
  if (!read_only && restore && !capture->retained_observation_known)
    return base::unexpected(Status(OTHER_ERROR, "Exact source/target readback required before restoring"));
  if (!read_only) {
    if (restore) capture->retained_restore_attempted = true;
    else capture->retained_target_attempted = true;
  }
  capture->retained_observation_known = false;
  auto read = [&]() -> base::expected<AuxUiPreferenceRecords, Status> {
    AuxUiPreferenceRecords records;
    for (size_t index = 0; index < kAuxUiPreferenceKeys.size(); ++index) {
      std::string raw;
      const auto status = db()->Get(read_options(), kAuxUiPreferenceKeys[index], &raw);
      if (!status.ok() && !status.IsNotFound()) return base::unexpected(ToValueStoreError(status));
      if (status.ok()) records[index] = std::move(raw);
    }
    return records;
  };
  auto before = read();
  if (!before.has_value()) return base::unexpected(std::move(before.error()));
  const auto source = capture->CopyRecordsForNativeJournal();
  const auto target = capture->CopyTargetRecordsForNativeJournal();
  if (before.value() != source && before.value() != target)
    return base::unexpected(Status(OTHER_ERROR, "Current Aux preference bytes match neither retained source nor target"));
  if (!read_only && !restore && before.value() != source)
    return base::unexpected(Status(OTHER_ERROR, "Aux source changed before target CAS"));
  const auto& expected = read_only ? before.value() : restore ? source : target;
  leveldb::WriteBatch batch;
  if (!read_only) for (size_t index = 0; index < kAuxUiPreferenceKeys.size(); ++index) {
    if (expected[index]) batch.Put(kAuxUiPreferenceKeys[index], *expected[index]);
    else batch.Delete(kAuxUiPreferenceKeys[index]);
  }
  leveldb::WriteOptions options;
  options.sync = true;
  // The original token is NOT invalidated by its own transaction. Every
  // ordinary existing Get/Write still invalidates it via the real factory.
  // An empty readback batch gives a fresh file-data sync after a lost result.
  const auto written = db()->Write(options, &batch);
  if (!written.ok()) return base::unexpected(ToValueStoreError(written));
  auto after = read();
  if (!after.has_value()) return base::unexpected(std::move(after.error()));
  if (capture->owner.get() != this || after.value() != expected)
    return base::unexpected(Status(OTHER_ERROR, "Aux raw preference readback changed after physical sync"));
  AuxUiPreferenceReadback result;
  result.records = std::move(after.value());
  result.matches_source = result.records == source;
  result.matches_target = result.records == target;
  result.file_data_synced = true;
  result.target_attempted = capture->retained_target_attempted;
  result.restore_attempted = capture->retained_restore_attempted;
  capture->retained_observation_known = true;
  return result;
}

ValueStore::AuxUiPreferenceCaptureResult
LeveldbValueStore::RequalifyAuxUiPreferenceRecovery(
    std::shared_ptr<AuxUiPreferenceCapture> fresh,
    AuxUiPreferenceRecoveryDescriptor descriptor) {
  if (!fresh || fresh->owner.get() != this || !db() || fresh->recovery ||
      fresh->retained_target_attempted || fresh->retained_restore_attempted)
    return base::unexpected(Status(OTHER_ERROR, "Real untouched fresh Aux backend capture required"));
  auto valid = ValidateAuxUiPreferenceRecoveryDescriptor(descriptor);
  if (!valid.ok()) return base::unexpected(std::move(valid));
  AuxUiPreferenceRecords current;
  for (size_t index = 0; index < kAuxUiPreferenceKeys.size(); ++index) {
    std::string raw;
    const auto status = db()->Get(read_options(), kAuxUiPreferenceKeys[index], &raw);
    if (!status.ok() && !status.IsNotFound()) return base::unexpected(ToValueStoreError(status));
    if (status.ok()) current[index] = std::move(raw);
  }
  if (fresh->owner.get() != this || current != fresh->records ||
      (current != descriptor.source && current != descriptor.target))
    return base::unexpected(Status(OTHER_ERROR, "Fresh fixed-six Aux contents do not match recorded source or target"));
  auto digest = FingerprintAuxUiPreferenceRecords(current);
  if (!digest.has_value()) return base::unexpected(std::move(digest.error()));
  if (*digest != descriptor.source_sha256 && *digest != descriptor.target_sha256)
    return base::unexpected(Status(OTHER_ERROR, "Fresh fixed-six Aux digest differs from recorded alternatives"));
  // This only observes the real open backend. No Sync/Write/repair/creation,
  // target replay, source adoption or durability claim occurs here.
  auto recovered = base::WrapUnique(new AuxUiPreferenceCapture());
  recovered->owner = fresh->owner;
  recovered->records = std::move(current);  // Fresh physical observation stays separate.
  recovered->recovery = std::move(descriptor);
  return recovered;
}

bool LeveldbValueStore::WriteToDbForTest(leveldb::WriteBatch* batch) {
  aux_migration_weak_factory_.InvalidateWeakPtrs();
  Status status = EnsureDbIsOpen();
  if (!status.ok())
    return false;
  return WriteToDb(batch).ok();
}

bool LeveldbValueStore::OnMemoryDump(
    const base::trace_event::MemoryDumpArgs& args,
    base::trace_event::ProcessMemoryDump* pmd) {
  // Return true so that the provider is not disabled.
  if (!db())
    return true;

  // All leveldb databases are already dumped by leveldb_env::DBTracker. Add
  // an edge to the existing dump.
  auto* tracker_dump =
      leveldb_env::DBTracker::GetOrCreateAllocatorDump(pmd, db());
  if (!tracker_dump)
    return true;

  auto* dump = pmd->CreateAllocatorDump(base::StringPrintf(
      "extensions/value_store/%s/0x%" PRIXPTR, open_histogram_name(),
      reinterpret_cast<uintptr_t>(this)));
  dump->AddScalar(base::trace_event::MemoryAllocatorDump::kNameSize,
                  base::trace_event::MemoryAllocatorDump::kUnitsBytes,
                  tracker_dump->GetSizeInternal());
  pmd->AddOwnershipEdge(dump->guid(), tracker_dump->guid());

  return true;
}

ValueStore::Status LeveldbValueStore::AddToBatch(
    ValueStore::WriteOptions options,
    const std::string& key,
    const base::Value& value,
    leveldb::WriteBatch* batch,
    ValueStoreChangeList* changes) {
  bool write_new_value = true;

  if (!(options & NO_GENERATE_CHANGES)) {
    std::optional<base::Value> old_value;
    Status status = Read(key, &old_value);
    if (!status.ok())
      return status;
    if (!old_value || *old_value != value) {
      changes->push_back(
          ValueStoreChange(key, std::move(old_value), value.Clone()));
    } else {
      write_new_value = false;
    }
  }

  if (write_new_value) {
    std::string value_as_json;
    if (!base::JSONWriter::Write(value, &value_as_json))
      return Status(OTHER_ERROR, kCannotSerialize);
    batch->Put(key, value_as_json);
  }

  return Status();
}

ValueStore::Status LeveldbValueStore::WriteToDb(leveldb::WriteBatch* batch) {
  return ToValueStoreError(db()->Write(write_options(), batch));
}

}  // namespace value_store
