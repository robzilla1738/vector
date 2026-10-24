#pragma once
#include <bsm/audit.h>
#include <cstdint>
#include <dlfcn.h>
namespace aux::browser_descendants {
// Factual native-only query; the primary image retains the sole ES registry.
// Only a real kernel trailer supplies this audit token. Managed includes live
// retained/reparented identities. Absence remains unknown and grants nothing.
enum class CliClientMembership { managed, unknown };
inline CliClientMembership InspectActualCliClient(audit_token_t kernel_peer) noexcept {
  using Query = uint32_t (*)(audit_token_t) noexcept;
  // Match the existing custody client: never search a plugin, Framework-wide
  // replacement symbol, caller callback, dylib path or environment locator.
  static const auto query = reinterpret_cast<Query>(
      dlsym(RTLD_MAIN_ONLY, "AuxGetActualCliClientMembershipV1"));
  return query && query(kernel_peer) == 1 ? CliClientMembership::managed
                                        : CliClientMembership::unknown;
}
}
