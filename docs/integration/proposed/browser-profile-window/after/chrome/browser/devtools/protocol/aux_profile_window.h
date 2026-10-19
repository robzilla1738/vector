// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_DEVTOOLS_PROTOCOL_AUX_PROFILE_WINDOW_H_
#define CHROME_BROWSER_DEVTOOLS_PROTOCOL_AUX_PROFILE_WINDOW_H_
#include <optional>
#include <string>
#include "base/functional/callback.h"
namespace aux {
struct ProfileWindowOutcome {
  int error_code = 0;
  std::string message;
};
// UI sequence. Empty success only after actual registered-profile/window work.
void EnsureProfileWindow(int index,
                         std::optional<std::string> url,
                         std::optional<bool> focus,
                         bool authenticated,
                         base::RepeatingCallback<bool()> caller_alive,
                         base::OnceCallback<void(ProfileWindowOutcome)> done);
}  // namespace aux
#endif
