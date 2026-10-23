#include "chrome/browser/notifications/aux_legacy_inbox_codec.h"
#include <utility>
#include "chrome/browser/notifications/aux_inbox_codec.h"
#include "crypto/aead.h"
#include "crypto/hash.h"

namespace aux {
namespace {
constexpr std::string_view kLegacyPrefix = "ASIDEAI1"; // Migration metadata only.
constexpr size_t kNonceBytes = 12;
constexpr size_t kTagBytes = 16;
}
LegacyInboxDecodeResult DecodeExplicitLegacyInboxV1(
    std::string_view record,
    const std::array<uint8_t, 32>* legacy_key) {
  if (!record.starts_with(kLegacyPrefix))
    return {LegacyInboxDecodeStatus::notLegacy, std::nullopt};
  if (record.size() < kLegacyPrefix.size() + kNonceBytes + kTagBytes)
    return {LegacyInboxDecodeStatus::malformedLegacy, std::nullopt};
  if (!legacy_key)
    return {LegacyInboxDecodeStatus::legacyKeyRequired, std::nullopt};
  crypto::Aead aead(crypto::Aead::AES_256_GCM, *legacy_key);
  if (aead.NonceLength() != kNonceBytes)
    return {LegacyInboxDecodeStatus::malformedLegacy, std::nullopt};
  std::string plaintext;
  // Exact historical writer contract: EMPTY AAD, not the legacy prefix and
  // never AUXAI002's authenticated prefix. No alternate-key attempt.
  if (!aead.Open(record.substr(kLegacyPrefix.size() + kNonceBytes),
                 record.substr(kLegacyPrefix.size(), kNonceBytes),
                 std::string_view(), &plaintext)) {
    return {LegacyInboxDecodeStatus::authenticationFailedOrWrongKey,
            std::nullopt};
  }
  return {LegacyInboxDecodeStatus::decoded, std::move(plaintext)};
}
PreparedLegacyInboxBytes::PreparedLegacyInboxBytes(
    std::string original, std::string replacement)
    : original_(std::move(original)), replacement_(std::move(replacement)),
      original_sha_(crypto::hash::Sha256(original_)),
      replacement_sha_(crypto::hash::Sha256(replacement_)) {}

LegacyInboxPreparationResult PrepareExplicitLegacyInboxV2Bytes(
    std::string_view original, const std::array<uint8_t, 32>* legacy_key,
    const std::array<uint8_t, 32>* v2_key) {
  if (!original.starts_with(kLegacyPrefix))
    return {LegacyInboxPreparationStatus::notLegacy, std::nullopt};
  if (original.size() < kLegacyPrefix.size() + kNonceBytes + kTagBytes)
    return {LegacyInboxPreparationStatus::malformedLegacy, std::nullopt};
  if (!legacy_key)
    return {LegacyInboxPreparationStatus::legacyKeyRequired, std::nullopt};
  if (!v2_key)
    return {LegacyInboxPreparationStatus::targetKeyRequired, std::nullopt};
  auto decoded = DecodeExplicitLegacyInboxV1(original, legacy_key);
  if (decoded.status != LegacyInboxDecodeStatus::decoded || !decoded.plaintext)
    return {LegacyInboxPreparationStatus::authenticationFailedOrWrongKey,
            std::nullopt};
  auto replacement = SealInboxV2(*decoded.plaintext, *v2_key);
  if (!replacement)
    return {LegacyInboxPreparationStatus::targetSealFailed, std::nullopt};
  auto reopened = OpenInboxV2(*replacement, *v2_key);
  if (!reopened || *reopened != *decoded.plaintext)
    return {LegacyInboxPreparationStatus::targetVerificationFailed,
            std::nullopt};
  return {LegacyInboxPreparationStatus::prepared,
          PreparedLegacyInboxBytes(std::string(original),
                                   std::move(*replacement))};
}
}  // namespace aux
