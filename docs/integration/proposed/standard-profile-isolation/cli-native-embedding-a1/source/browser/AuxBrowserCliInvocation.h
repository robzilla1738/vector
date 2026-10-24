#pragma once
#include "chrome/browser/aux/cli/AuxCliIngress.h"
#include "chrome/browser/aux/AuxOwnedNativePeerChild.h"
#include <memory>
#include <optional>
namespace aux::cli {
// Only an authenticated native Invocation can reach this producer. User argv,
// environment and fileports never choose a target, signed image or state root.
class BrowserInvocation final {
 public:
  static std::unique_ptr<BrowserInvocation> PrepareAndLaunch(std::unique_ptr<Invocation>);
  ~BrowserInvocation();
  // One bounded native iteration. A value means the actual owned child was
  // observed+reaped. It is not a whole-browser/descendant drain certificate.
  std::optional<int> Advance();
 private:
  BrowserInvocation(std::unique_ptr<Invocation>,std::unique_ptr<aux::peer::OwnedNativePeerChild>);
  std::unique_ptr<Invocation> invocation_;
  std::unique_ptr<aux::peer::OwnedNativePeerChild> child_;
  bool completed_=false;
  bool client_retired_=false;
};
}
