#pragma once
#include "AuxCliSealedImages.h"
#include "AuxCliWire.h"
#include <array>
#include <memory>
namespace aux::cli {
// Native terminal frontend. Performs a credential-free audited Hello before
// sending argv/environment or any actual stdio/directory capabilities.
int ForwardTerminalInvocation(int argc,char* argv[]);
class Invocation final {
 public:
  ~Invocation();
  Invocation(const Invocation&)=delete;Invocation& operator=(const Invocation&)=delete;
  bool Current()const;
  const Arguments& arguments()const;
  int directory()const;
  int input()const;int output()const;int error()const;
  // Returns only an authenticated request signal, never child completion.
  int PollSignal(uint32_t timeout_ms);
 private:
  struct State;explicit Invocation(std::unique_ptr<State>);
  std::unique_ptr<State> state_;
  friend class Ingress;
  friend class BrowserInvocation;
  friend class ManualProfileApprovalRequest;
  friend class ApprovedCliInvocation;
  audit_token_t KernelPeerForNativeAdmission() const;
  bool CompleteAfterObservedExit(int exit_code);
};
class Ingress final {
 public:
  static std::unique_ptr<Ingress> CreateForActualBrowser();
  ~Ingress();
  // Call on an owned native service thread. Result retains the peer, private
  // channel, cwd/stdin/out/err. It grants no installation/profile authority.
  std::unique_ptr<Invocation> ReceiveOne(uint32_t timeout_ms);
  void CloseAdmission();
  bool AdmissionClosed() const;
  static size_t UnresolvedSendRights();
 private:
  struct State;explicit Ingress(std::shared_ptr<State>);
  std::shared_ptr<State> state_;
};
}
