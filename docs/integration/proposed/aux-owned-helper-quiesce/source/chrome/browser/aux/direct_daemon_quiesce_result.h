// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_DIRECT_DAEMON_QUIESCE_RESULT_H_
#define CHROME_BROWSER_AUX_DIRECT_DAEMON_QUIESCE_RESULT_H_
#include <optional>
namespace aux {
// This result never attests to extension, descendant, CLI or database writers.
struct DirectDaemonQuiesceResult {
  enum class Scope { kOwnedDirectDaemonOnly };
  enum class Outcome { kNoOwnedProcess, kExited, kDrainFailed };
  Scope scope = Scope::kOwnedDirectDaemonOnly;
  Outcome outcome = Outcome::kDrainFailed;
  std::optional<int> exit_code;
};

}  // namespace aux
#endif
