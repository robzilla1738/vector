#pragma once
#include <array>
#include <cstdint>
#include <optional>
#include <string>
#include <string_view>

namespace aux {
// Pure external-byte input; possession of bytes does not establish key/source
// scope authority. No Keychain lookup, creation or DK fallback occurs here.
enum class LegacyInboxDecodeStatus {
  decoded,
  notLegacy,
  malformedLegacy,
  legacyKeyRequired,
  authenticationFailedOrWrongKey,
};
struct LegacyInboxDecodeResult {
  LegacyInboxDecodeStatus status;
  std::optional<std::string> plaintext;
};
LegacyInboxDecodeResult DecodeExplicitLegacyInboxV1(
    std::string_view record,
    const std::array<uint8_t, 32>* explicitly_supplied_legacy_key);

enum class LegacyInboxPreparationStatus {
  prepared,
  notLegacy,
  malformedLegacy,
  legacyKeyRequired,
  targetKeyRequired,
  authenticationFailedOrWrongKey,
  targetSealFailed,
  targetVerificationFailed,
};
class PreparedLegacyInboxBytes;
struct LegacyInboxPreparationResult;
LegacyInboxPreparationResult PrepareExplicitLegacyInboxV2Bytes(
    std::string_view original_record,
    const std::array<uint8_t, 32>* explicitly_supplied_legacy_key,
    const std::array<uint8_t, 32>* independently_supplied_v2_key);

// Authenticated in-memory replacement bytes only. Not an authority, journal,
// SQLite write, row selector or permission to alter any original record.
class PreparedLegacyInboxBytes final {
 public:
  const std::string& original_ciphertext() const { return original_; }
  const std::string& replacement_ciphertext() const { return replacement_; }
  const std::array<uint8_t, 32>& original_sha256() const { return original_sha_; }
  const std::array<uint8_t, 32>& replacement_sha256() const { return replacement_sha_; }
 private:
  friend LegacyInboxPreparationResult PrepareExplicitLegacyInboxV2Bytes(
      std::string_view, const std::array<uint8_t, 32>*,
      const std::array<uint8_t, 32>*);
  PreparedLegacyInboxBytes(std::string original, std::string replacement);
  std::string original_;
  std::string replacement_;
  std::array<uint8_t, 32> original_sha_;
  std::array<uint8_t, 32> replacement_sha_;
};
struct LegacyInboxPreparationResult {
  LegacyInboxPreparationStatus status;
  std::optional<PreparedLegacyInboxBytes> bytes;
};
}  // namespace aux
