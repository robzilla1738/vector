#include "AuxCliOpenArguments.h"
namespace aux::cli {
OpenArguments ParseNativeOpenArguments(std::span<const std::string> args) {
  if (args.empty() || args.front() != "open") return {OpenParseStatus::unsupported,{},{}};
  if (args.size()==2 && args[1]=="--help") return {OpenParseStatus::help,{},{}};
  OpenArguments parsed; bool literal=false, profile_seen=false;
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
    if ((!literal && item.front()=='-') || !parsed.url.empty() || item.size()>8192) return {};
    parsed.url=item;
  }
  if (parsed.url.empty()) return {};
  parsed.status=OpenParseStatus::accepted; return parsed;
}
}
