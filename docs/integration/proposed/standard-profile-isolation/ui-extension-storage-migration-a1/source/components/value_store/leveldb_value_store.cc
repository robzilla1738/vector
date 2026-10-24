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


LeveldbValueStore::AuxUiPreferenceCapture::AuxUiPreferenceCapture() = default;
LeveldbValueStore::AuxUiPreferenceCapture::~AuxUiPreferenceCapture() = default;

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
  if (!capture || capture->owner.get() != this || !db()) {
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
