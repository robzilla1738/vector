// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_SOURCE_CRYPTO_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_SOURCE_CRYPTO_H_
#include <array>
#include <cstdint>
#include <optional>
#include <string>
#include <string_view>
#include <vector>
namespace aux_import {
// Original pre-worker raw password, kept native and moved exactly once across
// the provider reply/clone worker. No std::string SSO residue or copyable DTO.
class CapturedSourcePassword {
 public:
  explicit CapturedSourcePassword(std::vector<uint8_t> bytes);
  CapturedSourcePassword(CapturedSourcePassword&& other) noexcept;
  CapturedSourcePassword& operator=(CapturedSourcePassword&& other) noexcept;
  ~CapturedSourcePassword();
  CapturedSourcePassword(const CapturedSourcePassword&) = delete;
  CapturedSourcePassword& operator=(const CapturedSourcePassword&) = delete;
  std::string_view view() const;
 private:
  std::vector<uint8_t> bytes_;
};
// Worker-only original426abd0 provider. The original successful-empty result
// is present; absence is denied/unavailable/unsupported. No additional lookup
// is performed by the clone worker. Does not use installation/destination keys.
std::optional<CapturedSourcePassword> CaptureSourcePassword(
    std::string_view source);

struct SourceKey : std::array<unsigned char, 16> {
  ~SourceKey();
};
// Explicit source lookup; never consults the destination OSCrypt provider or
// its mock-keychain switch. Worker only; macOS may present its permission UI.
std::optional<SourceKey> AuthorizeSourceKey(std::string_view source,
                                            std::string& error);
bool SupportsSourceKey(std::string_view source);
bool InstalledSourceApplication(std::string_view source);
SourceKey DeriveSourceKey(std::string_view password);
std::optional<std::string> DecryptSourceValue(std::string_view ciphertext,
                                              const SourceKey& key);
void ClearSourceKey(SourceKey& key);
}  // namespace aux_import
#endif
