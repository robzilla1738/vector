#pragma once
#include <span>
#include <string>
namespace aux::cli {
enum class OpenParseStatus { accepted, help, unsupported, invalid };
struct OpenArguments { OpenParseStatus status=OpenParseStatus::invalid; std::string url, profile; };
// Data parsing only. A profile string never creates or loads a native Profile.
OpenArguments ParseNativeOpenArguments(std::span<const std::string>);
}
