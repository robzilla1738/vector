#pragma once
#include <array>
#include <optional>
#include <string>
#include <string_view>
#include <cstdint>
namespace aux {
// A versioned codec, not key provenance/admission. Legacy blobs are never
// decrypted with a new derived key or rewritten by these functions.
enum class InboxEnvelope { auxV2, legacyV1, unknown };
InboxEnvelope ClassifyInboxEnvelope(std::string_view record);
std::optional<std::string> SealInboxV2(std::string_view plaintext,
    const std::array<uint8_t,32>& key);
std::optional<std::string> OpenInboxV2(std::string_view record,
    const std::array<uint8_t,32>& key);
}
