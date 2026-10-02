// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_STARTUP_RUNTIME_HELLO_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_STARTUP_RUNTIME_HELLO_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <optional>
#include "base/functional/callback.h"
#include "base/functional/callback_helpers.h"
#include "base/memory/weak_ptr.h"
#include "base/time/time.h"
#include "chrome/browser/ui/aux/native_runtime_peer_identity.h"
class Profile;
class AuxRuntimeHost;
namespace aux {
struct NativeStartupRuntimeHello {
  base::TimeTicks acknowledged;
  uint64_t connection_generation;
  NativeRuntimePeerIdentity peer;
  base::WeakPtr<AuxRuntimeHost> host;
};
// Profile-owned private observation. Never creates a runtime or invokes work.
// Only the actual authenticated Worker publisher may populate the receipt.
class NativeStartupRuntimeHelloStore {
 public:
  using Observer = base::RepeatingCallback<void(std::optional<NativeStartupRuntimeHello>)>;
  static base::ScopedClosureRunner Observe(Profile* profile, Observer observer);
  static std::optional<NativeStartupRuntimeHello> Read(Profile* profile);
  static void Confirm(Profile* profile, const NativeStartupRuntimeHello& expected, base::TimeTicks deadline,
                      base::OnceCallback<void(std::optional<base::TimeTicks>)> reply);
 private:
  friend class ::AuxRuntimeHost;
  static void Published(Profile* profile, NativeStartupRuntimeHello actual);
  static void Retired(Profile* profile, base::WeakPtr<AuxRuntimeHost> host,
                      uint64_t connection_generation);
};
}  // namespace aux
#endif
#endif
