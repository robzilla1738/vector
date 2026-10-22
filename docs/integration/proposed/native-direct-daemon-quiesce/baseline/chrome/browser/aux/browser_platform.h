// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_BROWSER_PLATFORM_H_
#define CHROME_BROWSER_AUX_BROWSER_PLATFORM_H_
#include <memory>
#include <optional>
#include <vector>

#include "base/no_destructor.h"
#include "base/callback_list.h"
#include "base/memory/weak_ptr.h"
#include "base/timer/timer.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/devtools/aux_cdp_authority.h"
namespace aux {
// Browser UI-sequence singleton. Components initialize before profiles; supplied
// readiness waits after profile extension services exist.
class BrowserPlatform {
 public:
  static BrowserPlatform& Get();
  bool Start(scoped_refptr<network::SharedURLLoaderFactory> factory);
  bool WaitForStartupReadiness(base::RepeatingCallback<bool()> extensions_ready);
  void Shutdown();
  bool RegisterProfileComponents(
      base::RepeatingCallback<std::string(base::DictValue,
                                          const base::FilePath&)> installer);
  CdpRequestFilter CreateBrowserCdpFilter(uint16_t port) const;
  // UI sequence; fires only after the actual installation public key loads.
  // Subscribe before trying CreateBrowserCdpFilter to cover either ordering.
  base::CallbackListSubscription ObserveBrowserCdpAuthority(
      base::RepeatingClosure callback);
  const std::string& authorization() const;
  using DaemonAuthorizationCallback = DaemonSupervisor::AuthorizationCallback;
  // UI sequence. Asynchronous actual authorization, with optional cache
  // invalidation for the supplied one-time401 retry.
  void RequestDaemonAuthorization(bool force,
                                  DaemonAuthorizationCallback callback);
  // UI sequence. Add never calls inline; caller may inspect authorization()
  // after subscribing to cover an already-authenticated supervisor.
  base::CallbackListSubscription ObserveDaemonAuthorization(
      base::RepeatingClosure callback);

 private:
  friend class base::NoDestructor<BrowserPlatform>;
  BrowserPlatform();
  ~BrowserPlatform();
  void DidChangeDaemonState(DaemonSupervisor::State state, std::string error);
  void CheckStartupReadiness();
  enum class StartupState { kNotStarted, kWaiting, kReady, kFailed };
  StartupState startup_state_ = StartupState::kNotStarted;
  base::RepeatingCallback<bool()> startup_extensions_ready_;
  std::vector<base::OnceCallback<void(bool)>> startup_waiters_;
  base::TimeTicks startup_deadline_;
  base::RepeatingTimer startup_timer_;
  bool loading_key_ = false;
  bool authorization_was_available_ = false;
  base::RepeatingClosureList authorization_observers_;
  base::RepeatingClosureList cdp_authority_observers_;
  std::unique_ptr<DaemonSupervisor> supervisor_;
  std::vector<ComponentManifest> components_;
  std::optional<crypto::keypair::PublicKey> public_key_;
  base::WeakPtrFactory<BrowserPlatform> weak_{this};
};
}  // namespace aux
#endif
