// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_AUX_UI_STORAGE_MIGRATION_JOURNAL_PROTOCOL_H_
#define CHROME_BROWSER_AUX_UI_STORAGE_MIGRATION_JOURNAL_PROTOCOL_H_

#include <algorithm>
#include <array>
#include <cstddef>
#include <cstdint>
#include <optional>
#include <string>
#include <utility>
#include <vector>

#include "base/containers/span.h"
#include "base/strings/string_view_util.h"
#include "crypto/hash.h"

namespace aux::ui_journal {

using Uuid = std::array<uint8_t, 16>;
using Digest = std::array<uint8_t, 32>;
inline constexpr size_t kMaxRecords = 64;
inline constexpr uint32_t kMaxPayloadBytes = 64 * 1024 * 1024;
inline constexpr uint32_t kMaxPayloadChunk = 8191;
inline constexpr size_t kMaxFrameBytes = 8192;
inline constexpr size_t kInventoryHeaderBytes = 44;
inline constexpr size_t kRecordSummaryBytes = 69;
inline constexpr size_t kSelectedHeaderBytes = 63;

// These values describe observed files only. None proves that no later write
// happened, that a native actor is ready, or that a Profile/root was admitted.
enum class TailStatus : uint8_t {
  kNoneObserved = 0,
  kPartial = 1,
  kGap = 2,
  kInvalidCandidate = 3,
};
struct RecordSummary {
  uint32_t ordinal = 0;
  uint8_t kind = 0;
  Digest receiptSHA{};
  Digest payloadSHA{};
};
struct Inventory {
  Uuid inventoryID{};
  uint64_t sourceGeneration = 0;
  uint64_t currentGeneration = 0;
  std::vector<RecordSummary> records;
  std::optional<uint32_t> firstUncertain;
  TailStatus tailStatus = TailStatus::kNoneObserved;
  bool tailPresent = false;
};
struct SelectedRecord {
  uint32_t ordinal = 0;
  uint32_t payloadBytes = 0;
  uint8_t kind = 0;
  Digest receiptSHA{};
  // Exact hashed bytes only. The native controller must still validate the
  // receipt's JSON schema, chain, immutable intent and genuine owner binding.
  std::string receiptJSON;
};

namespace detail {
inline bool Nonzero(base::span<const uint8_t> bytes) {
  return std::ranges::any_of(bytes, [](uint8_t byte) { return byte != 0; });
}
inline bool NativeInventoryID(const Uuid& id) {
  const auto bytes = base::span(id);
  // The actual new producer mints Foundation random UUIDv4/RFC4122 IDs.
  // Format/entropy checks do not authenticate the owner or grant authority.
  return Nonzero(bytes) && (bytes.subspan<6, 1>().front() >> 4) == 4 &&
         (bytes.subspan<8, 1>().front() & 0xc0) == 0x80;
}
inline std::optional<uint64_t> ReadLE(base::span<const uint8_t> bytes,
                                      size_t offset, size_t count) {
  if (count == 0 || count > 8 || offset > bytes.size() ||
      count > bytes.size() - offset) return std::nullopt;
  uint64_t value = 0;
  size_t shift = 0;
  for (const uint8_t byte : bytes.subspan(offset, count)) {
    value |= static_cast<uint64_t>(byte) << shift;
    shift += 8;
  }
  return value;
}
template <size_t N>
inline bool CopyFixed(base::span<const uint8_t> bytes, size_t offset,
                      std::array<uint8_t, N>& output) {
  if (offset > bytes.size() || N > bytes.size() - offset) return false;
  base::span(output).copy_from(bytes.subspan(offset, N));
  return true;
}
inline bool CapturedOrdinal(const Inventory& inventory, uint32_t ordinal) {
  return NativeInventoryID(inventory.inventoryID) &&
         inventory.records.size() <= kMaxRecords && ordinal < inventory.records.size() &&
         base::span(inventory.records).subspan(ordinal, 1).front().ordinal == ordinal;
}
inline void AppendLE(std::vector<uint8_t>& output, uint64_t value, size_t count) {
  for (size_t index = 0; index < count; ++index) {
    output.push_back(static_cast<uint8_t>(value & 0xff)); value >>= 8;
  }
}
inline void AppendUuid(std::vector<uint8_t>& output, const Uuid& id) {
  output.insert(output.end(), id.begin(), id.end());
}
}  // namespace detail

inline std::optional<Inventory> ParseInventoryReply(base::span<const uint8_t> bytes) {
  if (bytes.size() < kInventoryHeaderBytes ||
      bytes.size() > kInventoryHeaderBytes + kMaxRecords * kRecordSummaryBytes ||
      bytes.front() != 13 || bytes.subspan<1, 1>().front() != 0) return std::nullopt;
  const auto source = detail::ReadLE(bytes, 18, 8);
  const auto current = detail::ReadLE(bytes, 26, 8);
  const auto count = detail::ReadLE(bytes, 34, 4);
  const auto first = detail::ReadLE(bytes, 38, 4);
  const uint8_t status = bytes.subspan<42, 1>().front();
  const uint8_t present = bytes.subspan<43, 1>().front();
  if (!source || !current || *source == 0 || *current == 0 || !count || *count > kMaxRecords ||
      !first || *first > kMaxRecords || status > 3 || present > 1 ||
      bytes.size() != kInventoryHeaderBytes + *count * kRecordSummaryBytes) return std::nullopt;
  // The prefix stops exactly at the first uncertain ordinal. A gap needs a
  // later fixed slot, so ordinal63 cannot be the first gap in a64-slot journal.
  if (status == 0 ? (*first != 64 || present != 0) :
      (*count >= 64 || *first != *count || present != 1 || (status == 2 && *first >= 63)))
    return std::nullopt;
  Inventory inventory;
  if (!detail::CopyFixed(bytes, 2, inventory.inventoryID) ||
      !detail::NativeInventoryID(inventory.inventoryID)) return std::nullopt;
  inventory.sourceGeneration = *source;
  inventory.currentGeneration = *current;
  inventory.tailStatus = static_cast<TailStatus>(status);
  inventory.tailPresent = present == 1;
  if (*first != 64) inventory.firstUncertain = static_cast<uint32_t>(*first);
  inventory.records.reserve(static_cast<size_t>(*count));
  for (size_t index = 0; index < *count; ++index) {
    const auto row = bytes.subspan(kInventoryHeaderBytes + index * kRecordSummaryBytes,
                                  kRecordSummaryBytes);
    const auto ordinal = detail::ReadLE(row, 0, 4);
    RecordSummary record;
    record.ordinal = static_cast<uint32_t>(index);
    record.kind = row.subspan<4, 1>().front();
    if (!ordinal || *ordinal != index || record.kind < 1 || record.kind > 8 ||
        (index == 0 ? record.kind != 1 : record.kind == 1) ||
        !detail::CopyFixed(row, 5, record.receiptSHA) ||
        !detail::CopyFixed(row, 37, record.payloadSHA) ||
        !detail::Nonzero(record.receiptSHA) || !detail::Nonzero(record.payloadSHA)) return std::nullopt;
    inventory.records.push_back(std::move(record));
  }
  return inventory;
}

inline std::optional<SelectedRecord> ParseSelectedReply(base::span<const uint8_t> bytes,
    const Inventory& inventory, uint32_t ordinal) {
  if (!detail::CapturedOrdinal(inventory, ordinal) || bytes.size() <= kSelectedHeaderBytes ||
      bytes.size() > kMaxFrameBytes || bytes.front() != 13 || bytes.subspan<1, 1>().front() != 1)
    return std::nullopt;
  const auto& expected = base::span(inventory.records).subspan(ordinal, 1).front();
  Uuid id{};
  Digest digest{};
  const auto actual_ordinal = detail::ReadLE(bytes, 18, 4);
  const auto payload = detail::ReadLE(bytes, 22, 4);
  const auto receipt_size = detail::ReadLE(bytes, 59, 4);
  const uint8_t kind = bytes.subspan<26, 1>().front();
  if (!detail::CopyFixed(bytes, 2, id) || id != inventory.inventoryID ||
      !actual_ordinal || *actual_ordinal != ordinal || !payload || *payload == 0 ||
      *payload > kMaxPayloadBytes || !receipt_size || *receipt_size == 0 ||
      *receipt_size > kMaxFrameBytes - kSelectedHeaderBytes ||
      bytes.size() != kSelectedHeaderBytes + *receipt_size || kind != expected.kind ||
      kind < 1 || kind > 8 || !detail::CopyFixed(bytes, 27, digest) ||
      digest != expected.receiptSHA) return std::nullopt;
  const auto receipt = bytes.subspan(kSelectedHeaderBytes);
  if (crypto::hash::Sha256(receipt) != digest) return std::nullopt;
  SelectedRecord record;
  record.ordinal = ordinal;
  record.payloadBytes = static_cast<uint32_t>(*payload);
  record.kind = kind;
  record.receiptSHA = digest;
  record.receiptJSON = std::string(base::as_string_view(receipt));
  return record;
}

inline std::optional<std::vector<uint8_t>> MakeInventoryRequest(const Uuid& journal) {
  if (!detail::Nonzero(journal)) return std::nullopt;
  std::vector<uint8_t> frame{13}; detail::AppendUuid(frame, journal); return frame;
}
inline std::optional<std::vector<uint8_t>> MakeSelectRequest(const Uuid& journal,
    const Inventory& inventory, uint32_t ordinal) {
  if (!detail::Nonzero(journal) || !detail::CapturedOrdinal(inventory, ordinal)) return std::nullopt;
  std::vector<uint8_t> frame{13}; detail::AppendUuid(frame, journal);
  detail::AppendUuid(frame, inventory.inventoryID); detail::AppendLE(frame, ordinal, 4); return frame;
}
inline std::optional<std::vector<uint8_t>> MakePayloadReadRequest(const Uuid& journal,
    uint32_t ordinal, uint32_t offset, uint32_t count, uint32_t payloadBytes) {
  if (!detail::Nonzero(journal) || ordinal >= kMaxRecords || payloadBytes == 0 ||
      payloadBytes > kMaxPayloadBytes || count == 0 || count > kMaxPayloadChunk ||
      offset > payloadBytes || count > payloadBytes - offset) return std::nullopt;
  std::vector<uint8_t> frame{11}; detail::AppendUuid(frame, journal);
  detail::AppendLE(frame, ordinal, 4); detail::AppendLE(frame, offset, 4);
  detail::AppendLE(frame, count, 4); return frame;
}

}  // namespace aux::ui_journal
#endif  // CHROME_BROWSER_AUX_UI_STORAGE_MIGRATION_JOURNAL_PROTOCOL_H_
