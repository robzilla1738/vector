// Copyright 2026 Aux Authors. All rights reserved.
// Disposable registry fixtures only; never opens an owner profile or daemon.
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
  base::DictValue registry;
  registry.Set("version", 1);
  registry.Set("accounts", base::ListValue());
  registry.Set("profileAccountBindings", base::DictValue());
  auto read = [&]() {
    const auto text = base::WriteJson(registry).value();
    CHECK(base::WriteFile(registry_path, text));
    CHECK(base::SetPosixFilePermissions(registry_path, 0600));
    auto state = aux::ReadProfileSecurity(home, profile);
    std::string after;
    CHECK(base::ReadFileToString(registry_path, &after));
    CHECK(after == text);  // Classification never converts or deletes bindings.
    return state;
  };
  CHECK(!aux::ReadProfileSecurity(home, profile).local_only.has_value());
  const auto fresh = read();
  CHECK(!fresh.bound && fresh.local_only == true && fresh.binding_error.empty());
  base::DictValue account;
  account.Set("id", 0);
  account.Set("mode", "local");
  account.Set("provider", "anonymous");
  registry.FindList("accounts")->Append(std::move(account));
  base::DictValue binding;
  binding.Set("profileId", id);
  binding.Set("profilePath", profile.value());
  binding.Set("accountId", 0);
  registry.FindDict("profileAccountBindings")->Set(id, std::move(binding));
  const auto local = read();
  CHECK(local.bound && local.account_id == 0 && local.local_only == true);
  CHECK(local.local_anonymous && local.onboarding_complete);
  CHECK(local.locked && !local.configured && !local.allows_browsing());
  auto& row = registry.FindList("accounts")->front().GetDict();
  row.Set("mode", "cloud");
  row.Set("provider", "email");
  row.Set("userId", "fixture-cloud-user");
  const auto cloud = read();
  CHECK(cloud.bound && cloud.account_id == 0 && cloud.local_only == false);
  CHECK(cloud.bound_user_id == "fixture-cloud-user" && !cloud.local_anonymous);
  CHECK(!cloud.onboarding_complete && !cloud.allows_browsing());
  row.Remove("userId");
  const auto incomplete_cloud = read();
  CHECK(!incomplete_cloud.bound && !incomplete_cloud.local_only.has_value());
  CHECK(!incomplete_cloud.binding_error.empty());
  row.Set("mode", "local");
  base::DictValue bootstrap;
  bootstrap.Set("hasEverBoundCloudUser", true);
  base::DictValue bootstraps;
  bootstraps.Set("0", std::move(bootstrap));
  registry.Set("localBootstraps", std::move(bootstraps));
  CHECK(!read().local_only.has_value());
  registry.Remove("localBootstraps");
  base::DictValue sessions;
  sessions.Set("0", base::DictValue());
  registry.Set("sessions", std::move(sessions));
  CHECK(!read().local_only.has_value());
  registry.Remove("sessions");
  row.Set("mode", "unknown");
  CHECK(!read().local_only.has_value());
  row.Set("mode", "local");
  auto* bound = registry.FindDict("profileAccountBindings")->FindDict(id);
  bound->Set("profilePath", home.AppendASCII("wrong-profile").value());
  CHECK(!read().local_only.has_value());
  bound->Set("profilePath", profile.value());
  bound->Set("accountId", 8);
  CHECK(!read().local_only.has_value());
  registry.Set("profileAccountBindings", base::DictValue());
  base::DictValue legacy_binding;
  legacy_binding.Set("profileId", "unrelated-fixture-profile");
  legacy_binding.Set("profilePath", home.AppendASCII("unrelated-profile").value());
  legacy_binding.Set("userId", "fixture-cloud-user");
  base::DictValue legacy;
  legacy.Set("unrelated-fixture-profile", std::move(legacy_binding));
  registry.Set("profileBindings", std::move(legacy));
  CHECK(read().local_only == true);  // Unrelated legacy binding stays byte-exact.
  auto* legacy_row = registry.FindDict("profileBindings")
                         ->FindDict("unrelated-fixture-profile");
  legacy_row->Set("profilePath", profile.value());
  CHECK(!read().local_only.has_value());  // Same path, even under an old ID.
  legacy_row->Set("profilePath", home.AppendASCII("unrelated-profile").value());
  registry.FindDict("profileBindings")->Set(id, legacy_row->Clone());
  CHECK(!read().local_only.has_value());  // Same ID, even with a wrong path.
  registry.Remove("profileBindings");
  registry.Set("profileAccountBindings", "malformed");
  CHECK(!read().local_only.has_value());
  registry.Set("profileAccountBindings", base::DictValue());
  registry.Remove("accounts");
  CHECK(!read().local_only.has_value());
  registry.Set("accounts", base::ListValue());
  read();
  CHECK(base::SetPosixFilePermissions(registry_path, 0644));
  CHECK(!aux::ReadProfileSecurity(home, profile).local_only.has_value());
  return 0;
}
