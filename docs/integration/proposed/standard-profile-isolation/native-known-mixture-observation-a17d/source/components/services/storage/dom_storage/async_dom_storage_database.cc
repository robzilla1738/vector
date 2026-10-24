// Copyright 2016 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "components/services/storage/dom_storage/async_dom_storage_database.h"

#include <algorithm>
#include <cstring>
#include <iterator>

#include "base/files/file_path.h"
#include "base/containers/span.h"
#include "base/strings/string_view_util.h"
#include "base/strings/string_number_conversions.h"
#include "base/task/sequenced_task_runner.h"
#include "crypto/hash.h"
#include "components/services/storage/dom_storage/aux_ui_cache_cohort.h"
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
  bool source_persisted = true;
  bool allocation_requested = false;
  std::optional<int64_t> allocated_map_id;
};
// Only DB-sequence tasks access this state. It retains exact original raw
// maps, including unrelated entries, but exports only reviewed UI families.
struct AuxDomCapture {
  std::vector<AuxDomMap> maps;
  std::vector<DomStorageDatabase::MapLocator> live_locators;
  std::string unrelated_metadata_sha256;
  bool captured = false;
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
      base::byte_span_from_ref(value).copy_from(base::span(raw).subspan(i, sizeof(value)));
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
      auto bytes = base::byte_span_from_ref(value);
      raw.insert(raw.end(), bytes.begin(), bytes.end());
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
      auto next = AuxEncodeKey(std::string(rule.target) + key->substr(rule.source.size()), local ? format : 3);
      auto existing = target.find(next);
      if (existing != target.end() && existing->second != value)
        return base::unexpected(DbStatus::InvalidArgument("Conflicting Aux UI preference generations"));
      target[next] = value;
      target.erase(raw);
      break;
    }
  }
  if (!local) {
    for (const auto& [raw, value] : source) {
      int format; auto key = AuxDecodeKey(raw, false, &format);
      if (!key || format != 2 || !AuxKnownKey(*key, false)) continue;
      bool current = false;
      for (const auto& rule : kAuxUiKeyRules)
        if (rule.scope != 1 && AuxUiKeyMatches(*key, rule.target, rule.prefix)) current = true;
      if (!current) continue;
      auto canonical = AuxEncodeKey(*key, 3);
      auto existing = target.find(canonical);
      if (existing != target.end() && existing->second != value)
        return base::unexpected(DbStatus::InvalidArgument("Conflicting current Session key encodings"));
      target[canonical] = value; target.erase(raw);
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
      base::byte_span_from_ref(unit).copy_from(base::span(raw).subspan(i, sizeof(unit)));
      units.push_back(unit);
    }
  }
  if (units.size() > 5242880) return std::nullopt;
  std::string result;
  result = base::UTF16ToUTF8(units);  // Validation projection only; never target data.
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
  auto parsed = base::JSONReader::ReadDict(*value, base::JSON_PARSE_RFC | base::JSON_REPLACE_INVALID_CHARACTERS, 100);
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
      const auto& rule = base::span(kAuxUiKeyRules)[i];
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
void AuxDigestNumber(std::string& bytes, uint64_t value) {
  for (int shift = 56; shift >= 0; shift -= 8) bytes.push_back(static_cast<char>(value >> shift));
}
void AuxDigestBytes(std::string& bytes, std::string_view value) {
  AuxDigestNumber(bytes, value.size()); bytes.append(value);
}
void AuxDigestRaw(std::string& bytes, const std::vector<uint8_t>& value) {
  AuxDigestNumber(bytes, value.size());
  bytes.append(base::as_string_view(base::span(value)));
}
void AuxDigestLocator(std::string& bytes, const DomStorageDatabase::MapLocator& locator) {
  AuxDigestBytes(bytes, locator.storage_key().Serialize());
  AuxDigestNumber(bytes, locator.map_id().has_value());
  if (locator.map_id()) AuxDigestNumber(bytes, static_cast<uint64_t>(*locator.map_id()));
  std::vector<std::string> sessions = locator.session_ids();
  std::sort(sessions.begin(), sessions.end());
  AuxDigestNumber(bytes, sessions.size());
  for (const auto& session : sessions) AuxDigestBytes(bytes, session);
}
std::string AuxFullMapDigest(const AuxDomMap& map, bool target, bool local) {
  std::string bytes("aux.ui-dom-complete-map.v1"); bytes.push_back('\0');
  if (target && map.allocation_requested && !map.allocated_map_id) return {};
  if (target && map.allocation_requested) {
    DomStorageDatabase::MapLocator actual(map.locator.storage_key(), *map.allocated_map_id);
    AuxDigestLocator(bytes, actual);
  } else {
    AuxDigestLocator(bytes, map.locator);
  }
  const auto& entries = target ? map.target : map.source;
  AuxDigestNumber(bytes, target ? map.source_persisted || !entries.empty() : map.source_persisted);
  for (const auto& time : {map.last_accessed, map.last_modified}) {
    AuxDigestNumber(bytes, time.has_value());
    if (time) AuxDigestNumber(bytes, static_cast<uint64_t>(time->ToDeltaSinceWindowsEpoch().InMicroseconds()));
  }
  AuxDigestNumber(bytes, local && map.total_size.has_value());
  if (local && map.total_size) {
    size_t count = 0;
    for (const auto& [key, value] : entries) count += key.size() + value.size();
    AuxDigestNumber(bytes, target && map.target != map.source ? count : map.total_size->InBytes());
  }
  AuxDigestNumber(bytes, entries.size());
  for (const auto& [key, value] : entries) { AuxDigestRaw(bytes, key); AuxDigestRaw(bytes, value); }
  return base::HexEncodeLower(crypto::hash::Sha256(bytes));
}
std::string AuxTopologyDigest(const AuxDomCapture& capture, bool target, bool local) {
  std::string bytes("aux.ui-dom-complete-topology.v1"); bytes.push_back('\0');
  AuxDigestNumber(bytes, local); AuxDigestNumber(bytes, capture.maps.size());
  for (const auto& map : capture.maps) {
    if (target && map.allocation_requested && !map.allocated_map_id) return {};
    if (target && map.allocation_requested) {
      DomStorageDatabase::MapLocator actual(map.locator.storage_key(), *map.allocated_map_id);
      AuxDigestLocator(bytes, actual);
    } else {
      AuxDigestLocator(bytes, map.locator);
    }
    AuxDigestNumber(bytes, map.source_persisted || !(target ? map.target : map.source).empty());
    AuxDigestBytes(bytes, AuxFullMapDigest(map, target, local));
  }
  return base::HexEncodeLower(crypto::hash::Sha256(bytes));
}
std::string AuxUnrelatedMetadataDigest(const DomStorageDatabase::Metadata& metadata,
                                       const url::Origin& agent) {
  std::vector<std::string> records;
  for (const auto& record : metadata.map_metadata) {
    if (record.map_locator.storage_key().origin() == agent) continue;
    std::string bytes;
    AuxDigestLocator(bytes, record.map_locator);
    for (const auto& time : {record.last_accessed, record.last_modified}) {
      AuxDigestNumber(bytes, time.has_value());
      if (time) AuxDigestNumber(bytes, static_cast<uint64_t>(time->ToDeltaSinceWindowsEpoch().InMicroseconds()));
    }
    AuxDigestNumber(bytes, record.total_size.has_value());
    if (record.total_size) AuxDigestNumber(bytes, record.total_size->InBytes());
    records.push_back(std::move(bytes));
  }
  std::sort(records.begin(), records.end());
  std::string bytes("aux.ui-dom-unrelated-metadata.v1"); bytes.push_back('\0');
  AuxDigestNumber(bytes, records.size());
  for (const auto& record : records) AuxDigestBytes(bytes, record);
  return base::HexEncodeLower(crypto::hash::Sha256(bytes));
}
std::string AuxAllocationActionDigest(const AuxDomMap& map, size_t ordinal) {
  if (!map.allocation_requested) return {};
  std::string bytes("aux.ui-dom-local-allocation-action.v1"); bytes.push_back('\0');
  AuxDigestNumber(bytes, ordinal);
  AuxDigestLocator(bytes, map.locator);
  AuxDigestNumber(bytes, map.source_persisted);
  AuxDigestBytes(bytes, AuxFullMapDigest(map, false, true));
  AuxDigestNumber(bytes, map.target.size());
  for (const auto& [key, value] : map.target) { AuxDigestRaw(bytes, key); AuxDigestRaw(bytes, value); }
  return base::HexEncodeLower(crypto::hash::Sha256(bytes));
}
std::string AuxAllocationActionsDigest(const AuxDomCapture& capture) {
  std::string bytes("aux.ui-dom-local-allocation-actions.v1"); bytes.push_back('\0');
  AuxDigestBytes(bytes, AuxTopologyDigest(capture, false, true));
  size_t count = 0;
  for (size_t i = 0; i < capture.maps.size(); ++i) {
    auto action = AuxAllocationActionDigest(capture.maps[i], i);
    if (!action.empty()) { ++count; AuxDigestBytes(bytes, action); }
  }
  if (!count) return {};
  AuxDigestNumber(bytes, count);
  return base::HexEncodeLower(crypto::hash::Sha256(bytes));
}
StatusOr<AsyncDomStorageDatabase::AuxUiSnapshot> AuxReadDomCapture(
    AuxDomCapture& capture, bool local, DomStorageDatabase* database) {
  auto metadata = database->ReadAllMetadata();
  if (!metadata.has_value()) return base::unexpected(metadata.error());
  const url::Origin agent = url::Origin::Create(GURL("chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm/"));
  if (AuxUnrelatedMetadataDigest(*metadata, agent) != capture.unrelated_metadata_sha256)
    return base::unexpected(DbStatus::IOError("Unrelated native metadata changed"));
  std::vector<AuxDomMap> current;
  for (const auto& original : capture.maps) {
    current.push_back({original.locator.Clone(), {}, {}, {}, {}, {}, false});
  }
  for (auto& record : metadata->map_metadata) {
    if (record.map_locator.storage_key().origin() != agent) continue;
    size_t index = capture.maps.size();
    for (size_t i = 0; i < capture.maps.size(); ++i) {
      const auto& locator = capture.maps[i].locator;
      if (locator.storage_key() == record.map_locator.storage_key() &&
          (local || locator.map_id() == record.map_locator.map_id())) {
        if (index != capture.maps.size()) return base::unexpected(DbStatus::IOError("Ambiguous native map topology"));
        index = i;
      }
    }
    if (index == capture.maps.size())
      return base::unexpected(DbStatus::IOError("Native map inventory changed"));
    auto& map = current[index];
    if (!map.source_persisted) {
      map.locator = std::move(record.map_locator);
      map.last_accessed = record.last_accessed; map.last_modified = record.last_modified;
      map.total_size = record.total_size; map.source_persisted = true;
    } else {
      if (local) return base::unexpected(DbStatus::IOError("Repeated native Local metadata"));
      for (const auto& session : record.map_locator.session_ids()) {
        if (std::ranges::contains(map.locator.session_ids(), session))
          return base::unexpected(DbStatus::IOError("Repeated native Session metadata"));
        map.locator.AddSession(session);
      }
    }
  }
  AsyncDomStorageDatabase::AuxUiSnapshot result;
  result.matches_source = true; result.matches_target = true;
  size_t export_bytes = 0;
  for (size_t i = 0; i < capture.maps.size(); ++i) {
    auto& original = capture.maps[i]; auto& observed = current[i];
    const bool target_present = original.source_persisted || !original.target.empty();
    if (observed.source_persisted != original.source_persisted &&
        observed.source_persisted != target_present)
      return base::unexpected(DbStatus::IOError("Native persisted topology changed"));
    std::vector<std::string> before = original.locator.session_ids();
    std::vector<std::string> after = observed.locator.session_ids();
    std::sort(before.begin(), before.end()); std::sort(after.begin(), after.end());
    if (before != after) return base::unexpected(DbStatus::IOError("Native namespace topology changed"));
    auto entries = database->ReadMapKeyValues(observed.locator.Clone());
    if (!entries.has_value()) return base::unexpected(entries.error());
    observed.source = std::move(*entries);
    if (original.allocation_requested && observed.source_persisted) {
      if (!local || !capture.target_attempted || !observed.locator.map_id() ||
          original.source_persisted || !original.source.empty() ||
          observed.last_accessed != original.last_accessed ||
          observed.last_modified != original.last_modified || observed.total_size != original.total_size ||
          observed.source != original.target ||
          (original.allocated_map_id && original.allocated_map_id != observed.locator.map_id()))
        return base::unexpected(DbStatus::IOError("Actual allocated target identity/readback differs from original action"));
      // The real SQLite allocator has now supplied its ID through the unique
      // metadata row, joined to the exact raw target and unchanged other maps.
      // This is a past physical observation, never a predicted target ID.
      original.allocated_map_id = observed.locator.map_id();
    }
    const std::string current_digest = AuxFullMapDigest(observed, false, local);
    const std::string source_digest = AuxFullMapDigest(original, false, local);
    const std::string target_digest = AuxFullMapDigest(original, true, local);
    if (current_digest != source_digest && current_digest != target_digest)
      return base::unexpected(DbStatus::IOError("Native map differs from every retained alternative"));
    result.matches_source &= current_digest == source_digest;
    result.matches_target &= current_digest == target_digest;
    AsyncDomStorageDatabase::AuxUiMapSnapshot output;
    output.storage_key = original.locator.storage_key();
    output.session_ids = original.locator.session_ids();
    std::sort(output.session_ids.begin(), output.session_ids.end());
    output.source = AuxSelectedEntries(original.source, local);
    output.target = AuxSelectedEntries(original.target, local);
    output.map_ordinal = i; output.map_id = original.locator.map_id();
    output.source_persisted = original.source_persisted;
    output.source_map_sha256 = source_digest; output.target_map_sha256 = target_digest;
    output.allocation_requested = original.allocation_requested;
    output.allocation_action_sha256 = AuxAllocationActionDigest(original, i);
    output.allocated_map_id = original.allocated_map_id;
    output.allocation_observed = original.allocated_map_id.has_value();
    output.source_last_accessed = original.last_accessed;
    output.source_last_modified = original.last_modified;
    output.source_total_size = original.total_size;
    for (const auto& selected : {output.source, output.target})
      for (const auto& [key, value] : selected) export_bytes += key.size() + value.size();
    if (export_bytes > 16 * 1024 * 1024)
      return base::unexpected(DbStatus::NotSupported("Native selected wire bound exceeded"));
    result.maps.push_back(std::move(output));
  }
  result.source_topology_sha256 = AuxTopologyDigest(capture, false, local);
  result.target_topology_sha256 = AuxTopologyDigest(capture, true, local);
  result.allocation_action_sha256 = AuxAllocationActionsDigest(capture);
  result.file_data_synced = capture.file_data_synced;
  result.known_source_target_mixture = capture.file_data_synced && !result.matches_source && !result.matches_target;
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
  bool source_ready = false;
  bool backend_captured = false;
  bool private_target_staged = false;
  bool cache_published = false;
  size_t prepared_writers = 0;
  std::vector<base::WeakPtr<Committer>> writers;
  AuxUiSnapshot snapshot;
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
bool AsyncDomStorageDatabase::Committer::CanHoldAuxUiMigration(AsyncDomStorageDatabase*) const { return false; }
base::WeakPtr<AsyncDomStorageDatabase::Committer>
AsyncDomStorageDatabase::Committer::GetAuxUiMigrationWeakPtr() { return {}; }
StatusOr<DomStorageDatabase::MapLocator>
AsyncDomStorageDatabase::Committer::CopyAuxUiMigrationLocator() const {
  return base::unexpected(DbStatus::NotSupported("Actual native map owner is not instrumented"));
}
void AsyncDomStorageDatabase::Committer::PrepareAuxUiMigrationCaches(
    const base::UnguessableToken&, StatusCallback callback) {
  std::move(callback).Run(DbStatus::NotSupported("Actual cache owner is not instrumented"));
}
void AsyncDomStorageDatabase::Committer::RunAuxUiMigrationCaches(
    const base::UnguessableToken&, AuxUiCacheOperation, const AuxUiMapSnapshot*, StatusCallback callback) {
  std::move(callback).Run(DbStatus::NotSupported("Actual cache owner is not instrumented"));
}
std::vector<AsyncDomStorageDatabase::AuxUiCacheView>
AsyncDomStorageDatabase::Committer::CopyAuxUiMigrationCacheViews() const { return {}; }
bool AsyncDomStorageDatabase::Committer::MatchesAuxUiMigrationMap(const AuxUiMapSnapshot&) const { return false; }
DbStatus AsyncDomStorageDatabase::Committer::AdoptAuxUiMigrationMap(const AuxUiMapSnapshot&, bool) {
  return DbStatus::NotSupported("Actual native cache adoption is not instrumented");
}
void AsyncDomStorageDatabase::NotifyAuxUiMigrationRegistryChanged() {
  if (aux_ui_migration_gate_) aux_ui_migration_gate_->tainted = true;
}
struct AsyncDomStorageDatabase::AuxUiCacheRound {
  std::shared_ptr<AuxUiMigrationLease::State> state;
  AuxUiCacheOperation operation = AuxUiCacheOperation::kRead;
  bool prepare = false;
  AuxUiSnapshot snapshot;
  size_t cursor = 0;
  StatusCallback callback;
};
bool AsyncDomStorageDatabase::CurrentAuxUiMigrationWriters(
    const std::shared_ptr<AuxUiMigrationLease::State>& state) const {
  if (!state || state != aux_ui_migration_gate_ || state->owner.get() != this ||
      state->writers.size() != committers_.size()) return false;
  for (const auto& writer : state->writers)
    if (!writer || !committers_.contains(writer.get())) return false;
  return true;
}
void AsyncDomStorageDatabase::RunAuxUiMigrationCaches(
    std::shared_ptr<AuxUiMigrationLease::State> state,
    AuxUiCacheOperation operation, bool prepare,
    const AuxUiSnapshot& snapshot, StatusCallback callback) {
  auto round = std::make_shared<AuxUiCacheRound>();
  round->state = std::move(state); round->operation = operation;
  round->prepare = prepare; round->snapshot = snapshot;
  round->callback = std::move(callback);
  ContinueAuxUiMigrationCaches(round, DbStatus::OK());
}
void AsyncDomStorageDatabase::ContinueAuxUiMigrationCaches(
    std::shared_ptr<AuxUiCacheRound> round, DbStatus status) {
  if (!status.ok() || !CurrentAuxUiMigrationWriters(round->state)) {
    std::move(round->callback).Run(status.ok() ?
        DbStatus::IOError("Original native writer registry changed") : std::move(status)); return;
  }
  const size_t count = !round->prepare && round->operation == AuxUiCacheOperation::kRelease ?
      round->state->prepared_writers : round->state->writers.size();
  if (round->cursor == count) {
    std::move(round->callback).Run(DbStatus::OK()); return;
  }
  auto writer = round->state->writers[round->cursor++];
  auto reply = mojo::WrapCallbackWithDefaultInvokeIfNotRun(base::BindOnce(
      &AsyncDomStorageDatabase::ContinueAuxUiMigrationCaches,
      weak_ptr_factory_.GetWeakPtr(), round), DbStatus::IOError("Actual native cache owner reply lost"));
  if (round->prepare) {
    round->state->prepared_writers = round->cursor;
    writer->PrepareAuxUiMigrationCaches(round->state->token, std::move(reply)); return;
  }
  const AuxUiMapSnapshot* map = nullptr;
  for (const auto& candidate : round->snapshot.maps) {
    if (!writer->MatchesAuxUiMigrationMap(candidate)) continue;
    if (map) { std::move(reply).Run(DbStatus::IOError("Native cache map pairing is ambiguous")); return; }
    map = &candidate;
  }
  if (round->operation == AuxUiCacheOperation::kStage && !map) {
    auto locator = writer->CopyAuxUiMigrationLocator();
    if (!locator.has_value()) { std::move(reply).Run(locator.error()); return; }
    const auto origin = url::Origin::Create(GURL("chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm/"));
    if (locator->storage_key().origin() == origin) {
      std::move(reply).Run(DbStatus::IOError("Actual live UI map is absent from captured topology")); return;
    }
    // Non-UI maps have no renderer target; their existing native receiver
    // hold remains until the same real cleanup. Nothing is imported there.
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
        base::BindOnce([](StatusCallback callback) { std::move(callback).Run(DbStatus::OK()); }, std::move(reply)));
    return;
  }
  if (map && (round->operation == AuxUiCacheOperation::kPublish ||
              round->operation == AuxUiCacheOperation::kRestore)) {
    DbStatus adopted = writer->AdoptAuxUiMigrationMap(*map,
        round->operation == AuxUiCacheOperation::kPublish);
    if (!adopted.ok()) { std::move(reply).Run(std::move(adopted)); return; }
  }
  writer->RunAuxUiMigrationCaches(round->state->token, round->operation, map, std::move(reply));
}
void AsyncDomStorageDatabase::AttachAuxUiCacheObservations(
    const std::shared_ptr<AuxUiMigrationLease::State>& state, AuxUiSnapshot& snapshot) const {
  for (auto& map : snapshot.maps) map.cache_views.clear();
  if (!CurrentAuxUiMigrationWriters(state)) {
    snapshot.native_error = "Original native cache registry changed";
    snapshot.source_ready = false; return;
  }
  for (const auto& writer : state->writers) {
    for (auto& map : snapshot.maps) {
      if (!writer->MatchesAuxUiMigrationMap(map)) continue;
      auto views = writer->CopyAuxUiMigrationCacheViews();
      for (auto& view : views) {
        if (map.session_ids.empty() ? !view.namespace_id.empty() :
            !std::ranges::contains(map.session_ids, view.namespace_id)) {
          snapshot.native_error = "Actual native cache namespace pairing changed";
          snapshot.source_ready = false; return;
        }
        auto source_units = AuxUiCacheCohort::DecodeSelected(map.source, map.session_ids.empty());
        auto target_units = AuxUiCacheCohort::DecodeSelected(map.target, map.session_ids.empty());
        std::map<std::u16string, std::u16string> expected_source, expected_target;
        if (!source_units.has_value() || !target_units.has_value()) {
          snapshot.native_error = "Native cache unit codec refused";
          snapshot.source_ready = false; return;
        }
        for (const auto& entry : source_units.value()) expected_source.emplace(
            std::u16string(entry->key.begin(), entry->key.end()), std::u16string(entry->value.begin(), entry->value.end()));
        for (const auto& entry : target_units.value()) expected_target.emplace(
            std::u16string(entry->key.begin(), entry->key.end()), std::u16string(entry->value.begin(), entry->value.end()));
        if (view.source != expected_source || view.staged != expected_target) {
          snapshot.native_error = "Actual private cache source/target pairing disagrees";
          snapshot.source_ready = false; return;
        }
        map.cache_views.push_back(std::move(view));
      }
    }
  }
}
void AsyncDomStorageDatabase::RunAuxUiBackend(
    std::shared_ptr<AuxUiMigrationLease::State> state, int operation,
    std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback) {
  const bool local = storage_type_ == StorageType::kLocalStorage;
  auto reply = base::BindOnce(
      [](base::WeakPtr<AsyncDomStorageDatabase> owner,
         std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiReadCallback callback,
         StatusOr<AuxUiSnapshot> result) {
        if (!owner || owner->aux_ui_migration_gate_ != state)
          result = base::unexpected(DbStatus::IOError("Original native DB owner changed"));
        std::move(callback).Run(std::move(result));
      }, weak_ptr_factory_.GetWeakPtr(), state, std::move(callback));
  auto guarded = mojo::WrapCallbackWithDefaultInvokeIfNotRun(
      base::BindPostTaskToCurrentDefault(std::move(reply)),
      StatusOr<AuxUiSnapshot>(base::unexpected(DbStatus::IOError("Actual backend reply lost"))));
  database_.PostTaskWithThisObject(base::BindOnce(
      [](std::shared_ptr<AuxDomCapture> capture,
         std::shared_ptr<AuxMigrationWriteStatus> writes, bool local, bool sqlite, int operation,
         std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback,
         DomStorageDatabase* database) {
        auto run = [&]() -> StatusOr<AuxUiSnapshot> {
          const url::Origin agent = url::Origin::Create(GURL("chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm/"));
          if (operation == 0) {
            if (writes->first_error) return base::unexpected(*writes->first_error);
            auto metadata = database->ReadAllMetadata();
            if (!metadata.has_value()) return base::unexpected(metadata.error());
            capture->unrelated_metadata_sha256 = AuxUnrelatedMetadataDigest(*metadata, agent);
            for (auto& record : metadata->map_metadata) {
              if (record.map_locator.storage_key().origin() != agent) continue;
              AuxDomMap* existing = nullptr;
              for (auto& map : capture->maps) {
                if (map.locator.storage_key() == record.map_locator.storage_key() &&
                    (local || map.locator.map_id() == record.map_locator.map_id())) existing = &map;
              }
              if (existing) {
                if (local) return base::unexpected(DbStatus::NotSupported("Ambiguous native Local map metadata"));
                for (const auto& session : record.map_locator.session_ids()) {
                  if (std::ranges::contains(existing->locator.session_ids(), session))
                    return base::unexpected(DbStatus::NotSupported("Repeated native Session map reference"));
                  existing->locator.AddSession(session);
                }
              } else {
                capture->maps.push_back({std::move(record.map_locator), {}, {},
                    record.last_accessed, record.last_modified, record.total_size, true});
              }
            }
            for (auto& locator : capture->live_locators) {
              if (locator.storage_key().origin() != agent) continue;
              AuxDomMap* found = nullptr;
              for (auto& map : capture->maps) {
                if (map.locator.storage_key() == locator.storage_key() &&
                    (local || map.locator.map_id() == locator.map_id())) found = &map;
              }
              if (found) {
                for (const auto& session : locator.session_ids())
                  if (!std::ranges::contains(found->locator.session_ids(), session))
                    return base::unexpected(DbStatus::NotSupported("Live namespace is absent from persisted native topology"));
              } else {
                if (!local && (!locator.map_id() || locator.session_ids().empty()))
                  return base::unexpected(DbStatus::NotSupported("Actual registered Session locator required"));
                capture->maps.push_back({locator.Clone(), {}, {}, {}, {}, {}, false});
              }
            }
            if (capture->maps.size() > 256)
              return base::unexpected(DbStatus::NotSupported("Finite native map inventory exceeded"));
            std::sort(capture->maps.begin(), capture->maps.end(), [](const auto& a, const auto& b) {
              if (a.locator.storage_key().Serialize() != b.locator.storage_key().Serialize())
                return a.locator.storage_key().Serialize() < b.locator.storage_key().Serialize();
              return a.locator.map_id() < b.locator.map_id();
            });
            size_t bytes = 0;
            for (auto& map : capture->maps) {
              auto entries = database->ReadMapKeyValues(map.locator.Clone());
              if (!entries.has_value()) return base::unexpected(entries.error());
              if (!map.source_persisted && !entries->empty())
                return base::unexpected(DbStatus::NotSupported("Unindexed persisted UI map needs recovery"));
              for (const auto& [key, value] : *entries) {
                bytes += key.size() + value.size();
                if (bytes > 64 * 1024 * 1024) return base::unexpected(DbStatus::NotSupported("Finite native capture bound exceeded"));
              }
              DbStatus validated = AuxValidateEntries(*entries, local);
              if (!validated.ok()) return base::unexpected(validated);
              auto target = AuxBuildTarget(*entries, local);
              if (!target.has_value()) return base::unexpected(target.error());
              map.source = std::move(*entries); map.target = std::move(*target);
            }
            capture->captured = true;
          }
          if (!capture->captured) return base::unexpected(DbStatus::IOError("Original backend capture is incomplete"));
          auto before = AuxReadDomCapture(*capture, local, database);
          if (!before.has_value()) return base::unexpected(before.error());
          if (operation == 2) {
            if (capture->target_attempted || !before->matches_source || targets.size() != capture->maps.size())
              return base::unexpected(DbStatus::IOError("Complete original source target stage required"));
            std::set<uint32_t> ordinals;
            std::vector<AuxRawMap> proposed(capture->maps.size());
            size_t export_bytes = 0;
            for (const auto& target : targets) {
              if (target.map_ordinal >= capture->maps.size() || !ordinals.insert(target.map_ordinal).second)
                return base::unexpected(DbStatus::InvalidArgument("Invalid native target ordinal"));
              const auto& map = capture->maps[target.map_ordinal];
              AuxRawMap candidate = map.source;
              for (const auto& [key, value] : AuxSelectedEntries(map.source, local)) candidate.erase(key);
              for (const auto& [key, value] : target.desired_selected_entries) {
                int format;
                auto decoded = AuxDecodeKey(key, local, &format);
                bool current = false;
                if (decoded) for (const auto& rule : kAuxUiKeyRules)
                  if (!((rule.scope == 1 && !local) || (rule.scope == 2 && local)) &&
                      AuxUiKeyMatches(*decoded, rule.target, rule.prefix)) current = true;
                if (!current || (!local && format != 3))
                  return base::unexpected(DbStatus::NotSupported("Only current native Aux target key encoding is accepted"));
                candidate[key] = value;
                export_bytes += key.size() + value.size();
              }
              if (export_bytes > 16 * 1024 * 1024)
                return base::unexpected(DbStatus::NotSupported("Finite native target bound exceeded"));
              DbStatus valid = AuxValidateEntries(candidate, local);
              if (!valid.ok()) return base::unexpected(valid);
              auto canonical = AuxBuildTarget(candidate, local);
              if (!canonical.has_value() || canonical.value() != candidate)
                return base::unexpected(DbStatus::NotSupported("Ambiguous/non-current target key encoding"));
              if (!map.source_persisted && candidate != map.source &&
                  (local ? (!sqlite || map.locator.map_id() || !map.locator.session_ids().empty() || !map.source.empty()) :
                   (!map.locator.map_id() || map.locator.session_ids().size() != 1)))
                return base::unexpected(DbStatus::NotSupported("Actual SQLite absent Local or allocator-owned single-namespace Session map required"));
              proposed[target.map_ordinal] = std::move(candidate);
            }
            for (size_t i = 0; i < capture->maps.size(); ++i) {
              auto& map = capture->maps[i];
              map.target = std::move(proposed[i]);
              map.allocation_requested = local && !map.source_persisted && map.target != map.source;
            }
          } else if (operation == 3 || operation == 4) {
            // AuxReadDomCapture has checked every complete map/topology
            // against one exact retained alternative. A failed multi-map
            // absence restore may leave a known mixture; recovery may finish
            // those same originals, never overwrite an unknown map.
            if (operation == 3 && (capture->target_attempted || !before->matches_source))
              return base::unexpected(DbStatus::IOError("Exact retained source CAS required"));
            capture->target_attempted = true; capture->file_data_synced = false;
            std::vector<DomStorageDatabase::MapBatchUpdate> updates;
            for (const auto& map : capture->maps) {
              if (map.source == map.target) continue;
              if (operation == 4 && !map.source_persisted) {
                if (local) {
                  if (!map.allocation_requested || !map.source.empty())
                    return base::unexpected(DbStatus::NotSupported("Original Local absence action missing"));
                  // No observed allocation means the failed original write
                  // left verified source absence. Never retry its allocator.
                  if (!map.allocated_map_id) continue;
                  std::vector<DomStorageDatabase::MapLocator> maps_to_delete;
                  maps_to_delete.emplace_back(map.locator.storage_key(), *map.allocated_map_id);
                  DbStatus removed = database->DeleteStorageKeysFromSession(
                      {}, {map.locator.storage_key()}, std::move(maps_to_delete));
                  if (!removed.ok()) return base::unexpected(removed);
                  continue;
                }
                if (!map.source.empty() || !map.locator.map_id() ||
                    map.locator.session_ids().size() != 1)
                  return base::unexpected(DbStatus::NotSupported("Original native absence cannot be restored by this owner"));
                const std::string session = map.locator.session_ids().front();
                auto unreferenced = map.locator.Clone();
                unreferenced.RemoveSession(session);
                std::vector<DomStorageDatabase::MapLocator> maps_to_delete;
                maps_to_delete.push_back(std::move(unreferenced));
                // Real Session backend operation removes this exact owned
                // namespace reference and allocator map data transactionally.
                DbStatus removed = database->DeleteStorageKeysFromSession(
                    session, {map.locator.storage_key()}, std::move(maps_to_delete));
                if (!removed.ok()) return base::unexpected(removed);
                continue;
              }
              const auto& desired = operation == 3 ? map.target : map.source;
              const auto& previous = operation == 3 ? map.source : map.target;
              DomStorageDatabase::MapBatchUpdate update(map.locator.Clone());
              for (const auto& [key, value] : previous) if (!desired.contains(key)) update.keys_to_delete.push_back(key);
              for (const auto& [key, value] : desired) {
                auto existing = previous.find(key);
                if (existing == previous.end() || existing->second != value) update.entries_to_add.emplace_back(key, value);
              }
              if (local) {
                update.map_usage.emplace();
                if (map.last_accessed) update.map_usage->SetLastAccessed(*map.last_accessed);
                if (map.last_modified && map.total_size) {
                  size_t count = 0;
                  for (const auto& [key, value] : desired) count += key.size() + value.size();
                  update.map_usage->SetLastModifiedAndTotalSize(*map.last_modified,
                      operation == 3 ? base::ByteSize(count) : *map.total_size);
                }
              }
              updates.push_back(std::move(update));
            }
            DbStatus update = database->UpdateMaps(std::move(updates));
            if (!update.ok()) return base::unexpected(update);
          }
          DbStatus sync = database->SyncForAuxMigration();
          if (!sync.ok()) return base::unexpected(sync);
          capture->file_data_synced = true;
          return AuxReadDomCapture(*capture, local, database);
        };
        std::move(callback).Run(run());
      }, state->backend, aux_migration_write_status_, local, is_sqlite_, operation, std::move(targets), std::move(guarded)));
}
void AsyncDomStorageDatabase::BeginAuxUiMigrationLease(AuxUiLeaseCallback callback) {
  if (!is_database_opened_ || !aux_on_disk_ || aux_ui_migration_gate_) {
    std::move(callback).Run(base::unexpected(DbStatus::NotSupported("Actual disk backend or outstanding owner unavailable")), {}); return;
  }
  if (committers_.size() > 4096) {
    std::move(callback).Run(base::unexpected(DbStatus::NotSupported("Finite native writer inventory exceeded")), {}); return;
  }
  auto state = std::make_shared<AuxUiMigrationLease::State>();
  state->owner = weak_ptr_factory_.GetWeakPtr();
  for (Committer* writer : committers_) {
    auto weak = writer->GetAuxUiMigrationWeakPtr();
    auto locator = writer->CopyAuxUiMigrationLocator();
    if (!weak || !writer->CanHoldAuxUiMigration(this) || !locator.has_value()) {
      std::move(callback).Run(base::unexpected(DbStatus::NotSupported("Actual native writer cannot be closed")), {}); return;
    }
    state->writers.push_back(std::move(weak));
    state->backend->live_locators.push_back(std::move(locator).value());
  }
  // Collect actual pending batches before closing ordinary dispatch, in the
  // same owning stack. Their replies precede the backend capture sentinel.
  InitiateCommit();
  state->pending = true; aux_ui_migration_gate_ = state;
  RunAuxUiMigrationCaches(state, AuxUiCacheOperation::kRead, true, {}, base::BindOnce(
      &AsyncDomStorageDatabase::PreparedAuxUiMigration, weak_ptr_factory_.GetWeakPtr(), state, std::move(callback)));
}
void AsyncDomStorageDatabase::PreparedAuxUiMigration(
    std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiLeaseCallback callback, DbStatus status) {
  if (!status.ok() || !CurrentAuxUiMigrationWriters(state) || state->tainted) {
    CompleteAuxUiBegin(state, std::move(callback), status.ok() ? DbStatus::IOError("Native writers changed before capture") : std::move(status)); return;
  }
  RunAuxUiBackend(state, 0, {}, base::BindOnce(&AsyncDomStorageDatabase::CapturedAuxUiMigration,
      weak_ptr_factory_.GetWeakPtr(), state, std::move(callback)));
}
void AsyncDomStorageDatabase::CapturedAuxUiMigration(
    std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiLeaseCallback callback,
    StatusOr<AuxUiSnapshot> result) {
  if (!result.has_value()) { CompleteAuxUiBegin(state, std::move(callback), result.error()); return; }
  state->snapshot = std::move(result).value(); state->backend_captured = true;
  RunAuxUiMigrationCaches(state, AuxUiCacheOperation::kStage, false, state->snapshot,
      base::BindOnce(&AsyncDomStorageDatabase::StagedAuxUiBegin,
          weak_ptr_factory_.GetWeakPtr(), state, std::move(callback)));
}
void AsyncDomStorageDatabase::StagedAuxUiBegin(
    std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiLeaseCallback callback, DbStatus status) {
  if (!status.ok()) { CompleteAuxUiBegin(state, std::move(callback), std::move(status)); return; }
  state->private_target_staged = true;
  RunAuxUiMigrationCaches(state, AuxUiCacheOperation::kValidate, false, state->snapshot,
      base::BindOnce(&AsyncDomStorageDatabase::CompleteAuxUiBegin,
          weak_ptr_factory_.GetWeakPtr(), state, std::move(callback)));
}
void AsyncDomStorageDatabase::CompleteAuxUiBegin(
    std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiLeaseCallback callback, DbStatus status) {
  state->pending = false;
  state->source_ready = status.ok() && state->backend_captured && state->private_target_staged &&
      CurrentAuxUiMigrationWriters(state) && !state->tainted &&
      state->snapshot.file_data_synced && (state->snapshot.matches_source || state->snapshot.matches_target);
  state->snapshot.source_ready = state->source_ready;
  state->snapshot.private_target_staged = state->private_target_staged;
  state->snapshot.native_error = state->source_ready ? "" : status.ok() ? "Native source inventory changed" : status.ToString();
  state->snapshot.ordinary_work_queued = state->tainted || !state->deferred.empty();
  AttachAuxUiCacheObservations(state, state->snapshot);
  if (!state->snapshot.native_error.empty()) state->source_ready = state->snapshot.source_ready = false;
  // Once minted, an uncertain source retains the exact opaque owner. The
  // service must keep this discoverable even when source_ready is false.
  std::move(callback).Run(std::unique_ptr<AuxUiMigrationLease>(new AuxUiMigrationLease(state)), state->snapshot);
}
void AsyncDomStorageDatabase::ReadAuxUiMigrationLease(AuxUiMigrationLease& lease, AuxUiReadCallback callback) {
  RunAuxUiMigrationOperation(lease, 1, {}, std::move(callback));
}
void AsyncDomStorageDatabase::ValidateAuxUiMigrationLease(AuxUiMigrationLease& lease, AuxUiReadCallback callback) {
  RunAuxUiMigrationOperation(lease, 1, {}, std::move(callback));
}
void AsyncDomStorageDatabase::StageAuxUiMigrationTargets(AuxUiMigrationLease& lease,
    std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback) {
  RunAuxUiMigrationOperation(lease, 2, std::move(targets), std::move(callback));
}
void AsyncDomStorageDatabase::CommitAuxUiMigrationLease(AuxUiMigrationLease& lease, AuxUiReadCallback callback) {
  RunAuxUiMigrationOperation(lease, 3, {}, std::move(callback));
}
void AsyncDomStorageDatabase::RestoreAuxUiMigrationLease(AuxUiMigrationLease& lease, AuxUiReadCallback callback) {
  RunAuxUiMigrationOperation(lease, 4, {}, std::move(callback));
}
void AsyncDomStorageDatabase::PublishAuxUiMigrationLease(AuxUiMigrationLease& lease, AuxUiReadCallback callback) {
  RunAuxUiMigrationOperation(lease, 5, {}, std::move(callback));
}
void AsyncDomStorageDatabase::RunAuxUiMigrationOperation(AuxUiMigrationLease& lease,
    int operation, std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback) {
  auto state = lease.state_;
  if (!CurrentAuxUiMigrationWriters(state) || state->pending ||
      ((operation == 2 || operation == 3 || operation == 5) &&
       (!state->source_ready || state->tainted || (operation != 5 && state->target_attempted)))) {
    std::move(callback).Run(base::unexpected(DbStatus::IOError("Original native transaction phase cannot run"))); return;
  }
  if (!state->backend_captured) {
    auto result = state->snapshot; result.source_ready = false;
    result.native_error = "Original source preparation remains refused; release exact custody";
    std::move(callback).Run(std::move(result)); return;
  }
  state->pending = true;
  RunAuxUiMigrationCaches(state, AuxUiCacheOperation::kRead, false, state->snapshot,
      base::BindOnce(&AsyncDomStorageDatabase::CheckedAuxUiOperation,
          weak_ptr_factory_.GetWeakPtr(), state, operation, std::move(targets), std::move(callback)));
}
void AsyncDomStorageDatabase::CheckedAuxUiOperation(
    std::shared_ptr<AuxUiMigrationLease::State> state, int operation,
    std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback, DbStatus status) {
  if (!status.ok() || !CurrentAuxUiMigrationWriters(state) ||
      ((operation == 2 || operation == 3 || operation == 5) && state->tainted)) {
    CompleteAuxUiOperation(state, std::move(callback), status.ok() ? DbStatus::IOError("Native registry changed") : status); return;
  }
  if (operation == 3 || operation == 4) { state->target_attempted = true; state->resolved_and_synced = false; }
  RunAuxUiBackend(state, operation == 5 ? 1 : operation, std::move(targets),
      base::BindOnce(&AsyncDomStorageDatabase::BackendAuxUiOperation,
          weak_ptr_factory_.GetWeakPtr(), state, operation, std::move(callback)));
}
void AsyncDomStorageDatabase::BackendAuxUiOperation(
    std::shared_ptr<AuxUiMigrationLease::State> state, int operation,
    AuxUiReadCallback callback, StatusOr<AuxUiSnapshot> result) {
  if (!result.has_value()) { CompleteAuxUiOperation(state, std::move(callback), result.error()); return; }
  state->snapshot = std::move(result).value();
  state->resolved_and_synced = state->snapshot.file_data_synced &&
      (state->snapshot.matches_source || state->snapshot.matches_target);
  if (operation == 5 && (!state->snapshot.matches_target || !state->snapshot.file_data_synced)) {
    CompleteAuxUiOperation(state, std::move(callback), DbStatus::IOError("Real synchronized backend target required before publication")); return;
  }
  if (operation == 4 && (!state->snapshot.matches_source || !state->snapshot.file_data_synced)) {
    CompleteAuxUiOperation(state, std::move(callback), DbStatus::IOError("Real synchronized original backend required before cache restoration")); return;
  }
  AuxUiCacheOperation cache = operation == 2 ? AuxUiCacheOperation::kStage :
      operation == 4 ? AuxUiCacheOperation::kRestore : operation == 5 ?
      AuxUiCacheOperation::kPublish : AuxUiCacheOperation::kValidate;
  RunAuxUiMigrationCaches(state, cache, false, state->snapshot,
      base::BindOnce(&AsyncDomStorageDatabase::CachedAuxUiOperation,
          weak_ptr_factory_.GetWeakPtr(), state, operation, std::move(callback)));
}
void AsyncDomStorageDatabase::CachedAuxUiOperation(
    std::shared_ptr<AuxUiMigrationLease::State> state, int operation,
    AuxUiReadCallback callback, DbStatus status) {
  if (status.ok()) {
    if (operation == 2) state->private_target_staged = true;
    if (operation == 4) state->cache_published = false;
    if (operation == 5) state->cache_published = true;
  }
  CompleteAuxUiOperation(state, std::move(callback), std::move(status));
}
void AsyncDomStorageDatabase::CompleteAuxUiOperation(
    std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiReadCallback callback, DbStatus status) {
  state->pending = false;
  state->source_ready = status.ok() && state->backend_captured && state->private_target_staged &&
      CurrentAuxUiMigrationWriters(state) && !state->tainted &&
      state->snapshot.file_data_synced && (state->snapshot.matches_source || state->snapshot.matches_target);
  state->snapshot.native_error = status.ok() ? "" : status.ToString();
  state->snapshot.source_ready = state->source_ready;
  state->snapshot.private_target_staged = state->private_target_staged;
  state->snapshot.cache_published = state->cache_published;
  state->snapshot.ordinary_work_queued = state->tainted || !state->deferred.empty();
  state->snapshot.target_attempted = state->target_attempted;
  AttachAuxUiCacheObservations(state, state->snapshot);
  if (!state->snapshot.native_error.empty()) state->source_ready = state->snapshot.source_ready = false;
  std::move(callback).Run(state->snapshot);
}
void AsyncDomStorageDatabase::ReleaseAuxUiMigrationLease(AuxUiMigrationLease& lease,
    AuxUiBeforeReopen before_reopen, StatusCallback callback) {
  auto state = lease.state_;
  if (!CurrentAuxUiMigrationWriters(state) || state->pending || !before_reopen ||
      (state->target_attempted && (!state->resolved_and_synced ||
       (state->snapshot.matches_target && !state->snapshot.matches_source && !state->cache_published)))) {
    std::move(callback).Run(DbStatus::IOError("Actual target/source cleanup remains held")); return;
  }
  state->pending = true;
  RunAuxUiMigrationCaches(state, AuxUiCacheOperation::kRelease, false, state->snapshot,
      base::BindOnce(&AsyncDomStorageDatabase::ReleasedAuxUiCaches,
          weak_ptr_factory_.GetWeakPtr(), state, std::move(before_reopen), std::move(callback)));
}
void AsyncDomStorageDatabase::ReleasedAuxUiCaches(
    std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiBeforeReopen before_reopen,
    StatusCallback callback, DbStatus status) {
  state->pending = false;
  if (!status.ok() || !CurrentAuxUiMigrationWriters(state)) {
    std::move(callback).Run(status.ok() ? DbStatus::IOError("Original native release owner changed") : status); return;
  }
  status = std::move(before_reopen).Run();
  if (!status.ok()) { std::move(callback).Run(std::move(status)); return; }
  // The concrete native service just resumed its exact namespaces in this
  // owning stack. No queued ordinary message dispatches before the join.
  ReleaseAuxUiMigrationGate(state);
  std::move(callback).Run(DbStatus::OK());
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
