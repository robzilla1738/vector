#pragma once
#include <cerrno>
#include <sys/types.h>
#include <sys/wait.h>
namespace aux::peer {
enum class OwnedChildReap { pending, terminal, unknown };
// Called only after real waitid(WEXITED|WNOWAIT) observed this exact child's exit.
// EINTR consumes no result. Every terminal claim needs the real waited child
// and a terminal status, never a plausible zero-initialized status on failure.
constexpr OwnedChildReap ClassifyOwnedChildReap(pid_t expected, pid_t waited,
                                               int status, int error) {
  if (waited == -1 && error == EINTR) return OwnedChildReap::pending;
  if (expected > 0 && waited == expected && (WIFEXITED(status) || WIFSIGNALED(status)))
    return OwnedChildReap::terminal;
  return OwnedChildReap::unknown;
}
}  // namespace aux::peer
