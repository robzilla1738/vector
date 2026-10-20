// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_BROWSER_PLATFORM_H_
#define CHROME_BROWSER_AUX_BROWSER_PLATFORM_H_
#include <memory>
#include <optional>
#include <vector>

#include "base/no_destructor.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/devtools/aux_cdp_authority.h"
namespace aux {
// Browser UI-sequence singleton. Startup pumps tasks before profiles/windows
// exist; shutdown pumps tasks while the system network context still exists.
class BrowserPlatform {
 public:
  static BrowserPlatform& Get();
  bool Start(scoped_refptr<network::SharedURLLoaderFactory> factory);
  void Shutdown();
  bool RegisterProfileComponents(
      base::RepeatingCallback<std::string(base::DictValue,
                                          const base::FilePath&)> installer);
  CdpRequestFilter CreateBrowserCdpFilter(uint16_t port) const;
  const std::string& authorization() const;

 private:
  friend class base::NoDestructor<BrowserPlatform>;
  BrowserPlatform();
  ~BrowserPlatform();
  std::unique_ptr<DaemonSupervisor> supervisor_;
  std::vector<ComponentManifest> components_;
  std::optional<crypto::keypair::PublicKey> public_key_;
};
}  // namespace aux
#endif
