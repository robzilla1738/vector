// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/aux/profile_state.h"

#include <fcntl.h>
#include <sys/stat.h>
#include <unistd.h>

#include "base/containers/span.h"
#include "base/files/scoped_file.h"
#include "base/json/json_reader.h"
#include "base/strings/string_number_conversions.h"
#include "crypto/hash.h"
namespace aux {
namespace {
std::optional<base::DictValue> ReadMetadata(const base::FilePath& path,
                                            size_t limit) {
  base::ScopedFD fd(
      open(path.value().c_str(), O_RDONLY | O_NOFOLLOW | O_CLOEXEC));
  struct stat info;
  if (!fd.is_valid() || fstat(fd.get(), &info) || !S_ISREG(info.st_mode) ||
      info.st_uid != geteuid() || (info.st_mode & 0077) || info.st_size < 0 ||
      static_cast<uint64_t>(info.st_size) > limit) {
    return std::nullopt;
  }
  std::string text(static_cast<size_t>(info.st_size), '\0');
  size_t offset = 0;
  while (offset < text.size()) {
    const auto bytes =
        read(fd.get(), base::as_writable_byte_span(text).subspan(offset).data(),
             text.size() - offset);
    if (bytes <= 0) {
      return std::nullopt;
    }
    offset += bytes;
  }
  return base::JSONReader::ReadDict(text, base::JSON_PARSE_RFC);
}
}  // namespace
std::string ProfileIdForPath(const base::FilePath& path) {
  return "aux-profile:" + base::HexEncode(crypto::hash::Sha256(
                              path.StripTrailingSeparators().value()));
}
ProfileSecurityState ReadProfileSecurity(const base::FilePath& home,
                                         const base::FilePath& path) {
  ProfileSecurityState result;
  auto registry =
      ReadMetadata(home.AppendASCII("accounts.json"), 4 * 1024 * 1024);
  if (!registry || registry->FindInt("version") != 1) {
    result.error = "Local account registry is not ready";
    return result;
  }
  const auto* bindings = registry->FindDict("profileAccountBindings");
  const auto id = ProfileIdForPath(path);
  const auto* binding = bindings ? bindings->FindDict(id) : nullptr;
  if (!binding) return result;
  const auto* bound_path = binding->FindString("profilePath");
  const auto* bound_id = binding->FindString("profileId");
  const auto account_id = binding->FindInt("accountId");
  if (!bound_id || *bound_id != id || !bound_path ||
      *bound_path != path.value() || !account_id || *account_id < 0) {
    result.error = "Local profile account binding does not match this profile";
    return result;
  }
  const auto* accounts = registry->FindList("accounts");
  if (!accounts) return result;
  for (const auto& value : *accounts) {
    if (!value.is_dict() || value.GetDict().FindInt("id") != account_id) continue;
    const auto& account = value.GetDict();
    result.account_id = *account_id;
    result.bound = true;
    const auto* mode = account.FindString("mode");
    const auto* provider = account.FindString("provider");
    // This native eligibility rule does not stamp or synthesize cloud onboarding.
    result.local_anonymous = mode && *mode == "local" && provider &&
                             *provider == "anonymous";
    const auto* completed = account.FindString("onboardingCompletedAt");
    result.onboarding_complete = result.local_anonymous ||
                                 (completed && !completed->empty());
    if (mode && *mode == "cloud") {
      if (const auto* user = account.FindString("userId")) result.bound_user_id = *user;
    }
    result.error = "Vault status requires authenticated daemon verification";
    return result;
  }
  return result;
}
}  // namespace aux
