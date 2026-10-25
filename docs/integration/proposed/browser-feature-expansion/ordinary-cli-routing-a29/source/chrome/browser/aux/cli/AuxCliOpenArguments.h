#pragma once
#include <span>
#include <optional>
#include <string_view>
#include <string>
namespace aux::cli {
enum class OpenParseStatus { accepted, help, unsupported, invalid };
struct OpenArguments { OpenParseStatus status=OpenParseStatus::invalid; std::string url, profile; };
// Data parsing only. A profile string never creates or loads a native Profile.
OpenArguments ParseNativeOpenArguments(std::span<const std::string>);
// Bounded data-only ordinary URL envelope. The receiving native OS receipt,
// actual Profile and normal routing owner provide authority, never these bytes.
std::optional<std::string> EncodeNativeOpenEnvelope(const OpenArguments&);
OpenArguments ParseNativeOpenEnvelope(std::string_view);
}
