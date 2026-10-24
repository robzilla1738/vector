// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/aux/ui_storage_migration_controller.h"
#include "chrome/browser/aux/ui_storage_migration_completion.h"
#include <algorithm>
#include <array>
#include <bit>
#include <atomic>
#include <cmath>
#include <map>
#include <memory>
#include <set>
#include <string>
#include <string_view>
#include <optional>
#include <utility>
#include <vector>
#include "base/base64.h"
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/memory/scoped_refptr.h"
#include "base/memory/safe_ref.h"
#include "base/memory/weak_ptr.h"
#include "base/scoped_observation.h"
#include "base/strings/string_number_conversions.h"
#include "base/supports_user_data.h"
#include "base/task/single_thread_task_runner.h"
#include "base/uuid.h"
#include "chrome/browser/aux/AuxSelectedStateHome.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/aux/ui_storage_migration_worker.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_observer.h"
#include "chrome/browser/ui/aux_feature_lifecycle.h"
#include "components/value_store/value_store.h"
#include "components/services/storage/public/mojom/local_storage_control.mojom.h"
#include "components/services/storage/public/mojom/session_storage_control.mojom.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/aux_ui_migration_document.h"
#include "content/public/browser/dom_storage_context.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/render_process_host.h"
#include "content/public/browser/storage_partition.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/weak_document_ptr.h"
#include "crypto/hash.h"
#include "extensions/browser/api/storage/storage_frontend.h"
#include "extensions/browser/extension_api_frame_id_map.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/browser/extension_web_contents_observer.h"
#include "extensions/browser/process_manager.h"
#include "extensions/browser/script_executor.h"
#include "extensions/common/extension.h"
#include "extensions/common/mojom/code_injection.mojom.h"
#include "extensions/common/mojom/host_id.mojom.h"
#include "extensions/common/mojom/match_origin_as_fallback.mojom.h"
#include "extensions/common/mojom/run_location.mojom.h"
#include "mojo/public/cpp/bindings/callback_helpers.h"
#include "third_party/blink/public/mojom/script/script_evaluation_params.mojom.h"

namespace aux {
namespace migration_detail {
constexpr char kController[] = "aux.ui-storage-migration-controller.v1";
constexpr char kCodec[] = "assets/draft-storage-ixLojjZ5.js";
constexpr size_t kCaptureLimit = 64 * 1024 * 1024;
using Reply = base::OnceCallback<void(base::DictValue)>;
using ScriptResults = std::vector<extensions::ScriptExecutor::FrameResult>;
using Frontend = extensions::StorageFrontend;
using ExtensionLease = Frontend::AuxUiMigrationLease;

base::DictValue Refused(std::string reason) {
  base::DictValue result;
  result.Set("success", false);
  result.Set("activationAuthorized", false);
  result.Set("qualified", false);
  result.Set("error", std::move(reason));
  return result;
}
bool Text(const base::DictValue& value, std::string_view key, std::string_view expected) {
  const auto* actual = value.FindString(key); return actual && *actual == expected;
}
bool UiDraftKey(std::string_view key, bool local) {
  if (key.empty() || key.size() > 8192 || std::ranges::any_of(key,
      [](unsigned char c) { return c < 32 || c == 127; })) return false;
  for (const auto prefix : {"aux.chat-draft.v3:", "aux.chat-draft-text.v1:"})
    if (key.starts_with(prefix) && key.size() > std::string_view(prefix).size()) return true;
  constexpr std::string_view settings = "aux.sidepanel-new-session-settings.v2:";
  return !local && (key == "aux.chat-pending-new-session-message.v2" ||
      (key.starts_with(settings) && key.size() > settings.size()));
}
// These are source DATA. Actual Profile/document/cache/lease ownership is joined
// independently; no reported identity or writer Boolean grants native authority.
struct WireMutation {
  bool local = false, remove = false;
  std::u16string key, value;
};
struct WireStores {
  std::map<std::u16string, std::u16string> session, local;
  std::vector<WireMutation> mutations;
};
bool ReadWireUnits(const base::Value* value, std::u16string& output, size_t& total) {
  const auto* units = value ? value->GetIfList() : nullptr;
  if (!units || units->size() > 4194304 || total > 4194304 - units->size()) return false;
  output.clear(); output.reserve(units->size()); total += units->size();
  for (const auto& unit : *units) {
    const auto number = unit.GetIfInt();
    if (!number || *number < 0 || *number > 65535) return false;
    output.push_back(static_cast<char16_t>(*number));
  }
  return true;
}
bool WireKey(const std::u16string& units, bool local) {
  // Draft identities already have finite ASCII native schemas. Unknown Unicode
  // identities refuse; values remain exact UTF16, including lone surrogates.
  if (units.size() > 8192) return false;
  std::string key; key.reserve(units.size());
  for (const auto unit : units) {
    if (unit > 127) return false;
    key.push_back(static_cast<char>(unit));
  }
  return UiDraftKey(key, local);
}
bool ReadWireEntries(const base::Value* value, bool local,
                     std::map<std::u16string, std::u16string>& output,
                     size_t& count, size_t& total) {
  const auto* entries = value ? value->GetIfList() : nullptr;
  if (!entries || entries->size() > 4096 || count > 4096 - entries->size()) return false;
  count += entries->size();
  for (const auto& raw : *entries) {
    const auto* entry = raw.GetIfDict(); std::u16string key, data;
    if (!entry || entry->size() != 2 || !ReadWireUnits(entry->Find("key"), key, total) ||
        !WireKey(key, local) || !ReadWireUnits(entry->Find("value"), data, total) ||
        !output.emplace(std::move(key), std::move(data)).second) return false;
  }
  return true;
}
std::optional<WireStores> ReadWireStores(const base::DictValue& value,
                                       std::string_view actual_origin) {
  if (value.size() != 5 || !Text(value, "format", "aux.ui-draft-store-units.v1") ||
      !Text(value, "origin", actual_origin)) return std::nullopt;
  WireStores stores; size_t count = 0, total = 0;
  if (!ReadWireEntries(value.Find("sessionEntries"), false, stores.session, count, total) ||
      !ReadWireEntries(value.Find("localEntries"), true, stores.local, count, total)) return std::nullopt;
  const auto* changes = value.FindList("mutations");
  if (!changes || changes->size() > 4096 || count > 4096 - changes->size()) return std::nullopt;
  std::set<std::pair<bool, std::u16string>> changed;
  for (const auto& raw : *changes) {
    const auto* change = raw.GetIfDict();
    if (!change || (!Text(*change, "storage", "local-storage") && !Text(*change, "storage", "session-storage")) ||
        (!Text(*change, "operation", "set") && !Text(*change, "operation", "remove"))) return std::nullopt;
    WireMutation mutation;
    mutation.local = Text(*change, "storage", "local-storage");
    mutation.remove = Text(*change, "operation", "remove");
    if (change->size() != (mutation.remove ? 3u : 4u) ||
        !ReadWireUnits(change->Find("key"), mutation.key, total) || !WireKey(mutation.key, mutation.local) ||
        (!mutation.remove && !ReadWireUnits(change->Find("value"), mutation.value, total)) ||
        !changed.emplace(mutation.local, mutation.key).second) return std::nullopt;
    stores.mutations.push_back(std::move(mutation));
  }
  return stores;
}
bool CanonicalUuid(const std::string& value) {
  return base::Uuid::ParseLowercase(value).is_valid() &&
      base::Uuid::ParseLowercase(value).AsLowercaseString() == value;
}
void Integer(std::vector<uint8_t>& bytes, uint64_t value, size_t count) {
  for (size_t i = 0; i < count; ++i) bytes.push_back((value >> (8 * i)) & 255);
}
uint64_t IntegerAt(const std::vector<uint8_t>& bytes, size_t at, size_t count) {
  uint64_t result = 0;
  for (size_t i = 0; i < count; ++i) result |= uint64_t(bytes[at + i]) << (8 * i);
  return result;
}
std::vector<uint8_t> UuidBytes(const std::string& id) {
  std::vector<uint8_t> result;
  std::string hex = id;
  std::erase(hex, '-');
  if (!CanonicalUuid(id) || !base::HexStringToBytes(hex, &result) || result.size() != 16) return {};
  return result;
}
std::array<uint8_t, 32> Digest(const std::string& bytes) {
  return crypto::hash::Sha256(base::as_byte_span(bytes));
}
// The native UI owner retains its exact next frame. Re-entry observes
// that same authority sequence/nonce, never starts a new physical upload.
struct Transfer {
  Transfer();
  ~Transfer();
  std::string capture, upload, journal, receipt, error;
  std::array<uint8_t, 32> digest{};
  uint64_t generation = 0;
  size_t offset = 0, read_offset = 0;
  int phase = 0;
  bool complete = false;
  std::atomic_bool running{false}, cancelled{false};
  std::vector<uint8_t> next;
};
Transfer::Transfer() = default;
Transfer::~Transfer() = default;

void TransferCapture(std::shared_ptr<Transfer> transfer) {
  auto& t = *transfer;
  t.error.clear();
  do {
    if (t.complete || t.cancelled.load()) break;
    if (t.next.empty()) {
      const auto upload = UuidBytes(t.upload);
      if (t.phase == 0) {
        t.next = {1}; t.next.insert(t.next.end(), upload.begin(), upload.end());
        Integer(t.next, t.capture.size(), 4); t.next.insert(t.next.end(), t.digest.begin(), t.digest.end());
      } else if (t.phase == 1 && t.offset < t.capture.size()) {
        const size_t amount = std::min<size_t>(8192 - 21, t.capture.size() - t.offset);
        t.next = {2}; t.next.insert(t.next.end(), upload.begin(), upload.end()); Integer(t.next, t.offset, 4);
        t.next.insert(t.next.end(), t.capture.begin() + t.offset, t.capture.begin() + t.offset + amount);
      } else if (t.phase <= 2) {
        t.phase = 2; t.next = {3}; t.next.insert(t.next.end(), upload.begin(), upload.end());
      } else if (t.phase == 3) {
        const auto journal = UuidBytes(t.journal);
        t.next = {5}; t.next.insert(t.next.end(), journal.begin(), journal.end());
      } else {
        const auto journal = UuidBytes(t.journal);
        const size_t amount = std::min<size_t>(8191, t.capture.size() - t.read_offset);
        t.next = {6}; t.next.insert(t.next.end(), journal.begin(), journal.end());
        Integer(t.next, t.read_offset, 4); Integer(t.next, amount, 4);
      }
    }
    // On repeated exact frames RequestAuthority observes the retained nonce;
    // it does not replay the underlying physical persistence operation.
    auto result = peer::ExchangeNativeSelectedUiCaptureFrame(t.next);
    if (result.status != peer::DaemonAuthorityStatus::ready) {
      t.error = "Native capture transport outcome remains unacknowledged"; break;
    }
    const auto& bytes = result.payload;
    if (t.phase == 0) {
      if (bytes.size() != 5 || bytes[0] != 1 || IntegerAt(bytes, 1, 4) > t.capture.size()) {
        t.error = "Invalid native capture begin reply"; break;
      }
      t.offset = IntegerAt(bytes, 1, 4); t.phase = 1;
    } else if (t.phase == 1) {
      const size_t expected = t.offset + t.next.size() - 21;
      if (bytes.size() != 5 || bytes[0] != 2 || IntegerAt(bytes, 1, 4) != expected) {
        t.error = "Invalid native capture append reply"; break;
      }
      t.offset = expected;
    } else if (t.phase == 2) {
      if (bytes.empty() || bytes[0] != 3) { t.error = "Invalid native capture persist reply"; break; }
      t.receipt.assign(bytes.begin() + 1, bytes.end());
      auto receipt = base::JSONReader::ReadDict(t.receipt, base::JSON_PARSE_RFC);
      const auto* journal = receipt ? receipt->FindString("transactionId") : nullptr;
      const auto* digest = receipt ? receipt->FindString("captureSha256") : nullptr;
      if (!journal || !CanonicalUuid(*journal) || !digest ||
          !Text(*receipt, "format", "aux.ui-storage.capture-receipt.v1") ||
          *digest != base::HexEncodeLower(t.digest) ||
          !Text(*receipt, "phase", "captured-unqualified") ||
          receipt->FindBool("activationAuthorized") != false) {
        t.error = "Native capture receipt mismatch"; break;
      }
      t.journal = *journal; t.phase = 3;
    } else if (t.phase == 3) {
      if (bytes.size() < 57 || bytes[0] != 5 || IntegerAt(bytes, 1, 4) != t.capture.size() ||
          IntegerAt(bytes, 5, 8) != t.generation || IntegerAt(bytes, 13, 8) != t.generation ||
          !std::equal(t.digest.begin(), t.digest.end(), bytes.begin() + 21) ||
          IntegerAt(bytes, 53, 4) != bytes.size() - 57 ||
          std::string(bytes.begin() + 57, bytes.end()) != t.receipt) {
        t.error = "Native capture readback binding mismatch"; break;
      }
      t.phase = 4;
    } else {
      const size_t amount = IntegerAt(t.next, 21, 4);
      if (bytes.size() != amount + 1 || bytes[0] != 6 ||
          !std::equal(bytes.begin() + 1, bytes.end(), t.capture.begin() + t.read_offset)) {
        t.error = "Native capture exact readback mismatch"; break;
      }
      t.read_offset += amount;
      t.complete = t.read_offset == t.capture.size();
    }
    t.next.clear();
  } while (false);
  if (t.cancelled.load() && !t.complete) t.error = "Native source changed during capture transfer";
  t.running.store(false, std::memory_order_release);
}

// One immutable record over the existing authenticated finite journal channel.
// Exact pending frames and original upload survive unknown physical results.
struct IntentRecord {
  std::string payload, upload, journal, receipt, error;
  std::array<uint8_t, 32> digest{}, receipt_digest{}, previous_digest{}, intent_digest{};
  uint32_t ordinal = 0;
  uint8_t kind = 1;
  size_t offset = 0, read_offset = 0;
  int phase = 0;
  bool complete = false;
  std::vector<uint8_t> next;
};
constexpr std::array<std::string_view, 8> kRecordKinds = {
  "pre-target-intent", "target-attempt", "store-readback", "restore-attempt",
  "source-readback", "backends-target-observed", "cache-publish-attempt", "cache-publish-ack"};
bool IntentReceipt(const IntentRecord& t, std::string_view receipt) {
  auto parsed = base::JSONReader::ReadDict(receipt, base::JSON_PARSE_RFC);
  return parsed && Text(*parsed, "format", "aux.ui-storage.transaction-receipt.v1") &&
      Text(*parsed, "transactionId", t.journal) && Text(*parsed, "ordinal", base::NumberToString(t.ordinal)) &&
      t.kind >= 1 && t.kind <= kRecordKinds.size() && Text(*parsed, "kind", kRecordKinds[t.kind - 1]) && Text(*parsed, "phase", "unqualified-data") &&
      parsed->FindBool("qualified") == false && parsed->FindBool("activationAuthorized") == false &&
      Text(*parsed, "payloadSha256", base::HexEncodeLower(t.digest)) &&
      Text(*parsed, "intentSha256", base::HexEncodeLower(t.intent_digest)) &&
      Text(*parsed, "previousRecordSha256", base::HexEncodeLower(t.previous_digest));
}
void TransferIntentRecord(IntentRecord& t) {
  t.error.clear();
  if (t.complete) return;
  const auto journal = UuidBytes(t.journal), upload = UuidBytes(t.upload);
  if (journal.size() != 16 || upload.size() != 16 || t.ordinal >= 64 || t.kind < 1 || t.kind > 8 ||
      t.payload.empty() || t.payload.size() > kCaptureLimit) {
    t.error = "Invalid retained native immutable intent descriptor"; return;
  }
  if (t.next.empty()) {
    if (t.phase == 0) {
      t.next = {7}; t.next.insert(t.next.end(), journal.begin(), journal.end());
      t.next.insert(t.next.end(), upload.begin(), upload.end()); Integer(t.next, t.ordinal, 4);
      t.next.push_back(t.kind); t.next.insert(t.next.end(), t.previous_digest.begin(), t.previous_digest.end());
      t.next.insert(t.next.end(), t.intent_digest.begin(), t.intent_digest.end());
      Integer(t.next, t.payload.size(), 4); t.next.insert(t.next.end(), t.digest.begin(), t.digest.end());
    } else if (t.phase == 1 && t.offset < t.payload.size()) {
      const size_t count = std::min<size_t>(8192 - 21, t.payload.size() - t.offset);
      t.next = {8}; t.next.insert(t.next.end(), upload.begin(), upload.end()); Integer(t.next, t.offset, 4);
      const auto part = base::as_byte_span(t.payload).subspan(t.offset, count);
      t.next.insert(t.next.end(), part.begin(), part.end());
    } else if (t.phase <= 2) {
      t.phase = 2; t.next = {9}; t.next.insert(t.next.end(), upload.begin(), upload.end());
    } else if (t.phase == 3) {
      t.next = {10}; t.next.insert(t.next.end(), journal.begin(), journal.end()); Integer(t.next, t.ordinal, 4);
    } else {
      const size_t count = std::min<size_t>(8191, t.payload.size() - t.read_offset);
      t.next = {11}; t.next.insert(t.next.end(), journal.begin(), journal.end()); Integer(t.next, t.ordinal, 4);
      Integer(t.next, t.read_offset, 4); Integer(t.next, count, 4);
    }
  }
  auto result = peer::ExchangeNativeSelectedUiCaptureFrame(t.next);
  if (result.status != peer::DaemonAuthorityStatus::ready) {
    t.error = "Immutable intent transport outcome remains unacknowledged"; return;
  }
  const auto bytes = base::span(result.payload);
  if (bytes.size() > 8192) { t.error = "Immutable intent reply exceeds its bound"; return; }
  if (t.phase == 0) {
    if (bytes.size() != 5 || bytes.front() != 7 || IntegerAt(result.payload, 1, 4) > t.payload.size()) {
      t.error = "Invalid immutable intent Begin result"; return;
    }
    t.offset = IntegerAt(result.payload, 1, 4); t.phase = 1;
  } else if (t.phase == 1) {
    const size_t expected = t.offset + t.next.size() - 21;
    if (bytes.size() != 5 || bytes.front() != 8 || IntegerAt(result.payload, 1, 4) != expected) {
      t.error = "Invalid immutable intent Append result"; return;
    }
    t.offset = expected;
  } else if (t.phase == 2) {
    if (bytes.size() < 37 || bytes.front() != 9 || IntegerAt(result.payload, 33, 4) != bytes.size() - 37) {
      t.error = "Invalid immutable intent Persist result"; return;
    }
    const auto raw = bytes.subspan<37>();
    t.receipt.assign(raw.begin(), raw.end());
    t.receipt_digest = Digest(t.receipt);
    if (!std::ranges::equal(bytes.subspan<1, 32>(), t.receipt_digest) || !IntentReceipt(t, t.receipt)) {
      t.error = "Immutable intent receipt does not match exact original descriptor"; return;
    }
    t.phase = 3;
  } else if (t.phase == 3) {
    if (bytes.size() < 42 || bytes.front() != 10 || IntegerAt(result.payload, 1, 4) != t.payload.size() ||
        bytes[5] != t.kind || IntegerAt(result.payload, 38, 4) != bytes.size() - 42 ||
        !std::ranges::equal(bytes.subspan<6, 32>(), t.receipt_digest) ||
        !std::ranges::equal(bytes.subspan<42>(), base::as_byte_span(t.receipt))) {
      t.error = "Immutable intent fresh Load does not match persisted receipt"; return;
    }
    t.phase = 4;
  } else {
    const size_t count = std::min<size_t>(8191, t.payload.size() - t.read_offset);
    if (bytes.size() != count + 1 || bytes.front() != 11 ||
        !std::ranges::equal(bytes.subspan<1>(), base::as_byte_span(t.payload).subspan(t.read_offset, count))) {
      t.error = "Immutable intent exact payload readback differs"; return;
    }
    t.read_offset += count;
    if (t.read_offset == t.payload.size()) t.complete = true;
  }
  t.next.clear();
}

struct Frame {
  Frame();
  ~Frame();
  content::WeakDocumentPtr document;
  content::GlobalRenderFrameHostId routing;
  extensions::ExtensionApiFrameIdMap::DocumentId document_id;
  std::optional<blink::LocalFrameToken> native_frame_token;
  std::optional<blink::DocumentToken> native_document_token;
  base::WeakPtr<content::WebContents> contents;
  std::unique_ptr<extensions::ScriptExecutor> executor;
  std::string request_id, lease_id, capture_json, result_json, namespace_id;
  double revision = 0;
  std::optional<WireStores> source_stores;
  int frame_id = -1;
  bool prepared = false, sealed = false, cleanup_unknown = false;
  std::string target_observation_sha, owner_state_json, memory_state_json;
};
Frame::Frame() = default;
Frame::~Frame() = default;
// Proxy pointers are NEVER retained across asynchronous boundaries. A hold stores
// only the actual original partition index, native correlation and service data.
struct DomHold {
  size_t partition = 0;
  bool local = false, attempted = false, pending = false, unknown = false, released = false;
  uint64_t generation = 0;
  base::UnguessableToken request;
  std::optional<base::UnguessableToken> token;
  storage::mojom::AuxUiDomLeaseReplyPtr source;
  std::vector<storage::mojom::AuxUiDomTargetMapPtr> targets;
  bool stage_attempted = false, staged = false;
  bool commit_attempted = false, publish_attempted = false;
  bool target_seen = false, source_seen = false, mixed_seen = false, published = false;
};
// Exact current StorageArea target codec, pinned to actual GetKeyFormat(),
// GetValueFormat() and StringToUint8Vector(). This is target policy, never a
// guessed database/map-format observation. Existing untouched raw bytes stay exact.
std::optional<std::u16string> TargetLogicalKey(const std::vector<uint8_t>& raw, bool local) {
  auto bytes = base::span(raw);
  bool utf16 = false;
  if (local) {
    if (bytes.empty() || bytes.front() > 1) return std::nullopt;
    utf16 = bytes.front() == 0; bytes = bytes.subspan<1>();
  } else utf16 = bytes.size() >= 2 && (bytes[0] == 0 || bytes[1] == 0);
  std::u16string key;
  if (utf16) {
    if (bytes.size() % 2) return std::nullopt;
    while (!bytes.empty()) {
      const auto part = bytes.first<2>();
      const auto unit = std::bit_cast<char16_t>(std::array<uint8_t, 2>{part[0], part[1]});
      if (unit < 32 || unit > 126) return std::nullopt;
      key.push_back(unit); bytes = bytes.subspan<2>();
    }
  } else {
    for (const auto unit : bytes) {
      if (unit < 32 || unit > 126) return std::nullopt;
      key.push_back(unit);
    }
  }
  return key.empty() || key.size() > 8192 ? std::nullopt : std::optional(std::move(key));
}
std::vector<uint8_t> CurrentTargetKey(const std::u16string& key, bool local) {
  std::vector<uint8_t> result;
  if (local) result.push_back(1);
  for (const auto unit : key) result.push_back(static_cast<uint8_t>(unit));
  return result;
}
std::vector<uint8_t> CurrentTargetValue(const std::u16string& value, bool local) {
  std::vector<uint8_t> result;
  const bool latin1 = local && std::ranges::all_of(value, [](char16_t unit) { return unit <= 255; });
  if (local) result.push_back(latin1 ? 1 : 0);
  if (latin1) for (const auto unit : value) result.push_back(static_cast<uint8_t>(unit));
  else {
    const auto bytes = base::as_byte_span(value);
    result.insert(result.end(), bytes.begin(), bytes.end());
  }
  return result;
}
bool SameDomSource(const storage::mojom::AuxUiDomLeaseReply& first,
                   const storage::mojom::AuxUiDomLeaseReply& next) {
  if (first.source_topology_sha256 != next.source_topology_sha256 || first.maps.size() != next.maps.size()) return false;
  for (size_t i = 0; i < first.maps.size(); ++i) {
    if (!first.maps[i] || !next.maps[i]) return false;
    const auto& a = *first.maps[i]; const auto& b = *next.maps[i];
    if (a.map_ordinal != b.map_ordinal || a.storage_key != b.storage_key || a.session_ids != b.session_ids ||
        a.map_id != b.map_id || a.source_persisted != b.source_persisted ||
        a.source_last_accessed_us != b.source_last_accessed_us || a.source_last_modified_us != b.source_last_modified_us ||
        a.source_total_size_bytes != b.source_total_size_bytes ||
        a.source_map_sha256 != b.source_map_sha256 || a.source_entries != b.source_entries ||
        a.cache_views.size() != b.cache_views.size()) return false;
    for (size_t j = 0; j < a.cache_views.size(); ++j) {
      if (!a.cache_views[j] || !b.cache_views[j]) return false;
      const auto& av = *a.cache_views[j]; const auto& bv = *b.cache_views[j];
      if (av.namespace_id != bv.namespace_id || !av.cache || !bv.cache ||
          av.cache->sources != bv.cache->sources || av.cache->source_entries != bv.cache->source_entries) return false;
    }
  }
  return true;
}
std::optional<std::u16string> TargetLogicalValue(const std::vector<uint8_t>& raw, bool local) {
  auto bytes = base::span(raw); bool latin1 = false;
  if (local) {
    if (bytes.empty() || bytes.front() > 1) return std::nullopt;
    latin1 = bytes.front() == 1; bytes = bytes.subspan<1>();
  }
  if (bytes.size() > 8388608 || (!latin1 && bytes.size() % 2)) return std::nullopt;
  std::u16string value;
  if (latin1) for (const auto unit : bytes) value.push_back(unit);
  else while (!bytes.empty()) {
    const auto part = bytes.first<2>();
    value.push_back(std::bit_cast<char16_t>(std::array<uint8_t, 2>{part[0], part[1]}));
    bytes = bytes.subspan<2>();
  }
  return value.size() > 4194304 ? std::nullopt : std::optional(std::move(value));
}
bool PrivateDraftTargetsMatch(const storage::mojom::AuxUiDomMapSnapshot& map, bool local, bool allow_published = false) {
  std::map<std::u16string, std::u16string> expected;
  for (const auto& entry : map.target_entries) {
    if (!entry) return false;
    auto key = TargetLogicalKey(entry->key, local);
    auto value = TargetLogicalValue(entry->value, local);
    if (!key || !value) return false;
    if (WireKey(*key, local) && !expected.emplace(std::move(*key), std::move(*value)).second) return false;
  }
  for (const auto& view : map.cache_views) {
    if (!view || !view->cache || !view->cache->ok || !view->cache->held ||
        view->cache->tainted || (view->cache->published && !allow_published) || !view->cache->error.empty()) return false;
    std::map<std::u16string, std::u16string> staged;
    size_t units = 0;
    for (const auto& entry : view->cache->staged_entries) {
      if (!entry || entry->key.size() > 4194304 || entry->value.size() > 4194304 ||
          units > 4194304 - entry->key.size() || units + entry->key.size() > 4194304 - entry->value.size()) return false;
      units += entry->key.size() + entry->value.size();
      std::u16string key(entry->key.begin(), entry->key.end());
      if (WireKey(key, local) && !staged.emplace(std::move(key),
          std::u16string(entry->value.begin(), entry->value.end())).second) return false;
    }
    if (expected != staged) return false;
  }
  return true;
}

class Controller final : public base::SupportsUserData::Data, public ProfileObserver {
 public:
  explicit Controller(Profile*);
  ~Controller() override;
  void Begin(content::RenderFrameHost*, Reply);
  bool pending() const;
  std::unique_ptr<UiStorageMigrationCompletion> TakeCompletion();
  bool AcknowledgeCompletion(UiStorageMigrationOwnerAck);
  base::CallbackListSubscription Observe(base::RepeatingClosure);
 private:
  bool Current() const;
  bool Inventory(bool retain);
  bool DocumentCurrent(const Frame&) const;
  void PrepareNext();
  void Invoke(size_t, std::string_view, base::ListValue,
              base::OnceCallback<void(std::optional<base::DictValue>, std::string)>);
  void Prepared(size_t, std::optional<base::DictValue>, std::string);
  void ObservePrepared(size_t, std::optional<base::DictValue>, std::string);
  bool AcceptLease(Frame&, const base::DictValue&, bool sealed = false);
  void BeginWorker();
  void WorkerPrepared(base::DictValue);
  bool WorkerCorrelation(const base::DictValue&, bool allow_bind);
  void WorkerControlLost(bool cleanup);
  void BeginFrontend();
  void FrontendPrepared(Frontend::AuxUiMigrationLeaseResult);
  void FrontendLost(bool begin);
  bool FrontendCurrent() const;
  void ReadWorkerForValidation();
  void WorkerReadForValidation(base::DictValue);
  void ValidateWorker();
  void WorkerValidated(base::DictValue);
  void ValidateFrontend();
  void FrontendReadback(Frontend::AuxUiMigrationReadbackResult);
  void ValidationComplete();
  void StartCleanup();
  void CleanupWorker();
  void ObservedWorkerCleanup(base::DictValue);
  void ReleasedWorker(base::DictValue);
  std::optional<content::DOMStorageContext::AuxUiMigrationControls> DomControls(size_t) const;
  bool DomCurrent() const;
  bool AcceptDom(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  bool PairDomSources() const;
  bool BuildDomTargets();
  void StageDomNext();
  void StagedDom(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  enum class LiveAction {
    kExtensionAttempt, kExtensionCommit, kExtensionRead, kDomAttempt, kDomCommit, kDomRead,
    kBackendsObserved, kPublishAttempt, kPublish, kPublishRead, kPublishAck, kComplete,
    kRestoreDomAttempt, kRestoreDom, kRestoreDomRead,
    kRestoreExtensionAttempt, kRestoreExtension, kRestoreExtensionRead, kRestored
  };
  bool LiveOwners(bool restoration);
  bool AcceptLiveDom(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  bool LiveStores(size_t, const base::DictValue&) const;
  base::DictValue LiveFacts() const;
  bool CompletionCurrent();
  std::string CompletionFingerprint() const;
  void StartLive();
  void RunLive();
  void ValidateLive();
  void LiveWorker(base::DictValue);
  void LiveFrameNext();
  void LiveFrame(size_t, std::optional<base::DictValue>, std::string);
  void LiveFrontend(Frontend::AuxUiMigrationReadbackResult);
  void LiveDomNext();
  void LiveDomValidated(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  void ActLive();
  void RecordLive(uint8_t, LiveAction);
  void StepLiveRecord();
  void LiveExtensionStatus(value_store::ValueStore::Status);
  void LiveExtensionRead(Frontend::AuxUiMigrationReadbackResult);
  void LiveDomStatus(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  void LiveDomRead(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  void LiveLost();
  void RollbackLive(std::string);
  void HoldLive(std::string);
  void BeginIntent();
  void RunIntent();
  void BeginDomNext();
  void BeganDom(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  void DomLost(size_t);
  void ValidateDomNext();
  void ValidatedDom(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  void SealNext();
  void Sealed(size_t, bool, std::optional<base::DictValue>, std::string);
  void CleanupDomNext();
  void ObservedDomCleanup(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  void ReleasedDom(size_t, bool);
  void CleanupFrontend();
  void ValidateNext();
  void Validated(size_t, std::optional<base::DictValue>, std::string);
  void Persist();
  void RunTransfer();
  void TransferStep();
  void ObserveCleanupNext();
  void ObservedCleanup(size_t, std::optional<base::DictValue>, std::string);
  void Persisted();
  void ReleaseNext();
  void Released(size_t, std::optional<base::DictValue>, std::string);
  void Finish(std::string);
  void ReplyResult();
  void OnProfileWillBeDestroyed(Profile*) override;
  base::WeakPtr<Profile> profile_;
  scoped_refptr<const extensions::Extension> extension_;
  content::WeakDocumentPtr source_;
  std::string profile_id_, binding_, restoration_, error_;
  std::vector<std::unique_ptr<Frame>> frames_;
  std::vector<content::StoragePartition*> partitions_;
  std::unique_ptr<ExtensionLease> extension_lease_;
  std::vector<DomHold> dom_holds_;
  size_t dom_cursor_ = 0;
  bool sealing_ = false, dom_cleaning_ = false;
  base::UnguessableToken frontend_request_id_;
  extensions::WorkerId worker_inventory_;
  base::Uuid worker_context_id_;
  std::string worker_request_id_, worker_report_json_;
  bool worker_inventory_retained_ = false, worker_attempted_ = false;
  bool frontend_begin_pending_ = false, frontend_io_pending_ = false;
  bool frontend_begin_unknown_ = false, frontend_io_unknown_ = false;
  std::shared_ptr<Transfer> transfer_;
  std::unique_ptr<IntentRecord> intent_;
  bool intent_validation_ = false;
  bool recovery_mode_ = false;
  LiveAction live_action_ = LiveAction::kExtensionAttempt, live_after_record_ = LiveAction::kExtensionAttempt;
  bool live_active_ = false, live_pending_ = false, live_rollback_ = false;
  bool live_persistent_attempted_ = false, live_target_complete_ = false, live_source_complete_ = false;
  bool live_extension_attempted_ = false, live_extension_target_ = false;
  bool live_extension_synced_ = false;
  size_t live_domain_ = 0, live_cursor_ = 0, live_record_bytes_ = 0;
  int live_observation_domain_ = -1;
  std::string live_failure_;
  bool live_terminal_written_ = false, completion_taken_ = false;
  uint32_t terminal_ordinal_ = 0;
  std::unique_ptr<UiStorageMigrationCompletion> completion_fact_;
  std::optional<UiStorageMigrationOwnerAck> completion_ack_;
  std::unique_ptr<IntentRecord> live_record_;
  std::vector<std::unique_ptr<IntentRecord>> live_records_;

  Reply reply_;
  base::RepeatingClosureList settled_;
  size_t cursor_ = 0;
  bool busy_ = false, cleanup_unknown_ = false, post_persist_validation_ = false, transfer_validation_ = false, observing_cleanup_ = false;
  base::ScopedObservation<Profile, ProfileObserver> profile_observation_{this};
  base::WeakPtrFactory<Controller> weak_{this};
};
Controller::Controller(Profile* profile) : profile_(profile->GetWeakPtr()) {
  profile_observation_.Observe(profile);
}
Controller::~Controller() { if (transfer_) transfer_->cancelled.store(true); }
base::CallbackListSubscription Controller::Observe(base::RepeatingClosure callback) {
  return settled_.Add(std::move(callback));
}
bool Controller::pending() const {
  return busy_ || cleanup_unknown_ || extension_lease_ || worker_attempted_ ||
      live_active_ || live_pending_ || (live_record_ && !live_record_->complete) ||
      (intent_ && !intent_->complete) ||
      std::ranges::any_of(dom_holds_, [](const auto& hold) { return hold.attempted && !hold.released; }) ||
      frontend_begin_pending_ || frontend_io_pending_ || frontend_begin_unknown_ || frontend_io_unknown_ ||
      (transfer_ && (transfer_->running.load(std::memory_order_acquire) || !transfer_->complete));
}
bool Controller::Current() const {
  auto* source = source_.AsRenderFrameHostIfValid();
  auto* registry = profile_ ? extensions::ExtensionRegistry::Get(profile_.get()) : nullptr;
  return profile_ && source && source->GetBrowserContext() == profile_.get() &&
      IsAuxLocalProfileAdmitted(profile_.get()) && !IsProfileCookieRestorePending(profile_.get()) &&
      GetProfileId(profile_.get()) == profile_id_ && GetProfileCookieBindingEpoch(profile_.get()) == binding_ &&
      GetProfileCookieRestoreEpoch(profile_.get()) == restoration_ && registry && extension_ &&
      registry->enabled_extensions().GetByID(kAgentExtensionId) == extension_.get();
}
bool Controller::DocumentCurrent(const Frame& frame) const {
  auto* actual = frame.document.AsRenderFrameHostIfValid();
  return profile_ && actual && frame.contents && !frame.contents->IsBeingDestroyed() &&
      actual->GetBrowserContext() == profile_.get() && actual->IsRenderFrameLive() && actual->IsActive() &&
      actual->GetGlobalId() == frame.routing &&
      extensions::ExtensionApiFrameIdMap::GetDocumentId(actual) == frame.document_id &&
      frame.native_frame_token && actual->GetFrameToken() == *frame.native_frame_token &&
      frame.native_document_token && content::GetDocumentTokenForAuxUiMigration(*actual) == frame.native_document_token &&
      actual->GetLastCommittedOrigin() == extension_->origin();
}
bool Controller::Inventory(bool retain) {
  if (!Current()) return false;
  auto* manager = extensions::ProcessManager::Get(profile_.get());
  if (!manager) return false;
  // Initial inventory pins the actual worker as UNclosed inventory only. The
  // distinct helper later proves its own physical lifetime and source pause.
  const auto workers = manager->GetServiceWorkersForExtension(kAgentExtensionId);
  if (workers.size() != 1 || !workers.front().start_token) return false;
  const auto context = manager->GetContextIdForWorker(workers.front());
  if (!context.is_valid()) return false;
  if (retain) {
    worker_inventory_ = workers.front(); worker_context_id_ = context;
    worker_inventory_retained_ = true;
  } else if (!worker_inventory_retained_ || workers.front() != worker_inventory_ ||
      workers.front().start_token != worker_inventory_.start_token || context != worker_context_id_) return false;
  const auto registered = manager->GetRenderFrameHostsForExtension(kAgentExtensionId);
  if (registered.empty() || registered.size() > 128) return false;
  std::set<content::RenderFrameHost*> actual;
  for (auto process = content::RenderProcessHost::AllHostsIterator(); !process.IsAtEnd(); process.Advance()) {
    if (process.GetCurrentValue()->GetBrowserContext() != profile_.get()) continue;
    process.GetCurrentValue()->ForEachRenderFrameHost([&](content::RenderFrameHost* frame) {
      if (frame->GetLastCommittedOrigin() == extension_->origin()) actual.insert(frame);
    });
  }
  if (actual != registered) return false;
  if (!retain) {
    if (frames_.size() != actual.size()) return false;
    for (const auto& frame : frames_) if (!DocumentCurrent(*frame) ||
        !actual.contains(frame->document.AsRenderFrameHostIfValid())) return false;
    return true;
  }
  for (auto* frame : actual) {
    auto* contents = content::WebContents::FromRenderFrameHost(frame);
    auto* observer = contents ? extensions::ExtensionWebContentsObserver::GetForWebContents(contents) : nullptr;
    if (!contents || !observer || !frame->IsRenderFrameLive() || !frame->IsActive() ||
        frame->IsErrorDocument() || !frame->GetPendingCommitCrossDocumentNavigations().empty() ||
        !observer->GetLocalFrame(frame)) return false;
    const auto config = frame->GetStoragePartition()->GetConfig();
    const auto& namespaces = contents->GetController().GetSessionStorageNamespaceMap();
    const auto ns = namespaces.find(config);
    if (ns == namespaces.end() || !ns->second || ns->second->id().empty()) return false;
    const auto native_document = content::GetDocumentTokenForAuxUiMigration(*frame);
    if (!native_document) return false;
    auto retained = std::make_unique<Frame>();
    retained->native_frame_token = frame->GetFrameToken();
    retained->native_document_token = native_document;
    retained->document = frame->GetWeakDocumentPtr(); retained->routing = frame->GetGlobalId();
    retained->document_id = extensions::ExtensionApiFrameIdMap::GetDocumentId(frame);
    retained->frame_id = extensions::ExtensionApiFrameIdMap::GetFrameId(frame);
    retained->contents = contents->GetWeakPtr(); retained->namespace_id = ns->second->id();
    retained->request_id = base::Uuid::GenerateRandomV4().AsLowercaseString();
    retained->executor = std::make_unique<extensions::ScriptExecutor>(contents);
    frames_.push_back(std::move(retained));
    if (!std::ranges::contains(partitions_, frame->GetStoragePartition())) partitions_.push_back(frame->GetStoragePartition());
  }
  return true;
}
void Controller::Begin(content::RenderFrameHost* sender, Reply reply) {
  if (busy_ || (transfer_ && transfer_->running.load(std::memory_order_acquire))) {
    std::move(reply).Run(Refused("The actual native capture task remains running")); return;
  }
  if (live_active_) {
    busy_ = true; reply_ = std::move(reply); RunLive(); return;
  }
  if (intent_ && !intent_->complete) {
    if (!Current() || !Inventory(false) || !FrontendCurrent()) {
      std::move(reply).Run(Refused("Original source holds unavailable for immutable intent recovery")); return;
    }
    busy_ = true; reply_ = std::move(reply); intent_validation_ = true;
    cursor_ = 0; ReadWorkerForValidation(); return;
  }
  // Unfinished native transfer keeps ALL original holds. Never resume producers
  // or replace its upload UUID across an unknown physical capture result.
  if (transfer_ && !transfer_->complete) {
    if (!Current() || !Inventory(false) || !FrontendCurrent()) {
      std::move(reply).Run(Refused("Original source holds remain unavailable for transfer recovery")); return;
    }
    busy_ = true; reply_ = std::move(reply);
    transfer_validation_ = true; cursor_ = 0; ReadWorkerForValidation(); return;
  }
  if (cleanup_unknown_ || extension_lease_ || worker_attempted_ ||
      std::ranges::any_of(dom_holds_, [](const auto& hold) { return hold.attempted && !hold.released; }) ||
      frontend_begin_unknown_ || frontend_io_unknown_) {
    busy_ = true; observing_cleanup_ = true; reply_ = std::move(reply);
    StartCleanup(); return;
  }
  if (profile_ && (IsAuxLocalFeatureWritePending(profile_.get()) ||
      IsUiStorageMigrationWorkerPending(profile_.get()))) {
    std::move(reply).Run(Refused("An existing native profile writer/worker operation must settle before capture")); return;
  }
  frames_.clear(); partitions_.clear(); dom_holds_.clear(); transfer_.reset(); error_.clear();
  sealing_ = false; intent_.reset(); intent_validation_ = false;
  live_active_ = false; live_pending_ = false; live_rollback_ = false;
  live_persistent_attempted_ = false; live_target_complete_ = false; live_source_complete_ = false;
  live_extension_attempted_ = false; live_extension_target_ = false; live_extension_synced_ = false;
  live_failure_.clear(); live_records_.clear(); live_record_.reset();
  live_terminal_written_ = false; terminal_ordinal_ = 0; completion_taken_ = false; completion_fact_.reset(); completion_ack_.reset();
  worker_inventory_retained_ = false; worker_request_id_.clear(); worker_report_json_.clear();
  auto* registry = profile_ ? extensions::ExtensionRegistry::Get(profile_.get()) : nullptr;
  extension_ = registry ? registry->enabled_extensions().GetByID(kAgentExtensionId) : nullptr;
  if (!profile_ || !sender || sender->GetBrowserContext() != profile_.get() || !extension_ ||
      !profile_->IsRegularProfile() || profile_->IsOffTheRecord() ||
      sender->GetLastCommittedOrigin() != extension_->origin()) {
    std::move(reply).Run(Refused("Actual regular Aux document required")); return;
  }
  source_ = sender->GetWeakDocumentPtr(); profile_id_ = GetProfileId(profile_.get());
  binding_ = GetProfileCookieBindingEpoch(profile_.get()); restoration_ = GetProfileCookieRestoreEpoch(profile_.get());
  if (profile_id_.empty() || binding_.empty() || restoration_.empty() || !Inventory(true)) {
    frames_.clear(); std::move(reply).Run(Refused("Actual admitted profile/document/backend inventory unavailable")); return;
  }
  busy_ = true; observing_cleanup_ = false; cleanup_unknown_ = false;
  post_persist_validation_ = false; transfer_validation_ = false;
  reply_ = std::move(reply); cursor_ = 0; PrepareNext();
}
void Controller::Invoke(size_t index, std::string_view method, base::ListValue arguments,
    base::OnceCallback<void(std::optional<base::DictValue>, std::string)> callback) {
  if (index >= frames_.size() || !DocumentCurrent(*frames_[index])) {
    std::move(callback).Run(std::nullopt, "Original native document was lost"); return;
  }
  auto& frame = *frames_[index];
  auto encoded = base::WriteJson(arguments);
  if (!encoded || (method != "auxPrepareDraftMigrationCapture" && method != "auxReadDraftMigrationCapture" &&
      method != "auxPrepareDraftMigrationRecoveryCapture" &&
      method != "auxValidateDraftMigrationCapture" && method != "auxObserveDraftMigrationTarget" &&
      method != "auxSealDraftMigrationCapture" &&
      method != "auxReleaseDraftMigrationCapture")) {
    std::move(callback).Run(std::nullopt, "Finite capture command refused"); return;
  }
  const std::string script = "(async()=>{const m=await import('" + extension_->GetResourceURL(kCodec).spec() +
      "');return JSON.stringify(await m." + std::string(method) + "(..." + *encoded + "));})()";
  auto js = extensions::mojom::JSInjection::New();
  js->sources.push_back(extensions::mojom::JSSource::New(script, GURL()));
  js->world = extensions::mojom::ExecutionWorld::kMain;
  js->wants_result = blink::mojom::WantResultOption::kWantResult;
  js->user_gesture = blink::mojom::UserActivationOption::kDoNotActivate;
  js->wait_for_promise = blink::mojom::PromiseResultOption::kAwait;
  auto finished = base::BindOnce([](base::WeakPtr<Controller> self, size_t index,
      base::OnceCallback<void(std::optional<base::DictValue>, std::string)> callback, ScriptResults results) {
    if (!self || index >= self->frames_.size() || !self->DocumentCurrent(*self->frames_[index]) ||
        results.size() != 1 || !results[0].frame_responded || !results[0].error.empty() ||
        results[0].document_id != self->frames_[index]->document_id || !results[0].value.is_string() ||
        results[0].value.GetString().size() > kCaptureLimit) {
      std::move(callback).Run(std::nullopt, "Capture script result is unavailable or stale"); return;
    }
    self->frames_[index]->result_json = results[0].value.GetString();
    auto value = base::JSONReader::ReadDict(self->frames_[index]->result_json, base::JSON_PARSE_RFC);
    std::move(callback).Run(std::move(value), {});
  }, weak_.GetWeakPtr(), index, std::move(callback));
  extensions::mojom::HostID host(extensions::mojom::HostID::HostType::kExtensions, kAgentExtensionId);
  frame.executor->ExecuteScript(host, extensions::mojom::CodeInjection::NewJs(std::move(js)),
      extensions::ScriptExecutor::SPECIFIED_FRAMES, {frame.frame_id},
      extensions::mojom::MatchOriginAsFallbackBehavior::kNever, extensions::mojom::RunLocation::kBrowserDriven,
      extensions::ScriptExecutor::DEFAULT_PROCESS, GURL(),
      mojo::WrapCallbackWithDefaultInvokeIfNotRun(std::move(finished), ScriptResults()));
}
void Controller::PrepareNext() {
  if (!Inventory(false)) { Finish("Native frame/worker/profile inventory changed"); return; }
  if (cursor_ == frames_.size()) { BeginWorker(); return; }
  const size_t index = cursor_++;
  Invoke(index, recovery_mode_ ? "auxPrepareDraftMigrationRecoveryCapture" : "auxPrepareDraftMigrationCapture",
      base::ListValue().Append(frames_[index]->request_id).Append("utf16-v1"),
      base::BindOnce(&Controller::Prepared, weak_.GetWeakPtr(), index));
}
bool Controller::AcceptLease(Frame& frame, const base::DictValue& value, bool sealed) {
  const auto* request = value.FindString("requestId"), *lease = value.FindString("leaseId");
  auto revision = value.FindDouble("revision");
  auto owners = value.FindInt("ownerCount");
  const auto* raw_capture = value.FindString("captureJson");
  const auto* units = value.FindDict("storeUnits");
  const auto* owner_state = value.FindString("ownerStateJson"), *memory_state = value.FindString("memoryStateJson");
  auto stores = units ? ReadWireStores(*units, extension_->origin().Serialize()) : std::nullopt;
  if (!Text(value, "format", "aux.ui-draft-capture-lease.v1") ||
      value.FindBool("ok") != true || !request || *request != frame.request_id || !lease || !CanonicalUuid(*lease) ||
      !revision || *revision < 0 || *revision > 9007199254740991.0 || std::floor(*revision) != *revision ||
      !owners || *owners <= 0 || *owners > 256 || value.FindBool("sealed") != sealed ||
      (sealed && (!frame.prepared || *lease != frame.lease_id || *revision != frame.revision)) ||
      value.FindBool("recoveryReadOnly") != recovery_mode_ || !owner_state || owner_state->empty() ||
      !memory_state || memory_state->empty() || owner_state->size() > 33554432 ||
      memory_state->size() > 33554432 || owner_state->size() + memory_state->size() > 33554432 ||
      !Text(value, "wireFormat", "utf16-v1") || !raw_capture || raw_capture->empty() ||
      raw_capture->size() > 32 * 1024 * 1024 || !stores) return false;
  if (frame.result_json.empty() || frame.result_json.size() > kCaptureLimit) return false;
  // captureJson is retained opaque. Never reparse its raw strings as a lossy
  // substitute for the exact numeric units used in native semantic pairing.
  frame.lease_id = *lease; frame.revision = *revision; frame.capture_json = frame.result_json;
  frame.source_stores = std::move(stores); frame.prepared = true; frame.sealed = sealed;
  frame.owner_state_json = *owner_state; frame.memory_state_json = *memory_state;
  return true;
}
void Controller::Prepared(size_t index, std::optional<base::DictValue> value, std::string) {
  if (!value || !AcceptLease(*frames_[index], *value)) {
    // Preparation can have frozen a real producer before its result was lost.
    // Observe that retained lease without rerunning its writer flush.
    Invoke(index, "auxReadDraftMigrationCapture", base::ListValue().Append("utf16-v1"),
        base::BindOnce(&Controller::ObservePrepared, weak_.GetWeakPtr(), index)); return;
  }
  PrepareNext();
}
void Controller::ObservePrepared(size_t index, std::optional<base::DictValue> value, std::string error) {
  auto& frame = *frames_[index];
  if (value && Text(*value, "requestId", frame.request_id) && AcceptLease(frame, *value)) {
    PrepareNext(); return;
  }
  if (value && Text(*value, "requestId", frame.request_id)) {
    const auto* lease = value->FindString("leaseId");
    if (lease && CanonicalUuid(*lease)) { frame.lease_id = *lease; frame.prepared = true; }
  }
  const bool restored = value && Text(*value, "format", "aux.ui-draft-capture-lease.v1") &&
      Text(*value, "requestId", frame.request_id) && value->FindBool("retained") == false &&
      value->FindBool("restored") == true &&
      ((value->FindBool("released") == true && Text(*value, "leaseId", frame.lease_id)) ||
       (value->FindBool("noLeaseCreated") == true && Text(*value, "attemptState", "not-started")));
  if (restored) frame.prepared = false;
  frame.cleanup_unknown = !restored;
  Finish(error.empty() ? "Renderer closure remains refused or uncertain" : std::move(error));
}
void Controller::BeginWorker() {
  if (!Inventory(false)) { Finish("Actual native inventory changed before worker pause"); return; }
  worker_attempted_ = true;
  BeginUiStorageMigrationWorker(profile_.get(), mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::WorkerPrepared, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::WorkerControlLost, weak_.GetWeakPtr(), false)));
}
bool Controller::WorkerCorrelation(const base::DictValue& value, bool allow_bind) {
  const auto* request = value.FindString("prepareRequestId");
  if (!request && allow_bind) request = value.FindString("requestId");
  if (!request || !CanonicalUuid(*request)) return false;
  if (worker_request_id_.empty() && allow_bind) worker_request_id_ = *request;
  return *request == worker_request_id_;
}
void Controller::WorkerPrepared(base::DictValue value) {
  if (value.FindBool("transportSuperseded") == true) return;
  const bool correlated = WorkerCorrelation(value, true);
  if (!profile_ || !IsUiStorageMigrationWorkerPending(profile_.get())) {
    worker_attempted_ = false;
    Finish("The actual worker could not establish its source hold"); return;
  }
  if (!correlated || !Inventory(false) || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("The actual worker source hold remains refused or uncertain"); return;
  }
  if (const auto* report = value.FindString("reportJson")) worker_report_json_ = *report;
  BeginFrontend();
}
void Controller::WorkerControlLost(bool cleanup) {
  cleanup_unknown_ = true;
  if (cleanup) { error_ = "An actual worker cleanup control remains unconfirmed"; ReplyResult(); }
  else Finish("An actual native worker control callback remains unconfirmed");
}
void Controller::BeginFrontend() {
  if (!Inventory(false) || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Original worker/frame owners changed before frontend closure"); return;
  }
  auto* frontend = Frontend::Get(profile_.get());
  if (!frontend) { Finish("Actual extension frontend unavailable"); return; }
  // Every actual frame has flushed BEFORE this native admission gate closes.
  frontend_request_id_ = base::UnguessableToken::Create();
  frontend_begin_pending_ = true;
  frontend->BeginAuxUiMigrationLease(extension_, frontend_request_id_, mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::FrontendPrepared, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::FrontendLost, weak_.GetWeakPtr(), true)));
}
void Controller::FrontendPrepared(Frontend::AuxUiMigrationLeaseResult result) {
  frontend_begin_pending_ = false;
  if (!result.has_value()) { Finish("The actual frontend source gate refused"); return; }
  extension_lease_ = std::move(result.value());
  if (!Inventory(false) || !HasValidUiStorageMigrationWorkerLease(profile_.get()) || !FrontendCurrent()) {
    Finish("The original actual frontend/worker owner changed"); return;
  }
  for (size_t partition = 0; partition < partitions_.size(); ++partition) {
    for (const bool local : {true, false}) {
      DomHold hold; hold.partition = partition; hold.local = local;
      hold.request = base::UnguessableToken::Create();
      dom_holds_.push_back(std::move(hold));
    }
  }
  dom_cursor_ = 0; BeginDomNext();
}
void Controller::FrontendLost(bool begin) {
  if (begin) { frontend_begin_pending_ = false; frontend_begin_unknown_ = true; }
  else { frontend_io_pending_ = false; frontend_io_unknown_ = true; }
  cleanup_unknown_ = true;
  Finish("An actual frontend callback was lost; gate state remains unknown");
}
bool Controller::FrontendCurrent() const {
  auto* frontend = profile_ ? Frontend::Get(profile_.get()) : nullptr;
  return frontend && extension_lease_ && !frontend_begin_pending_ && !frontend_io_pending_ &&
      !frontend_begin_unknown_ && frontend->ValidateAuxUiMigrationLease(*extension_lease_);
}

std::optional<content::DOMStorageContext::AuxUiMigrationControls>
Controller::DomControls(size_t index) const {
  if (!profile_ || index >= dom_holds_.size()) return std::nullopt;
  const auto& hold = dom_holds_[index];
  if (hold.partition >= partitions_.size()) return std::nullopt;
  auto* context = partitions_[hold.partition]->GetDOMStorageContext();
  if (!context) return std::nullopt;
  auto controls = context->GetExistingAuxUiMigrationControls();
  if (!controls || !controls->local || !controls->session || !controls->generation ||
      (hold.generation && hold.generation != controls->generation)) return std::nullopt;
  return controls;
}
bool Controller::DomCurrent() const {
  if (!Current() || dom_holds_.size() != partitions_.size() * 2 || dom_holds_.empty()) return false;
  for (size_t i = 0; i < dom_holds_.size(); ++i) {
    const auto& hold = dom_holds_[i];
    if (!hold.attempted || hold.pending || hold.unknown || hold.released || !hold.token ||
        !hold.source || !DomControls(i)) return false;
  }
  return true;
}
bool Controller::AcceptDom(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr value) {
  if (index >= dom_holds_.size() || !DomControls(index)) return false;
  auto& hold = dom_holds_[index];
  if (!value || value->request_id != hold.request || !value->held || value->released || value->aborted ||
      !value->token || value->token->is_empty() || (hold.token && hold.token != value->token)) return false;
  // Binding an exact original held token permits cleanup even when subsequent
  // source/cache facts refuse. It does not turn those facts into readiness.
  hold.token = value->token;
  if (!value->ok || !value->error.empty() || !value->source_ready || !value->private_target_staged ||
      !value->matches_source || !value->file_data_synced || value->ordinary_work_queued ||
      value->target_attempted || value->cache_published || value->maps.size() > 4096 ||
      value->source_topology_sha256.size() != 64) return false;
  bool pending_allocation = false, requested_allocation = false;
  std::set<uint32_t> ordinals;
  for (const auto& map : value->maps) {
    if (!map || !ordinals.insert(map->map_ordinal).second || map->source_map_sha256.size() != 64 ||
        map->source_entries.size() > 4096 || map->cache_views.size() > 256) return false;
    if (map->allocation_requested) {
      requested_allocation = true;
      if (!hold.local || map->source_persisted || map->map_id || map->allocation_action_sha256.size() != 64 ||
          map->allocation_observed != map->allocated_map_id.has_value()) return false;
      if (!map->allocation_observed) {
        pending_allocation = true;
        if (!map->target_map_sha256.empty()) return false;
      } else if (*map->allocated_map_id < 0 || map->target_map_sha256.size() != 64) return false;
    } else if (!map->allocation_action_sha256.empty() || map->allocated_map_id || map->allocation_observed ||
        map->target_map_sha256.size() != 64) return false;
  }
  if ((requested_allocation ? value->allocation_action_sha256.size() != 64 : !value->allocation_action_sha256.empty()) ||
      (pending_allocation ? !value->target_topology_sha256.empty() : value->target_topology_sha256.size() != 64)) return false;
  if (hold.source && !SameDomSource(*hold.source, *value)) return false;
  if (hold.stage_attempted) {
    if (hold.targets.size() != value->maps.size()) return false;
    for (const auto& map : value->maps) {
      const auto plan = std::ranges::find_if(hold.targets,
          [&](const auto& target) { return target->map_ordinal == map->map_ordinal; });
      if (plan == hold.targets.end() || (*plan)->desired_selected_entries != map->target_entries ||
          !PrivateDraftTargetsMatch(*map, hold.local)) return false;
    }
  } else if (hold.source && (hold.source->maps != value->maps ||
      hold.source->target_topology_sha256 != value->target_topology_sha256)) return false;
  if (hold.staged && hold.source && (hold.source->maps != value->maps ||
      hold.source->target_topology_sha256 != value->target_topology_sha256)) return false;
  hold.source = std::move(value); hold.unknown = false;
  return true;
}
bool Controller::PairDomSources() const {
  if (!DomCurrent()) return false;
  std::vector<std::array<bool, 2>> covered(frames_.size(), {false, false});
  size_t units = 0, views = 0;
  for (const auto& hold : dom_holds_) {
    for (const auto& map : hold.source->maps) {
      for (const auto& view : map->cache_views) {
        if (!view || !view->cache || ++views > 1024) return false;
        const auto& cache = *view->cache;
        if (!cache.ok || !cache.held || cache.tainted || cache.published || !cache.error.empty() ||
            cache.sources.empty() || cache.sources.size() > 256 || cache.source_entries.size() > 4096 ||
            (hold.local && !view->namespace_id.empty()) ||
            (!hold.local && !std::ranges::contains(map->session_ids, view->namespace_id))) return false;
        std::map<std::u16string, std::u16string> selected;
        for (const auto& entry : cache.source_entries) {
          if (!entry || entry->key.size() > 4194304 || entry->value.size() > 4194304 ||
              units > 4194304 - entry->key.size() ||
              units + entry->key.size() > 4194304 - entry->value.size()) return false;
          units += entry->key.size() + entry->value.size();
          std::u16string key(entry->key.begin(), entry->key.end());
          if (!WireKey(key, hold.local)) continue;
          if (!selected.emplace(std::move(key), std::u16string(entry->value.begin(), entry->value.end())).second) return false;
        }
        std::set<base::Token> source_ids;
        for (const auto& source : cache.sources) {
          if (!source || !source_ids.insert(source->source_id).second) return false;
          size_t matches = 0;
          for (size_t i = 0; i < frames_.size(); ++i) {
            const auto& frame = *frames_[i];
            auto* actual = frame.document.AsRenderFrameHostIfValid();
            if (source->frame != frame.native_frame_token || source->document != frame.native_document_token) continue;
            if (!DocumentCurrent(frame) || !frame.sealed || !frame.source_stores || !actual ||
                actual->GetStoragePartition() != partitions_[hold.partition] ||
                map->storage_key != actual->GetStorageKey() ||
                (!hold.local && view->namespace_id != frame.namespace_id) ||
                selected != (hold.local ? frame.source_stores->local : frame.source_stores->session)) return false;
            covered[i][hold.local ? 0 : 1] = true; ++matches;
          }
          // No arbitrary renderer token can choose a document/root. Every
          // observer source must join exactly one already held actual document.
          if (matches != 1) return false;
        }
      }
    }
  }
  return std::ranges::all_of(covered, [](const auto& row) { return row[0] && row[1]; });
}
bool Controller::BuildDomTargets() {
  if (!DomCurrent() || !PairDomSources() || !Inventory(false)) return false;
  size_t count = 0, units = 0;
  for (auto& hold : dom_holds_) {
    hold.targets.clear();
    for (const auto& map : hold.source->maps) {
      std::map<std::vector<uint8_t>, std::vector<uint8_t>> raw;
      std::map<std::u16string, std::vector<uint8_t>> logical;
      for (const auto& entry : map->target_entries) {
        if (!entry || ++count > 8192) return false;
        auto key = TargetLogicalKey(entry->key, hold.local);
        if (!key || !logical.emplace(*key, entry->key).second || !raw.emplace(entry->key, entry->value).second) return false;
      }
      std::map<std::u16string, std::pair<bool, std::u16string>> changes;
      for (const auto& view : map->cache_views) {
        for (const auto& source : view->cache->sources) {
          for (const auto& frame : frames_) {
            if (source->frame != frame->native_frame_token || source->document != frame->native_document_token) continue;
            for (const auto& mutation : frame->source_stores->mutations) {
              if (mutation.local != hold.local) continue;
              if (mutation.key.size() > 8192 || mutation.value.size() > 4194304 ||
                  units > 4194304 - mutation.key.size() ||
                  units + mutation.key.size() > 4194304 - mutation.value.size()) return false;
              units += mutation.key.size() + mutation.value.size();
              const auto desired = std::pair(mutation.remove, mutation.value);
              auto [at, inserted] = changes.emplace(mutation.key, desired);
              // Multiple actual views may report one shared Local intent; only
              // identical operations/units can coalesce. No winner is guessed.
              if (!inserted && at->second != desired) return false;
            }
          }
        }
      }
      for (const auto& [key, desired] : changes) {
        if (!WireKey(key, hold.local)) return false;
        const auto existing = logical.find(key);
        if (desired.first) {
          if (existing != logical.end()) raw.erase(existing->second);
        } else {
          const auto encoded_key = existing == logical.end() ? CurrentTargetKey(key, hold.local) : existing->second;
          raw[encoded_key] = CurrentTargetValue(desired.second, hold.local);
        }
      }
      auto plan = storage::mojom::AuxUiDomTargetMap::New(); plan->map_ordinal = map->map_ordinal;
      for (auto& [key, value] : raw)
        plan->desired_selected_entries.push_back(blink::mojom::KeyValue::New(key, std::move(value)));
      hold.targets.push_back(std::move(plan));
    }
  }
  return true;
}
void Controller::StageDomNext() {
  if (!DomCurrent() || !Inventory(false) || !FrontendCurrent() ||
      !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Actual source holds changed before private target staging"); return;
  }
  if (dom_cursor_ == dom_holds_.size()) { cursor_ = 0; ValidateNext(); return; }
  const size_t index = dom_cursor_++; auto& hold = dom_holds_[index];
  auto controls = DomControls(index);
  std::vector<storage::mojom::AuxUiDomTargetMapPtr> targets;
  for (const auto& target : hold.targets) targets.push_back(target->Clone());
  hold.stage_attempted = true; hold.pending = true;
  auto callback = mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::StagedDom, weak_.GetWeakPtr(), index),
      base::BindOnce(&Controller::DomLost, weak_.GetWeakPtr(), index));
  if (hold.local) controls->local->StageAuxUiPreferenceTargets(hold.request, *hold.token, std::move(targets), std::move(callback));
  else controls->session->StageAuxUiPreferenceTargets(hold.request, *hold.token, std::move(targets), std::move(callback));
}
void Controller::StagedDom(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr value) {
  dom_holds_[index].pending = false;
  if (!AcceptDom(index, std::move(value))) {
    dom_holds_[index].unknown = true; Finish("Exact private native target staging refused"); return;
  }
  dom_holds_[index].staged = true; StageDomNext();
}
bool Controller::LiveOwners(bool restoration) {
  if (!Current() || !profile_ || !extension_lease_ || !Frontend::Get(profile_.get()) ||
      !Inventory(false) || dom_holds_.empty() || dom_holds_.size() > 8 ||
      !transfer_ || !transfer_->complete || !intent_ || !intent_->complete ||
      peer::InspectNativeBrowserShutdown().admitted_generation != transfer_->generation) return false;
  if (!restoration && (!FrontendCurrent() || !HasValidUiStorageMigrationWorkerLease(profile_.get()))) return false;
  for (size_t i = 0; i < dom_holds_.size(); ++i) {
    const auto& hold = dom_holds_[i];
    if (!hold.token || !hold.source || !hold.staged || hold.released || hold.pending || !DomControls(i)) return false;
  }
  return true;
}
bool Controller::AcceptLiveDom(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr value) {
  if (index >= dom_holds_.size() || !DomControls(index)) return false;
  auto& hold = dom_holds_[index];
  if (!value || !hold.source || value->request_id != hold.request || value->token != hold.token ||
      !value->held || value->released || value->aborted || !value->file_data_synced ||
      !value->error.empty() || !SameDomSource(*hold.source, *value) ||
      value->allocation_action_sha256 != hold.source->allocation_action_sha256 ||
      value->maps.size() != hold.targets.size() ||
      (!value->matches_source && !value->matches_target && !value->known_source_target_mixture) ||
      (value->known_source_target_mixture && (value->matches_source || value->matches_target))) return false;
  if (value->ordinary_work_queued) live_failure_ = "An ordinary native writer attempted work during target custody";
  bool pending_allocation = false;
  for (size_t i = 0; i < value->maps.size(); ++i) {
    const auto& map = value->maps[i]; const auto& prior = hold.source->maps[i];
    if (!map || !prior || map->allocation_requested != prior->allocation_requested ||
        map->allocation_action_sha256 != prior->allocation_action_sha256 ||
        map->target_metadata_is_explicit != prior->target_metadata_is_explicit ||
        map->target_last_accessed_us != prior->target_last_accessed_us ||
        map->target_last_modified_us != prior->target_last_modified_us ||
        map->target_total_size_bytes != prior->target_total_size_bytes) return false;
    const auto target = std::ranges::find_if(hold.targets,
        [&](const auto& candidate) { return candidate->map_ordinal == map->map_ordinal; });
    if (target == hold.targets.end() || (*target)->desired_selected_entries != map->target_entries) return false;
    if (map->allocation_requested) {
      if (!hold.local || map->source_persisted || map->map_id || map->allocation_action_sha256.size() != 64 ||
          map->allocation_observed != map->allocated_map_id.has_value() ||
          (prior->allocated_map_id && prior->allocated_map_id != map->allocated_map_id)) return false;
      if (!map->allocation_observed) {
        pending_allocation = true;
        if (!map->target_map_sha256.empty() || map->allocated_map_id || value->matches_target) return false;
      } else if (*map->allocated_map_id < 0 || map->target_map_sha256.size() != 64 ||
          (!prior->target_map_sha256.empty() && prior->target_map_sha256 != map->target_map_sha256)) return false;
    } else if (map->allocated_map_id || map->allocation_observed ||
        map->target_map_sha256 != prior->target_map_sha256) return false;
    if (value->matches_target && !PrivateDraftTargetsMatch(*map, hold.local, value->cache_published)) return false;
  }
  if (pending_allocation ? !value->target_topology_sha256.empty() : value->target_topology_sha256.size() != 64) return false;
  if (!hold.source->target_topology_sha256.empty() &&
      hold.source->target_topology_sha256 != value->target_topology_sha256) return false;
  if (value->cache_published && !hold.publish_attempted) return false;
  if (!live_rollback_ && hold.published && !value->cache_published) return false;
  const bool restored_source = live_rollback_ && value->matches_source && value->file_data_synced &&
      !value->cache_published && !value->known_source_target_mixture &&
      std::ranges::all_of(value->maps, [](const auto& map) {
        return std::ranges::all_of(map->cache_views, [](const auto& view) {
          return view && view->cache && !view->cache->published && view->cache->error.empty() &&
              view->cache->staged_entries == view->cache->source_entries;
        });
      });
  // Forward source_ready includes no queued ordinary work. Exact source abort
  // may safely replay those ORIGINAL callbacks only after real restore/cache
  // rounds, complete original map CAS+sync and the source observation above.
  // Source and target can coincide, so both forward-only tests need this guard.
  if (!restored_source && value->matches_target && (!value->source_ready || !value->private_target_staged)) return false;
  if (!restored_source && value->matches_source && !value->source_ready) return false;
  hold.target_seen = value->matches_target; hold.source_seen = value->matches_source;
  hold.mixed_seen = value->known_source_target_mixture; hold.published = value->cache_published;
  hold.unknown = false; hold.source = std::move(value);
  if (hold.mixed_seen) live_failure_ = "Known native source/target mixture requires exact original restoration";
  return true;
}
bool Controller::LiveStores(size_t index, const base::DictValue& value) const {
  if (index >= frames_.size()) return false;
  const auto& frame = *frames_[index];
  const auto* units = value.FindDict("storeUnits");
  auto actual = units ? ReadWireStores(*units, extension_->origin().Serialize()) : std::nullopt;
  if (!actual || !actual->mutations.empty() || !Text(value, "format", "aux.ui-draft-capture-lease.v1") ||
      value.FindBool("ok") != true || value.FindBool("sealed") != true ||
      !Text(value, "requestId", frame.request_id) || !Text(value, "leaseId", frame.lease_id) ||
      value.FindDouble("revision") != frame.revision) return false;
  std::optional<std::map<std::u16string, std::u16string>> local, session;
  for (const auto& hold : dom_holds_) for (const auto& map : hold.source->maps)
    for (const auto& view : map->cache_views) {
      if (!view || !view->cache) return false;
      const bool belongs = std::ranges::any_of(view->cache->sources, [&](const auto& source) {
        return source && source->frame == frame.native_frame_token && source->document == frame.native_document_token;
      });
      if (!belongs) continue;
      std::map<std::u16string, std::u16string> expected;
      const auto& entries = hold.published ? view->cache->staged_entries : view->cache->source_entries;
      for (const auto& entry : entries) {
        if (!entry || entry->key.size() > 8192 || entry->value.size() > 4194304) return false;
        std::u16string key(entry->key.begin(), entry->key.end());
        if (WireKey(key, hold.local) && !expected.emplace(std::move(key),
            std::u16string(entry->value.begin(), entry->value.end())).second) return false;
      }
      auto& target = hold.local ? local : session;
      if (target && *target != expected) return false;
      target = std::move(expected);
    }
  return local && session && actual->local == *local && actual->session == *session;
}
base::DictValue Controller::LiveFacts() const {
  base::DictValue fact;
  fact.Set("format", "aux.ui-storage.native-transaction-observation.v1");
  fact.Set("qualified", false); fact.Set("activationAuthorized", false);
  fact.Set("intentSha256", base::HexEncodeLower(intent_->digest));
  fact.Set("domainOrdinal", live_observation_domain_);
  fact.Set("restoration", live_rollback_); fact.Set("extensionTarget", live_extension_target_);
  fact.Set("extensionSynced", live_extension_synced_);
  base::ListValue domains;
  for (const auto& hold : dom_holds_) {
    base::DictValue domain; domain.Set("partitionOrdinal", static_cast<int>(hold.partition));
    domain.Set("storage", hold.local ? "local-storage" : "session-storage");
    domain.Set("requestId", hold.request.ToString()); domain.Set("serviceToken", hold.token->ToString());
    domain.Set("sourceTopologySha256", hold.source->source_topology_sha256);
    domain.Set("targetTopologySha256", hold.source->target_topology_sha256);
    domain.Set("allocationActionSha256", hold.source->allocation_action_sha256);
    domain.Set("matchesSource", hold.source_seen); domain.Set("matchesTarget", hold.target_seen);
    domain.Set("knownMixture", hold.mixed_seen); domain.Set("cachePublished", hold.published);
    domain.Set("fileDataSynced", hold.source->file_data_synced);
    base::ListValue maps;
    for (const auto& map : hold.source->maps) {
      base::DictValue row; row.Set("ordinal", static_cast<int>(map->map_ordinal));
      row.Set("storageKey", map->storage_key.Serialize()); row.Set("sourceMapSha256", map->source_map_sha256);
      row.Set("targetMapSha256", map->target_map_sha256); row.Set("allocationActionSha256", map->allocation_action_sha256);
      row.Set("allocationObserved", map->allocation_observed);
      row.Set("allocatedMapId", map->allocated_map_id ? base::Value(base::NumberToString(*map->allocated_map_id)) : base::Value());
      maps.Append(std::move(row));
    }
    domain.Set("maps", std::move(maps)); domains.Append(std::move(domain));
  }
  fact.Set("domains", std::move(domains));
  base::ListValue pages;
  for (const auto& frame : frames_) {
    base::DictValue page; page.Set("nativeDocumentId", frame->document_id.ToString());
    page.Set("nativeLocalFrameToken", frame->native_frame_token->ToString());
    page.Set("nativeBlinkDocumentToken", frame->native_document_token->ToString());
    page.Set("currentStoreUnitsSha256", frame->target_observation_sha);
    pages.Append(std::move(page));
  }
  fact.Set("rendererCurrentStores", std::move(pages));
  fact.Set("terminalAllTargetObserved", live_terminal_written_);
  return fact;
}
bool Controller::CompletionCurrent() {
  if (!live_active_ || !live_target_complete_ || live_source_complete_ || live_rollback_ ||
      live_pending_ || live_record_ || !live_terminal_written_ || live_records_.empty() ||
      !terminal_ordinal_ || live_records_.back()->ordinal != terminal_ordinal_ ||
      !live_records_.back()->complete || live_records_.back()->kind != 8 ||
      !LiveOwners(false) || !live_extension_target_ || !live_extension_synced_) return false;
  return std::ranges::all_of(dom_holds_, [](const auto& hold) {
    return hold.target_seen && !hold.mixed_seen && hold.published && !hold.pending && !hold.unknown &&
        hold.source->file_data_synced && hold.source->source_ready &&
        !hold.source->ordinary_work_queued && hold.source->target_topology_sha256.size() == 64 &&
        std::ranges::all_of(hold.source->maps, [](const auto& map) {
          return map->target_map_sha256.size() == 64 && (!map->allocation_requested || map->allocation_observed);
        });
  });
}
std::string Controller::CompletionFingerprint() const {
  if (!transfer_ || !intent_ || live_records_.empty()) return {};
  const auto& terminal = *live_records_.back();
  std::string bytes("aux.ui-storage.terminal-fact.v1"); bytes.push_back('\0');
  bytes.append(transfer_->journal); bytes.append(base::NumberToString(terminal.ordinal)); bytes.push_back('\0');
  bytes.append(base::HexEncodeLower(transfer_->digest)); bytes.append(base::HexEncodeLower(intent_->digest));
  bytes.append(base::HexEncodeLower(terminal.digest)); bytes.append(base::HexEncodeLower(terminal.receipt_digest));
  bytes.append(base::NumberToString(transfer_->generation)); bytes.push_back('\0');
  bytes.append(profile_id_); bytes.push_back('\0'); bytes.append(binding_); bytes.push_back('\0'); bytes.append(restoration_);
  return base::HexEncodeLower(Digest(bytes));
}
std::unique_ptr<UiStorageMigrationCompletion> Controller::TakeCompletion() {
  if (completion_taken_ || !CompletionCurrent()) return nullptr;
  const auto& terminal = *live_records_.back();
  const auto journal = UuidBytes(terminal.journal);
  if (journal.size() != 16) return nullptr;
  std::vector<uint8_t> frame{10}; frame.insert(frame.end(), journal.begin(), journal.end());
  Integer(frame, terminal.ordinal, 4);
  std::vector<uint8_t> expected{10}; Integer(expected, terminal.payload.size(), 4); expected.push_back(terminal.kind);
  expected.insert(expected.end(), terminal.receipt_digest.begin(), terminal.receipt_digest.end());
  Integer(expected, terminal.receipt.size(), 4); expected.insert(expected.end(), terminal.receipt.begin(), terminal.receipt.end());
  const auto fingerprint = CompletionFingerprint();
  if (fingerprint.size() != 64 || expected.size() > 8192) return nullptr;
  completion_taken_ = true;
  auto current = base::BindRepeating([](base::WeakPtr<Controller> owner, std::string expected_fingerprint) {
    return owner && owner->CompletionCurrent() && owner->CompletionFingerprint() == expected_fingerprint;
  }, weak_.GetWeakPtr(), fingerprint);
  return std::unique_ptr<UiStorageMigrationCompletion>(new UiStorageMigrationCompletion(
      transfer_->generation, fingerprint, std::move(frame), std::move(expected), std::move(current)));
}
bool Controller::AcknowledgeCompletion(UiStorageMigrationOwnerAck acknowledgement) {
  if (!completion_taken_ || completion_ack_ || !CompletionCurrent() ||
      !acknowledgement.Matches(transfer_->generation, CompletionFingerprint())) return false;
  completion_ack_.emplace(std::move(acknowledgement));
  busy_ = true;
  // The typed owner ACK is not enough by itself. Repeat actual worker, editor,
  // frontend, DOM/cache and current-store checks before opening any gate.
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&Controller::RunLive, weak_.GetWeakPtr()));
  return true;
}

void Controller::StartLive() {
  if (!intent_ || !intent_->complete || intent_->payload.size() > 32 * 1024 * 1024 || dom_holds_.size() > 8 ||
      std::ranges::any_of(dom_holds_, [](const auto& hold) { return hold.source->maps.size() > 256; })) {
    Finish("Native transaction exceeds bounded journal/recovery reserve"); return;
  }
  live_active_ = true; live_action_ = LiveAction::kExtensionAttempt;
  live_record_bytes_ = intent_->payload.size(); live_domain_ = 0;
  for (auto& hold : dom_holds_) { hold.source_seen = true; hold.target_seen = false; }
  size_t maps = 0; for (const auto& hold : dom_holds_) maps += hold.source->maps.size();
  auto size_probe = base::WriteJson(LiveFacts());
  if (!size_probe || size_probe->size() + (maps + frames_.size() + dom_holds_.size()) * 128 + 4096 > 512 * 1024) {
    live_active_ = false; Finish("Native observation exceeds pre-target recovery record reserve"); return;
  }
  RunLive();
}
void Controller::RunLive() {
  if (!live_active_ || live_pending_) { HoldLive("Actual native transaction operation remains pending"); return; }
  if (!LiveOwners(live_rollback_)) {
    if (live_persistent_attempted_ && !live_rollback_ && Current() && Inventory(false)) {
      RollbackLive("Original forward writer qualification changed"); return;
    }
    HoldLive("Original native transaction owners remain unavailable"); return;
  }
  // After an actual mutation, first observe that SAME token. Never replay Commit
  // just because its callback was lost or rejected.
  if (live_action_ == LiveAction::kExtensionRead || live_action_ == LiveAction::kRestoreExtensionRead ||
      live_action_ == LiveAction::kDomRead || live_action_ == LiveAction::kRestoreDomRead ||
      live_action_ == LiveAction::kPublishRead) { ActLive(); return; }
  ValidateLive();
}
void Controller::ValidateLive() {
  live_pending_ = true;
  ReadUiStorageMigrationWorker(profile_.get(), mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::LiveWorker, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr())));
}
void Controller::LiveWorker(base::DictValue value) {
  if (value.FindBool("transportSuperseded") == true) return;
  live_pending_ = false;
  if (!WorkerCorrelation(value, false) || !LiveOwners(live_rollback_) ||
      (!live_rollback_ && !HasValidUiStorageMigrationWorkerLease(profile_.get()))) {
    HoldLive("Actual retained worker identity/source pause could not be observed"); return;
  }
  live_cursor_ = 0; LiveFrameNext();
}
void Controller::LiveFrameNext() {
  if (!LiveOwners(live_rollback_)) { HoldLive("Actual native document cohort changed"); return; }
  if (live_cursor_ == frames_.size()) {
    live_pending_ = true;
    Frontend::Get(profile_.get())->ReadbackAuxUiMigrationLease(*extension_lease_, mojo::WrapCallbackWithDropHandler(
        base::BindOnce(&Controller::LiveFrontend, weak_.GetWeakPtr()),
        base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()))); return;
  }
  const size_t index = live_cursor_++; live_pending_ = true;
  Invoke(index, "auxObserveDraftMigrationTarget", base::ListValue().Append(frames_[index]->lease_id)
      .Append(frames_[index]->revision).Append("utf16-v1"),
      base::BindOnce(&Controller::LiveFrame, weak_.GetWeakPtr(), index));
}
void Controller::LiveFrame(size_t index, std::optional<base::DictValue> value, std::string) {
  live_pending_ = false;
  if (!value || !LiveStores(index, *value)) { HoldLive("Actual editor hold/current UTF16 store observation changed"); return; }
  const auto* units = value->FindDict("storeUnits");
  auto raw_units = units ? base::WriteJson(*units) : std::nullopt;
  if (!raw_units) { HoldLive("Current renderer units could not be fingerprinted"); return; }
  frames_[index]->target_observation_sha = base::HexEncodeLower(Digest(*raw_units));
  LiveFrameNext();
}
void Controller::LiveFrontend(Frontend::AuxUiMigrationReadbackResult result) {
  live_pending_ = false;
  if (!result.has_value() || !LiveOwners(true) || !result->readback_file_data_synced ||
      (!result->matches_source && !result->matches_target) ||
      result->records != (result->matches_target ? extension_lease_->CopyTargetRecords() : extension_lease_->CopySourceRecords())) {
    HoldLive("Actual same-token extension readback remains unknown"); return;
  }
  live_extension_synced_ = true; live_extension_target_ = result->matches_target;
  if (result->ordinary_work_queued) live_failure_ = "An ordinary extension writer attempted work during custody";
  if (!live_failure_.empty() && !live_rollback_ && !live_record_) { RollbackLive(live_failure_); return; }
  live_cursor_ = 0; LiveDomNext();
}
void Controller::LiveDomNext() {
  if (!LiveOwners(live_rollback_)) { HoldLive("Actual native DOM transaction ownership changed"); return; }
  if (live_cursor_ == dom_holds_.size()) {
    if (!live_failure_.empty() && !live_rollback_ && !live_record_) { RollbackLive(live_failure_); return; }
    ActLive(); return;
  }
  const size_t index = live_cursor_++; auto& hold = dom_holds_[index];
  auto controls = DomControls(index); live_pending_ = true; hold.pending = true;
  auto callback = mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::LiveDomValidated, weak_.GetWeakPtr(), index),
      base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()));
  if (hold.local) controls->local->ValidateAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
  else controls->session->ValidateAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
}
void Controller::LiveDomValidated(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr value) {
  live_pending_ = false; dom_holds_[index].pending = false;
  if (!AcceptLiveDom(index, std::move(value))) { HoldLive("Actual native source/target readback refused"); return; }
  LiveDomNext();
}
void Controller::RecordLive(uint8_t kind, LiveAction next) {
  if (live_record_ || live_records_.size() >= 62) { HoldLive("Original transaction record custody must settle"); return; }
  auto fact = LiveFacts(); fact.Set("recordKind", static_cast<int>(kind));
  auto encoded = base::WriteJson(fact);
  if (!encoded || encoded->empty() || encoded->size() > 512 * 1024 ||
      live_record_bytes_ > kCaptureLimit - encoded->size()) {
    HoldLive("Native immutable observation exceeds reserved recovery journal bound"); return;
  }
  live_record_ = std::make_unique<IntentRecord>(); live_record_->payload = std::move(*encoded);
  live_record_->digest = Digest(live_record_->payload); live_record_->journal = transfer_->journal;
  live_record_->upload = base::Uuid::GenerateRandomV4().AsLowercaseString();
  live_record_->ordinal = live_records_.size() + 1; live_record_->kind = kind;
  live_record_->intent_digest = intent_->digest;
  live_record_->previous_digest = live_records_.empty() ? intent_->receipt_digest : live_records_.back()->receipt_digest;
  live_after_record_ = next; StepLiveRecord();
}
void Controller::StepLiveRecord() {
  if (!live_record_ || !LiveOwners(live_rollback_)) { HoldLive("Original immutable transaction record owner changed"); return; }
  TransferIntentRecord(*live_record_);
  if (!live_record_->error.empty()) { HoldLive(live_record_->error); return; }
  if (live_record_->complete) {
    live_record_bytes_ += live_record_->payload.size(); live_records_.push_back(std::move(live_record_));
    live_action_ = live_after_record_;
  }
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&Controller::RunLive, weak_.GetWeakPtr()));
}
void Controller::ActLive() {
  if (live_record_) { StepLiveRecord(); return; }
  if (!LiveOwners(live_rollback_)) { HoldLive("Actual native transaction custody changed"); return; }
  if (!live_failure_.empty() && !live_rollback_) { RollbackLive(live_failure_); return; }
  const auto schedule = [this] {
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
        base::BindOnce(&Controller::RunLive, weak_.GetWeakPtr()));
  };
  switch (live_action_) {
    case LiveAction::kExtensionAttempt:
      live_observation_domain_ = -1; RecordLive(2, LiveAction::kExtensionCommit); return;
    case LiveAction::kExtensionCommit: {
      if (live_extension_attempted_) { HoldLive("Original extension Commit cannot replay"); return; }
      live_extension_attempted_ = true; live_persistent_attempted_ = true;
      live_action_ = LiveAction::kExtensionRead; live_pending_ = true;
      Frontend::Get(profile_.get())->CommitAuxUiMigrationLease(*extension_lease_, mojo::WrapCallbackWithDropHandler(
          base::BindOnce(&Controller::LiveExtensionStatus, weak_.GetWeakPtr()),
          base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()))); return;
    }
    case LiveAction::kExtensionRead:
    case LiveAction::kRestoreExtensionRead:
      live_pending_ = true;
      Frontend::Get(profile_.get())->ReadbackAuxUiMigrationLease(*extension_lease_, mojo::WrapCallbackWithDropHandler(
          base::BindOnce(&Controller::LiveExtensionRead, weak_.GetWeakPtr()),
          base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()))); return;
    case LiveAction::kDomAttempt:
      if (live_domain_ == dom_holds_.size()) { live_action_ = LiveAction::kBackendsObserved; schedule(); return; }
      if (!live_extension_target_ || !live_extension_synced_ ||
          std::ranges::any_of(base::span(dom_holds_).first(live_domain_), [](const auto& hold) { return !hold.target_seen; })) {
        RollbackLive("Earlier backend target observation changed"); return;
      }
      live_observation_domain_ = static_cast<int>(live_domain_); RecordLive(2, LiveAction::kDomCommit); return;
    case LiveAction::kDomCommit: {
      auto& hold = dom_holds_[live_domain_]; auto controls = DomControls(live_domain_);
      if (hold.commit_attempted) { HoldLive("Original DOM Commit cannot replay"); return; }
      hold.commit_attempted = true; live_persistent_attempted_ = true;
      live_action_ = LiveAction::kDomRead; hold.pending = true; live_pending_ = true;
      auto callback = mojo::WrapCallbackWithDropHandler(
          base::BindOnce(&Controller::LiveDomStatus, weak_.GetWeakPtr(), live_domain_),
          base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()));
      if (hold.local) controls->local->CommitAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
      else controls->session->CommitAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback)); return;
    }
    case LiveAction::kDomRead:
    case LiveAction::kRestoreDomRead:
    case LiveAction::kPublishRead: {
      const size_t index = live_action_ == LiveAction::kRestoreDomRead ? live_domain_ - 1 : live_domain_;
      auto& hold = dom_holds_[index]; auto controls = DomControls(index);
      hold.pending = true; live_pending_ = true;
      auto callback = mojo::WrapCallbackWithDropHandler(
          base::BindOnce(&Controller::LiveDomRead, weak_.GetWeakPtr(), index),
          base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()));
      if (hold.local) controls->local->ReadAuxUiPreferenceLease(hold.request, std::move(callback));
      else controls->session->ReadAuxUiPreferenceLease(hold.request, std::move(callback)); return;
    }
    case LiveAction::kBackendsObserved:
      if (!live_extension_target_ || !live_extension_synced_ ||
          std::ranges::any_of(dom_holds_, [](const auto& hold) {
            return !hold.target_seen || hold.mixed_seen || !hold.source->file_data_synced ||
                hold.source->target_topology_sha256.size() != 64 ||
                std::ranges::any_of(hold.source->maps, [](const auto& map) {
                  return map->target_map_sha256.size() != 64 || (map->allocation_requested && !map->allocation_observed);
                });
          })) { RollbackLive("All actual synchronized backend targets are required before publication"); return; }
      live_observation_domain_ = -2; live_domain_ = 0; RecordLive(6, LiveAction::kPublishAttempt); return;
    case LiveAction::kPublishAttempt:
      if (live_domain_ == dom_holds_.size()) { live_action_ = LiveAction::kComplete; schedule(); return; }
      live_observation_domain_ = static_cast<int>(live_domain_); RecordLive(7, LiveAction::kPublish); return;
    case LiveAction::kPublish: {
      auto& hold = dom_holds_[live_domain_]; auto controls = DomControls(live_domain_);
      if (!hold.target_seen || hold.publish_attempted) { HoldLive("Original publication must be observed instead of replayed"); return; }
      hold.publish_attempted = true; live_action_ = LiveAction::kPublishRead;
      hold.pending = true; live_pending_ = true;
      auto callback = mojo::WrapCallbackWithDropHandler(
          base::BindOnce(&Controller::LiveDomStatus, weak_.GetWeakPtr(), live_domain_),
          base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()));
      if (hold.local) controls->local->PublishAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
      else controls->session->PublishAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback)); return;
    }
    case LiveAction::kPublishAck:
      if (!dom_holds_[live_domain_].published || !dom_holds_[live_domain_].target_seen) {
        RollbackLive("Actual native cache publication is not acknowledged"); return;
      }
      RecordLive(8, LiveAction::kPublishAttempt); if (live_record_) ++live_domain_; return;
    case LiveAction::kComplete:
      if (!live_extension_target_ || !live_extension_synced_ ||
          std::ranges::any_of(dom_holds_, [](const auto& hold) { return !hold.published || !hold.target_seen || hold.mixed_seen; })) {
        RollbackLive("Final actual target/cache observation changed"); return;
      }
      if (!live_terminal_written_) {
        live_terminal_written_ = true; live_observation_domain_ = -2;
        RecordLive(8, LiveAction::kComplete);
        if (live_record_) terminal_ordinal_ = live_record_->ordinal;
        else live_terminal_written_ = false;
        return;
      }
      if (!terminal_ordinal_ || live_records_.empty() || live_records_.back()->ordinal != terminal_ordinal_ ||
          live_records_.back()->kind != 8 || !live_records_.back()->complete) {
        HoldLive("Actual aggregate terminal record is not durable"); return;
      }
      live_target_complete_ = true;
      if (!completion_ack_) {
        if (!completion_fact_) completion_fact_ = TakeCompletion();
        if (!completion_fact_ || !completion_fact_->IsCurrent()) {
          HoldLive("Original one-shot native terminal fact is unavailable"); return;
        }
        auto acknowledgement = peer::AcceptNativeSelectedUiMigrationCompletion(*completion_fact_);
        if (!acknowledgement) {
          HoldLive("Actual selected-home terminal observation is pending; retain original fact"); return;
        }
        if (!AcknowledgeCompletion(std::move(*acknowledgement))) {
          HoldLive("Actual selected-home acknowledgement no longer matches original fact"); return;
        }
        return;
      }
      if (!completion_ack_->Matches(transfer_->generation, CompletionFingerprint()) || !CompletionCurrent()) {
        HoldLive("Original selected-home acknowledgement or final actual target facts changed"); return;
      }
      live_active_ = false; cleanup_unknown_ = false;
      Finish("Actual UI transaction terminal accepted by the selected native owner; installation selection remains separate"); return;
    case LiveAction::kRestoreDomAttempt:
      while (live_domain_ > 0 && !dom_holds_[live_domain_ - 1].commit_attempted) --live_domain_;
      if (live_domain_ == 0) { live_action_ = LiveAction::kRestoreExtensionAttempt; schedule(); return; }
      live_observation_domain_ = static_cast<int>(live_domain_ - 1); RecordLive(4, LiveAction::kRestoreDom); return;
    case LiveAction::kRestoreDom: {
      const size_t index = live_domain_ - 1; auto& hold = dom_holds_[index]; auto controls = DomControls(index);
      hold.pending = true; live_pending_ = true; live_action_ = LiveAction::kRestoreDomRead;
      auto callback = mojo::WrapCallbackWithDropHandler(
          base::BindOnce(&Controller::LiveDomStatus, weak_.GetWeakPtr(), index),
          base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()));
      if (hold.local) controls->local->RestoreAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
      else controls->session->RestoreAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback)); return;
    }
    case LiveAction::kRestoreExtensionAttempt:
      if (!live_extension_attempted_) { live_action_ = LiveAction::kRestored; schedule(); return; }
      live_observation_domain_ = -1; RecordLive(4, LiveAction::kRestoreExtension); return;
    case LiveAction::kRestoreExtension:
      live_action_ = LiveAction::kRestoreExtensionRead; live_pending_ = true;
      Frontend::Get(profile_.get())->RestoreAuxUiMigrationLease(*extension_lease_, mojo::WrapCallbackWithDropHandler(
          base::BindOnce(&Controller::LiveExtensionStatus, weak_.GetWeakPtr()),
          base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()))); return;
    case LiveAction::kRestored:
      if (live_extension_target_ && extension_lease_->CopyTargetRecords() != extension_lease_->CopySourceRecords()) {
        HoldLive("Actual original extension source is not restored"); return;
      }
      if (std::ranges::any_of(dom_holds_, [](const auto& hold) { return !hold.source_seen || hold.mixed_seen || hold.published; })) {
        HoldLive("Actual complete original DOM/cache sources are not restored"); return;
      }
      live_source_complete_ = true; live_active_ = false; cleanup_unknown_ = false;
      Finish("Exact original sources restored and read back; migration remains unqualified"); return;
  }
}
void Controller::LiveExtensionStatus(value_store::ValueStore::Status) {
  live_pending_ = false;
  // Even an error/drop may follow an actual write. Only the same-token physical
  // readback decides source/target and actual file-data sync, never callback status.
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&Controller::RunLive, weak_.GetWeakPtr()));
}
void Controller::LiveExtensionRead(Frontend::AuxUiMigrationReadbackResult result) {
  live_pending_ = false;
  if (!result.has_value() || !Current() || !Inventory(false) || !result->readback_file_data_synced ||
      (!result->matches_source && !result->matches_target) ||
      result->records != (result->matches_target ? extension_lease_->CopyTargetRecords() : extension_lease_->CopySourceRecords())) {
    HoldLive("Original extension physical outcome remains unknown"); return;
  }
  live_extension_synced_ = true; live_extension_target_ = result->matches_target;
  if (result->ordinary_work_queued) live_failure_ = "Ordinary extension work queued during migration";
  live_observation_domain_ = -1;
  if (live_action_ == LiveAction::kRestoreExtensionRead) {
    if (!result->matches_source || !result->source_file_data_synced) {
      HoldLive("Original extension source restore/readback is not acknowledged"); return;
    }
    RecordLive(5, LiveAction::kRestored); return;
  }
  if (!result->matches_target || !result->commit_file_data_synced) live_failure_ = "Extension target attempt did not yield its exact synced target";
  live_domain_ = 0; RecordLive(3, LiveAction::kDomAttempt);
}
void Controller::LiveDomStatus(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr) {
  live_pending_ = false; dom_holds_[index].pending = false;
  // Do not use a status payload as the fresh physical readback.
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&Controller::RunLive, weak_.GetWeakPtr()));
}
void Controller::LiveDomRead(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr value) {
  live_pending_ = false; dom_holds_[index].pending = false;
  if (!AcceptLiveDom(index, std::move(value))) { HoldLive("Original DOM physical outcome remains unknown"); return; }
  const auto& hold = dom_holds_[index]; live_observation_domain_ = static_cast<int>(index);
  if (live_action_ == LiveAction::kRestoreDomRead) {
    if (!hold.source_seen || hold.published || hold.mixed_seen) {
      HoldLive("Exact original DOM/cache source restoration is not acknowledged"); return;
    }
    RecordLive(5, LiveAction::kRestoreDomAttempt); if (live_record_) --live_domain_; return;
  }
  if (live_action_ == LiveAction::kPublishRead) {
    if (!hold.target_seen || !hold.published || hold.mixed_seen) {
      RollbackLive("Actual same-token cache publication/readback did not complete"); return;
    }
    live_action_ = LiveAction::kPublishAck;
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
        base::BindOnce(&Controller::RunLive, weak_.GetWeakPtr())); return;
  }
  if (!hold.target_seen || hold.mixed_seen) live_failure_ = "DOM target attempt requires exact original-source restoration";
  RecordLive(3, LiveAction::kDomAttempt); if (live_record_) ++live_domain_;
}
void Controller::LiveLost() {
  live_pending_ = false;
  for (auto& hold : dom_holds_) hold.pending = false;
  HoldLive("Actual native callback was lost; retain exact operation and observe original tokens");
}
void Controller::RollbackLive(std::string reason) {
  live_failure_ = std::move(reason);
  if (live_record_ && !live_record_->complete) { HoldLive("Immutable record must settle before restoration can be journaled"); return; }
  live_target_complete_ = false; completion_ack_.reset(); completion_fact_.reset();
  live_rollback_ = true; live_domain_ = dom_holds_.size(); live_action_ = LiveAction::kRestoreDomAttempt;
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&Controller::RunLive, weak_.GetWeakPtr()));
}
void Controller::HoldLive(std::string reason) {
  error_ = std::move(reason); cleanup_unknown_ = true;
  // No timer/absent callback/data Boolean retires a physical operation, record,
  // service lease or producer. Begin resumes this exact native controller.
  ReplyResult();
}

void Controller::BeginIntent() {
  if (!transfer_ || !transfer_->complete || !DomCurrent() || !PairDomSources() ||
      !Inventory(false) || !FrontendCurrent() ||
      !HasValidUiStorageMigrationWorkerLease(profile_.get()) ||
      !std::ranges::all_of(dom_holds_, [](const auto& hold) { return hold.staged; })) {
    Finish("Complete sealed capture and private actual targets required before immutable intent"); return;
  }
  base::DictValue intent;
  intent.Set("format", "aux.ui-storage.native-target-intent.v1");
  intent.Set("phase", "unqualified-data"); intent.Set("qualified", false);
  intent.Set("activationAuthorized", false);
  intent.Set("captureJournalId", transfer_->journal);
  intent.Set("captureSha256", base::HexEncodeLower(transfer_->digest));
  intent.Set("captureReceiptSha256", base::HexEncodeLower(Digest(transfer_->receipt)));
  intent.Set("nativeProfileId", profile_id_); intent.Set("bindingEpoch", binding_);
  intent.Set("restoreEpoch", restoration_);
  base::ListValue domains, extension_source, extension_target;
  for (const auto& hold : dom_holds_) {
    base::DictValue domain;
    domain.Set("partitionOrdinal", static_cast<int>(hold.partition));
    domain.Set("storage", hold.local ? "local-storage" : "session-storage");
    domain.Set("requestId", hold.request.ToString()); domain.Set("serviceToken", hold.token->ToString());
    domain.Set("controlGeneration", base::NumberToString(hold.generation));
    domain.Set("sourceTopologySha256", hold.source->source_topology_sha256);
    domain.Set("targetTopologySha256", hold.source->target_topology_sha256);
    domain.Set("allocationActionSha256", hold.source->allocation_action_sha256);
    base::ListValue maps;
    for (const auto& map : hold.source->maps) {
      base::DictValue fact;
      fact.Set("ordinal", static_cast<int>(map->map_ordinal));
      fact.Set("storageKey", map->storage_key.Serialize());
      fact.Set("sourceMapSha256", map->source_map_sha256); fact.Set("targetMapSha256", map->target_map_sha256);
      fact.Set("sourcePersisted", map->source_persisted);
      fact.Set("originalMapId", map->map_id ? base::Value(base::NumberToString(*map->map_id)) : base::Value());
      fact.Set("sourceLastAccessedUs", map->source_last_accessed_us ? base::Value(*map->source_last_accessed_us) : base::Value());
      fact.Set("sourceLastModifiedUs", map->source_last_modified_us ? base::Value(*map->source_last_modified_us) : base::Value());
      fact.Set("sourceTotalSizeBytes", map->source_total_size_bytes ? base::Value(*map->source_total_size_bytes) : base::Value());
      fact.Set("targetMetadataExplicit", map->target_metadata_is_explicit);
      fact.Set("targetLastAccessedUs", map->target_last_accessed_us ? base::Value(*map->target_last_accessed_us) : base::Value());
      fact.Set("targetLastModifiedUs", map->target_last_modified_us ? base::Value(*map->target_last_modified_us) : base::Value());
      fact.Set("targetTotalSizeBytes", map->target_total_size_bytes ? base::Value(*map->target_total_size_bytes) : base::Value());
      fact.Set("allocationRequested", map->allocation_requested);
      fact.Set("allocationActionSha256", map->allocation_action_sha256);
      fact.Set("allocationObserved", map->allocation_observed);
      fact.Set("allocatedMapId", map->allocated_map_id ? base::Value(base::NumberToString(*map->allocated_map_id)) : base::Value());
      base::ListValue source, target, namespaces;
      const auto records = [](const auto& entries, base::ListValue& output) {
        for (const auto& entry : entries) {
          base::DictValue raw; raw.Set("keyBase64", base::Base64Encode(entry->key));
          raw.Set("valueBase64", base::Base64Encode(entry->value)); output.Append(std::move(raw));
        }
      };
      records(map->source_entries, source); records(map->target_entries, target);
      for (const auto& ns : map->session_ids) namespaces.Append(ns);
      fact.Set("sourceSelectedRaw", std::move(source)); fact.Set("targetSelectedRaw", std::move(target));
      fact.Set("nativeNamespaces", std::move(namespaces)); maps.Append(std::move(fact));
    }
    domain.Set("maps", std::move(maps)); domains.Append(std::move(domain));
  }
  for (const auto& raw : extension_lease_->CopySourceRecords())
    extension_source.Append(raw ? base::Value(base::Base64Encode(*raw)) : base::Value());
  for (const auto& raw : extension_lease_->CopyTargetRecords())
    extension_target.Append(raw ? base::Value(base::Base64Encode(*raw)) : base::Value());
  auto extension_descriptor = value_store::ValueStore::MakeAuxUiPreferenceRecoveryDescriptor(extension_lease_->CopySourceRecords());
  if (!extension_descriptor.has_value() || extension_descriptor->target != extension_lease_->CopyTargetRecords()) {
    Finish("Exact bounded fixed-six recovery descriptor refused"); return;
  }
  intent.Set("extensionSourceSha256", extension_descriptor->source_sha256);
  intent.Set("extensionTargetSha256", extension_descriptor->target_sha256);
  intent.Set("extensionDescriptorSha256", extension_descriptor->descriptor_sha256);
  intent.Set("domains", std::move(domains)); intent.Set("extensionSource", std::move(extension_source));
  intent.Set("extensionTarget", std::move(extension_target));
  intent.Set("plannedOrder", base::ListValue().Append("extension-local").Append("dom-captured-order").Append("cache-publish-after-durable-target-facts"));
  auto encoded = base::WriteJson(intent);
  if (!encoded || encoded->empty() || encoded->size() > kCaptureLimit) {
    Finish("Exact immutable native intent exceeds its bound"); return;
  }
  intent_ = std::make_unique<IntentRecord>(); intent_->payload = std::move(*encoded);
  intent_->digest = Digest(intent_->payload); intent_->intent_digest = intent_->digest; intent_->journal = transfer_->journal;
  intent_->upload = base::Uuid::GenerateRandomV4().AsLowercaseString();
  post_persist_validation_ = false; RunIntent();
}
void Controller::RunIntent() {
  if (!DomCurrent() || !PairDomSources() || !Inventory(false) || !FrontendCurrent() ||
      !HasValidUiStorageMigrationWorkerLease(profile_.get()) ||
      peer::InspectNativeBrowserShutdown().admitted_generation != transfer_->generation) {
    Finish("Original source/native journal generation changed during immutable intent"); return;
  }
  TransferIntentRecord(*intent_);  // One bounded native IPC on the actual owner sequence.
  if (!intent_->error.empty()) { Finish(intent_->error); return; }
  intent_validation_ = true; cursor_ = 0;
  // Keep all actual source leases while yielding between journal frames.
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&Controller::ReadWorkerForValidation, weak_.GetWeakPtr()));
}

void Controller::BeginDomNext() {
  if (!Inventory(false) || !FrontendCurrent() || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Actual source owners changed before DOM cohort closure"); return;
  }
  if (dom_cursor_ == dom_holds_.size()) {
    sealing_ = true; dom_cursor_ = 0; ValidateDomNext(); return;
  }
  const size_t index = dom_cursor_++;
  auto controls = DomControls(index);
  if (!controls) { Finish("Existing native DOM controls unavailable; no bind/open was attempted"); return; }
  auto& hold = dom_holds_[index];
  hold.generation = controls->generation; hold.attempted = true; hold.pending = true;
  auto callback = mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::BeganDom, weak_.GetWeakPtr(), index),
      base::BindOnce(&Controller::DomLost, weak_.GetWeakPtr(), index));
  if (hold.local) controls->local->BeginAuxUiPreferenceLease(hold.request, std::move(callback));
  else controls->session->BeginAuxUiPreferenceLease(hold.request, std::move(callback));
}
void Controller::BeganDom(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr value) {
  dom_holds_[index].pending = false;
  if (!AcceptDom(index, std::move(value))) {
    dom_holds_[index].unknown = true; Finish("Actual DOM source cohort refused or remains unknown"); return;
  }
  BeginDomNext();
}
void Controller::DomLost(size_t index) {
  dom_holds_[index].pending = false; dom_holds_[index].unknown = true;
  cleanup_unknown_ = true;
  if (dom_cleaning_) { ReplyResult(); return; }
  Finish("Original DOM cohort callback was lost; exact request remains retained");
}
void Controller::ValidateDomNext() {
  if (!Inventory(false) || !FrontendCurrent() || dom_holds_.empty() ||
      !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Original native DOM source holds changed"); return;
  }
  for (size_t i = 0; i < dom_holds_.size(); ++i) {
    const auto& hold = dom_holds_[i];
    if (!hold.attempted || hold.released || hold.pending || !hold.token || !hold.source || !DomControls(i)) {
      Finish("Original native DOM lease custody is unavailable"); return;
    }
  }
  if (dom_cursor_ == dom_holds_.size()) {
    if (sealing_) { cursor_ = 0; SealNext(); return; }
    if (!PairDomSources()) { Finish("Sealed UTF16 source does not pair with actual native cache documents"); return; }
    ValidationComplete(); return;
  }
  const size_t index = dom_cursor_++;
  auto controls = DomControls(index); auto& hold = dom_holds_[index];
  hold.pending = true;
  auto callback = mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::ValidatedDom, weak_.GetWeakPtr(), index),
      base::BindOnce(&Controller::DomLost, weak_.GetWeakPtr(), index));
  if (hold.unknown) {
    // A lost validation is recovered by observing the original request/token;
    // never re-Begin or mistake callback destruction for physical completion.
    if (hold.local) controls->local->ReadAuxUiPreferenceLease(hold.request, std::move(callback));
    else controls->session->ReadAuxUiPreferenceLease(hold.request, std::move(callback));
  } else if (hold.local) controls->local->ValidateAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
  else controls->session->ValidateAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
}
void Controller::ValidatedDom(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr value) {
  dom_holds_[index].pending = false;
  if (!AcceptDom(index, std::move(value))) {
    dom_holds_[index].unknown = true; Finish("Original physical DOM/cache source validation refused"); return;
  }
  ValidateDomNext();
}
void Controller::SealNext() {
  if (!DomCurrent() || !Inventory(false) || !FrontendCurrent() ||
      !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Actual all-store source holds changed before final renderer seal"); return;
  }
  if (cursor_ == frames_.size()) {
    sealing_ = false; cursor_ = 0; ValidateNext(); return;
  }
  const size_t index = cursor_++;
  Invoke(index, "auxSealDraftMigrationCapture", base::ListValue().Append(frames_[index]->lease_id)
      .Append(frames_[index]->revision).Append("utf16-v1"),
      base::BindOnce(&Controller::Sealed, weak_.GetWeakPtr(), index, false));
}
void Controller::Sealed(size_t index, bool observed,
    std::optional<base::DictValue> value, std::string error) {
  if (!value || !AcceptLease(*frames_[index], *value, true)) {
    if (!observed) {
      // A lost Seal may have completed. Observe the exact original lease;
      // never reflush, replace the lease or infer absence from a dropped reply.
      Invoke(index, "auxReadDraftMigrationCapture", base::ListValue().Append("utf16-v1"),
          base::BindOnce(&Controller::Sealed, weak_.GetWeakPtr(), index, true)); return;
    }
    Finish(error.empty() ? "Original renderer seal could not be observed" : std::move(error)); return;
  }
  SealNext();
}
void Controller::CleanupDomNext() {
  if (live_target_complete_ && (!completion_ack_ ||
      !completion_ack_->Matches(transfer_->generation, CompletionFingerprint()))) {
    cleanup_unknown_ = true; ReplyResult(); return;
  }
  dom_cleaning_ = true;
  while (dom_cursor_ < dom_holds_.size() &&
      (!dom_holds_[dom_cursor_].attempted || dom_holds_[dom_cursor_].released)) ++dom_cursor_;
  if (dom_cursor_ == dom_holds_.size()) { dom_cleaning_ = false; CleanupFrontend(); return; }
  const size_t index = dom_cursor_++;
  auto& hold = dom_holds_[index];
  auto controls = DomControls(index);
  if (!controls || hold.pending) { cleanup_unknown_ = true; ReplyResult(); return; }
  hold.pending = true;
  auto callback = mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::ObservedDomCleanup, weak_.GetWeakPtr(), index),
      base::BindOnce(&Controller::DomLost, weak_.GetWeakPtr(), index));
  if (hold.local) controls->local->ReadAuxUiPreferenceLease(hold.request, std::move(callback));
  else controls->session->ReadAuxUiPreferenceLease(hold.request, std::move(callback));
}
void Controller::ObservedDomCleanup(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr value) {
  auto& hold = dom_holds_[index]; hold.pending = false;
  auto controls = DomControls(index);
  if (controls && value && value->request_id == hold.request && value->aborted &&
      !value->ok && !value->held && !value->released && !value->token && !value->source_ready &&
      !value->target_attempted && !value->error.empty() && !hold.token) {
    // The SAME actual service recorded its definitive no-lease backend failure.
    // This retires only our source attempt; it is not current writer readiness.
    hold.released = true; hold.unknown = false; CleanupDomNext(); return;
  }
  if (!controls || !value || value->request_id != hold.request || !value->token ||
      value->token->is_empty() || (hold.token && hold.token != value->token)) {
    hold.unknown = true; cleanup_unknown_ = true; ReplyResult(); return;
  }
  hold.token = value->token;
  if (value->ok && value->released && !value->held && !value->source_ready) {
    hold.released = true; hold.unknown = false; CleanupDomNext(); return;
  }
  const bool original_source = live_source_complete_ && value->matches_source && value->file_data_synced &&
      !value->cache_published && !value->known_source_target_mixture;
  const bool completed_target = live_target_complete_ && value->matches_target && value->file_data_synced &&
      value->cache_published && !value->ordinary_work_queued && !value->known_source_target_mixture;
  if (!value->held || value->released || value->aborted ||
      ((value->target_attempted || value->cache_published) && !original_source && !completed_target)) {
    hold.unknown = true; cleanup_unknown_ = true; ReplyResult(); return;
  }
  hold.pending = true;
  auto callback = mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::ReleasedDom, weak_.GetWeakPtr(), index),
      base::BindOnce(&Controller::DomLost, weak_.GetWeakPtr(), index));
  if (hold.local) controls->local->ReleaseAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
  else controls->session->ReleaseAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
}
void Controller::ReleasedDom(size_t index, bool released) {
  auto& hold = dom_holds_[index]; hold.pending = false;
  if (!released || !DomControls(index)) {
    hold.unknown = true; cleanup_unknown_ = true; ReplyResult(); return;
  }
  hold.released = true; hold.unknown = false; CleanupDomNext();
}

void Controller::ValidateNext() {
  if (!Inventory(false) || !FrontendCurrent() || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Original source holds changed after physical DOM drain"); return;
  }
  if (cursor_ == frames_.size()) { ValidateWorker(); return; }
  const size_t index = cursor_++;
  Invoke(index, "auxValidateDraftMigrationCapture", base::ListValue().Append(frames_[index]->lease_id).Append(frames_[index]->revision),
      base::BindOnce(&Controller::Validated, weak_.GetWeakPtr(), index));
}
void Controller::Validated(size_t index, std::optional<base::DictValue> value, std::string error) {
  if (!value || !Text(*value, "format", "aux.ui-draft-capture-lease.v1") ||
      value->FindBool("ok") != true || value->FindBool("closed") != true ||
      value->FindBool("sealed") != frames_[index]->sealed ||
      !Text(*value, "requestId", frames_[index]->request_id) ||
      !Text(*value, "leaseId", frames_[index]->lease_id) ||
      value->FindDouble("revision") != frames_[index]->revision) {
    Finish(error.empty() ? "Renderer lease changed during native capture" : std::move(error)); return;
  }
  ValidateNext();
}
void Controller::ReadWorkerForValidation() {
  ReadUiStorageMigrationWorker(profile_.get(), mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::WorkerReadForValidation, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::WorkerControlLost, weak_.GetWeakPtr(), false)));
}
void Controller::WorkerReadForValidation(base::DictValue value) {
  if (value.FindBool("transportSuperseded") == true) return;
  if (!WorkerCorrelation(value, false) || !Inventory(false) || !FrontendCurrent() ||
      !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("The retained actual worker/source hold could not be observed for recovery"); return;
  }
  if (const auto* report = value.FindString("reportJson")) worker_report_json_ = *report;
  cursor_ = 0; ValidateNext();
}
void Controller::ValidateWorker() {
  ValidateUiStorageMigrationWorker(profile_.get(), mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::WorkerValidated, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::WorkerControlLost, weak_.GetWeakPtr(), false)));
}
void Controller::WorkerValidated(base::DictValue value) {
  if (value.FindBool("transportSuperseded") == true) return;
  if (!WorkerCorrelation(value, false) || !Inventory(false) || !FrontendCurrent() ||
      !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Original actual worker lease changed during validation"); return;
  }
  if (const auto* report = value.FindString("reportJson")) worker_report_json_ = *report;
  ValidateFrontend();
}
void Controller::ValidateFrontend() {
  if (!FrontendCurrent()) { Finish("Original actual frontend lease is unavailable"); return; }
  auto* frontend = Frontend::Get(profile_.get());
  frontend_io_pending_ = true;
  frontend->ReadbackAuxUiMigrationLease(*extension_lease_, mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::FrontendReadback, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::FrontendLost, weak_.GetWeakPtr(), false)));
}
void Controller::FrontendReadback(Frontend::AuxUiMigrationReadbackResult result) {
  frontend_io_pending_ = false; frontend_io_unknown_ = false;
  // A confirmed read on the SAME opaque native lease resolves a lost readback
  // observation; no past callback destruction or timer is called completion.
  if (!result.has_value() || !Inventory(false) || !FrontendCurrent() ||
      !HasValidUiStorageMigrationWorkerLease(profile_.get()) ||
      !result->matches_source || result->ordinary_work_queued ||
      result->records != extension_lease_->CopySourceRecords()) {
    Finish("Actual frontend source readback or writer gate changed"); return;
  }
  dom_cursor_ = 0; ValidateDomNext();
}
void Controller::ValidationComplete() {
  if (intent_validation_) {
    intent_validation_ = false;
    if (intent_ && intent_->complete) StartLive();
    else RunIntent();
  } else if (post_persist_validation_) BeginIntent();
  else if (transfer_validation_) { transfer_validation_ = false; RunTransfer(); }
  else if (!std::ranges::all_of(dom_holds_, [](const auto& hold) { return hold.staged; })) {
    if (!BuildDomTargets()) { Finish("Exact sealed-memory private target plan refused"); return; }
    dom_cursor_ = 0; StageDomNext();
  } else Persist();
}
void Controller::Persist() {
  if (!DomCurrent() || !PairDomSources() || !Inventory(false) || !FrontendCurrent() || frontend_io_unknown_ || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Native capture source holds were lost"); return;
  }
  base::ListValue pages, extension_records;
  for (const auto& frame : frames_) {
    base::DictValue page;
    page.Set("nativeDocumentId", frame->document_id.ToString());
    page.Set("nativeLocalFrameToken", frame->native_frame_token->ToString());
    page.Set("nativeBlinkDocumentToken", frame->native_document_token->ToString());
    page.Set("sessionNamespace", frame->namespace_id);
    page.Set("requestId", frame->request_id);
    page.Set("captureJson", frame->capture_json);
    pages.Append(std::move(page));
  }
  for (const auto& raw : extension_lease_->CopySourceRecords())
    extension_records.Append(raw ? base::Value(base::Base64Encode(*raw)) : base::Value());
  base::DictValue capture;
  capture.Set("format", "aux.ui-storage.capture-input.v1");
  capture.Set("nativeProfileId", profile_id_);
  capture.Set("bindingEpoch", binding_);
  capture.Set("restoreEpoch", restoration_);
  capture.Set("pages", std::move(pages));
  capture.Set("extensionRawRecords", std::move(extension_records));
  capture.Set("workerPrepareRequestId", worker_request_id_);
  capture.Set("workerReportJson", worker_report_json_);
  base::ListValue domains;
  for (const auto& hold : dom_holds_) {
    base::DictValue domain;
    domain.Set("partitionOrdinal", static_cast<int>(hold.partition));
    domain.Set("storage", hold.local ? "local-storage" : "session-storage");
    domain.Set("requestId", hold.request.ToString());
    domain.Set("serviceToken", hold.token->ToString());
    domain.Set("controlGeneration", base::NumberToString(hold.generation));
    domain.Set("sourceTopologySha256", hold.source->source_topology_sha256);
    base::ListValue maps;
    for (const auto& map : hold.source->maps) {
      base::DictValue fact;
      fact.Set("ordinal", static_cast<int>(map->map_ordinal));
      fact.Set("storageKey", map->storage_key.Serialize());
      fact.Set("sourceMapSha256", map->source_map_sha256);
      fact.Set("sourcePersisted", map->source_persisted);
      base::ListValue records, namespaces;
      for (const auto& entry : map->source_entries) {
        base::DictValue raw;
        raw.Set("keyBase64", base::Base64Encode(entry->key));
        raw.Set("valueBase64", base::Base64Encode(entry->value));
        records.Append(std::move(raw));
      }
      for (const auto& ns : map->session_ids) namespaces.Append(ns);
      fact.Set("sourceSelectedRaw", std::move(records));
      fact.Set("nativeNamespaces", std::move(namespaces));
      maps.Append(std::move(fact));
    }
    domain.Set("maps", std::move(maps)); domains.Append(std::move(domain));
  }
  capture.Set("domSourceFacts", std::move(domains));
  capture.Set("rendererSourceSealed", true);
  capture.Set("privateNativeTargetsStaged", true);
  capture.Set("phase", "captured-unqualified");
  capture.Set("qualified", false);
  capture.Set("activationAuthorized", false);
  capture.Set("backendWriterClosure", false);
  capture.Set("targetImportAvailable", false);
  auto encoded = base::WriteJson(capture);
  if (!encoded || encoded->empty() || encoded->size() > kCaptureLimit) { Finish("Complete native capture exceeds its bound"); return; }
  transfer_ = std::make_shared<Transfer>(); transfer_->capture = std::move(*encoded);
  transfer_->digest = Digest(transfer_->capture); transfer_->upload = base::Uuid::GenerateRandomV4().AsLowercaseString();
  transfer_->generation = peer::InspectNativeBrowserShutdown().admitted_generation;
  RunTransfer();
}
void Controller::RunTransfer() {
  if (!DomCurrent() || !Inventory(false) || !FrontendCurrent() || frontend_io_unknown_ || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Native source holds changed before the next capture frame"); return;
  }
  transfer_->running.store(true);
  // One bounded native IPC on the real owner sequence per task. Yield before
  // the next frame so document/profile/lease events can be processed. No
  // arbitrary worker receives native authority or a long UI-blocking loop.
  const bool posted = base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE, base::BindOnce(&Controller::TransferStep, weak_.GetWeakPtr()));
  if (!posted) {
    transfer_->running.store(false);
    if (transfer_->phase == 0 && transfer_->next.empty()) transfer_.reset();
    Finish("Native capture owner task did not start; older outcomes remain retained");
  }
}
void Controller::TransferStep() {
  if (!DomCurrent() || !Inventory(false) || !FrontendCurrent() || frontend_io_unknown_ || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    transfer_->running.store(false); Finish("Native source holds changed before capture IPC"); return;
  }
  TransferCapture(transfer_);  // Exactly one finite frame, never a chunk loop.
  if (transfer_->complete || !transfer_->error.empty()) { Persisted(); return; }
  // Validate the actual retained producer leases between every bounded frame.
  transfer_validation_ = true; cursor_ = 0; ValidateNext();
}
void Controller::Persisted() {
  if (!transfer_ || !transfer_->complete || !Inventory(false)) {
    Finish(transfer_ && !transfer_->error.empty() ? transfer_->error : "Native capture persistence/readback remains uncertain"); return;
  }
  post_persist_validation_ = true; cursor_ = 0; ValidateNext();
}
void Controller::ObserveCleanupNext() {
  while (cursor_ < frames_.size()) {
    const size_t index = cursor_++;
    auto& frame = *frames_[index];
    if (!frame.document.AsRenderFrameHostIfValid()) {
      // This proves only destruction of the in-memory document lease, not
      // completion of any backend/transport write.
      frame.prepared = false; frame.cleanup_unknown = false; continue;
    }
    if (!frame.prepared && !frame.cleanup_unknown) continue;
    Invoke(index, "auxReadDraftMigrationCapture", base::ListValue().Append("utf16-v1"),
        base::BindOnce(&Controller::ObservedCleanup, weak_.GetWeakPtr(), index)); return;
  }
  observing_cleanup_ = false; error_ = "Retained source cleanup was observed; no migration activated"; CleanupWorker();
}
void Controller::ObservedCleanup(size_t index, std::optional<base::DictValue> value, std::string) {
  auto& frame = *frames_[index];
  if (value && Text(*value, "format", "aux.ui-draft-capture-lease.v1") &&
      Text(*value, "requestId", frame.request_id) && value->FindBool("retained") == false &&
      value->FindBool("restored") == true &&
      ((value->FindBool("released") == true && Text(*value, "leaseId", frame.lease_id)) ||
       (frame.lease_id.empty() && value->FindBool("noLeaseCreated") == true && Text(*value, "attemptState", "not-started")))) {
    frame.prepared = false; frame.cleanup_unknown = false; ObserveCleanupNext(); return;
  }
  const auto* lease = value ? value->FindString("leaseId") : nullptr;
  if (!value || !Text(*value, "requestId", frame.request_id) || !lease || !CanonicalUuid(*lease)) {
    frame.cleanup_unknown = true; cleanup_unknown_ = true; ObserveCleanupNext(); return;
  }
  frame.lease_id = *lease; frame.prepared = true;
  Invoke(index, "auxReleaseDraftMigrationCapture", base::ListValue().Append(frame.lease_id),
      base::BindOnce(&Controller::Released, weak_.GetWeakPtr(), index));
}
void Controller::Finish(std::string error) {
  if (live_target_complete_ && !completion_ack_) { HoldLive(std::move(error)); return; }
  if (live_active_ && live_persistent_attempted_ && !live_target_complete_ && !live_source_complete_) {
    HoldLive(std::move(error)); return;
  }
  error_ = std::move(error);
  if ((transfer_ && !transfer_->complete) || (intent_ && !intent_->complete)) {
    // Never release the original producer leases and start a different upload
    // across unfinished/unknown native capture work. Explicit observation of
    // the same pending frame and original bindings is required for recovery.
    ReplyResult(); return;
  }
  StartCleanup();
}
void Controller::StartCleanup() {
  dom_cursor_ = 0; CleanupDomNext();
}
void Controller::CleanupFrontend() {
  // Reopen the ORIGINAL frontend gate before any productive renderer/worker
  // restore. Unknown physical begin/readback keeps the token and all producers.
  if (frontend_begin_pending_ || frontend_io_pending_) {
    cleanup_unknown_ = true; ReplyResult(); return;
  }
  if (frontend_begin_unknown_) {
    auto* frontend = profile_ ? Frontend::Get(profile_.get()) : nullptr;
    if (!frontend || frontend_request_id_.is_empty()) { cleanup_unknown_ = true; ReplyResult(); return; }
    auto observed = frontend->ObserveAuxUiMigrationLease(frontend_request_id_);
    if (!observed.has_value() || observed->preparation_pending || observed->target_attempted ||
        (!observed->lease && !observed->aborted_before_target)) {
      cleanup_unknown_ = true; ReplyResult(); return;
    }
    if (observed->lease) extension_lease_ = std::move(observed->lease);
    // Exact actual original State/abort observation, no reset or re-Capture.
    frontend_begin_unknown_ = false;
  }
  if (extension_lease_) {
    auto* frontend = profile_ ? Frontend::Get(profile_.get()) : nullptr;
    if (!frontend) { cleanup_unknown_ = true; ReplyResult(); return; }
    auto alive = weak_.GetWeakPtr();
    const bool released = frontend->ReleaseAuxUiMigrationLease(*extension_lease_);
    if (!alive) return;
    if (!released) { cleanup_unknown_ = true; ReplyResult(); return; }
    extension_lease_.reset(); frontend_io_unknown_ = false;
  }
  if (frontend_io_unknown_) { cleanup_unknown_ = true; ReplyResult(); return; }
  cleanup_unknown_ = false; cursor_ = 0;
  if (observing_cleanup_) ObserveCleanupNext(); else ReleaseNext();
}
void Controller::ReleaseNext() {
  while (cursor_ < frames_.size() && !frames_[cursor_]->prepared) {
    cleanup_unknown_ |= frames_[cursor_]->cleanup_unknown; ++cursor_;
  }
  if (cursor_ == frames_.size()) { CleanupWorker(); return; }
  const size_t index = cursor_++;
  Invoke(index, "auxReleaseDraftMigrationCapture", base::ListValue().Append(frames_[index]->lease_id),
      base::BindOnce(&Controller::Released, weak_.GetWeakPtr(), index));
}
void Controller::Released(size_t index, std::optional<base::DictValue> value, std::string) {
  const bool released = value && Text(*value, "format", "aux.ui-draft-capture-lease.v1") &&
      value->FindBool("ok") == true && value->FindBool("released") == true && value->FindBool("restored") == true &&
      Text(*value, "leaseId", frames_[index]->lease_id) &&
      Text(*value, "requestId", frames_[index]->request_id);
  frames_[index]->prepared = !released; frames_[index]->cleanup_unknown = !released;
  cleanup_unknown_ |= !released;
  if (observing_cleanup_) ObserveCleanupNext(); else ReleaseNext();
}
void Controller::CleanupWorker() {
  if (!worker_attempted_) { ReplyResult(); return; }
  if (std::ranges::any_of(dom_holds_, [](const auto& hold) { return hold.attempted && !hold.released; }) ||
      extension_lease_ || frontend_begin_pending_ || frontend_io_pending_ ||
      frontend_begin_unknown_ || frontend_io_unknown_ || !profile_) {
    cleanup_unknown_ = true; ReplyResult(); return;
  }
  ReadUiStorageMigrationWorker(profile_.get(), mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::ObservedWorkerCleanup, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::WorkerControlLost, weak_.GetWeakPtr(), true)));
}
void Controller::ObservedWorkerCleanup(base::DictValue value) {
  if (value.FindBool("transportSuperseded") == true) return;
  // This is the native helper's retained attempt result, never a worker-selected
  // Profile or a bare renderer readiness Boolean. Missing correlation stays held.
  const auto* actual_request = value.FindString("prepareRequestId");
  if (worker_request_id_.empty() && actual_request && CanonicalUuid(*actual_request))
    worker_request_id_ = *actual_request;
  if (!WorkerCorrelation(value, false) || !profile_) { cleanup_unknown_ = true; ReplyResult(); return; }
  if (value.FindBool("ownExternalRequestRetired") == true &&
      !IsUiStorageMigrationWorkerPending(profile_.get()) &&
      (value.FindBool("released") == true || value.FindBool("noProducerLeaseCreated") == true)) {
    worker_attempted_ = false; ReplyResult(); return;
  }
  ReleaseUiStorageMigrationWorker(profile_.get(), mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::ReleasedWorker, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::WorkerControlLost, weak_.GetWeakPtr(), true)));
}
void Controller::ReleasedWorker(base::DictValue value) {
  if (value.FindBool("transportSuperseded") == true) return;
  if (!profile_ || !WorkerCorrelation(value, false) || value.FindBool("released") != true ||
      value.FindBool("ownExternalRequestRetired") != true || IsUiStorageMigrationWorkerPending(profile_.get())) {
    cleanup_unknown_ = true; ReplyResult(); return;
  }
  worker_attempted_ = false; ReplyResult();
}
void Controller::ReplyResult() {
  busy_ = false;
  // Opaque frontend/worker tokens survive any unconfirmed cleanup. Only their
  // actual native release paths above may retire them.
  auto result = Refused(error_);
  result.Set("phase", transfer_ && transfer_->complete ? "captured-unqualified" : "refused-or-unknown");
  result.Set("rendererCleanupUnknown", cleanup_unknown_);
  result.Set("workerCleanupPending", worker_attempted_);
  result.Set("frontendCleanupPending", !!extension_lease_ || frontend_begin_unknown_ || frontend_io_unknown_);
  result.Set("domCleanupPending", std::ranges::any_of(dom_holds_,
      [](const auto& hold) { return hold.attempted && !hold.released; }));
  result.Set("liveTargetObserved", live_target_complete_);
  result.Set("originalSourceRestored", live_source_complete_);
  result.Set("liveTransactionPending", live_active_ || live_pending_ || (live_record_ && !live_record_->complete));
  result.Set("immutableIntentRetained", intent_ && intent_->complete);
  if (intent_ && intent_->complete) result.Set("intentSha256", base::HexEncodeLower(intent_->digest));
  result.Set("backendWriterClosure", false);
  result.Set("targetImportAvailable", false);
  if (transfer_ && transfer_->complete) {
    result.Set("journalId", transfer_->journal);
    result.Set("captureSha256", base::HexEncodeLower(transfer_->digest));
  }
  auto alive = weak_.GetWeakPtr();
  if (reply_) std::move(reply_).Run(std::move(result));
  if (alive && !alive->pending()) alive->settled_.Notify();
}
void Controller::OnProfileWillBeDestroyed(Profile*) {
  if (transfer_) transfer_->cancelled.store(true);
  profile_observation_.Reset(); profile_ = nullptr;
  if (reply_) std::move(reply_).Run(Refused("Original native Profile was destroyed; migration did not activate"));
}
Controller* Find(Profile* profile) {
  return profile ? static_cast<Controller*>(profile->GetUserData(&kController)) : nullptr;
}
}  // namespace migration_detail
using migration_detail::Controller;
using migration_detail::Find;
using migration_detail::Reply;
using migration_detail::Refused;
using migration_detail::kController;
UiStorageMigrationOwnerAck::UiStorageMigrationOwnerAck(uint64_t generation,
    std::string fingerprint, base::RepeatingCallback<bool()> current)
    : native_generation_(generation), terminal_fingerprint_(std::move(fingerprint)), owner_current_(std::move(current)) {}
UiStorageMigrationOwnerAck::UiStorageMigrationOwnerAck(UiStorageMigrationOwnerAck&&) = default;
UiStorageMigrationOwnerAck& UiStorageMigrationOwnerAck::operator=(UiStorageMigrationOwnerAck&&) = default;
UiStorageMigrationOwnerAck::~UiStorageMigrationOwnerAck() = default;
bool UiStorageMigrationOwnerAck::IsCurrent() const {
  return native_generation_ && terminal_fingerprint_.size() == 64 && owner_current_ && owner_current_.Run();
}
bool UiStorageMigrationOwnerAck::Matches(uint64_t generation, std::string_view fingerprint) const {
  return generation == native_generation_ && fingerprint == terminal_fingerprint_ && IsCurrent();
}
UiStorageMigrationCompletion::UiStorageMigrationCompletion(uint64_t generation, std::string fingerprint,
    std::vector<uint8_t> frame, std::vector<uint8_t> reply, base::RepeatingCallback<bool()> current)
    : native_generation_(generation), terminal_fingerprint_(std::move(fingerprint)), read_frame_(std::move(frame)),
      expected_reply_(std::move(reply)), actual_current_(std::move(current)) {}
UiStorageMigrationCompletion::UiStorageMigrationCompletion(UiStorageMigrationCompletion&&) = default;
UiStorageMigrationCompletion& UiStorageMigrationCompletion::operator=(UiStorageMigrationCompletion&&) = default;
UiStorageMigrationCompletion::~UiStorageMigrationCompletion() = default;
uint64_t UiStorageMigrationCompletion::native_generation() const { return native_generation_; }
std::string_view UiStorageMigrationCompletion::terminal_fingerprint() const { return terminal_fingerprint_; }
bool UiStorageMigrationCompletion::IsCurrent() const {
  return native_generation_ && terminal_fingerprint_.size() == 64 && actual_current_ && actual_current_.Run();
}
std::vector<uint8_t> UiStorageMigrationCompletion::TerminalReadFrame() const {
  return IsCurrent() ? read_frame_ : std::vector<uint8_t>();
}
bool UiStorageMigrationCompletion::MatchesTerminalReply(base::span<const uint8_t> reply) const {
  return IsCurrent() && std::ranges::equal(reply, expected_reply_);
}

std::unique_ptr<UiStorageMigrationCompletion> TakeUiStorageMigrationCompletion(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* owner = Find(profile); return owner ? owner->TakeCompletion() : nullptr;
}
bool AcknowledgeUiStorageMigrationCompletion(Profile* profile, UiStorageMigrationOwnerAck acknowledgement) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* owner = Find(profile); return owner && owner->AcknowledgeCompletion(std::move(acknowledgement));
}
void PrepareUiStorageMigration(Profile* profile, content::RenderFrameHost* sender, Reply reply) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!profile || !sender || sender->GetBrowserContext() != profile ||
      !profile->IsRegularProfile() || profile->IsOffTheRecord()) {
    std::move(reply).Run(Refused("Actual regular native profile sender required")); return;
  }
  auto* registry = extensions::ExtensionRegistry::Get(profile);
  auto* extension = registry ? registry->enabled_extensions().GetByID(kAgentExtensionId) : nullptr;
  if (!extension || sender->GetLastCommittedOrigin() != extension->origin()) {
    std::move(reply).Run(Refused("Actual enabled canonical Aux Agent document required")); return;
  }
  if (!Find(profile)) profile->SetUserData(&kController, std::make_unique<Controller>(profile));
  Find(profile)->Begin(sender, std::move(reply));
}
bool IsUiStorageMigrationPending(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* owner = Find(profile); return owner && owner->pending();
}
base::CallbackListSubscription ObserveUiStorageMigrationSettled(
    Profile* profile, base::RepeatingClosure callback) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!profile || !profile->IsRegularProfile() || profile->IsOffTheRecord()) return {};
  if (!Find(profile)) profile->SetUserData(&kController, std::make_unique<Controller>(profile));
  return Find(profile)->Observe(std::move(callback));
}
}  // namespace aux
