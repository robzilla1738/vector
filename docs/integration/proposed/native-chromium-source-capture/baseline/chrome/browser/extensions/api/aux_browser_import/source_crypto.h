// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_SOURCE_CRYPTO_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_SOURCE_CRYPTO_H_
#include <array>
#include <optional>
#include <string>
#include <string_view>
namespace aux_import {
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
