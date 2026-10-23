#pragma once
#include <cstdint>
#include <optional>
#include <string>
#include <string_view>

namespace aux {
// External observations only: callers can construct these values. They do not
// authenticate a selector, keychain, profile, access group or query permission.
struct CapturedLegacyInboxKeyRead {
  enum class ValueKind { none, data, other };
  int32_t status;
  ValueKind kind;
  std::string data;
};
enum class CapturedLegacyInboxDecodeStatus {
  decoded, notLegacy, malformedEnvelope, keyMissing, keyUnavailable,
  malformedKey, authenticationFailedOrWrongKey,
};
struct CapturedLegacyInboxDecodeResult {
  CapturedLegacyInboxDecodeStatus status;
  std::optional<std::string> plaintext;
  // Preserved only for unavailable reads; never interpreted as absence.
  std::optional<int32_t> unavailable_status;
};
// Pure captured-read consumer. No Security query, Add, mutation, fallback or
// authority factory. Only canonical historical Base64 key data is accepted.
CapturedLegacyInboxDecodeResult DecodeLegacyInboxFromCapturedKeyRead(
    std::string_view record, const CapturedLegacyInboxKeyRead& captured);
}  // namespace aux
