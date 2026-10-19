// Copyright 2026 Aux Authors. All rights reserved.
// Disposable registry fixtures only. No daemon, Vault secret or owner profile.
#include "chrome/browser/aux/profile_state.h"
#include "base/check.h"
#include "base/files/file_util.h"
#include "base/files/scoped_temp_dir.h"
#include "base/json/json_writer.h"
int main() {
  base::ScopedTempDir temp;
  CHECK(temp.CreateUniqueTempDir());
  const auto home = temp.GetPath();
  const auto profile = home.AppendASCII("fixture-profile");
  const auto id = aux::ProfileIdForPath(profile);
  const auto registry_path = home.AppendASCII("accounts.json");
  auto write = [&](const std::string& mode, const std::string& provider) {
    base::DictValue account;
    account.Set("id", 7);
    account.Set("mode", mode);
    account.Set("provider", provider);
    base::ListValue accounts;
    accounts.Append(std::move(account));
    base::DictValue binding;
    binding.Set("profileId", id);
    binding.Set("profilePath", profile.value());
    binding.Set("accountId", 7);
    base::DictValue bindings;
    bindings.Set(id, std::move(binding));
    base::DictValue registry;
    registry.Set("version", 1);
    registry.Set("accounts", std::move(accounts));
    registry.Set("profileAccountBindings", std::move(bindings));
    CHECK(base::WriteFile(registry_path, base::WriteJson(registry).value()));
    CHECK(base::SetPosixFilePermissions(registry_path, 0600));
  };
  CHECK(!aux::ReadProfileSecurity(home, profile).bound);
  write("local", "anonymous");
  const auto local = aux::ReadProfileSecurity(home, profile);
  CHECK(local.bound && local.account_id == 7 && local.local_anonymous);
  CHECK(local.onboarding_complete && local.locked && !local.configured);
  CHECK(!local.allows_browsing());  // Actual authenticated Vault status required.
  write("cloud", "email");
  const auto cloud = aux::ReadProfileSecurity(home, profile);
  CHECK(cloud.bound && !cloud.onboarding_complete && !cloud.allows_browsing());
  CHECK(base::SetPosixFilePermissions(registry_path, 0644));
  CHECK(!aux::ReadProfileSecurity(home, profile).bound);
  CHECK(base::SetPosixFilePermissions(registry_path, 0600));
  CHECK(!aux::ReadProfileSecurity(home, home.AppendASCII("other-profile")).bound);
  return 0;
}
