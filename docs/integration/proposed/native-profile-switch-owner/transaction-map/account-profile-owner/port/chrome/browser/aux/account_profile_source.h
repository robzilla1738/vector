// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_ACCOUNT_PROFILE_SOURCE_H_
#define CHROME_BROWSER_AUX_ACCOUNT_PROFILE_SOURCE_H_
#include <optional>
#include <string>
#include <vector>
#include "base/files/file_path.h"
#include "base/values.h"
namespace aux {
struct AccountProfileClaim {
  base::FilePath profile_path;
  std::string user_id;
  std::optional<int> account_id;
};
struct AccountProfileSourceInput {
  base::FilePath profile_path;
  std::string profile_id;
  std::string stored_user_id;
  std::optional<int> stored_account_id;
  bool allow_binding = false;
  bool is_last_used_loaded_profile = false;
  std::vector<AccountProfileClaim> loaded_claims;
};
struct AccountProfileRecord {
  int id = -1;
  std::string user_id, name, email, picture_url;
  bool has_persisted_session = false;
  bool auth_paused = false;
};
struct AccountProfileProjection {
  bool global_onboarding_complete = false;
  bool bootstrap_complete = false;
  bool clear_binding = true;
  bool auto_bound = false;
  std::optional<AccountProfileRecord> account;
  // Only actual daemon-bound public metadata. Native owner adds the real index
  // and actual authenticated loopback request; this object grants no authority.
  std::optional<base::DictValue> binding_to_persist;
};
// Pure source selection. No token values, file contents or mutable registry
// escape in the result. An unavailable/malformed file stays unavailable.
std::optional<AccountProfileProjection> ProjectAccountProfileSource(
    const base::Value& state, const AccountProfileSourceInput& input);
}  // namespace aux
#endif
