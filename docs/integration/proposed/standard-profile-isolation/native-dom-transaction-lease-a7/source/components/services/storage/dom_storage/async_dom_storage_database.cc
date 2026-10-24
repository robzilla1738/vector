// Copyright 2016 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "components/services/storage/dom_storage/async_dom_storage_database.h"

#include <algorithm>
#include <cstring>
#include <iterator>

#include "base/files/file_path.h"
#include "base/json/json_reader.h"
#include "base/strings/utf_string_conversions.h"
#include "url/gurl.h"
#include "url/origin.h"
#include "base/functional/callback_helpers.h"
#include "base/metrics/histogram_functions.h"
#include "base/strings/strcat.h"
#include "base/task/bind_post_task.h"
#include "components/services/storage/dom_storage/dom_storage_histogram_helper.h"
#include "mojo/public/cpp/bindings/callback_helpers.h"

namespace storage {

namespace {

// Records the duration of an operation to a histogram with the suffix
// corresponding to `metrics_type`.
void RecordDuration(const std::string& histogram_name,
                    DatabaseMetricsType metrics_type,
                    base::TimeTicks start_time) {
  base::UmaHistogramTimes(
      base::StrCat({histogram_name, GetHistogramSuffix(metrics_type)}),
      base::TimeTicks::Now() - start_time);
}

// Records status and duration histograms for a `StatusOr<T>` result.
template <typename T>
void RecordExpectedAndDuration(const std::string& status_histogram_name,
                               const std::string& duration_histogram_name,
                               DatabaseMetricsType metrics_type,
                               base::TimeTicks start_time,
                               const StatusOr<T>& result) {
  RecordDuration(duration_histogram_name, metrics_type, start_time);

  if (result.has_value()) {
    DbStatus::OK().Log(status_histogram_name, metrics_type);
  } else {
    result.error().Log(status_histogram_name, metrics_type);
  }
}

// Records status and duration histograms for a `DbStatus` result.
void RecordStatusAndDuration(const std::string& status_histogram_name,
                             const std::string& duration_histogram_name,
                             DatabaseMetricsType metrics_type,
                             base::TimeTicks start_time,
                             const DbStatus& status) {
  RecordDuration(duration_histogram_name, metrics_type, start_time);
  status.Log(status_histogram_name, metrics_type);
}

}  // namespace

namespace {
using AuxRawMap = std::map<DomStorageDatabase::Key, DomStorageDatabase::Value>;
struct AuxDomMap {
  DomStorageDatabase::MapLocator locator;
  AuxRawMap source;
  AuxRawMap target;
  std::optional<base::Time> last_accessed;
  std::optional<base::Time> last_modified;
  std::optional<base::ByteSize> total_size;
};
// Only DB-sequence tasks access this state. It retains exact original raw
// maps, including unrelated entries, but exports only reviewed UI families.
struct AuxDomCapture {
  std::vector<AuxDomMap> maps;
  bool target_attempted = false;
  bool file_data_synced = false;
};
struct AuxUiKeyRule { std::string_view source; std::string_view target; bool prefix; int scope; };
constexpr AuxUiKeyRule kAuxUiKeyRules[] = {
  {"aside.new-tab.omnibox-mode.v1", "aux.new-tab.omnibox-mode.v2", false, 1},
  {"aside.browserTabStyle", "aux.browserTabStyle.v2", false, 1},
  {"aside.last-final-confirm.v1", "aux.last-final-confirm.v2", false, 1},
  {"aside.last-permission-mode.v1", "aux.last-permission-mode.v2", false, 1},
  {"aside.new-tab.onboarding-helper-state.v1", "aux.new-tab.onboarding-helper-state.v2", false, 1},
  {"aside.chat-draft.v2:", "aux.chat-draft.v3:", true, 0},
  {"aside.chat-draft.v1:", "aux.chat-draft-text.v1:", true, 0},
  {"aside.sidepanel-new-session-settings.v1:", "aux.sidepanel-new-session-settings.v2:", true, 2},
  {"aside.chat-pending-new-session-message.v1", "aux.chat-pending-new-session-message.v2", false, 2},
};
bool AuxUiKeyMatches(std::string_view key, std::string_view pattern, bool prefix) {
  return prefix ? key.starts_with(pattern) : key == pattern;
}
// StorageArea's serialized Local Storage format has a Latin1/UTF16 tag.
// Session Storage uses raw UTF8 or native UTF16. Only ASCII identity suffixes
// are supported here; ambiguous encodings refuse, never reinterpret bytes.
std::optional<std::string> AuxDecodeKey(const DomStorageDatabase::Key& raw,
                                      bool local, int* format) {
  size_t offset = 0;
  bool utf16 = false;
  if (local) {
    if (raw.empty() || raw[0] > 1) return std::nullopt;
    *format = raw[0]; offset = 1; utf16 = raw[0] == 0;
  } else {
    utf16 = raw.size() >= 2 && (raw[0] == 0 || raw[1] == 0);
    *format = utf16 ? 2 : 3;
  }
  std::string result;
  if (utf16) {
    if ((raw.size() - offset) % sizeof(char16_t)) return std::nullopt;
    for (size_t i = offset; i < raw.size(); i += sizeof(char16_t)) {
      char16_t value;
      std::memcpy(&value, raw.data() + i, sizeof(value));
      if (value < 0x20 || value > 0x7e) return std::nullopt;
      result.push_back(static_cast<char>(value));
    }
  } else {
    for (size_t i = offset; i < raw.size(); ++i) {
      if (raw[i] < 0x20 || raw[i] > 0x7e) return std::nullopt;
      result.push_back(static_cast<char>(raw[i]));
    }
  }
  return result;
}
DomStorageDatabase::Key AuxEncodeKey(std::string_view key, int format) {
  DomStorageDatabase::Key raw;
  if (format == 0 || format == 1) raw.push_back(format);
  for (char ch : key) {
    if (format == 0 || format == 2) {
      char16_t value = static_cast<unsigned char>(ch);
      const auto* bytes = reinterpret_cast<const uint8_t*>(&value);
      raw.insert(raw.end(), bytes, bytes + sizeof(value));
    } else { raw.push_back(ch); }
  }
  return raw;
}
bool AuxKnownKey(std::string_view key, bool local) {
  for (const auto& rule : kAuxUiKeyRules) {
    if ((rule.scope == 1 && !local) || (rule.scope == 2 && local)) continue;
    if (AuxUiKeyMatches(key, rule.source, rule.prefix) ||
        AuxUiKeyMatches(key, rule.target, rule.prefix)) return true;
  }
  return false;
}
StatusOr<AuxRawMap> AuxBuildTarget(const AuxRawMap& source, bool local) {
  AuxRawMap target = source;
  std::set<std::string> logical_keys;
  for (const auto& [raw, value] : source) {
    int format;
    auto key = AuxDecodeKey(raw, local, &format);
    if (!key || !AuxKnownKey(*key, local)) continue;
    if (!logical_keys.insert(*key).second)
      return base::unexpected(DbStatus::InvalidArgument("Ambiguous Aux UI key encoding"));
    for (const auto& rule : kAuxUiKeyRules) {
      if (((rule.scope == 1 && !local) || (rule.scope == 2 && local)) || !AuxUiKeyMatches(*key, rule.source, rule.prefix)) continue;
      auto next = AuxEncodeKey(std::string(rule.target) + key->substr(rule.source.size()), format);
      auto existing = target.find(next);
      if (existing != target.end() && existing->second != value)
        return base::unexpected(DbStatus::InvalidArgument("Conflicting Aux UI preference generations"));
      target[next] = value;
      target.erase(raw);
      break;
    }
  }
  // A target encoded differently under the same logical key is also a
  // conflict, even when its bytes happen to have the same value.
  logical_keys.clear();
  for (const auto& [raw, value] : target) {
    int format;
    auto key = AuxDecodeKey(raw, local, &format);
    if (key && AuxKnownKey(*key, local) && !logical_keys.insert(*key).second)
      return base::unexpected(DbStatus::InvalidArgument("Ambiguous Aux UI target encoding"));
  }
  return target;
}
std::optional<std::string> AuxDecodeValue(const DomStorageDatabase::Value& raw, bool local) {
  size_t offset = 0;
  bool latin1 = false;
  if (local) {
    if (raw.empty() || raw[0] > 1) return std::nullopt;
    offset = 1; latin1 = raw[0] == 1;
  }
  std::u16string units;
  if (latin1) {
    for (size_t i = offset; i < raw.size(); ++i) units.push_back(raw[i]);
  } else {
    if ((raw.size() - offset) % sizeof(char16_t)) return std::nullopt;
    for (size_t i = offset; i < raw.size(); i += sizeof(char16_t)) {
      char16_t unit;
      std::memcpy(&unit, raw.data() + i, sizeof(unit));
      units.push_back(unit);
    }
  }
  if (units.size() > 5242880) return std::nullopt;
  std::string result;
  if (!base::UTF16ToUTF8(units.data(), units.size(), &result)) return std::nullopt;
  return result;
}
bool AuxValidValue(size_t rule, const DomStorageDatabase::Value& raw, bool local) {
  auto value = AuxDecodeValue(raw, local);
  if (!value) return false;
  switch (rule) {
    case 0: return *value == "ask" || *value == "search";
    case 1: return *value == "horizontal" || *value == "vertical";
    case 2: return *value == "true" || *value == "false";
    case 3: return *value == "read-only" || *value == "guard" || *value == "full-access";
    case 4: return *value == "folded" || *value == "expanded";
    case 6: return true;  // Exact raw draft text is retained unchanged.
    default: break;
  }
  auto parsed = base::JSONReader::ReadDict(*value, base::JSON_PARSE_RFC, 100);
  if (!parsed) return false;
  if (rule == 5) return parsed->FindInt("version") == 2 && parsed->FindString("plainText");
  if (rule == 7) return parsed->FindInt("version") == 1;
  const auto* session = parsed->FindString("sessionId");
  const auto* mode = parsed->FindString("mode");
  // A stored claim, including an old-looking one, is unresolved work. This
  // physical slice cannot infer that a sender/claim owner completed it.
  if (parsed->contains("claimId")) return false;
  return session && !session->empty() && parsed->FindDict("message") &&
      (!parsed->contains("mode") || (mode && (*mode == "client-send" || *mode == "display-only")));
}
DbStatus AuxValidateEntries(const AuxRawMap& entries, bool local) {
  for (const auto& [raw, value] : entries) {
    int format;
    auto key = AuxDecodeKey(raw, local, &format);
    if (!key) {
      for (const auto& rule : kAuxUiKeyRules) {
        if (!rule.prefix) continue;
        for (std::string_view prefix : {rule.source, rule.target}) {
          for (int encoding : local ? std::vector<int>{0, 1} : std::vector<int>{2, 3}) {
            auto encoded = AuxEncodeKey(prefix, encoding);
            if (raw.size() >= encoded.size() && std::equal(encoded.begin(), encoded.end(), raw.begin()))
              return DbStatus::NotSupported("Aux draft key needs unsupported encoding/scope handling");
          }
        }
      }
      continue;
    }
    for (size_t i = 0; i < std::size(kAuxUiKeyRules); ++i) {
      const auto& rule = kAuxUiKeyRules[i];
      bool old = AuxUiKeyMatches(*key, rule.source, rule.prefix);
      bool current = AuxUiKeyMatches(*key, rule.target, rule.prefix);
      if (!old && !current) continue;
      if ((rule.scope == 1 && !local) || (rule.scope == 2 && local))
        return DbStatus::NotSupported("Aux UI record is in the wrong physical store");
      size_t prefix_size = old ? rule.source.size() : rule.target.size();
      if (rule.prefix && (key->size() == prefix_size || key->size() - prefix_size > 4096))
        return DbStatus::NotSupported("Aux UI draft scope exceeds the supported bound");
      if (!AuxValidValue(i, value, local))
        return DbStatus::NotSupported("Aux UI value/claim needs explicit recovery");
    }
  }
  return DbStatus::OK();
}
AuxRawMap AuxSelectedEntries(const AuxRawMap& map, bool local) {
  AuxRawMap selected;
  for (const auto& [raw, value] : map) {
    int format;
    auto key = AuxDecodeKey(raw, local, &format);
    if (key && AuxKnownKey(*key, local)) selected.emplace(raw, value);
  }
  return selected;
}
bool AuxSameLocator(const DomStorageDatabase::MapLocator& a,
                    const DomStorageDatabase::MapLocator& b) {
  return a.storage_key() == b.storage_key() && a.map_id() == b.map_id() &&
         a.session_ids() == b.session_ids();
}
StatusOr<AsyncDomStorageDatabase::AuxUiSnapshot> AuxReadDomCapture(
    AuxDomCapture& capture, bool local, DomStorageDatabase* database) {
  auto metadata = database->ReadAllMetadata();
  if (!metadata.has_value()) return base::unexpected(metadata.error());
  const url::Origin agent = url::Origin::Create(GURL(
      "chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm/"));
  size_t inventory_count = 0;
  for (const auto& entry : metadata->map_metadata) {
    if (entry.map_locator.storage_key().origin() != agent) continue;
    ++inventory_count;
    bool found = false;
    for (const auto& captured : capture.maps)
      found |= AuxSameLocator(entry.map_locator, captured.locator);
    if (!found) return base::unexpected(DbStatus::IOError("Aux DOM map topology changed"));
  }
  if (inventory_count != capture.maps.size())
    return base::unexpected(DbStatus::IOError("Aux DOM map inventory changed"));
  AsyncDomStorageDatabase::AuxUiSnapshot result;
  result.matches_source = true;
  result.matches_target = true;
  for (const auto& map : capture.maps) {
    auto current = database->ReadMapKeyValues(map.locator.Clone());
    if (!current.has_value()) return base::unexpected(current.error());
    result.matches_source &= current.value() == map.source;
    result.matches_target &= current.value() == map.target;
    result.maps.push_back({map.locator.storage_key(), map.locator.session_ids(),
        AuxSelectedEntries(map.source, local), AuxSelectedEntries(map.target, local)});
  }
  result.file_data_synced = capture.file_data_synced;
  result.target_attempted = capture.target_attempted;
  return result;
}
}  // namespace

struct AsyncDomStorageDatabase::AuxUiMigrationLease::State {
  base::WeakPtr<AsyncDomStorageDatabase> owner;
  base::UnguessableToken token = base::UnguessableToken::Create();
  std::shared_ptr<AuxDomCapture> backend = std::make_shared<AuxDomCapture>();
  std::vector<base::OnceClosure> deferred;
  bool pending = false;
  bool tainted = false;
  bool target_attempted = false;
  bool resolved_and_synced = false;
};
AsyncDomStorageDatabase::AuxUiMigrationLease::AuxUiMigrationLease(
    std::shared_ptr<State> state) : state_(std::move(state)) {}
AsyncDomStorageDatabase::AuxUiMigrationLease::~AuxUiMigrationLease() = default;
const base::UnguessableToken&
AsyncDomStorageDatabase::AuxUiMigrationLease::token() const { return state_->token; }

bool AsyncDomStorageDatabase::DeferForAuxUiMigration(base::OnceClosure operation) {
  if (!aux_ui_migration_gate_) return false;
  aux_ui_migration_gate_->tainted = true;
  aux_ui_migration_gate_->deferred.push_back(std::move(operation));
  return true;
}
void AsyncDomStorageDatabase::BeginAuxUiMigrationLease(AuxUiLeaseCallback callback) {
  if (!is_database_opened_ || !aux_on_disk_ || aux_ui_migration_gate_ ||
      !committers_.empty()) {
    std::move(callback).Run(base::unexpected(DbStatus::NotSupported(
        "Aux DOM lease requires an existing disk backend and no live cache owners")), {});
    return;
  }
  auto state = std::make_shared<AuxUiMigrationLease::State>();
  state->owner = weak_ptr_factory_.GetWeakPtr();
  state->pending = true;
  aux_ui_migration_gate_ = state;
  bool local = storage_type_ == StorageType::kLocalStorage;
  auto reply = base::BindOnce(
      [](std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiLeaseCallback callback,
         StatusOr<AuxUiSnapshot> snapshot) {
        auto* owner = state->owner.get();
        state->pending = false;
        if (!owner || owner->aux_ui_migration_gate_ != state || state->tainted ||
            !owner->committers_.empty()) {
          snapshot = base::unexpected(DbStatus::IOError("Aux DOM owner or writer inventory changed"));
        }
        if (!snapshot.has_value()) {
          if (owner && owner->aux_ui_migration_gate_ == state)
            owner->ReleaseAuxUiMigrationGate(state);
          std::move(callback).Run(base::unexpected(snapshot.error()), {});
          return;
        }
        state->resolved_and_synced = snapshot->file_data_synced;
        std::move(callback).Run(std::unique_ptr<AuxUiMigrationLease>(new AuxUiMigrationLease(state)),
                                std::move(snapshot).value());
      }, state, std::move(callback));
  auto guarded = mojo::WrapCallbackWithDefaultInvokeIfNotRun(
      base::BindPostTaskToCurrentDefault(std::move(reply)),
      StatusOr<AuxUiSnapshot>(base::unexpected(DbStatus::IOError("Aux DOM capture reply lost"))));
  database_.PostTaskWithThisObject(base::BindOnce(
      [](std::shared_ptr<AuxDomCapture> capture,
         std::shared_ptr<AuxMigrationWriteStatus> writes, bool local,
         base::OnceCallback<void(StatusOr<AuxUiSnapshot>)> callback,
         DomStorageDatabase* database) {
        auto run = [&]() -> StatusOr<AuxUiSnapshot> {
          if (writes->first_error) return base::unexpected(*writes->first_error);
          auto metadata = database->ReadAllMetadata();
          if (!metadata.has_value()) return base::unexpected(metadata.error());
          const url::Origin agent = url::Origin::Create(GURL(
              "chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm/"));
          size_t scan_bytes = 0;
          size_t export_bytes = 0;
          for (auto& map : metadata->map_metadata) {
            if (map.map_locator.storage_key().origin() != agent) continue;
            if (capture->maps.size() >= 256)
              return base::unexpected(DbStatus::NotSupported("Too many Aux DOM maps"));
            for (const auto& existing : capture->maps) {
              if (existing.locator.map_id() == map.map_locator.map_id() &&
                  existing.locator.storage_key() == map.map_locator.storage_key())
                return base::unexpected(DbStatus::NotSupported("Repeated or cloned Aux DOM map needs topology handling"));
            }
            auto entries = database->ReadMapKeyValues(map.map_locator.Clone());
            if (!entries.has_value()) return base::unexpected(entries.error());
            for (const auto& [key, value] : entries.value()) {
              scan_bytes += key.size() + value.size();
              if (scan_bytes > 64 * 1024 * 1024)
                return base::unexpected(DbStatus::NotSupported("Aux DOM capture exceeds finite bound"));
            }
            DbStatus validated = AuxValidateEntries(entries.value(), local);
            if (!validated.ok()) return base::unexpected(validated);
            auto target = AuxBuildTarget(entries.value(), local);
            if (!target.has_value()) return base::unexpected(target.error());
            for (const auto& selected : {AuxSelectedEntries(entries.value(), local),
                                        AuxSelectedEntries(target.value(), local)}) {
              for (const auto& [key, value] : selected) export_bytes += key.size() + value.size();
            }
            if (export_bytes > 16 * 1024 * 1024)
              return base::unexpected(DbStatus::NotSupported("Aux DOM wire capture exceeds finite bound"));
            capture->maps.push_back({std::move(map.map_locator), std::move(entries).value(),
                std::move(target).value(), map.last_accessed, map.last_modified, map.total_size});
          }
          DbStatus sync = database->SyncForAuxMigration();
          if (!sync.ok()) return base::unexpected(sync);
          capture->file_data_synced = true;
          return AuxReadDomCapture(*capture, local, database);
        };
        std::move(callback).Run(run());
      }, state->backend, aux_migration_write_status_, local, std::move(guarded)));
}
void AsyncDomStorageDatabase::ReadAuxUiMigrationLease(
    AuxUiMigrationLease& lease, AuxUiReadCallback callback) {
  RunAuxUiMigrationOperation(lease, 0, std::move(callback));
}
void AsyncDomStorageDatabase::CommitAuxUiMigrationLease(
    AuxUiMigrationLease& lease, AuxUiReadCallback callback) {
  RunAuxUiMigrationOperation(lease, 1, std::move(callback));
}
void AsyncDomStorageDatabase::RestoreAuxUiMigrationLease(
    AuxUiMigrationLease& lease, AuxUiReadCallback callback) {
  RunAuxUiMigrationOperation(lease, 2, std::move(callback));
}
void AsyncDomStorageDatabase::RunAuxUiMigrationOperation(
    AuxUiMigrationLease& lease, int operation, AuxUiReadCallback callback) {
  auto state = lease.state_;
  if (state != aux_ui_migration_gate_ || state->owner.get() != this ||
      state->pending || !committers_.empty() ||
      (operation == 1 && (state->tainted || state->target_attempted))) {
    std::move(callback).Run(base::unexpected(DbStatus::IOError("Aux DOM lease cannot run this operation")));
    return;
  }
  state->pending = true;
  state->resolved_and_synced = false;
  if (operation != 0) state->target_attempted = true;
  const bool local = storage_type_ == StorageType::kLocalStorage;
  auto reply = base::BindOnce(
      [](std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiReadCallback callback,
         StatusOr<AuxUiSnapshot> result) {
        state->pending = false;
        auto* owner = state->owner.get();
        if (!owner || owner->aux_ui_migration_gate_ != state || !owner->committers_.empty()) {
          result = base::unexpected(DbStatus::IOError("Aux DOM owner changed during operation"));
        }
        if (result.has_value()) {
          result->ordinary_work_queued = state->tainted || !state->deferred.empty();
          state->resolved_and_synced = result->file_data_synced &&
              (result->matches_source || result->matches_target);
        }
        std::move(callback).Run(std::move(result));
      }, state, std::move(callback));
  auto guarded = mojo::WrapCallbackWithDefaultInvokeIfNotRun(
      base::BindPostTaskToCurrentDefault(std::move(reply)),
      StatusOr<AuxUiSnapshot>(base::unexpected(DbStatus::IOError("Aux DOM operation reply lost"))));
  database_.PostTaskWithThisObject(base::BindOnce(
      [](std::shared_ptr<AuxDomCapture> capture, bool local, int operation,
         base::OnceCallback<void(StatusOr<AuxUiSnapshot>)> callback,
         DomStorageDatabase* database) {
        auto run = [&]() -> StatusOr<AuxUiSnapshot> {
          auto before = AuxReadDomCapture(*capture, local, database);
          if (!before.has_value()) return base::unexpected(before.error());
          if (operation != 0) {
            if ((operation == 1 && !before->matches_source) ||
                (operation == 2 && !before->matches_source && !before->matches_target))
              return base::unexpected(DbStatus::IOError("Aux DOM exact source/target CAS refused"));
            capture->target_attempted = true;
            capture->file_data_synced = false;
            std::vector<DomStorageDatabase::MapBatchUpdate> updates;
            for (const auto& map : capture->maps) {
              if (map.source == map.target) continue;
              const AuxRawMap& desired = operation == 1 ? map.target : map.source;
              const AuxRawMap& previous = operation == 1 ? map.source : map.target;
              DomStorageDatabase::MapBatchUpdate update(map.locator.Clone());
              for (const auto& [key, value] : previous)
                if (!desired.contains(key)) update.keys_to_delete.push_back(key);
              for (const auto& [key, value] : desired) {
                auto old = previous.find(key);
                if (old == previous.end() || old->second != value)
                  update.entries_to_add.emplace_back(key, value);
              }
              if (local) {
                update.map_usage.emplace();
                if (map.last_accessed) update.map_usage->SetLastAccessed(*map.last_accessed);
                if (map.last_modified && map.total_size) {
                  size_t bytes = 0;
                  for (const auto& [key, value] : desired) bytes += key.size() + value.size();
                  update.map_usage->SetLastModifiedAndTotalSize(*map.last_modified,
                      operation == 1 ? base::ByteSize(bytes) : *map.total_size);
                }
              }
              updates.push_back(std::move(update));
            }
            DbStatus update = database->UpdateMaps(std::move(updates));
            if (!update.ok()) return base::unexpected(update);
          }
          // Read-only recovery can resolve an uncertain prior successful batch,
          // but only after a fresh real sync and exact source/target readback.
          DbStatus sync = database->SyncForAuxMigration();
          if (!sync.ok()) return base::unexpected(sync);
          capture->file_data_synced = true;
          return AuxReadDomCapture(*capture, local, database);
        };
        std::move(callback).Run(run());
      }, state->backend, local, operation, std::move(guarded)));
}
bool AsyncDomStorageDatabase::ReleaseAuxUiMigrationLease(AuxUiMigrationLease& lease) {
  auto state = lease.state_;
  if (state != aux_ui_migration_gate_ || state->owner.get() != this || state->pending ||
      (state->target_attempted && !state->resolved_and_synced)) return false;
  ReleaseAuxUiMigrationGate(std::move(state));
  return true;
}
void AsyncDomStorageDatabase::ReleaseAuxUiMigrationGate(
    std::shared_ptr<AuxUiMigrationLease::State> state) {
  CHECK(aux_ui_migration_gate_ == state);
  auto deferred = std::move(state->deferred);
  aux_ui_migration_gate_.reset();
  for (auto& operation : deferred) std::move(operation).Run();
}

// static
std::unique_ptr<AsyncDomStorageDatabase> AsyncDomStorageDatabase::Open(
    StorageType storage_type,
    const base::FilePath& dir_to_open,
    const std::optional<base::trace_event::MemoryAllocatorDumpGuid>&
        memory_dump_id,
    const base::FilePath& dir_to_destroy,
    OpenCallback callback) {
  std::unique_ptr<AsyncDomStorageDatabase> instance(
      new AsyncDomStorageDatabase(storage_type));

  instance->aux_on_disk_ = !dir_to_open.empty();
  DomStorageDatabaseFactory::Open(
      storage_type, dir_to_open, memory_dump_id, dir_to_destroy,
      base::BindOnce(&AsyncDomStorageDatabase::OnDatabaseOpened,
                     instance->weak_ptr_factory_.GetWeakPtr(),
                     std::move(callback)));

  return instance;
}

AsyncDomStorageDatabase::AsyncDomStorageDatabase(StorageType storage_type)
    : storage_type_(storage_type) {}

AsyncDomStorageDatabase::~AsyncDomStorageDatabase() {
  DCHECK(committers_.empty());
}

void AsyncDomStorageDatabase::ReadMapKeyValues(
    DomStorageDatabase::MapLocator map_locator,
    ReadMapKeyValuesCallback callback) {
  CHECK(is_database_opened_);

  RunTaskOnDbSequenceAndRecordHistograms<
      std::map<DomStorageDatabase::Key, DomStorageDatabase::Value>>(
      "ReadMapKeyValues",
      base::BindOnce(
          [](DomStorageDatabase::MapLocator map_locator,
             DomStorageDatabase* database) {
            return database->ReadMapKeyValues(std::move(map_locator));
          },
          std::move(map_locator)),
      std::move(callback));
}

void AsyncDomStorageDatabase::CloneMap(
    DomStorageDatabase::MapLocator source_map,
    DomStorageDatabase::MapLocator target_map,
    StatusCallback callback) {
  CHECK(is_database_opened_);

  RunTaskOnDbSequenceAndRecordHistograms(
      "CloneMap",
      base::BindOnce(
          [](DomStorageDatabase::MapLocator source_map,
             DomStorageDatabase::MapLocator target_map,
             DomStorageDatabase* database) {
            return database->CloneMap(std::move(source_map),
                                      std::move(target_map));
          },
          std::move(source_map), std::move(target_map)),
      std::move(callback));
}

void AsyncDomStorageDatabase::ReadAllMetadata(
    ReadAllMetadataCallback callback) {
  CHECK(is_database_opened_);

  RunTaskOnDbSequenceAndRecordHistograms<DomStorageDatabase::Metadata>(
      "ReadAllMetadata", base::BindOnce([](DomStorageDatabase* database) {
        return database->ReadAllMetadata();
      }),
      std::move(callback));
}

void AsyncDomStorageDatabase::PutMetadata(DomStorageDatabase::Metadata metadata,
                                          StatusCallback callback) {
  CHECK(is_database_opened_);

  RunTaskOnDbSequenceAndRecordHistograms(
      "PutMetadata",
      base::BindOnce(
          [](DomStorageDatabase::Metadata metadata,
             DomStorageDatabase* database) {
            return database->PutMetadata(std::move(metadata));
          },
          std::move(metadata)),
      std::move(callback));
}

void AsyncDomStorageDatabase::DeleteStorageKeysFromSession(
    std::string session_id,
    std::vector<blink::StorageKey> metadata_to_delete,
    std::vector<DomStorageDatabase::MapLocator> maps_to_delete,
    StatusCallback callback) {
  CHECK(is_database_opened_);

  RunTaskOnDbSequenceAndRecordHistograms(
      "DeleteStorageKeysFromSession",
      base::BindOnce(
          [](std::string session_id,
             std::vector<blink::StorageKey> metadata_to_delete,
             std::vector<DomStorageDatabase::MapLocator> maps_to_delete,
             DomStorageDatabase* database) {
            return database->DeleteStorageKeysFromSession(
                std::move(session_id), std::move(metadata_to_delete),
                std::move(maps_to_delete));
          },
          std::move(session_id), std::move(metadata_to_delete),
          std::move(maps_to_delete)),
      std::move(callback));
}

void AsyncDomStorageDatabase::DeleteSessions(
    std::vector<std::string> session_ids,
    std::vector<DomStorageDatabase::MapLocator> maps_to_delete,
    StatusCallback callback) {
  CHECK(is_database_opened_);

  RunTaskOnDbSequenceAndRecordHistograms(
      "DeleteSessions",
      base::BindOnce(
          [](std::vector<std::string> session_ids,
             std::vector<DomStorageDatabase::MapLocator> maps_to_delete,
             DomStorageDatabase* database) {
            return database->DeleteSessions(std::move(session_ids),
                                            std::move(maps_to_delete));
          },
          std::move(session_ids), std::move(maps_to_delete)),
      std::move(callback));
}

void AsyncDomStorageDatabase::PurgeOriginsForShutdown(
    std::set<url::Origin> origins) {
  CHECK(is_database_opened_);

  RunTaskOnDbSequenceAndRecordHistograms(
      "PurgeOrigins",
      base::BindOnce(
          [](std::set<url::Origin> origins, DomStorageDatabase* database) {
            return database->PurgeOrigins(std::move(origins));
          },
          std::move(origins)),
      base::DoNothing());
}

void AsyncDomStorageDatabase::CleanUpStaleData(StatusCallback callback) {
  CHECK(is_database_opened_);

  RunTaskOnDbSequenceAndRecordHistograms(
      "CleanUpStaleData", base::BindOnce([](DomStorageDatabase* database) {
        return database->CleanUpStaleData();
      }),
      std::move(callback));
}

void AsyncDomStorageDatabase::AddCommitter(Committer* source) {
  if (aux_ui_migration_gate_) aux_ui_migration_gate_->tainted = true;
  auto iter = committers_.insert(source);
  DCHECK(iter.second);
}

void AsyncDomStorageDatabase::RemoveCommitter(Committer* source) {
  if (aux_ui_migration_gate_) aux_ui_migration_gate_->tainted = true;
  size_t erased = committers_.erase(source);
  DCHECK(erased);
}

void AsyncDomStorageDatabase::InitiateCommit() {
  CHECK(is_database_opened_);
  if (aux_ui_migration_gate_ && DeferForAuxUiMigration(base::BindOnce(&AsyncDomStorageDatabase::InitiateCommit,
                                          weak_ptr_factory_.GetWeakPtr()))) return;

  std::vector<DomStorageDatabase::MapBatchUpdate> commits;
  std::vector<base::OnceCallback<void(DbStatus)>> commit_dones;
  commit_dones.reserve(committers_.size());
  for (Committer* committer : committers_) {
    std::optional<DomStorageDatabase::MapBatchUpdate> commit =
        committer->CollectCommit();
    if (commit) {
      commits.push_back(*std::move(commit));
      commit_dones.emplace_back(committer->GetCommitCompleteCallback());
    }
  }

  auto run_all = base::BindOnce(
      [](std::vector<base::OnceCallback<void(DbStatus)>> callbacks,
         DbStatus status) {
        for (auto& callback : callbacks) {
          std::move(callback).Run(status);
        }
      },
      std::move(commit_dones));

  RunTaskOnDbSequenceAndRecordHistograms(
      "UpdateMaps",
      base::BindOnce(
          [](std::vector<DomStorageDatabase::MapBatchUpdate> commits,
             DomStorageDatabase* database) {
            return database->UpdateMaps(std::move(commits));
          },
          std::move(commits)),
      std::move(run_all));
}

void AsyncDomStorageDatabase::DrainCommitsForAuxMigration(
    StatusCallback callback) {
  CHECK(is_database_opened_);
  if (aux_ui_migration_gate_ && DeferForAuxUiMigration(base::BindOnce(&AsyncDomStorageDatabase::DrainCommitsForAuxMigration,
      weak_ptr_factory_.GetWeakPtr(), std::move(callback)))) return;
  auto reply = base::BindOnce(
      [](base::WeakPtr<AsyncDomStorageDatabase> owner, StatusCallback callback,
         DbStatus status) {
        if (!owner) {
          status = DbStatus::IOError("Aux storage frontend was destroyed");
        }
        std::move(callback).Run(std::move(status));
      },
      weak_ptr_factory_.GetWeakPtr(), std::move(callback));
  auto guarded_reply = mojo::WrapCallbackWithDefaultInvokeIfNotRun(
      base::BindPostTaskToCurrentDefault(std::move(reply)),
      DbStatus::IOError("Aux storage completion reply was lost"));

  InitiateCommit();
  // SequenceBound preserves DB task order. No successful shortcut for an empty
  // current batch: earlier posted writes must still reach this queue position.
  database_.PostTaskWithThisObject(base::BindOnce(
      [](std::shared_ptr<AuxMigrationWriteStatus> state, StatusCallback callback,
         DomStorageDatabase* database) {
        if (!state->first_error) {
          DbStatus status = database->SyncForAuxMigration();
          if (!status.ok()) {
            state->first_error = std::move(status);
          }
        }
        std::move(callback).Run(state->first_error.value_or(DbStatus::OK()));
      },
      aux_migration_write_status_, std::move(guarded_reply)));
}

void AsyncDomStorageDatabase::OnDatabaseOpened(
    OpenCallback callback,
    DomStorageDatabaseFactory::OpenResult result) {
  CHECK(!is_database_opened_);
  metrics_type_ = result.metrics_type;
  is_sqlite_ = result.is_sqlite;
  database_ = result.TakeDatabase();
  is_database_opened_ = result.open_status.ok();
  if (is_database_opened_) {
    CHECK(database_);
  }

  std::move(callback).Run(OpenOutcome{std::move(result.open_status),
                                      std::move(result.destroy_outcome)});
}

std::string_view AsyncDomStorageDatabase::StorageTypeForHistograms() const {
  switch (storage_type_) {
    case StorageType::kLocalStorage:
      return "Storage.LocalStorage";
    case StorageType::kSessionStorage:
      return "Storage.SessionStorage";
  }
}

std::string AsyncDomStorageDatabase::GetHistogram(
    std::string_view operation) const {
  return base::StrCat({StorageTypeForHistograms(), ".", operation});
}

std::string AsyncDomStorageDatabase::GetDurationHistogram(
    std::string_view operation) const {
  return base::StrCat({StorageTypeForHistograms(), ".Duration.", operation});
}

void AsyncDomStorageDatabase::RunTaskOnDbSequenceAndRecordHistograms(
    std::string_view operation,
    base::OnceCallback<DbStatus(DomStorageDatabase*)> db_task,
    StatusCallback callback) {
  if (aux_ui_migration_gate_ && DeferForAuxUiMigration(base::BindOnce(
      [](base::WeakPtr<AsyncDomStorageDatabase> owner, std::string operation,
         base::OnceCallback<DbStatus(DomStorageDatabase*)> task, StatusCallback callback) {
        if (owner) owner->RunTaskOnDbSequenceAndRecordHistograms(operation, std::move(task), std::move(callback));
      }, weak_ptr_factory_.GetWeakPtr(), std::string(operation), std::move(db_task), std::move(callback)))) return;
  database_.PostTaskWithThisObject(base::BindOnce(
      [](std::shared_ptr<AuxMigrationWriteStatus> state,
         base::OnceCallback<DbStatus(DomStorageDatabase*)> db_task,
         std::string status_histogram_name, std::string duration_histogram_name,
         DatabaseMetricsType metrics_type, StatusCallback callback,
         DomStorageDatabase* database) {
        base::TimeTicks start = base::TimeTicks::Now();
        DbStatus status = std::move(db_task).Run(database);
        if (!status.ok() && !state->first_error) {
          state->first_error = status;
        }
        RecordStatusAndDuration(status_histogram_name, duration_histogram_name,
                                metrics_type, start, status);
        std::move(callback).Run(std::move(status));
      },
      aux_migration_write_status_, std::move(db_task), GetHistogram(operation),
      GetDurationHistogram(operation), metrics_type_,
      base::BindPostTaskToCurrentDefault(std::move(callback))));
}

template <typename T>
void AsyncDomStorageDatabase::RunTaskOnDbSequenceAndRecordHistograms(
    std::string_view operation,
    base::OnceCallback<StatusOr<T>(DomStorageDatabase*)> db_task,
    base::OnceCallback<void(StatusOr<T>)> callback) {
  if (aux_ui_migration_gate_ && DeferForAuxUiMigration(base::BindOnce(
      [](base::WeakPtr<AsyncDomStorageDatabase> owner, std::string operation,
         base::OnceCallback<StatusOr<T>(DomStorageDatabase*)> task,
         base::OnceCallback<void(StatusOr<T>)> callback) {
        if (owner) owner->RunTaskOnDbSequenceAndRecordHistograms<T>(operation, std::move(task), std::move(callback));
      }, weak_ptr_factory_.GetWeakPtr(), std::string(operation), std::move(db_task), std::move(callback)))) return;
  database_.PostTaskWithThisObject(base::BindOnce(
      [](base::OnceCallback<StatusOr<T>(DomStorageDatabase*)> db_task,
         std::string status_histogram_name, std::string duration_histogram_name,
         DatabaseMetricsType metrics_type,
         base::OnceCallback<void(StatusOr<T>)> callback,
         DomStorageDatabase* database) {
        base::TimeTicks start = base::TimeTicks::Now();
        StatusOr<T> result = std::move(db_task).Run(database);
        RecordExpectedAndDuration(status_histogram_name,
                                  duration_histogram_name, metrics_type, start,
                                  result);
        std::move(callback).Run(std::move(result));
      },
      std::move(db_task), GetHistogram(operation),
      GetDurationHistogram(operation), metrics_type_,
      base::BindPostTaskToCurrentDefault(std::move(callback))));
}

}  // namespace storage
