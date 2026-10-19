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
    result.binding_error = "Local account registry is not ready";
    result.error = result.binding_error;
    return result;
  }
  const auto* accounts = registry->FindList("accounts");
  if (!accounts) {
    result.binding_error = "Local account registry has no account inventory";
    result.error = result.binding_error;
    return result;
  }
  const auto* bindings = registry->FindDict("profileAccountBindings");
  const auto id = ProfileIdForPath(path);
  const auto* binding = bindings ? bindings->FindDict(id) : nullptr;
  if (!binding) {
    // Match the actual resolver's mutation scope: only this ID or exact path.
    // Another profile's cloud mapping must not prevent fresh local creation.
    const auto* legacy = registry->FindDict("profileBindings");
    bool matching_path = false;
    for (const auto* rows : {bindings, legacy}) {
      if (!rows) continue;
      for (const auto [key, value] : *rows) {
        const auto* saved_path = value.is_dict()
            ? value.GetDict().FindString("profilePath") : nullptr;
        if (key == id || (saved_path && *saved_path == path.value())) {
          matching_path = true;
        }
      }
    }
    if ((registry->contains("profileAccountBindings") && !bindings) ||
        (registry->contains("profileBindings") && !legacy) || matching_path) {
      result.binding_error = "This profile requires an explicit account binding migration";
      result.error = result.binding_error;
      return result;
    }
    result.local_only = true;
    return result;
  }
  const auto* bound_path = binding->FindString("profilePath");
  const auto* bound_id = binding->FindString("profileId");
  const auto account_id = binding->FindInt("accountId");
  if (!bound_id || *bound_id != id || !bound_path ||
      *bound_path != path.value() || !account_id || *account_id < 0) {
    result.binding_error = "Local profile account binding does not match this profile";
    result.error = result.binding_error;
    return result;
  }
  for (const auto& value : *accounts) {
    if (!value.is_dict() || value.GetDict().FindInt("id") != account_id) continue;
    const auto& account = value.GetDict();
    const auto* mode = account.FindString("mode");
    const auto* provider = account.FindString("provider");
    const auto* user = account.FindString("userId");
    const bool has_user = user && !user->empty();
    const auto account_key = base::NumberToString(*account_id);
    const auto* sessions = registry->FindDict("sessions");
    const auto* bootstraps = registry->FindDict("localBootstraps");
    const auto* bootstrap = bootstraps ? bootstraps->FindDict(account_key) : nullptr;
    const bool cloud_history = bootstrap &&
        bootstrap->FindBool("hasEverBoundCloudUser").value_or(false);
    const auto* session = sessions ? sessions->Find(account_key) : nullptr;
    if ((registry->contains("sessions") && !sessions) ||
        (registry->contains("localBootstraps") && !bootstraps) ||
        !mode || (*mode != "local" && *mode != "cloud") ||
        (*mode == "cloud" && !has_user) ||
        (*mode == "local" &&
         (has_user || cloud_history || (session && !session->is_none())))) {
      result.binding_error = "Profile account identity requires explicit repair";
      result.error = result.binding_error;
      return result;
    }
    result.account_id = *account_id;
    result.bound = true;
    result.local_only = *mode == "local";
    // This native eligibility rule does not stamp or synthesize cloud onboarding.
    result.local_anonymous = mode && *mode == "local" && provider &&
                             *provider == "anonymous";
    const auto* completed = account.FindString("onboardingCompletedAt");
    result.onboarding_complete = result.local_anonymous ||
                                 (completed && !completed->empty());
    if (mode && *mode == "cloud") {
      result.bound_user_id = *user;
    }
    result.error = "Vault status requires authenticated daemon verification";
    return result;
  }
  result.binding_error = "Bound profile account no longer exists";
  result.error = result.binding_error;
  return result;
}
}  // namespace aux
