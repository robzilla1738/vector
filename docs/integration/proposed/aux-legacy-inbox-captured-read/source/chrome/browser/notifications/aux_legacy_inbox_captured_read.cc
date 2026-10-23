#include "chrome/browser/notifications/aux_legacy_inbox_captured_read.h"
#include "chrome/browser/notifications/aux_legacy_inbox_codec.h"
#include "base/base64.h"
#include <Security/SecBase.h>
#include <algorithm>
#include <array>

namespace aux {
namespace {
// Scoped temporary copies only. This makes no whole-process erasure claim;
// the caller still owns its captured encoded bytes and the crypto API internals.
class LocalLegacyKey {
 public:
  std::array<uint8_t,32> bytes{};
  ~LocalLegacyKey() {
    for (auto& byte : bytes) { volatile uint8_t& owned = byte; owned = 0; }
  }
};
}
CapturedLegacyInboxDecodeResult DecodeLegacyInboxFromCapturedKeyRead(
    std::string_view record, const CapturedLegacyInboxKeyRead& captured) {
  using S = CapturedLegacyInboxDecodeStatus;
  // Classify and validate framing through the actual codec before accepting
  // any key observation. It cannot perform a lookup with a null key.
  auto framing = DecodeExplicitLegacyInboxV1(record, nullptr);
  if (framing.status == LegacyInboxDecodeStatus::notLegacy)
    return {S::notLegacy, std::nullopt, std::nullopt};
  if (framing.status == LegacyInboxDecodeStatus::malformedLegacy)
    return {S::malformedEnvelope, std::nullopt, std::nullopt};
  if (captured.status == errSecItemNotFound)
    return {S::keyMissing, std::nullopt, std::nullopt};
  if (captured.status != errSecSuccess)
    return {S::keyUnavailable, std::nullopt, captured.status};
  if (captured.kind != CapturedLegacyInboxKeyRead::ValueKind::data ||
      captured.data.size() != 44)
    return {S::malformedKey, std::nullopt, std::nullopt};
  auto decoded = base::Base64Decode(captured.data);
  if (!decoded) return {S::malformedKey, std::nullopt, std::nullopt};
  const bool valid = decoded->size() == 32 &&
                     base::Base64Encode(*decoded) == captured.data;
  LocalLegacyKey key;
  if (valid) std::copy(decoded->begin(), decoded->end(), key.bytes.begin());
  for (auto& byte : *decoded) { volatile uint8_t& owned = byte; owned = 0; }
  if (!valid) return {S::malformedKey, std::nullopt, std::nullopt};
  auto result = DecodeExplicitLegacyInboxV1(record, &key.bytes);
  if (result.status != LegacyInboxDecodeStatus::decoded || !result.plaintext)
    return {S::authenticationFailedOrWrongKey, std::nullopt, std::nullopt};
  return {S::decoded, std::move(result.plaintext), std::nullopt};
}
}  // namespace aux
