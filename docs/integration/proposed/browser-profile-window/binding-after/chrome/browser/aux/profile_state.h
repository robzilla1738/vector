// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_PROFILE_STATE_H_
#define CHROME_BROWSER_AUX_PROFILE_STATE_H_
#include <optional>
#include <string>

#include "base/files/file_path.h"
namespace aux {
// Pure identity of ProfileManager's registered absolute profile path.
std::string ProfileIdForPath(const base::FilePath& path);
struct ProfileSecurityState {
  std::optional<int> account_id;
  std::optional<int> profile_index;
  bool bound = false;
  // Unset means registry identity could not be classified safely.
  std::optional<bool> local_only;
  std::string binding_error;
  bool local_anonymous = false;
  std::string bound_user_id;
  // Actual app-account:N current PWM UUID from authenticated accounts.list.
  std::string pwm_account_id;
  bool requires_password_verification = false;
  bool configured = false;
  bool locked = true;
  bool onboarding_complete = false;
  std::string error;
  bool matches_profile_index(int requested) const {
    return bound && requested >= 0 && profile_index &&
           *profile_index == requested;
  }
  bool allows_browsing() const {
    return bound && local_only.has_value() && binding_error.empty() &&
           configured && !locked && onboarding_complete;
  }
};
// Blocking metadata only; call on a MayBlock task. Vault stays locked until
// authenticated FetchProfileSecurity verifies actual daemon accounts.list authStatus.
ProfileSecurityState ReadProfileSecurity(const base::FilePath& home,
                                         const base::FilePath& profile_path);
}  // namespace aux
#endif
