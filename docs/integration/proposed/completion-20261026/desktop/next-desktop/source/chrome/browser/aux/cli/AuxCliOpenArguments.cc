#include "AuxCliOpenArguments.h"
#include <utility>
namespace aux::cli {
OpenArguments ParseNativeOpenArguments(std::span<const std::string> args) {
  if (args.empty() || args.front() != "open") return {OpenParseStatus::unsupported,{},{},{}};
  if (args.size()==2 && args[1]=="--help") return {OpenParseStatus::help,{},{},{}};
  OpenArguments parsed; bool literal=false, profile_seen=false, space_seen=false;
  for (size_t i=1;i<args.size();++i) {
    const auto& item=args[i];
    if (item.empty() || item.find('\0')!=std::string::npos) return {};
    if (!literal && item=="--") { literal=true; continue; }
    if (!literal && (item=="--profile" || item.starts_with("--profile="))) {
      if (profile_seen) return {};
      profile_seen=true;
      if (item=="--profile") { if (++i==args.size()) return {}; parsed.profile=args[i]; }
      else parsed.profile=item.substr(10);
      if (parsed.profile.empty() || parsed.profile.size()>256 ||
          parsed.profile.find_first_of("/\\\0",0,3)!=std::string::npos) return {};
      continue;
    }
    if (!literal && (item=="--space" || item.starts_with("--space="))) {
      if (space_seen) return {};
      space_seen=true;
      if (item=="--space") { if (++i==args.size()) return {}; parsed.space=args[i]; }
      else parsed.space=item.substr(8);
      if (parsed.space.empty() || parsed.space.size()>256) return {};
      for (const unsigned char c : parsed.space) if (c < 0x20 || c == 0x7f) return {};
      continue;
    }
    if ((!literal && item.front()=='-') || !parsed.url.empty() || item.size()>8192) return {};
    parsed.url=item;
  }
  if (parsed.url.empty() || (!parsed.space.empty() && parsed.profile.empty())) return {};
  parsed.status=OpenParseStatus::accepted; return parsed;
}

namespace {
bool ProfileText(std::string_view text) {
  if (text.size() > 256) return false;
  for (const unsigned char c : text)
    if (c < 0x20 || c == 0x7f || c == '/' || c == '\\') return false;
  return true;
}
bool SpaceText(std::string_view text) {
  if (text.size() > 256) return false;
  for (const unsigned char c : text) if (c < 0x20 || c == 0x7f) return false;
  return true;
}
bool HttpText(std::string_view text) {
  if (text.empty() || text.size() > 8192) return false;
  const auto colon = text.find("://");
  if (colon == std::string_view::npos) return false;
  std::string scheme(text.substr(0, colon));
  for (char& c : scheme) if (c >= 'A' && c <= 'Z') c += 'a' - 'A';
  if (scheme != "http" && scheme != "https") return false;
  const auto rest = text.substr(colon + 3);
  const auto authority = rest.substr(0, rest.find_first_of("/?#"));
  if (authority.empty() || authority.find('@') != std::string_view::npos) return false;
  for (const unsigned char c : text) if (c <= 0x20 || c == 0x7f) return false;
  return true;
}
std::string EncodeField(std::string_view input) {
  constexpr std::string_view hex = "0123456789ABCDEF";
  std::string output;
  for (const unsigned char c : input) {
    if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') ||
        (c >= '0' && c <= '9') || c == '-' || c == '_' || c == '.' || c == '~') {
      output.push_back(static_cast<char>(c));
    } else {
      output.push_back('%'); output.push_back(hex.at(c >> 4));
      output.push_back(hex.at(c & 15));
    }
  }
  return output;
}
int Hex(char c) {
  if (c >= '0' && c <= '9') return c - '0';
  if (c >= 'A' && c <= 'F') return c - 'A' + 10;
  if (c >= 'a' && c <= 'f') return c - 'a' + 10;
  return -1;
}
std::optional<std::string> DecodeField(std::string_view input, size_t limit) {
  std::string output;
  while (!input.empty()) {
    char c = input.front(); input.remove_prefix(1);
    if (c == '+') return std::nullopt;  // Literal plus must be percent-encoded.
    if (c == '%') {
      if (input.size() < 2) return std::nullopt;
      const int high = Hex(input.front()); input.remove_prefix(1);
      const int low = Hex(input.front()); input.remove_prefix(1);
      if (high < 0 || low < 0) return std::nullopt;
      c = static_cast<char>(high * 16 + low);
    }
    if (!c || output.size() == limit) return std::nullopt;
    output.push_back(c);
  }
  return output;
}
}  // namespace
std::optional<std::string> EncodeNativeOpenEnvelope(const OpenArguments& args) {
  if (args.status != OpenParseStatus::accepted || !HttpText(args.url) ||
      !ProfileText(args.profile) || !SpaceText(args.space) ||
      (!args.space.empty() && args.profile.empty())) return std::nullopt;
  std::string result = "aux://open?url=" + EncodeField(args.url);
  if (!args.profile.empty()) result += "&profile=" + EncodeField(args.profile);
  if (!args.space.empty()) result += "&space=" + EncodeField(args.space);
  return result.size() <= 32768 ? std::make_optional(std::move(result)) : std::nullopt;
}
OpenArguments ParseNativeOpenEnvelope(std::string_view envelope) {
  if (envelope.empty() || envelope.size() > 32768 ||
      envelope.find('#') != std::string_view::npos) return {};
  if (envelope.starts_with("aux://open?")) envelope.remove_prefix(11);
  else if (envelope.starts_with("aux://open/?")) envelope.remove_prefix(12);
  else return {};
  OpenArguments result;
  bool url_seen = false, profile_seen = false, space_seen = false;
  for (;;) {
    const auto separator = envelope.find('&');
    const auto field = envelope.substr(0, separator);
    const auto equal = field.find('=');
    if (equal == std::string_view::npos) return {};
    const auto key = field.substr(0, equal);
    if (key == "url" && !url_seen) {
      auto value = DecodeField(field.substr(equal + 1), 8192);
      if (!value || !HttpText(*value)) return {};
      result.url = std::move(*value); url_seen = true;
    } else if (key == "profile" && !profile_seen) {
      auto value = DecodeField(field.substr(equal + 1), 256);
      if (!value || value->empty() || !ProfileText(*value)) return {};
      result.profile = std::move(*value); profile_seen = true;
    } else if (key == "space" && !space_seen) {
      auto value = DecodeField(field.substr(equal + 1), 256);
      if (!value || value->empty() || !SpaceText(*value)) return {};
      result.space = std::move(*value); space_seen = true;
    } else return {};
    if (separator == std::string_view::npos) break;
    envelope.remove_prefix(separator + 1);
    if (envelope.empty()) return {};
  }
  if (!url_seen || (space_seen && !profile_seen)) return {};
  result.status = OpenParseStatus::accepted;
  return result;
}
}
